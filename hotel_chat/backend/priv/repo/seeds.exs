# Seed data mirroring hotel_chat/frontend/src/db/fixtures.ts — same cast,
# same conversations, same transcripts — so the backend serves exactly what
# the frontend currently mocks.
#
# Idempotent: every id is derived deterministically from a stable slug (sha256
# truncated to 16 bytes, loaded as a UUID), and every insert uses
# `on_conflict: :nothing` against that id (or natural composite key, for the
# join tables that don't have one). Re-running this script against a
# database that already has the seed data is a no-op.
#
# Run with `mix db.seed`.

alias HotelChat.Repo
alias HotelChat.Companies.{Company, Location}
alias HotelChat.Identity.{Member, MemberLocation, MemberSettings, WorkSchedule}
alias HotelChat.Conversations.{Conversation, ConversationMember, Message, MessageReaction}
alias HotelChat.Seeds.Id

id = &Id.uuid/1
company_id_of = fn -> id.("company:harbourlight") end
location_id_of = fn -> id.("location:bankside") end
member_id = fn slug -> id.("member:#{slug}") end
conversation_id = fn slug -> id.("conversation:#{slug}") end
message_id = fn slug -> id.("message:#{slug}") end

now = DateTime.utc_now() |> DateTime.truncate(:microsecond)

today_start =
  DateTime.utc_now()
  |> DateTime.to_date()
  |> DateTime.new!(~T[00:00:00], "Etc/UTC")

# DateTime.new!/DateTime.add don't raise their microsecond precision on their
# own; utc_datetime_usec requires precision 6 explicitly, hence the |micro|.
at = fn days_ago, hm ->
  [h, m] = hm |> String.split(":") |> Enum.map(&String.to_integer/1)
  dt = DateTime.add(today_start, -days_ago * 86_400 + h * 3600 + m * 60, :second)
  %{dt | microsecond: {elem(dt.microsecond, 0), 6}}
end

company_id = company_id_of.()
location_id = location_id_of.()

# --- Company & location -------------------------------------------------------

Repo.insert_all(
  Company,
  [%{id: company_id, name: "Harbourlight Hotels", inserted_at: now, updated_at: now}],
  on_conflict: :nothing,
  conflict_target: [:id]
)

Repo.insert_all(
  Location,
  [
    %{
      id: location_id,
      company_id: company_id,
      name: "Harbourlight Bankside",
      city: "London",
      timezone: "Europe/London",
      inserted_at: now,
      updated_at: now
    }
  ],
  on_conflict: :nothing,
  conflict_target: [:id]
)

# --- Members (cast) + member_locations -----------------------------------------

cast = [
  {"priya", "Priya Nair", "Front Desk", "staff"},
  {"daniel", "Daniel Okafor", "Duty Manager", "manager"},
  {"amira", "Amira Haddad", "Housekeeping", "staff"},
  {"tomasz", "Tomasz Zieliński", "Porter", "staff"},
  {"sofia", "Sofía Reyes", "F&B Supervisor", "manager"},
  {"marco", "Marco Bellini", "Chef de Partie", "staff"},
  {"grace", "Grace Adeyemi", "Housekeeping", "staff"},
  {"liam", "Liam O'Connor", "Night Reception", "staff"},
  {"yuki", "Yuki Tanaka", "Concierge", "staff"},
  {"elena", "Elena Petrova", "Housekeeping Lead", "manager"},
  {"jamal", "Jamal Carter", "Maintenance", "staff"},
  {"ines", "Inês Almeida", "Waiter", "staff"},
  {"stefan", "Stefan Weber", "Driver", "staff"},
  {"hannah", "Hannah Lewis", "Events Coordinator", "staff"},
  {"omar", "Omar Farouk", "Waiter", "staff"},
  {"kasia", "Kasia Nowak", "Front Desk", "staff"}
]

Repo.insert_all(
  Member,
  Enum.map(cast, fn {slug, name, job_title, role} ->
    %{
      id: member_id.(slug),
      company_id: company_id,
      name: name,
      job_title: job_title,
      role: role,
      can_post_company_announcements: role == "manager",
      active: true,
      inserted_at: now,
      updated_at: now
    }
  end),
  on_conflict: :nothing,
  conflict_target: [:id]
)

everyone = Enum.map(cast, fn {slug, _, _, _} -> slug end)

