# Hotel Chat — Session 5 Summary: TanStack DB Collections with Mock Data

**Date:** 2026-08-18 · **Format:** brief-driven autonomous implementation (plan written and executed inline in one session) · **Brief:** `../../5-tanstack-db-collections-with-mock-data-ai-brief.md` · **Previous:** `session-4-summary.md`, `../agent_artifacts/data-model.md` / `../agent_artifacts/shape-model.md`

## 1. Premise

After session 4 every screen navigated for real but still rendered view-shaped mock constants (`src/mock/data.ts`: pre-computed previews, unread counts, aggregated reaction chips, display-formatted times). This session replaced that layer with real TanStack DB QueryCollections over **table-shaped** hard-coded fixtures — no outgoing requests yet — so that the next step, swapping in Electric collections on `/api/sync/*`, only touches the collection definitions.

## 2. Key decisions and forks in the road

| #   | Topic                       | Decision                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Collection catalog          | One QueryCollection per shape in `shape-model.md` (S1–S10 → 11 collections in `src/db/collections.ts`), including an empty `attachments` collection so the Electric swap covers the whole catalog. The file's header comment is the swap contract: each collection names its shape id; only this file + fixtures change when Electric lands.                                                                                       |
| 2   | Messages: one collection    | A **single** `messages` collection rather than per-conversation collection factories, even though S8 is a per-conversation shape. Rationale: TanStack DB 0.8's subset-loading API (`LoadSubset`) is built for exactly this — one collection whose sync layer serves per-conversation windowed subsets — so a per-conversation factory seam would be machinery the Electric collection obsoletes. Live queries filter by `conversation_id`. |
| 3   | Rows mirror Postgres        | Row types (`src/db/schema.ts`) use snake_case column names and ISO timestamptz strings exactly as Electric delivers them, and carry only the columns their shape syncs (Member has no phone — S3 excludes it; RosterEntry is S2b's 3-column projection). Display formatting lives in `src/lib/time.ts` + `src/db/derive.ts`, unit-tested with vitest (new dev dep).                                                              |
| 4   | Non-DB state gets stubs     | `src/db/session.ts` (member/company ids, company name, own phone — the future auth bootstrap) and `src/db/presence.ts` (online ids — future Phoenix Presence) hold what is deliberately *not* a shape, so no fake collections exist for them.                                                                                                                                                                                     |
| 5   | Everything derived          | Chat-list previews/ordering/unread badges, DM titles (roster ⋈ directory minus me), member counts, channel audience lines, day dividers, reaction chips (`{emoji, count, mine}` from per-member rows), schedule summary ("Mon–Fri · 07:00–15:30" from 5 weekday rows) — all computed from raw rows via `useLiveQuery` + pure helpers. Zero display-shaped fields in the fixtures.                                                  |
| 6   | Fixture timestamps relative | Fixtures generate timestamps relative to "today" at module load (`at(daysAgo, 'HH:MM')`), so derived labels ("Yesterday", weekday names) stay meaningful whenever the app runs.                                                                                                                                                                                                                                                    |
| 7   | Data honesty, extended      | Old view-data implied rows the 16-person cast can't back. Resolution: the old preview lines became real single `messages` rows (normalization, not fabrication); reaction counts capped at what each roster supports (👋 16 → 13); group member counts now equal actual roster rows (F&B Crew "14" → 5); unread badges derive from tuned `last_read_at` cursors (wedding-ops 4 → 3). The company channel stays genuinely empty.        |
| 8   | Readable ids kept           | Slug ids (`priya`, `wedding-ops`, `dm-daniel`) survive — they're strings like uuids will be, and existing URLs keep working. DM rows still carry a proper `dm_key`.                                                                                                                                                                                                                                                                |
| 9   | Onboarding stays API-only   | The onboarding screen reads no collections (pre-auth by design, per the shape doc's screens table); its invite details became local constants standing in for the invite-lookup API response.                                                                                                                                                                                                                                      |

## 3. State of the product so far

`src/mock/` is deleted; every screen renders from collections. Verified with a headless-Chromium pass at 390px and 1280px against all nine routes (chat list sections/previews/badges, wedding-ops transcript with derived dividers + system line + quotes + reactions, derived DM title + presence subtitle, announcement feeds with derived day headers and audience counts, people/profile/new-chat, desktop sidebar + members panel + welcome card). `pnpm build` and `pnpm test` (17 helper tests) pass.

Dependency note: QueryCollections required `@tanstack/query-db-collection` (+ `@tanstack/query-core`), whose current release pins `@tanstack/db@0.8.0` — so db was upgraded 0.7.2 → 0.8.0 and react-db 0.2.1 → 0.3.0. No pre-existing code used their APIs.

New structure:

```
frontend/src/
├── db/
│   ├── schema.ts        row types = table columns (per shape's column list)
│   ├── fixtures.ts      the session-2 mock dataset, normalized into rows
│   ├── collections.ts   QueryClient + 11 collections ↔ shapes S1–S10
│   ├── derive.ts        pure derivations (+ tests)
│   ├── session.ts       mock auth bootstrap (NOT a collection)
│   └── presence.ts      mock Phoenix Presence (NOT a collection)
├── lib/time.ts          label formatting (+ tests)
└── hooks/
    ├── useChatList.ts   memberships ⋈ conversations ⋈ rosters ⋈ directory ⋈ messages
    ├── useConversation.ts  everything an open chat/channel screen needs
    └── useSessionMember.ts my directory row + my location
```

**Next session:** the roadmap's data-model implementation (migrations + write API), then frontend↔backend wiring — replace `queryCollectionOptions` with Electric collections on `/api/sync/:shape` per the contract in `collections.ts`, delete `fixtures.ts`, and pick up S8's windowed loading via subset snapshots.
