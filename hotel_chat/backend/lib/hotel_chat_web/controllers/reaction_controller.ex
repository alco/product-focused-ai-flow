defmodule HotelChatWeb.ReactionController do
  use HotelChatWeb, :controller

  alias HotelChat.Conversations
  alias HotelChat.Sync.MockSession

  action_fallback HotelChatWeb.FallbackController

  @doc "POST /api/messages/:message_id/reactions"
  def create(conn, %{"message_id" => message_id} = params) do
    with {:ok, session} <- MockSession.from_conn(conn),
         {:ok, %{record: reaction, txid: txid}} <-
           Conversations.create_reaction(session, message_id, params) do
      conn
      |> put_status(:created)
      |> json(%{txid: txid, data: %{id: reaction.id, message_id: reaction.message_id}})
    end
  end
end
