defmodule HotelChat.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")

      add :conversation_id, references(:conversations, type: :binary_id, on_delete: :delete_all),
        null: false

      add :author_id, references(:members, type: :binary_id), null: false
      add :kind, :text, null: false, default: "text"
      add :body, :text
      add :title, :text
      add :post_emoji, :text
      add :reply_to_id, references(:messages, type: :binary_id)
      add :deleted_at, :utc_datetime_usec
      add :deleted_by, references(:members, type: :binary_id)
      add :deleted_kind, :text

      timestamps(type: :utc_datetime_usec)
    end

    create index(:messages, [:conversation_id, :inserted_at])
    create constraint(:messages, :kind_must_be_known, check: "kind IN ('text', 'system')")

    create constraint(:messages, :deleted_kind_must_be_known,
             check: "deleted_kind IN ('author', 'moderator')"
           )
  end
end
