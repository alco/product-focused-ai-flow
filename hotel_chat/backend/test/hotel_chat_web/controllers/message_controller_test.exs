defmodule HotelChatWeb.MessageControllerTest do
  use HotelChatWeb.ConnCase, async: true

  import HotelChat.Fixtures

  alias HotelChat.Conversations.Message
  alias HotelChat.Repo

  setup do
    session_fixture()
  end

  describe "POST /api/conversations/:conversation_id/messages" do
    test "?as= switches the acting member for the write", %{conn: conn, company: company} do
      daniel =
        Repo.insert!(%HotelChat.Identity.Member{
          id: HotelChat.Seeds.Id.uuid("member:daniel"),
          company_id: company.id,
          name: "Daniel Okafor",
          active: true
        })

      conversation = conversation_fixture(company)
      membership_fixture(conversation, daniel)

      conn =
        post(conn, ~p"/api/conversations/#{conversation.id}/messages?as=daniel", %{
          "body" => "Evening handover in 10."
        })

      assert %{"data" => %{"id" => id}} = json_response(conn, 201)
      assert Repo.get!(Message, id).author_id == daniel.id
    end

    test "creates a message and returns its txid", %{conn: conn, company: company, me: me} do
      conversation = conversation_fixture(company)
      membership_fixture(conversation, me)

      id = Ecto.UUID.generate()

      conn =
        post(conn, ~p"/api/conversations/#{conversation.id}/messages", %{
          "id" => id,
          "body" => "Front desk is covered until 6."
        })

      assert %{"txid" => txid, "data" => %{"id" => ^id}} = json_response(conn, 201)
      assert is_integer(txid)

      message = Repo.get!(Message, id)
      assert message.conversation_id == conversation.id
      assert message.author_id == me.id
      assert message.kind == "text"
      assert message.body == "Front desk is covered until 6."
    end

    test "works without a client-supplied id", %{conn: conn, company: company, me: me} do
      conversation = conversation_fixture(company)
      membership_fixture(conversation, me)

      conn =
        post(conn, ~p"/api/conversations/#{conversation.id}/messages", %{"body" => "hi"})

      assert %{"txid" => _, "data" => %{"id" => id}} = json_response(conn, 201)
      assert Repo.get!(Message, id).body == "hi"
    end

    test "rejects posting into a conversation I'm not a member of", %{
      conn: conn,
      company: company
    } do
      conversation = conversation_fixture(company)

      conn =
        post(conn, ~p"/api/conversations/#{conversation.id}/messages", %{"body" => "hi"})

      assert json_response(conn, 403)
    end

    test "rejects plain messages into channels", %{conn: conn, company: company, me: me} do
      channel = conversation_fixture(company, %{kind: "company_channel", name: "All hands"})
      membership_fixture(channel, me)

      conn = post(conn, ~p"/api/conversations/#{channel.id}/messages", %{"body" => "hi"})

      assert json_response(conn, 403)
    end

    test "rejects an empty body", %{conn: conn, company: company, me: me} do
      conversation = conversation_fixture(company)
      membership_fixture(conversation, me)

      conn = post(conn, ~p"/api/conversations/#{conversation.id}/messages", %{})

      assert %{"errors" => %{"body" => _}} = json_response(conn, 422)
    end

    test "rejects an unknown conversation id like a non-membership", %{conn: conn} do
      conn =
        post(conn, ~p"/api/conversations/#{Ecto.UUID.generate()}/messages", %{"body" => "hi"})

      assert json_response(conn, 403)
    end
  end

  describe "POST /api/messages/:message_id/replies" do
    test "creates a reply in the parent's conversation", %{
      conn: conn,
      company: company,
      me: me
    } do
      conversation = conversation_fixture(company)
      membership_fixture(conversation, me)
      other = member_fixture(company)
      membership_fixture(conversation, other)
      parent = message_fixture(conversation, other)

      id = Ecto.UUID.generate()

      conn =
        post(conn, ~p"/api/messages/#{parent.id}/replies", %{"id" => id, "body" => "On it"})

      assert %{"txid" => txid, "data" => %{"id" => ^id}} = json_response(conn, 201)
      assert is_integer(txid)

      reply = Repo.get!(Message, id)
      assert reply.conversation_id == conversation.id
      assert reply.reply_to_id == parent.id
      assert reply.author_id == me.id
      assert reply.body == "On it"
    end

    test "rejects replying in a conversation I'm not a member of", %{
      conn: conn,
      company: company
    } do
      conversation = conversation_fixture(company)
      other = member_fixture(company)
      membership_fixture(conversation, other)
      parent = message_fixture(conversation, other)

      conn = post(conn, ~p"/api/messages/#{parent.id}/replies", %{"body" => "hi"})

      assert json_response(conn, 403)
    end

    test "404s on an unknown parent message", %{conn: conn} do
      conn = post(conn, ~p"/api/messages/#{Ecto.UUID.generate()}/replies", %{"body" => "hi"})

      assert json_response(conn, 404)
    end
  end
end
