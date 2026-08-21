// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type {
  MindGardenCheckin,
  MindGardenJournal,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { emotionWords, TodayPractice } from '../src/client/spaces/TodayPractice.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]
const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }

function checkin(): MindGardenCheckin {
  return {
    type: 'checkin', id: 'checkin-1', stamp, mood: 0, moodBand: 'steady', energy: 3,
    energyBand: 'steady', emotionWords: ['平静'], phase: 'standalone', sourceSessionId: 'session-1', createdAt: 1,
  } as unknown as MindGardenCheckin
}

function journal(id = 'journal-1', body = 'Original page'): MindGardenJournal {
  return {
    type: 'journal', id, version: `${id}-version`, stamp, title: 'Today', body,
    allowRetrieval: false, sourceSessionId: 'session-1', createdAt: 1, updatedAt: 1,
  } as unknown as MindGardenJournal
}

function props(overrides: Record<string, unknown> = {}) {
  const createdCheckin = { ...checkin(), id: 'checkin-2', mood: 2, energy: 5 } as unknown as MindGardenCheckin
  const createdJournal = journal('journal-2', 'New page')
  const updatedJournal = { ...journal(), version: 'journal-1-version-2', body: 'Revised page', allowRetrieval: true } as unknown as MindGardenJournal
  return {
    today: '2026-08-19',
    t,
    onCalendarDay: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { date: '2026-08-19', events: [checkin(), journal()] },
    })),
    onCreateCheckin: vi.fn(() => Promise.resolve({ ok: true as const, value: createdCheckin })),
    onCreateJournal: vi.fn(() => Promise.resolve({ ok: true as const, value: createdJournal })),
    onUpdateJournal: vi.fn(() => Promise.resolve({ ok: true as const, value: updatedJournal })),
    onDeleteJournal: vi.fn(() => Promise.resolve({ ok: true as const, value: true as const })),
    ...overrides,
  }
}

