defmodule HotelChatWeb.SyncController do
  use HotelChatWeb, :controller

  alias HotelChat.Sync.{MockSession, Shapes}

  @moduledoc """
  Authorizing proxy in front of the Electric sync service.

  Electric is designed to run behind exactly this kind of proxy: the browser
  speaks the shape protocol against `/api/sync/:shape`, and this controller
  resolves the shape name to a server-decided definition
  (`HotelChat.Sync.Shapes`), attaches the Electric API secret, and forwards
  to `GET {electric.url}/v1/shape`. Shape-protocol params from the client
  (offset/handle/live/cursor) pass through; everything defining *what* is
  synced does not.
  """

  # Client-controlled shape-protocol params that are safe to forward.
  @passthrough_params ~w(offset handle live cursor replica)

  # Response headers forwarded back to the client. Electric's caching and
  # protocol headers must survive the hop; hop-by-hop headers must not.
  @passthrough_resp_headers ~w(content-type etag cache-control)

  def show(conn, %{"shape" => shape_name} = params) do
    # TODO(auth): swap for the real authenticated session once auth lands;
    # shape definitions use it for $me/$company scoping.
    session = MockSession.get()

    case Shapes.define(shape_name, session) do
      {:ok, shape} ->
        proxy(conn, shape, params)

      :error ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "unknown shape #{inspect(shape_name)}"})
    end
  end

  defp proxy(conn, shape, params) do
    electric = Application.fetch_env!(:hotel_chat, :electric)

    query =
      Map.take(params, @passthrough_params)
      |> Map.merge(shape_query(shape))
      |> Map.put("secret", electric[:secret])

    case Req.get([url: electric[:url] <> "/v1/shape", params: query] ++ req_opts()) do
      {:ok, resp} ->
        conn
        |> copy_resp_headers(resp)
        |> send_resp(resp.status, resp.body || "")

      {:error, reason} ->
        conn
        |> put_status(:bad_gateway)
        |> json(%{error: "sync service unavailable", detail: inspect(reason)})
    end
  end

  defp shape_query(shape) do
    %{"table" => shape.table}
    |> maybe_put("where", shape[:where])
    |> maybe_put("columns", shape[:columns] && Enum.join(shape.columns, ","))
    |> Map.merge(
      for {n, v} <- shape[:params] || %{}, into: %{}, do: {"params[#{n}]", v}
    )
  end

  defp maybe_put(map, _key, nil), do: map
  defp maybe_put(map, key, value), do: Map.put(map, key, value)

  defp copy_resp_headers(conn, resp) do
    resp.headers
    |> Enum.flat_map(fn {name, values} ->
      if name in @passthrough_resp_headers or String.starts_with?(name, "electric-") do
        Enum.map(List.wrap(values), &{name, &1})
      else
        []
      end
    end)
    |> Enum.reduce(conn, fn {name, value}, conn -> put_resp_header(conn, name, value) end)
  end

  defp req_opts do
    [
      # live-mode requests long-poll on the Electric side
      receive_timeout: 60_000,
      # forward Electric's response verbatim: no JSON decoding, no retries
      # that would replay long-polls
      decode_body: false,
      retry: false
    ]
  end
end
