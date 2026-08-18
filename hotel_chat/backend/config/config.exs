# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :hotel_chat,
  ecto_repos: [HotelChat.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configure the endpoint
config :hotel_chat, HotelChatWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: HotelChatWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: HotelChat.PubSub,
  live_view: [signing_salt: "kOlerSDK"]

# Configure Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Electric runs as a separate sync service (see docker-compose.yml); Phoenix
# proxies /api/sync/* to it, injecting server-decided shape definitions and
# the API secret. Per-env url/secret live in dev.exs / test.exs / runtime.exs.

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
