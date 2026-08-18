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
        Static mockup pages, accessible by URL. No navigation, no backend, no data
        sync — layout and visual language only.
      </p>
      <ul style={{ lineHeight: 2 }}>
        <li><a href="/mobile/chats">/mobile/chats</a> — chat list (mobile home)</li>
        <li><a href="/mobile/chat-group">/mobile/chat-group</a> — group conversation</li>
        <li><a href="/mobile/chat-dm">/mobile/chat-dm</a> — 1-on-1 conversation</li>
        <li><a href="/mobile/channel">/mobile/channel</a> — announcement channel (reader)</li>
        <li><a href="/mobile/channel-manager">/mobile/channel-manager</a> — announcement channel (manager)</li>
        <li><a href="/mobile/people">/mobile/people</a> — people directory</li>
        <li><a href="/mobile/profile">/mobile/profile</a> — my profile / settings</li>
        <li><a href="/mobile/new-chat">/mobile/new-chat</a> — new chat flow</li>
        <li><a href="/mobile/onboarding">/mobile/onboarding</a> — invite → OTP onboarding</li>
        <li><a href="/desktop">/desktop</a> — desktop shell, open conversation</li>
        <li><a href="/desktop-empty">/desktop-empty</a> — desktop shell, nothing open</li>
      </ul>
    </div>
  )
}
