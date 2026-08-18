// Desktop shell with an open conversation: persistent sidebar, the
// "Saturday Wedding — Ops" group chat in the main pane, members panel right.
// Static mockup — no state, no navigation wiring.

import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { Composer } from '../components/chat/Composer'
import { ConversationTopBar } from '../components/chat/ConversationTopBar'
import { GroupTile } from '../components/chat/GroupTile'
import { MessageList } from '../components/chat/MessageList'
import { Sidebar } from '../components/desktop/Sidebar'
import { groupChat, groupMessages, location, personById } from '../mock/data'
import type { Person } from '../mock/data'
import '../styles/desktop.css'

export const Route = createFileRoute('/desktop')({
  component: DesktopShell,
})

// Managers first, then alphabetical.
const members: Person[] = groupChat.memberIds.map(personById).sort((a, b) => {
  if (a.role !== b.role) return a.role === 'manager' ? -1 : 1
  return a.name.localeCompare(b.name)
})

function MemberRow({ person }: { person: Person }) {
  return (
    <li className="member-row">
      <span className="member-avatar">
        <Avatar name={person.name} size={32} />
        {person.online && <span className="member-dot" aria-hidden />}
      </span>
      <div className="member-main">
        <div className="member-name-row">
          <span className="member-name">{person.name}</span>
          {person.role === 'manager' && <span className="pill pill--stone">Manager</span>}
        </div>
        <div className="member-title">{person.jobTitle}</div>
      </div>
    </li>
  )
}

function DesktopShell() {
  return (
    <div className="desktop-shell">
      <Sidebar activeChatId={groupChat.id} />

      <main className="desktop-main">
        <ConversationTopBar
          avatar={<GroupTile name={groupChat.name} />}
          title={groupChat.name}
          subtitle={`${groupChat.memberIds.length} members · ${location.name}`}
        />
        <div className="convo-scroll desktop-convo">
          <div className="desktop-transcript">
            <MessageList messages={groupMessages} showAuthors />
          </div>
        </div>
        <Composer />
      </main>

      <aside className="desktop-members">
        <div className="section-label">Members — {groupChat.memberIds.length}</div>
        <ul className="member-list">
          {members.map((person) => (
            <MemberRow key={person.id} person={person} />
          ))}
        </ul>
      </aside>
    </div>
  )
}
