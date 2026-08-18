// frontend/src/routes/new-chat.tsx
// Member picker over the directory collection. The selection is mocked
// mid-action (creation itself will be an API write, not a collection concern).
import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { Avatar } from '../components/Avatar'
import { directoryCollection } from '../db/collections'
import { onlineMemberIds } from '../db/presence'
import { session } from '../db/session'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/new-chat')({
  component: NewChatScreen,
})

// Mocked mid-action: group mode with three people already selected.
const selectedIds = ['amira', 'jamal', 'hannah']

function NewChatScreen() {
  const { data: members } = useLiveQuery((q) => q.from({ d: directoryCollection }))
  const selectedPeople = members.filter((m) => selectedIds.includes(m.id))
  const candidates = members
    .filter((m) => m.id !== session.memberId)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="phone">
      <header className="topbar">
        <Link className="close-x" to="/chats" aria-label="Close">
          ✕
        </Link>
        <h1 className="topbar-title">New chat</h1>
      </header>

      <div className="newchat-scroll">
        <div className="search-field">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          Search name or role
        </div>

        <div className="group-strip">
          <div className="section-label">New group · {selectedPeople.length} selected</div>
          <div className="chip-row">
            {selectedPeople.map((person) => (
              <span key={person.id} className="chip">
                <Avatar name={person.name} size={24} />
                {person.name}
                <span className="chip-x" aria-hidden>
                  ✕
                </span>
              </span>
            ))}
          </div>
          <div className="group-name-field">
            <input
              className="text-input"
              type="text"
              defaultValue="Lobby Refresh Project"
              placeholder="Group name"
              aria-label="Group name"
            />
          </div>
        </div>

        <ul className="people-list">
          {candidates.map((person) => {
            const checked = selectedIds.includes(person.id)
            return (
              <li key={person.id} className="person-row">
                <span className={`check-circle${checked ? ' checked' : ''}`} aria-hidden>
                  ✓
                </span>
                <span className="presence-wrap">
                  <Avatar name={person.name} size={40} />
                  {onlineMemberIds.has(person.id) && (
                    <span className="presence-dot" aria-hidden />
                  )}
                </span>
                <div className="person-main">
                  <div className="person-name-row">
                    <span className="person-name">{person.name}</span>
                  </div>
                  <div className="person-meta">{person.job_title}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="newchat-footer">
        <button type="button" className="btn btn-primary btn-block">
          Create group chat
        </button>
      </div>
    </div>
  )
}
