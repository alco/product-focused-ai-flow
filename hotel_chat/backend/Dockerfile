# Production image serving the backend API, the Electric sync proxy and the
# built frontend as static assets — all from one origin. An
# electricsql/electric container must run alongside (see docker-compose.yml
# for the shape of it); ELECTRIC_URL/ELECTRIC_SECRET point this app at it.
#
# The build context is the project root (hotel_chat/) so both frontend/ and
# backend/ are visible:
#
#   docker build -f backend/Dockerfile -t hotel_chat .
#
# Run with:
#
#   docker run -p 4000:4000 \
#     -e DATABASE_URL=ecto://postgres:postgres@host:5432/hotel_chat \
#     -e SECRET_KEY_BASE=$(mix phx.gen.secret) \
#     -e ELECTRIC_URL=http://electric:3000 \
#     -e ELECTRIC_SECRET=... \
#     hotel_chat

ARG ELIXIR_IMAGE=hexpm/elixir:1.20.3-erlang-29.0.5-alpine-3.22.5
ARG RUNNER_IMAGE=alpine:3.22

# ---- Stage 1: frontend build ----
FROM node:22-alpine AS frontend

RUN npm install -g pnpm@10

# The frontend imports the shared brand stylesheet via a ../../../brand path,
# so keep the frontend/ and brand/ directories siblings like in the repo.
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend ./
COPY brand /app/brand
RUN pnpm run build

# ---- Stage 2: Phoenix release build ----
FROM ${ELIXIR_IMAGE} AS builder

RUN apk add --no-cache build-base git

WORKDIR /app
RUN mix local.hex --force && mix local.rebar --force

ENV MIX_ENV=prod \
    HEX_HTTP_CONCURRENCY=2 \
    HEX_HTTP_TIMEOUT=120

COPY backend/mix.exs backend/mix.lock ./
RUN mix deps.get --only prod

RUN mkdir config
# Compile-time config first, so dep compilation is cached independently of
# app code and runtime config changes.
COPY backend/config/config.exs backend/config/prod.exs config/
RUN mix deps.compile

COPY backend/priv priv
COPY backend/lib lib

# Bundle the built frontend into the release's static dir, then digest for
# gzipped serving via Plug.Static.
COPY --from=frontend /app/frontend/dist/ priv/static/
RUN mix phx.digest

COPY backend/config/runtime.exs config/
RUN mix compile && mix release

# ---- Stage 3: runtime ----
FROM ${RUNNER_IMAGE}

RUN apk add --no-cache libstdc++ openssl ncurses-libs

ENV LANG=C.UTF-8 \
    MIX_ENV=prod \
    PHX_SERVER=true

WORKDIR /app
RUN chown nobody /app
COPY --from=builder --chown=nobody:root /app/_build/prod/rel/hotel_chat ./

# Embedded Electric persists shape data under the working directory
# (./persistent) by default, which is writable by the app user here.
USER nobody

EXPOSE 4000

CMD ["/app/bin/hotel_chat", "start"]
