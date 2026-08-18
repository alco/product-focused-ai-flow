# Session 2 log — UI mockups & frontend scaffold — 2026-08-18

Brief: `../2026-08-18-ui-mockup-ai-brief.md`. Oleksii observing; Claude executing autonomously with parallel subagents.

## Scaffold decisions

- `hotel_chat/frontend`: Vite 7 + React 19 + TypeScript 5.9, TanStack Router 1.170 (file-based routes via `@tanstack/router-plugin`, `autoCodeSplitting`), TanStack DB 0.7.2 + react-db 0.2.1 installed but deliberately unused at mockup stage (static data only). pnpm as package manager (house convention).
- TanStack bundled agent skills activated per the electric.ax blog: `npx @tanstack/intent install` → generated `frontend/AGENTS.md`; skills load on demand via `pnpm dlx @tanstack/intent list / load`. Loaded `@tanstack/router-core#router-core` to validate the scaffold — matches the canonical minimal example (createRootRoute + createFileRoute + Register interface).
- Brand: single shared stylesheet `hotel_chat/brand/sona-brand.css` imported once in `__root.tsx`; Google Fonts (Sora, IBM Plex Mono) linked in `index.html`. App-level chrome in `src/styles/app.css`.
- Milestone 1 (dev server, no backend/data) verified: `pnpm build` green, `pnpm dev` serves.

## Mockup foundation (built before parallelizing, to force consistency)

- **One shared mock dataset** `src/mock/data.ts`: Harbourlight Hotels (company) → Harbourlight Bankside (location); 16-person cast; current user Priya Nair (Front Desk, staff), manager persona Daniel Okafor (Duty Manager). Chat list entries (official/favorites/recent), full message history for the "Saturday Wedding — Ops" group chat and the Priya↔Daniel DM, and three announcement posts — every screen draws from this single cast so the mockups tell one coherent story.
- Shared atoms: `Avatar` (deterministic brand-tint initials), `TabBar` (Chats/People/Profile), phone-viewport chrome (`.phone`, `.topbar`, `.tabbar`, `.unread-badge`, `.section-label`).
- URL scheme (static routes, no navigation wiring, per brief): `/mobile/chats`, `/mobile/chat-group`, `/mobile/chat-dm`, `/mobile/channel`, `/mobile/channel-manager`, `/mobile/people`, `/mobile/profile`, `/mobile/new-chat`, `/mobile/onboarding`, `/desktop`, `/desktop-empty`. Index page at `/` lists them all.

## Parallelization plan

- Wave 1 (parallel): A = chat list; B = group + 1:1 conversations (must factor reusable components into `src/components/chat/` for desktop); C = announcement channel reader + manager; D = people, profile, new-chat, onboarding.
- Wave 2 (after B): E = desktop shell (`/desktop`, `/desktop-empty`) reusing B's conversation components; `/desktop-empty` shows the static placeholder pane per session-1 Round 7.
- Consistency enforcement: all agents given the same brand/product reading list, hard rules (no shared-file edits, brand tokens only, no new deps), unique dev-server ports for routeTree regeneration, tsc verification. Main agent reviews with headless-Chromium screenshots (playwright in scratchpad) and dispatches fix-up agents as needed.

## Execution results

- All five agents completed with clean `tsc --noEmit`; every screen reviewed via headless-Chromium screenshots at 390×844 (mobile) and 1440×900 (desktop).
- Commits: `1d9d609` chat list · `8f321f1` conversations + reusable chat components · `0b4fe95` announcement channels · `60dfeda` people/profile/new-chat/onboarding · `9c426e0` desktop shell · `cdb0030` review-pass fixes.

## Review findings (the consistency pass earned its keep)

1. **Cross-screen CSS class collisions** — the real hazard of parallel agents, masked by route-level code splitting: each page looked right in isolation, but stylesheets accumulate on client-side navigation and equal-specificity rules from one screen restyle another. Found `.presence-dot` (people's 12px absolute avatar badge vs conversation's 7px inline dot — visibly broke the DM topbar), `.reaction-chip` (channel's larger bulletin chips vs chat's compact ones), `.composer-input`. Fixed by scoping/namespacing (`ann-*` prefixes for channel, `.presence-wrap` scoping). Desktop agent independently flagged the same presence-dot collision. **Lesson for future waves: assign per-screen class prefixes up front.**
2. **Duplication across agents:** desktop sidebar had mirrored the chat-row markup and the groupEmoji map verbatim (mobile's weren't exported). Hoisted `ChatRow`/`ChatSections` into `src/components/ChatRow.tsx`, `groupEmoji` into shared mock data.
3. **Brand-semantics drift in my own foundation:** the shared Avatar palette included lime-200, diluting the "lime = official" signature the screen agents preserved carefully. Swapped for amber-100.
4. **Dataset gap:** Priya had no message in the group transcript, so the own-message-in-group case wasn't demonstrated; added her reply (g19).
- Also of note: the scaffold commit briefly swept in two unrelated root files + a build artifact via `git add -A`; fixed forward in `44ddb5e` (untracked again, no history rewrite per house rule).

## Open items / polish backlog

- Emoji used for icons (tab bar, group tiles, 🔍/💬/✏️) renders in native colors — fine for mockups, swap for monochrome SVG in the real build.
- `.phone` uses min-height so mobile pages scroll at document level — acceptable for mockups; the real app will want proper internal scroll areas.
- Chat-list snapshot intentionally predates Priya's 11:41 reply in the group transcript (keeps the unread badge + mention preview demo on the hero row).
- Desktop `search-field` and stone-scroll rules could graduate from screen CSS into app.css if more screens adopt them.
