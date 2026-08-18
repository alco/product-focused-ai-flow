// Hard-coded table rows backing the QueryCollections — the session-2 mock
// dataset (one cast, one set of conversations) normalized into the schema of
// agent_artifacts/data-model.md. No view-shaped data survives here: previews,
// unread badges, reaction chips, member counts and DM titles are all derived
// from these rows at render time.
//
// Timestamps are generated relative to "today" at module load so the derived
// labels ("Yesterday", weekday names) stay meaningful whenever the app runs.
//
// Data honesty (session-4 rule): every rendered number derives from rows that
// actually exist. Where the old mock view-data implied more rows than the
// 16-person cast supports (reaction counts of 21, group member counts of 14),
// the fixture carries what the cast supports and the UI shows the honest
// number. The old chat-list preview lines became real single messages; the
// company channel stays empty (a real, quiet inbox — not fabricated content).

import { session } from './session'
import type {
  Conversation,
  ConversationKind,
  ConversationMember,
  Location,
  Member,
  MemberLocation,
  MemberRole,
  MemberSettings,
  Message,
  MessageAttachment,
  MessageReaction,
  RosterEntry,
  WorkSchedule,
} from './schema'

// --- Time helpers -----------------------------------------------------------

const DAY = 86_400_000
const todayStart = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
})()

/** ISO timestamp at local `HH:MM`, `daysAgo` days back from today. */
const at = (daysAgo: number, hm: string): string => {
  const [h, m] = hm.split(':').map(Number)
  return new Date(todayStart - daysAgo * DAY + (h * 60 + m) * 60_000).toISOString()
}

// --- Members (S3) -----------------------------------------------------------

const cast: [id: string, name: string, job: string, role: MemberRole][] = [
  ['priya', 'Priya Nair', 'Front Desk', 'staff'],
  ['daniel', 'Daniel Okafor', 'Duty Manager', 'manager'],
  ['amira', 'Amira Haddad', 'Housekeeping', 'staff'],
  ['tomasz', 'Tomasz Zieliński', 'Porter', 'staff'],
  ['sofia', 'Sofía Reyes', 'F&B Supervisor', 'manager'],
  ['marco', 'Marco Bellini', 'Chef de Partie', 'staff'],
  ['grace', 'Grace Adeyemi', 'Housekeeping', 'staff'],
  ['liam', "Liam O'Connor", 'Night Reception', 'staff'],
  ['yuki', 'Yuki Tanaka', 'Concierge', 'staff'],
  ['elena', 'Elena Petrova', 'Housekeeping Lead', 'manager'],
  ['jamal', 'Jamal Carter', 'Maintenance', 'staff'],
  ['ines', 'Inês Almeida', 'Waiter', 'staff'],
  ['stefan', 'Stefan Weber', 'Driver', 'staff'],
  ['hannah', 'Hannah Lewis', 'Events Coordinator', 'staff'],
  ['omar', 'Omar Farouk', 'Waiter', 'staff'],
  ['kasia', 'Kasia Nowak', 'Front Desk', 'staff'],
]

export const memberRows: Member[] = cast.map(([id, name, job_title, role]) => ({
  id,
  company_id: session.companyId,
  name,
  job_title,
  role,
  active: true,
}))

const everyone = cast.map(([id]) => id)

// --- Locations (S5) + member_locations (S4) ---------------------------------

export const locationRows: Location[] = [
  { id: 'bankside', company_id: session.companyId, name: 'Harbourlight Bankside', city: 'London' },
]

export const memberLocationRows: MemberLocation[] = everyone.map((member_id) => ({
  member_id,
  location_id: 'bankside',
}))

// --- Conversations (S2) -----------------------------------------------------

const conversation = (
  id: string,
  kind: ConversationKind,
  name: string | null,
  extra: Partial<Conversation> = {},
): Conversation => ({
  id,
  company_id: session.companyId,
  kind,
  name,
  emoji: null,
  location_id: null,
  dm_key: null,
  created_by: null,
  archived_at: null,
  inserted_at: at(45, '09:00'),
  ...extra,
})

const dmKey = (a: string, b: string) => [a, b].sort().join(':')

const dm = (other: string): Conversation =>
  conversation(`dm-${other}`, 'dm', null, { dm_key: dmKey(session.memberId, other) })

