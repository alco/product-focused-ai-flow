defmodule HotelChat.Repo.Migrations.CreateMembers do
  use Ecto.Migration

  def change do
    create table(:members, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :company_id, references(:companies, type: :binary_id), null: false
      add :phone, :text
      add :name, :text, null: false
      add :job_title, :text
      add :role, :text, null: false, default: "staff"
      add :can_post_company_announcements, :boolean, null: false, default: false
      add :active, :boolean, null: false, default: true
      add :scrubbed_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create index(:members, [:company_id, :active])

    create unique_index(:members, [:company_id, :phone],
             where: "phone IS NOT NULL",
             name: :members_company_id_phone_index
           )

    create constraint(:members, :role_must_be_known, check: "role IN ('manager', 'staff')")
  end
end
