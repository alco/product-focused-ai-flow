// Mobile home: chat list. Static mockup — no state, no navigation wiring.

import { createFileRoute } from '@tanstack/react-router'
import { ChatSections } from '../../components/ChatRow'
import { TabBar } from '../../components/TabBar'
import { location } from '../../mock/data'
import '../../styles/chat-list.css'

export const Route = createFileRoute('/mobile/chats')({
  component: ChatListScreen,
})

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
        <ChatSections />
      </div>

      <a className="fab" href="/mobile/new-chat" aria-label="New chat">
        +
      </a>
      <TabBar active="chats" />
    </div>
  )
}
