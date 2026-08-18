// frontend/src/components/desktop/MembersPanel.tsx
// Desktop-only members list for an open group conversation.

import { Avatar } from '../Avatar'
import type { Person } from '../../mock/data'

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

export function MembersPanel({ members }: { members: Person[] }) {
  return (
    <aside className="desktop-members">
      <div className="section-label">Members — {members.length}</div>
      <ul className="member-list">
        {members.map((person) => (
          <MemberRow key={person.id} person={person} />
        ))}
      </ul>
    </aside>
  )
}
