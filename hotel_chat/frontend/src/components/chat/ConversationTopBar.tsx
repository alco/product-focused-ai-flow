// Top bar for an open conversation: back chevron (optional), avatar, name,
// subtitle. Reused by mobile conversation screens and the desktop shell
// (desktop: omit backTo).

import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import '../../styles/conversation.css'

export function ConversationTopBar({
  backTo,
  avatar,
  title,
  subtitle,
}: {
  backTo?: string
  avatar?: ReactNode
  title: string
  subtitle?: ReactNode
}) {
  return (
    <header className="topbar">
      {backTo && (
        <Link className="back-chevron" to={backTo} aria-label="Back">
          ‹
        </Link>
      )}
      {avatar}
      <div style={{ minWidth: 0 }}>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
    </header>
  )
}
