// Announcement feed shared by the reader and manager channel screens.
// Posts render as full-width bulletin cards grouped under mono day headers —
// deliberately not chat bubbles. Posts are ordinary message rows with
// title/post_emoji set; day headers and reaction chips are derived here.

import { Fragment } from 'react'
import type { Member, Message, MessageReaction } from '../../db/schema'
import { session } from '../../db/session'
import { aggregateReactions } from '../../db/derive'
import { dayLabel, sameDay, timeLabel } from '../../lib/time'
import { Avatar } from '../Avatar'

interface FeedProps {
  /** The channel's messages, ascending by inserted_at. */
  posts: Message[]
  reactions: MessageReaction[]
  membersById: Map<string, Member>
  /** Reader view: show the ghost "+" add-reaction chip on each card. */
  showAddReaction?: boolean
  /** Manager view: posts by this author get a small edit affordance. */
  editableAuthorId?: string
}

export function AnnouncementFeed({
  posts,
  reactions,
  membersById,
  showAddReaction,
  editableAuthorId,
}: FeedProps) {
  const groups: { day: string; posts: Message[] }[] = []
  for (const post of posts) {
    const last = groups[groups.length - 1]
    if (last && sameDay(last.posts[0].inserted_at, post.inserted_at)) last.posts.push(post)
    else groups.push({ day: dayLabel(post.inserted_at), posts: [post] })
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
              reactions={reactions.filter((r) => r.message_id === post.id)}
              author={membersById.get(post.author_id)}
              showAddReaction={showAddReaction}
              editable={editableAuthorId != null && post.author_id === editableAuthorId}
            />
          ))}
        </Fragment>
      ))}
    </div>
  )
}

function AnnouncementCard({
  post,
  reactions,
  author,
  showAddReaction,
  editable,
}: {
  post: Message
  reactions: MessageReaction[]
  author: Member | undefined
  showAddReaction?: boolean
  editable?: boolean
}) {
  const chips = aggregateReactions(reactions, session.memberId)
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
      {post.post_emoji && (
        <span className="post-emoji" aria-hidden>
          {post.post_emoji}
        </span>
      )}
      {post.title && <h2 className="post-title">{post.title}</h2>}
      <p className="post-body">{post.body}</p>
      {author && (
        <div className="post-author">
          <Avatar name={author.name} size={26} />
          <span className="post-author-name">{author.name}</span>
          <span className="post-author-role">{author.job_title}</span>
          <span className="post-time">{timeLabel(post.inserted_at)}</span>
        </div>
      )}
      <div className="post-reactions">
        {chips.map((chip) => (
          <span key={chip.emoji} className={chip.mine ? 'ann-chip ann-chip--mine' : 'ann-chip'}>
            {chip.emoji}
            <span className="reaction-count">{chip.count}</span>
          </span>
        ))}
        {showAddReaction && <span className="ann-chip ann-chip--add">+</span>}
      </div>
    </article>
  )
}
