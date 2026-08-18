// Bottom tab bar for mobile screens. Static — no navigation wiring in mockups.

const tabs = [
  { key: 'chats', label: 'Chats', icon: '💬', href: '/mobile/chats' },
  { key: 'people', label: 'People', icon: '👥', href: '/mobile/people' },
  { key: 'profile', label: 'Profile', icon: '👤', href: '/mobile/profile' },
] as const

export type TabKey = (typeof tabs)[number]['key']

export function TabBar({ active }: { active: TabKey }) {
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <a key={t.key} className={`tabbar-item${t.key === active ? ' active' : ''}`} href={t.href}>
          <span className="tab-icon" aria-hidden>
            {t.icon}
          </span>
          {t.label}
        </a>
      ))}
    </nav>
  )
}
