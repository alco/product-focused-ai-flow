defmodule HotelChat.Seeds.Id do
  @moduledoc """
  Deterministic UUIDs for seeded demo rows, derived from a stable slug
  (sha256 truncated to 16 bytes, loaded as a UUID). Used by
  priv/repo/seeds.exs so reseeding is idempotent, and by
  HotelChat.Sync.MockSession so the sync proxy's temporary session scopes
  to the same seeded company/member until real auth exists.
  """

  @spec uuid(String.t()) :: String.t()
  def uuid(seed) do
    hash = :crypto.hash(:sha256, seed) |> binary_part(0, 16)
    {:ok, uuid} = Ecto.UUID.load(hash)
    uuid
  end
end
