# Navigation Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static, non-navigating mockup screens in `hotel_chat/frontend` with real client-side navigation via TanStack Router, using a single responsive route tree that renders the mobile stack layout or the desktop split-view layout based on viewport width — no user-agent sniffing, no manual override.

**Architecture:** One route per URL concept (`/chats`, `/chat/$chatId`, `/people`, `/profile`, `/new-chat`, `/onboarding`) instead of separate `/mobile/*` and `/desktop*` trees. `/chats` and `/chat/$chatId` sit under a pathless layout route (`_appShell`) that renders the persistent desktop sidebar only when a `useIsDesktop()` viewport hook reports desktop width; on mobile the same routes render their existing full-screen phone chrome directly. Chat rows become real `Link`s driven by chat id, so mock data needs id-based lookups it doesn't have yet (a `chatEntryById` helper, per-chat message lookup, and `otherId` on DM entries).

**Scope boundary (read before starting):** Only screens that already have *both* a mobile and a desktop design get the responsive split: the chat list and open group/DM conversations. `people`, `profile`, `new-chat`, `onboarding`, and the two announcement-channel screens only ever had mobile mockups — this plan moves them to flat URLs and wires their links, but does not invent new desktop layouts for them, and does not add step-by-step interactivity inside `new-chat`/`onboarding` (per earlier decision, their internal wizard state — if ever built — stays local component state, out of scope here). `mobile/channel-manager.tsx` (the manager-posting variant) stays reachable only by direct URL, same as today — Priya (`currentUser`) is staff, so there's no in-app path to it yet.

**Tech Stack:** React 19, TanStack Router 1.170 (file-based routing, `@tanstack/router-plugin` with `autoCodeSplitting`), Vite 7, TypeScript 5.9. No test runner is installed in this project (`frontend/package.json` has no `vitest`/`jest`/etc.) and the project's established verification method (per the session-2 summary) is `pnpm dev` + manual/headless-browser click-through, not unit tests. Every task below substitutes a **dev-server verification step** for the unit-test step the standard TDD structure would otherwise use — write the code, then verify by loading the URL and checking the described behavior, then commit.

---

## File Structure

```
frontend/src/
├── hooks/
│   └── useIsDesktop.ts          NEW — viewport hook, matchMedia(min-width: 768px)
├── mock/
│   └── data.ts                  MODIFY — otherId on DM entries, chatEntryById,
│                                 messagesByChatId, companyChannel
├── components/
│   ├── TabBar.tsx                MODIFY — <a> → <Link>
│   ├── ChatRow.tsx                MODIFY — row becomes a <Link> to /chat/$chatId
│   ├── chat/ConversationTopBar.tsx  MODIFY — backHref prop → backTo, <a> → <Link>
│   ├── channel/ChannelTopbar.tsx  MODIFY — takes a channel prop, <a> → <Link>
│   └── desktop/MembersPanel.tsx   NEW — aside extracted from old desktop.tsx
├── routes/
│   ├── index.tsx                 MODIFY — update link list to new paths
│   ├── _appShell.tsx              NEW — pathless layout: desktop sidebar shell
│   ├── _appShell/
│   │   ├── chats.tsx              NEW — replaces mobile/chats.tsx + desktop-empty's main pane
│   │   └── chat.$chatId.tsx       NEW — replaces mobile/chat-group, chat-dm, channel,
│   │                               desktop.tsx, desktop-empty.tsx's open-chat case
│   ├── people.tsx                 NEW (moved from mobile/people.tsx)
│   ├── profile.tsx                NEW (moved from mobile/profile.tsx)
│   ├── new-chat.tsx               NEW (moved from mobile/new-chat.tsx)
│   ├── onboarding.tsx             NEW (moved from mobile/onboarding.tsx)
│   └── mobile/
│       ├── channel-manager.tsx    MODIFY — back link only, stays at this path
│       ├── chats.tsx              DELETE
│       ├── chat-dm.tsx            DELETE
│       ├── chat-group.tsx         DELETE
│       ├── channel.tsx            DELETE
│       ├── people.tsx             DELETE
│       ├── profile.tsx            DELETE
│       ├── new-chat.tsx           DELETE
│       └── onboarding.tsx         DELETE
├── routes/desktop.tsx             DELETE
└── routes/desktop-empty.tsx       DELETE
```

---

### Task 1: Viewport hook

**Files:**
- Create: `frontend/src/hooks/useIsDesktop.ts`

- [ ] **Step 1: Write the hook**

```ts
// frontend/src/hooks/useIsDesktop.ts
// Mirrors the brand stylesheet's own desktop breakpoint (sona-brand.css:61)
// so "desktop" here means the same thing it means everywhere else in the app.
import { useEffect, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 768px)'

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}
```

