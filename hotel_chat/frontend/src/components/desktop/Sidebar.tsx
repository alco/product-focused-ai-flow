// Desktop sidebar: compact identity header, static search, then the same
// stacked chat sections as the mobile chat list — official lime band,
// favorites, all chats. Identity comes from the directory/locations
// collections; the company name arrives via session bootstrap.

import { Link } from '@tanstack/react-router'
import { Avatar } from '../Avatar'
import { ChatSections } from '../ChatRow'
import { session } from '../../db/session'
import { useMe, useMyLocation } from '../../hooks/useSessionMember'
import '../../styles/chat-list.css'
import '../../styles/session2-screens.css'
import '../../styles/desktop.css'

export function Sidebar({ activeChatId }: { activeChatId?: string }) {
  const me = useMe()
  const location = useMyLocation()

  return (
    <aside className="desktop-sidebar">
      <header className="sidebar-header">
        {me && <Avatar name={me.name} size={34} />}
        <div className="sidebar-id">
          <div className="sidebar-title">{location?.name}</div>
          <div className="sidebar-subtitle">{session.companyName}</div>
        </div>
        <button type="button" className="sidebar-new" aria-label="New chat">
          ✏️
        </button>
      </header>

      <div className="search-field">
        <span className="search-icon" aria-hidden>
          🔍
        </span>
        Search
      </div>

      <div className="sidebar-scroll">
        <ChatSections activeChatId={activeChatId} />
      </div>

      <div className="sidebar-footer">
        <Link to="/new-chat" className="btn btn-primary btn-block">
          New group chat
        </Link>
      </div>
    </aside>
  )
}
