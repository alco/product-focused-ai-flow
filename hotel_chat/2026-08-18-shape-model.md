# Hotel Chat — Shape Model

**Date:** 2026-08-18 · **Stage:** brief 3 (`../2026-08-18-3-backend-arch-ai-brief.md`) Phase 2, part 2 of 2 · **Status:** awaiting review · **Companion:** `2026-08-18-data-model.md`

The read path is Electric shapes end to end: every screen renders from TanStack DB collections backed by shapes served at `/api/sync/*`; the custom API exists only for writes. This doc catalogs every shape each screen needs, then walks the catalog back against the schema to double-check the index requirements (the brief's stated purpose).

## Ground rules

- A shape = one table + a `WHERE` clause over **that table's own columns** (+ optional column list). No server-side joins.
- **TanStack DB live queries join across collections on the client**, so a screen that combines three tables is three raw-table shapes plus a client-side join — never a contorted shape or a display-composition column. Denormalization survives for exactly two jobs client joins can't do: letting the *server* scope which rows sync at all (`conversation_id` on reactions/attachments, `company_id` on `member_locations`), and keeping the message firehose out of standing shapes (`last_message_*`, `unread_count`) — data-model doc, decision 3.
- Shapes are exposed through the Phoenix router / `sync_render` controller, so `$me` (member id) and `$company` are injected server-side from the session — the client never sends them. This is also the authorization story: you can't ask for a shape the router won't build for you.
- Two lifecycles: **standing** shapes subscribe at app start and live for the session; **per-conversation** shapes are created when a chat is opened (and kept — WhatsApp-style local history accumulates).
- Electric streams inserts/updates/deletes continuously after the snapshot; "cost" below is about the snapshot query, which is what the indexes must serve.

## Shape catalog

| ID | Table | WHERE | Columns | Lifecycle |
|----|-------|-------|---------|-----------|
| **S1** `my_memberships` | conversation_members | `member_id = $me` | all | standing |
| **S2** `my_conversations` | conversations | `id IN ($conv_ids)` — the ids from S1 | all | standing, **rebuilt on membership change** (see note 1) |
| **S2b** `rosters` | conversation_members | `conversation_id IN ($conv_ids)` | conversation_id, member_id, added_by | standing, rebuilt with S2 (see notes 1, 2) |
| **S3** `directory` | members | `company_id = $company AND active = true` | id, company_id, name, job_title, role, active | standing |
| **S4** `member_locations` | member_locations | `company_id = $company` | all | standing |
| **S5** `locations` | locations | `company_id = $company` | id, company_id, name, city | standing |
| **S6** `my_settings` | member_settings | `member_id = $me` | all | standing |
| **S7** `my_schedule` | work_schedules | `member_id = $me` | all | standing |
| **S8** `messages:{c}` | messages | `conversation_id = $c` | all | per-conversation |
| **S9** `reactions:{c}` | message_reactions | `conversation_id = $c` | all | per-conversation |
| **S10** `attachments:{c}` | message_attachments | `conversation_id = $c` | all | per-conversation |

Deliberate non-shapes: **presence** (Phoenix Presence over a channel — ephemeral), **push_subscriptions** (server-side only), **invites** (pre-auth; the onboarding screen talks to the API), **companies** (the client learns its company name via S5/session bootstrap — a one-row shape isn't worth a subscription; revisit if company-level settings grow).

## Screens → shapes

| Screen (session-2 mockup) | Shapes used | What renders from what |
|---|---|---|
| `/mobile/chats` (chat list) + desktop sidebar | S1 + S2 + S2b + S3 | S2: name, kind, emoji, `last_message_at` (order), `last_message_preview`; author first name = `last_message_author_id` ⋈ S3. S1: favorite/muted flags, `unread_count` badges. DM titles = S2b ⋈ S3 minus me; group tile member counts = count over S2b (**note 2**). All of it one live query joining four collections. |
| `/mobile/chat-group`, `/mobile/chat-dm`, desktop conversation pane | S8 + S9 + S10 for the open `$c`; S3 for author names/avatars | transcript order = `inserted_at`; reply quotes resolve from the local S8 store; reactions aggregate client-side to `{emoji, count, mine}` |
| `/mobile/channel`, `/mobile/channel-manager` | same as conversation (channels are conversations); S8 rows carry `title`/`post_emoji` | audience line ("Everyone at Bankside · 34") = count over S2b for the channel |
| `/mobile/people` (directory) + new-chat picker | S3 + S4 + S5 | job title, role badge, location name per person |
| `/mobile/profile` | S3 (own row) + S6 + S7 + S1 | schedule card (S7), snooze (S6), muted-chats list (S1 filtered) |
| `/mobile/new-chat` | S3 (+ S4) | member picker; creation itself is an API write |
| `/mobile/onboarding` | — | pre-auth, API-only (invite lookup, OTP, profile) |
| Desktop members panel | S2b (rows for the open `$c`) ⋈ S3 | roster with names/titles — no per-conversation shape needed |

**Note 1 — the IN-lists.** Electric where-clauses are fixed per shape, so S2 and S2b are parameterized by the membership set from S1 and must be re-created when S1 gains or loses a row (join/leave/added-to-group). That's a cheap, rare event, and TanStack DB re-initializes the collections transparently. Someone *else* joining a conversation I'm already in is just a new row inside the existing S2b shape — no rebuild.

**Note 2 — S2b, the joins workhorse.** One standing shape over the full rosters of my conversations feeds, via client-side joins, everything an earlier draft solved with extra columns and per-conversation shapes: DM titles ("the member that isn't me" ⋈ S3), group tile member counts, channel audience lines, and the desktop members panel. Its column list — `conversation_id, member_id, added_by` only — is load-bearing: it keeps *other* members' private per-chat state (favorites, unread counts, read cursors, mutes) out of my sync stream; my own full row still arrives via S1.

## Index cross-check (the point of this exercise)

Every shape's snapshot query, against the indexes declared in the data-model doc:

| Shape | Snapshot query shape | Serving index | Verdict |
|---|---|---|---|
| S1 | `WHERE member_id = $me` | `conversation_members (member_id)` | ✅ declared |
| S2 | `WHERE id IN (…)` | PK | ✅ free |
| S2b | `WHERE conversation_id IN (…)` | unique `(conversation_id, member_id)` prefix | ✅ free |
| S3 | `WHERE company_id = $c AND active` | `members (company_id, active)` | ✅ declared |
| S4 | `WHERE company_id = $c` | `member_locations (company_id)` | ✅ declared — exists *only* because of this shape |
| S5 | `WHERE company_id = $c` | `locations (company_id)` | ✅ declared |
| S6 | `WHERE member_id = $me` | PK (member_id) | ✅ free |
| S7 | `WHERE member_id = $me` | unique `(member_id, weekday)` prefix | ✅ free |
| S8 | `WHERE conversation_id = $c` | `messages (conversation_id, inserted_at)` | ✅ declared; the composite also hands Electric rows in transcript order and serves future time-windowed clauses (`AND inserted_at > …`) without a new index |
| S9 | `WHERE conversation_id = $c` | `message_reactions (conversation_id)` | ✅ declared — exists only because of this shape (writes go by `message_id`) |
| S10 | `WHERE conversation_id = $c` | `message_attachments (conversation_id)` | ✅ declared, same reason |

Conclusion: **no missing indexes, and three indexes exist solely for shapes** (S4, S9, S10) — they'd be dead weight in a non-sync design and are called out as such in the data-model doc.

Write-path indexes are separate and already covered: `dm_key` partial unique (DM creation race), `(company_id, phone)` partials/lookups (login, invites), FK cascades.

## Volume sanity check

One location ≈ 34 staff, ~20 active conversations, low-hundreds of messages/day. Standing shapes are tiny (tens of rows). The heavy tail is S8 over a long-lived channel or group — months of history in one snapshot. Fine for the MVP; the pressure valve is already schema-compatible: a time-windowed where clause (`conversation_id = $c AND inserted_at > now() - interval '90 days'`) served by the same composite index, with older history behind an API-paginated "load earlier" (explicitly post-MVP).

## Unread & read-cursor flow (ties the two docs together)

1. Message insert (API write) → same transaction: bump `conversations.last_message_*`, increment `unread_count` for other members.
2. Electric fans out: S2 moves the chat's card up with the new preview; S1 delivers the new badge count. Chat list repaints with **zero queries**.
3. Member reads the chat → API write advances `last_read_at`, zeroes `unread_count` → S1 clears the badge on every one of their devices.
