# Creating the backend data model

Now that we've finished the frontend work of setting up TanStack DB collections that use mock data, it's time to create backend migrations for the backend data model defined in hotel_chat/agent_artifacts/data-model.md and seed data that will replace the frontend mocks.

Before writing Ecto migrations, cross-check the entity types currently defined for the mock frontend data against the backend model sketch. Stop and tell me if you find inconsistencies.

## Cross-check findings (2026-08-18)

Compared `hotel_chat/frontend/src/db/schema.ts` + `fixtures.ts` against `agent_artifacts/data-model.md`. The frontend row types are narrower than their tables for every "all columns" shape in `shape-model.md` (missing `updated_at` almost everywhere; `MessageAttachment` is missing `object_key`/`byte_size`/`width`/`height`; `Message` is missing the soft-delete columns `deleted_at`/`deleted_by`/`deleted_kind`).

**Ruling: this is fine and not a backend data-model concern.** The frontend mock types describe what a *shape* will select, not what a *table* contains — a shape's column list is allowed to (and often will) select fewer columns than the table has. Backend migrations/schemas are driven by `data-model.md` in full; they are not constrained by what the current mock fixtures happen to model.

One specific case: `messages.deleted_at`/`deleted_by`/`deleted_kind` never need to be synced to the client at all. Once soft-delete lands, the backend authorizes shape access with a `WHERE deleted_at IS NULL` (or similar) clause in `HotelChat.Sync.Shapes` — deletion is enforced server-side by excluding the row from the shape, not by shipping a tombstone flag for the client to filter on.

