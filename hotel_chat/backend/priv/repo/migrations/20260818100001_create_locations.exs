defmodule HotelChat.Repo.Migrations.CreateLocations do
  use Ecto.Migration

  def change do
    create table(:locations, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :company_id, references(:companies, type: :binary_id), null: false
      add :name, :text, null: false
      add :city, :text
      add :timezone, :text, null: false

      timestamps(type: :utc_datetime_usec)
    end

    create index(:locations, [:company_id])
  end
end
