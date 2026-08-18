import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: MockupIndex,
})

function MockupIndex() {
  return (
    <div className="container" style={{ paddingBlock: '3rem', maxWidth: '40rem' }}>
      <span className="eyebrow">UI Mockups</span>
      <h2 style={{ marginTop: '0.75rem' }}>Hotel Chat</h2>
      <p className="text-muted">
        Screens navigate for real now — resize the window to switch between the
        mobile and desktop layouts.
      </p>
      <ul style={{ lineHeight: 2 }}>
        <li><a href="/chats">/chats</a> — chat list (mobile) / sidebar + welcome (desktop)</li>
        <li><a href="/chat/wedding-ops">/chat/wedding-ops</a> — group conversation</li>
        <li><a href="/chat/dm-daniel">/chat/dm-daniel</a> — 1-on-1 conversation</li>
        <li><a href="/chat/location-channel">/chat/location-channel</a> — announcement channel (reader)</li>
        <li><a href="/mobile/channel-manager">/mobile/channel-manager</a> — announcement channel (manager, design preview only)</li>
        <li><a href="/people">/people</a> — people directory</li>
        <li><a href="/profile">/profile</a> — my profile / settings</li>
        <li><a href="/new-chat">/new-chat</a> — new chat flow</li>
        <li><a href="/onboarding">/onboarding</a> — invite → OTP onboarding</li>
      </ul>
    </div>
  )
}
