# Hotel Chat

See the root [README](../README.md) for what this app is and the AI-brief/session history behind it. This doc is the practical "how do I run it" reference.

## Dev workflow

One-time setup, then one script:

```sh
# 1. From hotel_chat/: Postgres (wal_level=logical) + Electric sync service (:3000)
docker compose up -d

# 2. Install deps (first time only)
(cd frontend && pnpm install)
(cd backend && mix setup)   # deps.get + ecto.create/migrate + db.seed

# 3. From hotel_chat/: Vite + Phoenix + Caddy together, Ctrl-C stops all three
./run.sh
```

`run.sh` starts `pnpm dev` (frontend/) and `mix phx.server` (backend/) in the background and Caddy in the foreground; killing it (Ctrl-C) tears down all three, including their child processes (Vite's node process, the BEAM VM) — see the script for the process-group mechanics. Run the three pieces by hand instead (`pnpm dev` in `frontend/`, `mix phx.server` in `backend/`, `caddy run --config Caddyfile` here) if you want them in separate terminals.

Open **`https://localhost:5443`** (Caddy, see below) or plain `http://localhost:5173` (Vite directly — works fine, just capped at 6 concurrent HTTP/1.1 connections). Vite's dev-server proxy forwards `/api` to Phoenix so everything is same-origin from the browser's perspective (`vite.config.ts`'s `server.proxy`), and since Electric sync routes live under `/api/sync`, that one proxy entry covers both.

`mix db.seed` (part of `mix setup`, or run alone to reseed) populates the same demo dataset — one company, one location, 16 staff, 18 conversations — the frontend used to hard-code as fixtures; see `agent_artifacts/data-model.md`.

## HTTPS / HTTP2

Electric shape requests are long-lived GETs, and once more than 6 are open at once, plain HTTP/1.1 (Vite's dev server, port 5173) starts queueing them — Chrome's per-origin connection cap. Caddy (`Caddyfile`, started by `run.sh`) terminates TLS on `:5443` in front of Vite and negotiates HTTP/2 with the browser, lifting that cap. Vite itself has no HTTP/2 support to fall back on, so this is the only way to get it in dev.

Caddy runs natively on the host here (not in Docker) specifically so it can install its local CA into the *host's* actual trust store — a containerized Caddy's CA lives in the container's own filesystem, which no browser on your host reads, and getting it out and trusted after the fact is fiddlier and less reliable than letting Caddy do it itself. The first time `run.sh` (or `caddy run`) generates that CA, Caddy tries to install it automatically and may prompt for your password. If it doesn't take (or you skipped the prompt), trust it explicitly once Caddy is running:

```sh
caddy trust
```

If your browser still shows a warning after that, it's almost certainly Firefox — it keeps its own certificate store separate from the OS on every platform, so `caddy trust` doesn't reach it. Import the CA manually: find it at `~/.local/share/caddy/pki/authorities/local/root.crt` (Linux) or `~/Library/Application Support/Caddy/pki/authorities/local/root.crt` (macOS), then Firefox Settings → Privacy & Security → Certificates → View Certificates → Authorities → Import.

Skip all of this and just use `http://localhost:5173` if you don't need >6 concurrent shape requests (e.g. one or two open conversations) — the app works identically either way, just without HTTP/2.

## Release / deploy

From the repo root:

```sh
./release.sh
```

Builds the frontend, copies `frontend/dist` into `backend/priv/static`, assembles a `mix release`, and builds a self-contained Docker image (`hotel_chat`) serving API + sync + static frontend from one origin — no Caddy or separate dev compose involved; see `release.sh` and `backend/Dockerfile`.
