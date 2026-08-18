# Backend architecture

Our tech stack of the backend:

 - Elixir programming language
 - Phoenix web framework
 - Electric sync running in embedded mode (as a library)
 - Postgres database
 - dev environment codified in a docker compose file that starts the database and bundles the frontend code from hotel_chat/frontend for serving as static assets by Phoenix
