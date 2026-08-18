# Hotel Chat — Brainstorming Session 1 Summary

**Date:** 2026-08-18 · **Participants:** Oleksii (steering), Claude (suggestions/questions) · **Format:** 10 rounds, text-only · **Companion log:** `2026-08-18-session-1-log.md`

## 1. Premise

We are building a communications platform for hospitality businesses with two goals:

1. **Align the workforce** — make on-site staff (reception, cleaners, porters, drivers, waiters, on-site managers) feel part of something bigger than their day-to-day job. Offsite teams (marketing, procurement, HQ functions) are out of scope.
2. **Replace WhatsApp** for internal 1-to-1 and group communications between staff and management (not customer-facing).

The strategic wedge: customers already use our company's other software tools, so an in-house comms tool can tap into that ecosystem (org data, shifts, customer stats) in ways Slack or WhatsApp never will. The MVP builds a basic version of goal 1 and puts its main effort into goal 2.

Research note: WhatsApp **Communities** (announcement group + per-team groups) is almost certainly the structure our customers imitate today. We match that familiar structure and add what WhatsApp cannot: org-awareness (roles, locations, schedules), manager control, and clean offboarding — ex-employees losing access is a headline selling point, since WhatsApp fails at exactly that.

## 2. Key decisions and forks in the road

Decisions in round order; **forks/backtracks** — places where we rethought a starting notion — are marked ⑂.

| #   | Topic            | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Platform         | **Mobile-first PWA** (installable, web push). Native apps are a follow-on, not MVP.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2   | Identity         | **Phone-number OTP with manager invites.** No emails/passwords — much of this workforce has no company email. The MVP identity DB is **explicitly throwaway** (a production identity system exists in the ecosystem); keep it behind a clean module boundary.                                                                                                                                                                                                                                                  |
| 3   | Org model        | **Company → Location → Member**, role `manager`\|`staff` per member; multi-tenant `company_id` from day one, companies provisioned manually. ⑂ **Deliberate simplification:** departments (housekeeping, F&B…) are NOT modeled — named group chats stand in; we anticipate importing departments from ecosystem org data later. Member↔location is **many-to-many** (floating staff, multi-site managers).                                                                                                     |
| 4   | Conversations    | Four types: 1:1 DMs (anyone↔anyone in company), ad-hoc groups, per-location announcement channel, company announcement channel. **Anyone creates groups; managers moderate** (rename/archive/delete/remove members). Ad-hoc groups are **visually distinct** from official channels. Announcements: one-way for staff, reactions on. Company-wide posting gated by per-member flag **`can_post_company_announcements`**.                                                                                       |
| 5   | Message features | ⑂ **Major scope pruning below the original brief.** MVP: text+emoji, photos with captions, files, reply/quote, reactions, @mentions, unread counts, push. **Voice messages + transcripts — in the original brief — pulled to backlog.** No deletion in MVP but schema carries `deleted_at`/`deleted_by`/`deleted_kind`. Read receipts and typing indicators cut to backlog. **Forgotten entirely** (fresh brief required to revive): calls, video upload, message editing, in-chat search, misc bits and bobs. |
| 6   | Goal-1 scope     | **Channels only.** Requirement 1's MVP is editorial, not mechanical: managers write birthday/news posts by hand. Stats page deferred until real ecosystem data can feed it — hand-typed numbers would undercut the "hard numbers" promise.                                                                                                                                                                                                                                                                     |
| 7   | Navigation       | Chat list in **stacked sections**: 📌 Official → ⭐ Favorites → recency. Plus **People** (directory) and **My Profile** screens, and a new-chat button. ⑂ **Responsive split:** mobile = the list is the home page; desktop = persistent sidebar + main area showing a **static mockup page** until a chat is opened (MVP).                                                                                                                                                                                    |
| 8   | Notifications    | ⑂ **Category-based policy rejected; the clock decides.** During the user's working hours everything pushes; **off-hours = absolutely zero push** (badges only). Work schedule lives in the mock identity DB (seeded with mock data). One-tap **snooze** auto-expiring after a configurable timeout (default 30 min). **Per-chat mute: 1 hr / 1 day / always** (announcement channels not mutable). Emergency broadcast that pierces off-hours: backlog, only on customer ask.                                  |
| 9   | Media            | **S3-compatible object storage + presigned upload URLs.** Photos client-side downscaled (~2048px, ~10MB); files ≤25MB, type allowlist. ⑂ **Simplification:** no auth-gated media URLs — an unguessable URL grants access; membership-gated access is post-MVP. ⚠️ **Bucket retention set to 1 day for the MVP** — media older than a day dead-links in history; **a real retention strategy must replace this.**                                                                                               |
| 10  | Offboarding      | Roster removal = immediate revocation; messages preserved and attributed; auto-removal from groups; DM counterpart keeps read-only history. ⑂ Rehire: **reactivation by phone number is the default** (history reconnects), **with fresh-start fallback** when PII was erased (GDPR/direct request). PII erasure is an anticipated operation — schema must allow scrubbing identity while preserving message rows.                                                                                             |

