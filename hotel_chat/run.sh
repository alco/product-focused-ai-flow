#!/usr/bin/env bash
#
# Runs the whole dev stack from one terminal: frontend (Vite) and backend
# (Phoenix) in the background, Caddy (the local HTTP/2 terminator — see the
# "HTTPS / HTTP2" section of README.md) in the foreground. Postgres +
# Electric are separate (`docker compose up`, from this directory) —
# long-lived stateful services you don't want cycling with this script.
#
# Assumes `pnpm install` (frontend/) and `mix setup` (backend/) have
# already been run at least once.
#
# Ctrl-C kills Caddy directly, since it's the foreground process; the EXIT
# trap below then takes down the backgrounded frontend/backend too,
# including their children (vite's node process, the BEAM VM) — `set -m`
# is what gives each background job its own process group, so
# `kill -- -PID` reaches the whole tree rather than just the immediate
# pnpm/mix PID.

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

echo "==> [1/3] Starting frontend (pnpm dev)"
(cd frontend && exec pnpm dev) &
pids+=("$!")

echo "==> [2/3] Starting backend (mix phx.server)"
(cd backend && exec mix phx.server) &
pids+=("$!")

echo "==> [3/3] Starting Caddy (https://localhost:5443)"
caddy run --config Caddyfile
