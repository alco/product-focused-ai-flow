// Desktop sidebar: compact identity header, static search, then the same
// stacked chat sections as the mobile chat list (/mobile/chats) — official
// lime band, favorites, all chats. Static mockup — rows are dead.

import { Avatar } from '../Avatar'
import { ChatSections } from '../ChatRow'
import { company, currentUser, location } from '../../mock/data'
import '../../styles/chat-list.css'
import '../../styles/session2-screens.css'
import '../../styles/desktop.css'

export function Sidebar({ activeChatId }: { activeChatId?: string }) {
  return (
    <aside className="desktop-sidebar">
      <header className="sidebar-header">
        <Avatar name={currentUser.name} size={34} />
        <div className="sidebar-id">
          <div className="sidebar-title">{location.name}</div>
          <div className="sidebar-subtitle">{company.name}</div>
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
    </aside>
  )
}
