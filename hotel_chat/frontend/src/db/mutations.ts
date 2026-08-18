// Optimistic write entry points for the messaging features. Each function
// applies the write to its TanStack DB collection first (instant UI), then
// the collection's mutation handler (db/collections.ts) persists it via the
// Phoenix API and returns the write's Postgres txid — TanStack DB drops the
// optimistic overlay exactly when Electric syncs that txid back.
//
// Rows are constructed here with client-generated uuids (the schema allows
// client-supplied ids precisely for this — data-model.md, decision 5) and a
// local `inserted_at` placeholder that the server-confirmed row replaces on
// sync.

import { createTransaction } from '@tanstack/react-db'
import { postJson } from './api'
import {
  conversationsCollection,
  membershipsCollection,
  messagesCollection,
  reactionsCollection,
} from './collections'
import { session } from './session'
import type { ConversationMember, Message } from './schema'

const uuid = () => crypto.randomUUID()
const nowIso = () => new Date().toISOString()

const messageRow = (conversationId: string, fields: Partial<Message>): Message => ({
  id: uuid(),
  conversation_id: conversationId,
  author_id: session.memberId,
  kind: 'text',
  body: null,
  title: null,
  post_emoji: null,
  reply_to_id: null,
  inserted_at: nowIso(),
  ...fields,
})

/** 1. Send a text message. */
export function sendMessage(conversationId: string, body: string): string {
  const row = messageRow(conversationId, { body })
  messagesCollection.insert(row)
  return row.id
}

/** 3. Reply to a message (same conversation, enforced server-side). */
export function replyToMessage(
  conversationId: string,
  replyToId: string,
  body: string,
): string {
  const row = messageRow(conversationId, { body, reply_to_id: replyToId })
  messagesCollection.insert(row)
  return row.id
}

/** 5. Post an announcement into a channel. */
export function postAnnouncement(
  conversationId: string,
  fields: { title: string; body: string; emoji?: string },
): string {
  const row = messageRow(conversationId, {
    title: fields.title,
    body: fields.body,
    post_emoji: fields.emoji ?? null,
  })
  messagesCollection.insert(row)
  return row.id
}

/** 2. React to a message with an emoji (one row per member per emoji). */
export function addReaction(messageId: string, emoji: string): string {
  const id = uuid()
  reactionsCollection.insert({
    id,
    message_id: messageId,
    member_id: session.memberId,
    emoji,
    inserted_at: nowIso(),
  })
  return id
}

/** 6. Advance my read cursor — call when the transcript is read to the bottom. */
export function markConversationRead(membership: ConversationMember): void {
  membershipsCollection.update(membership.id, (draft) => {
    draft.last_read_at = nowIso()
  })
}

/**
 * 4. Create a dm/group conversation.
 *
 * Uses an explicit transaction rather than a collection handler because the
 * API payload carries more than the conversation row (the member ids to
 * enrol); the server creates the conversation and all membership rows in one
 * Postgres transaction, so the single returned txid covers everything —
 * awaiting it on the conversations collection drops the optimistic row just
 * as the confirmed conversation (and its roster/membership rows) sync in.
 */
export function createConversation(opts: {
  kind: 'dm' | 'group'
  name?: string
  emoji?: string
  memberIds: string[]
}): { id: string; persisted: Promise<unknown> } {
  const id = uuid()

  const tx = createTransaction({
    mutationFn: async () => {
      const res = await postJson('/api/conversations', {
        id,
        kind: opts.kind,
        name: opts.name ?? null,
        emoji: opts.emoji ?? null,
        member_ids: opts.memberIds,
      })
      await conversationsCollection.utils.awaitTxId(res.txid)
    },
  })

  tx.mutate(() => {
    conversationsCollection.insert({
      id,
      company_id: session.companyId,
      kind: opts.kind,
      name: opts.kind === 'group' ? (opts.name ?? null) : null,
      emoji: opts.emoji ?? null,
      location_id: null,
      dm_key: null,
      created_by: session.memberId,
      archived_at: null,
      inserted_at: nowIso(),
    })
  })

  return { id, persisted: tx.isPersisted.promise }
}
