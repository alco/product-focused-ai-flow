defmodule HotelChatWeb.Router do
  use HotelChatWeb, :router

  import Phoenix.Sync.Router

  pipeline :browser do
    plug :accepts, ["html"]
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # Custom backend API
  scope "/api", HotelChatWeb do
    pipe_through :api

    resources "/group_chats", GroupChatController, only: [:index, :create]
  end

  # Electric HTTP API, served by the embedded Electric instance. Each `sync`
  # route exposes a shape that speaks Electric's shape protocol, so clients
  # (e.g. @electric-sql/client or TanStack DB's electricCollectionOptions)
  # point their `url` at these paths.
  scope "/api/sync" do
    pipe_through :api

    sync "/group_chats", HotelChat.Chats.GroupChat
  end

  # Catch-all for the SPA — must come after /api. A hard refresh or deep link
  # on a client-side route (e.g. /chats/123) hits Phoenix and gets back
  # index.html; TanStack Router then takes over and renders the right route.
  # Real static files (/assets/*.js, favicon, etc.) never reach this because
  # Plug.Static in the endpoint runs before the router.
  scope "/", HotelChatWeb do
    pipe_through :browser

    get "/*path", PageController, :index
  end
end
