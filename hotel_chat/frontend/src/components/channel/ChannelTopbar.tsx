// Topbar for the announcement channel screens: back chevron (mobile only),
// lime-tinted megaphone glyph, channel name + audience, the OFFICIAL mono
// tag, and optional trailing actions (desktop nav).

import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export function ChannelTopbar({
  channel,
  backTo,
  actions,
}: {
  channel: { name: string; audience: string }
  backTo?: string
  actions?: ReactNode
}) {
  return (
    <header className="topbar">
      {backTo && (
        <Link className="back-chevron" to={backTo} aria-label="Back to chats">
          ‹
        </Link>
      )}
      <span className="channel-glyph" aria-hidden>
        📣
      </span>
      <div className="channel-topbar-info">
        <h1 className="topbar-title">{channel.name}</h1>
        <p className="topbar-subtitle">{channel.audience}</p>
      </div>
      <span className="eyebrow eyebrow--lime channel-official-tag">Official</span>
      {actions}
    </header>
  )
}
