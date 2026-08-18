// Desktop-only quick nav pinned to the right edge of the content-area top
// bar: People and Profile. (Chats needs no entry — the persistent sidebar
// is the chats menu on desktop.)

import { Link } from '@tanstack/react-router'
import '../../styles/desktop.css'

export function TopbarNav() {
  return (
    <nav className="topbar-nav" aria-label="Sections">
      <Link to="/people" className="topbar-nav-link">
        <span aria-hidden>👥</span> People
      </Link>
      <Link to="/profile" className="topbar-nav-link">
        <span aria-hidden>👤</span> Profile
      </Link>
    </nav>
  )
}
