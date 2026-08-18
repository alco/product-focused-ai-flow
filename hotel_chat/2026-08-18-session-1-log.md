# Brainstorming session 1 — 2026-08-18

Format: 10 warm-up rounds. Claude suggests/asks, Oleksii steers. Goal: map MVP scope + feature set. Tech stack discussion comes after.

## Pre-session context (from brief, 2026-08-16)

- Product: comms platform for hospitality businesses. Two goals: (1) workforce alignment/belonging, (2) replace WhatsApp for internal 1-1 and group comms.
- Scope: on-site staff only (reception, cleaners, porters, drivers, waiters, on-site managers). Offsite teams out of scope.
- Decision already made: build a basic version of #1, focus main effort on #2.
- #1 ideas from brief: per-location announcement channel, company-wide announcement channel, positive-stats page.
- #2 ideas from brief: sidebar chat list, company-wide chats pinned on top, favorites, later shift/holiday calendar integration.
- MVP needs scoping of: image upload, file sharing, voice messages w/ transcript; where media is stored, how transcription happens.
- Session mode: text only, no visual companion (mockups come in later sessions).

## Rounds

### Round 1 — Delivery platform
- Options: (A) native mobile apps first, (B) mobile-first PWA, (C) web-first.
- **Decision: B — mobile-first PWA.** One codebase, installable, no app-store friction for pilots; push workable on Android + iOS ≥16.4. Native apps are the stated follow-on, not MVP.
- Context noted: WhatsApp Communities (announcement group + per-team groups) is the structure customers likely already use; we match it and add org-awareness (roles, locations, shifts) + work/personal separation.

### Round 2 — Identity & onboarding
- Options: (A) phone-number OTP + manager invites, (B) piggyback on existing ecosystem identities, (C) email/password or magic link.
- **Decision: A — phone OTP, invite-driven.** Manager adds staff (name, role, phone) to location roster → SMS invite link → OTP verify. No email/password. Offboarding = removal from roster (a selling point vs WhatsApp, where ex-employees keep group access).
- **Constraint: the MVP identity DB is throwaway.** A production identity system already exists in the ecosystem; build a basic identity store now but isolate it behind a clean module boundary so it can be swapped later without rippling through the app.

### Round 3 — Org model
- Options: (A) Company → Location → Member with per-member role, no departments; (B) A + first-class departments; (C) flat single-location.
- **Decision: A.** Locations are first-class (they anchor announcement channels + rosters). Roles: `manager` | `staff`. Multi-tenant `company_id` from day one; companies provisioned manually, no self-serve signup.
- **Deliberate MVP simplification:** departments/teams (housekeeping, F&B, front desk) are NOT modeled — a named group chat stands in. We anticipate adding departments later, likely imported from the ecosystem's org data rather than invented here.
- **Decision:** member↔location is many-to-many — one person can work shifts at multiple locations (floating staff, multi-site managers), even if the MVP UI mostly assumes one.

