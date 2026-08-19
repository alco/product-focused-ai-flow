defmodule HotelChatWeb.SessionControllerTest do
  use HotelChatWeb.ConnCase, async: true

  import HotelChat.Fixtures

  alias HotelChat.Identity.Member
  alias HotelChat.Repo
  alias HotelChat.Seeds.Id

  setup do
    session_fixture()
  end

  describe "GET /api/session" do
    test "defaults to the seeded mock member", %{conn: conn, me: me, company: company} do
      conn = get(conn, ~p"/api/session")

      assert %{
               "member_id" => member_id,
               "company_id" => company_id,
               "name" => "Priya Nair",
               "job_title" => "Front Desk",
               "company_name" => "Harbourlight Hotels",
               "can_post_announcements" => false
             } = json_response(conn, 200)

      assert member_id == me.id
      assert company_id == company.id
    end

    test "?as= switches the acting member", %{conn: conn, company: company} do
      daniel =
        Repo.insert!(%Member{
          id: Id.uuid("member:daniel"),
          company_id: company.id,
          name: "Daniel Okafor",
          job_title: "Duty Manager",
          role: "manager",
          can_post_company_announcements: true,
          active: true
        })

      conn = get(conn, ~p"/api/session?as=daniel")

      assert %{
               "member_id" => member_id,
               "name" => "Daniel Okafor",
               "can_post_announcements" => true
             } = json_response(conn, 200)

      assert member_id == daniel.id
    end

    test "an unknown slug is a 404", %{conn: conn} do
      conn = get(conn, ~p"/api/session?as=nobody")
      assert %{"errors" => _} = json_response(conn, 404)
    end
  end
end
