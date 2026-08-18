defmodule HotelChat.Repo.Migrations.CreatePushSubscriptions do
  use Ecto.Migration

  def change do
    create table(:push_subscriptions, primary_key: false) do
      add :id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()")
      add :member_id, references(:members, type: :binary_id, on_delete: :delete_all), null: false
      add :endpoint, :text, null: false
      add :keys, :map, null: false
      add :user_agent, :text

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:push_subscriptions, [:endpoint])
    create index(:push_subscriptions, [:member_id])
  end
end
