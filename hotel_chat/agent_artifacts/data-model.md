# Hotel Chat — Data Model

**Date:** 2026-08-18 · **Stage:** brief 3 (`../../3-backend-arch-ai-brief.md`) Phase 2, part 1 of 2 · **Status:** awaiting review — no migrations written yet · **Companion:** `shape-model.md`

Inputs: the session-1 entity decisions (`../agent_sessions/session-1-summary.md` §2–3) and the session-2 screens' actual data needs (`../frontend/src/mock/*.ts`). Where Electric's shape mechanics forced a schema choice, the table notes say so and the companion shape doc carries the cross-check.

## Conventions

- **Primary keys:** `uuid`, server default `gen_random_uuid()`, but clients MAY supply the id — required for optimistic writes from TanStack DB (messages, reactions). Ordering never relies on id; `inserted_at` orders.
- **Timestamps:** `timestamptz`, `inserted_at`/`updated_at` on every table (Ecto `timestamps(type: :utc_datetime_usec)`).
- **Multi-tenancy:** `company_id` on every root table from day one (session-1 R3). Child/join tables never duplicate it — shape where-clauses reach across tables with subqueries (shape doc, ground rules).
- **Enums:** `text` + `CHECK` constraints, not Postgres enum types (cheaper migrations).
- **Soft delete:** only where session 1 called for it (messages). Everything else deletes hard or archives.
- **Identity-module boundary (session-1 R2):** tables marked **[IDENTITY — THROWAWAY]** belong to the mock identity system and will be replaced by the production identity ecosystem. Nothing outside the boundary may FK into their *internals*; `members.id` is the one stable handle.

## Entity overview

```
companies ─┬─ locations ──────────┐
           │                      ├─ member_locations (m2m)
           ├─ members ────────────┘
           │    ├─ member_settings   (1:1, private)
           │    ├─ work_schedules    (per weekday)        [IDENTITY]
           │    └─ push_subscriptions
           ├─ invites                                     [IDENTITY]
           └─ conversations ─┬─ conversation_members (m2m + per-member chat state)
                             └─ messages ─┬─ message_reactions
                                          └─ message_attachments
```

Presence (online dots) is deliberately **not** a table — it's ephemeral state served by Phoenix Presence over a channel, not synced through Electric.

---

## companies

| column                   | type        | null | default           | notes |
| ------------------------ | ----------- | ---- | ----------------- | ----- |
| id                       | uuid        | no   | gen_random_uuid() | PK    |
| name                     | text        | no   |                   |       |
| inserted_at / updated_at | timestamptz | no   |                   |       |

Provisioned manually (session-1 R3). No indexes beyond the PK.

## locations

| column                   | type        | null | default           | notes                                                                                      |
| ------------------------ | ----------- | ---- | ----------------- | ------------------------------------------------------------------------------------------ |
| id                       | uuid        | no   | gen_random_uuid() | PK                                                                                         |
| company_id               | uuid        | no   |                   | FK → companies                                                                             |
| name                     | text        | no   |                   | "Harbourlight Bankside"                                                                    |
| city                     | text        | yes  |                   |                                                                                            |
| timezone                 | text        | no   |                   | IANA name; working-hours gate is evaluated in location time (session-1 R8 / open thread 3) |
| inserted_at / updated_at | timestamptz | no   |                   |                                                                                            |

**Indexes:** `(company_id)`.

## members  [IDENTITY — THROWAWAY, except `id`]

| column                         | type        | null | default           | notes                                                                     |
| ------------------------------ | ----------- | ---- | ----------------- | ------------------------------------------------------------------------- |
| id                             | uuid        | no   | gen_random_uuid() | PK — the stable handle the rest of the schema FKs to                      |
| company_id                     | uuid        | no   |                   | FK → companies                                                            |
| phone                          | text        | yes  |                   | E.164; null after PII scrub. Rehire = lookup by phone (session-1 R10)     |
| name                           | text        | no   |                   | overwritten to a neutral placeholder on scrub                             |
| job_title                      | text        | yes  |                   | shown in directory + chat headers                                         |
| role                           | text        | no   | 'staff'           | CHECK in ('manager','staff')                                              |
| can_post_company_announcements | boolean     | no   | false             | session-1 R4                                                              |
| active                         | boolean     | no   | true              | offboarding: set false = immediate revocation; row and messages preserved |
| scrubbed_at                    | timestamptz | yes  |                   | PII-erasure marker (GDPR path)                                            |
| inserted_at / updated_at       | timestamptz | no   |                   |                                                                           |

