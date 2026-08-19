defmodule HotelChatWeb.MessageController do
  use HotelChatWeb, :controller

  alias HotelChat.Conversations
  alias HotelChat.Sync.MockSession

  action_fallback HotelChatWeb.FallbackController

  @doc "POST /api/conversations/:conversation_id/messages"
  def create(conn, %{"conversation_id" => conversation_id} = params) do
    with {:ok, session} <- MockSession.from_conn(conn),
         {:ok, %{record: message, txid: txid}} <-
           Conversations.create_message(session, conversation_id, params) do
      conn
      |> put_status(:created)
      |> json(%{txid: txid, data: %{id: message.id, conversation_id: message.conversation_id}})
    end
  end

  @doc "POST /api/messages/:message_id/replies"
  def reply(conn, %{"message_id" => message_id} = params) do
    with {:ok, session} <- MockSession.from_conn(conn),
         {:ok, %{record: message, txid: txid}} <-
           Conversations.create_reply(session, message_id, params) do
      conn
      |> put_status(:created)
      |> json(%{txid: txid, data: %{id: message.id, conversation_id: message.conversation_id}})
    end
  end
end
