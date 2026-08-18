// Row types for the TanStack DB collections, mirroring the table schema in
// agent_artifacts/data-model.md column for column (snake_case, ISO-8601
// timestamptz strings) — exactly what Electric will deliver once the
// collections switch from hard-coded fixtures to /api/sync/* shapes.
//
// Types only carry the columns their shape syncs (agent_artifacts/shape-model.md):
// e.g. Member has no phone/settings (the directory shape S3 excludes them) and
// RosterEntry is the three-column projection the rosters shape S2b exposes.

export type ConversationKind = 'dm' | 'group' | 'location_channel' | 'company_channel'
export type MemberRole = 'manager' | 'staff'

/** S3 `directory` — members, company-wide, S3's column subset. */
export interface Member {
  id: string
  company_id: string
  name: string
  job_title: string | null
  role: MemberRole
  active: boolean
}

/** S5 `locations`. */
export interface Location {
  id: string
  company_id: string
  name: string
  city: string | null
}

/** S4 `member_locations`. */
export interface MemberLocation {
  member_id: string
  location_id: string
}

/** S2 `my_conversations`. */
export interface Conversation {
  id: string
  company_id: string
  kind: ConversationKind
  /** null for DMs — the client derives the counterpart's name from roster ⋈ directory. */
  name: string | null
  emoji: string | null
  location_id: string | null
  dm_key: string | null
  created_by: string | null
  archived_at: string | null
  inserted_at: string
}

/** S1 `my_memberships` — my conversation_members rows, all per-chat state. */
export interface ConversationMember {
  id: string
  conversation_id: string
  member_id: string
  favorite: boolean
  muted_until: string | null
  muted_forever: boolean
  last_read_at: string | null
  added_by: string | null
  inserted_at: string
}

/** S2b `rosters` — conversation_members of my conversations, 3-column projection. */
export interface RosterEntry {
  conversation_id: string
  member_id: string
  added_by: string | null
}

/** S8 `messages` — announcement posts are messages with title/post_emoji set. */
export interface Message {
  id: string
  conversation_id: string
  author_id: string
  kind: 'text' | 'system'
  body: string | null
  title: string | null
  post_emoji: string | null
  reply_to_id: string | null
  inserted_at: string
}

/** S9 `message_reactions` — one row per member per emoji; the client aggregates. */
export interface MessageReaction {
  id: string
  message_id: string
  member_id: string
  emoji: string
  inserted_at: string
}

/** S10 `message_attachments`. */
export interface MessageAttachment {
  id: string
  message_id: string
  kind: 'image' | 'file'
  url: string
  file_name: string | null
  content_type: string
}

/** S6 `my_settings` — private per-member state, never in the directory shape. */
export interface MemberSettings {
  member_id: string
  snoozed_until: string | null
  snooze_minutes: number
  language: string
}

/** S7 `my_schedule` — display-only, feeds the push working-hours gate. */
export interface WorkSchedule {
  id: string
  member_id: string
  /** 0=Mon … 6=Sun */
  weekday: number
  /** local time "HH:MM" (Postgres time renders "HH:MM:SS"; both accepted) */
  starts_at: string
  ends_at: string
}
