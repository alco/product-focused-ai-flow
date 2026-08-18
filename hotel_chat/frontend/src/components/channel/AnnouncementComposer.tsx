// Functional announcement composer for channel screens — the same compact
// card the /mobile/channel-manager design preview mocks up, wired to the
// optimistic announcement mutation. Rendered only for members whose session
// carries the (temporary, query-param-driven) can_post_announcements flag —
// see db/session.ts.

import { useState } from 'react'
import { postAnnouncement } from '../../db/mutations'
import { useMe } from '../../hooks/useSessionMember'
import '../../styles/channel.css'

export function AnnouncementComposer({ conversationId }: { conversationId: string }) {
  const me = useMe()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const canPost = title.trim().length > 0 && body.trim().length > 0

  const post = () => {
    if (!canPost) return
    postAnnouncement(conversationId, { title: title.trim(), body: body.trim() })
    setTitle('')
    setBody('')
  }

  return (
    <footer className="channel-composer">
      <p className="composer-label">New announcement</p>
      <input
        className="ann-composer-input"
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="ann-composer-textarea"
        rows={2}
        placeholder="Write your announcement…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="composer-foot">
        <span className="composer-as">
          Posting as {me?.name} · {me?.job_title}
        </span>
        <button
          className="btn btn-primary composer-post-btn"
          type="button"
          disabled={!canPost}
          onClick={post}
        >
          Post
        </button>
      </div>
    </footer>
  )
}
