defmodule HotelChat.Repo.Migrations.CreateMessageAttachments do
  use Ecto.Migration

  def change do
    create table(:message_attachments, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :message_id, references(:messages, type: :binary_id, on_delete: :delete_all), null: false
      add :kind, :text, null: false
      add :object_key, :text, null: false
      add :url, :text, null: false
      add :file_name, :text
      add :content_type, :text, null: false
      add :byte_size, :bigint, null: false
      add :width, :integer
      add :height, :integer

      timestamps(type: :utc_datetime_usec)
    end

    create index(:message_attachments, [:message_id])
    create constraint(:message_attachments, :kind_must_be_known, check: "kind IN ('image', 'file')")
  end
end
