import { afterEach, describe, expect, it, vi } from 'vitest'
import { calendarStamp, currentPeriod, localDate } from '../src/client/calendar.ts'

afterEach(() => { vi.restoreAllMocks() })

describe('Mind Garden browser calendar helpers', () => {
  it('formats local dates and captures the observed browser zone and offset', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Asia/Shanghai' }),
    }) as Intl.DateTimeFormat)
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-480)
    expect(localDate(new Date(2026, 7, 9))).toBe('2026-08-09')
    expect(calendarStamp('2026-08-19')).toEqual({
      localDate: '2026-08-19',
      timeZone: 'Asia/Shanghai',
      utcOffsetMinutes: 480,
    })
  })

  it('falls back to UTC when the browser does not identify its zone', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: '' }),
    }) as Intl.DateTimeFormat)
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0)
    expect(calendarStamp('2026-08-19').timeZone).toBe('UTC')
  })

  it('derives inclusive Monday weeks and complete months and years', () => {
    const now = new Date(2026, 7, 19)
    expect(currentPeriod('week', now)).toEqual({ start: '2026-08-17', end: '2026-08-23' })
    expect(currentPeriod('month', now)).toEqual({ start: '2026-08-01', end: '2026-08-31' })
    expect(currentPeriod('year', now)).toEqual({ start: '2026-01-01', end: '2026-12-31' })
    const current = currentPeriod('week')
    expect(typeof current.start).toBe('string')
    expect(typeof current.end).toBe('string')
  })
})
