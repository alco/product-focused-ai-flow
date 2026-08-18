// Pure derivations from collection rows to display values. Everything the old
// mock dataset stored pre-computed (unread counts, reaction chips, DM titles,
// schedule strings) is derived here from normalized rows instead — the
// data-model docs' "derived, not stored" rule made executable.

import { timeLabel } from '../lib/time'
import type {
  Conversation,
  ConversationMember,
  Member,
  MemberSettings,
  Message,
  MessageReaction,
  RosterEntry,
  WorkSchedule,
} from './schema'

export interface ReactionChip {
  emoji: string
  count: number
  mine: boolean
}

/** Aggregate per-member reaction rows to chips, preserving first-seen emoji order. */
export function aggregateReactions(rows: MessageReaction[], myId: string): ReactionChip[] {
  const byEmoji = new Map<string, ReactionChip>()
  for (const row of rows) {
    const chip = byEmoji.get(row.emoji)
    if (chip) {
      chip.count += 1
      chip.mine ||= row.member_id === myId
    } else {
      byEmoji.set(row.emoji, { emoji: row.emoji, count: 1, mine: row.member_id === myId })
    }
  }
  return [...byEmoji.values()]
}

/**
 * Unread = messages newer than my read cursor, excluding my own and system
 * lines (shape-model.md §"Unread badges"). Null cursor = never read.
 */
export function unreadCount(
  messages: Message[],
  membership: Pick<ConversationMember, 'last_read_at'>,
  myId: string,
): number {
  let n = 0
  for (const m of messages) {
    if (m.kind !== 'text' || m.author_id === myId) continue
    if (membership.last_read_at === null || m.inserted_at > membership.last_read_at) n += 1
  }
  return n
}

/** Conversation title: its own name, or for DMs the counterpart's name from roster ⋈ directory. */
export function conversationTitle(
  conversation: Pick<Conversation, 'name' | 'kind'>,
  roster: RosterEntry[],
  membersById: Map<string, Member>,
  myId: string,
): string {
  if (conversation.name) return conversation.name
  const other = roster.find((r) => r.member_id !== myId)
  return (other && membersById.get(other.member_id)?.name) ?? 'Conversation'
}

export function isMuted(
  membership: Pick<ConversationMember, 'muted_forever' | 'muted_until'>,
  now: Date = new Date(),
): boolean {
  if (membership.muted_forever) return true
  return membership.muted_until !== null && new Date(membership.muted_until) > now
}

const SCHEDULE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const trimSeconds = (t: string) => t.slice(0, 5)

/** Compress schedule rows to "Mon–Fri · 07:00–15:30" (multiple runs joined with ", "). */
export function scheduleSummary(rows: WorkSchedule[]): string {
  const sorted = [...rows].sort((a, b) => a.weekday - b.weekday)
  const runs: { from: number; to: number; hours: string }[] = []
  for (const row of sorted) {
    const hours = `${trimSeconds(row.starts_at)}–${trimSeconds(row.ends_at)}`
    const last = runs[runs.length - 1]
    if (last && last.hours === hours && row.weekday === last.to + 1) last.to = row.weekday
    else runs.push({ from: row.weekday, to: row.weekday, hours })
  }
  return runs
    .map((r) => {
      const days =
        r.from === r.to
          ? SCHEDULE_DAYS[r.from]
          : `${SCHEDULE_DAYS[r.from]}–${SCHEDULE_DAYS[r.to]}`
      return `${days} · ${r.hours}`
    })
    .join(', ')
}

export function snoozeLabel(
  settings: Pick<MemberSettings, 'snoozed_until' | 'snooze_minutes'>,
  now: Date = new Date(),
): string {
  if (settings.snoozed_until && new Date(settings.snoozed_until) > now) {
    return `On until ${timeLabel(settings.snoozed_until)}`
  }
  return `Off · auto-expires after ${settings.snooze_minutes} min`
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
  pt: 'Português',
  es: 'Español',
}

export function languageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? code
}
