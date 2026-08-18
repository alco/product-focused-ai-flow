defmodule HotelChat.Repo.Migrations.CreateConversationMembers do
  use Ecto.Migration

  def change do
    create table(:conversation_members, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")

      add :conversation_id, references(:conversations, type: :binary_id, on_delete: :delete_all),
        null: false

      add :member_id, references(:members, type: :binary_id), null: false
      add :favorite, :boolean, null: false, default: false
      add :muted_until, :utc_datetime_usec
      add :muted_forever, :boolean, null: false, default: false
      add :last_read_at, :utc_datetime_usec
      add :added_by, references(:members, type: :binary_id)

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:conversation_members, [:conversation_id, :member_id])
    create index(:conversation_members, [:member_id])
  end
end