Repo.insert_all(
  MemberLocation,
  Enum.map(everyone, fn slug ->
    %{member_id: member_id.(slug), location_id: location_id, inserted_at: now, updated_at: now}
  end),
  on_conflict: :nothing,
  conflict_target: [:member_id, :location_id]
)

# --- Conversations ---------------------------------------------------------------

# DM member pair, canonically ordered — the DB enforces validity (CHECKs +
# composite FKs to conversation_members) and one-DM-per-pair (partial unique
# index); see the ReplaceDmKeyWithMemberPair migration.
dm_pair = fn a, b -> Enum.sort([member_id.(a), member_id.(b)]) end

group_conversations = [
  %{slug: "company-channel", kind: "company_channel", name: "Harbourlight Hotels"},
  %{
    slug: "location-channel",
    kind: "location_channel",
    name: "Bankside Announcements",
    location_id: location_id
  },
  %{slug: "housekeeping", kind: "group", name: "Housekeeping", emoji: "🧹"},
  %{
    slug: "wedding-ops",
    kind: "group",
    name: "Saturday Wedding — Ops",
    emoji: "💍",
    created_by: member_id.("hannah")
  },
  %{slug: "front-desk", kind: "group", name: "Front Desk", emoji: "🛎️"},
  %{slug: "fnb-crew", kind: "group", name: "F&B Crew", emoji: "🍽️"},
  %{slug: "night-shift", kind: "group", name: "Night Shift", emoji: "🌙"},
  %{slug: "maintenance", kind: "group", name: "Maintenance", emoji: "🔧"},
  %{slug: "reception-rota", kind: "group", name: "Reception Rota Swaps", emoji: "🔁"},
  %{slug: "fire-wardens", kind: "group", name: "Fire Wardens", emoji: "🧯"}
]

dm_conversations =
  Enum.map(~w(daniel amira yuki marco hannah stefan grace liam), fn other ->
    [a, b] = dm_pair.("priya", other)
    %{slug: "dm-#{other}", kind: "dm", name: nil, dm_member_a: a, dm_member_b: b}
  end)

conversations = group_conversations ++ dm_conversations

conversation_rows =
  Enum.map(conversations, fn c ->
    %{
      id: conversation_id.(c.slug),
      company_id: company_id,
      kind: c.kind,
      name: Map.get(c, :name),
      emoji: Map.get(c, :emoji),
      location_id: Map.get(c, :location_id),
      dm_member_a: Map.get(c, :dm_member_a),
      dm_member_b: Map.get(c, :dm_member_b),
      created_by: Map.get(c, :created_by),
      archived_at: nil,
      inserted_at: at.(45, "09:00"),
      updated_at: at.(45, "09:00")
    }
  end)

# --- Conversation members (rosters + my per-chat state) ---------------------------

roster_by_conversation = %{
  "company-channel" => everyone,
  "location-channel" => everyone,
  "housekeeping" => ~w(priya elena amira grace),
  "wedding-ops" => ~w(daniel hannah priya sofia marco tomasz ines omar jamal yuki kasia),
  "front-desk" => ~w(priya kasia daniel liam),
  "fnb-crew" => ~w(priya sofia marco ines omar),
  "night-shift" => ~w(priya liam tomasz daniel),
  "maintenance" => ~w(priya jamal daniel),
  "reception-rota" => ~w(priya kasia liam yuki daniel),
  "fire-wardens" => ~w(priya daniel elena jamal stefan),
  "dm-daniel" => ~w(priya daniel),
  "dm-amira" => ~w(priya amira),
  "dm-yuki" => ~w(priya yuki),
  "dm-marco" => ~w(priya marco),
  "dm-hannah" => ~w(priya hannah),
  "dm-stefan" => ~w(priya stefan),
  "dm-grace" => ~w(priya grace),
  "dm-liam" => ~w(priya liam)
}

