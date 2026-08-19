defmodule HotelChatWeb.ConversationControllerTest do
  use HotelChatWeb.ConnCase, async: true

  import Ecto.Query
  import HotelChat.Fixtures

  alias HotelChat.Conversations.{Conversation, ConversationMember}
  alias HotelChat.Repo

  setup do
    session_fixture()
  end

  describe "POST /api/conversations" do
    test "creates a group with the creator and members enrolled", %{
      conn: conn,
      company: company,
      me: me
    } do
      a = member_fixture(company)
      b = member_fixture(company)

      id = Ecto.UUID.generate()

      conn =
        post(conn, ~p"/api/conversations", %{
          "id" => id,
          "kind" => "group",
          "name" => "Lobby Refresh Project",
          "emoji" => "🛠",
          "member_ids" => [a.id, b.id]
        })

      assert %{"txid" => txid, "data" => %{"id" => ^id}} = json_response(conn, 201)
      assert is_integer(txid)

      conversation = Repo.get!(Conversation, id)
      assert conversation.kind == "group"
      assert conversation.name == "Lobby Refresh Project"
      assert conversation.company_id == company.id
      assert conversation.created_by == me.id

      member_ids =
        Repo.all(
          from cm in ConversationMember,
            where: cm.conversation_id == ^id,
            select: cm.member_id
        )

      assert Enum.sort(member_ids) == Enum.sort([me.id, a.id, b.id])
    end

    test "creates a dm with the canonical member pair", %{conn: conn, company: company, me: me} do
      other = member_fixture(company)

      conn =
        post(conn, ~p"/api/conversations", %{"kind" => "dm", "member_ids" => [other.id]})

      assert %{"txid" => _, "data" => %{"id" => id}} = json_response(conn, 201)

      conversation = Repo.get!(Conversation, id)
      assert conversation.kind == "dm"
      assert conversation.name == nil
      assert [conversation.dm_member_a, conversation.dm_member_b] == Enum.sort([me.id, other.id])
    end

    test "returns the existing dm for a duplicate pair instead of creating one", %{
      conn: conn,
      company: company
    } do
      other = member_fixture(company)

      assert %{"data" => %{"id" => id}} =
               post(conn, ~p"/api/conversations", %{"kind" => "dm", "member_ids" => [other.id]})
               |> json_response(201)

      conn =
        post(conn, ~p"/api/conversations", %{"kind" => "dm", "member_ids" => [other.id]})

      assert %{"txid" => nil, "data" => %{"id" => ^id}} = json_response(conn, 200)
      assert Repo.aggregate(from(c in Conversation, where: c.kind == "dm"), :count) == 1
    end

    test "rejects a group without a name", %{conn: conn, company: company} do
      other = member_fixture(company)

      conn =
        post(conn, ~p"/api/conversations", %{"kind" => "group", "member_ids" => [other.id]})

      assert %{"errors" => _} = json_response(conn, 422)
    end

    test "rejects channel kinds (channels are provisioned, not user-created)", %{
      conn: conn
    } do
      conn =
        post(conn, ~p"/api/conversations", %{"kind" => "company_channel", "name" => "Nope"})

      assert %{"errors" => _} = json_response(conn, 422)
    end

    test "rejects member ids outside my company", %{conn: conn} do
      stranger_company = Repo.insert!(%HotelChat.Companies.Company{name: "Elsewhere"})
      stranger = member_fixture(stranger_company)

      conn =
        post(conn, ~p"/api/conversations", %{
          "kind" => "group",
          "name" => "Sneaky",
          "member_ids" => [stranger.id]
        })

      assert %{"errors" => _} = json_response(conn, 422)
    end
  end

  describe "POST /api/conversations/:conversation_id/read" do
    test "advances my read cursor and returns the txid", %{
      conn: conn,
      company: company,
      me: me
    } do
      conversation = conversation_fixture(company)
      membership = membership_fixture(conversation, me)
      assert membership.last_read_at == nil

      conn = post(conn, ~p"/api/conversations/#{conversation.id}/read", %{})

      assert %{"txid" => txid, "data" => %{"id" => id}} = json_response(conn, 200)
      assert is_integer(txid)
      assert id == membership.id

      updated = Repo.get!(ConversationMember, membership.id)
      assert updated.last_read_at != nil
      assert DateTime.diff(DateTime.utc_now(), updated.last_read_at, :second) < 5
    end

    test "rejects marking a conversation I'm not a member of", %{conn: conn, company: company} do
      conversation = conversation_fixture(company)

      conn = post(conn, ~p"/api/conversations/#{conversation.id}/read", %{})

      assert json_response(conn, 403)
    end
  end
end
