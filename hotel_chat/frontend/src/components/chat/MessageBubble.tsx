// A single chat bubble: optional reply-quote inset, text with @mention
// highlighting, floated mono timestamp. Alignment/own-styling comes from the
// parent row classes (see MessageList).

import type { ReactNode } from 'react'
import '../../styles/conversation.css'

// "@Name" tokens (unicode letters, so @Inês works) render in brand primary.
const MENTION_RE = /@\p{L}[\p{L}'’-]*/gu

export function MessageText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(MENTION_RE)) {
    const start = match.index
    if (start > last) parts.push(text.slice(last, start))
    parts.push(
      <span key={start} className="mention">
        {match[0]}
      </span>,
    )
    last = start + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

export interface QuoteRef {
  authorName: string
  text: string
}

export function MessageBubble({
  text,
  time,
  quote,
}: {
  text: string
  time: string
  quote?: QuoteRef
}) {
  return (
    <div className="msg-bubble">
      {quote && (
        <div className="msg-quote">
          <div className="msg-quote-author">{quote.authorName}</div>
          <div className="msg-quote-text">{quote.text}</div>
        </div>
      )}
      <MessageText text={text} />
      <span className="msg-time">{time}</span>
    </div>
  )
}
