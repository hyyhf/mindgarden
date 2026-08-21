// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import type {
  MindGardenMemoryAutomationPolicy,
  MindGardenMemoryExtractValue,
  MindGardenMemoryItem,
  MindGardenMemoryRevision,
} from '@deepseek-ai/dsh-mind-garden-memory/types'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { MemoryGovernance } from '../src/client/spaces/MemoryGovernance.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]

function memory(
  id: string,
  content: string,
  status: MindGardenMemoryItem['status'] = 'candidate',
): MindGardenMemoryItem {
  return {
    id,
    version: `${id}-version`,
    status,
    kind: 'support-preference',
    sensitivity: 'normal',
    content,
    reason: 'This can make future support more accurate.',
    scope: 'When work feels heavy',
    recallPolicy: status === 'candidate' ? 'never' : 'relevant',
    sources: [{ sessionId: 'session-1', evidenceQuote: content }],
    proposalOrigin: 'human',
    revisionCount: status === 'candidate' ? 0 : 1,
    createdAt: 1,
    updatedAt: 2,
    ...(status === 'confirmed' ? { confirmedAt: 2 } : {}),
  } as unknown as MindGardenMemoryItem
}

function fixtures() {
  const existing = memory('memory-existing', 'Please listen before offering a plan.', 'confirmed')
  const candidate = memory('memory-candidate', 'I prefer one question at a time.')
  const related = {
    ...memory('memory-related', 'Offer a practical step before reflecting.'),
    relationship: {
      type: 'contradiction' as const,
      targetMemoryId: existing.id,
      targetVersion: existing.version,
      rationale: 'The preferred support order differs.',
      status: 'pending' as const,
    },
  } as MindGardenMemoryItem
  const revision = {
    id: 'revision-1', action: 'confirmed', status: 'candidate', kind: existing.kind,
    sensitivity: 'normal', content: 'Listen first.', reason: existing.reason,
    recallPolicy: 'never', sources: existing.sources, createdAt: 1,
  } as unknown as MindGardenMemoryRevision
  return { existing, candidate, related, revision }
}

function props(overrides: Record<string, unknown> = {}) {
  const data = fixtures()
  const automation = {
    enabled: false,
    minimumCompletedTurns: 3,
    version: 'automation-version-1',
    updatedAt: 1,
    lastAttemptedTurn: 0,
    lastAttemptAt: null,
    lastOutcome: null,
  } as unknown as MindGardenMemoryAutomationPolicy
  const extraction = {
    run: {
      id: 'run-1', trigger: 'manual', status: 'completed', provider: 'review', model: 'memory-reviewer',
      sourceMessageIds: [], comparedMemoryIds: [], candidateIds: [data.candidate.id], createdAt: 1, updatedAt: 2,
    },
    candidates: [data.candidate],
  } as unknown as MindGardenMemoryExtractValue
  return {
    t,
    onListMemories: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: [data.existing, data.candidate, data.related],
    })),
    onProposeMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: data.candidate })),
    onConfirmMemory: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { ...data.candidate, status: 'confirmed' as const },
    })),
    onUpdateMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: data.existing })),
    onRejectMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: data.candidate })),
    onResolveMemoryRelationship: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { candidate: data.related, activeMemory: data.related },
    })),
    onListMemoryRevisions: vi.fn(() => Promise.resolve({ ok: true as const, value: [data.revision] })),
    onExtractMemories: vi.fn(() => Promise.resolve({ ok: true as const, value: extraction })),
    onLatestMemoryExtraction: vi.fn(() => Promise.resolve({ ok: true as const, value: extraction.run })),
    onMemoryAutomationPolicy: vi.fn(() => Promise.resolve({ ok: true as const, value: automation })),
    onSetMemoryAutomationPolicy: vi.fn(() => Promise.resolve({ ok: true as const, value: automation })),
    onDeleteMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: true as const })),
    onLatestMemoryAudit: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { sessionId: 'session-1' as SessionId, createdAt: 2, sentToModel: true, matches: [
        { memoryId: data.existing.id, reason: 'relevant' as const, score: 2 },
      ] },
    })),
    onDraftConversation: vi.fn(),
    ...overrides,
  }
}

