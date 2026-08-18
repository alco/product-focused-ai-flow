import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :hotel_chat, HotelChat.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "hotel_chat_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# No Electric service in tests; the read path (shape proxying) is not under test.
config :hotel_chat, :electric,
  url: "http://localhost:0",
  secret: "test-secret"

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :hotel_chat, HotelChatWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "bt6C5KvtiviALXY+vmrK/o/REPI9rm5xPgqKd41nwhcvKki7KPwH3DNg6ALyq5Py",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Sort query params output of verified routes for robust url comparisons
config :phoenix,
  sort_verified_routes_query_params: true
