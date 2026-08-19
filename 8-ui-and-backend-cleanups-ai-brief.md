# UI and backend cleanups

<<<<<<< HEAD
Follow-up to the session-7 feature buildout, done interactively rather than through parallel worktree agents: a handful of fixes that came out of actually using the app and interrogating what the agents built. This brief is written retroactively — each section matches work already on `main` — so the findings are folded in rather than appended.

## One DM per pair, enforced by the database

Session 7's e2e run caught seeded `dm_key`s written as slug pairs (`"daniel:priya"`) instead of sorted uuid pairs, letting seeded DMs escape the one-DM-per-pair constraint. The patch fixed the seeds, but the design is weak: `dm_key` is a free-form text column whose "sorted uuid pair" format lives only as a convention duplicated across three writers (context function, seeds, client). Constrain it inside the database instead.

Stepping back to first principles: the string's only real job is giving the DM pair a *single-row representation* — a DM is one `conversations` row plus two `conversation_members` rows, and no unique constraint can span rows, so the pair must be materialized somewhere a unique index can see it. That also answers "why can't the backend just insert and let the DB error": it can, and should, but only a pair-shaped constraint gives the DB something to error *on* (and makes concurrent creates race-proof, which a look-then-insert transaction is not).

Replace `dm_key` with the minimal constraint set:

- `dm_member_a` / `dm_member_b` uuid columns; CHECK present-iff-`kind='dm'`; CHECK `dm_member_a < dm_member_b` (canonical order, bans self-DMs).
- Partial unique index `(company_id, dm_member_a, dm_member_b) WHERE kind = 'dm'` — the one-DM-per-pair constraint itself.
- Composite FKs `(id, dm_member_x) → conversation_members (conversation_id, member_id)`, `DEFERRABLE INITIALLY DEFERRED` (the conversation row inserts before its membership rows; the check runs at commit). Each id must be a real member *of that conversation*; no direct FK to `members` — validity is transitive through `conversation_members`.

Rejected along the way: a `GENERATED` `dm_key` column (Postgres 17 excludes stored generated columns from logical replication, so it would never sync through Electric; PG 18's `publish_generated_columns` is opt-in per publication and Electric owns the publication — not worth depending on when the id columns sync fine as-is), and trigger-enforced pair↔membership *equality* (hand-rolled deferred-trigger machinery guarding a divergence only our own write path could produce).

Server behavior on a pair conflict: return the existing conversation (200, `txid: null`) instead of a 422 — the client dedupes locally on the synced id columns and follows the server's canonical id if its dedupe raced. Note the deferred FKs are checked at commit, which the Ecto SQL sandbox never reaches, so ExUnit can't exercise them; they were verified live (new DM commits through them; a pair without membership rows fails exactly at `COMMIT`).

## Group chat creation looks broken

I can create DMs from the UI, but as soon as I pick a second member the button switches to "Create group chat" and clicking it does nothing — no API request. Root cause: the button is `disabled` until a group name is typed, but `.btn` had no disabled styling at all (full-strength background, pointer cursor), so a disabled button was indistinguishable from an enabled one and clicks were silently swallowed.

Fix the affordance, not the rule (the server requires a group name; keep that):

- Give `.btn` a real not-actionable look — dimmed, `not-allowed` cursor — for both `disabled` and `aria-disabled` buttons.
- While only the group name is missing, use `aria-disabled` instead of the `disabled` attribute so the button still receives the click, and respond to it: red border on the Group name input (new `--error` brand token) plus focus. Typing clears the error. A truly `disabled` button swallows clicks at the browser level and could never trigger the highlight.
- With nobody selected, keep the plain `disabled` attribute — there's nothing useful to point at.

Testing gotcha for later: Playwright's actionability check refuses to click `aria-disabled` elements; e2e scripts for this path need `click({ force: true })`.

## Dead sidebar chrome

Hide the Search field in the conversation sidebar and the pencil icon at the top — neither does anything. (The mobile chat list and People/New-chat screens keep their equally-static search fields for now; this pass is desktop-sidebar only.)
=======
Final session before subsmission where we're going to address a handful of UI issues and make sure core functionality is working.

## Define DB constraints for direct messsage uniqueness

During a test run I noticed that the conversations table has a dm_key column that's just TEXT. It is supposed to drive the uniqueness of direct message convos between any two members but there are no constraints for it. This is something I missed during the data model audit.

Replace dm_key with

  - two columns dm_member_a and dm_member_b that are actual foreign keys to conversation_members table
  - this allows us to create a unique index on (company_id, dm_member_a, dm_member_b) to ensure DM uniqueness
  - the FKs to create are composite keys: (id, dm_member_a) -> conversation_members(conversation_id,member_id) and a second one for dm_member_b

## Group chat creation looks broken

I can create DMs from the UI, but as soon as I pick a second member the button switches to "Create group chat" and clicking it does nothing. The button appears to be disabled but it's styled exactly the same as an active button.

In addition to the styling fix, make sure that clicking on the button highlights the Group name input field with a red border.

## Remove mock UI elements

Hide the Search field in the conversation sidebar and the pencil icon at the top.

## Demo ability to "sign in" as a different user

Add support for the `?as=<user>` URL query param to load a different user's session. This will allow us to demo how different users see different conversations and how messages are synced between them. This is a stopgap feature while we don't have real auth in place.

## Scroll-to-bottom in conversation views

Add a quick scroll-to-bottom anchor. Currently nothing in the UI indicates that a new message has been received when the conversation is already open.

## Remove the demo landing page

Navigating to the root route should load the /chats view.
>>>>>>> aad1c20 (fixup! Add retroactive brief 8 for the interactive cleanup session)
