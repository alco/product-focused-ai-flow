// Chat-list row + stacked sections, shared by the mobile chat list
// (/chats) and the desktop sidebar. Rows navigate to /chat/$chatId.
// Everything shown here is derived from the collections via useChatList.

import { Link } from '@tanstack/react-router'
import { Avatar } from './Avatar'
import { GroupCircles } from './GroupCircles'
import { useChatList } from '../hooks/useChatList'
import type { ChatListItem } from '../hooks/useChatList'
import '../styles/chat-list.css'

export function ChatRow({
  chat,
  official,
  active,
}: {
  chat: ChatListItem
  official?: boolean
  active?: boolean
}) {
  const unread = chat.unread > 0

  return (
    <Link
      to="/chat/$chatId"
      params={{ chatId: chat.id }}
      className={`chat-row${unread ? ' chat-row--unread' : ''}${active ? ' chat-row--active' : ''}`}
    >
      {chat.isDm ? (
        <Avatar name={chat.title} />
      ) : official ? (
        <span className="chat-tile chat-tile--official" aria-hidden>
          📣
        </span>
      ) : (
        <GroupCircles names={chat.memberNames} />
      )}
      <div className="chat-main">
        <div className="chat-name-row">
          <span className="chat-name">{chat.title}</span>
          {chat.favorite && (
            <span className="chat-flag" aria-hidden>
              ⭐
            </span>
          )}
        </div>
        <div className="chat-preview">
          {chat.preview ? (
            <>
              {chat.preview.prefix && `${chat.preview.prefix}: `}
              {chat.preview.text}
            </>
          ) : (
            'No messages yet'
          )}
        </div>
      </div>
      <div className="chat-meta">
        {chat.timeLabel && <span className="chat-time">{chat.timeLabel}</span>}
        {unread ? (
          <span className="unread-badge">{chat.unread}</span>
        ) : chat.muted ? (
          <span className="chat-mute" title="Muted" aria-label="Muted">
            🔕
          </span>
        ) : null}
      </div>
    </Link>
  )
}

export function ChatSections({ activeChatId }: { activeChatId?: string }) {
  const { official, favorites, rest } = useChatList()

  return (
    <>
      <section className="chat-section chat-section--official">
        <div className="section-label">📌 Official</div>
        {official.map((chat) => (
          <ChatRow key={chat.id} chat={chat} official active={chat.id === activeChatId} />
        ))}
      </section>

      <section className="chat-section">
        <div className="section-label">⭐ Favorites</div>
        {favorites.map((chat) => (
          <ChatRow key={chat.id} chat={chat} active={chat.id === activeChatId} />
        ))}
      </section>

      <section className="chat-section">
        <div className="section-label">All chats</div>
        {rest.map((chat) => (
          <ChatRow key={chat.id} chat={chat} active={chat.id === activeChatId} />
        ))}
      </section>
    </>
  )
}
