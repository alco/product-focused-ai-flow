// frontend/src/routes/_appShell/chats.tsx
// Mobile: full chat-list screen (was /mobile/chats).
// Desktop: the "nothing open" welcome pane (was desktop-empty.tsx's <main>),
// rendered next to the sidebar the _appShell layout already provides.
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChatSections } from '../../components/ChatRow'
import { TabBar } from '../../components/TabBar'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { announcements, currentUser, location, locationChannel } from '../../mock/data'
import '../../styles/chat-list.css'

export const Route = createFileRoute('/_appShell/chats')({
  component: ChatsRoute,
})

const latest = announcements[announcements.length - 1]
const firstName = currentUser.name.split(' ')[0]

function ChatsRoute() {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <main className="desktop-main desktop-main--empty">
        <div className="desktop-welcome">
          <span className="eyebrow">{location.name}</span>
          <h1 className="welcome-title">Good afternoon, {firstName}</h1>
          <p className="welcome-hint text-muted">
            Pick a conversation from the sidebar to start chatting.
          </p>

          <div className="card card-pad welcome-card">
            <div className="welcome-card-top">
              <span className="welcome-card-channel">📣 {locationChannel.name}</span>
              <span className="welcome-card-time">{latest.time}</span>
            </div>
            <div className="welcome-card-title">
              {latest.emoji} {latest.title}
            </div>
            <p className="welcome-card-text">{latest.text}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="phone">
      <header className="topbar">
        <div>
          <h1 className="topbar-title">Chats</h1>
          <p className="topbar-subtitle">{location.name}</p>
        </div>
      </header>

      <div className="phone-scroll">
        <ChatSections />
      </div>

      <Link className="fab" to="/new-chat" aria-label="New chat">
        +
      </Link>
      <TabBar active="chats" />
    </div>
  )
}
