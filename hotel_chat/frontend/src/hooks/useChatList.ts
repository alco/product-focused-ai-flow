// Chat-list view model: joins the memberships, conversations, rosters,
// directory and messages collections into the three stacked sections the chat
// list renders (shape-model.md §"Chat list" — previews, ordering and unread
// badges all derive from the synced recent-message windows).

import { useMemo } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import {
  conversationsCollection,
  directoryCollection,
  membershipsCollection,
  messagesCollection,
  rostersCollection,
} from '../db/collections'
import { conversationTitle, isMuted, unreadCount } from '../db/derive'
import { session } from '../db/session'
import type { ConversationKind, Message } from '../db/schema'
import { chatListTime } from '../lib/time'

export interface ChatListItem {
  id: string
  kind: ConversationKind
  title: string
  emoji: string | null
  isDm: boolean
  favorite: boolean
  muted: boolean
  unread: number
  preview: { prefix: string | null; text: string } | null
  timeLabel: string | null
  /** ISO timestamp of the latest activity — the recency sort key. */
  lastActivity: string
}

export interface ChatListSections {
  official: ChatListItem[]
  favorites: ChatListItem[]
  rest: ChatListItem[]
}

const previewText = (m: Message): string => m.title ?? m.body ?? ''

const byRecency = (a: ChatListItem, b: ChatListItem) =>
  b.lastActivity.localeCompare(a.lastActivity)

export function useChatList(): ChatListSections {
  const { data: memberships } = useLiveQuery((q) => q.from({ m: membershipsCollection }))
  const { data: conversations } = useLiveQuery((q) => q.from({ c: conversationsCollection }))
  const { data: roster } = useLiveQuery((q) => q.from({ r: rostersCollection }))
  const { data: members } = useLiveQuery((q) => q.from({ d: directoryCollection }))
  const { data: messages } = useLiveQuery((q) => q.from({ msg: messagesCollection }))

  return useMemo(() => {
    const conversationById = new Map(conversations.map((c) => [c.id, c]))
    const membersById = new Map(members.map((m) => [m.id, m]))

    const messagesByConversation = new Map<string, Message[]>()
    for (const m of messages) {
      let list = messagesByConversation.get(m.conversation_id)
      if (!list) messagesByConversation.set(m.conversation_id, (list = []))
      list.push(m)
    }
    const rosterByConversation = new Map<string, typeof roster>()
    for (const r of roster) {
      let list = rosterByConversation.get(r.conversation_id)
      if (!list) rosterByConversation.set(r.conversation_id, (list = []))
      list.push(r)
    }

    const items: ChatListItem[] = []
    for (const membership of memberships) {
      const conversation = conversationById.get(membership.conversation_id)
      if (!conversation || conversation.archived_at) continue

      const window = (messagesByConversation.get(conversation.id) ?? [])
        .slice()
        .sort((a, b) => a.inserted_at.localeCompare(b.inserted_at))
      const last = window[window.length - 1]

      let prefix: string | null = null
      if (last && last.kind === 'text') {
        if (last.author_id === session.memberId) prefix = 'You'
        else if (conversation.kind !== 'dm') {
          prefix = membersById.get(last.author_id)?.name.split(' ')[0] ?? null
        }
      }

      items.push({
        id: conversation.id,
        kind: conversation.kind,
        title: conversationTitle(
          conversation,
          rosterByConversation.get(conversation.id) ?? [],
          membersById,
          session.memberId,
        ),
        emoji: conversation.emoji,
        isDm: conversation.kind === 'dm',
        favorite: membership.favorite,
        muted: isMuted(membership),
        unread: unreadCount(window, membership, session.memberId),
        preview: last ? { prefix, text: previewText(last) } : null,
        timeLabel: last ? chatListTime(last.inserted_at) : null,
        lastActivity: last?.inserted_at ?? conversation.inserted_at,
      })
    }

    const isChannel = (i: ChatListItem) =>
      i.kind === 'company_channel' || i.kind === 'location_channel'
    const official = items
      .filter(isChannel)
      .sort((a, b) => (a.kind === 'company_channel' ? -1 : 1) - (b.kind === 'company_channel' ? -1 : 1))
    const favorites = items.filter((i) => !isChannel(i) && i.favorite).sort(byRecency)
    const rest = items.filter((i) => !isChannel(i) && !i.favorite).sort(byRecency)

    return { official, favorites, rest }
  }, [memberships, conversations, roster, members, messages])
}
