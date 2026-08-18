defmodule HotelChat.Repo.Migrations.CreateMemberLocations do
  use Ecto.Migration

  def change do
    create table(:member_locations, primary_key: false) do
      add :member_id, references(:members, type: :binary_id, on_delete: :delete_all),
        primary_key: true,
        null: false

      add :location_id, references(:locations, type: :binary_id, on_delete: :delete_all),
        primary_key: true,
        null: false

      timestamps(type: :utc_datetime_usec)
    end

    create index(:member_locations, [:location_id])
  end
end
