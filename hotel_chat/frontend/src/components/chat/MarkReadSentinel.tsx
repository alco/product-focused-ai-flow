// Invisible 1px marker placed at the bottom of a transcript's scroll
// content. When it becomes visible (the user scrolled to the bottom) and the
// conversation has unread messages, it advances the read cursor via the
// mark-read mutation — optimistically clearing the unread badge everywhere,
// with the write confirmed when it syncs back through Electric.
//
// IntersectionObserver against the viewport works here because the
// intersection rectangle is clipped by every scrollable ancestor: the
// sentinel only "intersects" when the transcript is actually scrolled down
// to it.

import { useEffect, useRef, useState } from 'react'
import { and, eq, useLiveQuery } from '@tanstack/react-db'
import { membershipsCollection, messagesCollection } from '../../db/collections'
import { unreadCount } from '../../db/derive'
import { markConversationRead } from '../../db/mutations'
import { session } from '../../db/session'

export function MarkReadSentinel({ conversationId }: { conversationId: string }) {
  const { data: memberships } = useLiveQuery(
    (q) =>
      q
        .from({ m: membershipsCollection })
        .where(({ m }) =>
          and(eq(m.conversation_id, conversationId), eq(m.member_id, session.memberId)),
        ),
    [conversationId],
  )
  const { data: messages } = useLiveQuery(
    (q) =>
      q.from({ m: messagesCollection }).where(({ m }) => eq(m.conversation_id, conversationId)),
    [conversationId],
  )

  const membership = memberships[0]
  const unread = membership ? unreadCount(messages, membership, session.memberId) : 0
  const newest = messages.reduce((a, m) => (m.inserted_at > a ? m.inserted_at : a), '')

  const ref = useRef<HTMLDivElement>(null)
  const lastMarked = useRef<string | null>(null)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setAtBottom(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Fires while the conversation is unread; the optimistic cursor update
    // (at the newest message's own timestamp) drops `unread` to 0
    // immediately, so this never repeats until newer unread messages
    // arrive while scrolled up. `lastMarked` is a second line of defense:
    // whatever the cursor's fate, never re-mark the same newest message —
    // an effect that could re-fire without progress is an infinite
    // render loop.
    if (atBottom && unread > 0 && membership && newest !== '') {
      if (lastMarked.current !== null && lastMarked.current >= newest) return
      lastMarked.current = newest
      markConversationRead(membership, newest)
    }
  }, [atBottom, unread, membership, newest])

  return <div ref={ref} style={{ height: 1 }} aria-hidden />
}
