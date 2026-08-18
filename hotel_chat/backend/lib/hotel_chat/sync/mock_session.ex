defmodule HotelChat.Sync.MockSession do
  @moduledoc """
  Stand-in for the authenticated session until auth exists (see the
  TODO(auth) in HotelChatWeb.SyncController). Scoped to the same seeded
  company/member the frontend's mock session bootstrap
  (frontend/src/db/session.ts) hardcodes — Priya Nair at Harbourlight
  Hotels — computed with the same deterministic ids priv/repo/seeds.exs
  uses, so the shapes proxy serves the real seeded rows end to end.
  """

  alias HotelChat.Seeds.Id

  @spec get() :: %{member_id: String.t(), company_id: String.t()}
  def get do
    %{member_id: Id.uuid("member:priya"), company_id: Id.uuid("company:harbourlight")}
  end
end
