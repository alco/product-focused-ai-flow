// Topbar for the announcement channel screens: back chevron, lime-tinted
// megaphone glyph, channel name + audience, and the OFFICIAL mono tag.

import { Link } from '@tanstack/react-router'

export function ChannelTopbar({ channel }: { channel: { name: string; audience: string } }) {
  return (
    <header className="topbar">
      <Link className="back-chevron" to="/chats" aria-label="Back to chats">
        ‹
      </Link>
      <span className="channel-glyph" aria-hidden>
        📣
      </span>
      <div className="channel-topbar-info">
        <h1 className="topbar-title">{channel.name}</h1>
        <p className="topbar-subtitle">{channel.audience}</p>
      </div>
      <span className="eyebrow eyebrow--lime channel-official-tag">Official</span>
    </header>
  )
}