# last_read_at cursors tuned so the derived unread badges light up the same
# chats the session-2 mockups highlighted (mirrors fixtures.ts myChatState).
my_chat_state = %{
  # birthday post still unread
  "location-channel" => %{last_read_at: at.(1, "20:00")},
  "housekeeping" => %{favorite: true, last_read_at: at.(0, "11:00")},
  # "cover the desk" unread
  "dm-daniel" => %{favorite: true, last_read_at: at.(0, "11:12")},
  # three messages unread
  "wedding-ops" => %{last_read_at: at.(0, "10:30")},
  "fnb-crew" => %{muted_forever: true, last_read_at: at.(0, "09:47")},
  "company-channel" => %{last_read_at: at.(3, "12:00")},
  "front-desk" => %{last_read_at: at.(0, "10:56")},
  "dm-amira" => %{last_read_at: at.(0, "10:31")},
  "dm-yuki" => %{last_read_at: at.(0, "09:12")},
  "night-shift" => %{last_read_at: at.(0, "06:58")},
  "maintenance" => %{last_read_at: at.(1, "15:12")},
  "dm-marco" => %{last_read_at: at.(1, "14:30")},
  "dm-hannah" => %{last_read_at: at.(1, "12:15")},
  "reception-rota" => %{last_read_at: at.(2, "13:40")},
  "dm-stefan" => %{last_read_at: at.(2, "09:05")},
  "fire-wardens" => %{last_read_at: at.(3, "11:20")},
  "dm-grace" => %{last_read_at: at.(3, "09:47")},
  "dm-liam" => %{last_read_at: at.(4, "21:10")}
}

conversation_member_rows =
  for {conv_slug, member_slugs} <- roster_by_conversation, member_slug <- member_slugs do
    added_by =
      if conv_slug == "wedding-ops" and member_slug == "tomasz",
        do: member_id.("daniel"),
        else: nil

    base = %{
      id: id.("cm:#{conv_slug}:#{member_slug}"),
      conversation_id: conversation_id.(conv_slug),
      member_id: member_id.(member_slug),
      favorite: false,
      muted_until: nil,
      muted_forever: false,
      last_read_at: nil,
      added_by: added_by,
      inserted_at: at.(45, "09:30"),
      updated_at: at.(45, "09:30")
    }

    overrides = if member_slug == "priya", do: Map.get(my_chat_state, conv_slug, %{}), else: %{}
    Map.merge(base, overrides)
  end

# The dm-pair composite FKs on conversations reference conversation_members
# and are DEFERRABLE INITIALLY DEFERRED — checked at COMMIT. Each insert_all
# commits its own implicit transaction, so on a fresh database the DM rows
# would fail the check before their membership rows exist: both inserts must
# share one transaction, mirroring the app's write path.
{:ok, _} =
  Repo.transaction(fn ->
    Repo.insert_all(Conversation, conversation_rows,
      on_conflict: :nothing,
      conflict_target: [:id]
    )

    Repo.insert_all(ConversationMember, conversation_member_rows,
      on_conflict: :nothing,
      conflict_target: [:id]
    )
  end)

# --- Messages ----------------------------------------------------------------

