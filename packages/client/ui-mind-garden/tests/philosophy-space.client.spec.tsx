// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type {
  MindGardenContemplation,
  MindGardenPrinciple,
  MindGardenPrincipleProposal,
  MindGardenPrincipleProposalStatus,
  MindGardenPrincipleStatus,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { PhilosophySpace } from '../src/client/spaces/PhilosophySpace.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]
const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }

function contemplation(status: 'draft' | 'confirmed'): MindGardenContemplation {
  return {
    type: 'contemplation', id: `contemplation-${status}`, version: `version-${status}`,
    markdown: `${status} contemplation`, status, sourceSessionId: 'session-1', createdAt: 1,
    updatedAt: Date.UTC(2026, 7, 19), confirmedAt: status === 'confirmed' ? 2 : null,
  } as unknown as MindGardenContemplation
}

function content(status: MindGardenPrincipleStatus) {
  return {
    expression: `${status} principle`, formationContext: 'Formed through experience', userQuote: 'My exact words',
    supportingExperiences: [], counterexample: 'A meaningful boundary', appliesTo: ['work', 'relationships'],
    notAppliesTo: [], lastChallenged: '2026-08-19', status,
  }
}

function proposal(status: MindGardenPrincipleProposalStatus): MindGardenPrincipleProposal {
  return {
    type: 'principle-proposal', id: `proposal-${status}`, version: `version-${status}`, status,
    targetPrincipleId: null, targetVersion: null, content: content('trying'),
    sourceContemplationId: 'contemplation-confirmed', sourceSessionId: 'session-1', resultingPrincipleId: null,
    createdAt: 1, updatedAt: 1, rejectedAt: status === 'rejected' ? 2 : null,
  } as unknown as MindGardenPrincipleProposal
}

function principle(status: MindGardenPrincipleStatus): MindGardenPrinciple {
  const current = content(status)
  return {
    type: 'principle', id: `principle-${status}`, version: `principle-version-${status}`, status, current,
    versions: [{ number: 1, content: current, stamp }], createdAt: 1, updatedAt: 1,
  } as unknown as MindGardenPrinciple
}

function props(overrides: Record<string, unknown> = {}) {
  return {
    today: '2026-08-19',
    t,
    onListContemplations: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: [contemplation('draft'), contemplation('confirmed')],
    })),
    onListPrincipleProposals: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: [proposal('proposed'), proposal('accepted'), proposal('rejected')],
    })),
    onListPrinciples: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: ['trying', 'adopted', 'questioning', 'retired'].map(status => principle(status as MindGardenPrincipleStatus)),
    })),
    onAcceptPrincipleProposal: vi.fn(() => Promise.resolve({ ok: true as const, value: principle('adopted') })),
    onRejectPrincipleProposal: vi.fn(() => Promise.resolve({ ok: true as const, value: proposal('rejected') })),
    onRevisePrincipleStatus: vi.fn(() => Promise.resolve({ ok: true as const, value: principle('questioning') })),
    onDraftConversation: vi.fn(),
    ...overrides,
  }
}

