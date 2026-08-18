defmodule HotelChat.Repo.Migrations.CreateMessageReactions do
  use Ecto.Migration

  def change do
    create table(:message_reactions, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :message_id, references(:messages, type: :binary_id, on_delete: :delete_all), null: false
      add :member_id, references(:members, type: :binary_id), null: false
      add :emoji, :text, null: false

      timestamps(type: :utc_datetime_usec, updated_at: false)
    end

    create unique_index(:message_reactions, [:message_id, :member_id, :emoji])
  end
end