export const conversationRows: Conversation[] = [
  conversation('company-channel', 'company_channel', session.companyName),
  conversation('location-channel', 'location_channel', 'Bankside Announcements', {
    location_id: 'bankside',
  }),
  conversation('housekeeping', 'group', 'Housekeeping', { emoji: '🧹' }),
  conversation('wedding-ops', 'group', 'Saturday Wedding — Ops', { emoji: '💍', created_by: 'hannah' }),
  conversation('front-desk', 'group', 'Front Desk', { emoji: '🛎️' }),
  conversation('fnb-crew', 'group', 'F&B Crew', { emoji: '🍽️' }),
  conversation('night-shift', 'group', 'Night Shift', { emoji: '🌙' }),
  conversation('maintenance', 'group', 'Maintenance', { emoji: '🔧' }),
  conversation('reception-rota', 'group', 'Reception Rota Swaps', { emoji: '🔁' }),
  conversation('fire-wardens', 'group', 'Fire Wardens', { emoji: '🧯' }),
  dm('daniel'),
  dm('amira'),
  dm('yuki'),
  dm('marco'),
  dm('hannah'),
  dm('stefan'),
  dm('grace'),
  dm('liam'),
]

// --- Rosters (S2b) ----------------------------------------------------------

const rosterByConversation: Record<string, string[]> = {
  'company-channel': everyone,
  'location-channel': everyone,
  housekeeping: ['priya', 'elena', 'amira', 'grace'],
  'wedding-ops': ['daniel', 'hannah', 'priya', 'sofia', 'marco', 'tomasz', 'ines', 'omar', 'jamal', 'yuki', 'kasia'],
  'front-desk': ['priya', 'kasia', 'daniel', 'liam'],
  'fnb-crew': ['priya', 'sofia', 'marco', 'ines', 'omar'],
  'night-shift': ['priya', 'liam', 'tomasz', 'daniel'],
  maintenance: ['priya', 'jamal', 'daniel'],
  'reception-rota': ['priya', 'kasia', 'liam', 'yuki', 'daniel'],
  'fire-wardens': ['priya', 'daniel', 'elena', 'jamal', 'stefan'],
  'dm-daniel': ['priya', 'daniel'],
  'dm-amira': ['priya', 'amira'],
  'dm-yuki': ['priya', 'yuki'],
  'dm-marco': ['priya', 'marco'],
  'dm-hannah': ['priya', 'hannah'],
  'dm-stefan': ['priya', 'stefan'],
  'dm-grace': ['priya', 'grace'],
  'dm-liam': ['priya', 'liam'],
}

export const rosterRows: RosterEntry[] = Object.entries(rosterByConversation).flatMap(
  ([conversation_id, memberIds]) =>
    memberIds.map((member_id) => ({
      conversation_id,
      member_id,
      // Feeds the "Daniel added Tomasz Zieliński" system line in wedding-ops.
      added_by: conversation_id === 'wedding-ops' && member_id === 'tomasz' ? 'daniel' : null,
    })),
)

// --- My memberships (S1) ----------------------------------------------------
// last_read_at cursors are tuned so the derived unread badges light up the
// same chats the session-2 mockups highlighted (counts derive honestly from
// the rows below, so they can be smaller than the old hard-coded badges).

const myChatState: Record<string, Partial<ConversationMember>> = {
  'location-channel': { last_read_at: at(1, '20:00') }, // birthday post still unread
  housekeeping: { favorite: true, last_read_at: at(0, '11:00') },
  'dm-daniel': { favorite: true, last_read_at: at(0, '11:12') }, // "cover the desk" unread
  'wedding-ops': { last_read_at: at(0, '10:30') }, // three messages unread
  'fnb-crew': { muted_forever: true, last_read_at: at(0, '09:47') },
  'company-channel': { last_read_at: at(3, '12:00') },
  'front-desk': { last_read_at: at(0, '10:56') },
  'dm-amira': { last_read_at: at(0, '10:31') },
  'dm-yuki': { last_read_at: at(0, '09:12') },
  'night-shift': { last_read_at: at(0, '06:58') },
  maintenance: { last_read_at: at(1, '15:12') },
  'dm-marco': { last_read_at: at(1, '14:30') },
  'dm-hannah': { last_read_at: at(1, '12:15') },
  'reception-rota': { last_read_at: at(2, '13:40') },
  'dm-stefan': { last_read_at: at(2, '09:05') },
  'fire-wardens': { last_read_at: at(3, '11:20') },
  'dm-grace': { last_read_at: at(3, '09:47') },
  'dm-liam': { last_read_at: at(4, '21:10') },
}