describe('TodayPractice', () => {
  it('normalizes emotion words without exceeding the service boundary', () => {
    expect(emotionWords(' 平静，期待  平静、犹豫,多余 ')).toEqual(['平静', '期待', '犹豫'])
    expect(emotionWords('  ')).toEqual([])
  })

  it('creates check-ins and creates, revises, and explicitly deletes journals', async () => {
    const actions = props()
    const view = render(<TodayPractice {...actions} />)
    await view.findByText('Original page')
    expect(view.getByLabelText(zh['today.checkin.saved'])).toBeTruthy()

    const bright = view.getByText(zh['today.mood.2']).closest('button')
    const full = view.getByText(zh['today.energy.5']).closest('button')
    if (bright === null || full === null) throw new Error('check-in scale button missing')
    fireEvent.click(bright)
    fireEvent.click(full)
    fireEvent.change(view.getByLabelText(zh['today.checkin.emotions']), {
      target: { value: '平静，期待 平静、犹豫' },
    })
    fireEvent.click(view.getByRole('button', { name: zh['today.checkin.save'] }))
    await waitFor(() => { expect(actions.onCreateCheckin).toHaveBeenCalledWith(
      2, 5, ['平静', '期待', '犹豫'], expect.objectContaining({ localDate: '2026-08-19' }),
    ) })
    expect(await view.findByText(zh['today.checkin.notice'])).toBeTruthy()

    fireEvent.change(view.getByLabelText(zh['today.journal.name']), { target: { value: '  New title  ' } })
    fireEvent.change(view.getByLabelText(zh['today.journal.body']), { target: { value: '  New page  ' } })
    fireEvent.click(view.getByLabelText(new RegExp(zh['today.journal.retrieval'])))
    fireEvent.click(view.getByRole('button', { name: zh['today.journal.create'] }))
    await waitFor(() => { expect(actions.onCreateJournal).toHaveBeenCalledWith(
      'New title', 'New page', true, expect.objectContaining({ localDate: '2026-08-19' }),
    ) })
    expect(await view.findByText(zh['today.journal.notice.created'])).toBeTruthy()

    fireEvent.click(view.getAllByRole('button', { name: zh['today.journal.edit'] })[1]!)
    const body = view.getByLabelText(zh['today.journal.body'])
    fireEvent.change(body, { target: { value: '  Revised page  ' } })
    fireEvent.click(view.getByLabelText(new RegExp(zh['today.journal.retrieval'])))
    fireEvent.click(view.getByRole('button', { name: zh['today.journal.update'] }))
    await waitFor(() => { expect(actions.onUpdateJournal).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'journal-1' }), 'Today', 'Revised page', true,
    ) })
    expect(await view.findByText(zh['today.journal.notice.updated'])).toBeTruthy()

    const remove = view.getAllByRole('button', { name: zh['today.journal.delete'] })[1]!
    fireEvent.click(remove)
    expect(view.getByRole('button', { name: zh['today.journal.delete.confirm'] })).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['today.journal.delete.confirm'] }))
    await waitFor(() => { expect(actions.onDeleteJournal).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'journal-1', version: 'journal-1-version-2' }),
    ) })
    expect(await view.findByText(zh['today.journal.notice.deleted'])).toBeTruthy()
  })

  it('guards empty journal submissions and contains load and mutation failures', async () => {
    const failed = props({
      onCalendarDay: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
    })
    const failedView = render(<TodayPractice {...failed} />)
    expect(await failedView.findByRole('alert')).toBeTruthy()
    failedView.unmount()

    const actions = props({
      onCreateCheckin: vi.fn(() => Promise.reject(new Error('offline'))),
      onCreateJournal: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
    })
    const view = render(<TodayPractice {...actions} />)
    await view.findByText('Original page')
    const journalForm = view.getByLabelText(zh['today.journal.body']).closest('form')
    if (journalForm === null) throw new Error('journal form missing')
    fireEvent.submit(journalForm)
    expect(actions.onCreateJournal).not.toHaveBeenCalled()
    fireEvent.click(view.getByRole('button', { name: zh['today.checkin.save'] }))
    expect(await view.findByRole('alert')).toBeTruthy()
    fireEvent.change(view.getByLabelText(zh['today.journal.body']), { target: { value: 'Will fail' } })
    fireEvent.click(view.getByRole('button', { name: zh['today.journal.create'] }))
    await waitFor(() => { expect(actions.onCreateJournal).toHaveBeenCalled() })
    expect(view.getByRole('alert')).toBeTruthy()
  })

  it('restores the current Host-owned day after a cold remount', async () => {
    const onCalendarDay = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: { date: '2026-08-19', events: [checkin(), journal()] },
      })
      .mockResolvedValueOnce({
        ok: true as const,
        value: { date: '2026-08-19', events: [checkin(), journal('journal-2', 'New page')] },
      })
    const actions = props({ onCalendarDay })
    const first = render(<TodayPractice {...actions} />)
    await first.findByText('Original page')
    fireEvent.change(first.getByLabelText(zh['today.journal.body']), { target: { value: 'New page' } })
    fireEvent.click(first.getByRole('button', { name: zh['today.journal.create'] }))
    await first.findByText(zh['today.journal.notice.created'])
    first.unmount()

    const recovered = render(<TodayPractice {...actions} />)
    expect(await recovered.findByText('New page')).toBeTruthy()
    expect(recovered.queryByText('Original page')).toBeNull()
    expect(onCalendarDay).toHaveBeenCalledTimes(2)
  })

  it('ignores an obsolete day load after unmount', async () => {
    const deferred = Promise.withResolvers<{ ok: true; value: { date: string; events: [] } }>()
    const actions = props({ onCalendarDay: () => deferred.promise })
    const view = render(<TodayPractice {...actions} />)
    view.unmount()
    deferred.resolve({ ok: true, value: { date: '2026-08-19', events: [] } })
    await deferred.promise
  })
})
