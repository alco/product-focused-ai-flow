// Extra mock data for the announcement-channel screens only.
// Extends the shared `announcements` from data.ts with a couple of older
// posts so the feed scrolls like a real bulletin history.

import type { AnnouncementPost } from './data'
import { announcements } from './data'

export const earlierAnnouncements: AnnouncementPost[] = [
  {
    id: 'a0a',
    authorId: 'daniel',
    day: 'Thursday 13 August',
    title: 'Welcome our new starters',
    text: 'Please give a warm Bankside welcome to Inês Almeida and Omar Farouk, joining the F&B team this week. Say hi when you see them on the floor.',
    time: '10:15',
    emoji: '👋',
    reactions: [
      { emoji: '👋', count: 16, mine: true },
      { emoji: '❤️', count: 6 },
    ],
  },
  {
    id: 'a0b',
    authorId: 'sofia',
    day: 'Friday 14 August',
    title: 'Summer menu launches Monday',
    text: 'The new summer menu goes live in the brasserie on Monday. Tasting for all front-of-house staff on Sunday at 4pm — allergen sheets are in the shared folder.',
    time: '16:40',
    emoji: '🍽️',
    reactions: [
      { emoji: '😋', count: 11 },
      { emoji: '👍', count: 8 },
    ],
  },
]

/** Full channel history, oldest first, ending with the shared recent posts. */
export const channelFeed: AnnouncementPost[] = [...earlierAnnouncements, ...announcements]
