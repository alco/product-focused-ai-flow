// /mobile/channel — "Bankside Announcements" as read by staff (Priya).
// One-way broadcast: no composer; a quiet mono footer explains why.

import { createFileRoute } from '@tanstack/react-router'
import { AnnouncementFeed } from '../../components/channel/AnnouncementFeed'
import { ChannelTopbar } from '../../components/channel/ChannelTopbar'
import { channelFeed } from '../../mock/channel'
import '../../styles/channel.css'

export const Route = createFileRoute('/mobile/channel')({
  component: ChannelReader,
})

function ChannelReader() {
  return (
    <div className="phone">
      <ChannelTopbar />
      <div className="phone-scroll channel-scroll">
        <AnnouncementFeed posts={channelFeed} showAddReaction />
      </div>
      <footer className="channel-footer">
        <span className="channel-footer-note">◆ Only managers can post</span>
      </footer>
    </div>
  )
}
