# AIflow

A working repository for designing and building products through structured human–AI brainstorming. The human writes a brief; the AI (Claude) and the human then bash ideas around in recorded sessions until the idea is sharp enough to build.

## How it works

1. **Brief.** Each stage starts with a dated, numbered brief at the repo root (`YYYY-MM-DD-N-<topic>-ai-brief.md`) written by the human: the goals, the constraints, the open questions, and what the AI's jobs are during the sessions.
2. **Brainstorming sessions.** The AI proposes options and asks clarifying questions — one at a time, usually with a recommendation — and the human steers every decision. Sessions run in rounds (10 per session as the working default). Nothing is implemented during brainstorming; the output is decisions.
3. **Session log.** During each session the AI maintains `YYYY-MM-DD-session-N-log.md`: every round's options, the decision taken, and the reasoning — including backtracks, where a notion from the brief or an earlier round gets revised or thrown out.
4. **Session summary.** At the end of each session the AI produces `YYYY-MM-DD-session-N-summary.md` covering (1) the premise, (2) the key decisions and forks in the road, and (3) the product vision so far with the conceptual architecture for the implementation.
5. **Onward to building.** Later sessions layer in UI mockups, the tech stack, and an implementation plan — each with the same log + summary discipline — until building starts.

All artifacts are committed to this repo as they're produced, so the full decision history is replayable from Git.

## Projects

### `hotel_chat/` — communications platform for hospitality businesses

A mobile-first PWA giving a hotel's on-site staff WhatsApp-grade internal chat plus official announcement channels, organized by the org chart and integrated (eventually) with the surrounding software ecosystem.

| File | What it is |
|------|------------|
| `../2026-08-18-1-kickoff-brainstorming-ai-brief.md` | The original brief: goals, scope boundaries, session format |
| `2026-08-18-session-1-log.md` | Session 1 round-by-round decision log (scope + feature set) |
| `2026-08-18-session-1-summary.md` | Session 1 summary: premise, decisions/forks, vision + conceptual architecture |
| `2026-08-18-session-2-prep.md` | Agenda and inputs for session 2 (UI mockups) |
| `../2026-08-18-2-ui-mockup-ai-brief.md` | Brief for session 2: mockup goals + the frontend stack |
| `2026-08-18-brand-guidelines.md` | Sona brand identity distilled from www.sona.ai: fonts, colors, layout patterns |
| `brand/sona-brand.css` | Shared stylesheet encoding the brand tokens, for mockups and later the app |
| `2026-08-18-session-2-log.md` | Session 2 log: frontend scaffold decisions, parallel mockup build, review findings |
| `2026-08-18-session-2-summary.md` | Session 2 summary: premise, decisions/forks, state of the frontend + architecture |
| `frontend/` | The frontend app (Vite + React + TanStack Router/DB) — currently static UI mockups, `pnpm dev` and open `/` for the screen index |
| `../2026-08-18-3-backend-arch-ai-brief.md` | Brief for session 3: the backend stack (Phoenix, embedded Electric sync, Postgres, docker compose) |
| `2026-08-18-session-3-summary.md` | Session 3 summary: backend scaffold decisions/forks, verified state, open items |
| `backend/` | The Phoenix backend: custom API under `/api`, Electric's sync API under `/api/sync` (embedded via phoenix_sync), SPA serving with catch-all; `docker compose up -d` + `mix phx.server` for dev |
| `release.sh` | Release workflow: frontend build → `backend/priv/static` → mix release → self-contained Docker image serving API + sync + SPA from one origin |

**Roadmap:** session 1 mapped the MVP scope ✔ → brand research ✔ → session 2 UI mockups + frontend scaffold ✔ → session 3 backend scaffold: Phoenix + embedded Electric sync, one-origin routing, Docker release workflow ✔ → data model: translate the session-1 entities (Company/Location/Member/Conversation/Message…) into migrations and sync shapes → frontend↔backend wiring: TanStack DB collections on `/api/sync/*` replacing `mock/data.ts`, auth on the `/api` pipeline → feature build-out (messaging, channels, notifications, onboarding/offboarding) → production hardening (release migrations, Electric storage volume, media retention strategy) → pilot deployment.