### Round 4 — Conversation taxonomy
- Four conversation types: (1) 1:1 DMs — anyone can DM anyone in the company, roster = contact list; (2) ad-hoc group chats; (3) location announcement channel — auto-created, mandatory membership, managers post; (4) company announcement channel — auto-created, everyone, pinned top.
- Announcement channels are one-way for staff but **reactions stay on** (belonging signal, free since chat has them anyway).
- Group creation options: (A) anyone WhatsApp-style, (B) managers only, (C) anyone creates + managers moderate.
- **Decision: C.** Anyone creates groups; location managers can rename/archive/delete groups and remove members.
- **Decision:** ad-hoc groups must be **visually distinct** from official channels — clear separation in the UI between organic and official spaces.
- **Decision:** company-wide posting rights = per-member flag named **`can_post_company_announcements`** (user's naming), set manually for pilot HQ people. Rejected "any manager can post" (too noisy for a chain).

### Round 5 — Message feature cut (major fork: scope pruned below original brief)
- **MVP message features:** text + emoji; photos (camera/gallery, optional caption); files/documents; reply/quote; emoji reactions; @mentions in groups; unread counts + push notifications.
- **Backlog** (wanted, not MVP):
  - **Voice messages + transcripts** — notable backtrack: these were explicitly in the original brief; user pulled them from MVP scope.
  - Message deletion — no delete in MVP, but **DB schema carries provisions**: `deleted_at`, `deleted_by`, `deleted_kind`.
  - Read receipts + typing indicators.
  - Message forwarding, message pinning.
- **Forgotten entirely** (would need a fresh from-scratch brief; do not carry in backlog): voice/video calls, video upload, message editing, in-chat search, all other misc messaging bits and bobs (polls, stickers/GIFs, statuses, disappearing messages, live location, etc.).

### Round 6 — Requirement #1 "basic version" scope
- Options: (A) channels only, (B) + manager-editable highlights card, (C) + automated birthday posts.
- **Decision: A — channels only.** Requirement #1's MVP is editorial, not mechanical: the two announcement channels are the stage; managers write the content (birthdays, events, news) as ordinary posts.
- Stats page deferred to backlog as the flagship post-MVP **ecosystem integration** (real customers-served / satisfaction numbers; hand-typed stats would go stale and undercut the "hard numbers" promise). Shifts-calendar integration sits in the same backlog bucket.

### Round 7 — Navigation & chat-list IA
- Chat-list organization options: (A) stacked sections, (B) sort-to-top, (C) WhatsApp-style filter chips.
- **Decision: A — stacked sections:** 📌 Official (company channel, then location channel(s), always top) → ⭐ Favorites (starred, recency-ordered) → all other chats by recency. Filter chips possible later, non-conflicting.
- **Decision — responsive layout split:** on **mobile**, the stacked-sections list IS the home page. On **desktop**, the sidebar (same stacked sections) is always visible; the main content area shows a **static mockup/placeholder page in the MVP** until the user opens a chat.
- Approved navigation frame: chat list + **People** (company directory: search, role + location, tap-to-DM) + **My Profile** (name, photo, notification settings; managers also get roster management) + new-chat button (pick one person → DM; pick several + name → group).

### Round 8 — Notifications (extended round; user reshaped the model)
- Rejected both "push everything, mute per chat" (A) and "category-based: plain group messages badge-only" (B). **The clock decides, not the category** — the working-hours model:
  - **During user's working hours:** every category pushes (DMs, groups, mentions, announcements).
  - **Off hours: absolutely zero push notifications**; everything accrues as unread badges for shift start.
  - **Work schedule per user lives in the mock identity DB**, seeded with mock data for the MVP (swaps out with the production identity/shifts system later, same boundary as Round 2).
- **Snooze ("mute all"):** one-tap, auto-expires after a configurable timeout, default 30 min.
- **Per-chat mute stays in MVP.** Options: **1 hr / 1 day / always**. Announcement channels are not per-chat mutable.
- Explicit consequence accepted: off-hours gate applies to announcements too — "announcements unmutable" holds only within working hours. **Emergency broadcast that pierces everything = backlog**, only if a customer asks.

### Round 9 — Media storage
- Options: (A) S3-compatible object storage + presigned upload URLs, (B) blobs in app DB, (C) third-party media service.
- **Decision: A.** Client requests upload URL → uploads directly to bucket → message carries media reference.
- Accepted defaults: photos client-side downscaled (~2048px longest edge, ~10MB cap), client-rendered thumbnails (no server thumbnail pipeline); files capped ~25MB with an allowlist (PDF, images, common office docs); bucket private.
- **Simplification (user steer): no auth-gated media URLs in MVP** — possession of the URL grants access (unguessable capability URL). Proper conversation-membership access control is post-MVP.
- **Decision (user steer): bucket-level retention/expiry of 1 day** for MVP. ⚠️ Explicit note to carry into the artifact: a more elaborate retention strategy MUST replace this — consequence of the MVP setting is that media older than 1 day becomes dead links in chat history.

### Round 10 — Offboarding & rehire
- Approved offboarding model: removal from roster = immediate revocation (session invalidated, push stops, app logs out); messages preserved and attributed (profile shows inactive/former); auto-removed from all groups/channels; DM counterpart keeps history read-only.
- **Rehire decision (user steer, refined beyond both offered options): reactivation by phone number is the default** — same person record revives, DM threads and history reconnect (active/inactive flag on member). **But the flow must fall back to fresh-start** when the old record's PII has been removed (GDPR erasure or direct request).
- Implication recorded: **PII erasure is an anticipated operation** on member records (scrub identity, preserve message rows) — schema should not make this impossible.

## Session 1 closed
- All 10 rounds complete. Summary document: `2026-08-18-session-1-summary.md`. Next session: tech stack introduction, iterate toward implementation plan; mockups/visual companion available from next session onward.
