// Announcement feed shared by the reader and manager channel screens.
// Posts render as full-width bulletin cards grouped under mono day headers —
// deliberately not chat bubbles.

import { Fragment } from 'react'
import type { AnnouncementPost, PersonId } from '../../mock/data'
import { personById } from '../../mock/data'
import { Avatar } from '../Avatar'

interface FeedProps {
  posts: AnnouncementPost[]
  /** Reader view: show the ghost "+" add-reaction chip on each card. */
  showAddReaction?: boolean
  /** Manager view: posts by this author get a small edit affordance. */
  editableAuthorId?: PersonId
}

export function AnnouncementFeed({ posts, showAddReaction, editableAuthorId }: FeedProps) {
  const groups: { day: string; posts: AnnouncementPost[] }[] = []
  for (const post of posts) {
    const last = groups[groups.length - 1]
    if (last && last.day === post.day) last.posts.push(post)
    else groups.push({ day: post.day, posts: [post] })
  }

  return (
    <div className="channel-feed">
      {groups.map((group) => (
        <Fragment key={group.day}>
          <div className="channel-day">{group.day}</div>
          {group.posts.map((post) => (
            <AnnouncementCard
              key={post.id}
              post={post}
              showAddReaction={showAddReaction}
              editable={editableAuthorId != null && post.authorId === editableAuthorId}
            />
          ))}
        </Fragment>
      ))}
    </div>
  )
}

function AnnouncementCard({
  post,
  showAddReaction,
  editable,
}: {
  post: AnnouncementPost
  showAddReaction?: boolean
  editable?: boolean
}) {
  const author = personById(post.authorId)
  return (
    <article className="post-card">
      <div className="post-head">
        <span className="eyebrow eyebrow--lime post-label">Announcement</span>
        {editable && (
          <span className="post-edit" title="Edit announcement" aria-label="Edit announcement">
            ✏️
          </span>
        )}
      </div>
      {post.emoji && (
        <span className="post-emoji" aria-hidden>
          {post.emoji}
        </span>
      )}
      {post.title && <h2 className="post-title">{post.title}</h2>}
      <p className="post-body">{post.text}</p>
      <div className="post-author">
        <Avatar name={author.name} size={26} />
        <span className="post-author-name">{author.name}</span>
        <span className="post-author-role">{author.jobTitle}</span>
        <span className="post-time">{post.time}</span>
      </div>
      <div className="post-reactions">
        {post.reactions.map((reaction) => (
          <span
            key={reaction.emoji}
            className={reaction.mine ? 'ann-chip ann-chip--mine' : 'ann-chip'}
          >
            {reaction.emoji}
            <span className="reaction-count">{reaction.count}</span>
          </span>
        ))}
        {showAddReaction && <span className="ann-chip ann-chip--add">+</span>}
      </div>
    </article>
  )
}
