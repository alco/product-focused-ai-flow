// frontend/src/routes/profile.tsx
// My Profile: identity from the directory + locations collections, settings
// from my_settings, the schedule card from my_schedule, and the muted-chats
// list derived from my memberships ⋈ conversations. Phone comes via session
// bootstrap (the directory shape deliberately excludes it).
import { createFileRoute } from '@tanstack/react-router'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { Avatar } from '../components/Avatar'
import { TabBar } from '../components/TabBar'
import {
  conversationsCollection,
  membershipsCollection,
  scheduleCollection,
  settingsCollection,
} from '../db/collections'
import { isMuted, languageName, scheduleSummary, snoozeLabel } from '../db/derive'
import { session } from '../db/session'
import { useMe, useMyLocation } from '../hooks/useSessionMember'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/profile')({
  component: ProfileScreen,
})

function SettingsRow({
  label,
  value,
  explainer,
  chevron = true,
}: {
  label: string
  value?: string
  explainer?: string
  chevron?: boolean
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-main">
        <div className="settings-row-label">{label}</div>
        {value && <div className="settings-row-value">{value}</div>}
        {explainer && <div className="settings-row-explainer">{explainer}</div>}
      </div>
      {chevron && (
        <span className="settings-chevron" aria-hidden>
          ›
        </span>
      )}
    </div>
  )
}

function ProfileScreen() {
  const me = useMe()
  const location = useMyLocation()
  const { data: settingsRows } = useLiveQuery((q) =>
    q.from({ s: settingsCollection }).where(({ s }) => eq(s.member_id, session.memberId)),
  )
  const settings = settingsRows[0]
  const { data: schedule } = useLiveQuery((q) => q.from({ ws: scheduleCollection }))
  const { data: memberships } = useLiveQuery((q) => q.from({ m: membershipsCollection }))
  const { data: conversations } = useLiveQuery((q) => q.from({ c: conversationsCollection }))

  const conversationNameById = new Map(conversations.map((c) => [c.id, c.name]))
  const mutedChats = memberships
    .filter((m) => isMuted(m))
    .map((m) => conversationNameById.get(m.conversation_id))
    .filter((name): name is string => !!name)

  return (
    <div className="phone">
      <header className="topbar">
        <h1 className="topbar-title">My Profile</h1>
      </header>

      <div className="profile-body">
        <div className="profile-card">
          {me && <Avatar name={me.name} size={72} />}
          <div className="profile-name">{me?.name}</div>
          <div className="profile-job">
            {me?.job_title} · {location?.name}
          </div>
          <span className="pill pill--stone" style={{ marginTop: '0.375rem' }}>
            {me?.role === 'manager' ? 'Manager' : 'Staff'}
          </span>
        </div>

        <div className="section-label">Notifications</div>
        <div className="settings-card">
          <SettingsRow
            label="Work schedule"
            value={scheduleSummary(schedule)}
            explainer="Pushes are delivered only during your working hours"
            chevron={false}
          />
          {settings && <SettingsRow label="Snooze all" value={snoozeLabel(settings)} />}
          <SettingsRow label="Muted chats" value={mutedChats.join(', ')} />
        </div>

        <div className="section-label">Account</div>
        <div className="settings-card">
          <SettingsRow label="Phone number" value={session.phone} />
          {settings && <SettingsRow label="Language" value={languageName(settings.language)} />}
        </div>

        <div className="settings-card logout-row" style={{ marginTop: '1rem' }}>
          <SettingsRow label="Log out" chevron={false} />
        </div>
      </div>

      <TabBar active="profile" />
    </div>
  )
}
