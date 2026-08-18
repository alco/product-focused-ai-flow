// Sticky bottom composer: dead attach affordance, rounded text input,
// circular navy send button. Sends optimistically via db/mutations —
// the message appears in the transcript instantly and confirms when it
// syncs back through Electric. When a reply target is set, a small quote
// chip shows above the input and the send becomes a reply.

import { useState } from 'react'
import { replyToMessage, sendMessage } from '../../db/mutations'
import '../../styles/conversation.css'

export interface ReplyTarget {
  messageId: string
  authorName: string
  text: string
}

export function Composer({
  conversationId,
  replyTo,
  onCancelReply,
}: {
  conversationId: string
  replyTo?: ReplyTarget
  onCancelReply?: () => void
}) {
  const [text, setText] = useState('')

  const send = () => {
    const body = text.trim()
    if (!body) return
    if (replyTo) {
      replyToMessage(conversationId, replyTo.messageId, body)
      onCancelReply?.()
    } else {
      sendMessage(conversationId, body)
    }
    setText('')
  }

  return (
    <footer className="composer">
      {replyTo && (
        <div className="composer-reply">
          <div className="composer-reply-text">
            <span className="composer-reply-author">{replyTo.authorName}</span>
            <span className="composer-reply-quote">{replyTo.text}</span>
          </div>
          <button
            type="button"
            className="composer-reply-cancel"
            aria-label="Cancel reply"
            onClick={onCancelReply}
          >
            ✕
          </button>
        </div>
      )}
      <div className="composer-row">
        <button type="button" className="composer-attach" aria-label="Attach">
          +
        </button>
        <input
          className="composer-input"
          type="text"
          placeholder="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
        />
        <button type="button" className="composer-send" aria-label="Send" onClick={send}>
          ↑
        </button>
      </div>
    </footer>
  )
}
