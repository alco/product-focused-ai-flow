// frontend/src/routes/people.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { TabBar } from '../components/TabBar'
import { location, people } from '../mock/data'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/people')({
  component: PeopleScreen,
})

const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))

function PeopleScreen() {
  return (
    <div className="phone">
      <header className="topbar">
        <div>
          <h1 className="topbar-title">People</h1>
          <p className="topbar-subtitle">
            {location.name} · {people.length} people
          </p>
        </div>
      </header>

      <div className="phone-scroll">
        <div className="search-field">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          Search name or role
        </div>

        <ul className="people-list">
          {sortedPeople.map((person) => (
            <li key={person.id} className="person-row">
              <span className="presence-wrap">
                <Avatar name={person.name} />
                {person.online && <span className="presence-dot" aria-hidden />}
              </span>
              <div className="person-main">
                <div className="person-name-row">
                  <span className="person-name">{person.name}</span>
                  {person.role === 'manager' && (
                    <span className="pill pill--stone">Manager</span>
                  )}
                </div>
                <div className="person-meta">
                  {person.jobTitle} · {person.location}
                </div>
              </div>
              <button type="button" className="dm-ghost" aria-label={`Message ${person.name}`}>
                💬
              </button>
            </li>
          ))}
        </ul>
      </div>

      <TabBar active="people" />
    </div>
  )
}