describe('MemoryGovernance', () => {
  it('proposes, confirms, and resolves governed candidates through explicit choices', async () => {
    const actions = props()
    const view = render(<MemoryGovernance {...actions} />)
    await view.findByText(fixtures().candidate.content)
    expect(view.getByText(zh['governance.audit.sent'].replace('{count}', '1'))).toBeTruthy()
    expect(view.getByText(`${zh['governance.extraction.trigger.manual']} · ${zh['governance.extraction.completed'].replace('{count}', '1')}`)).toBeTruthy()

    const proposalForm = view.getByRole('button', { name: zh['governance.propose.save'] }).closest('form')
    if (proposalForm === null) throw new Error('proposal form missing')
    fireEvent.change(within(proposalForm).getByLabelText(zh['governance.content']), {
      target: { value: '  I need quiet after intense meetings.  ' },
    })
    fireEvent.change(within(proposalForm).getByLabelText(zh['governance.reason']), {
      target: { value: '  Avoid adding pressure.  ' },
    })
    fireEvent.change(within(proposalForm).getByLabelText(zh['governance.scope']), {
      target: { value: '  After work  ' },
    })
    fireEvent.click(view.getByRole('button', { name: zh['governance.propose.save'] }))
    await waitFor(() => { expect(actions.onProposeMemory).toHaveBeenCalledWith({
      kind: 'fact',
      sensitivity: 'normal',
      content: 'I need quiet after intense meetings.',
      reason: 'Avoid adding pressure.',
      scope: 'After work',
    }) })

    const candidateCard = view.getByText(fixtures().candidate.content).closest('article')
    if (candidateCard === null) throw new Error('candidate card missing')
    fireEvent.click(within(candidateCard).getByRole('button', { name: zh['governance.review.open'] }))
    fireEvent.change(within(candidateCard).getByLabelText(zh['governance.temporary']), { target: { value: '30' } })
    fireEvent.click(within(candidateCard).getByRole('button', { name: zh['governance.confirm'] }))
    await waitFor(() => { expect(actions.onConfirmMemory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'memory-candidate' }),
      expect.objectContaining({ recallPolicy: 'relevant', temporaryDays: 30 }),
    ) })

    const relatedCard = view.getAllByText(fixtures().related.content)[0]?.closest('article')
    if (!relatedCard) throw new Error('relationship card missing')
    fireEvent.click(within(relatedCard).getByRole('button', { name: zh['governance.review.open'] }))
    fireEvent.change(within(relatedCard).getByLabelText(zh['governance.scope']), {
      target: { value: 'Different moments' },
    })
    fireEvent.click(within(relatedCard).getByRole('button', { name: zh['governance.relationship.keepBoth'] }))
    await waitFor(() => { expect(actions.onResolveMemoryRelationship).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'memory-related' }),
      { resolution: 'keep-both', recallPolicy: 'relevant', scope: 'Different moments' },
    ) })
  })

  it('discloses and stores per-Session automatic-review authorization', async () => {
    const actions = props()
    const view = render(<MemoryGovernance {...actions} />)
    await view.findByRole('heading', { name: zh['governance.automation.title'] })
    expect(view.getByText(zh['governance.automation.disclosure.model'])).toBeTruthy()
    expect(view.getByText(zh['governance.automation.disclosure.candidates'])).toBeTruthy()
    expect(view.getByText(zh['governance.automation.disclosure.safety'])).toBeTruthy()

    fireEvent.click(view.getByRole('checkbox', { name: zh['governance.automation.disabled'] }))
    await waitFor(() => {
      expect(actions.onSetMemoryAutomationPolicy).toHaveBeenCalledWith(
        expect.objectContaining({ version: 'automation-version-1' }),
        true,
        3,
      )
    })
    await view.findByText(zh['governance.notice.automationEnabled'])
    fireEvent.change(view.getByLabelText(zh['governance.automation.interval']), { target: { value: '5' } })
    await waitFor(() => {
      expect(actions.onSetMemoryAutomationPolicy).toHaveBeenLastCalledWith(
        expect.objectContaining({ version: 'automation-version-1' }),
        false,
        5,
      )
    })
  })

  it('edits active memory, reveals immutable history, and requires two clicks to delete', async () => {
    const actions = props()
    const view = render(<MemoryGovernance {...actions} />)
    const existing = fixtures().existing
    const library = (await view.findByRole('heading', { name: zh['governance.library.title'] })).closest('section')
    if (library === null) throw new Error('active memory library missing')
    const card = within(library).getAllByText(existing.content)[0]?.closest('article')
    if (!card) throw new Error('active memory card missing')

    fireEvent.click(within(card).getByRole('button', { name: zh['governance.continue'] }))
    expect(actions.onDraftConversation).toHaveBeenCalledWith(expect.stringContaining(existing.content))
    expect(view.getByText(zh['governance.notice.drafted'])).toBeTruthy()

    fireEvent.click(within(card).getByRole('button', { name: zh['governance.history.open'] }))
    expect(await within(card).findByText('Listen first.')).toBeTruthy()
    expect(actions.onListMemoryRevisions).toHaveBeenCalledWith(expect.objectContaining({ id: existing.id }))

    fireEvent.click(within(card).getByRole('button', { name: zh['governance.edit.open'] }))
    fireEvent.change(within(card).getByLabelText(zh['governance.content']), {
      target: { value: '  Listen, then ask one question.  ' },
    })
    fireEvent.click(within(card).getByRole('button', { name: zh['governance.edit.save'] }))
    await waitFor(() => { expect(actions.onUpdateMemory).toHaveBeenCalledWith(
      expect.objectContaining({ id: existing.id }),
      expect.objectContaining({ content: 'Listen, then ask one question.', recallPolicy: 'relevant' }),
    ) })

    const remove = within(card).getByRole('button', { name: zh['governance.delete'] })
    fireEvent.click(remove)
    expect(within(card).getByRole('button', { name: zh['governance.delete.confirm'] })).toBeTruthy()
    fireEvent.click(within(card).getByRole('button', { name: zh['governance.delete.confirm'] }))
    await waitFor(() => { expect(actions.onDeleteMemory).toHaveBeenCalledWith(
      expect.objectContaining({ id: existing.id }),
    ) })
  })

  it('keeps high-sensitivity candidates local and contains load or extraction failures', async () => {
    const sensitive = {
      ...memory('memory-sensitive', 'A private health detail.'),
      sensitivity: 'high' as const,
    } as MindGardenMemoryItem
    const actions = props({
      onListMemories: vi.fn(() => Promise.resolve({ ok: true as const, value: [sensitive] })),
      onExtractMemories: vi.fn(() => Promise.resolve({ ok: false as const, code: 'extraction-model-unavailable' })),
    })
    const view = render(<MemoryGovernance {...actions} />)
    const card = (await view.findByText(sensitive.content)).closest('article')
    if (card === null) throw new Error('sensitive candidate card missing')
    fireEvent.click(within(card).getByRole('button', { name: zh['governance.review.open'] }))
    expect(within(card).getByLabelText(zh['governance.recall'])).toHaveProperty('disabled', true)
    fireEvent.click(within(card).getByRole('button', { name: zh['governance.confirm'] }))
    await waitFor(() => { expect(actions.onConfirmMemory).toHaveBeenCalledWith(
      expect.objectContaining({ id: sensitive.id }),
      expect.objectContaining({ recallPolicy: 'never' }),
    ) })
    fireEvent.click(view.getByRole('button', { name: zh['governance.extraction.run'] }))
    expect(await view.findByText(zh['governance.error.extraction'])).toBeTruthy()

    view.unmount()
    const failed = render(<MemoryGovernance {...props({
      onListMemories: vi.fn(() => Promise.reject(new Error('offline'))),
    })} />)
    expect(await failed.findByText(zh['governance.error.load'])).toBeTruthy()
  })
})