## 3. Product vision so far

**One sentence:** a mobile-first PWA that gives a hotel's on-site staff WhatsApp-grade chat inside the employer's walls — organized by the org chart, quiet off-shift, clean on offboarding — with official announcement channels supplying the sense of belonging.

### MVP feature set

- **Chats:** DMs, ad-hoc groups (anyone creates, managers moderate), location + company announcement channels (auto-created, mandatory, one-way with reactions).
- **Messages:** text/emoji, photos, files, reply/quote, reactions, @mentions.
- **Home:** stacked-section list (Official / Favorites / Recent); official visually distinct from organic.
- **Screens:** chat list · conversation · People directory · My Profile (+ roster management for managers).
- **Notifications:** working-hours-gated push, snooze with auto-expiry, per-chat mute.
- **Lifecycle:** invite → OTP onboarding; removal → instant revocation; rehire → reactivation w/ GDPR-safe fallback.

**Backlog (post-MVP, in spirit-of-priority order):** voice messages + transcripts · shifts-calendar integration & shift-aware notifications · ecosystem stats page · read receipts + typing indicators · message deletion UX (schema ready) · forwarding, pinning · media access control + real retention policy · emergency broadcast · filter chips · native apps · departments (imported from ecosystem).

### Conceptual architecture (stack-agnostic; stack is next session's topic)

```
┌─ PWA client (mobile-first; desktop = sidebar + content pane) ─┐
│  chat UI · media capture/downscale · web push · service worker │
└──────┬────────────────────────────────────┬───────────────────┘
       │ HTTPS API + realtime channel       │ direct upload (presigned URLs)
┌──────▼──────────────────────────┐  ┌──────▼──────────────┐
│ Backend                         │  │ Object storage      │
│ · conversations/messages core   │  │ (S3-compatible,     │
│ · fan-out to realtime + push    │  │  1-day expiry — MVP)│
│ · push scheduler (working-hours │  └─────────────────────┘
│   gate, snooze, mutes)          │
│ · media: presign + metadata     │
│ ┌─────────────────────────────┐ │
│ │ Identity module (THROWAWAY) │ │  ← clean boundary; replaced by
│ │ people · rosters · roles ·  │ │    production identity system later
│ │ work schedules · OTP invites│ │
│ └─────────────────────────────┘ │
└───────────┬─────────────────────┘
            │
     ┌──────▼──────┐   Core entities: Company · Location · Member
     │  Database   │   (many-to-many member↔location, role per member,
     └─────────────┘    active flag, can_post_company_announcements)
                        Conversation (dm|group|location_channel|company_channel)
                        Message (soft-delete columns from day one) ·
                        Reaction · MediaObject · MuteState
```

Design constraints baked in: identity swap-out boundary (R2), soft-delete columns ahead of the delete feature (R5), PII-scrub-friendly member records (R10), notification gating driven by schedule data that will later come from the shifts system (R8).

### Open threads for next session

1. **Tech stack introduction** (Oleksii) → iterate toward an implementation plan.
2. Visual mockups now unblocked (companion offered and deferred this session) — desktop static content pane needs a design.
3. Working-hours edge semantics (timezone per location; what exactly counts as "during hours" for multi-location members).
4. The media retention ⚠️ needs its real strategy before any non-pilot customer.
