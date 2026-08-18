#!/usr/bin/env bash
#
# Release workflow: build the frontend, bundle it into the Phoenix app's
# static dir, assemble a mix release, and package everything as a Docker
# image that serves the backend API, the Electric sync API and the static
# frontend from one origin.
#
# Usage:
#   ./release.sh              # steps 1-4
#   SKIP_DOCKER=1 ./release.sh  # steps 1-3 only (native release)
#
# Note: the Docker image (step 4) is built from a self-contained multi-stage
# Dockerfile — it rebuilds the frontend and release inside the container, so
# the image doesn't depend on host artifacts (a host-built release generally
# isn't portable into an Alpine image anyway). Steps 1-3 give you a native
# release runnable directly on this machine via
# backend/_build/prod/rel/hotel_chat/bin/hotel_chat.

set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/4] Building frontend (frontend/dist)"
(cd frontend && npm run build)

echo "==> [2/4] Copying frontend/dist into backend/priv/static"
rm -rf backend/priv/static
mkdir -p backend/priv/static
cp -r frontend/dist/. backend/priv/static/

echo "==> [3/4] Assembling mix release (MIX_ENV=prod)"
(cd backend && mix deps.get --only prod && MIX_ENV=prod mix release --overwrite)

if [ "${SKIP_DOCKER:-0}" = "1" ]; then
  echo "==> [4/4] Skipping Docker image build (SKIP_DOCKER=1)"
else
  echo "==> [4/4] Building Docker image hotel_chat:latest"
  docker build -f backend/Dockerfile -t hotel_chat:latest .
fi

echo "==> Done"