describe('PhilosophySpace', () => {
  it('keeps contemplations, proposals, and user-owned principles visibly distinct', async () => {
    const actions = props()
    const view = render(<PhilosophySpace {...actions} />)
    await view.findByText('draft contemplation')
    expect(view.getByText('confirmed contemplation')).toBeTruthy()
    expect(view.getAllByText('trying principle').length).toBeGreaterThan(1)
    expect(view.getAllByText('Formed through experience')).toHaveLength(7)
    expect(view.getAllByText('My exact words')).toHaveLength(7)
    expect(view.getAllByText('A meaningful boundary')).toHaveLength(7)
    expect(view.getAllByText(/work|relationships/)).toHaveLength(8)

    const continueButtons = view.getAllByRole('button', { name: zh['philosophy.continue'] })
    expect(continueButtons).toHaveLength(5)
    fireEvent.click(continueButtons[0]!)
    expect(actions.onDraftConversation).toHaveBeenCalledWith(expect.stringContaining('confirmed contemplation'))
    fireEvent.click(continueButtons[1]!)
    expect(actions.onDraftConversation).toHaveBeenCalledWith(expect.stringContaining('trying principle'))
    expect(view.getByRole('status').textContent).toContain(zh['philosophy.notice.drafted'])

    fireEvent.click(view.getAllByText(zh['philosophy.versionCount'].replace('{count}', '1'))[0]!)
    expect(view.getAllByText('2026-08-19')).toHaveLength(4)

    fireEvent.click(view.getByRole('button', { name: zh['philosophy.accept'] }))
    await waitFor(() => { expect(actions.onAcceptPrincipleProposal).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'proposed' }),
      expect.objectContaining({ localDate: '2026-08-19' }),
    ) })
    fireEvent.click(view.getByRole('button', { name: zh['philosophy.reject'] }))
    await waitFor(() => { expect(actions.onRejectPrincipleProposal).toHaveBeenCalled() })
    fireEvent.change(view.getByLabelText(/trying principle/), { target: { value: 'questioning' } })
    await waitFor(() => { expect(actions.onRevisePrincipleStatus).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'trying' }),
      'questioning',
      expect.objectContaining({ localDate: '2026-08-19' }),
    ) })
  })

  it('shows all empty states', async () => {
    const empty = props({
      onListContemplations: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
      onListPrincipleProposals: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
      onListPrinciples: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    })
    const view = render(<PhilosophySpace {...empty} />)
    expect(await view.findByText(zh['philosophy.emptyContemplations'])).toBeTruthy()
    expect(view.getByText(zh['philosophy.emptyProposals'])).toBeTruthy()
    expect(view.getByText(zh['philosophy.emptyPrinciples'])).toBeTruthy()
  })

  it('reports each list boundary and failed decisions', async () => {
    const failure = { ok: false as const, code: 'offline' }
    const cases = [
      { onListContemplations: vi.fn(() => Promise.resolve(failure)) },
      { onListPrincipleProposals: vi.fn(() => Promise.resolve(failure)) },
      { onListPrinciples: vi.fn(() => Promise.resolve(failure)) },
    ]
    for (const override of cases) {
      const view = render(<PhilosophySpace {...props(override)} />)
      expect(await view.findByRole('alert')).toBeTruthy()
      view.unmount()
    }

    const failed = props({
      onAcceptPrincipleProposal: vi.fn(() => Promise.resolve(failure)),
      onRejectPrincipleProposal: vi.fn(() => Promise.resolve(failure)),
      onRevisePrincipleStatus: vi.fn(() => Promise.resolve(failure)),
    })
    const view = render(<PhilosophySpace {...failed} />)
    await view.findByText('draft contemplation')
    fireEvent.click(view.getByRole('button', { name: zh['philosophy.accept'] }))
    await waitFor(() => { expect(failed.onAcceptPrincipleProposal).toHaveBeenCalled() })
    fireEvent.click(view.getByRole('button', { name: zh['philosophy.reject'] }))
    await waitFor(() => { expect(failed.onRejectPrincipleProposal).toHaveBeenCalled() })
    fireEvent.change(view.getByLabelText(/trying principle/), { target: { value: 'adopted' } })
    await waitFor(() => { expect(failed.onRevisePrincipleStatus).toHaveBeenCalled() })
    expect(view.getByRole('alert')).toBeTruthy()
  })

  it('ignores an obsolete combined load', async () => {
    const deferred = Promise.withResolvers<{ ok: true; value: readonly MindGardenContemplation[] }>()
    const actions = props({ onListContemplations: () => deferred.promise })
    const view = render(<PhilosophySpace {...actions} />)
    view.unmount()
    deferred.resolve({ ok: true, value: [] })
    await deferred.promise
  })
})
