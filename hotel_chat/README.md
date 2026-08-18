# Hotel Chat

See the root [README](../README.md) for what this app is and the AI-brief/session history behind it. This doc is the practical "how do I run it" reference.

## Dev workflow

Three processes, no CORS needed, one shared Postgres:

```sh
# 1. From hotel_chat/: Postgres (wal_level=logical) + Electric sync service
#    (:3000) + Caddy (:5443, HTTP/2 terminator — see below)
docker compose up

# 2. From hotel_chat/frontend/: Vite dev server on :5173 with HMR
pnpm install
pnpm dev

# 3. From hotel_chat/backend/: Phoenix on :4000 (API + sync proxy)
mix setup        # deps.get + ecto.create/migrate + db.seed, first time only
mix phx.server
```

Open **`https://localhost:5443`** (Caddy, see below) or plain `http://localhost:5173` (Vite directly — works fine, just capped at 6 concurrent HTTP/1.1 connections). Vite's dev-server proxy forwards `/api` to Phoenix so everything is same-origin from the browser's perspective (`vite.config.ts`'s `server.proxy`), and since Electric sync routes live under `/api/sync`, that one proxy entry covers both.

`mix db.seed` (part of `mix setup`, or run alone to reseed) populates the same demo dataset — one company, one location, 16 staff, 18 conversations — the frontend used to hard-code as fixtures; see `agent_artifacts/data-model.md`.

## HTTPS / HTTP2

Electric shape requests are long-lived GETs, and once more than 6 are open at once, plain HTTP/1.1 (Vite's dev server, port 5173) starts queueing them — Chrome's per-origin connection cap. `docker compose up` also starts a `caddy` container (`Caddyfile`) that terminates TLS on `:5443` in front of Vite and negotiates HTTP/2 with the browser, lifting that cap. Vite itself has no HTTP/2 support to fall back on, so this is the only way to get it in dev.

Caddy issues itself a local CA and a cert for `localhost` automatically; the browser will show a self-signed-certificate warning until you trust that CA once:

```sh
# Extract Caddy's local root CA from the running container...
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt /tmp/caddy-root.crt

# ...then install it into your system/browser trust store. On Fedora/RHEL:
sudo cp /tmp/caddy-root.crt /etc/pki/ca-trust/source/anchors/caddy-hotel-chat.crt
sudo update-ca-trust

# Debian/Ubuntu:
sudo cp /tmp/caddy-root.crt /usr/local/share/ca-certificates/caddy-hotel-chat.crt
sudo update-ca-certificates

# macOS:
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /tmp/caddy-root.crt
```

Firefox keeps its own certificate store separate from the OS on every platform — import `/tmp/caddy-root.crt` under Settings → Privacy & Security → Certificates → View Certificates → Authorities → Import if you use it.

Skip all of this and just use `http://localhost:5173` if you don't need >6 concurrent shape requests (e.g. one or two open conversations) — the app works identically either way, just without HTTP/2.

## Release / deploy

From the repo root:

```sh
./release.sh
```

Builds the frontend, copies `frontend/dist` into `backend/priv/static`, assembles a `mix release`, and builds a self-contained Docker image (`hotel_chat`) serving API + sync + static frontend from one origin — no Caddy or separate dev compose involved; see `release.sh` and `backend/Dockerfile`.