export const myMembershipRows: ConversationMember[] = Object.keys(rosterByConversation).map(
  (conversation_id) => ({
    id: `cm-${conversation_id}-${session.memberId}`,
    conversation_id,
    member_id: session.memberId,
    favorite: false,
    muted_until: null,
    muted_forever: false,
    last_read_at: null,
    added_by: null,
    inserted_at: at(45, '09:30'),
    ...myChatState[conversation_id],
  }),
)

// --- Messages (S8) ----------------------------------------------------------

const msg = (
  id: string,
  conversation_id: string,
  author_id: string,
  daysAgo: number,
  hm: string,
  body: string,
  extra: Partial<Message> = {},
): Message => ({
  id,
  conversation_id,
  author_id,
  kind: 'text',
  body,
  title: null,
  post_emoji: null,
  reply_to_id: null,
  inserted_at: at(daysAgo, hm),
  ...extra,
})

// Group conversation: "Saturday Wedding — Ops" (full transcript).
const weddingMessages: Message[] = [
  msg('g1', 'wedding-ops', 'hannah', 1, '16:02', 'Team, final headcount for Saturday is 142. Ceremony at 3pm on the terrace, dinner in the ballroom from 6.'),
  msg('g2', 'wedding-ops', 'sofia', 1, '16:05', 'Kitchen briefing at 1pm. Marco is leading on the day.'),
  msg('g3', 'wedding-ops', 'marco', 1, '16:11', 'Menu is locked. Two veggie, one vegan table — flagged with the table plan.'),
  msg('g4', 'wedding-ops', 'daniel', 1, '16:30', 'Daniel added Tomasz Zieliński', { kind: 'system' }),
  msg('g5', 'wedding-ops', 'daniel', 1, '16:31', 'Tomasz will handle the gift table and guest luggage overflow.'),
  msg('g6', 'wedding-ops', 'tomasz', 1, '16:34', 'On it. Where are we storing the gifts overnight?'),
  msg('g7', 'wedding-ops', 'daniel', 1, '16:36', 'Luggage room B — I will label a rack for it.', { reply_to_id: 'g6' }),
  msg('g8', 'wedding-ops', 'ines', 1, '17:20', 'What time should waiters be in?'),
  msg('g9', 'wedding-ops', 'sofia', 1, '17:24', '@Inês @Omar 12:30 in the ballroom, dressed and ready. We rehearse service order once before doors.', { reply_to_id: 'g8' }),
  msg('g10', 'wedding-ops', 'hannah', 0, '08:55', 'Morning all! Florist arrives 10am, band load-in at noon through the service entrance.'),
  msg('g11', 'wedding-ops', 'jamal', 0, '09:12', 'PA and lighting checked, spare mic batteries in the AV case.'),
  msg('g12', 'wedding-ops', 'yuki', 0, '09:40', 'Forecast says light rain around 2pm. Do we have a terrace fallback?'),
  msg('g13', 'wedding-ops', 'hannah', 0, '09:44', 'Orangery is on standby, decision at 1pm. @Daniel you make the call.', { reply_to_id: 'g12' }),
  msg('g14', 'wedding-ops', 'daniel', 0, '09:51', 'Agreed — 1pm call. If we flip, porters move chairs first, flowers second.'),
  msg('g15', 'wedding-ops', 'kasia', 0, '10:22', 'Front desk briefed. We will hold non-wedding check-ins away from the lobby 2–4pm.'),
  msg('g16', 'wedding-ops', 'marco', 0, '10:47', 'Cake delivery just arrived, it is enormous. Fridge 2 cleared for it.'),
  msg('g17', 'wedding-ops', 'omar', 0, '11:02', 'Can someone share the final table plan?'),
  msg('g18', 'wedding-ops', 'hannah', 0, '11:38', '@Priya can you print the table plan before 2? Copies for the ballroom door and the kitchen pass.', { reply_to_id: 'g17' }),
  msg('g19', 'wedding-ops', 'priya', 0, '11:41', 'On it — printing four copies now, will drop them at the pass and the ballroom door by 1:30.', { reply_to_id: 'g18' }),
]

