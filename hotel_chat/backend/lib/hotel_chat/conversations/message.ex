defmodule HotelChat.Conversations.Message do
  @moduledoc """
  Announcement posts are `messages` rows with `title`/`post_emoji` set, not a
  separate table (agent_artifacts/data-model.md, decision 2).
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Conversations.Conversation
  alias HotelChat.Identity.Member

  @kinds ~w(text system)
  @deleted_kinds ~w(author moderator)

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "messages" do
    belongs_to :conversation, Conversation
    belongs_to :author, Member, foreign_key: :author_id
    field :kind, :string, default: "text"
    field :body, :string
    field :title, :string
    field :post_emoji, :string
    belongs_to :reply_to, __MODULE__, foreign_key: :reply_to_id
    field :deleted_at, :utc_datetime_usec
    belongs_to :deleted_by_member, Member, foreign_key: :deleted_by
    field :deleted_kind, :string

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(message, attrs) do
    message
    |> cast(attrs, [
      :id,
      :conversation_id,
      :author_id,
      :kind,
      :body,
      :title,
      :post_emoji,
      :reply_to_id,
      :deleted_at,
      :deleted_by,
      :deleted_kind
    ])
    |> validate_required([:conversation_id, :author_id, :kind])
    |> validate_inclusion(:kind, @kinds)
    |> validate_inclusion(:deleted_kind, @deleted_kinds)
    |> foreign_key_constraint(:conversation_id)
    |> foreign_key_constraint(:author_id)
    |> foreign_key_constraint(:reply_to_id)
    |> foreign_key_constraint(:deleted_by)
  end
end
