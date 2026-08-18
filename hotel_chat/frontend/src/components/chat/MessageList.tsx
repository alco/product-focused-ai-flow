// Renders a full conversation transcript: day dividers, system lines, message
// runs with author names/avatars (group mode), reply quotes, reactions.
// Width-agnostic — bubbles cap their own width, so this works inside the
// phone frame and the desktop content pane alike.

import { Fragment } from 'react'
import type { Message } from '../../mock/data'
import { currentUser, personById } from '../../mock/data'
import { Avatar } from '../Avatar'
import { authorColor } from './palette'
import { DayDivider } from './DayDivider'
import { SystemLine } from './SystemLine'
import { ReactionChips } from './ReactionChips'
import { MessageBubble } from './MessageBubble'
import '../../styles/conversation.css'

export function MessageList({
  messages,
  showAuthors = false,
  currentUserId = currentUser.id,
}: {
  messages: Message[]
  /** Group mode: author names above runs + avatars beside incoming runs. */
  showAuthors?: boolean
  /** Whose messages align right in lime. Defaults to Priya. */
  currentUserId?: string
}) {
  const byId = new Map(messages.map((m) => [m.id, m]))

  return (
    <div className="msg-list">
      {messages.map((m, i) => {
        const divider = m.dayDivider ? <DayDivider label={m.dayDivider} /> : null

        if (m.system) {
          return (
            <Fragment key={m.id}>
              {divider}
              <SystemLine text={m.text} />
            </Fragment>
          )
        }

        const own = m.authorId === currentUserId
        const author = personById(m.authorId)
        const prev = i > 0 ? messages[i - 1] : undefined
        const runStart = !prev || prev.system || prev.authorId !== m.authorId || !!m.dayDivider

        const quoted = m.replyToId ? byId.get(m.replyToId) : undefined
        const quote = quoted
          ? {
              authorName:
                quoted.authorId === currentUserId ? 'You' : personById(quoted.authorId).name,
              text: quoted.text,
            }
          : undefined

        return (
          <Fragment key={m.id}>
            {divider}
            <div className={`msg-row${own ? ' own' : ''}${runStart ? ' run-start' : ''}`}>
              {showAuthors && !own && (
                <span className="msg-gutter">
                  {runStart && <Avatar name={author.name} size={28} />}
                </span>
              )}
              <div className="msg-col">
                {showAuthors && !own && runStart && (
                  <span className="msg-author" style={{ color: authorColor(author.name) }}>
                    {author.name}
                  </span>
                )}
                <MessageBubble text={m.text} time={m.time} quote={quote} />
                {m.reactions && m.reactions.length > 0 && <ReactionChips reactions={m.reactions} />}
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
