defmodule HotelChat.Repo.Migrations.CreateGroupChats do
  use Ecto.Migration

  def change do
    create table(:group_chats) do
      add :name, :string, null: false

      timestamps(type: :utc_datetime)
    end
  end
end
