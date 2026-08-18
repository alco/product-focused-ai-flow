// Chat-list row + stacked sections, shared by the mobile chat list
// (/mobile/chats) and the desktop sidebar. Static — rows are dead.

import { Avatar } from './Avatar'
import { favoriteChats, groupEmoji, officialChats, recentChats } from '../mock/data'
import type { ChatListEntry } from '../mock/data'
import '../styles/chat-list.css'

export function ChatRow({
  chat,
  official,
  active,
}: {
  chat: ChatListEntry
  official?: boolean
  active?: boolean
}) {
  const unread = chat.unread > 0
  // "You: …" previews already carry their own prefix
  const authorPrefix =
    chat.lastAuthor && !chat.lastMessage.startsWith('You:') ? `${chat.lastAuthor}: ` : ''

  return (
    <div
      className={`chat-row${unread ? ' chat-row--unread' : ''}${active ? ' chat-row--active' : ''}`}
    >
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

export function ChatSections({ activeChatId }: { activeChatId?: string }) {
  return (
    <>
      <section className="chat-section chat-section--official">
        <div className="section-label">📌 Official</div>
        {officialChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} official active={chat.id === activeChatId} />
        ))}
      </section>

      <section className="chat-section">
        <div className="section-label">⭐ Favorites</div>
        {favoriteChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} active={chat.id === activeChatId} />
        ))}
      </section>

      <section className="chat-section">
        <div className="section-label">All chats</div>
        {recentChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} active={chat.id === activeChatId} />
        ))}
      </section>
    </>
  )
}