msg_defs =
  [
    # Group conversation: "Saturday Wedding — Ops" (full transcript).
    %{slug: "g1", conv: "wedding-ops", author: "hannah", days_ago: 1, hm: "16:02", body: "Team, final headcount for Saturday is 142. Ceremony at 3pm on the terrace, dinner in the ballroom from 6."},
    %{slug: "g2", conv: "wedding-ops", author: "sofia", days_ago: 1, hm: "16:05", body: "Kitchen briefing at 1pm. Marco is leading on the day."},
    %{slug: "g3", conv: "wedding-ops", author: "marco", days_ago: 1, hm: "16:11", body: "Menu is locked. Two veggie, one vegan table — flagged with the table plan."},
    %{slug: "g4", conv: "wedding-ops", author: "daniel", days_ago: 1, hm: "16:30", body: "Daniel added Tomasz Zieliński", extra: %{kind: "system"}},
    %{slug: "g5", conv: "wedding-ops", author: "daniel", days_ago: 1, hm: "16:31", body: "Tomasz will handle the gift table and guest luggage overflow."},
    %{slug: "g6", conv: "wedding-ops", author: "tomasz", days_ago: 1, hm: "16:34", body: "On it. Where are we storing the gifts overnight?"},
    %{slug: "g7", conv: "wedding-ops", author: "daniel", days_ago: 1, hm: "16:36", body: "Luggage room B — I will label a rack for it.", extra: %{reply_to_id: message_id.("g6")}},
    %{slug: "g8", conv: "wedding-ops", author: "ines", days_ago: 1, hm: "17:20", body: "What time should waiters be in?"},
    %{slug: "g9", conv: "wedding-ops", author: "sofia", days_ago: 1, hm: "17:24", body: "@Inês @Omar 12:30 in the ballroom, dressed and ready. We rehearse service order once before doors.", extra: %{reply_to_id: message_id.("g8")}},
    %{slug: "g10", conv: "wedding-ops", author: "hannah", days_ago: 0, hm: "08:55", body: "Morning all! Florist arrives 10am, band load-in at noon through the service entrance."},
    %{slug: "g11", conv: "wedding-ops", author: "jamal", days_ago: 0, hm: "09:12", body: "PA and lighting checked, spare mic batteries in the AV case."},
    %{slug: "g12", conv: "wedding-ops", author: "yuki", days_ago: 0, hm: "09:40", body: "Forecast says light rain around 2pm. Do we have a terrace fallback?"},
    %{slug: "g13", conv: "wedding-ops", author: "hannah", days_ago: 0, hm: "09:44", body: "Orangery is on standby, decision at 1pm. @Daniel you make the call.", extra: %{reply_to_id: message_id.("g12")}},
    %{slug: "g14", conv: "wedding-ops", author: "daniel", days_ago: 0, hm: "09:51", body: "Agreed — 1pm call. If we flip, porters move chairs first, flowers second."},
    %{slug: "g15", conv: "wedding-ops", author: "kasia", days_ago: 0, hm: "10:22", body: "Front desk briefed. We will hold non-wedding check-ins away from the lobby 2–4pm."},
    %{slug: "g16", conv: "wedding-ops", author: "marco", days_ago: 0, hm: "10:47", body: "Cake delivery just arrived, it is enormous. Fridge 2 cleared for it."},
    %{slug: "g17", conv: "wedding-ops", author: "omar", days_ago: 0, hm: "11:02", body: "Can someone share the final table plan?"},
    %{slug: "g18", conv: "wedding-ops", author: "hannah", days_ago: 0, hm: "11:38", body: "@Priya can you print the table plan before 2? Copies for the ballroom door and the kitchen pass.", extra: %{reply_to_id: message_id.("g17")}},
    %{slug: "g19", conv: "wedding-ops", author: "priya", days_ago: 0, hm: "11:41", body: "On it — printing four copies now, will drop them at the pass and the ballroom door by 1:30.", extra: %{reply_to_id: message_id.("g18")}},

    # 1:1 conversation: Priya <-> Daniel (full transcript).
    %{slug: "d1", conv: "dm-daniel", author: "daniel", days_ago: 1, hm: "18:12", body: "Priya, how did the group from the conference settle in?"},
    %{slug: "d2", conv: "dm-daniel", author: "priya", days_ago: 1, hm: "18:20", body: "All checked in by 6. Two room changes but nothing dramatic."},
    %{slug: "d3", conv: "dm-daniel", author: "daniel", days_ago: 1, hm: "18:21", body: "Nice work. Any feedback on the new key cards?"},
    %{slug: "d4", conv: "dm-daniel", author: "priya", days_ago: 1, hm: "18:25", body: "Much faster. One guest managed to demagnetise theirs with a phone case, classic."},
    %{slug: "d5", conv: "dm-daniel", author: "daniel", days_ago: 0, hm: "08:40", body: "Morning! Heads up — regional director visits Thursday."},
    %{slug: "d6", conv: "dm-daniel", author: "priya", days_ago: 0, hm: "08:47", body: "Noted. I will make sure the lobby display is updated."},
    %{slug: "d7", conv: "dm-daniel", author: "daniel", days_ago: 0, hm: "08:52", body: "Also, the wedding tomorrow — Hannah may need you for an hour around 2pm for the table plan printing."},
    %{slug: "d8", conv: "dm-daniel", author: "priya", days_ago: 0, hm: "08:55", body: "Already on my list 🙂"},
    %{slug: "d9", conv: "dm-daniel", author: "daniel", days_ago: 0, hm: "11:10", body: "One more thing — Kasia called in sick for the afternoon."},
    %{slug: "d10", conv: "dm-daniel", author: "daniel", days_ago: 0, hm: "11:15", body: "Can you cover the desk till 4? I owe you one"},

    # Announcement channel: "Bankside Announcements" — posts are messages with title/post_emoji set.
    %{slug: "a0a", conv: "location-channel", author: "daniel", days_ago: 5, hm: "10:15", body: "Please give a warm Bankside welcome to Inês Almeida and Omar Farouk, joining the F&B team this week. Say hi when you see them on the floor.", extra: %{title: "Welcome our new starters", post_emoji: "👋"}},
    %{slug: "a0b", conv: "location-channel", author: "sofia", days_ago: 4, hm: "16:40", body: "The new summer menu goes live in the brasserie on Monday. Tasting for all front-of-house staff on Sunday at 4pm — allergen sheets are in the shared folder.", extra: %{title: "Summer menu launches Monday", post_emoji: "🍽️"}},
    %{slug: "a1", conv: "location-channel", author: "daniel", days_ago: 1, hm: "14:05", body: "The quarterly fire drill moves from Tuesday to Thursday 10am so it does not clash with the conference checkout. Fire wardens, please confirm in your group.", extra: %{title: "Fire drill moved to Thursday", post_emoji: "🧯"}},
    %{slug: "a2", conv: "location-channel", author: "elena", days_ago: 1, hm: "17:30", body: "Housekeeping finished the full deep clean of floors 1–6 two days early. Guest satisfaction on cleanliness hit 4.9 this week. Incredible effort, team. 🧹", extra: %{title: "Deep clean week — thank you", post_emoji: "✨"}},
    %{slug: "a3", conv: "location-channel", author: "daniel", days_ago: 0, hm: "09:20", body: "Join us in the staff room at 3pm for cake — Marco made it himself, so expectations are officially high. Have a wonderful day, Amira!", extra: %{title: "Happy birthday, Amira! 🎂", post_emoji: "🎉"}},

    # The other conversations keep a one-message recent window — the old
    # chat-list preview lines as real rows (the company channel stays empty).
    %{slug: "p-housekeeping", conv: "housekeeping", author: "elena", days_ago: 0, hm: "11:42", body: "Floors 3–5 done, starting on the suites"},
    %{slug: "p-front-desk", conv: "front-desk", author: "kasia", days_ago: 0, hm: "10:56", body: "Room 412 asked for a late checkout, approved ✔"},
    %{slug: "p-dm-amira", conv: "dm-amira", author: "amira", days_ago: 0, hm: "10:31", body: "Thanks for swapping with me yesterday 🙏"},
    %{slug: "p-fnb-crew", conv: "fnb-crew", author: "sofia", days_ago: 0, hm: "09:47", body: "New allergen sheet is in the shared folder"},
    %{slug: "p-dm-yuki", conv: "dm-yuki", author: "yuki", days_ago: 0, hm: "09:12", body: "Guest in 208 loved the museum tip, nice one!"},
    %{slug: "p-night-shift", conv: "night-shift", author: "liam", days_ago: 0, hm: "06:58", body: "Quiet night. Handover notes on the desk"},
    %{slug: "p-maintenance", conv: "maintenance", author: "jamal", days_ago: 1, hm: "15:12", body: "Lift B back in service 👍"},
    %{slug: "p-dm-marco", conv: "dm-marco", author: "marco", days_ago: 1, hm: "14:30", body: "Staff meal today is lasagne, come early"},
    %{slug: "p-dm-hannah", conv: "dm-hannah", author: "hannah", days_ago: 1, hm: "12:15", body: "Sent you the AV checklist for the ballroom"},
    %{slug: "p-reception-rota", conv: "reception-rota", author: "priya", days_ago: 2, hm: "13:40", body: "Taking the Sunday early if nobody minds"},
    %{slug: "p-dm-stefan", conv: "dm-stefan", author: "stefan", days_ago: 2, hm: "09:05", body: "Airport pickup confirmed for 14:30"},
    %{slug: "p-fire-wardens", conv: "fire-wardens", author: "daniel", days_ago: 3, hm: "11:20", body: "Drill moved to Thursday morning"},
    %{slug: "p-dm-grace", conv: "dm-grace", author: "grace", days_ago: 3, hm: "09:47", body: "Found a phone in 305, gave it to lost & found"},
    %{slug: "p-dm-liam", conv: "dm-liam", author: "liam", days_ago: 4, hm: "21:10", body: "See you at handover"}
  ]

