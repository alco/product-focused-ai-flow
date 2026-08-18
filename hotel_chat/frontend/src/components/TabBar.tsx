// Bottom tab bar for mobile screens.

import { Link } from '@tanstack/react-router'

const tabs = [
  { key: 'chats', label: 'Chats', icon: '💬', href: '/chats' },
  { key: 'people', label: 'People', icon: '👥', href: '/people' },
  { key: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
] as const

export type TabKey = (typeof tabs)[number]['key']

export function TabBar({ active }: { active: TabKey }) {
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <Link key={t.key} className={`tabbar-item${t.key === active ? ' active' : ''}`} to={t.href}>
          <span className="tab-icon" aria-hidden>
            {t.icon}
          </span>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
