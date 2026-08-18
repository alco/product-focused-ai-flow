import { describe, expect, it } from 'vitest'
import {
  aggregateReactions,
  conversationTitle,
  isMuted,
  languageName,
  scheduleSummary,
  snoozeLabel,
  unreadCount,
} from './derive'
import type { Member, Message, MessageReaction, WorkSchedule } from './schema'

const reaction = (n: number, emoji: string, member_id: string): MessageReaction => ({
  id: `r${n}`,
  message_id: 'm1',
  member_id,
  emoji,
  inserted_at: `2026-08-18T10:00:0${n}Z`,
})

describe('aggregateReactions', () => {
  it('groups per emoji, counts members, flags mine, keeps first-seen order', () => {
    const chips = aggregateReactions(
      [
        reaction(1, '👍', 'daniel'),
        reaction(2, '🎂', 'priya'),
        reaction(3, '👍', 'amira'),
        reaction(4, '🎂', 'marco'),
      ],
      'priya',
    )
    expect(chips).toEqual([
      { emoji: '👍', count: 2, mine: false },
      { emoji: '🎂', count: 2, mine: true },
    ])
  })
})

const msg = (id: string, author: string, at: string, kind: 'text' | 'system' = 'text'): Message => ({
  id,
  conversation_id: 'c1',
  author_id: author,
  kind,
  body: 'hi',
  title: null,
  post_emoji: null,
  reply_to_id: null,
  inserted_at: at,
})

describe('unreadCount', () => {
  const messages = [
    msg('m1', 'daniel', '2026-08-18T10:00:00Z'),
    msg('m2', 'daniel', '2026-08-18T11:00:00Z', 'system'),
    msg('m3', 'daniel', '2026-08-18T12:00:00Z'),
    msg('m4', 'priya', '2026-08-18T13:00:00Z'),
  ]
  it('counts messages after the cursor, excluding own and system lines', () => {
    expect(unreadCount(messages, { last_read_at: '2026-08-18T10:30:00Z' }, 'priya')).toBe(1)
  })
  it('counts everything (except own/system) when never read', () => {
    expect(unreadCount(messages, { last_read_at: null }, 'priya')).toBe(2)
  })
  it('is zero when the cursor is at the newest message', () => {
    expect(unreadCount(messages, { last_read_at: '2026-08-18T13:00:00Z' }, 'priya')).toBe(0)
  })
})

describe('conversationTitle', () => {
  const membersById = new Map<string, Member>([
    ['daniel', { id: 'daniel', company_id: 'h', name: 'Daniel Okafor', job_title: null, role: 'manager', active: true }],
  ])
  it('prefers the conversation name', () => {
    expect(conversationTitle({ name: 'Front Desk', kind: 'group' }, [], membersById, 'priya')).toBe(
      'Front Desk',
    )
  })
  it('derives DM titles from the roster counterpart', () => {
    const roster = [
      { id: 'cm1', conversation_id: 'c', member_id: 'priya', added_by: null },
      { id: 'cm2', conversation_id: 'c', member_id: 'daniel', added_by: null },
    ]
    expect(conversationTitle({ name: null, kind: 'dm' }, roster, membersById, 'priya')).toBe(
      'Daniel Okafor',
    )
  })
})

describe('isMuted', () => {
  const now = new Date('2026-08-18T12:00:00Z')
  it('honors muted_forever and future muted_until only', () => {
    expect(isMuted({ muted_forever: true, muted_until: null }, now)).toBe(true)
    expect(isMuted({ muted_forever: false, muted_until: '2026-08-18T13:00:00Z' }, now)).toBe(true)
    expect(isMuted({ muted_forever: false, muted_until: '2026-08-18T11:00:00Z' }, now)).toBe(false)
    expect(isMuted({ muted_forever: false, muted_until: null }, now)).toBe(false)
  })
})

const shift = (weekday: number, starts = '07:00', ends = '15:30'): WorkSchedule => ({
  id: `s${weekday}`,
  member_id: 'priya',
  weekday,
  starts_at: starts,
  ends_at: ends,
})

describe('scheduleSummary', () => {
  it('compresses consecutive weekdays with identical hours', () => {
    expect(scheduleSummary([0, 1, 2, 3, 4].map((d) => shift(d)))).toBe('Mon–Fri · 07:00–15:30')
  })
  it('splits runs on gaps or different hours and trims seconds', () => {
    expect(
      scheduleSummary([shift(0, '07:00:00', '15:30:00'), shift(1), shift(5, '10:00', '14:00')]),
    ).toBe('Mon–Tue · 07:00–15:30, Sat · 10:00–14:00')
  })
})

describe('snoozeLabel', () => {
  const now = new Date('2026-08-18T12:00:00Z')
  it('shows the default-duration off state and the active until-time', () => {
    expect(snoozeLabel({ snoozed_until: null, snooze_minutes: 30 }, now)).toBe(
      'Off · auto-expires after 30 min',
    )
    expect(
      snoozeLabel({ snoozed_until: '2026-08-18T12:30:00Z', snooze_minutes: 30 }, now),
    ).toMatch(/^On until \d\d:\d\d$/)
    expect(snoozeLabel({ snoozed_until: '2026-08-18T11:00:00Z', snooze_minutes: 45 }, now)).toBe(
      'Off · auto-expires after 45 min',
    )
  })
})

describe('languageName', () => {
  it('maps known codes and falls back to the code', () => {
    expect(languageName('en')).toBe('English')
    expect(languageName('xx')).toBe('xx')
  })
})
