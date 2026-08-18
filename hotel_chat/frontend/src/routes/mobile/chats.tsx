// Mobile home: chat list. Static mockup — no state, no navigation wiring.

import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../../components/Avatar'
import { TabBar } from '../../components/TabBar'
import { favoriteChats, location, officialChats, recentChats } from '../../mock/data'
import type { ChatListEntry } from '../../mock/data'
import '../../styles/chat-list.css'

export const Route = createFileRoute('/mobile/chats')({
  component: ChatListScreen,
})

// Emoji identity for group tiles (people DMs use the initials Avatar instead).
const groupEmoji: Record<string, string> = {
  housekeeping: '🧹',
  'wedding-ops': '💍',
  'front-desk': '🛎️',
  'fnb-crew': '🍽️',
  'night-shift': '🌙',
  maintenance: '🔧',
  'reception-rota': '🔁',
  'fire-wardens': '🧯',
}

function ChatRow({ chat, official }: { chat: ChatListEntry; official?: boolean }) {
  const unread = chat.unread > 0
  // "You: …" previews already carry their own prefix
  const authorPrefix =
    chat.lastAuthor && !chat.lastMessage.startsWith('You:') ? `${chat.lastAuthor}: ` : ''

  return (
    <div className={`chat-row${unread ? ' chat-row--unread' : ''}`}>
      {chat.kind === 'dm' ? (
        <Avatar name={chat.name} />
      ) : (
        <span className={`chat-tile${official ? ' chat-tile--official' : ''}`} aria-hidden>
          {official ? '📣' : (groupEmoji[chat.id] ?? '👥')}
        </span>
      )}
      <div className="chat-main">
        <div className="chat-name-row">
          <span className="chat-name">{chat.name}</span>
          {chat.favorite && (
            <span className="chat-flag" aria-hidden>
              ⭐
            </span>
          )}
        </div>
        <div className="chat-preview">
          {authorPrefix}
          {chat.lastMessage}
        </div>
      </div>
      <div className="chat-meta">
        <span className="chat-time">{chat.lastTime}</span>
        {unread ? (
          <span className="unread-badge">{chat.unread}</span>
        ) : chat.muted ? (
          <span className="chat-mute" title="Muted" aria-label="Muted">
            🔕
          </span>
        ) : null}
      </div>
    </div>
  )
}

function ChatListScreen() {
  return (
    <div className="phone">
      <header className="topbar">
        <div>
          <h1 className="topbar-title">Chats</h1>
          <p className="topbar-subtitle">{location.name}</p>
        </div>
      </header>

      <div className="phone-scroll">
        <section className="chat-section chat-section--official">
          <div className="section-label">📌 Official</div>
          {officialChats.map((chat) => (
            <ChatRow key={chat.id} chat={chat} official />
          ))}
        </section>

        <section className="chat-section">
          <div className="section-label">⭐ Favorites</div>
          {favoriteChats.map((chat) => (
            <ChatRow key={chat.id} chat={chat} />
          ))}
        </section>

        <section className="chat-section">
          <div className="section-label">All chats</div>
          {recentChats.map((chat) => (
            <ChatRow key={chat.id} chat={chat} />
          ))}
        </section>
      </div>

      <a className="fab" href="/mobile/new-chat" aria-label="New chat">
        +
      </a>
      <TabBar active="chats" />
    </div>
  )
}
