# Backend architecture

## Phase 1

Create a new Phoenix project under backend directory here. It should have a docker compose file to run Postgres (alpine) container and the routing code should be ready for exposing Electric's HTTP API, the custom backend API (e.g. /api/group_chats) and routing to vite's dev server, as detailed below

**Project layout** (you should only focus on the backend and absolutely do not touch anything in the frontend)

```
project/
  backend/                 # Phoenix app
    lib/
    priv/static/            # built frontend lands here
  frontend/                 # Vite + React + TanStack Router
    src/
    vite.config.ts
    dist/                    # build output
```

**Phoenix: API-only, plus a catch-all for the SPA**

```elixir
# router.ex
scope "/api", MyAppWeb do
  pipe_through :api
  # your API routes
end

# catch-all — must come after /api, serves index.html for client-side routes
scope "/", MyAppWeb do
  pipe_through :browser
  get "/*path", PageController, :index
end
```

```elixir
# page_controller.ex
defmodule MyAppWeb.PageController do
  use MyAppWeb, :controller

  def index(conn, _params) do
    conn
    |> put_resp_content_type("text/html")
    |> send_file(200, Path.join(Application.app_dir(:my_app, "priv/static"), "index.html"))
  end
end
```

The catch-all is what makes TanStack Router work correctly — since it's client-side `pushState` routing, a hard refresh or deep link on `/projects/123` has to hit Phoenix and get back `index.html` (Router then
takes over and renders the right route client-side), rather than a 404.

Make sure `Plug.Static` in `endpoint.ex` is configured to serve the built assets and that it runs *before* the router — it will intercept real static files (`/assets/*.js`, favicon, etc.) so those never fall
through to the catch-all:

```elixir
plug Plug.Static,
  at: "/",
  from: :my_app,
  gzip: true,
  only: ~w(assets favicon.ico index.html)
```

**Dev workflow: run two processes, no CORS needed**

- `mix phx.server` — Phoenix on `:4000`, API only
- `npm run dev` — Vite dev server on `:5173`, with HMR

Point Vite's dev server proxy at Phoenix so the browser only ever talks to one origin:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
```

Because the proxy makes it same-origin from the browser's perspective, you don't need a CORS plug at all — in dev or prod. That's a nice side effect of this architecture: Phoenix ends up serving both the API and the built frontend from one origin in production too.

**Build/deploy**

Write a top-level script (that is under hotel_chats) to automate the following release workflow:

1. `npm run build` in `frontend/` → outputs to `frontend/dist`
2. Copy `frontend/dist/*` into `backend/priv/static/` (a small script or CI step — `cp -r frontend/dist/* backend/priv/static/`)
3. `mix release` — `priv/static` gets bundled into the release automatically, so the built frontend ships inside the same artifact as the backend
4. Package it up as a Docker image that can serve both the backend API, the Electric API and the static frontend assets.


## Phase 2

At this point we're going to flesh out the data schema on the backend.

Start by defining the tables, their columns, types, primary/foreign keys and indexes we'll need. 

Next, catalog the different shapes needed by every frontend screen so we could double-check the DB index requirements.

Once I have a chance to review and approve those, I will ask you to build Create/Update API endpoints for the data entities and write units tests for them. The read path in our case relies on ELectric shapes, we don't need to test that. We can verify that the data has ended up written into the database by a controller using just Ecto.from().
