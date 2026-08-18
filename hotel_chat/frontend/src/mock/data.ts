// Shared mock dataset for all UI mockup pages.
// One consistent cast + one consistent set of conversations across every screen.
// No backend, no sync — plain constants.

export type PersonId = string

export interface Person {
  id: PersonId
  name: string
  jobTitle: string
  role: 'manager' | 'staff'
  location: string
  online?: boolean
}

export type ChatKind = 'company' | 'location' | 'group' | 'dm'

export interface ChatListEntry {
  id: string
  kind: ChatKind
  name: string // for DMs: the other person's name
  lastAuthor?: string // short first name, omitted for DMs/own messages
  lastMessage: string
  lastTime: string
  unread: number
  favorite?: boolean
  muted?: boolean
  memberCount?: number
}

export interface Reaction {
  emoji: string
  count: number
  mine?: boolean
}

export interface Message {
  id: string
  authorId: PersonId
  text: string
  time: string // "09:14"
  reactions?: Reaction[]
  replyToId?: string
  /** rendered as a centered system line, not a bubble */
  system?: boolean
  /** day divider rendered before this message */
  dayDivider?: string
}

export interface AnnouncementPost {
  id: string
  authorId: PersonId
  title?: string
  text: string
  time: string
  day: string
  reactions: Reaction[]
  emoji?: string // decorative post emoji
}

// --- Company & location ----------------------------------------------------

export const company = { name: 'Harbourlight Hotels' }
export const location = { name: 'Harbourlight Bankside', city: 'London' }

// --- People ----------------------------------------------------------------
// currentUser: staff perspective (reader views).
// managerUser: perspective for manager-variant views.

export const people: Person[] = [
  { id: 'priya', name: 'Priya Nair', jobTitle: 'Front Desk', role: 'staff', location: 'Bankside', online: true },
  { id: 'daniel', name: 'Daniel Okafor', jobTitle: 'Duty Manager', role: 'manager', location: 'Bankside', online: true },
  { id: 'amira', name: 'Amira Haddad', jobTitle: 'Housekeeping', role: 'staff', location: 'Bankside', online: true },
  { id: 'tomasz', name: 'Tomasz Zieliński', jobTitle: 'Porter', role: 'staff', location: 'Bankside' },
  { id: 'sofia', name: 'Sofía Reyes', jobTitle: 'F&B Supervisor', role: 'manager', location: 'Bankside', online: true },
  { id: 'marco', name: 'Marco Bellini', jobTitle: 'Chef de Partie', role: 'staff', location: 'Bankside' },
  { id: 'grace', name: 'Grace Adeyemi', jobTitle: 'Housekeeping', role: 'staff', location: 'Bankside' },
  { id: 'liam', name: "Liam O'Connor", jobTitle: 'Night Reception', role: 'staff', location: 'Bankside' },
  { id: 'yuki', name: 'Yuki Tanaka', jobTitle: 'Concierge', role: 'staff', location: 'Bankside', online: true },
  { id: 'elena', name: 'Elena Petrova', jobTitle: 'Housekeeping Lead', role: 'manager', location: 'Bankside' },
  { id: 'jamal', name: 'Jamal Carter', jobTitle: 'Maintenance', role: 'staff', location: 'Bankside' },
  { id: 'ines', name: 'Inês Almeida', jobTitle: 'Waiter', role: 'staff', location: 'Bankside' },
  { id: 'stefan', name: 'Stefan Weber', jobTitle: 'Driver', role: 'staff', location: 'Bankside' },
  { id: 'hannah', name: 'Hannah Lewis', jobTitle: 'Events Coordinator', role: 'staff', location: 'Bankside', online: true },
  { id: 'omar', name: 'Omar Farouk', jobTitle: 'Waiter', role: 'staff', location: 'Bankside' },
  { id: 'kasia', name: 'Kasia Nowak', jobTitle: 'Front Desk', role: 'staff', location: 'Bankside' },
]

export const currentUser = people.find((p) => p.id === 'priya')!
export const managerUser = people.find((p) => p.id === 'daniel')!

export const personById = (id: PersonId): Person => people.find((p) => p.id === id)!