message_time = Map.new(msg_defs, fn d -> {d.slug, at.(d.days_ago, d.hm)} end)

message_rows =
  Enum.map(msg_defs, fn d ->
    ts = Map.fetch!(message_time, d.slug)

    Map.merge(
      %{
        id: message_id.(d.slug),
        conversation_id: conversation_id.(d.conv),
        author_id: member_id.(d.author),
        kind: "text",
        body: d.body,
        title: nil,
        post_emoji: nil,
        reply_to_id: nil,
        inserted_at: ts,
        updated_at: ts
      },
      Map.get(d, :extra, %{})
    )
  end)

Repo.insert_all(Message, message_rows, on_conflict: :nothing, conflict_target: [:id])

# --- Reactions -----------------------------------------------------------------
# One row per member per emoji (the unique key in the schema); the client
# aggregates at render time. Member pools come from each conversation's roster.

react = fn message_slug, emoji, member_slugs ->
  ts = Map.fetch!(message_time, message_slug)

  member_slugs
  |> Enum.with_index()
  |> Enum.map(fn {member_slug, i} ->
    %{
      id: id.("reaction:#{message_slug}:#{emoji}:#{i}"),
      message_id: message_id.(message_slug),
      member_id: member_id.(member_slug),
      emoji: emoji,
      inserted_at: ts
    }
  end)
