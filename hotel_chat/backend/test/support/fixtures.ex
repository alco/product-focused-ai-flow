defmodule HotelChat.Fixtures do
  @moduledoc """
  Test data builders for the messaging write path.

  The acting-user side of every fixture matches `HotelChat.Sync.MockSession`
  (Priya @ Harbourlight): the controllers resolve the current member from
  that mock session until real auth lands, so tests must seed those exact
  deterministic ids for the write path to find them.
  """

  alias HotelChat.Companies.Company
  alias HotelChat.Conversations.{Conversation, ConversationMember, Message}
  alias HotelChat.Identity.Member
  alias HotelChat.Repo
  alias HotelChat.Sync.MockSession

  @doc "Seeds the mock-session company + member. Returns %{session, company, me}."
  def session_fixture do
    session = MockSession.get()
    company = Repo.insert!(%Company{id: session.company_id, name: "Harbourlight Hotels"})

    me =
      Repo.insert!(%Member{
        id: session.member_id,
        company_id: company.id,
        name: "Priya Nair",
        job_title: "Front Desk",
        role: "staff",
        can_post_company_announcements: false,
        active: true
      })

    %{session: session, company: company, me: me}
  end

  def member_fixture(%Company{} = company, attrs \\ %{}) do
    Repo.insert!(%Member{
      company_id: company.id,
      name: Map.get(attrs, :name, "Member #{System.unique_integer([:positive])}"),
      role: Map.get(attrs, :role, "staff"),
      can_post_company_announcements: Map.get(attrs, :can_post_company_announcements, false),
      active: true
    })
  end

  def conversation_fixture(%Company{} = company, attrs \\ %{}) do
    Repo.insert!(%Conversation{
      company_id: company.id,
      kind: Map.get(attrs, :kind, "group"),
      name: Map.get(attrs, :name, "Test group")
    })
  end

  def membership_fixture(%Conversation{} = conversation, %Member{} = member) do
    Repo.insert!(%ConversationMember{
      conversation_id: conversation.id,
      member_id: member.id
    })
  end

  def message_fixture(%Conversation{} = conversation, %Member{} = author, attrs \\ %{}) do
    Repo.insert!(%Message{
      conversation_id: conversation.id,
      author_id: author.id,
      kind: "text",
      body: Map.get(attrs, :body, "hello")
    })
  end
end
