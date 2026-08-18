defmodule HotelChatWeb.ConversationController do
  use HotelChatWeb, :controller

  alias HotelChat.Conversations
  alias HotelChat.Sync.MockSession

  action_fallback HotelChatWeb.FallbackController

  @doc "POST /api/conversations"
  def create(conn, params) do
    # TODO(auth): swap for the real authenticated session once auth lands.
    session = MockSession.get()

    with {:ok, %{record: conversation, txid: txid}} <-
           Conversations.create_conversation(session, params) do
      conn
      |> put_status(:created)
      |> json(%{txid: txid, data: %{id: conversation.id}})
    end
  end

  @doc "POST /api/conversations/:conversation_id/read"
  def mark_read(conn, %{"conversation_id" => conversation_id}) do
    # TODO(auth): swap for the real authenticated session once auth lands.
    session = MockSession.get()

    with {:ok, %{record: membership, txid: txid}} <-
           Conversations.mark_read(session, conversation_id) do
      json(conn, %{
        txid: txid,
        data: %{id: membership.id, last_read_at: membership.last_read_at}
      })
    end
  end
end
