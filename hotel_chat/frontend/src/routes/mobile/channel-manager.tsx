// /mobile/channel-manager — "Bankside Announcements" as seen by the duty
// manager (Daniel). Same broadcast feed, plus a compact composer card and an
// edit affordance on his own posts.

import { createFileRoute } from '@tanstack/react-router'
import { AnnouncementFeed } from '../../components/channel/AnnouncementFeed'
import { ChannelTopbar } from '../../components/channel/ChannelTopbar'
import { channelFeed } from '../../mock/channel'
import { managerUser } from '../../mock/data'
import '../../styles/channel.css'

export const Route = createFileRoute('/mobile/channel-manager')({
  component: ChannelManager,
})

function ChannelManager() {
  return (
    <div className="phone">
      <ChannelTopbar />
      <div className="phone-scroll channel-scroll">
        <AnnouncementFeed posts={channelFeed} editableAuthorId={managerUser.id} />
      </div>
      <footer className="channel-composer">
        <p className="composer-label">New announcement</p>
        <input className="composer-input" type="text" placeholder="Title" readOnly />
        <textarea
          className="composer-textarea"
          rows={2}
          placeholder="Write your announcement…"
          readOnly
        />
        <div className="composer-foot">
          <span className="composer-as">
            Posting as {managerUser.name} · {managerUser.jobTitle}
          </span>
          <button className="btn btn-primary composer-post-btn" type="button">
            Post
          </button>
        </div>
      </footer>
    </div>
  )
}
