// Top bar for an open conversation: back chevron (optional), avatar, name,
// subtitle, and optional trailing actions (desktop nav). Reused by mobile
// conversation screens and the desktop shell (desktop: omit backTo).

import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import '../../styles/conversation.css'

export function ConversationTopBar({
  backTo,
  avatar,
  title,
  subtitle,
  actions,
}: {
  backTo?: string
  avatar?: ReactNode
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
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
      {actions}
    </header>
  )
}
