defmodule HotelChat.Repo.Migrations.CreateCompanies do
  use Ecto.Migration

  def change do
    create table(:companies, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :name, :text, null: false

      timestamps(type: :utc_datetime_usec)
    end
  end
end
