defmodule HotelChat.Conversations.Conversation do
  @moduledoc """
  One table for all four kinds (session-1 R4): `dm`, `group`, `location_channel`,
  `company_channel`. See agent_artifacts/data-model.md.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Companies.{Company, Location}
  alias HotelChat.Identity.Member

  @kinds ~w(dm group location_channel company_channel)

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "conversations" do
    belongs_to :company, Company
    field :kind, :string
    field :name, :string
    field :emoji, :string
    belongs_to :location, Location
    # DM member pair, canonically ordered (dm_member_a < dm_member_b);
    # present iff kind == "dm" — see the ReplaceDmKeyWithMemberPair migration.
    field :dm_member_a, :binary_id
    field :dm_member_b, :binary_id
    belongs_to :creator, Member, foreign_key: :created_by
    field :archived_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(conversation, attrs) do
    conversation
    |> cast(attrs, [
      :id,
      :company_id,
      :kind,
      :name,
      :emoji,
      :location_id,
      :dm_member_a,
      :dm_member_b,
      :created_by,
      :archived_at
    ])
    |> validate_required([:company_id, :kind])
    |> validate_inclusion(:kind, @kinds)
    |> unique_constraint([:dm_member_a, :dm_member_b], name: :conversations_dm_pair_index)
    |> foreign_key_constraint(:company_id)
    |> foreign_key_constraint(:location_id)
    |> foreign_key_constraint(:created_by)
  end
end
