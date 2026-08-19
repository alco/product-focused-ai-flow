defmodule HotelChatWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  See `Phoenix.Controller.action_fallback/1` for more details.
  """
  use HotelChatWeb, :controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: HotelChatWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: HotelChatWeb.ErrorJSON)
    |> render(:"404")
  end

  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(:forbidden)
    |> put_view(json: HotelChatWeb.ErrorJSON)
    |> render(:"403")
  end

  # TEMPORARY(auth): the ?as=<slug> mock-session switch named a member that
  # doesn't exist (or is inactive) — see HotelChat.Sync.MockSession.
  def call(conn, {:error, :unknown_member}) do
    conn
    |> put_status(:not_found)
    |> json(%{errors: %{detail: "unknown member"}})
  end

  def call(conn, {:error, :not_a_channel}) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{errors: %{detail: "announcements can only be posted to channels"}})
  end
end
