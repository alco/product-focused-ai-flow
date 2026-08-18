defmodule HotelChat.Repo do
  use Ecto.Repo,
    otp_app: :hotel_chat,
    adapter: Ecto.Adapters.Postgres
end
