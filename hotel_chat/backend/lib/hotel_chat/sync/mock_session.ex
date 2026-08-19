defmodule HotelChat.Sync.MockSession do
  @moduledoc """
  TEMPORARY(auth): stand-in for the authenticated session until auth exists.

  Resolves the acting member from the request's `as` query param — a seed
  slug (e.g. `daniel`) mapped to its deterministic seeded id, the same
  `sha256("member:<slug>")` ids `priv/repo/seeds.exs` uses — defaulting to
  Priya @ Harbourlight. This lets the live demo run two browser tabs
  "logged in" as two different members. Real auth replaces how the member
  is identified; the session map's shape stays.
  """

  alias HotelChat.Identity.Member
  alias HotelChat.Repo
  alias HotelChat.Seeds.Id

  @default_slug "priya"

  @spec from_conn(Plug.Conn.t()) ::
          {:ok, %{member_id: String.t(), company_id: String.t(), member: Member.t()}}
          | {:error, :unknown_member}
  def from_conn(%Plug.Conn{} = conn) do
    slug = conn.params["as"] || @default_slug

    case Repo.get(Member, Id.uuid("member:" <> slug)) do
      %Member{active: true} = member ->
        {:ok, %{member_id: member.id, company_id: member.company_id, member: member}}

      _ ->
        {:error, :unknown_member}
    end
  end
end
