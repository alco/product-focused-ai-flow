// TanStack DB collections — one per shape in agent_artifacts/shape-model.md,
// synced live from Postgres via Electric. Each collection points at
// `/api/sync/<shape>`, the authorizing proxy that resolves the shape name to
// a server-decided table/where/columns definition (HotelChat.Sync.Shapes)
// scoped to the current session ($me/$company) — see 3-backend-arch-ai-brief.md
// and the sync controller for the proxy mechanics.
//
// Row types (./schema) already match what each shape selects — a shape's
// column list is allowed to (and does, for several of these) select fewer
// columns than its table has; see the cross-check note in
// 6-backend-data-model-ai-brief.md. No `schema:` (zod) option is passed:
// electricCollectionOptions accepts an explicit type parameter instead, and
// this project has no runtime-validation need beyond what Ecto already
// enforces server-side.
//
// Postgres `timestamp` columns aren't auto-parsed by the Electric client (only
// `text`/`uuid`/`bool`/`int4`/`int8`/`jsonb` are) and arrive as
// "2026-08-17 16:02:00" — not the ISO-8601 strings the rest of the app
// assumes (comparisons in db/derive.ts rely on that format sorting
// correctly). `timestampParser` below normalizes the wire value to
// "2026-08-17T16:02:00Z" (the stored value is already UTC per Ecto
// convention) without changing its type — it's still a plain string.
//
//   S1  my_memberships   → membershipsCollection
//   S2  my_conversations → conversationsCollection
//   S2b rosters          → rostersCollection
//   S3  directory        → directoryCollection
//   S4  member_locations → memberLocationsCollection
//   S5  locations        → locationsCollection
//   S6  my_settings      → settingsCollection
//   S7  my_schedule      → scheduleCollection
//   S8  messages         → messagesCollection (one collection; per-conversation
//       windowed loading arrives with Electric's subset snapshots)
//   S9  reactions        → reactionsCollection
//   S10 attachments      → attachmentsCollection

import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import type { ElectricCollectionConfig } from '@tanstack/electric-db-collection'
import type { Row } from '@electric-sql/client'
import { postJson, txidOf } from './api'
import type {
  Conversation,
  ConversationMember,
  Location,
  Member,
  MemberLocation,
  MemberSettings,
  Message,
  MessageAttachment,
  MessageReaction,
  RosterEntry,
  WorkSchedule,
} from './schema'

const timestampParser = (value: string) => value.replace(' ', 'T') + 'Z'

const shapeCollection = <T extends Row<unknown>>(
  shape: string,
  getKey: (row: T) => string,
  withTimestamps = false,
  // Optimistic write-path handlers (onInsert/onUpdate): each one POSTs to
  // the Phoenix API and returns the write's Postgres txid, so TanStack DB
  // drops the optimistic overlay exactly when the write syncs back through
  // Electric (the txid contract — see db/api.ts).
  handlers: Pick<ElectricCollectionConfig<T>, 'onInsert' | 'onUpdate' | 'onDelete'> = {},
) =>
  createCollection(
    electricCollectionOptions<T>({
      id: shape,
      shapeOptions: {
        // Must be absolute: ShapeStream builds its fetch URL via `new
        // URL(url)` with no base, which throws (as a swallowed rejected
        // promise — no visible error, just zero requests) on a relative
        // path, unlike fetch() itself which resolves relative URLs fine.
        url: new URL(`/api/sync/${shape}`, window.location.origin).toString(),
        parser: withTimestamps ? { timestamp: timestampParser } : undefined,
      },
      getKey,
      ...handlers,
    }),
  )

/** S1 — my conversation_members rows: favorites, mutes, read cursors. */
export const membershipsCollection = shapeCollection<ConversationMember>(
  'my_memberships',
  (r) => r.id,
  true,
  {
    // The only membership update the client makes today is advancing its
    // read cursor (db/mutations.ts markConversationRead).
    onUpdate: async ({ transaction }) => {
      const txids = await Promise.all(
        transaction.mutations.map(async (m) => {
          if (!('last_read_at' in m.changes)) {
            throw new Error('only read-cursor updates are supported')
          }
          const res = await postJson(
            `/api/conversations/${m.modified.conversation_id}/read`,
            {},
          )
          return txidOf(res)
        }),
      )
      return { txid: txids }
    },
  },
)

/** S2 — every conversation I'm a member of. */
export const conversationsCollection = shapeCollection<Conversation>(
  'my_conversations',
  (r) => r.id,
  true,
)

/** S2b — full rosters of my conversations (3-column projection). */
export const rostersCollection = shapeCollection<RosterEntry>(
  'rosters',
  (r) => `${r.conversation_id}:${r.member_id}`,
)

/** S3 — the company-wide member directory. */
export const directoryCollection = shapeCollection<Member>('directory', (r) => r.id)

/** S4 — member ↔ location assignments across the company. */
export const memberLocationsCollection = shapeCollection<MemberLocation>(
  'member_locations',
  (r) => `${r.member_id}:${r.location_id}`,
)

/** S5 — the company's locations. */
export const locationsCollection = shapeCollection<Location>('locations', (r) => r.id)

/** S6 — my private settings (snooze, language). */
export const settingsCollection = shapeCollection<MemberSettings>(
  'my_settings',
  (r) => r.member_id,
  true,
)

/** S7 — my work schedule (display-only). */
export const scheduleCollection = shapeCollection<WorkSchedule>('my_schedule', (r) => r.id)

/** S8 — recent-message windows of my conversations (chat list + transcripts). */
export const messagesCollection = shapeCollection<Message>('messages', (r) => r.id, true, {
  // One insert handler covers the three message-shaped writes — plain
  // message, reply, announcement — routed to their separate endpoints by
  // the shape of the row (db/mutations.ts constructs them).
  onInsert: async ({ transaction }) => {
    const txids = await Promise.all(
      transaction.mutations.map(async (m) => {
        const row = m.modified
        const res =
          row.title !== null || row.post_emoji !== null
            ? await postJson(`/api/conversations/${row.conversation_id}/announcements`, {
                id: row.id,
                title: row.title,
                body: row.body,
                post_emoji: row.post_emoji,
              })
            : row.reply_to_id !== null
              ? await postJson(`/api/messages/${row.reply_to_id}/replies`, {
                  id: row.id,
                  body: row.body,
                })
              : await postJson(`/api/conversations/${row.conversation_id}/messages`, {
                  id: row.id,
                  body: row.body,
                })
        return txidOf(res)
      }),
    )
    return { txid: txids }
  },
})

/** S9 — per-member reaction rows; chips aggregate client-side. */
export const reactionsCollection = shapeCollection<MessageReaction>(
  'reactions',
  (r) => r.id,
  true,
  {
    onInsert: async ({ transaction }) => {
      const txids = await Promise.all(
        transaction.mutations.map(async (m) => {
          const res = await postJson(`/api/messages/${m.modified.message_id}/reactions`, {
            id: m.modified.id,
            emoji: m.modified.emoji,
          })
          return txidOf(res)
        }),
      )
      return { txid: txids }
    },
  },
)

/** S10 — message attachments. */
export const attachmentsCollection = shapeCollection<MessageAttachment>(
  'attachments',
  (r) => r.id,
)
