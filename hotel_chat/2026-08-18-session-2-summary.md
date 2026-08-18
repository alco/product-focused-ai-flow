# Hotel Chat — Session 2 Summary: UI Mockups & Frontend Scaffold

**Date:** 2026-08-18 · **Format:** autonomous execution by Claude with parallel subagents, Oleksii observing · **Companion log:** `2026-08-18-session-2-log.md` · **Previous:** `2026-08-18-session-1-summary.md`

## 1. Premise

With the MVP scope fixed in session 1 and the brand distilled from sona.ai into `2026-08-18-brand-guidelines.md` + `brand/sona-brand.css`, this session had two jobs from the UI-mockup brief: stand up a working frontend project on the chosen stack (React, TanStack Router — not Start, TanStack DB v0.6+, Vite, TypeScript), and build static mockups of every MVP screen, each reachable by URL with no navigation wiring, no backend, and no data — honing the client's UX before any logic exists. Parallel subagents build individual screens; the main agent enforces consistency.

## 2. Key decisions and forks in the road

| # | Topic | Decision |
|---|-------|----------|
| 1 | Project shape | `hotel_chat/frontend` scaffolded by hand (not create-vite): Vite 7 + React 19 + TS 5.9, file-based routing via `@tanstack/router-plugin` with `autoCodeSplitting`. TanStack DB 0.7.2 installed but **deliberately unused** at mockup stage — screens read plain mock constants. pnpm as package manager. |
| 2 | TanStack skills | Activated the packages' bundled agent skills per the electric.ax blog: `npx @tanstack/intent install` (generates `frontend/AGENTS.md`; skills load via `pnpm dlx @tanstack/intent list/load`). Scaffold validated against the `router-core` skill's canonical pattern. |
| 3 | Consistency strategy | **Foundation before parallelism:** one shared mock dataset (`src/mock/data.ts` — Harbourlight Hotels → Harbourlight Bankside, a 16-person cast, one coherent story reused by every screen; Priya Nair = staff perspective, Daniel Okafor = manager perspective), shared atoms (Avatar, TabBar, phone-frame chrome), one brand stylesheet imported once at the root. Subagents got identical reading lists + hard rules (no shared-file edits, brand tokens only, no new deps). |
| 4 | Screen waves | Wave 1 in parallel: chat list · conversations (with components factored for reuse) · announcement channels · people/profile/new-chat/onboarding. Wave 2: desktop shell, reusing the conversation components unchanged — which validated their width-agnostic design. |
| 5 | Visual language on screen | Official channels carry the **lime signature** (lime-50 band, lime megaphone tiles, `◆ OFFICIAL` mono tag) while organic chats stay white; announcement channels render as **bulletin cards on stone** (titled, signed, day-ruled) — deliberately abandoning every chat convention; own chat bubbles are lime-100 with near-black text, incoming white with hairlines; navy is the single primary-action color; mono is reserved for micro-typography (times, day pills, eyebrows, OTP digits). Onboarding introduces the wordmark treatment ("Harbourlight." + teal dot + `◆ STAFF CHAT`). |
| 6 | ⑂ Review-pass forks | Screenshot review over headless Chromium caught what per-agent typechecks could not: **cross-screen CSS class collisions** (`.presence-dot`, `.reaction-chip`, `.composer-input`) masked by route-level code splitting — fixed by namespacing/scoping, with the standing lesson that future waves get per-screen class prefixes up front; **duplicated chat-row markup** between mobile and desktop — hoisted into shared `ChatRow`/`ChatSections`; **lime in the Avatar palette** (my own foundation file) diluting the official signature — swapped for amber; a **dataset gap** (no own-message in the group transcript) — fixed with Priya's reply. |

## 3. State of the product so far

Eleven static screens, all on-brand, all committed, `pnpm dev` + `/` index page for review:

- **Mobile:** `/mobile/chats` (stacked Official/Favorites/All sections, unread badges, FAB) · `/mobile/chat-group` (reactions, @mentions, reply quotes, system lines, day dividers) · `/mobile/chat-dm` · `/mobile/channel` + `/mobile/channel-manager` (reader vs composing manager) · `/mobile/people` · `/mobile/profile` (working-hours notification model surfaced) · `/mobile/new-chat` (group creation mid-action) · `/mobile/onboarding` (invite → OTP → profile).
- **Desktop:** `/desktop` (sidebar / conversation / members panel, three columns, chat components reused verbatim) · `/desktop-empty` (session-1 Round-7 static placeholder pane).

### Conceptual frontend architecture (as scaffolded)

```
frontend/
├── index.html            Google Fonts (Sora, IBM Plex Mono)
├── vite.config.ts        router-plugin (file-based routes) + react
└── src/
    ├── routes/           one file per URL; thin — chrome + composition
    ├── components/       Avatar, TabBar, ChatRow/ChatSections,
    │   ├── chat/         MessageList, Bubble, TopBar, Composer… (mobile + desktop)
    │   ├── channel/      announcement feed + topbar
    │   └── desktop/      Sidebar
    ├── mock/data.ts      single shared dataset — swapped for TanStack DB
    │                     collections when real data arrives
    └── styles/           app chrome + per-screen CSS over brand tokens
                          (brand source of truth: ../brand/sona-brand.css)
```

The seam for the next stage is explicit: screens consume mock constants exactly where TanStack DB live queries will plug in; TanStack DB + react-db are already in `package.json`, and persistence/offline-queue packages are named in the brief for later.

### Open items / polish backlog

- Emoji-as-icons (tab bar, tiles, 🔍/💬/✏️) → monochrome SVGs in the real build.
- `.phone` scrolls at document level — fine for mockups, real app wants internal scroll areas.
- Desktop `search-field`/stone-scroll rules could graduate into `app.css`.
- Product name still open (mockups use the customer's own brand, "Harbourlight", for the wordmark moment).

**Next session:** backend architecture (`2026-08-18-backend-arch-ai-brief.md` pending in the repo root; `hotel_chat/backend/` directory created).
