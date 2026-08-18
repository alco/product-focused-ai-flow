// Everything an open conversation/channel screen needs, live-queried from the
// collections: the conversation row, its roster joined against the directory,
// the message window in transcript order, and the reactions belonging to it
// (mirroring the S8/S9 per-conversation shape lifecycle).

import { useMemo } from 'react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import {
  conversationsCollection,
  directoryCollection,
  messagesCollection,
  reactionsCollection,
  rostersCollection,
} from '../db/collections'
import type { Member } from '../db/schema'

export function useConversation(chatId: string) {
  const { data: conversations, isReady } = useLiveQuery(
    (q) => q.from({ c: conversationsCollection }).where(({ c }) => eq(c.id, chatId)),
    [chatId],
  )
  const { data: roster } = useLiveQuery(
    (q) => q.from({ r: rostersCollection }).where(({ r }) => eq(r.conversation_id, chatId)),
    [chatId],
  )
  const { data: directory } = useLiveQuery((q) => q.from({ d: directoryCollection }))
  const { data: messages } = useLiveQuery(
    (q) =>
      q
        .from({ m: messagesCollection })
        .where(({ m }) => eq(m.conversation_id, chatId))
        .orderBy(({ m }) => m.inserted_at, 'asc'),
    [chatId],
  )
  const { data: allReactions } = useLiveQuery((q) => q.from({ x: reactionsCollection }))

  const membersById = useMemo(
    () => new Map<string, Member>(directory.map((m) => [m.id, m])),
    [directory],
  )

  // S9 scopes reactions per conversation through the messages subquery; the
  // client-side equivalent is filtering by the window's message ids.
  const reactions = useMemo(() => {
    const messageIds = new Set(messages.map((m) => m.id))
    return allReactions.filter((r) => messageIds.has(r.message_id))
  }, [allReactions, messages])

  /** Roster members resolved against the directory, managers first. */
  const rosterMembers = useMemo(
    () =>
      roster
        .map((r) => membersById.get(r.member_id))
        .filter((m): m is Member => m !== undefined)
        .sort((a, b) => {
          if (a.role !== b.role) return a.role === 'manager' ? -1 : 1
          return a.name.localeCompare(b.name)
        }),
    [roster, membersById],
  )

  return {
    conversation: conversations[0],
    isReady,
    roster,
    rosterMembers,
    membersById,
    messages,
    reactions,
  }
}
