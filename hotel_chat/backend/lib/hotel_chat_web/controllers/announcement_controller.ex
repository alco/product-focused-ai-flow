defmodule HotelChatWeb.AnnouncementController do
  use HotelChatWeb, :controller

  alias HotelChat.Conversations
  alias HotelChat.Sync.MockSession

  action_fallback HotelChatWeb.FallbackController

  @doc "POST /api/conversations/:conversation_id/announcements"
  def create(conn, %{"conversation_id" => conversation_id} = params) do
    # TODO(auth): swap for the real authenticated session once auth lands.
    session = MockSession.get()

    with {:ok, %{record: message, txid: txid}} <-
           Conversations.create_announcement(session, conversation_id, params) do
      conn
      |> put_status(:created)
      |> json(%{txid: txid, data: %{id: message.id, conversation_id: message.conversation_id}})
    end
  end
end
