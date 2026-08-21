// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { MindGardenExperiment, MindGardenExperimentStatus } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { GrowthSpace } from '../src/client/spaces/GrowthSpace.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]
const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }

function experiment(status: MindGardenExperimentStatus, detailed = false): MindGardenExperiment {
  return {
    type: 'experiment', id: `experiment-${status}`, version: `version-${status}`,
    title: `${status} experiment`, hypothesis: detailed ? 'A grounded hypothesis' : '', action: 'Take one small step',
    reviewStamp: detailed ? { ...stamp, localDate: '2026-08-25' } : null, status, result: '', judgment: '',
    sourceSessionId: 'session-1', sourceMessageId: null, evidenceQuote: '',
    observations: detailed ? [{ id: 'observation-1', observation: 'A real observation', stamp }] : [],
    createdStamp: stamp, startedAt: null, stoppedAt: null, createdAt: 1, updatedAt: 1,
  } as unknown as MindGardenExperiment
}

function props(overrides: Record<string, unknown> = {}) {
  const experiments = [
    experiment('proposed', true),
    experiment('trying'),
    experiment('observed'),
    experiment('revised'),
    experiment('stopped'),
  ]
  return {
    today: '2026-08-19',
    t,
    onListExperiments: vi.fn(() => Promise.resolve({ ok: true as const, value: experiments })),
    onCreateExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiments[0]! })),
    onStartExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiment('trying') })),
    onObserveExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiment('observed') })),
    onStopExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiment('stopped') })),
    onDraftConversation: vi.fn(),
    ...overrides,
  }
}

describe('GrowthSpace', () => {
  it('creates, starts, observes, and stops unscored experiments', async () => {
    const actions = props()
    const view = render(<GrowthSpace {...actions} />)
    await view.findByText('proposed experiment')
    expect(view.getByText('A grounded hypothesis')).toBeTruthy()
    expect(view.getByText('A real observation')).toBeTruthy()
    expect(view.getByText('2026-08-25')).toBeTruthy()

    const form = view.getByLabelText(zh['growth.input.title']).closest('form')
    if (form === null) throw new Error('experiment form missing')
    fireEvent.submit(form)
    expect(actions.onCreateExperiment).not.toHaveBeenCalled()
    fireEvent.change(view.getByLabelText(zh['growth.input.title']), { target: { value: '  Boundary practice  ' } })
    fireEvent.change(view.getByLabelText(zh['growth.input.hypothesis']), { target: { value: '  It may help  ' } })
    fireEvent.change(view.getByLabelText(zh['growth.input.action']), { target: { value: '  Say one clear no  ' } })
    fireEvent.change(view.getByLabelText(zh['growth.input.reviewDate']), { target: { value: '2026-08-27' } })
    fireEvent.click(view.getByRole('button', { name: zh['growth.create'] }))
    await waitFor(() => { expect(actions.onCreateExperiment).toHaveBeenCalledWith(
      'Boundary practice',
      'It may help',
      'Say one clear no',
      expect.objectContaining({ localDate: '2026-08-19' }),
      expect.objectContaining({ localDate: '2026-08-27' }),
    ) })
    expect(await view.findByText(zh['growth.notice.created'])).toBeTruthy()

    fireEvent.click(view.getAllByRole('button', { name: zh['growth.continue'] })[0]!)
    expect(actions.onDraftConversation).toHaveBeenCalledWith(expect.stringContaining('proposed experiment'))
    expect(view.getByText(zh['growth.notice.drafted'])).toBeTruthy()

    fireEvent.click(view.getAllByRole('button', { name: zh['growth.start'] })[0]!)
    await waitFor(() => { expect(actions.onStartExperiment).toHaveBeenCalled() })
    fireEvent.click(view.getAllByRole('button', { name: zh['growth.observe'] })[0]!)
    const record = view.getByRole('button', { name: zh['growth.record'] })
    fireEvent.click(record)
    expect(actions.onObserveExperiment).not.toHaveBeenCalled()
    fireEvent.change(view.getByLabelText(zh['growth.observation']), { target: { value: '  I stayed present  ' } })
    fireEvent.click(view.getByRole('button', { name: zh['growth.record'] }))
    await waitFor(() => { expect(actions.onObserveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'trying' }),
      'I stayed present',
      expect.objectContaining({ localDate: '2026-08-19' }),
    ) })
    fireEvent.click(view.getAllByRole('button', { name: zh['growth.stop'] })[0]!)
    await waitFor(() => { expect(actions.onStopExperiment).toHaveBeenCalled() })
  })

  it('shows empty, loading failure, and mutation failures', async () => {
    const empty = props({ onListExperiments: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })) })
    const emptyView = render(<GrowthSpace {...empty} />)
    expect(await emptyView.findByText(zh['growth.empty'])).toBeTruthy()
    emptyView.unmount()

    const failedLoad = props({ onListExperiments: vi.fn(() => Promise.resolve({ ok: false as const, code: 'offline' })) })
    const loadView = render(<GrowthSpace {...failedLoad} />)
    expect(await loadView.findByRole('alert')).toBeTruthy()
    loadView.unmount()

    const failure = { ok: false as const, code: 'offline' }
    const failed = props({
      onCreateExperiment: vi.fn(() => Promise.resolve(failure)),
      onStartExperiment: vi.fn(() => Promise.resolve(failure)),
      onObserveExperiment: vi.fn(() => Promise.resolve(failure)),
      onStopExperiment: vi.fn(() => Promise.resolve(failure)),
    })
    const view = render(<GrowthSpace {...failed} />)
    await view.findByText('proposed experiment')
    fireEvent.change(view.getByLabelText(zh['growth.input.title']), { target: { value: 'Will fail' } })
    fireEvent.change(view.getByLabelText(zh['growth.input.action']), { target: { value: 'Try' } })
    fireEvent.click(view.getByRole('button', { name: zh['growth.create'] }))
    await waitFor(() => { expect(failed.onCreateExperiment).toHaveBeenCalled() })
    fireEvent.click(view.getAllByRole('button', { name: zh['growth.start'] })[0]!)
    await waitFor(() => { expect(failed.onStartExperiment).toHaveBeenCalled() })
    fireEvent.click(view.getAllByRole('button', { name: zh['growth.observe'] })[0]!)
    fireEvent.change(view.getByLabelText(zh['growth.observation']), { target: { value: 'Will fail' } })
    fireEvent.click(view.getByRole('button', { name: zh['growth.record'] }))
    await waitFor(() => { expect(failed.onObserveExperiment).toHaveBeenCalled() })
    fireEvent.click(view.getAllByRole('button', { name: zh['growth.stop'] })[0]!)
    await waitFor(() => { expect(failed.onStopExperiment).toHaveBeenCalled() })
    expect(view.getByRole('alert')).toBeTruthy()
  })

  it('ignores an obsolete experiment list', async () => {
    const deferred = Promise.withResolvers<{ ok: true; value: readonly MindGardenExperiment[] }>()
    const actions = props({ onListExperiments: () => deferred.promise })
    const view = render(<GrowthSpace {...actions} />)
    view.unmount()
    deferred.resolve({ ok: true, value: [] })
    await deferred.promise
  })
})
