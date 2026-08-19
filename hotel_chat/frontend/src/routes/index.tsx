import { createFileRoute, redirect } from '@tanstack/react-router'

// The session-2 mockup screen index lived here; its slug-based demo URLs
// (/chat/wedding-ops …) stopped resolving when real seeded ids replaced the
// fixtures. The root now goes straight into the app.
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/chats' })
  },
})
