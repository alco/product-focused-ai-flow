# AIflow

A working repository for designing and building products through structured human–AI brainstorming. The human writes a brief; the AI (Claude) and the human then bash ideas around in recorded sessions until the idea is sharp enough to build.

## How it works

1. **Brief.** Each stage starts with a numbered brief at the repo root (`N-<topic>-ai-brief.md`) written by the human: the goals, the constraints, the open questions, and what the AI's jobs are during the sessions.
2. **Brainstorming sessions.** The AI proposes options and asks clarifying questions — one at a time, usually with a recommendation — and the human steers every decision. Sessions run in rounds (10 per session as the working default). Nothing is implemented during brainstorming; the output is decisions.
3. **Session log.** During each session the AI maintains `session-N-log.md`: every round's options, the decision taken, and the reasoning — including backtracks, where a notion from the brief or an earlier round gets revised or thrown out.
4. **Session summary.** At the end of each session the AI produces `session-N-summary.md` covering (1) the premise, (2) the key decisions and forks in the road, and (3) the product vision so far with the conceptual architecture for the implementation.
5. **Onward to building.** Later sessions layer in UI mockups, the tech stack, and an implementation plan — each with the same log + summary discipline — until building starts.

All artifacts are committed to this repo as they're produced, so the full decision history is replayable from Git.

## Projects

### `hotel_chat/` — communications platform for hospitality businesses

A mobile-first PWA giving a hotel's on-site staff WhatsApp-grade internal chat plus official announcement channels, organized by the org chart and integrated (eventually) with the surrounding software ecosystem.

Project outline:

| Path                   | What it is                                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/`            | The frontend app (Vite + React + TanStack Router/DB) — every screen renders from TanStack DB collections synced live from Postgres via Electric shapes, `pnpm dev` and open `/` for the screen index                 |
| `backend/`             | The Phoenix backend: custom API under `/api`, auth proxy for the Electric sync service under `/api/sync/:shape`, SPA serving with catch-all; `docker compose up -d` (Postgres + Electric) + `mix phx.server` for dev |
| `brand/sona-brand.css` | Shared stylesheet encoding the brand tokens, for mockups and later the app                                                                                                                                           |
| `release.sh`           | Release workflow: frontend build → `backend/priv/static` → mix release → self-contained Docker image serving API + sync + SPA from one origin                                                                        |

AI briefs and artifacts, in chronological order:

| File                                                                | What it is                                                                                         |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `../1-kickoff-brainstorming-ai-brief.md`                            | The original brief: goals, scope boundaries, session format                                        |
| `agent_sessions/session-1-log.md`                                   | Session 1 round-by-round decision log (scope + feature set)                                        |
| `agent_sessions/session-1-summary.md`                               | Session 1 summary: premise, decisions/forks, vision + conceptual architecture                      |
| `agent_sessions/session-2-prep.md`                                  | Agenda and inputs for session 2 (UI mockups)                                                       |
| `../2-ui-mockup-ai-brief.md`                                        | Brief for session 2: mockup goals + the frontend stack                                             |
| `agent_artifacts/brand-guidelines.md`                               | Sona brand identity distilled from www.sona.ai: fonts, colors, layout patterns                     |
| `agent_sessions/session-2-log.md`                                   | Session 2 log: frontend scaffold decisions, parallel mockup build, review findings                 |
| `agent_sessions/session-2-summary.md`                               | Session 2 summary: premise, decisions/forks, state of the frontend + architecture                  |
| `../3-backend-arch-ai-brief.md`                                     | Brief for session 3: the backend stack (Phoenix, embedded Electric sync, Postgres, docker compose) |
| `agent_sessions/session-3-summary.md`                               | Session 3 summary: backend scaffold decisions/forks, verified state, open items                    |
| `agent_artifacts/data-model.md`                                     | Brief-3 Phase 2: DB tables, columns, keys and indexes (awaiting review)                            |
| `agent_artifacts/shape-model.md`                                    | Brief-3 Phase 2: Electric shape catalog per screen + index cross-check (awaiting review)           |
| `agent_sessions/session-4-navigation-wiring-implementation-plan.md` | Session 4 implementation plan: responsive routing architecture, task-by-task build                 |
| `agent_sessions/session-4-log.md`                                   | Session 4 log: parallel-worktree execution, merge, integration verification                        |
| `agent_sessions/session-4-summary.md`                               | Session 4 summary: premise, decisions/forks, navigation architecture as built                      |
| `../5-tanstack-db-collections-with-mock-data-ai-brief.md`           | Brief for session 5: TanStack DB QueryCollections over hard-coded data                             |
| `agent_sessions/session-5-summary.md`                               | Session 5 summary: collections ↔ shape catalog mapping, derived-display refactor                   |
| `../6-backend-data-model-ai-brief.md`                               | Brief for session 6: Ecto migrations + seed data, then swap mocks for live shapes                  |
| `agent_sessions/session-6-summary.md`                               | Session 6 summary: migrations/schemas/seeds, all 10 shapes implemented, wired to Electric          |

**Roadmap:**

- [x] Session 1: map the MVP scope
- [x] Brand research → guidelines + shared stylesheet
- [x] Session 2: UI mockups + frontend scaffold
- [x] Session 3: backend scaffold — Phoenix + embedded Electric sync, one-origin routing, Docker release workflow
- [x] Wire up frontend navigation between screens
- [x] Define TanstackDB collections for all types of entities with mock data
- [x] Data model design: session-1 entities (Company/Location/Member/Conversation/Message…) → table schema + per-screen shape catalog with index cross-check (docs awaiting review)
- [x] Data model implementation: migrations + seed data for all 13 tables (Create/Update write API + unit tests still pending)
- [x] Frontend↔backend wiring: TanStack DB collections swapped from fixtures to live Electric shapes on `/api/sync/*`
- [ ] Feature build-out: messaging, channels, notifications, onboarding/offboarding
- [ ] Auth on the `/api` pipeline (retire `HotelChat.Sync.MockSession`), write API for mutations
- [ ] Production hardening: release migrations, Electric storage volume, media retention strategy
- [ ] Pilot deployment
