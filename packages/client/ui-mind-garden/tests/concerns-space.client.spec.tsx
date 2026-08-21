// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { MindGardenConcern, MindGardenConcernConversionValue } from '@deepseek-ai/dsh-mind-garden-reflection/types'
import { ConcernsSpace } from '../src/client/spaces/ConcernsSpace.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]
const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }

function concern(status: 'active' | 'completed' | 'converted', reminder = false): MindGardenConcern {
  return {
    type: 'concern',
    id: `concern-${status}`,
    version: `version-${status}`,
    content: `${status} concern`,
    status,
    createdStamp: stamp,
    reminder: reminder ? { ...stamp, localDate: '2026-08-22' } : null,
    convertedJournalId: status === 'converted' ? 'journal-1' : null,
    sourceSessionId: 'session-1',
    createdAt: 1,
    updatedAt: 1,
  } as unknown as MindGardenConcern
}

function props(overrides: Record<string, unknown> = {}) {
  const active = concern('active', true)
  return {
    today: '2026-08-19',
    t,
    onListConcerns: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: [active, concern('completed'), concern('converted')],
    })),
    onCreateConcern: vi.fn(() => Promise.resolve({ ok: true as const, value: active })),
    onUpdateConcern: vi.fn(() => Promise.resolve({ ok: true as const, value: active })),
    onCompleteConcern: vi.fn(() => Promise.resolve({ ok: true as const, value: concern('completed') })),
    onConvertConcern: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { concern: concern('converted'), journal: {} } as MindGardenConcernConversionValue,
    })),
    onDraftConversation: vi.fn(),
    ...overrides,
  }
}

describe('ConcernsSpace', () => {
  it('creates, completes, and explicitly converts concerns', async () => {
    const actions = props()
    const view = render(<ConcernsSpace {...actions} />)
    await view.findByText('active concern')
    expect(view.getByText('completed concern')).toBeTruthy()
    expect(view.getByText('converted concern')).toBeTruthy()
    expect(view.getByText('2026-08-22 再看')).toBeTruthy()

    const form = view.getByLabelText(zh['concern.input']).closest('form')
    if (form === null) throw new Error('concern form missing')
    fireEvent.submit(form)
    expect(actions.onCreateConcern).not.toHaveBeenCalled()
    fireEvent.change(view.getByLabelText(zh['concern.input']), { target: { value: '  Something private  ' } })
    fireEvent.change(view.getByLabelText(zh['concern.reminder']), { target: { value: '2026-08-23' } })
    fireEvent.click(view.getByLabelText(zh['concern.retrieval']))
    fireEvent.click(view.getByRole('button', { name: zh['concern.add'] }))
    await waitFor(() => { expect(actions.onCreateConcern).toHaveBeenCalled() })
    expect(actions.onCreateConcern).toHaveBeenCalledWith(
      'Something private',
      expect.objectContaining({ localDate: '2026-08-19' }),
      expect.objectContaining({ localDate: '2026-08-23' }),
    )
    expect(await view.findByText(zh['concern.notice.created'])).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: zh['concern.conversation'] }))
    expect(actions.onDraftConversation).toHaveBeenCalledWith(expect.stringContaining('active concern'))
    expect(view.getByText(zh['concern.notice.drafted'])).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: zh['concern.edit'] }))
    fireEvent.change(view.getByLabelText(zh['concern.edit']), { target: { value: '  Updated concern  ' } })
    const reminderFields = view.getAllByLabelText(zh['concern.reminder'])
    fireEvent.change(reminderFields.at(-1)!, { target: { value: '2026-08-24' } })
    fireEvent.click(view.getByRole('button', { name: zh['concern.edit.save'] }))
    await waitFor(() => { expect(actions.onUpdateConcern).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
      'Updated concern',
      '2026-08-19',
      expect.objectContaining({ localDate: '2026-08-24' }),
    ) })
    expect(await view.findByText(zh['concern.notice.updated'])).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: zh['concern.convert'] }))
    await waitFor(() => { expect(actions.onConvertConcern).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
      expect.objectContaining({ localDate: '2026-08-19' }),
      true,
    ) })
    expect(await view.findByText(zh['concern.notice.converted'])).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['concern.complete'] }))
    await waitFor(() => { expect(actions.onCompleteConcern).toHaveBeenCalled() })
    expect(await view.findByText(zh['concern.notice.completed'])).toBeTruthy()
  })

  it('renders empty and load-error states and reports failed mutations', async () => {
    const empty = props({ onListConcerns: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })) })
    const emptyView = render(<ConcernsSpace {...empty} />)
    expect(await emptyView.findByText(zh['concern.empty'])).toBeTruthy()
    emptyView.unmount()

    const failed = props({
      onListConcerns: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
      onCreateConcern: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
    })
    const failedView = render(<ConcernsSpace {...failed} />)
    expect(await failedView.findByRole('alert')).toBeTruthy()
    fireEvent.change(failedView.getByLabelText(zh['concern.input']), { target: { value: 'Will fail' } })
    fireEvent.click(failedView.getByRole('button', { name: zh['concern.add'] }))
    await waitFor(() => { expect(failed.onCreateConcern).toHaveBeenCalled() })
    expect(failedView.getByRole('alert')).toBeTruthy()
  })

  it('reports completion and conversion failures and ignores an obsolete load', async () => {
    const failed = props({
      onCompleteConcern: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
      onConvertConcern: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })),
    })
    const view = render(<ConcernsSpace {...failed} />)
    await view.findByText('active concern')
    fireEvent.click(view.getByRole('button', { name: zh['concern.convert'] }))
    await waitFor(() => { expect(failed.onConvertConcern).toHaveBeenCalled() })
    expect(view.getByRole('alert')).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['concern.complete'] }))
    await waitFor(() => { expect(failed.onCompleteConcern).toHaveBeenCalled() })
    expect(view.getByRole('alert')).toBeTruthy()
    view.unmount()

    const deferred = Promise.withResolvers<{ ok: true; value: readonly MindGardenConcern[] }>()
    const obsolete = props({ onListConcerns: () => deferred.promise })
    const obsoleteView = render(<ConcernsSpace {...obsolete} />)
    obsoleteView.unmount()
    deferred.resolve({ ok: true, value: [] })
    await deferred.promise
  })
})
