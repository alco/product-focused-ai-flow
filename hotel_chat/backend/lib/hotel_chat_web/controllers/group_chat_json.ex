defmodule HotelChatWeb.GroupChatJSON do
  alias HotelChat.Chats.GroupChat

  def index(%{group_chats: group_chats}) do
    %{data: for(group_chat <- group_chats, do: data(group_chat))}
  end

  def show(%{group_chat: group_chat}) do
    %{data: data(group_chat)}
  end

  defp data(%GroupChat{} = group_chat) do
    %{
      id: group_chat.id,
      name: group_chat.name,
      inserted_at: group_chat.inserted_at,
      updated_at: group_chat.updated_at
    }
  end
end
