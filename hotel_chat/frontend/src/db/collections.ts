// TanStack DB collections — one per shape in agent_artifacts/shape-model.md.
//
// Current stage: QueryCollections whose queryFn returns hard-coded fixture
// rows (no outgoing requests). Next stage: swap each queryCollectionOptions
// for electricCollectionOptions pointed at its `/api/sync/:shape` endpoint —
// the shape id each collection mirrors is noted below. Row types already match
// what Electric will deliver, so only this file (and the fixtures it imports)
// changes; every screen reads the collections through live queries.
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
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { QueryClient } from '@tanstack/query-core'
import * as fixtures from './fixtures'

// Fixture data is static: never stale, never refetched.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false },
  },
})

const fixtureCollection = <T extends object>(
  id: string,
  rows: T[],
  getKey: (row: T) => string,
) =>
  createCollection(
    queryCollectionOptions({
      id,
      queryKey: [id],
      queryFn: async () => rows,
      queryClient,
      getKey,
    }),
  )

/** S1 — my conversation_members rows: favorites, mutes, read cursors. */
export const membershipsCollection = fixtureCollection(
  'my_memberships',
  fixtures.myMembershipRows,
  (r) => r.id,
)

/** S2 — every conversation I'm a member of. */
export const conversationsCollection = fixtureCollection(
  'my_conversations',
  fixtures.conversationRows,
  (r) => r.id,
)

/** S2b — full rosters of my conversations (3-column projection). */
export const rostersCollection = fixtureCollection(
  'rosters',
  fixtures.rosterRows,
  (r) => `${r.conversation_id}:${r.member_id}`,
)

/** S3 — the company-wide member directory. */
export const directoryCollection = fixtureCollection(
  'directory',
  fixtures.memberRows,
  (r) => r.id,
)

/** S4 — member ↔ location assignments across the company. */
export const memberLocationsCollection = fixtureCollection(
  'member_locations',
  fixtures.memberLocationRows,
  (r) => `${r.member_id}:${r.location_id}`,
)

/** S5 — the company's locations. */
export const locationsCollection = fixtureCollection(
  'locations',
  fixtures.locationRows,
  (r) => r.id,
)

/** S6 — my private settings (snooze, language). */
export const settingsCollection = fixtureCollection(
  'my_settings',
  fixtures.settingsRows,
  (r) => r.member_id,
)

/** S7 — my work schedule (display-only). */
export const scheduleCollection = fixtureCollection(
  'my_schedule',
  fixtures.scheduleRows,
  (r) => r.id,
)

/** S8 — recent-message windows of my conversations (chat list + transcripts). */
export const messagesCollection = fixtureCollection(
  'messages',
  fixtures.messageRows,
  (r) => r.id,
)

/** S9 — per-member reaction rows; chips aggregate client-side. */
export const reactionsCollection = fixtureCollection(
  'reactions',
  fixtures.reactionRows,
  (r) => r.id,
)

/** S10 — message attachments (none in the fixtures yet). */
export const attachmentsCollection = fixtureCollection(
  'attachments',
  fixtures.attachmentRows,
  (r) => r.id,
)
