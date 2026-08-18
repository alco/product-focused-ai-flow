// Renders a full conversation transcript: day dividers, system lines, message
// runs with author names/avatars (group mode), reply quotes, reactions.
// Width-agnostic — bubbles cap their own width, so this works inside the
// phone frame and the desktop content pane alike.
//
// Takes raw collection rows; dividers, time labels and reaction chips are
// derived here (nothing display-shaped is stored).

import { Fragment, useMemo } from 'react'
import type { Member, Message, MessageReaction } from '../../db/schema'
import { session } from '../../db/session'
import { aggregateReactions } from '../../db/derive'
import { dayLabel, sameDay, timeLabel } from '../../lib/time'
import { Avatar } from '../Avatar'
import { authorColor } from './palette'
import { DayDivider } from './DayDivider'
import { SystemLine } from './SystemLine'
import { ReactionChips } from './ReactionChips'
import { MessageBubble } from './MessageBubble'
import '../../styles/conversation.css'

export function MessageList({
  messages,
  reactions,
  membersById,
  showAuthors = false,
  currentUserId = session.memberId,
}: {
  /** The conversation's message window, ascending by inserted_at. */
  messages: Message[]
  /** Reaction rows for these messages; aggregated to chips per message here. */
  reactions: MessageReaction[]
  membersById: Map<string, Member>
  /** Group mode: author names above runs + avatars beside incoming runs. */
  showAuthors?: boolean
  /** Whose messages align right in lime. Defaults to the signed-in member. */
  currentUserId?: string
}) {
  const byId = new Map(messages.map((m) => [m.id, m]))

  const reactionsByMessage = useMemo(() => {
    const map = new Map<string, MessageReaction[]>()
    for (const r of reactions) {
      let list = map.get(r.message_id)
      if (!list) map.set(r.message_id, (list = []))
      list.push(r)
    }
    return map
  }, [reactions])

  const authorName = (id: string) => membersById.get(id)?.name ?? 'Former teammate'

  return (
    <div className="msg-list">
      {messages.map((m, i) => {
        const prev = i > 0 ? messages[i - 1] : undefined
        const newDay = !prev || !sameDay(prev.inserted_at, m.inserted_at)
        const divider = newDay ? <DayDivider label={dayLabel(m.inserted_at)} /> : null

        if (m.kind === 'system') {
          return (
            <Fragment key={m.id}>
              {divider}
              <SystemLine text={m.body ?? ''} />
            </Fragment>
          )
        }

        const own = m.author_id === currentUserId
        const name = authorName(m.author_id)
        const runStart = !prev || prev.kind === 'system' || prev.author_id !== m.author_id || newDay

        const quoted = m.reply_to_id ? byId.get(m.reply_to_id) : undefined
        const quote = quoted
          ? {
              authorName: quoted.author_id === currentUserId ? 'You' : authorName(quoted.author_id),
              text: quoted.body ?? '',
            }
          : undefined

        const chips = aggregateReactions(reactionsByMessage.get(m.id) ?? [], currentUserId)

        return (
          <Fragment key={m.id}>
            {divider}
            <div className={`msg-row${own ? ' own' : ''}${runStart ? ' run-start' : ''}`}>
              {showAuthors && !own && (
                <span className="msg-gutter">{runStart && <Avatar name={name} size={28} />}</span>
              )}
              <div className="msg-col">
                {showAuthors && !own && runStart && (
                  <span className="msg-author" style={{ color: authorColor(name) }}>
                    {name}
                  </span>
                )}
                <MessageBubble text={m.body ?? ''} time={timeLabel(m.inserted_at)} quote={quote} />
                {chips.length > 0 && <ReactionChips reactions={chips} />}
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
