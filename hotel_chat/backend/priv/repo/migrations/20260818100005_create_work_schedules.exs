defmodule HotelChat.Repo.Migrations.CreateWorkSchedules do
  use Ecto.Migration

  def change do
    create table(:work_schedules, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :member_id, references(:members, type: :binary_id, on_delete: :delete_all), null: false
      add :weekday, :integer, null: false
      add :starts_at, :time, null: false
      add :ends_at, :time, null: false

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:work_schedules, [:member_id, :weekday])
    create constraint(:work_schedules, :weekday_range, check: "weekday BETWEEN 0 AND 6")
  end
end
