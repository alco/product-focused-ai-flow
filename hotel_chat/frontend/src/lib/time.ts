// Time-label formatting for timestamps coming out of the collections.
// Everything is date-boundary based (local time), with `now` injectable for
// tests. The mock screens' relative labels ("Yesterday", "Mon") are derived
// here instead of being stored.

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n: number) => String(n).padStart(2, '0')

/** Days between the local calendar dates of `iso` and `now` (0 = today). */
function daysAgo(iso: string, now: Date): number {
  const d = new Date(iso)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  return Math.round((startOf(now) - startOf(d)) / 86_400_000)
}

/** "09:14" — the in-bubble timestamp. */
export function timeLabel(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Chat-list recency: "11:42" today, "Yesterday", "Mon" within the week, else "17 Aug". */
export function chatListTime(iso: string, now: Date = new Date()): string {
  const ago = daysAgo(iso, now)
  if (ago <= 0) return timeLabel(iso)
  if (ago === 1) return 'Yesterday'
  const d = new Date(iso)
  if (ago <= 6) return WEEKDAY_SHORT[d.getDay()]
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

/** Day headers/dividers: "Today", "Yesterday", else "Monday 17 August". */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const ago = daysAgo(iso, now)
  if (ago <= 0) return 'Today'
  if (ago === 1) return 'Yesterday'
  const d = new Date(iso)
  return `${WEEKDAY_LONG[d.getDay()]} ${d.getDate()} ${MONTH_LONG[d.getMonth()]}`
}

/** True when both timestamps fall on the same local calendar date. */
export function sameDay(isoA: string, isoB: string): boolean {
  return daysAgo(isoA, new Date(isoB)) === 0
}
