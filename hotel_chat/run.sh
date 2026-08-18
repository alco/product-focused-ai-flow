#!/usr/bin/env bash
#
# Runs the whole dev stack from one terminal: Postgres + Electric (via
# docker compose), then frontend (Vite) and backend (Phoenix) in the
# background, then Caddy (the local HTTP/2 terminator — see the
# "HTTPS / HTTP2" section of README.md) in the foreground.
#
# Assumes `pnpm install` (frontend/) and `mix setup` (backend/) have
# already been run at least once.
#
# Ctrl-C kills Caddy directly, since it's the foreground process; the EXIT
# trap below then takes down the backgrounded frontend/backend too,
# including their children (vite's node process, the BEAM VM) — `set -m`
# is what gives each background job its own process group, so
# `kill -- -PID` reaches the whole tree rather than just the immediate
# pnpm/mix PID. Postgres/Electric are left running afterward — long-lived
# stateful services you don't want cycling with this script; `docker
# compose up -d` is idempotent, so re-running this script is harmless.

set -euo pipefail
set -m
cd "$(dirname "$0")"

pids=()
cleanup() {
  echo
  echo "==> Stopping frontend/backend..."
  for pid in "${pids[@]}"; do
    kill -TERM "-$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT

echo "==> [1/4] Starting Postgres + Electric (docker compose up -d)"
docker compose up -d

echo "==> [2/4] Starting frontend (pnpm dev)"
(cd frontend && exec pnpm dev) &
pids+=("$!")

echo "==> [3/4] Starting backend (mix phx.server)"
(cd backend && exec mix phx.server) &
pids+=("$!")

echo "==> [4/4] Starting Caddy (https://localhost:5443)"
caddy run --config Caddyfile