- [ ] **Step 2: Verify**

There's nothing to render yet — this compiles standalone. Run `pnpm -C frontend exec tsc -b --noEmit` (or just `pnpm -C frontend build` later once it's used) and confirm no type errors once Task 5/6 import it.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useIsDesktop.ts
git commit -m "Add useIsDesktop viewport hook"
```

---

### Task 2: Mock data — id-based lookups

**Files:**
- Modify: `frontend/src/mock/data.ts`

- [ ] **Step 1: Add `otherId` to `ChatListEntry` and populate every DM entry**

Change the interface (around line 18):

```ts
export interface ChatListEntry {
  id: string
  kind: ChatKind
  name: string // for DMs: the other person's name
  otherId?: PersonId // for kind: 'dm' — the other participant's id
  lastAuthor?: string
  lastMessage: string
  lastTime: string
  unread: number
  favorite?: boolean
  muted?: boolean
  memberCount?: number
}
```

Then add `otherId` to every `kind: 'dm'` entry, matching the person the DM's `name` already names:

- `favoriteChats` → `dm-daniel` gets `otherId: 'daniel'`
- `recentChats` → `dm-amira` gets `otherId: 'amira'`, `dm-yuki` gets `otherId: 'yuki'`, `dm-marco` gets `otherId: 'marco'`, `dm-hannah` gets `otherId: 'hannah'`, `dm-stefan` gets `otherId: 'stefan'`, `dm-grace` gets `otherId: 'grace'`, `dm-liam` gets `otherId: 'liam'`

(Each is just adding one `otherId: '<id>',` line to the existing object literal — the id matches the person already implied by the DM's display name.)

- [ ] **Step 2: Add a company channel record next to `locationChannel`**

Right after the `locationChannel` export (around line 336):

```ts
export const companyChannel = {
  id: 'company-channel',
  name: company.name,
  audience: 'Everyone at every Harbourlight property',
}
```

- [ ] **Step 3: Add the lookup helpers at the bottom of the file**

Append after `export const companyChannelEntry = officialChats[0]`:

```ts
// --- Id-based lookups for routing ------------------------------------------

export const allChats: ChatListEntry[] = [...officialChats, ...favoriteChats, ...recentChats]

export const chatEntryById = (id: string): ChatListEntry | undefined =>
  allChats.find((c) => c.id === id)

/**
 * Full transcripts only exist for the two conversations built out in the
 * mockup stage. Every other chat/DM id resolves to an empty transcript
 * rather than fabricated messages.
 */
export const messagesByChatId: Record<string, Message[]> = {
  [groupChat.id]: groupMessages,
  [dmChat.id]: dmMessages,
}
```

- [ ] **Step 4: Verify**

```bash
pnpm -C frontend exec tsc -b --noEmit
```
Expected: no errors (this file has no consumers yet, so this just checks the new code itself type-checks).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/mock/data.ts
git commit -m "Add id-based chat/message lookups to mock data"
```

---

### Task 3: Shared UI — real `Link`s instead of `<a href>`

**Files:**
- Modify: `frontend/src/components/TabBar.tsx`
- Modify: `frontend/src/components/chat/ConversationTopBar.tsx`
- Modify: `frontend/src/components/channel/ChannelTopbar.tsx`
- Modify: `frontend/src/components/ChatRow.tsx`

- [ ] **Step 1: `TabBar.tsx`**

```tsx
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
```

- [ ] **Step 2: `ConversationTopBar.tsx`** — rename `backHref` to `backTo`, use `Link`

```tsx
// Top bar for an open conversation: back chevron (optional), avatar, name,
// subtitle. Reused by mobile conversation screens and the desktop shell
// (desktop: omit backTo).

import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import '../../styles/conversation.css'

export function ConversationTopBar({
  backTo,
  avatar,
  title,
  subtitle,
}: {
  backTo?: string
  avatar?: ReactNode
  title: string
  subtitle?: ReactNode
}) {
  return (
    <header className="topbar">
      {backTo && (
        <Link className="back-chevron" to={backTo} aria-label="Back">
          ‹
        </Link>
      )}
      {avatar}
      <div style={{ minWidth: 0 }}>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
    </header>
  )
}
```

- [ ] **Step 3: `ChannelTopbar.tsx`** — accept the channel instead of hardcoding `locationChannel`, use `Link`

