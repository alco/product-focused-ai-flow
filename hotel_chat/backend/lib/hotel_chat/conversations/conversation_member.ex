defmodule HotelChat.Conversations.ConversationMember do
  @moduledoc """
  Membership **plus all per-member-per-chat state** — favorite, mute, read
  cursor (agent_artifacts/data-model.md).
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Conversations.Conversation
  alias HotelChat.Identity.Member

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "conversation_members" do
    belongs_to :conversation, Conversation
    belongs_to :member, Member
    field :favorite, :boolean, default: false
    field :muted_until, :utc_datetime_usec
    field :muted_forever, :boolean, default: false
    field :last_read_at, :utc_datetime_usec
    belongs_to :added_by_member, Member, foreign_key: :added_by

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(conversation_member, attrs) do
    conversation_member
    |> cast(attrs, [
      :id,
      :conversation_id,
      :member_id,
      :favorite,
      :muted_until,
      :muted_forever,
      :last_read_at,
      :added_by
    ])
    |> validate_required([:conversation_id, :member_id, :favorite, :muted_forever])
    |> unique_constraint([:conversation_id, :member_id])
    |> foreign_key_constraint(:conversation_id)
    |> foreign_key_constraint(:member_id)
    |> foreign_key_constraint(:added_by)
  end
end
