defmodule HotelChat.Repo.Migrations.CreateMemberSettings do
  use Ecto.Migration

  def change do
    create table(:member_settings, primary_key: false) do
      add :member_id, references(:members, type: :binary_id, on_delete: :delete_all),
        primary_key: true,
        null: false

      add :snoozed_until, :utc_datetime_usec
      add :snooze_minutes, :integer, null: false, default: 30
      add :language, :text, null: false, default: "en"

      timestamps(type: :utc_datetime_usec)
    end
  end
end
