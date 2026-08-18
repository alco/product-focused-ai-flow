// frontend/src/routes/_appShell.tsx
// Pathless layout for /chats and /chat/$chatId: on desktop viewports it
// renders the persistent sidebar + whatever the child route puts in
// <Outlet/> (a <main> and, for open group chats, a sibling <aside>) inside
// one flex row. On mobile it renders nothing extra — each child route owns
// its own full-screen phone chrome, same as the pre-navigation mockups did.
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router'
import { Sidebar } from '../components/desktop/Sidebar'
import { useIsDesktop } from '../hooks/useIsDesktop'
import '../styles/desktop.css'

export const Route = createFileRoute('/_appShell')({
  component: AppShell,
})

function AppShell() {
  const isDesktop = useIsDesktop()
  const { chatId } = useParams({ strict: false })

  if (!isDesktop) {
    return <Outlet />
  }

  return (
    <div className="desktop-shell">
      <Sidebar activeChatId={chatId} />
      <Outlet />
    </div>
  )
}
