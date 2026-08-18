// frontend/src/routes/_appShell/chats.tsx
// Mobile: full chat-list screen. Desktop: the "nothing open" welcome pane,
// rendered next to the sidebar the _appShell layout already provides.
// The welcome card surfaces the latest location-channel announcement.
import { createFileRoute, Link } from '@tanstack/react-router'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { ChatSections } from '../../components/ChatRow'
import { TabBar } from '../../components/TabBar'
import { TopbarNav } from '../../components/desktop/TopbarNav'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useMe, useMyLocation } from '../../hooks/useSessionMember'
import { conversationsCollection, messagesCollection } from '../../db/collections'
import { timeLabel } from '../../lib/time'
import '../../styles/chat-list.css'

export const Route = createFileRoute('/_appShell/chats')({
  component: ChatsRoute,
})

function ChatsRoute() {
  const isDesktop = useIsDesktop()
  const me = useMe()
  const location = useMyLocation()

  const { data: channels } = useLiveQuery((q) =>
    q.from({ c: conversationsCollection }).where(({ c }) => eq(c.kind, 'location_channel')),
  )
  const channel = channels[0]
  const { data: posts } = useLiveQuery(
    (q) =>
      q
        .from({ m: messagesCollection })
        .where(({ m }) => eq(m.conversation_id, channel?.id ?? '')),
    [channel?.id],
  )
  const latest = posts
    .slice()
    .sort((a, b) => a.inserted_at.localeCompare(b.inserted_at))
    .pop()

  if (isDesktop) {
    const firstName = me?.name.split(' ')[0]
    return (
      <main className="desktop-main">
        <header className="topbar">
          <TopbarNav />
        </header>
        <div className="desktop-empty-body">
          <div className="desktop-welcome">
            <span className="eyebrow">{location?.name}</span>
            <h1 className="welcome-title">Good afternoon{firstName ? `, ${firstName}` : ''}</h1>
            <p className="welcome-hint text-muted">
              Pick a conversation from the sidebar to start chatting.
            </p>

            {channel && latest && (
              <div className="card card-pad welcome-card">
                <div className="welcome-card-top">
                  <span className="welcome-card-channel">📣 {channel.name}</span>
                  <span className="welcome-card-time">{timeLabel(latest.inserted_at)}</span>
                </div>
                <div className="welcome-card-title">
                  {latest.post_emoji} {latest.title}
                </div>
                <p className="welcome-card-text">{latest.body}</p>
              </div>
            )}
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
          <p className="topbar-subtitle">{location?.name}</p>
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
