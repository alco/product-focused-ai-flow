# HotelChat backend

Phoenix app serving three things from one origin:

- **Custom backend API** under `/api` (e.g. `GET /api/group_chats`)
- **Electric shape protocol** under `/api/sync/:shape` — Electric runs as a
  separate sync service (see `../docker-compose.yml`); Phoenix is its
  [authorizing proxy](https://electric.ax/docs/sync/guides/auth): the shape
  name resolves to a server-decided definition (`HotelChat.Sync.Shapes` —
  table/where/columns are never client-supplied) and the Electric API secret
  is attached server-side, so the browser can never reach Electric directly
- **The SPA** — the built frontend (`frontend/dist`) is copied into
  `priv/static` and served by `Plug.Static`, with a catch-all route
  returning `index.html` so client-side (TanStack Router) deep links and
  hard refreshes work

## Dev workflow

See `../README.md` for the full three-process dev workflow (`docker compose
up` from `hotel_chat/`, `pnpm dev` in `frontend/`, `mix setup && mix
phx.server` here) and the HTTP/2 dev-proxy setup. In short: `docker compose
up` (from `hotel_chat/`) starts Postgres + Electric + a local Caddy HTTP/2
terminator; `mix setup` (deps + db create/migrate/seed) then `mix
phx.server` starts Phoenix on `:4000`.

## Release / deploy

From the project root:

```sh
./release.sh
```

This builds the frontend, copies `frontend/dist` into `backend/priv/static`,
assembles a `mix release` (frontend included, since `priv/static` ships
inside the release), and builds a self-contained Docker image (`hotel_chat`)
serving API + sync + static frontend. See `release.sh` and `Dockerfile`.

The release container needs `DATABASE_URL`, `SECRET_KEY_BASE`,
`ELECTRIC_URL` and `ELECTRIC_SECRET`, plus an
[`electricsql/electric`](https://hub.docker.com/r/electricsql/electric)
container running next to it against the same database (which must run
with `wal_level=logical`), mirroring the dev compose setup.