// --- Chat list (mobile home) ----------------------------------------------
// Official first, then favorites, then the rest by recency. Long enough to scroll.

export const officialChats: ChatListEntry[] = [
  {
    id: 'company-channel',
    kind: 'company',
    name: 'Harbourlight Hotels',
    lastAuthor: 'Head Office',
    lastMessage: 'Harbourlight named in the Sunday Times Best Places to Work 🎉',
    lastTime: 'Mon',
    unread: 1,
  },
  {
    id: 'location-channel',
    kind: 'location',
    name: 'Bankside Announcements',
    lastAuthor: 'Daniel',
    lastMessage: 'Happy birthday, Amira! 🎂 Cake in the staff room at 3pm',
    lastTime: '09:20',
    unread: 2,
  },
]

export const favoriteChats: ChatListEntry[] = [
  {
    id: 'housekeeping',
    kind: 'group',
    name: 'Housekeeping',
    lastAuthor: 'Elena',
    lastMessage: 'Floors 3–5 done, starting on the suites',
    lastTime: '11:42',
    unread: 3,
    favorite: true,
    memberCount: 9,
  },
  {
    id: 'dm-daniel',
    kind: 'dm',
    name: 'Daniel Okafor',
    lastMessage: 'Can you cover the desk till 4? I owe you one',
    lastTime: '11:15',
    unread: 1,
    favorite: true,
  },
]

export const recentChats: ChatListEntry[] = [
  {
    id: 'wedding-ops',
    kind: 'group',
    name: 'Saturday Wedding — Ops',
    lastAuthor: 'Hannah',
    lastMessage: '@Priya can you print the table plan before 2?',
    lastTime: '11:38',
    unread: 4,
    memberCount: 11,
  },
  {
    id: 'front-desk',
    kind: 'group',
    name: 'Front Desk',
    lastAuthor: 'Kasia',
    lastMessage: 'Room 412 asked for a late checkout, approved ✔',
    lastTime: '10:56',
    unread: 0,
    memberCount: 6,
  },
  {
    id: 'dm-amira',
    kind: 'dm',
    name: 'Amira Haddad',
    lastMessage: 'Thanks for swapping with me yesterday 🙏',
    lastTime: '10:31',
    unread: 0,
  },
  {
    id: 'fnb-crew',
    kind: 'group',
    name: 'F&B Crew',
    lastAuthor: 'Sofía',
    lastMessage: 'New allergen sheet is in the shared folder',
    lastTime: '09:47',
    unread: 0,
    muted: true,
    memberCount: 14,
  },
  {
    id: 'dm-yuki',
    kind: 'dm',
    name: 'Yuki Tanaka',
    lastMessage: 'Guest in 208 loved the museum tip, nice one!',
    lastTime: '09:12',
    unread: 0,
  },
  {
    id: 'night-shift',
    kind: 'group',
    name: 'Night Shift',
    lastAuthor: 'Liam',
    lastMessage: 'Quiet night. Handover notes on the desk',
    lastTime: '06:58',
    unread: 0,
    memberCount: 5,
  },
  {
    id: 'maintenance',
    kind: 'group',
    name: 'Maintenance',
    lastAuthor: 'Jamal',
    lastMessage: 'Lift B back in service 👍',
    lastTime: 'Yesterday',
    unread: 0,
    memberCount: 4,
  },
  {
    id: 'dm-marco',
    kind: 'dm',
    name: 'Marco Bellini',
    lastMessage: 'Staff meal today is lasagne, come early',
    lastTime: 'Yesterday',
    unread: 0,
  },
  {
    id: 'dm-hannah',
    kind: 'dm',
    name: 'Hannah Lewis',
    lastMessage: 'Sent you the AV checklist for the ballroom',
    lastTime: 'Yesterday',
    unread: 0,
  },
  {
    id: 'reception-rota',
    kind: 'group',
    name: 'Reception Rota Swaps',
    lastAuthor: 'Priya',
    lastMessage: 'You: taking the Sunday early if nobody minds',
    lastTime: 'Tue',
    unread: 0,
    memberCount: 8,
  },
  {
    id: 'dm-stefan',
    kind: 'dm',
    name: 'Stefan Weber',
    lastMessage: 'Airport pickup confirmed for 14:30',
    lastTime: 'Tue',
    unread: 0,
  },
  {
    id: 'fire-wardens',
    kind: 'group',
    name: 'Fire Wardens',
    lastAuthor: 'Daniel',
    lastMessage: 'Drill moved to Thursday morning',
    lastTime: 'Mon',
    unread: 0,
    memberCount: 7,
  },
  {
    id: 'dm-grace',
    kind: 'dm',
    name: 'Grace Adeyemi',
    lastMessage: 'Found a phone in 305, gave it to lost & found',
    lastTime: 'Mon',
    unread: 0,
  },
  {
    id: 'dm-liam',
    kind: 'dm',
    name: "Liam O'Connor",
    lastMessage: 'See you at handover',
    lastTime: 'Sun',
    unread: 0,
  },
]

