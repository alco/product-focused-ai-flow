defmodule HotelChat.Application do
  # See https://elixir.hexdocs.pm/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      HotelChatWeb.Telemetry,
      HotelChat.Repo,
      {DNSCluster, query: Application.get_env(:hotel_chat, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: HotelChat.PubSub},
      # Start a worker by calling: HotelChat.Worker.start_link(arg)
      # {HotelChat.Worker, arg},
      # Start to serve requests, typically the last entry
      {HotelChatWeb.Endpoint, phoenix_sync: Phoenix.Sync.plug_opts()}
    ]

    # See https://elixir.hexdocs.pm/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: HotelChat.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    HotelChatWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
