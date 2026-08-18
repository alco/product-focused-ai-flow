// frontend/src/routes/profile.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { TabBar } from '../components/TabBar'
import { currentUser, location } from '../mock/data'
import {
  accountLanguage,
  accountPhone,
  mutedChats,
  snoozeSetting,
  workSchedule,
} from '../mock/profile'
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
  return (
    <div className="phone">
      <header className="topbar">
        <h1 className="topbar-title">My Profile</h1>
      </header>

      <div className="profile-body">
        <div className="profile-card">
          <Avatar name={currentUser.name} size={72} />
          <div className="profile-name">{currentUser.name}</div>
          <div className="profile-job">
            {currentUser.jobTitle} · {location.name}
          </div>
          <span className="pill pill--stone" style={{ marginTop: '0.375rem' }}>
            Staff
          </span>
        </div>

        <div className="section-label">Notifications</div>
        <div className="settings-card">
          <SettingsRow
            label="Work schedule"
            value={`${workSchedule.days} · ${workSchedule.hours}`}
            explainer={workSchedule.explainer}
            chevron={false}
          />
          <SettingsRow label="Snooze all" value={snoozeSetting} />
          <SettingsRow label="Muted chats" value={mutedChats.join(', ')} />
        </div>

        <div className="section-label">Account</div>
        <div className="settings-card">
          <SettingsRow label="Phone number" value={accountPhone} />
          <SettingsRow label="Language" value={accountLanguage} />
        </div>

        <div className="settings-card logout-row" style={{ marginTop: '1rem' }}>
          <SettingsRow label="Log out" chevron={false} />
        </div>
      </div>

      <TabBar active="profile" />
    </div>
  )
}
