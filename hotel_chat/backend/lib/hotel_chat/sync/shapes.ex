defmodule HotelChat.Sync.Shapes do
  @moduledoc """
  Server-side shape definitions for the Electric sync proxy.

  The client selects a shape by name (`GET /api/sync/:shape`); the table,
  where-clause, columns and where-clause params are always decided here —
  never taken from the request. This is the authorization boundary for the
  read path: a client can only sync data a definition below hands it, scoped
  by its own session.

  S1–S7 below mirror hotel_chat/agent_artifacts/shape-model.md exactly. S8–S10
  (messages/reactions/attachments) currently collapse the doc's per-conversation
  `messages:{c}` shapes into one standing "all my conversations" shape each —
  matching frontend/src/db/collections.ts's current stage (one flat collection
  per table; per-conversation subset-snapshot windowing is called out there as
  future work, not part of this swap from mock fixtures to live shapes).

  Column lists match the frontend's row types (frontend/src/db/schema.ts) —
  a shape is allowed to select fewer columns than its table has; see the
  cross-check note in 6-backend-data-model-ai-brief.md. Notably,
  `messages.deleted_at`/`deleted_by`/`deleted_kind` are never selected: once
  soft-delete lands, this module excludes deleted rows via the where-clause
  instead of shipping a tombstone flag for the client to filter on.

  `session` is the authenticated context (member id, company id); until auth
  exists it comes from `HotelChat.Sync.MockSession`.
  """

  @type definition :: %{
          required(:table) => String.t(),
          optional(:where) => String.t(),
          optional(:params) => %{String.t() => String.t()},
          optional(:columns) => [String.t()]
        }

  # `$my_convs` from shape-model.md's ground rules: the ids of every
  # conversation the session's member belongs to.
  @my_convs "(SELECT conversation_id FROM conversation_members WHERE member_id = $1)"
  @my_messages "(SELECT id FROM messages WHERE conversation_id IN #{@my_convs})"

  @spec define(String.t(), map()) :: {:ok, definition()} | :error

  # S1 `my_memberships` — my conversation_members rows, all per-chat state.
  def define("my_memberships", %{member_id: member_id}) do
    {:ok,
     %{
       table: "conversation_members",
       where: "member_id = $1",
       params: %{"1" => member_id},
       columns: ~w(id conversation_id member_id favorite muted_until muted_forever last_read_at added_by inserted_at)
     }}
  end

  # S2 `my_conversations` — every conversation I'm a member of.
  def define("my_conversations", %{member_id: member_id}) do
    {:ok,
     %{
       table: "conversations",
       where: "id IN #{@my_convs}",
       params: %{"1" => member_id},
       columns:
         ~w(id company_id kind name emoji location_id dm_member_a dm_member_b created_by archived_at inserted_at)
     }}
  end

  # S2b `rosters` — conversation_members of my conversations, 3-column
  # projection (plus `id`: Electric requires the primary key column in every
  # shape's column list even when the client doesn't need it delivered).
  def define("rosters", %{member_id: member_id}) do
    {:ok,
     %{
       table: "conversation_members",
       where: "conversation_id IN #{@my_convs}",
       params: %{"1" => member_id},
       columns: ~w(id conversation_id member_id added_by)
     }}
  end

  # S3 `directory` — the company-wide member directory.
  def define("directory", %{company_id: company_id}) do
    {:ok,
     %{
       table: "members",
       where: "company_id = $1 AND active = true",
       params: %{"1" => company_id},
       columns: ~w(id company_id name job_title role active)
     }}
  end

  # S4 `member_locations` — member <-> location assignments across the company.
  def define("member_locations", %{company_id: company_id}) do
    {:ok,
     %{
       table: "member_locations",
       where: "member_id IN (SELECT id FROM members WHERE company_id = $1)",
       params: %{"1" => company_id},
       columns: ~w(member_id location_id)
     }}
  end

  # S5 `locations` — the company's locations.
  def define("locations", %{company_id: company_id}) do
    {:ok,
     %{
       table: "locations",
       where: "company_id = $1",
       params: %{"1" => company_id},
       columns: ~w(id company_id name city)
     }}
  end

  # S6 `my_settings` — my private settings (snooze, language).
  def define("my_settings", %{member_id: member_id}) do
    {:ok,
     %{
       table: "member_settings",
       where: "member_id = $1",
       params: %{"1" => member_id},
       columns: ~w(member_id snoozed_until snooze_minutes language)
     }}
  end

  # S7 `my_schedule` — my work schedule (display-only).
  def define("my_schedule", %{member_id: member_id}) do
    {:ok,
     %{
       table: "work_schedules",
       where: "member_id = $1",
       params: %{"1" => member_id},
       columns: ~w(id member_id weekday starts_at ends_at)
     }}
  end

  # S8 `messages` — recent-message windows of my conversations (collapsed;
  # see moduledoc). Soft-deleted rows are excluded server-side.
  def define("messages", %{member_id: member_id}) do
    {:ok,
     %{
       table: "messages",
       where: "conversation_id IN #{@my_convs} AND deleted_at IS NULL",
       params: %{"1" => member_id},
       columns: ~w(id conversation_id author_id kind body title post_emoji reply_to_id inserted_at)
     }}
  end

  # S9 `reactions` — per-member reaction rows of my conversations' messages.
  def define("reactions", %{member_id: member_id}) do
    {:ok,
     %{
       table: "message_reactions",
       where: "message_id IN #{@my_messages}",
       params: %{"1" => member_id},
       columns: ~w(id message_id member_id emoji inserted_at)
     }}
  end

  # S10 `attachments` — attachments of my conversations' messages.
  def define("attachments", %{member_id: member_id}) do
    {:ok,
     %{
       table: "message_attachments",
       where: "message_id IN #{@my_messages}",
       params: %{"1" => member_id},
       columns: ~w(id message_id kind url file_name content_type)
     }}
  end

  def define("group_chats", _session) do
    {:ok, %{table: "group_chats"}}
  end

  def define(_unknown, _session), do: :error
end
