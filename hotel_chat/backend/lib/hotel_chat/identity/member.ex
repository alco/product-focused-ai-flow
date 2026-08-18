defmodule HotelChat.Identity.Member do
  @moduledoc """
  [IDENTITY — THROWAWAY, except `id`]

  Belongs to the mock identity system and will be replaced by the production
  identity ecosystem (agent_artifacts/data-model.md). Nothing outside the
  identity boundary may FK into this table's internals — `id` is the one
  stable handle the rest of the schema references.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Companies.Company

  @roles ~w(manager staff)

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "members" do
    belongs_to :company, Company
    field :phone, :string
    field :name, :string
    field :job_title, :string
    field :role, :string, default: "staff"
    field :can_post_company_announcements, :boolean, default: false
    field :active, :boolean, default: true
    field :scrubbed_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(member, attrs) do
    member
    |> cast(attrs, [
      :id,
      :company_id,
      :phone,
      :name,
      :job_title,
      :role,
      :can_post_company_announcements,
      :active,
      :scrubbed_at
    ])
    |> validate_required([:company_id, :name, :role, :can_post_company_announcements, :active])
    |> validate_inclusion(:role, @roles)
    |> unique_constraint([:company_id, :phone], name: :members_company_id_phone_index)
    |> foreign_key_constraint(:company_id)
  end
end
