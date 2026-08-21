// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type {
  MindGardenCalendarDayValue,
  MindGardenCalendarMonthValue,
  MindGardenReflectionTrendValue,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { CalendarSpace, gardenCalendarCells } from '../src/client/spaces/CalendarSpace.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]
const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }

const dayValue = {
  date: '2026-08-19',
  events: [
    { type: 'checkin', id: 'checkin-1', mood: 1, energy: 4, emotionWords: ['安定', '好奇'], stamp },
    { type: 'checkin', id: 'checkin-2', mood: 0, energy: 3, emotionWords: [], stamp },
    { type: 'journal', id: 'journal-1', title: '今天的日记', body: '正文', stamp },
    { type: 'journal', id: 'journal-2', title: '', body: '无标题正文', stamp },
    { type: 'concern-reminder', concern: { content: '一件心事' }, stamp },
    { type: 'principle', principleId: 'principle-1', version: { content: { expression: '对自己诚实' } } },
    { type: 'experiment-review', experiment: { title: '边界实验' }, stamp },
    { type: 'experiment-observation', experimentId: 'experiment-1', observation: { observation: '我站定了一次' } },
    { type: 'open-question', openQuestionId: 'question-1', question: '什么是我想守住的？', transition: {} },
  ],
} as unknown as MindGardenCalendarDayValue

const monthValue = {
  month: '2026-08',
  days: [
    {
      date: '2026-08-19', eventCount: 9, checkinCount: 2, journalCount: 2, concernCount: 1,
      principleCount: 1, experimentCount: 2, openQuestionCount: 1, mood: 1, moodBand: 'light', energy: 4,
      energyBand: 'high',
    },
    {
      date: '2026-08-20', eventCount: 1, checkinCount: 0, journalCount: 1, concernCount: 0,
      principleCount: 0, experimentCount: 0, openQuestionCount: 0,
    },
  ],
} as MindGardenCalendarMonthValue

const trendValue = {
  days: 30,
  startDate: '2026-07-21',
  endDate: '2026-08-19',
  canPlot: true,
  recordedDays: 3,
  points: [-2, 0, 2].map((mood, index) => ({
    type: 'checkin', id: `point-${index}`, stamp, mood, energy: 3, emotionWords: [], phase: 'standalone',
  })),
} as unknown as MindGardenReflectionTrendValue

function props(overrides: Record<string, unknown> = {}) {
  return {
    today: '2026-08-19',
    t,
    onCalendarMonth: vi.fn(() => Promise.resolve({ ok: true as const, value: monthValue })),
    onCalendarDay: vi.fn(() => Promise.resolve({ ok: true as const, value: dayValue })),
    onReflectionTrend: vi.fn(() => Promise.resolve({ ok: true as const, value: trendValue })),
    onDraftConversation: vi.fn(),
    ...overrides,
  }
}

describe('gardenCalendarCells', () => {
  it('builds complete Gregorian weeks and rejects malformed months', () => {
    expect(gardenCalendarCells('invalid')).toEqual([])
    expect(gardenCalendarCells('2026-13')).toEqual([])
    const february = gardenCalendarCells('2024-02')
    expect(february).toHaveLength(35)
    expect(february.filter(cell => cell.date !== null)).toHaveLength(29)
    expect(february.find(cell => cell.day === 29)?.date).toBe('2024-02-29')
  })
})

describe('CalendarSpace', () => {
  it('renders every projected event, activity glow, trend, and month navigation', async () => {
    const actions = props()
    const view = render(<CalendarSpace {...actions} />)
    await view.findByText('今天的日记')
    for (const detail of [
      '安定 · 好奇',
      zh['calendar.event.noWords'],
      '无标题正文',
      '一件心事',
      '对自己诚实',
      '边界实验',
      '我站定了一次',
      '什么是我想守住的？',
    ]) expect(view.getByText(detail)).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['calendar.showTrend'] }))
    expect(view.getByRole('img', { name: zh['calendar.trendChart'] })).toBeTruthy()
    expect(view.container.querySelectorAll('circle')).toHaveLength(3)
    expect(view.container.querySelectorAll('[data-today="true"]')).toHaveLength(1)

    fireEvent.click(view.getByRole('button', { name: zh['calendar.showDay'] }))
    fireEvent.click(view.getByRole('button', { name: zh['calendar.filter.journal'] }))
    expect(view.getAllByRole('button', { name: zh['calendar.conversation'] })).toHaveLength(2)
    fireEvent.click(view.getAllByRole('button', { name: zh['calendar.conversation'] })[0]!)
    expect(actions.onDraftConversation).toHaveBeenCalledWith(expect.stringContaining('今天的日记'))
    expect(view.getByText(zh['calendar.notice.drafted'])).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: /2026-08-20/ }))
    await waitFor(() => { expect(actions.onCalendarDay).toHaveBeenCalledWith('2026-08-20') })
    fireEvent.change(view.getByLabelText(zh['calendar.month']), { target: { value: '2026-09' } })
    await waitFor(() => { expect(actions.onCalendarMonth).toHaveBeenCalledWith('2026-09') })
    fireEvent.click(view.getByRole('button', { name: zh['calendar.today'] }))
    await waitFor(() => { expect(actions.onCalendarMonth).toHaveBeenCalledWith('2026-08') })
  })

  it('shows empty and failure states', async () => {
    const empty = props({
      onCalendarMonth: vi.fn(() => Promise.resolve({ ok: true as const, value: { month: '2026-08', days: [] } })),
      onCalendarDay: vi.fn(() => Promise.resolve({ ok: true as const, value: { date: '2026-08-19', events: [] } })),
      onReflectionTrend: vi.fn(() => Promise.resolve({
        ok: true as const,
        value: { ...trendValue, canPlot: false, points: [] },
      })),
    })
    const emptyView = render(<CalendarSpace {...empty} />)
    expect(await emptyView.findByText(zh['calendar.emptyDay'])).toBeTruthy()
    fireEvent.click(emptyView.getByRole('button', { name: zh['calendar.showTrend'] }))
    expect(await emptyView.findByText(zh['calendar.trendEmpty'])).toBeTruthy()
    emptyView.unmount()

    const failed = props({
      onCalendarMonth: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
      onCalendarDay: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
      onReflectionTrend: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
    })
    const failedView = render(<CalendarSpace {...failed} />)
    expect(await failedView.findByRole('alert')).toBeTruthy()
  })

  it('ignores month and trend results after unmount', async () => {
    const monthDeferred = Promise.withResolvers<{ ok: true; value: MindGardenCalendarMonthValue }>()
    const trendDeferred = Promise.withResolvers<{ ok: true; value: MindGardenReflectionTrendValue }>()
    const actions = props({
      onCalendarMonth: () => monthDeferred.promise,
      onReflectionTrend: () => trendDeferred.promise,
    })
    const view = render(<CalendarSpace {...actions} />)
    view.unmount()
    monthDeferred.resolve({ ok: true, value: monthValue })
    trendDeferred.resolve({ ok: true, value: trendValue })
    await Promise.all([monthDeferred.promise, trendDeferred.promise])
  })
})
