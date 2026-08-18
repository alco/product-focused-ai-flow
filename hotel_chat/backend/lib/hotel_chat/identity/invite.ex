defmodule HotelChat.Identity.Invite do
  @moduledoc """
  [IDENTITY — THROWAWAY]

  Manager-issued invite + OTP login in one record (onboarding screen: invite
  → OTP → profile). See agent_artifacts/data-model.md.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias HotelChat.Companies.{Company, Location}
  alias HotelChat.Identity.Member

  @roles ~w(manager staff)

  @primary_key {:id, :binary_id, autogenerate: false, read_after_writes: true}
  @foreign_key_type :binary_id

  schema "invites" do
    belongs_to :company, Company
    field :phone, :string
    field :name, :string
    field :job_title, :string
    field :role, :string, default: "staff"
    belongs_to :location, Location
    belongs_to :inviter, Member, foreign_key: :invited_by
    field :otp_hash, :string
    field :otp_expires_at, :utc_datetime_usec
    belongs_to :accepted_member, Member

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(invite, attrs) do
    invite
    |> cast(attrs, [
      :id,
      :company_id,
      :phone,
      :name,
      :job_title,
      :role,
      :location_id,
      :invited_by,
      :otp_hash,
      :otp_expires_at,
      :accepted_member_id
    ])
    |> validate_required([:company_id, :phone, :role, :location_id, :invited_by])
    |> validate_inclusion(:role, @roles)
    |> foreign_key_constraint(:company_id)
    |> foreign_key_constraint(:location_id)
    |> foreign_key_constraint(:invited_by)
    |> foreign_key_constraint(:accepted_member_id)
  end
end