// --- Group conversation: "Saturday Wedding — Ops" --------------------------

export const groupChat = {
  id: 'wedding-ops',
  name: 'Saturday Wedding — Ops',
  memberIds: ['daniel', 'hannah', 'priya', 'sofia', 'marco', 'tomasz', 'ines', 'omar', 'jamal', 'yuki', 'kasia'],
}

export const groupMessages: Message[] = [
  { id: 'g1', authorId: 'hannah', dayDivider: 'Yesterday', text: 'Team, final headcount for Saturday is 142. Ceremony at 3pm on the terrace, dinner in the ballroom from 6.', time: '16:02', reactions: [{ emoji: '👍', count: 5 }] },
  { id: 'g2', authorId: 'sofia', text: 'Kitchen briefing at 1pm. Marco is leading on the day.', time: '16:05' },
  { id: 'g3', authorId: 'marco', text: 'Menu is locked. Two veggie, one vegan table — flagged with the table plan.', time: '16:11', reactions: [{ emoji: '🙌', count: 2 }] },
  { id: 'g4', authorId: 'tomasz', system: true, text: 'Daniel added Tomasz Zieliński', time: '16:30' },
  { id: 'g5', authorId: 'daniel', text: 'Tomasz will handle the gift table and guest luggage overflow.', time: '16:31' },
  { id: 'g6', authorId: 'tomasz', text: 'On it. Where are we storing the gifts overnight?', time: '16:34' },
  { id: 'g7', authorId: 'daniel', replyToId: 'g6', text: 'Luggage room B — I will label a rack for it.', time: '16:36', reactions: [{ emoji: '👍', count: 1 }] },
  { id: 'g8', authorId: 'ines', text: 'What time should waiters be in?', time: '17:20' },
  { id: 'g9', authorId: 'sofia', replyToId: 'g8', text: '@Inês @Omar 12:30 in the ballroom, dressed and ready. We rehearse service order once before doors.', time: '17:24', reactions: [{ emoji: '✔️', count: 3 }] },
  { id: 'g10', authorId: 'hannah', dayDivider: 'Today', text: 'Morning all! Florist arrives 10am, band load-in at noon through the service entrance.', time: '08:55', reactions: [{ emoji: '🌸', count: 4 }, { emoji: '🎷', count: 2 }] },
  { id: 'g11', authorId: 'jamal', text: 'PA and lighting checked, spare mic batteries in the AV case.', time: '09:12', reactions: [{ emoji: '🔋', count: 1 }] },
  { id: 'g12', authorId: 'yuki', text: 'Forecast says light rain around 2pm. Do we have a terrace fallback?', time: '09:40' },
  { id: 'g13', authorId: 'hannah', replyToId: 'g12', text: 'Orangery is on standby, decision at 1pm. @Daniel you make the call.', time: '09:44', reactions: [{ emoji: '🤞', count: 6, mine: true }] },
  { id: 'g14', authorId: 'daniel', text: 'Agreed — 1pm call. If we flip, porters move chairs first, flowers second.', time: '09:51' },
  { id: 'g15', authorId: 'kasia', text: 'Front desk briefed. We will hold non-wedding check-ins away from the lobby 2–4pm.', time: '10:22', reactions: [{ emoji: '👏', count: 2 }] },
  { id: 'g16', authorId: 'marco', text: 'Cake delivery just arrived, it is enormous. Fridge 2 cleared for it.', time: '10:47', reactions: [{ emoji: '🎂', count: 8, mine: true }, { emoji: '😍', count: 3 }] },
  { id: 'g17', authorId: 'omar', text: 'Can someone share the final table plan?', time: '11:02' },
  { id: 'g18', authorId: 'hannah', replyToId: 'g17', text: '@Priya can you print the table plan before 2? Copies for the ballroom door and the kitchen pass.', time: '11:38' },
]