// 1:1 conversation: Priya ↔ Daniel (full transcript).
const dmDanielMessages: Message[] = [
  msg('d1', 'dm-daniel', 'daniel', 1, '18:12', 'Priya, how did the group from the conference settle in?'),
  msg('d2', 'dm-daniel', 'priya', 1, '18:20', 'All checked in by 6. Two room changes but nothing dramatic.'),
  msg('d3', 'dm-daniel', 'daniel', 1, '18:21', 'Nice work. Any feedback on the new key cards?'),
  msg('d4', 'dm-daniel', 'priya', 1, '18:25', 'Much faster. One guest managed to demagnetise theirs with a phone case, classic.'),
  msg('d5', 'dm-daniel', 'daniel', 0, '08:40', 'Morning! Heads up — regional director visits Thursday.'),
  msg('d6', 'dm-daniel', 'priya', 0, '08:47', 'Noted. I will make sure the lobby display is updated.'),
  msg('d7', 'dm-daniel', 'daniel', 0, '08:52', 'Also, the wedding tomorrow — Hannah may need you for an hour around 2pm for the table plan printing.'),
  msg('d8', 'dm-daniel', 'priya', 0, '08:55', 'Already on my list 🙂'),
  msg('d9', 'dm-daniel', 'daniel', 0, '11:10', 'One more thing — Kasia called in sick for the afternoon.'),
  msg('d10', 'dm-daniel', 'daniel', 0, '11:15', 'Can you cover the desk till 4? I owe you one'),
]

// Announcement channel: posts are messages with title/post_emoji set.
const announcementMessages: Message[] = [
  msg('a0a', 'location-channel', 'daniel', 5, '10:15', 'Please give a warm Bankside welcome to Inês Almeida and Omar Farouk, joining the F&B team this week. Say hi when you see them on the floor.', { title: 'Welcome our new starters', post_emoji: '👋' }),
  msg('a0b', 'location-channel', 'sofia', 4, '16:40', 'The new summer menu goes live in the brasserie on Monday. Tasting for all front-of-house staff on Sunday at 4pm — allergen sheets are in the shared folder.', { title: 'Summer menu launches Monday', post_emoji: '🍽️' }),
  msg('a1', 'location-channel', 'daniel', 1, '14:05', 'The quarterly fire drill moves from Tuesday to Thursday 10am so it does not clash with the conference checkout. Fire wardens, please confirm in your group.', { title: 'Fire drill moved to Thursday', post_emoji: '🧯' }),
  msg('a2', 'location-channel', 'elena', 1, '17:30', 'Housekeeping finished the full deep clean of floors 1–6 two days early. Guest satisfaction on cleanliness hit 4.9 this week. Incredible effort, team. 🧹', { title: 'Deep clean week — thank you', post_emoji: '✨' }),
  msg('a3', 'location-channel', 'daniel', 0, '09:20', 'Join us in the staff room at 3pm for cake — Marco made it himself, so expectations are officially high. Have a wonderful day, Amira!', { title: 'Happy birthday, Amira! 🎂', post_emoji: '🎉' }),
]

// The other conversations keep a one-message recent window — the old chat-list
// preview lines as real rows (the company channel stays genuinely empty).
const windowMessages: Message[] = [
  msg('p-housekeeping', 'housekeeping', 'elena', 0, '11:42', 'Floors 3–5 done, starting on the suites'),
  msg('p-front-desk', 'front-desk', 'kasia', 0, '10:56', 'Room 412 asked for a late checkout, approved ✔'),
  msg('p-dm-amira', 'dm-amira', 'amira', 0, '10:31', 'Thanks for swapping with me yesterday 🙏'),
  msg('p-fnb-crew', 'fnb-crew', 'sofia', 0, '09:47', 'New allergen sheet is in the shared folder'),
  msg('p-dm-yuki', 'dm-yuki', 'yuki', 0, '09:12', 'Guest in 208 loved the museum tip, nice one!'),
  msg('p-night-shift', 'night-shift', 'liam', 0, '06:58', 'Quiet night. Handover notes on the desk'),
  msg('p-maintenance', 'maintenance', 'jamal', 1, '15:12', 'Lift B back in service 👍'),
  msg('p-dm-marco', 'dm-marco', 'marco', 1, '14:30', 'Staff meal today is lasagne, come early'),
  msg('p-dm-hannah', 'dm-hannah', 'hannah', 1, '12:15', 'Sent you the AV checklist for the ballroom'),
  msg('p-reception-rota', 'reception-rota', 'priya', 2, '13:40', 'Taking the Sunday early if nobody minds'),
  msg('p-dm-stefan', 'dm-stefan', 'stefan', 2, '09:05', 'Airport pickup confirmed for 14:30'),
  msg('p-fire-wardens', 'fire-wardens', 'daniel', 3, '11:20', 'Drill moved to Thursday morning'),
  msg('p-dm-grace', 'dm-grace', 'grace', 3, '09:47', 'Found a phone in 305, gave it to lost & found'),
  msg('p-dm-liam', 'dm-liam', 'liam', 4, '21:10', 'See you at handover'),
]

