defmodule HotelChat.Repo.Migrations.CreateInvites do
  use Ecto.Migration

  def change do
    create table(:invites, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :company_id, references(:companies, type: :binary_id), null: false
      add :phone, :text, null: false
      add :name, :text
      add :job_title, :text
      add :role, :text, null: false, default: "staff"
      add :location_id, references(:locations, type: :binary_id), null: false
      add :invited_by, references(:members, type: :binary_id), null: false
      add :otp_hash, :text
      add :otp_expires_at, :utc_datetime_usec
      add :accepted_member_id, references(:members, type: :binary_id)

      timestamps(type: :utc_datetime_usec)
    end

    create index(:invites, [:company_id, :phone])
    create constraint(:invites, :role_must_be_known, check: "role IN ('manager', 'staff')")
  end
end
