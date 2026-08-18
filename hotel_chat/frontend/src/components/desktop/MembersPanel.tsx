// frontend/src/components/desktop/MembersPanel.tsx
// Desktop-only members list for an open group conversation. Takes directory
// rows; online dots come from the presence stub (ephemeral, not a collection).

import { Avatar } from '../Avatar'
import { onlineMemberIds } from '../../db/presence'
import type { Member } from '../../db/schema'

function MemberRow({ member }: { member: Member }) {
  return (
    <li className="member-row">
      <span className="member-avatar">
        <Avatar name={member.name} size={32} />
        {onlineMemberIds.has(member.id) && <span className="member-dot" aria-hidden />}
      </span>
      <div className="member-main">
        <div className="member-name-row">
          <span className="member-name">{member.name}</span>
          {member.role === 'manager' && <span className="pill pill--stone">Manager</span>}
        </div>
        <div className="member-title">{member.job_title}</div>
      </div>
    </li>
  )
}

export function MembersPanel({ members }: { members: Member[] }) {
  return (
    <aside className="desktop-members">
      <div className="section-label">Members — {members.length}</div>
      <ul className="member-list">
        {members.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
      </ul>
    </aside>
  )
}
