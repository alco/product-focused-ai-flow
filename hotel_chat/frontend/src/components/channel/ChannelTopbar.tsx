// Topbar for the announcement channel screens: back chevron, lime-tinted
// megaphone glyph, channel name + audience, and the OFFICIAL mono tag.

import { locationChannel } from '../../mock/data'

export function ChannelTopbar() {
  return (
    <header className="topbar">
      <a className="back-chevron" href="/mobile/chats" aria-label="Back to chats">
        ‹
      </a>
      <span className="channel-glyph" aria-hidden>
        📣
      </span>
      <div className="channel-topbar-info">
        <h1 className="topbar-title">{locationChannel.name}</h1>
        <p className="topbar-subtitle">{locationChannel.audience}</p>
      </div>
      <span className="eyebrow eyebrow--lime channel-official-tag">Official</span>
    </header>
  )
}
