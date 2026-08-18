defmodule HotelChatWeb.PageController do
  use HotelChatWeb, :controller

  @doc """
  Serves the SPA entry point for any non-API, non-static-file request.

  The built frontend (frontend/dist) is copied into priv/static, so
  index.html only exists after a frontend build. In dev the frontend is
  served by Vite on :5173 instead, with /api proxied to this server.
  """
  def index(conn, _params) do
    index_html = Path.join(Application.app_dir(:hotel_chat, "priv/static"), "index.html")

    if File.exists?(index_html) do
      conn
      |> put_resp_content_type("text/html")
      |> send_file(200, index_html)
    else
      conn
      |> put_resp_content_type("text/plain")
      |> send_resp(
        404,
        "No frontend build found. In dev, use the Vite dev server (npm run dev in frontend/); " <>
          "for production, build the frontend into priv/static (see release.sh)."
      )
    end
  end
end
