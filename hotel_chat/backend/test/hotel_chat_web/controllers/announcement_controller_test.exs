defmodule HotelChatWeb.AnnouncementControllerTest do
  use HotelChatWeb.ConnCase, async: true

  import HotelChat.Fixtures

  alias HotelChat.Conversations.Message
  alias HotelChat.Repo

  setup do
    session_fixture()
  end

  describe "POST /api/conversations/:conversation_id/announcements" do
    test "creates an announcement post in a channel", %{conn: conn, company: company, me: me} do
      channel = conversation_fixture(company, %{kind: "company_channel", name: "All hands"})
      membership_fixture(channel, me)

      id = Ecto.UUID.generate()

      conn =
        post(conn, ~p"/api/conversations/#{channel.id}/announcements", %{
          "id" => id,
          "title" => "Fire drill Thursday",
          "body" => "Please assemble in the car park at 10:00.",
          "post_emoji" => "🚨"
        })

      assert %{"txid" => txid, "data" => %{"id" => ^id}} = json_response(conn, 201)
      assert is_integer(txid)

      message = Repo.get!(Message, id)
      assert message.conversation_id == channel.id
      assert message.author_id == me.id
      assert message.kind == "text"
      assert message.title == "Fire drill Thursday"
      assert message.post_emoji == "🚨"
    end

    test "rejects announcements outside channels", %{conn: conn, company: company, me: me} do
      group = conversation_fixture(company)
      membership_fixture(group, me)

      conn =
        post(conn, ~p"/api/conversations/#{group.id}/announcements", %{
          "title" => "T",
          "body" => "B"
        })

      assert json_response(conn, 422)
    end

    test "rejects posting into a channel I'm not a member of", %{
      conn: conn,
      company: company
    } do
      channel = conversation_fixture(company, %{kind: "location_channel", name: "Bankside"})

      conn =
        post(conn, ~p"/api/conversations/#{channel.id}/announcements", %{
          "title" => "T",
          "body" => "B"
        })

      assert json_response(conn, 403)
    end

    test "requires title and body", %{conn: conn, company: company, me: me} do
      channel = conversation_fixture(company, %{kind: "company_channel", name: "All hands"})
      membership_fixture(channel, me)

      conn = post(conn, ~p"/api/conversations/#{channel.id}/announcements", %{})

      assert %{"errors" => errors} = json_response(conn, 422)
      assert Map.has_key?(errors, "title")
      assert Map.has_key?(errors, "body")
    end
  end
end
