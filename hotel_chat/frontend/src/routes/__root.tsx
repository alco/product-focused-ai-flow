import { createRootRoute, Outlet } from '@tanstack/react-router'
import '../../../brand/sona-brand.css'
import '../styles/app.css'

export const Route = createRootRoute({
  component: () => <Outlet />,
})
