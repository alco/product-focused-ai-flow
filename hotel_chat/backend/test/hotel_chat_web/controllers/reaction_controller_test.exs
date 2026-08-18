defmodule HotelChatWeb.ReactionControllerTest do
  use HotelChatWeb.ConnCase, async: true

  import HotelChat.Fixtures

  alias HotelChat.Conversations.MessageReaction
  alias HotelChat.Repo

  setup do
    session_fixture()
  end

  describe "POST /api/messages/:message_id/reactions" do
    test "creates a reaction and returns its txid", %{conn: conn, company: company, me: me} do
      conversation = conversation_fixture(company)
      membership_fixture(conversation, me)
      other = member_fixture(company)
      membership_fixture(conversation, other)
      message = message_fixture(conversation, other)

      id = Ecto.UUID.generate()

      conn =
        post(conn, ~p"/api/messages/#{message.id}/reactions", %{"id" => id, "emoji" => "👍"})

      assert %{"txid" => txid, "data" => %{"id" => ^id}} = json_response(conn, 201)
      assert is_integer(txid)

      reaction = Repo.get!(MessageReaction, id)
      assert reaction.message_id == message.id
      assert reaction.member_id == me.id
      assert reaction.emoji == "👍"
    end

    test "reacting to an announcement in a channel works", %{
      conn: conn,
      company: company,
      me: me
    } do
      channel = conversation_fixture(company, %{kind: "company_channel", name: "All hands"})
      membership_fixture(channel, me)
      manager = member_fixture(company, %{role: "manager"})
      membership_fixture(channel, manager)
      post_msg = message_fixture(channel, manager)

      conn = post(conn, ~p"/api/messages/#{post_msg.id}/reactions", %{"emoji" => "🎉"})

      assert %{"txid" => _, "data" => %{"id" => _}} = json_response(conn, 201)
    end

    test "rejects a duplicate reaction (same member, same emoji)", %{
      conn: conn,
      company: company,
      me: me
    } do
      conversation = conversation_fixture(company)
      membership_fixture(conversation, me)
      message = message_fixture(conversation, me)

      assert post(conn, ~p"/api/messages/#{message.id}/reactions", %{"emoji" => "👍"})
             |> json_response(201)

      conn = post(conn, ~p"/api/messages/#{message.id}/reactions", %{"emoji" => "👍"})

      assert %{"errors" => _} = json_response(conn, 422)
    end

    test "rejects reacting in a conversation I'm not a member of", %{
      conn: conn,
      company: company
    } do
      conversation = conversation_fixture(company)
      other = member_fixture(company)
      membership_fixture(conversation, other)
      message = message_fixture(conversation, other)

      conn = post(conn, ~p"/api/messages/#{message.id}/reactions", %{"emoji" => "👍"})

      assert json_response(conn, 403)
    end

    test "404s on an unknown message", %{conn: conn} do
      conn = post(conn, ~p"/api/messages/#{Ecto.UUID.generate()}/reactions", %{"emoji" => "👍"})

      assert json_response(conn, 404)
    end
  end
end
