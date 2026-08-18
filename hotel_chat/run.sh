#!/usr/bin/env bash
#
# Runs the whole dev stack from one terminal: frontend (Vite), backend
# (Phoenix), and Caddy in front as the local HTTP/2 terminator (see the
# "HTTPS / HTTP2" section of README.md). Postgres + Electric are separate
# (`docker compose up`, from this directory) — long-lived stateful
# services you don't want cycling with this script.
#
# Assumes `pnpm install` (frontend/) and `mix setup` (backend/) have
# already been run at least once.
#
# Ctrl-C stops everything together, including child processes (vite's
# node process, the BEAM VM) — not just the immediate `pnpm`/`mix` PIDs.

set -euo pipefail
set -m # job control: each `&` job gets its own process group, so
       # `kill -- -PID` below reaches the whole tree, not just pnpm/mix.
cd "$(dirname "$0")"

pids=()
cleanup() {
  trap - EXIT INT TERM
  echo
  echo "==> Stopping..."
  for pid in "${pids[@]}"; do
    kill -TERM "-$pid" 2>/dev/null || true
  done
  sleep 1
  for pid in "${pids[@]}"; do
    kill -KILL "-$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> [1/3] Starting frontend (pnpm dev)"
(cd frontend && exec pnpm dev) &
pids+=("$!")

echo "==> [2/3] Starting backend (mix phx.server)"
(cd backend && exec mix phx.server) &
pids+=("$!")

echo "==> [3/3] Starting Caddy (https://localhost:5443)"
caddy run --config Caddyfile &
pids+=("$!")

wait
