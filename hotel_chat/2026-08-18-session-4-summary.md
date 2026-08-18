# Hotel Chat — Session 4 Summary: Navigation Wiring

**Date:** 2026-08-18 · **Format:** two-question architecture discussion, a written implementation plan, then parallel subagent-driven execution across two git worktrees, Oleksii observing · **Companion log:** `2026-08-18-session-4-log.md` · **Plan:** `2026-08-18-session-4-navigation-wiring-implementation-plan.md` · **Previous:** `2026-08-18-session-3-summary.md`, `2026-08-18-data-model.md` / `2026-08-18-shape-model.md`

## 1. Premise

The session-2 mockups (eleven static screens) had no real navigation: every link was a plain `<a href>` to a fixed URL, and mobile/desktop each had their own hand-built, non-parameterized screens (`/mobile/chat-group`, `/desktop`, etc.) that could show exactly one hardcoded conversation. This session's job was to wire up real client-side navigation between screens with TanStack Router, and to answer the question every chat app with a phone and a desktop client has to answer: how does the same URL decide which layout to render?

## 2. Key decisions and forks in the road

| # | Topic | Decision |
|---|-------|----------|
| 1 | Mobile vs. desktop dispatch | **Pure viewport detection, no override.** A `useIsDesktop()` hook (`matchMedia('(min-width: 768px)')`, matching the brand stylesheet's own breakpoint) decides the layout at *render* time, not at *routing* time — one URL (`/chat/$chatId`) serves both layouts, resizing the browser swaps chrome live with zero navigation, and there's no user-agent sniffing or manual force-mobile toggle. Rejected user-agent detection outright: an SPA that can be resized or opened at a breakpoint boundary needs client-side viewport logic regardless, so server-side UA sniffing would only add a redundant, staler signal. |
| 2 | Route shape | Collapsed the separate `/mobile/*` and `/desktop*` route trees into one: `/chats`, `/chat/$chatId`, `/people`, `/profile`, `/new-chat`, `/onboarding`. `/chats` and `/chat/$chatId` sit under a pathless `_appShell` layout route that renders the persistent desktop sidebar only on desktop viewports — TanStack Router keeps that layout mounted across child-route changes, so switching conversations on desktop never remounts the sidebar. |
| 3 | Scope boundary | Only screens that already had *both* a mobile and desktop design (chat list, open group/DM conversations) got the responsive split. People/Profile/New Chat/Onboarding/announcement channels — mobile-only mockups from session 2 — got real navigation wiring but not a fabricated desktop layout; that's an explicit, logged follow-up rather than invented scope. |
| 4 | Data honesty over fabrication | Real transcripts and member rosters only exist in mock data for the two conversations built out in session 2 (`wedding-ops`, `dm-daniel`). Every other chat/DM id a user can now actually click through to is a real, empty conversation ("No messages yet.") rather than a fake one — same call for the company channel ("No announcements yet.") vs. the location channel, which does have authored posts. |
| 5 | New-chat/onboarding interactivity | Their multi-step flows (OTP entry, group composition) stay local component state if/when built out — explicitly not part of navigation wiring, confirmed with Oleksii before planning. |
| 6 | Execution split | The 10-task plan was split 1–4 / 5–9 across two agents in separate git worktrees/branches (`nav-wiring/tasks-1-4`, `nav-wiring/tasks-5-9`), run in parallel, merged sequentially (1–4 first, then 5–9), with integration verification (plan Task 10) done once on `main` after both merges — not inside either worktree. The split is not truly independent (Tasks 5–7 import symbols Tasks 1–4 create), but the *authoring* work parallelizes fine since it's all pre-specified in the plan; each agent wrote its half trusting the plan's documented interfaces for the other half, which the merge then made real. This worked cleanly: zero merge conflicts, zero integration fixups needed. |

## 3. State of the product so far

Real navigation, verified end-to-end with a scripted headless-Chromium pass at both mobile and desktop viewports (see log for the full checklist):

- **Responsive shell:** `/chats` renders the mobile chat list (FAB, tab bar, stacked sections) under 768px, and a sidebar + welcome pane at 768px+; `/chat/$chatId` renders full phone chrome with a back chevron under 768px, and a bare conversation pane + persistent sidebar (+ members aside, when roster data exists) at 768px+. Resizing live, mid-conversation, swaps layouts without losing state or remounting the sidebar.
- **Real chat-row navigation:** every row in the chat list — official channels, favorites, all chats — is a router `Link` to `/chat/$chatId`, resolved through new id-based mock-data lookups (`chatEntryById`, `messagesByChatId`, `otherId` on DM entries).
- **Flat routes:** `/people`, `/profile`, `/new-chat`, `/onboarding` moved off `/mobile/*`, tab bar and FAB/close-x now use real `Link`s instead of full-reload anchors.
- **Known, logged gaps** (not bugs — explicit scope boundaries from the plan): no desktop design for People/Profile/New Chat/Onboarding/channels yet; most chat ids have no mock transcript/roster (by design, not fabricated); `mobile/channel-manager.tsx` (Daniel's manager-posting view) has no in-app entry point since the mock current user (Priya) is staff — still direct-URL-only.

### Conceptual routing architecture (as built)

```
frontend/src/routes/
├── _appShell.tsx              pathless layout — desktop: <Sidebar/> + <Outlet/>
│                               (mounted once, persists across chat switches)
│                               mobile: passthrough <Outlet/>, no extra chrome
├── _appShell/
│   ├── chats.tsx               mobile: chat list · desktop: welcome pane
│   └── chat.$chatId.tsx        resolves chat by id → conversation screen
│                                (group/DM) or channel screen (company/location);
│                                conversation screen branches phone-chrome vs.
│                                bare-pane-in-shell on useIsDesktop()
├── people.tsx / profile.tsx    flat, mobile-only chrome (no desktop design yet)
├── new-chat.tsx / onboarding.tsx
└── mobile/channel-manager.tsx  unchanged path — manager design preview, URL-only
```

**Next session:** define TanStack DB collections with mock data (roadmap item already queued in the top-level README) — the seam is the same one flagged in session 2: screens still read `mock/data.ts` constants exactly where live collections will plug in, and this session's id-based lookups (`chatEntryById`, `messagesByChatId`) are shaped to translate directly into collection queries.