```tsx
// Topbar for the announcement channel screens: back chevron, lime-tinted
// megaphone glyph, channel name + audience, and the OFFICIAL mono tag.

import { Link } from '@tanstack/react-router'

export function ChannelTopbar({ channel }: { channel: { name: string; audience: string } }) {
  return (
    <header className="topbar">
      <Link className="back-chevron" to="/chats" aria-label="Back to chats">
        ‹
      </Link>
      <span className="channel-glyph" aria-hidden>
        📣
      </span>
      <div className="channel-topbar-info">
        <h1 className="topbar-title">{channel.name}</h1>
        <p className="topbar-subtitle">{channel.audience}</p>
      </div>
      <span className="eyebrow eyebrow--lime channel-official-tag">Official</span>
    </header>
  )
}
```

- [ ] **Step 4: `ChatRow.tsx`** — the row itself becomes the link target

Replace the `<div className={...chat-row...}>` wrapper in `ChatRow` with a `Link`:

```tsx
// Chat-list row + stacked sections, shared by the mobile chat list
// (/chats) and the desktop sidebar. Rows navigate to /chat/$chatId.

import { Link } from '@tanstack/react-router'
import { Avatar } from './Avatar'
import { favoriteChats, groupEmoji, officialChats, recentChats } from '../mock/data'
import type { ChatListEntry } from '../mock/data'
import '../styles/chat-list.css'

export function ChatRow({
  chat,
  official,
  active,
}: {
  chat: ChatListEntry
  official?: boolean
  active?: boolean
}) {
  const unread = chat.unread > 0
  const authorPrefix =
    chat.lastAuthor && !chat.lastMessage.startsWith('You:') ? `${chat.lastAuthor}: ` : ''

  return (
    <Link
      to="/chat/$chatId"
      params={{ chatId: chat.id }}
      className={`chat-row${unread ? ' chat-row--unread' : ''}${active ? ' chat-row--active' : ''}`}
    >
      {chat.kind === 'dm' ? (
        <Avatar name={chat.name} />
      ) : (
        <span className={`chat-tile${official ? ' chat-tile--official' : ''}`} aria-hidden>
          {official ? '📣' : (groupEmoji[chat.id] ?? '👥')}
        </span>
      )}
      <div className="chat-main">
        <div className="chat-name-row">
          <span className="chat-name">{chat.name}</span>
          {chat.favorite && (
            <span className="chat-flag" aria-hidden>
              ⭐
            </span>
          )}
        </div>
        <div className="chat-preview">
          {authorPrefix}
          {chat.lastMessage}
        </div>
      </div>
      <div className="chat-meta">
        <span className="chat-time">{chat.lastTime}</span>
        {unread ? (
          <span className="unread-badge">{chat.unread}</span>
        ) : chat.muted ? (
          <span className="chat-mute" title="Muted" aria-label="Muted">
            🔕
          </span>
        ) : null}
      </div>
    </Link>
  )
}

export function ChatSections({ activeChatId }: { activeChatId?: string }) {
  return (
    <>
      <section className="chat-section chat-section--official">
        <div className="section-label">📌 Official</div>
        {officialChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} official active={chat.id === activeChatId} />
        ))}
      </section>

      <section className="chat-section">
        <div className="section-label">⭐ Favorites</div>
        {favoriteChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} active={chat.id === activeChatId} />
        ))}
      </section>

      <section className="chat-section">
        <div className="section-label">All chats</div>
        {recentChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} active={chat.id === activeChatId} />
        ))}
      </section>
    </>
  )
}
```

`.chat-row` CSS currently targets a `div` — check `frontend/src/styles/chat-list.css` for `.chat-row { display: ... }` and confirm the rule isn't `div.chat-row`-scoped (element-tag-qualified). If it's a plain class selector (expected), no CSS change is needed since `Link` renders an `<a>` and the class still applies.

- [ ] **Step 5: Verify**

These four files won't compile cleanly until Tasks 5–8 update every caller of `backHref`/`ChannelTopbar` — that's expected and resolved by the end of Task 7. Don't run a full build yet; just eyeball the diffs for typos.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/TabBar.tsx frontend/src/components/ChatRow.tsx \
  frontend/src/components/chat/ConversationTopBar.tsx frontend/src/components/channel/ChannelTopbar.tsx
git commit -m "Convert shared nav chrome from <a href> to router Link"
```

(This commit will not build in isolation — callers are fixed in the following tasks. That's fine for local history; if you want every commit green, fold this into Task 7's commit instead.)

---

### Task 4: `MembersPanel` component

**Files:**
- Create: `frontend/src/components/desktop/MembersPanel.tsx`

- [ ] **Step 1: Extract the aside markup from the old `desktop.tsx`**

```tsx
// frontend/src/components/desktop/MembersPanel.tsx
// Desktop-only members list for an open group conversation.

