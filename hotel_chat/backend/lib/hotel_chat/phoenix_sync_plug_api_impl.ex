# Workaround for a compile-order race in phoenix_sync 0.6.1 on Elixir 1.20:
# its `Phoenix.Sync.Adapter.PlugApi` impl for `Electric.Shapes.Api` is guarded
# by `Code.ensure_loaded?(Phoenix.Sync.Electric.ApiAdapter)` — a sibling module
# that compiles *after* electric.ex under Elixir 1.20's parallel compiler — so
# the impl is silently skipped and every `sync` route 500s with
# Protocol.UndefinedError. This vendors that impl verbatim from
# deps/phoenix_sync/lib/phoenix/sync/electric.ex and compiles only while the
# upstream impl is missing, so it disappears automatically once phoenix_sync
# fixes the guard.
unless Code.ensure_loaded?(Phoenix.Sync.Adapter.PlugApi.Electric.Shapes.Api) do
  defimpl Phoenix.Sync.Adapter.PlugApi, for: Electric.Shapes.Api do
    alias Electric.Shapes

    alias Phoenix.Sync.PredefinedShape
    alias Phoenix.Sync.Electric.ApiAdapter

    def predefined_shape(api, %PredefinedShape{} = shape) do
      ApiAdapter.new(api, shape)
    end

    def call(api, %{method: "GET"} = conn, params) do
      case Shapes.Api.validate(api, params) do
        {:ok, request} ->
          conn
          |> content_type()
          |> Plug.Conn.assign(:request, request)
          |> Shapes.Api.serve_shape_log(request)

        {:error, response} ->
          conn
          |> content_type()
          |> Shapes.Api.Response.send(response)
          |> Plug.Conn.halt()
      end
    end

    def call(api, %{method: "DELETE"} = conn, params) do
      case Shapes.Api.validate_for_delete(api, params) do
        {:ok, request} ->
          conn
          |> content_type()
          |> Plug.Conn.assign(:request, request)
          |> Shapes.Api.delete_shape(request)

        {:error, response} ->
          conn
          |> content_type()
          |> Shapes.Api.Response.send(response)
          |> Plug.Conn.halt()
      end
    end

    def call(_api, %{method: "OPTIONS"} = conn, _params) do
      Shapes.Api.options(conn)
    end

    def response(api, _conn, params) do
      case Shapes.Api.validate(api, params) do
        {:ok, request} ->
          {
            request,
            Shapes.Api.serve_shape_log(request) |> Phoenix.Sync.Electric.consume_response_stream()
          }

        {:error, response} ->
          {nil, response}
      end
    end

    # Upstream matches on %ApiAdapter{} here, which can never match in an
    # impl dispatching on %Electric.Shapes.Api{}.
    def send_response(_api, conn, {request, response}) do
      conn
      |> content_type()
      |> Plug.Conn.assign(:request, request)
      |> Plug.Conn.assign(:response, response)
      |> Shapes.Api.Response.send(response)
    end

    defp content_type(conn) do
      Plug.Conn.put_resp_content_type(conn, "application/json")
    end
  end
end
