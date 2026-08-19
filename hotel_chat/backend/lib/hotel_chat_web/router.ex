defmodule HotelChatWeb.Router do
  use HotelChatWeb, :router

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

    # Messaging write path. Each endpoint captures the Postgres txid of its
    # write and returns it, so the client's TanStack DB collections can hold
    # optimistic state until the write syncs back through Electric.
    get "/session", SessionController, :show
    post "/conversations", ConversationController, :create
    post "/conversations/:conversation_id/messages", MessageController, :create
    post "/conversations/:conversation_id/announcements", AnnouncementController, :create
    post "/conversations/:conversation_id/read", ConversationController, :mark_read
    post "/messages/:message_id/replies", MessageController, :reply
    post "/messages/:message_id/reactions", ReactionController, :create
  end

  # Electric shape protocol, proxied to the Electric sync service. Clients
  # (e.g. @electric-sql/client or TanStack DB's electricCollectionOptions)
  # point their `url` at /api/sync/<shape-name>; the proxy resolves the name
  # to a server-decided shape definition and attaches the API secret.
  scope "/api/sync", HotelChatWeb do
    pipe_through :api

    get "/:shape", SyncController, :show
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