export const messageRows: Message[] = [
  ...weddingMessages,
  ...dmDanielMessages,
  ...announcementMessages,
  ...windowMessages,
]

// --- Reactions (S9) ---------------------------------------------------------
// One row per member per emoji (the unique key in the schema); chips aggregate
// at render time. Member pools come from each conversation's roster.

const messageTime = new Map(messageRows.map((m) => [m.id, m.inserted_at]))

const react = (message_id: string, emoji: string, memberIds: string[]): MessageReaction[] =>
  memberIds.map((member_id, i) => ({
    id: `r-${message_id}-${emoji}-${i}`,
    message_id,
    member_id,
    emoji,
    inserted_at: messageTime.get(message_id)!,
  }))

/** The full location roster minus the given ids — pools for channel-wide reactions. */
const banksideExcept = (...exclude: string[]) => everyone.filter((id) => !exclude.includes(id))

export const reactionRows: MessageReaction[] = [
  // wedding-ops
  ...react('g1', '👍', ['daniel', 'sofia', 'marco', 'tomasz', 'ines']),
  ...react('g3', '🙌', ['sofia', 'hannah']),
  ...react('g7', '👍', ['tomasz']),
  ...react('g9', '✔️', ['ines', 'omar', 'hannah']),
  ...react('g10', '🌸', ['sofia', 'yuki', 'kasia', 'ines']),
  ...react('g10', '🎷', ['jamal', 'omar']),
  ...react('g11', '🔋', ['hannah']),
  ...react('g13', '🤞', ['priya', 'daniel', 'yuki', 'sofia', 'marco', 'kasia']),
  ...react('g15', '👏', ['daniel', 'hannah']),
  ...react('g16', '🎂', ['priya', 'hannah', 'sofia', 'daniel', 'ines', 'omar', 'yuki', 'kasia']),
  ...react('g16', '😍', ['hannah', 'tomasz', 'jamal']),
  ...react('g19', '🙌', ['hannah', 'daniel']),
  // dm-daniel
  ...react('d4', '😂', ['daniel']),
  ...react('d6', '👍', ['daniel']),
  // location channel announcements
  ...react('a0a', '👋', ['priya', ...banksideExcept('priya', 'daniel').slice(0, 12)]),
  ...react('a0a', '❤️', ['elena', 'sofia', 'hannah', 'yuki', 'kasia', 'grace']),
  ...react('a0b', '😋', banksideExcept('priya', 'sofia').slice(0, 11)),
  ...react('a0b', '👍', banksideExcept('priya', 'sofia').slice(3, 11)),
  ...react('a1', '👍', banksideExcept('priya', 'daniel').slice(0, 12)),
  ...react('a2', '👏', ['priya', ...banksideExcept('priya', 'elena').slice(0, 13)]),
  ...react('a2', '💚', banksideExcept('priya', 'elena').slice(0, 9)),
  ...react('a3', '🎂', ['priya', ...banksideExcept('priya', 'daniel', 'amira').slice(0, 12)]),
  ...react('a3', '❤️', banksideExcept('priya', 'daniel', 'amira').slice(0, 11)),
  ...react('a3', '🥳', banksideExcept('priya', 'daniel', 'amira').slice(0, 7)),
]

// --- Attachments (S10) ------------------------------------------------------
// No mock conversation carries attachments yet; the collection exists so the
// Electric swap covers the full shape catalog.

export const attachmentRows: MessageAttachment[] = []

// --- My settings (S6) + schedule (S7) ---------------------------------------

export const settingsRows: MemberSettings[] = [
  { member_id: session.memberId, snoozed_until: null, snooze_minutes: 30, language: 'en' },
]

export const scheduleRows: WorkSchedule[] = [0, 1, 2, 3, 4].map((weekday) => ({
  id: `sched-${weekday}`,
  member_id: session.memberId,
  weekday,
  starts_at: '07:00',
  ends_at: '15:30',
}))
