defmodule HotelChat.Conversations.MessageReaction do
  @moduledoc """
  One row per member per emoji per message; the client aggregates to
  `{emoji, count, mine}` (agent_artifacts/data-model.md).
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Conversations.Message
  alias HotelChat.Identity.Member

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "message_reactions" do
    belongs_to :message, Message
    belongs_to :member, Member
    field :emoji, :string

    timestamps(type: :utc_datetime_usec, updated_at: false)
  end

  def changeset(message_reaction, attrs) do
    message_reaction
    |> cast(attrs, [:id, :message_id, :member_id, :emoji])
    |> validate_required([:message_id, :member_id, :emoji])
    |> unique_constraint([:message_id, :member_id, :emoji])
    |> foreign_key_constraint(:message_id)
    |> foreign_key_constraint(:member_id)
  end
end
