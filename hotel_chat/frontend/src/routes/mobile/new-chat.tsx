import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../../components/Avatar'
import { currentUser, people, personById } from '../../mock/data'
import '../../styles/session2-screens.css'

export const Route = createFileRoute('/mobile/new-chat')({
  component: NewChatScreen,
})

// Mocked mid-action: group mode with three people already selected.
const selectedIds = ['amira', 'jamal', 'hannah']
const selectedPeople = selectedIds.map(personById)

const candidates = people
  .filter((p) => p.id !== currentUser.id)
  .sort((a, b) => a.name.localeCompare(b.name))

function NewChatScreen() {
  return (
    <div className="phone">
      <header className="topbar">
        <a className="close-x" href="/mobile/chats" aria-label="Close">
          ✕
        </a>
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
                  {person.online && <span className="presence-dot" aria-hidden />}
                </span>
                <div className="person-main">
                  <div className="person-name-row">
                    <span className="person-name">{person.name}</span>
                  </div>
                  <div className="person-meta">{person.jobTitle}</div>
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
