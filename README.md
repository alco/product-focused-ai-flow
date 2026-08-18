# AIflow

A working repository for designing and building products through structured human–AI brainstorming. The human writes a brief; the AI (Claude) and the human then bash ideas around in recorded sessions until the idea is sharp enough to build.

## How it works

1. **Brief.** Each product effort starts with a dated brief (`<project>/YYYY-MM-DD-ai-brief.md`) written by the human: the goals, the constraints, the open questions, and what the AI's jobs are during the sessions.
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
| `2026-08-16-ai-brief.md` | The original brief: goals, scope boundaries, session format |
| `2026-08-18-session-1-log.md` | Session 1 round-by-round decision log (scope + feature set) |
| `2026-08-18-session-1-summary.md` | Session 1 summary: premise, decisions/forks, vision + conceptual architecture |
| `2026-08-18-session-2-prep.md` | Agenda and inputs for session 2 (UI mockups) |

**Roadmap:** session 1 mapped the MVP scope ✔ → session 2 produces UI mockups → a subsequent session introduces the tech stack and the backend implementation plan → build.
