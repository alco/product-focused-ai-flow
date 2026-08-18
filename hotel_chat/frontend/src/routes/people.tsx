// frontend/src/routes/people.tsx
// Company directory: the members collection joined against member_locations ⋈
// locations for each person's site; online dots from the presence stub.
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { Avatar } from '../components/Avatar'
import { TabBar } from '../components/TabBar'
import {
  directoryCollection,
  locationsCollection,
  memberLocationsCollection,
} from '../db/collections'
import { onlineMemberIds } from '../db/presence'
import { useMyLocation } from '../hooks/useSessionMember'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/people')({
  component: PeopleScreen,
})

function PeopleScreen() {
  const myLocation = useMyLocation()
  const { data: members } = useLiveQuery((q) => q.from({ d: directoryCollection }))
  const { data: assignments } = useLiveQuery((q) => q.from({ ml: memberLocationsCollection }))
  const { data: locations } = useLiveQuery((q) => q.from({ l: locationsCollection }))

  const locationNameById = new Map(locations.map((l) => [l.id, l.name]))
  const locationByMember = new Map(
    assignments.map((a) => [a.member_id, locationNameById.get(a.location_id)]),
  )
  // Locations render short ("Bankside") next to job titles, as in the mockups.
  const shortLocation = (name: string | undefined) => name?.replace(/^Harbourlight\s+/, '')

  const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="phone">
      <header className="topbar">
        <div>
          <h1 className="topbar-title">People</h1>
          <p className="topbar-subtitle">
            {myLocation?.name} · {members.length} people
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
          {sorted.map((person) => (
            <li key={person.id} className="person-row">
              <span className="presence-wrap">
                <Avatar name={person.name} />
                {onlineMemberIds.has(person.id) && <span className="presence-dot" aria-hidden />}
              </span>
              <div className="person-main">
                <div className="person-name-row">
                  <span className="person-name">{person.name}</span>
                  {person.role === 'manager' && (
                    <span className="pill pill--stone">Manager</span>
                  )}
                </div>
                <div className="person-meta">
                  {person.job_title} · {shortLocation(locationByMember.get(person.id))}
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
