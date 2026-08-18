// Desktop shell with nothing open: persistent sidebar + a calm static
// welcome page in the main area (session-1 Round 7 decision — placeholder
// until a chat is opened; no stats, those are a deferred product decision).

import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../components/desktop/Sidebar'
import { announcements, currentUser, location, locationChannel } from '../mock/data'
import '../styles/desktop.css'

export const Route = createFileRoute('/desktop-empty')({
  component: DesktopEmptyShell,
})

const latest = announcements[announcements.length - 1]
const firstName = currentUser.name.split(' ')[0]

function DesktopEmptyShell() {
  return (
    <div className="desktop-shell">
      <Sidebar />

      <main className="desktop-main desktop-main--empty">
        <div className="desktop-welcome">
          <span className="eyebrow">{location.name}</span>
          <h1 className="welcome-title">Good afternoon, {firstName}</h1>
          <p className="welcome-hint text-muted">
            Pick a conversation from the sidebar to start chatting.
          </p>

          <div className="card card-pad welcome-card">
            <div className="welcome-card-top">
              <span className="welcome-card-channel">📣 {locationChannel.name}</span>
              <span className="welcome-card-time">{latest.time}</span>
            </div>
            <div className="welcome-card-title">
              {latest.emoji} {latest.title}
            </div>
            <p className="welcome-card-text">{latest.text}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
