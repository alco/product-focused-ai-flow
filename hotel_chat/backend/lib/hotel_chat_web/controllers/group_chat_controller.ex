defmodule HotelChatWeb.GroupChatController do
  use HotelChatWeb, :controller

  alias HotelChat.Chats
  alias HotelChat.Chats.GroupChat

  action_fallback HotelChatWeb.FallbackController

  def index(conn, _params) do
    render(conn, :index, group_chats: Chats.list_group_chats())
  end

  def create(conn, %{"group_chat" => group_chat_params}) do
    with {:ok, %GroupChat{} = group_chat} <- Chats.create_group_chat(group_chat_params) do
      conn
      |> put_status(:created)
      |> render(:show, group_chat: group_chat)
    end
  end
end
