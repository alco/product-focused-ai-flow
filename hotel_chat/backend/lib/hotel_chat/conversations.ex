defmodule HotelChat.Conversations do
  @moduledoc """
  The Conversations context — the messaging write path.

  Every write here runs in a `Repo.transaction` that also captures the
  Postgres transaction id (txid) and returns it alongside the record:
  Electric stamps the same txid on the change messages it streams out
  (`headers.txids`), and the client's TanStack DB collections hold their
  optimistic state until `awaitTxId(txid)` sees the write come back through
  the sync stream. See `txid/0`.

  The `session` argument is the acting member (`%{member_id: ..., company_id:
  ...}`) — the authorization boundary for the write path: every function
  checks the acting member's membership before touching anything.
  """

  import Ecto.Query, warn: false

  alias HotelChat.Conversations.{Conversation, ConversationMember, Message, MessageReaction}
  alias HotelChat.Identity.Member
  alias HotelChat.Repo

  @message_attrs ~w(id body)
  @announcement_attrs ~w(id title body post_emoji)
  @reaction_attrs ~w(id emoji)

  @doc """
  Creates a text message in a dm/group conversation the acting member
  belongs to. Channels only take announcements (`create_announcement/3`).
  """
  def create_message(session, conversation_id, attrs) do
    case membership_kind(conversation_id, session.member_id) do
      kind when kind in ["dm", "group"] ->
        insert_message(session, conversation_id, Map.take(attrs, @message_attrs))

      _ ->
        {:error, :forbidden}
    end
  end

  @doc """
  Creates a reply to `message_id` in the parent message's conversation
  (the same-conversation rule from data-model.md, enforced by construction:
  the conversation is taken from the parent, never from the client).
  """
  def create_reply(session, message_id, attrs) do
    with {:ok, parent} <- fetch_message(message_id) do
      case membership_kind(parent.conversation_id, session.member_id) do
        kind when kind in ["dm", "group"] ->
          attrs =
            attrs
            |> Map.take(@message_attrs)
            |> Map.put("reply_to_id", parent.id)

          insert_message(session, parent.conversation_id, attrs)

        _ ->
          {:error, :forbidden}
      end
    end
  end

  @doc """
  Creates an announcement post (a `messages` row with `title`/`post_emoji`)
  in a channel the acting member belongs to.

  TODO(auth): once real auth lands, enforce the poster's server-side
  permission here (`members.can_post_company_announcements` / manager role);
  the mock session can't carry it truthfully yet, so membership is the only
  check for now — mirroring the client's temporary `?can_post_announcements`
  query-param gate.
  """
  def create_announcement(session, conversation_id, attrs) do
    case membership_kind(conversation_id, session.member_id) do
      kind when kind in ["location_channel", "company_channel"] ->
        insert_message(session, conversation_id, Map.take(attrs, @announcement_attrs),
          required: [:title, :body]
        )

      nil ->
        {:error, :forbidden}

      _not_a_channel ->
        {:error, :not_a_channel}
    end
  end

  @doc "Adds the acting member's emoji reaction to a message they can see."
  def create_reaction(session, message_id, attrs) do
    with {:ok, message} <- fetch_message(message_id) do
      if membership_kind(message.conversation_id, session.member_id) do
        changeset =
          MessageReaction.changeset(
            %MessageReaction{},
            attrs
            |> Map.take(@reaction_attrs)
            |> Map.merge(%{"message_id" => message.id, "member_id" => session.member_id})
          )

        transaction_with_txid(fn -> Repo.insert(changeset) end)
      else
        {:error, :forbidden}
      end
    end
  end

  @doc """
  Creates a dm/group conversation with the acting member and `member_ids`
  enrolled, all in one transaction (one txid covers the conversation and
  membership rows). DMs carry the canonical member pair (`dm_member_a` <
  `dm_member_b`), whose partial unique index makes one-DM-per-pair race-proof;
  when the insert loses that race (or the client's local dedupe missed), the
  existing conversation is returned as `{:existing, conversation}` instead of
  an error.
  """
  def create_conversation(session, %{"kind" => "dm"} = attrs) do
    with {:ok, [other_id]} <- validate_members(session, attrs, exactly: 1) do
      [a, b] = Enum.sort([session.member_id, other_id])

      result =
        insert_conversation(
          session,
          Map.take(attrs, ["id"])
          |> Map.merge(%{"kind" => "dm", "dm_member_a" => a, "dm_member_b" => b}),
          [other_id]
        )

      case result do
        {:error, %Ecto.Changeset{} = changeset} = error ->
          if dm_pair_conflict?(changeset) do
            {:existing,
             Repo.get_by!(Conversation,
               company_id: session.company_id,
               kind: "dm",
               dm_member_a: a,
               dm_member_b: b
             )}
          else
            error
          end

        other ->
          other
      end
    end
  end

  def create_conversation(session, %{"kind" => "group"} = attrs) do
    with {:ok, member_ids} <- validate_members(session, attrs, at_least: 1) do
      insert_conversation(
        session,
        Map.take(attrs, ["id", "name", "emoji"]) |> Map.put("kind", "group"),
        member_ids,
        required: [:name]
      )
    end
  end

  def create_conversation(_session, _attrs) do
    {:error, invalid("kind", "only dm and group conversations can be created")}
  end

  @doc "Advances the acting member's read cursor for a conversation to now."
  def mark_read(session, conversation_id) do
    membership =
      with {:ok, id} <- Ecto.UUID.cast(conversation_id) do
        Repo.get_by(ConversationMember,
          conversation_id: id,
          member_id: session.member_id
        )
      end

    case membership do
      %ConversationMember{} = membership ->
        transaction_with_txid(fn ->
          membership
          |> Ecto.Changeset.change(last_read_at: DateTime.utc_now())
          |> Repo.update()
        end)

      _ ->
        {:error, :forbidden}
    end
  end

  ## Internals

  defp insert_message(session, conversation_id, attrs, opts \\ []) do
    changeset =
      %Message{}
      |> Message.changeset(
        Map.merge(attrs, %{
          "conversation_id" => conversation_id,
          "author_id" => session.member_id,
          "kind" => "text"
        })
      )
      |> Ecto.Changeset.validate_required(Keyword.get(opts, :required, [:body]))

    transaction_with_txid(fn -> Repo.insert(changeset) end)
  end

  defp insert_conversation(session, attrs, member_ids, opts \\ []) do
    changeset =
      %Conversation{}
      |> Conversation.changeset(
        Map.merge(attrs, %{
          "company_id" => session.company_id,
          "created_by" => session.member_id
        })
      )
      |> Ecto.Changeset.validate_required(Keyword.get(opts, :required, []))

    transaction_with_txid(fn ->
      with {:ok, conversation} <- Repo.insert(changeset) do
        [session.member_id | member_ids]
        |> Enum.uniq()
        |> Enum.reduce_while({:ok, conversation}, fn member_id, acc ->
          membership =
            ConversationMember.changeset(%ConversationMember{}, %{
              "conversation_id" => conversation.id,
              "member_id" => member_id,
              "added_by" => session.member_id
            })

          case Repo.insert(membership) do
            {:ok, _} -> {:cont, acc}
            {:error, changeset} -> {:halt, {:error, changeset}}
          end
        end)
      end
    end)
  end

  # The pair's partial unique index rejected the insert — the DM already exists.
  defp dm_pair_conflict?(%Ecto.Changeset{errors: errors}) do
    case Keyword.get(errors, :dm_member_a) do
      {_msg, meta} -> meta[:constraint] == :unique
      _ -> false
    end
  end

  # `member_ids` must all be active members of the acting member's company.
  defp validate_members(session, attrs, constraint) do
    ids =
      (Map.get(attrs, "member_ids") || [])
      |> List.delete(session.member_id)
      |> Enum.uniq()

    count_ok? =
      case constraint do
        [exactly: n] -> length(ids) == n
        [at_least: n] -> length(ids) >= n
      end

    cond do
      not count_ok? ->
        {:error, invalid("member_ids", "wrong number of members")}

      not all_in_company?(ids, session.company_id) ->
        {:error, invalid("member_ids", "unknown member")}

      true ->
        {:ok, ids}
    end
  end

  defp all_in_company?([], _company_id), do: true

  defp all_in_company?(ids, company_id) do
    valid = Enum.all?(ids, &match?({:ok, _}, Ecto.UUID.cast(&1)))

    valid and
      Repo.aggregate(
        from(m in Member,
          where: m.id in ^ids and m.company_id == ^company_id and m.active
        ),
        :count
      ) == length(ids)
  end

  defp membership_kind(conversation_id, member_id) do
    with {:ok, conversation_id} <- Ecto.UUID.cast(conversation_id) do
      Repo.one(
        from cm in ConversationMember,
          join: c in Conversation,
          on: c.id == cm.conversation_id,
          where: cm.conversation_id == ^conversation_id and cm.member_id == ^member_id,
          select: c.kind
      )
    else
      :error -> nil
    end
  end

  defp fetch_message(message_id) do
    with {:ok, id} <- Ecto.UUID.cast(message_id),
         %Message{} = message <- Repo.get(Message, id) do
      {:ok, message}
    else
      _ -> {:error, :not_found}
    end
  end

  # A changeset-shaped validation error (renders through ChangesetJSON/422)
  # for request problems that never reach a schema changeset.
  defp invalid(field, message) do
    {%{}, %{}}
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.add_error(String.to_atom(field), message)
  end

  # Captures the current transaction's id the way Electric will report it:
  # `pg_current_xact_id()` is the 64-bit epoch-qualified xid8; the `::xid`
  # cast strips the epoch down to the 32-bit xid that Electric stamps on
  # change messages (`headers.txids`) — the value TanStack DB's
  # `awaitTxId` matches against. Must run inside the same transaction as
  # the write it tags.
  defp transaction_with_txid(fun) do
    Repo.transaction(fn ->
      case fun.() do
        {:ok, record} -> %{record: record, txid: txid!()}
        {:error, reason} -> Repo.rollback(reason)
      end
    end)
  end

  defp txid! do
    %{rows: [[txid]]} = Repo.query!("SELECT pg_current_xact_id()::xid::text")
    String.to_integer(txid)
  end
end