import { Avatar } from '../Avatar'
import type { Person } from '../../mock/data'

function MemberRow({ person }: { person: Person }) {
  return (
    <li className="member-row">
      <span className="member-avatar">
        <Avatar name={person.name} size={32} />
        {person.online && <span className="member-dot" aria-hidden />}
      </span>
      <div className="member-main">
        <div className="member-name-row">
          <span className="member-name">{person.name}</span>
          {person.role === 'manager' && <span className="pill pill--stone">Manager</span>}
        </div>
        <div className="member-title">{person.jobTitle}</div>
      </div>
    </li>
  )
}

export function MembersPanel({ members }: { members: Person[] }) {
  return (
    <aside className="desktop-members">
      <div className="section-label">Members — {members.length}</div>
      <ul className="member-list">
        {members.map((person) => (
          <MemberRow key={person.id} person={person} />
        ))}
      </ul>
    </aside>
  )
}
```

- [ ] **Step 2: Verify**

`pnpm -C frontend exec tsc -b --noEmit` — no consumers yet, should type-check standalone.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/desktop/MembersPanel.tsx
git commit -m "Extract desktop MembersPanel from the old /desktop route"
```

---

### Task 5: `_appShell` pathless layout

**Files:**
- Create: `frontend/src/routes/_appShell.tsx`

- [ ] **Step 1: Write the layout route**

```tsx
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
```

- [ ] **Step 2: Verify**

This won't be reachable until Task 6 adds child routes — skip running the dev server for this step alone.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/_appShell.tsx
git commit -m "Add pathless app-shell layout route for the desktop split view"
```

---

### Task 6: `/chats` route

**Files:**
- Create: `frontend/src/routes/_appShell/chats.tsx`
- Delete: `frontend/src/routes/mobile/chats.tsx` (after this task's verify step passes)

- [ ] **Step 1: Write the route**

```tsx
// frontend/src/routes/_appShell/chats.tsx
// Mobile: full chat-list screen (was /mobile/chats).
// Desktop: the "nothing open" welcome pane (was desktop-empty.tsx's <main>),
// rendered next to the sidebar the _appShell layout already provides.
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChatSections } from '../../components/ChatRow'
import { TabBar } from '../../components/TabBar'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { announcements, currentUser, location, locationChannel } from '../../mock/data'
import '../../styles/chat-list.css'

export const Route = createFileRoute('/_appShell/chats')({
  component: ChatsRoute,
})

const latest = announcements[announcements.length - 1]
const firstName = currentUser.name.split(' ')[0]

function ChatsRoute() {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
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
    )
  }

  return (
    <div className="phone">
      <header className="topbar">
        <div>
          <h1 className="topbar-title">Chats</h1>
          <p className="topbar-subtitle">{location.name}</p>
        </div>
      </header>

      <div className="phone-scroll">
        <ChatSections />
      </div>

      <Link className="fab" to="/new-chat" aria-label="New chat">
        +
      </Link>
      <TabBar active="chats" />
    </div>
  )
}
```

- [ ] **Step 2: Delete the superseded route**

```bash
rm frontend/src/routes/mobile/chats.tsx
```

- [ ] **Step 3: Verify**

```bash
pnpm -C frontend dev
```
Open the printed local URL at a narrow viewport (e.g. resize devtools to 375px, or use the device toolbar): expect the mobile chat list with the FAB and tab bar. Widen the window past 768px: expect the router to still be on `/chats` but now show the sidebar + welcome pane side by side, no full reload (check the Network tab shows no document navigation on resize — resizing shouldn't hit the network at all). Confirm no console errors about missing route `/_appShell/chats` in `routeTree.gen.ts` (the router-plugin regenerates it automatically on save — if the URL 404s, check `frontend/src/routeTree.gen.ts` was regenerated with a `/_appShell/chats` node before debugging further).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/_appShell/chats.tsx
git rm frontend/src/routes/mobile/chats.tsx
git commit -m "Add responsive /chats route, replacing /mobile/chats"
```

---

### Task 7: `/chat/$chatId` route

**Files:**
- Create: `frontend/src/routes/_appShell/chat.$chatId.tsx`
- Delete: `frontend/src/routes/mobile/chat-dm.tsx`, `frontend/src/routes/mobile/chat-group.tsx`, `frontend/src/routes/mobile/channel.tsx`, `frontend/src/routes/desktop.tsx`, `frontend/src/routes/desktop-empty.tsx`

- [ ] **Step 1: Write the route**

