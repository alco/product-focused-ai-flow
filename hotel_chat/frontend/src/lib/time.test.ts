import { describe, expect, it } from 'vitest'
import { chatListTime, dayLabel, sameDay, timeLabel } from './time'

// A fixed local "now": Tuesday 18 August 2026, 12:00 local time.
const now = new Date(2026, 7, 18, 12, 0)
const local = (y: number, mo: number, d: number, h = 9, mi = 14) =>
  new Date(y, mo, d, h, mi).toISOString()

describe('timeLabel', () => {
  it('renders zero-padded 24h local time', () => {
    expect(timeLabel(local(2026, 7, 18, 9, 5))).toBe('09:05')
    expect(timeLabel(local(2026, 7, 18, 16, 40))).toBe('16:40')
  })
})

describe('chatListTime', () => {
  it('uses the clock time for today', () => {
    expect(chatListTime(local(2026, 7, 18, 11, 42), now)).toBe('11:42')
  })
  it('uses Yesterday across the date boundary, not a 24h window', () => {
    expect(chatListTime(local(2026, 7, 17, 23, 59), now)).toBe('Yesterday')
    expect(chatListTime(local(2026, 7, 17, 0, 1), now)).toBe('Yesterday')
  })
  it('uses short weekdays within six days, dates beyond', () => {
    expect(chatListTime(local(2026, 7, 16), now)).toBe('Sun')
    expect(chatListTime(local(2026, 7, 12), now)).toBe('Wed')
    expect(chatListTime(local(2026, 7, 11), now)).toBe('11 Aug')
  })
})

describe('dayLabel', () => {
  it('labels today, yesterday, and full dates', () => {
    expect(dayLabel(local(2026, 7, 18), now)).toBe('Today')
    expect(dayLabel(local(2026, 7, 17), now)).toBe('Yesterday')
    expect(dayLabel(local(2026, 7, 13), now)).toBe('Thursday 13 August')
  })
})

describe('sameDay', () => {
  it('compares local calendar dates', () => {
    expect(sameDay(local(2026, 7, 18, 0, 1), local(2026, 7, 18, 23, 59))).toBe(true)
    expect(sameDay(local(2026, 7, 18, 0, 1), local(2026, 7, 17, 23, 59))).toBe(false)
  })
})
