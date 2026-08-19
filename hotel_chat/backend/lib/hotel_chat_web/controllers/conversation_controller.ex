defmodule HotelChatWeb.ConversationController do
  use HotelChatWeb, :controller

  alias HotelChat.Conversations
  alias HotelChat.Sync.MockSession

  action_fallback HotelChatWeb.FallbackController

  @doc "POST /api/conversations"
  def create(conn, params) do
    with {:ok, session} <- MockSession.from_conn(conn) do
      create_conversation(conn, session, params)
    end
  end

  defp create_conversation(conn, session, params) do
    case Conversations.create_conversation(session, params) do
      {:ok, %{record: conversation, txid: txid}} ->
        conn
        |> put_status(:created)
        |> json(%{txid: txid, data: %{id: conversation.id}})

      # DM already exists for this pair (client dedupe missed or lost the
      # race) — nothing was written, so there is no txid; the client should
      # navigate to the returned conversation instead.
      {:existing, conversation} ->
        json(conn, %{txid: nil, data: %{id: conversation.id}})

      error ->
        error
    end
  end

  @doc "POST /api/conversations/:conversation_id/read"
  def mark_read(conn, %{"conversation_id" => conversation_id}) do
    with {:ok, session} <- MockSession.from_conn(conn),
         {:ok, %{record: membership, txid: txid}} <-
           Conversations.mark_read(session, conversation_id) do
      json(conn, %{
        txid: txid,
        data: %{id: membership.id, last_read_at: membership.last_read_at}
      })
    end
  end
end
