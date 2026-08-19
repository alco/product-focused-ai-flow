defmodule HotelChatWeb.SessionController do
  use HotelChatWeb, :controller

  alias HotelChat.Companies.Company
  alias HotelChat.Repo
  alias HotelChat.Sync.MockSession

  action_fallback HotelChatWeb.FallbackController

  @doc """
  GET /api/session — the client's session bootstrap: who am I, which company.

  TEMPORARY(auth): the member is picked by the `?as=<seed-slug>` param (see
  MockSession). Real login replaces how this endpoint identifies the member;
  the response contract is the future auth seam and stays.
  """
  def show(conn, _params) do
    with {:ok, %{member: member}} <- MockSession.from_conn(conn) do
      company = Repo.get!(Company, member.company_id)

      json(conn, %{
        member_id: member.id,
        name: member.name,
        job_title: member.job_title,
        phone: member.phone,
        company_id: company.id,
        company_name: company.name,
        can_post_announcements: member.can_post_company_announcements
      })
    end
  end
end
