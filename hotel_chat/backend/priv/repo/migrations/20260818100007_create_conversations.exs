defmodule HotelChat.Repo.Migrations.CreateConversations do
  use Ecto.Migration

  def change do
    create table(:conversations, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :company_id, references(:companies, type: :binary_id), null: false
      add :kind, :text, null: false
      add :name, :text
      add :emoji, :text
      add :location_id, references(:locations, type: :binary_id)
      add :dm_key, :text
      add :created_by, references(:members, type: :binary_id)
      add :archived_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create index(:conversations, [:company_id])

    create unique_index(:conversations, [:company_id, :dm_key],
             where: "kind = 'dm'",
             name: :conversations_company_id_dm_key_index
           )

    create index(:conversations, [:company_id, :kind],
             where: "kind IN ('location_channel', 'company_channel')",
             name: :conversations_company_id_kind_index
           )

    create constraint(:conversations, :kind_must_be_known,
             check: "kind IN ('dm', 'group', 'location_channel', 'company_channel')"
           )
  end
end
