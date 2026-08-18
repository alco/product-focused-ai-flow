// Top bar for an open conversation: back chevron (optional), avatar, name,
// subtitle. Reused by mobile conversation screens and the desktop shell
// (desktop: omit backHref).

import type { ReactNode } from 'react'
import '../../styles/conversation.css'

export function ConversationTopBar({
  backHref,
  avatar,
  title,
  subtitle,
}: {
  backHref?: string
  avatar?: ReactNode
  title: string
  subtitle?: ReactNode
}) {
  return (
    <header className="topbar">
      {backHref && (
        <a className="back-chevron" href={backHref} aria-label="Back">
          ‹
        </a>
      )}
      {avatar}
      <div style={{ minWidth: 0 }}>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
    </header>
  )
}