```tsx
// frontend/src/routes/_appShell/chat.$chatId.tsx
// Handles every chat-list row: group and DM conversations get the
// message-thread screen (mobile: full phone chrome with a back chevron;
// desktop: bare pane + members aside, both siblings of the sidebar the
// _appShell layout renders). Company/location channels get the
// announcement-feed screen, which only has a mobile design so far — it
// renders the same phone chrome regardless of viewport (known gap, not
// part of this plan's scope).
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Avatar } from '../../components/Avatar'
import { Composer } from '../../components/chat/Composer'
import { ConversationTopBar } from '../../components/chat/ConversationTopBar'
import { GroupTile } from '../../components/chat/GroupTile'
import { MessageList } from '../../components/chat/MessageList'
import { MembersPanel } from '../../components/desktop/MembersPanel'
import { AnnouncementFeed } from '../../components/channel/AnnouncementFeed'
import { ChannelTopbar } from '../../components/channel/ChannelTopbar'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import {
  chatEntryById,
  companyChannel,
  groupChat,
  locationChannel,
  messagesByChatId,
  personById,
} from '../../mock/data'
import type { ChatListEntry } from '../../mock/data'
import { channelFeed } from '../../mock/channel'
import '../../styles/conversation.css'
import '../../styles/channel.css'

export const Route = createFileRoute('/_appShell/chat/$chatId')({
  component: ChatRoute,
})

function ChatRoute() {
  const { chatId } = Route.useParams()
  const isDesktop = useIsDesktop()
  const chat = chatEntryById(chatId)

  if (!chat) {
    return (
      <main className="desktop-main">
        <div className="container" style={{ padding: '3rem' }}>
          Chat not found.
        </div>
      </main>
    )
  }

  if (chat.kind === 'company' || chat.kind === 'location') {
    return <ChannelScreen chat={chat} />
  }

  return <ConversationScreen chat={chat} isDesktop={isDesktop} />
}

function ChannelScreen({ chat }: { chat: ChatListEntry }) {
  const channel = chat.kind === 'company' ? companyChannel : locationChannel
  // Only the location channel has authored posts in the mock data; the
  // company channel is a real, empty inbox rather than fabricated content.
  const posts = chat.kind === 'location' ? channelFeed : []

  return (
    <div className="phone">
      <ChannelTopbar channel={channel} />
      <div className="phone-scroll channel-scroll">
        {posts.length > 0 ? (
          <AnnouncementFeed posts={posts} showAddReaction />
        ) : (
          <p className="text-muted" style={{ padding: '1.5rem' }}>
            No announcements yet.
          </p>
        )}
      </div>
      <footer className="channel-footer">
        <span className="channel-footer-note">◆ Only managers can post</span>
      </footer>
    </div>
  )
}

function ConversationScreen({
  chat,
  isDesktop,
}: {
  chat: ChatListEntry
  isDesktop: boolean
}) {
  const messages = messagesByChatId[chat.id] ?? []
  const isGroup = chat.kind === 'group'
  const other = chat.kind === 'dm' && chat.otherId ? personById(chat.otherId) : undefined

  const avatar: ReactNode = isGroup ? (
    <GroupTile name={chat.name} />
  ) : (
    <Avatar name={chat.name} size={40} />
  )

  const subtitle: ReactNode = isGroup
    ? chat.memberCount
      ? `${chat.memberCount} members`
      : undefined
    : other && (
        <>
          {other.jobTitle} · <span className="presence-dot" /> {other.online ? 'online' : 'offline'}
        </>
      )

  const topbar = (
    <ConversationTopBar
      backTo={isDesktop ? undefined : '/chats'}
      avatar={avatar}
      title={chat.name}
      subtitle={subtitle}
    />
  )

  const transcript =
    messages.length > 0 ? (
      <MessageList messages={messages} showAuthors={isGroup} />
    ) : (
      <p className="text-muted" style={{ padding: '1.5rem' }}>
        No messages yet.
      </p>
    )

  // Full member rosters only exist in the mock data for the one group chat
  // built out in the mockup stage (wedding-ops); other group ids show no
  // members panel rather than a fabricated roster.
  const members =
    isGroup && chat.id === groupChat.id
      ? groupChat.memberIds.map(personById).sort((a, b) => {
          if (a.role !== b.role) return a.role === 'manager' ? -1 : 1
          return a.name.localeCompare(b.name)
        })
      : undefined

  if (!isDesktop) {
    return (
      <div className="phone">
        {topbar}
        <div className="phone-scroll convo-scroll">{transcript}</div>
        <Composer />
      </div>
    )
  }

  return (
    <>
      <main className="desktop-main">
        {topbar}
        <div className="convo-scroll desktop-convo">
          <div className="desktop-transcript">{transcript}</div>
        </div>
        <Composer />
      </main>
      {members && <MembersPanel members={members} />}
    </>
  )
}
```