// --- 1:1 conversation: Priya ↔ Daniel --------------------------------------

export const dmChat = { id: 'dm-daniel', otherId: 'daniel' }

export const dmMessages: Message[] = [
  { id: 'd1', authorId: 'daniel', dayDivider: 'Yesterday', text: 'Priya, how did the group from the conference settle in?', time: '18:12' },
  { id: 'd2', authorId: 'priya', text: 'All checked in by 6. Two room changes but nothing dramatic.', time: '18:20' },
  { id: 'd3', authorId: 'daniel', text: 'Nice work. Any feedback on the new key cards?', time: '18:21' },
  { id: 'd4', authorId: 'priya', text: 'Much faster. One guest managed to demagnetise theirs with a phone case, classic.', time: '18:25', reactions: [{ emoji: '😂', count: 1 }] },
  { id: 'd5', authorId: 'daniel', dayDivider: 'Today', text: 'Morning! Heads up — regional director visits Thursday.', time: '08:40' },
  { id: 'd6', authorId: 'priya', text: 'Noted. I will make sure the lobby display is updated.', time: '08:47', reactions: [{ emoji: '👍', count: 1 }] },
  { id: 'd7', authorId: 'daniel', text: 'Also, the wedding tomorrow — Hannah may need you for an hour around 2pm for the table plan printing.', time: '08:52' },
  { id: 'd8', authorId: 'priya', text: 'Already on my list 🙂', time: '08:55' },
  { id: 'd9', authorId: 'daniel', text: 'One more thing — Kasia called in sick for the afternoon.', time: '11:10' },
  { id: 'd10', authorId: 'daniel', text: 'Can you cover the desk till 4? I owe you one', time: '11:15' },
]

// --- Announcement channel: "Bankside Announcements" ------------------------

export const locationChannel = {
  id: 'location-channel',
  name: 'Bankside Announcements',
  audience: 'Everyone at Harbourlight Bankside · 34 people',
}

export const announcements: AnnouncementPost[] = [
  {
    id: 'a1',
    authorId: 'daniel',
    day: 'Monday 17 August',
    title: 'Fire drill moved to Thursday',
    text: 'The quarterly fire drill moves from Tuesday to Thursday 10am so it does not clash with the conference checkout. Fire wardens, please confirm in your group.',
    time: '14:05',
    emoji: '🧯',
    reactions: [{ emoji: '👍', count: 12 }],
  },
  {
    id: 'a2',
    authorId: 'elena',
    day: 'Monday 17 August',
    title: 'Deep clean week — thank you',
    text: 'Housekeeping finished the full deep clean of floors 1–6 two days early. Guest satisfaction on cleanliness hit 4.9 this week. Incredible effort, team. 🧹',
    time: '17:30',
    emoji: '✨',
    reactions: [{ emoji: '👏', count: 21, mine: true }, { emoji: '💚', count: 9 }],
  },
  {
    id: 'a3',
    authorId: 'daniel',
    day: 'Today',
    title: 'Happy birthday, Amira! 🎂',
    text: 'Join us in the staff room at 3pm for cake — Marco made it himself, so expectations are officially high. Have a wonderful day, Amira!',
    time: '09:20',
    emoji: '🎉',
    reactions: [{ emoji: '🎂', count: 18, mine: true }, { emoji: '❤️', count: 14 }, { emoji: '🥳', count: 7 }],
  },
]

export const companyChannelEntry = officialChats[0]