**Indexes:** `(company_id, active)` (directory shape); **partial unique** `(company_id, phone) WHERE phone IS NOT NULL` (login + rehire lookup).

**Scrub contract:** erasing PII = null `phone`, neutralize `name`/`job_title`, set `scrubbed_at`; the row itself survives so message attribution and FKs never break (session-1 R10).

## member_locations

| column                   | type        | null | default | notes                             |
| ------------------------ | ----------- | ---- | ------- | --------------------------------- |
| member_id                | uuid        | no   |         | FK → members, ON DELETE CASCADE   |
| location_id              | uuid        | no   |         | FK → locations, ON DELETE CASCADE |
| inserted_at / updated_at | timestamptz | no   |         |                                   |

**PK:** `(member_id, location_id)`. **Indexes:** `(location_id)` (roster of a location → channel audience). Tenant scoping in shapes goes through a subquery on `members` (shape doc, S4).

Many-to-many per session-1 R3 (floating staff, multi-site managers). No `primary` flag yet — which location's timezone governs a multi-location member's push window is session-1 open thread 3; MVP evaluates against *any* of their locations' hours (generous-delivery bias) and the doc flags it for review.

## member_settings

Per-member private state — split from `members` so the company-wide directory shape never carries it (the directory syncs `members` to everyone; snooze/language are nobody else's business).

| column                   | type        | null | default | notes                                                   |
| ------------------------ | ----------- | ---- | ------- | ------------------------------------------------------- |
| member_id                | uuid        | no   |         | PK, FK → members ON DELETE CASCADE                      |
| snoozed_until            | timestamptz | yes  |         | one-tap snooze, auto-expiry by timestamp (session-1 R8) |
| snooze_minutes           | int         | no   | 30      | configurable default duration                           |
| language                 | text        | no   | 'en'    | profile screen                                          |
| inserted_at / updated_at | timestamptz | no   |         |                                                         |

## work_schedules  [IDENTITY — THROWAWAY]

Display-only in the app; feeds the push working-hours gate. Seeded with mock data (session-1 R8).

| column                   | type        | null | default           | notes                               |
| ------------------------ | ----------- | ---- | ----------------- | ----------------------------------- |
| id                       | uuid        | no   | gen_random_uuid() | PK                                  |
| member_id                | uuid        | no   |                   | FK → members ON DELETE CASCADE      |
| weekday                  | int2        | no   |                   | 0=Mon … 6=Sun                       |
| starts_at                | time        | no   |                   | local time at the member's location |
| ends_at                  | time        | no   |                   |                                     |
| inserted_at / updated_at | timestamptz | no   |                   |                                     |

**Indexes:** unique `(member_id, weekday)` (one shift per day is enough for the MVP).

## invites  [IDENTITY — THROWAWAY]

Manager-issued invite + OTP login in one table (onboarding screen: invite → OTP → profile).

| column                   | type        | null | default           | notes                                                  |
| ------------------------ | ----------- | ---- | ----------------- | ------------------------------------------------------ |
| id                       | uuid        | no   | gen_random_uuid() | PK                                                     |
| company_id               | uuid        | no   |                   | FK → companies                                         |
| phone                    | text        | no   |                   | E.164                                                  |
| name                     | text        | yes  |                   | prefill for the profile step                           |
| job_title                | text        | yes  |                   |                                                        |
| role                     | text        | no   | 'staff'           | CHECK in ('manager','staff')                           |
| location_id              | uuid        | no   |                   | FK → locations — the location the invite lands them in |
| invited_by               | uuid        | no   |                   | FK → members                                           |
| otp_hash                 | text        | yes  |                   | hash of the current OTP; null when none pending        |
| otp_expires_at           | timestamptz | yes  |                   |                                                        |
| accepted_member_id       | uuid        | yes  |                   | FK → members; set when redeemed                        |
| inserted_at / updated_at | timestamptz | no   |                   |                                                        |

**Indexes:** `(company_id, phone)` (lookup on OTP entry; also dedupe pending invites app-side).

## conversations

One table for all four kinds (session-1 R4): `dm`, `group`, `location_channel`, `company_channel`.

| column                   | type        | null | default           | notes                                                                                                                        |
| ------------------------ | ----------- | ---- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| id                       | uuid        | no   | gen_random_uuid() | PK                                                                                                                           |
| company_id               | uuid        | no   |                   | FK → companies                                                                                                               |
| kind                     | text        | no   |                   | CHECK in ('dm','group','location_channel','company_channel')                                                                 |
| name                     | text        | yes  |                   | null for DMs — the client derives the counterpart's name by joining the roster and directory collections (shape doc, note 2) |
| emoji                    | text        | yes  |                   | group tile identity (mockups' `groupEmoji`)                                                                                  |
| location_id              | uuid        | yes  |                   | FK → locations; set iff kind='location_channel'                                                                              |
| dm_key                   | text        | yes  |                   | canonical `least(member_a,member_b)‖':'‖greatest(...)`; the DM-uniqueness key                                                |
| created_by               | uuid        | yes  |                   | FK → members                                                                                                                 |
| archived_at              | timestamptz | yes  |                   | manager archive (session-1 R4); archived chats drop out of lists client-side                                                 |
| inserted_at / updated_at | timestamptz | no   |                   |                                                                                                                              |

**Indexes:** `(company_id)`; **partial unique** `(company_id, dm_key) WHERE kind = 'dm'` (one DM per pair, race-proof); partial `(company_id, kind) WHERE kind IN ('location_channel','company_channel')` (channel auto-provisioning checks).

No `last_message_*` columns: the chat list derives previews, ordering and unread badges from the recent-messages window each conversation syncs anyway (shape doc, S8 + §"Chat list"). Message inserts touch exactly one row.

## conversation_members

Membership **plus all per-member-per-chat state** — favorite, mute, read cursor. ⑂ This deliberately absorbs session-1's separate `MuteState` entity: every one of these fields has the same PK `(conversation, member)` and the same consumer (the chat list), so one row serves them all — and one shape (`member_id = $me`) syncs all of it.

| column                   | type        | null | default           | notes                                                                                                                            |
| ------------------------ | ----------- | ---- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| id                       | uuid        | no   | gen_random_uuid() | PK                                                                                                                               |
| conversation_id          | uuid        | no   |                   | FK → conversations ON DELETE CASCADE                                                                                             |
| member_id                | uuid        | no   |                   | FK → members                                                                                                                     |
| favorite                 | boolean     | no   | false             | ⭐ section                                                                                                                       |
| muted_until              | timestamptz | yes  |                   | 1 hr / 1 day mute; `infinity` not used — see next                                                                                |
| muted_forever            | boolean     | no   | false             | "always" mute; channels are never mutable (enforced in the write path, session-1 R8)                                             |
| last_read_at             | timestamptz | yes  |                   | read cursor; unread badges are derived client-side (messages newer than this in the synced window, capped — shape doc §"Unread") |
| added_by                 | uuid        | yes  |                   | FK → members; feeds "Daniel added Tomasz" system lines                                                                           |
| inserted_at / updated_at | timestamptz | no   |                   |                                                                                                                                  |

**Indexes:** unique `(conversation_id, member_id)`; `(member_id)` (the my-chat-list shape and every membership subquery).

## messages

| column                                 | type                      | null | default           | notes                                                                                                   |
| -------------------------------------- | ------------------------- | ---- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| id                                     | uuid                      | no   | gen_random_uuid() | PK; client-generated (UUIDv7 recommended) for optimistic sends                                          |
| conversation_id                        | uuid                      | no   |                   | FK → conversations ON DELETE CASCADE                                                                    |
| author_id                              | uuid                      | no   |                   | FK → members; survives offboarding/scrub (attribution preserved)                                        |
| kind                                   | text                      | no   | 'text'            | CHECK in ('text','system'); system = centered membership/rename lines                                   |
| body                                   | text                      | yes  |                   | null allowed for attachment-only messages                                                               |
| title                                  | text                      | yes  |                   | ⑂ announcement posts are just messages: channels' bulletin cards carry `title`…                         |
| post_emoji                             | text                      | yes  |                   | …and a decorative emoji (mockups' `AnnouncementPost`); both null in ordinary chat                       |
| reply_to_id                            | uuid                      | yes  |                   | FK → messages; same-conversation rule enforced in the write path                                        |
| deleted_at / deleted_by / deleted_kind | timestamptz / uuid / text | yes  |                   | soft-delete columns ahead of the feature (session-1 R5); `deleted_kind` CHECK in ('author','moderator') |
| inserted_at / updated_at               | timestamptz               | no   |                   | `inserted_at` is the transcript order key                                                               |

**Indexes:** `(conversation_id, inserted_at)` — serves both the per-conversation shape snapshot and any history pagination; `(reply_to_id)` is **not** indexed (quotes resolve from the client's local store, never by DB lookup); `(author_id)` left unindexed for MVP (no per-author query anywhere; add when moderation tooling needs it).

@mentions stay **in the text** (`@Priya`); the write path parses them for push targeting. No mentions table until a "mentions of me" view exists.

## message_attachments

| column                   | type        | null | default           | notes                                                                               |
| ------------------------ | ----------- | ---- | ----------------- | ----------------------------------------------------------------------------------- |
| id                       | uuid        | no   | gen_random_uuid() | PK                                                                                  |
| message_id               | uuid        | no   |                   | FK → messages ON DELETE CASCADE                                                     |
| kind                     | text        | no   |                   | CHECK in ('image','file')                                                           |
| object_key               | text        | no   |                   | S3 key                                                                              |
| url                      | text        | no   |                   | unguessable public URL (session-1 R9 access model; ⚠ 1-day retention caveat stands) |
| file_name                | text        | yes  |                   |                                                                                     |
| content_type             | text        | no   |                   | allowlist enforced at presign time                                                  |
| byte_size                | int8        | no   |                   | ≤ 25 MB files, ~10 MB downscaled photos                                             |
| width / height           | int4        | yes  |                   | images only                                                                         |
| inserted_at / updated_at | timestamptz | no   |                   |                                                                                     |

**Indexes:** `(message_id)` — also serves the shape's `message_id IN (subquery)` filter.

## message_reactions

One row per member per emoji per message; the client aggregates to `{emoji, count, mine}`.

| column      | type        | null | default           | notes                                    |
| ----------- | ----------- | ---- | ----------------- | ---------------------------------------- |
| id          | uuid        | no   | gen_random_uuid() | PK; client-generated for optimistic taps |
| message_id  | uuid        | no   |                   | FK → messages ON DELETE CASCADE          |
| member_id   | uuid        | no   |                   | FK → members                             |
| emoji       | text        | no   |                   |                                          |
| inserted_at | timestamptz | no   |                   |                                          |

**Indexes:** unique `(message_id, member_id, emoji)` — its prefix also serves the shape's `message_id IN (subquery)` filter.

No `conversation_id` on attachments or reactions: shapes scope them per conversation with a subquery through `messages` (shape doc, S9/S10).

## push_subscriptions

| column                   | type        | null | default           | notes                          |
| ------------------------ | ----------- | ---- | ----------------- | ------------------------------ |
| id                       | uuid        | no   | gen_random_uuid() | PK                             |
| member_id                | uuid        | no   |                   | FK → members ON DELETE CASCADE |
| endpoint                 | text        | no   |                   | unique                         |
| keys                     | jsonb       | no   |                   | p256dh + auth                  |
| user_agent               | text        | yes  |                   |                                |
| inserted_at / updated_at | timestamptz | no   |                   |                                |

**Indexes:** unique `(endpoint)`; `(member_id)`. Never synced — the push scheduler reads it server-side.

---

## Decisions & forks in this design

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ⑂ `MuteState` (session 1) folded into `conversation_members` — same key, same consumer, one shape instead of two.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2   | ⑂ Announcement posts are `messages` rows with `title`/`post_emoji`, not a separate table — channels are conversations (session-1 R4), and reactions/attachments/shapes work identically for free.                                                                                                                                                                                                                                                                                                                                   |
| 3   | ⑂⑂ **Zero denormalized columns** — the schema is fully normalized (two rounds of review feedback). Display composition: TanStack DB live queries join collections client-side. Server-side row scoping: shape where-clauses use subqueries across tables (GA on the Electric service the backend now runs). Message volume: subset snapshots sync a recent window per conversation instead of full history, so no `last_message_*`/`unread_count` shortcuts are needed. Earlier drafts had five denormalized columns; all are gone. |
| 4   | `member_settings` split from `members` so private state (snooze, language) never rides the company-wide directory shape.                                                                                                                                                                                                                                                                                                                                                                                                            |
| 5   | uuid PKs everywhere, client-suppliable — TanStack DB optimistic writes need client-generated ids; `inserted_at` (not id) orders transcripts.                                                                                                                                                                                                                                                                                                                                                                                        |
| 6   | `dm_key` + partial unique index = race-proof one-DM-per-pair without a junction lookup.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 7   | Identity boundary honored: `members`/`work_schedules`/`invites` are flagged throwaway; only `members.id` leaks across the boundary (session-1 R2).                                                                                                                                                                                                                                                                                                                                                                                  |

## Deliberately out (until their feature lands)

Read receipts, typing indicators, message editing, forwarding/pinning, departments, emergency broadcast (all session-1 backlog); voice messages (backlog — `message_attachments.kind` gains `'voice'` when it comes); auth/session tables (Phase 3 decides token storage); media retention job (⚠ session-1 R9 caveat unresolved by design).