- [ ] **Step 2: Delete the superseded routes**

```bash
rm frontend/src/routes/mobile/chat-dm.tsx frontend/src/routes/mobile/chat-group.tsx \
   frontend/src/routes/mobile/channel.tsx frontend/src/routes/desktop.tsx \
   frontend/src/routes/desktop-empty.tsx
```

- [ ] **Step 3: Verify**

```bash
pnpm -C frontend dev
```
At a narrow viewport:
- `/chat/wedding-ops` → phone chrome, back chevron to `/chats`, full "Saturday Wedding — Ops" transcript with author names, composer at the bottom.
- `/chat/dm-daniel` → phone chrome, Daniel's DM transcript.
- `/chat/housekeeping` → phone chrome, topbar shows "Housekeeping" and member count, transcript area shows "No messages yet." (expected — no mock transcript exists for this id).
- `/chat/location-channel` → announcement-feed screen (bulletin cards), same at any width.
- `/chat/company-channel` → announcement topbar, "No announcements yet."
- From `/chats`, tap a chat row: expect an instant client-side transition (no full-page flash) to `/chat/$id`, then tap back: returns to `/chats`.

At a wide viewport (≥768px):
- `/chats` → sidebar + welcome pane (Task 6).
- Click "Saturday Wedding — Ops" in the sidebar: URL becomes `/chat/wedding-ops`, sidebar stays mounted (no flicker/remount — check React DevTools or just that scroll position in the sidebar list is preserved), main pane shows the conversation, members aside appears on the right.
- Click "Housekeeping": sidebar's active-row highlight moves to Housekeeping, main pane shows "No messages yet.", no members aside (no roster data for this id — expected per this task's scope).
- Click the location-channel official row: main content becomes the channel screen (still phone-styled per the noted gap), sidebar remains visible.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/_appShell/chat.\$chatId.tsx
git rm frontend/src/routes/mobile/chat-dm.tsx frontend/src/routes/mobile/chat-group.tsx \
  frontend/src/routes/mobile/channel.tsx frontend/src/routes/desktop.tsx \
  frontend/src/routes/desktop-empty.tsx
git add frontend/src/components/TabBar.tsx frontend/src/components/ChatRow.tsx \
  frontend/src/components/chat/ConversationTopBar.tsx frontend/src/components/channel/ChannelTopbar.tsx
git commit -m "Add responsive /chat/\$chatId route, replacing the split mobile/desktop conversation screens"
```

---

### Task 8: Move `/people`, `/profile`, `/new-chat`, `/onboarding` to flat routes

**Files:**
- Create: `frontend/src/routes/people.tsx`, `frontend/src/routes/profile.tsx`, `frontend/src/routes/new-chat.tsx`, `frontend/src/routes/onboarding.tsx`
- Delete: `frontend/src/routes/mobile/people.tsx`, `frontend/src/routes/mobile/profile.tsx`, `frontend/src/routes/mobile/new-chat.tsx`, `frontend/src/routes/mobile/onboarding.tsx`

These four keep their existing mobile-only layout verbatim (no responsive branching — no desktop design exists for them, per this plan's scope boundary). Only three things change per file: the route path in `createFileRoute(...)`, import paths going from `../../` to `../` (they're moving up one directory), and any hardcoded `<a href="/mobile/...">` becoming `<Link to="/...">`.

- [ ] **Step 1: `people.tsx`**

```tsx
// frontend/src/routes/people.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { TabBar } from '../components/TabBar'
import { location, people } from '../mock/data'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/people')({
  component: PeopleScreen,
})

const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))

function PeopleScreen() {
  return (
    <div className="phone">
      <header className="topbar">
        <div>
          <h1 className="topbar-title">People</h1>
          <p className="topbar-subtitle">
            {location.name} · {people.length} people
          </p>
        </div>
      </header>

      <div className="phone-scroll">
        <div className="search-field">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          Search name or role
        </div>

        <ul className="people-list">
          {sortedPeople.map((person) => (
            <li key={person.id} className="person-row">
              <span className="presence-wrap">
                <Avatar name={person.name} />
                {person.online && <span className="presence-dot" aria-hidden />}
              </span>
              <div className="person-main">
                <div className="person-name-row">
                  <span className="person-name">{person.name}</span>
                  {person.role === 'manager' && (
                    <span className="pill pill--stone">Manager</span>
                  )}
                </div>
                <div className="person-meta">
                  {person.jobTitle} · {person.location}
                </div>
              </div>
              <button type="button" className="dm-ghost" aria-label={`Message ${person.name}`}>
                💬
              </button>
            </li>
          ))}
        </ul>
      </div>

      <TabBar active="people" />
    </div>
  )
}
```

- [ ] **Step 2: `profile.tsx`**

```tsx
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
```

- [ ] **Step 3: `new-chat.tsx`** — only the close-x becomes a `Link`

```tsx
// frontend/src/routes/new-chat.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { currentUser, people, personById } from '../mock/data'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/new-chat')({
  component: NewChatScreen,
})