end

# The full location roster minus the given ids — pools for channel-wide reactions.
bankside_except = fn exclude -> Enum.reject(everyone, &(&1 in exclude)) end

reaction_rows =
  [
    react.("g1", "👍", ~w(daniel sofia marco tomasz ines)),
    react.("g3", "🙌", ~w(sofia hannah)),
    react.("g7", "👍", ~w(tomasz)),
    react.("g9", "✔️", ~w(ines omar hannah)),
    react.("g10", "🌸", ~w(sofia yuki kasia ines)),
    react.("g10", "🎷", ~w(jamal omar)),
    react.("g11", "🔋", ~w(hannah)),
    react.("g13", "🤞", ~w(priya daniel yuki sofia marco kasia)),
    react.("g15", "👏", ~w(daniel hannah)),
    react.("g16", "🎂", ~w(priya hannah sofia daniel ines omar yuki kasia)),
    react.("g16", "😍", ~w(hannah tomasz jamal)),
    react.("g19", "🙌", ~w(hannah daniel)),
    react.("d4", "😂", ~w(daniel)),
    react.("d6", "👍", ~w(daniel)),
    react.("a0a", "👋", ["priya" | bankside_except.(~w(priya daniel)) |> Enum.slice(0, 12)]),
    react.("a0a", "❤️", ~w(elena sofia hannah yuki kasia grace)),
    react.("a0b", "😋", bankside_except.(~w(priya sofia)) |> Enum.slice(0, 11)),
    react.("a0b", "👍", bankside_except.(~w(priya sofia)) |> Enum.slice(3, 8)),
    react.("a1", "👍", bankside_except.(~w(priya daniel)) |> Enum.slice(0, 12)),
    react.("a2", "👏", ["priya" | bankside_except.(~w(priya elena)) |> Enum.slice(0, 13)]),
    react.("a2", "💚", bankside_except.(~w(priya elena)) |> Enum.slice(0, 9)),
    react.("a3", "🎂", ["priya" | bankside_except.(~w(priya daniel amira)) |> Enum.slice(0, 12)]),
    react.("a3", "❤️", bankside_except.(~w(priya daniel amira)) |> Enum.slice(0, 11)),
    react.("a3", "🥳", bankside_except.(~w(priya daniel amira)) |> Enum.slice(0, 7))
  ]
  |> List.flatten()

Repo.insert_all(MessageReaction, reaction_rows, on_conflict: :nothing, conflict_target: [:id])

# --- My settings + schedule (member_settings/work_schedules for priya) -----------

Repo.insert_all(
  MemberSettings,
  [
    %{
      member_id: member_id.("priya"),
      snoozed_until: nil,
      snooze_minutes: 30,
      language: "en",
      inserted_at: now,
      updated_at: now
    }
  ],
  on_conflict: :nothing,
  conflict_target: [:member_id]
)

Repo.insert_all(
  WorkSchedule,
  Enum.map(0..4, fn weekday ->
    %{
      id: id.("schedule:priya:#{weekday}"),
      member_id: member_id.("priya"),
      weekday: weekday,
      starts_at: ~T[07:00:00],
      ends_at: ~T[15:30:00],
      inserted_at: now,
      updated_at: now
    }
  end),
  on_conflict: :nothing,
  conflict_target: [:id]
)

IO.puts("""
Seeded:
  #{Repo.aggregate(Company, :count)} companies
  #{Repo.aggregate(Location, :count)} locations
  #{Repo.aggregate(Member, :count)} members
  #{Repo.aggregate(Conversation, :count)} conversations
  #{Repo.aggregate(ConversationMember, :count)} conversation_members
  #{Repo.aggregate(Message, :count)} messages
  #{Repo.aggregate(MessageReaction, :count)} message_reactions
""")
