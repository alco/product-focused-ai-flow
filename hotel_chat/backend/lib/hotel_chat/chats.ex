defmodule HotelChat.Chats do
  @moduledoc """
  The Chats context: group chats and, later, their messages and members.
  """

  import Ecto.Query, warn: false

  alias HotelChat.Chats.GroupChat
  alias HotelChat.Repo

  def list_group_chats do
    Repo.all(from gc in GroupChat, order_by: [desc: gc.inserted_at])
  end

  def create_group_chat(attrs \\ %{}) do
    %GroupChat{}
    |> GroupChat.changeset(attrs)
    |> Repo.insert()
  end
end
