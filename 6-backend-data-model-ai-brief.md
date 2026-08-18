# Creating the backend data model

Now that we've finished the frontend work of setting up TanStack DB collections that use mock data, it's time to create backend migrations for the backend data model defined in hotel_chat/agent_artifacts/data-model.md and seed data that will replace the frontend mocks.

Before writing Ecto migrations, cross-check the entity types currently defined for the mock frontend data against the backend model sketch. Stop and tell me if you find inconsistencies.

## Cross-check findings (2026-08-18)

Compared `hotel_chat/frontend/src/db/schema.ts` + `fixtures.ts` against `agent_artifacts/data-model.md`. The frontend row types are narrower than their tables for every "all columns" shape in `shape-model.md` (missing `updated_at` almost everywhere; `MessageAttachment` is missing `object_key`/`byte_size`/`width`/`height`; `Message` is missing the soft-delete columns `deleted_at`/`deleted_by`/`deleted_kind`).

**Ruling: this is fine and not a backend data-model concern.** The frontend mock types describe what a *shape* will select, not what a *table* contains — a shape's column list is allowed to (and often will) select fewer columns than the table has. Backend migrations/schemas are driven by `data-model.md` in full; they are not constrained by what the current mock fixtures happen to model.

One specific case: `messages.deleted_at`/`deleted_by`/`deleted_kind` never need to be synced to the client at all. Once soft-delete lands, the backend authorizes shape access with a `WHERE deleted_at IS NULL` (or similar) clause in `HotelChat.Sync.Shapes` — deletion is enforced server-side by excluding the row from the shape, not by shipping a tombstone flag for the client to filter on.

## Requesting shapes

Now that the backend model is live, it's time to replace QueryCollections that use mock data with ElectricCollections in the frontend code.

## Collection upgrade notes (2026-08-18)

Implemented all 10 shapes from `shape-model.md` in `HotelChat.Sync.Shapes` and swapped every collection in `frontend/src/db/collections.ts` from `queryCollectionOptions` (fixtures) to `electricCollectionOptions` pointed at `/api/sync/<shape>`. `fixtures.ts` is deleted — real data now comes from the seeded Postgres via Electric.

- **S8/S9/S10 are collapsed, not per-conversation.** `shape-model.md` specifies `messages:{c}` as one shape per open conversation with a windowed subset snapshot. `collections.ts` was already staged for a simpler intermediate step ("one collection... per-conversation windowed loading arrives with Electric's subset snapshots" — future work). So `messages`/`reactions`/`attachments` are each one standing shape scoped to *all* of the session member's conversations (`conversation_id IN (SELECT conversation_id FROM conversation_members WHERE member_id = $1)`), not per-conversation. Revisit when windowed loading is actually implemented.
- **Electric protocol gotcha:** a shape's `columns` list must include its table's primary key even if the client never uses it — `rosters` (S2b) omitting `id` per the doc's literal 3-column list 400s. Fixed by adding `id` to both the shape definition and `RosterEntry`.
- **No auth yet**, so `$me`/`$company` come from a new `HotelChat.Sync.MockSession`, computing the same deterministic ids `priv/repo/seeds.exs` uses (`sha256("member:priya")` etc., extracted to `HotelChat.Seeds.Id`) — scoped to Priya @ Harbourlight, matching the frontend's `db/session.ts` (also updated from the old readable-slug placeholders to these same real UUIDs).
- **Postgres `timestamp` (no tz) isn't auto-parsed** by the Electric client — only `text`/`uuid`/`bool`/`int4`/`int8`/`jsonb` are. Wire value comes back as `"2026-08-17 16:02:00"`. Added a `parser: { timestamp: (v) => v.replace(' ', 'T') + 'Z' }` on every shape that selects a timestamp column, normalizing to real ISO-8601 (the stored value is already UTC per Ecto convention) — keeps `db/derive.ts`'s string-comparison-based ordering correct and matches the format fixtures.ts used to produce.
- `schema.ts`'s row types changed from `interface` to `type`: `electricCollectionOptions`'s generic constraint requires a type satisfying an index signature, which `interface` declarations don't structurally match even when every property is compatible.
- Verified end-to-end (not just types): ran the real `@electric-sql/client` (`ShapeStream`/`Shape`) against the running dev proxy for all 10 shapes — row counts match the seed, timestamps parse to correct ISO-8601, booleans/ints auto-parse correctly. `tsc -b`, `vitest run`, and `vite build` all pass.
