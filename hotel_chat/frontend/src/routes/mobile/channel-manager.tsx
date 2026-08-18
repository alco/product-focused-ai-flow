// /mobile/channel-manager — "Bankside Announcements" as seen by the duty
// manager (Daniel). Same broadcast feed, plus a compact composer card and an
// edit affordance on his own posts. Design preview, URL-only: the signed-in
// mock member is staff, so this screen renders from Daniel's perspective via
// session.managerMemberId.

import { createFileRoute } from '@tanstack/react-router'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { AnnouncementFeed } from '../../components/channel/AnnouncementFeed'
import { ChannelTopbar } from '../../components/channel/ChannelTopbar'
import { conversationsCollection, locationsCollection } from '../../db/collections'
import { session } from '../../db/session'
import { useConversation } from '../../hooks/useConversation'
import '../../styles/channel.css'

export const Route = createFileRoute('/mobile/channel-manager')({
  component: ChannelManager,
})

function ChannelManager() {
  const { data: channels } = useLiveQuery((q) =>
    q.from({ c: conversationsCollection }).where(({ c }) => eq(c.kind, 'location_channel')),
  )
  const channelId = channels[0]?.id ?? ''
  const data = useConversation(channelId)
  const { data: locations } = useLiveQuery((q) => q.from({ l: locationsCollection }))
  const manager = data.membersById.get(session.managerMemberId)

  if (!data.conversation) return null
  const locationName =
    locations.find((l) => l.id === data.conversation!.location_id)?.name ?? data.conversation.name

  return (
    <div className="phone">
      <ChannelTopbar
        channel={{
          name: data.conversation.name ?? '',
          audience: `Everyone at ${locationName} · ${data.roster.length} people`,
        }}
      />
      <div className="phone-scroll channel-scroll">
        <AnnouncementFeed
          posts={data.messages}
          reactions={data.reactions}
          membersById={data.membersById}
          editableAuthorId={session.managerMemberId}
        />
      </div>
      <footer className="channel-composer">
        <p className="composer-label">New announcement</p>
        <input className="ann-composer-input" type="text" placeholder="Title" readOnly />
        <textarea
          className="ann-composer-textarea"
          rows={2}
          placeholder="Write your announcement…"
          readOnly
        />
        <div className="composer-foot">
          <span className="composer-as">
            Posting as {manager?.name} · {manager?.job_title}
          </span>
          <button className="btn btn-primary composer-post-btn" type="button">
            Post
          </button>
        </div>
      </footer>
    </div>
  )
}