// Mocked mid-action: group mode with three people already selected.
const selectedIds = ['amira', 'jamal', 'hannah']
const selectedPeople = selectedIds.map(personById)

const candidates = people
  .filter((p) => p.id !== currentUser.id)
  .sort((a, b) => a.name.localeCompare(b.name))

function NewChatScreen() {
  return (
    <div className="phone">
      <header className="topbar">
        <Link className="close-x" to="/chats" aria-label="Close">
          ✕
        </Link>
        <h1 className="topbar-title">New chat</h1>
      </header>

      <div className="newchat-scroll">
        <div className="search-field">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          Search name or role
        </div>

        <div className="group-strip">
          <div className="section-label">New group · {selectedPeople.length} selected</div>
          <div className="chip-row">
            {selectedPeople.map((person) => (
              <span key={person.id} className="chip">
                <Avatar name={person.name} size={24} />
                {person.name}
                <span className="chip-x" aria-hidden>
                  ✕
                </span>
              </span>
            ))}
          </div>
          <div className="group-name-field">
            <input
              className="text-input"
              type="text"
              defaultValue="Lobby Refresh Project"
              placeholder="Group name"
              aria-label="Group name"
            />
          </div>
        </div>

        <ul className="people-list">
          {candidates.map((person) => {
            const checked = selectedIds.includes(person.id)
            return (
              <li key={person.id} className="person-row">
                <span className={`check-circle${checked ? ' checked' : ''}`} aria-hidden>
                  ✓
                </span>
                <span className="presence-wrap">
                  <Avatar name={person.name} size={40} />
                  {person.online && <span className="presence-dot" aria-hidden />}
                </span>
                <div className="person-main">
                  <div className="person-name-row">
                    <span className="person-name">{person.name}</span>
                  </div>
                  <div className="person-meta">{person.jobTitle}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="newchat-footer">
        <button type="button" className="btn btn-primary btn-block">
          Create group chat
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `onboarding.tsx`** — path only, no links inside to change

```tsx
// frontend/src/routes/onboarding.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { currentUser, location, managerUser } from '../mock/data'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingScreen,
})

// Mocked mid-entry: four of six OTP digits typed, caret in the fifth box.
const otpDigits = ['4', '8', '2', '7', null, null]
const caretIndex = 4

function OnboardingScreen() {
  return (
    <div className="phone onboard-phone">
      <div className="onboard-scroll">
        <header className="onboard-header">
          <div className="onboard-wordmark">
            Harbourlight<span className="dot">.</span>
          </div>
          <span className="eyebrow">Staff chat</span>
        </header>

        <section className="onboard-step">
          <span className="eyebrow">Step 1 — Verify</span>
          <div className="onboard-card">
            <h3>You&rsquo;ve been invited</h3>
            <div className="invited-by">
              <Avatar name={managerUser.name} size={36} />
              <span>
                <strong>{managerUser.name}</strong> ({managerUser.jobTitle}) invited you to
                join {location.name}
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
              Enter the code we texted to +44&nbsp;••••&nbsp;417
            </p>
            <div className="otp-row">
              {otpDigits.map((digit, i) => (
                <span
                  key={i}
                  className={`otp-box${i === caretIndex ? ' active' : ''}`}
                >
                  {digit ?? (i === caretIndex ? <span className="otp-caret">|</span> : '')}
                </span>
              ))}
            </div>
            <div className="resend-line">Resend code (0:42)</div>
            <button type="button" className="btn btn-primary btn-block">
              Continue
            </button>
          </div>
        </section>

        <section className="onboard-step">
          <span className="eyebrow">Step 2 — Profile</span>
          <div className="onboard-card">
            <div className="photo-drop" aria-hidden>
              📷
            </div>
            <div>
              <label className="field-label" htmlFor="onboard-name">
                Your name
              </label>
              <input
                id="onboard-name"
                className="text-input"
                type="text"
                defaultValue={currentUser.name}
              />
            </div>
            <div>
              <span className="field-label">Job title</span>
              <div className="readonly-field">{currentUser.jobTitle}</div>
              <div className="field-note">Set by your manager</div>
            </div>
            <button type="button" className="btn btn-lime btn-join btn-block">
              Join the team
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Delete the superseded routes**

```bash
rm frontend/src/routes/mobile/people.tsx frontend/src/routes/mobile/profile.tsx \
   frontend/src/routes/mobile/new-chat.tsx frontend/src/routes/mobile/onboarding.tsx
```

- [ ] **Step 6: Verify**

```bash
pnpm -C frontend dev
```
Visit `/people`, `/profile`, `/new-chat`, `/onboarding` directly — each renders as before. From `/people` or `/profile`, tap the tab bar's other tabs and confirm `TabBar`'s new `Link`-based nav (Task 3) now works end-to-end: Chats ↔ People ↔ Profile switch with no full reload. From `/chats`, tap the FAB: lands on `/new-chat`; tap the ✕: returns to `/chats`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/routes/people.tsx frontend/src/routes/profile.tsx \
  frontend/src/routes/new-chat.tsx frontend/src/routes/onboarding.tsx
git rm frontend/src/routes/mobile/people.tsx frontend/src/routes/mobile/profile.tsx \
  frontend/src/routes/mobile/new-chat.tsx frontend/src/routes/mobile/onboarding.tsx
git commit -m "Move people/profile/new-chat/onboarding to flat routes"
```

---

### Task 9: `channel-manager.tsx` back link + mockup index page

**Files:**
- Modify: `frontend/src/routes/mobile/channel-manager.tsx`
- Modify: `frontend/src/routes/index.tsx`

- [ ] **Step 1: Fix the manager channel screen's back link**

It doesn't use `ChannelTopbar` (it renders its own header inline — check the file; if it does use `ChannelTopbar`, update the same way). If it has its own `<a href="/mobile/chats">`, change it to:

```tsx
import { Link } from '@tanstack/react-router'
// ...
<Link className="back-chevron" to="/chats" aria-label="Back to chats">
  ‹
</Link>
```

Leave the route path itself (`/mobile/channel-manager`) unchanged — per this plan's scope, it's a direct-URL-only design preview, not part of the click-through flow.

- [ ] **Step 2: Update the mockup index page's links**

```tsx
// frontend/src/routes/index.tsx
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
```

(Plain `<a>` here is fine — this index page is a dev-only mockup directory, not part of the product's navigation.)

- [ ] **Step 3: Verify**

```bash
pnpm -C frontend dev
```
Visit `/`, click through every link, confirm each lands correctly and none 404.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/mobile/channel-manager.tsx frontend/src/routes/index.tsx
git commit -m "Update manager channel back-link and mockup index for the new routes"
```

---

### Task 10: Full click-through smoke test

**Files:** none — verification only.

- [ ] **Step 1: Mobile-width click-through**

```bash
pnpm -C frontend dev
```
At <768px width, starting from `/chats`: tap into the wedding-ops group, back out, tap into a DM, back out, tap the official location-channel row, back out, tap the FAB into new-chat, close it, switch through all three tab-bar destinations. Confirm every transition is instant (no full-page reload — watch the Network tab for `document` requests, there should be exactly one, the initial load).

- [ ] **Step 2: Desktop-width click-through**

Widen to ≥768px on `/chats`. Click through several sidebar rows (including one with no transcript, e.g. `front-desk`) and confirm the sidebar/members-panel chrome never remounts (no flash), only the main pane content and the URL change.

- [ ] **Step 3: Live resize**

While sitting on `/chat/wedding-ops`, drag the window across the 768px boundary without navigating. Confirm the layout swaps between phone chrome and split view without losing the open chat or throwing console errors.

- [ ] **Step 4: Type-check the whole frontend**

```bash
pnpm -C frontend exec tsc -b --noEmit
```
Expected: no errors. This is the first point in the plan where every file has all its callers updated, so this is the real full-project verification gate.

- [ ] **Step 5: No commit** — this task only verifies prior commits; if it surfaces a bug, fix it as a fixup within the task where the bug was introduced (find via `git log` / `git blame`) rather than a new bolt-on commit, unless the plan is already fully committed and pushed, in which case a small `fix:` commit is fine.

---

## Known follow-ups (explicitly out of scope here)

- Desktop layouts for People, Profile, New Chat, Onboarding, and the announcement-channel screens — none existed before this plan; it only wires their navigation, not new visual designs.
- Message transcripts and member rosters only exist in mock data for `wedding-ops` and `dm-daniel`; every other chat/DM id is a real, empty conversation, not a fabricated one.
- `mobile/channel-manager.tsx` has no click-through entry point (the app's single mock user, Priya, is staff, not a manager) — still URL-only.
- New-chat/onboarding internal step progression stays local component state if/when it's ever built (per the earlier scoping decision) — this plan doesn't touch it.
