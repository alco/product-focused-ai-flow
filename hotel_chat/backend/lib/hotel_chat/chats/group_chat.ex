defmodule HotelChat.Chats.GroupChat do
  use Ecto.Schema

  import Ecto.Changeset

  schema "group_chats" do
    field :name, :string

    timestamps(type: :utc_datetime)
  end

  def changeset(group_chat, attrs) do
    group_chat
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
