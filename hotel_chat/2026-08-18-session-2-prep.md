# Session 2 prep — UI mockups

**Goal:** produce UI mockups for the MVP scoped in session 1, before the backend/tech-stack session. Visuals are unblocked this session (companion was offered and deferred in session 1).

## Screen inventory to mock

Mobile-first, in suggested order:

1. **Chat list (home)** — the product's first impression. Stacked sections: 📌 Official → ⭐ Favorites → Recent. Must show: visual distinction of official channels vs ad-hoc groups (Round 4 requirement), unread badges, snooze control placement.
2. **Conversation — group chat** — the densest screen: bubbles, reply/quote, emoji reactions, @mentions, photo message w/ caption, file message, composer with attach.
3. **Conversation — announcement channel** — one-way reading experience for staff (reactions only, no composer) and the manager variant (composer present). Should feel more "broadcast" than chat.
4. **People directory** — search, name + role + location, tap-to-DM.
5. **My Profile** — photo/name, notification settings (snooze timeout, per-chat mutes), and the manager-only roster section (invite by phone, remove member).
6. **New chat flow** — single-select → DM; multi-select + name → group.
7. **Onboarding** — SMS invite link → OTP entry → name/photo setup. (First-run experience sells the pilot.)

Desktop (after mobile settles):

8. **Desktop shell** — persistent sidebar (same stacked sections) + main content area showing the **static mockup page** (Round 7 decision) — that placeholder page itself needs a design: likely a warm location-branded welcome/summary.
9. **Desktop with open conversation.**

## Decisions to resolve visually

- How "official vs organic" distinction reads: section styling, channel iconography, color accents?
- Announcement posts: styled as cards (title-ish, roomier) vs plain chat bubbles?
- Unread/badge and mute-state treatments in the list.
- Empty states: fresh install, empty location channel, no favorites yet.
- **Visual identity: none chosen yet** — product has no name, palette, or type direction. Suggest opening session 2 here (even a placeholder identity keeps mockups coherent).

## Inputs wanted from Oleksii

- Product/working name, any brand constraints or aesthetic references (apps whose feel we should echo or avoid).
- Whether mockups should be built with the visual companion (browser) or as committed HTML/artifact files in this repo — the latter keeps them in Git history alongside the logs.

## Session-1 constraints the mockups must respect

- PWA, phone-first layouts; desktop = sidebar + content pane.
- Message set is only: text/emoji, photos+captions, files, reply/quote, reactions, mentions. **Do not mock** voice notes, read receipts, typing indicators, edit/delete UI, search.
- Announcement channels: mandatory membership, no leaving, no muting, reactions on.
- Roster/notification settings must accommodate: working-hours-gated push (schedule shown read-only from identity DB), snooze w/ auto-expiry, per-chat mute (1 hr / 1 day / always).
- Offboarded members appear as inactive/former in history; directory shows active members.
