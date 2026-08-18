# HotelChat backend

Phoenix app serving three things from one origin:

- **Custom backend API** under `/api` (e.g. `GET /api/group_chats`)
- **Electric sync HTTP API** under `/api/sync/*` — Electric runs *embedded*
  in this app (as a library, via `phoenix_sync`); each `sync` route in the
  router exposes a shape speaking Electric's shape protocol
- **The SPA** — the built frontend (`frontend/dist`) is copied into
  `priv/static` and served by `Plug.Static`, with a catch-all route
  returning `index.html` so client-side (TanStack Router) deep links and
  hard refreshes work

## Dev workflow

Two processes, no CORS needed:

```sh
# 1. Postgres (wal_level=logical, required by Electric)
docker compose up -d

# 2. Phoenix on :4000 (API only in dev)
mix setup        # deps + db create/migrate (first time)
mix phx.server

# 3. Vite dev server on :5173 with HMR
cd ../frontend && npm run dev
```

Point the browser at Vite (`:5173`). Vite's dev-server proxy must forward
`/api` to Phoenix so everything is same-origin from the browser's
perspective — the frontend's `vite.config.ts` needs:

```ts
export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
```

Since the Electric sync routes live under `/api/sync`, the single `/api`
proxy entry covers both the custom API and sync traffic.

## Release / deploy

From the project root:

```sh
./release.sh
```

This builds the frontend, copies `frontend/dist` into `backend/priv/static`,
assembles a `mix release` (frontend included, since `priv/static` ships
inside the release), and builds a self-contained Docker image (`hotel_chat`)
serving API + sync + static frontend. See `release.sh` and `Dockerfile`.

The release container needs `DATABASE_URL` and `SECRET_KEY_BASE`; the
database it points at must run with `wal_level=logical`.
