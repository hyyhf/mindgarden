// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { LocaleKeysOf } from '@deepseek-ai/dsh-client-ui-slots'
import type { MindGardenSessionProjection } from '@deepseek-ai/dsh-mind-garden-core/client'
import type { MindGardenPhotoStory } from '@deepseek-ai/dsh-mind-garden-media/types'
import type { MindGardenStarCard, MindGardenStarMapOverview, MindGardenStarTrait } from '@deepseek-ai/dsh-mind-garden-star-map/types'
import type {
  MindGardenMemoryAutomationInterval,
  MindGardenMemoryAutomationPolicy,
  MindGardenMemoryExtractValue,
  MindGardenMemoryItem,
  MindGardenMemoryResolveRelationshipValue,
} from '@deepseek-ai/dsh-mind-garden-memory/types'
import type {
  MindGardenConcern,
  MindGardenConcernConversionValue,
  MindGardenCheckin,
  MindGardenContemplation,
  MindGardenExperiment,
  MindGardenJournal,
  MindGardenOpenQuestion,
  MindGardenPeriodReview,
  MindGardenPeriodReviewMaterialValue,
  MindGardenPeriodReviewSource,
  MindGardenPrinciple,
  MindGardenPrincipleProposal,
  MindGardenPrincipleStatus,
} from '@deepseek-ai/dsh-mind-garden-reflection/types'
import { MindGardenReviewCenter, MindGardenView } from '../src/client/MindGardenView.tsx'
import type { MindGardenViewActions } from '../src/client/slots.ts'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

vi.mock('../src/client/star-map/StarField.tsx', () => ({
  StarField: () => <div data-testid="star-field" />,
}))

afterEach(cleanup)

const t = (key: LocaleKeysOf<'mindGarden'>) => zh[key as MindGardenKey] ?? key
const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }

const active = (mode: 'serenity' | 'clarity' = 'serenity'): MindGardenSessionProjection => ({
  state: {
    revision: 2,
    activatedAt: 1,
    updatedAt: 2,
    mode,
    supportIntent: 'auto',
    privacy: 'durable',
    contractVersion: 1,
    modelDisclosureAccepted: true,
  },
})

function openQuestion(status: 'open' | 'resolved' | 'dismissed', source = false): MindGardenOpenQuestion {
  return {
    type: 'open-question',
    id: `question-${status}`,
    version: `version-${status}`,
    question: `${status} question`,
    status,
    source: source ? { kind: 'message', messageId: 'message-1', evidenceQuote: 'Exact evidence' } : null,
    transitions: [],
    createdStamp: stamp,
    sourceSessionId: 'session-1',
    createdAt: 1,
    updatedAt: 1,
  } as unknown as MindGardenOpenQuestion
}

function starOverview(): MindGardenStarMapOverview {
  return {
    profile: {
      version: 'profile-version', onboardingStage: 3, onboardingCompleted: true, displayName: 'Lin',
      birthMonth: null, birthDay: null, birthYear: null, birthTime: '', birthTimeKnown: false,
      birthCity: '', birthCityKnown: false, mbtiMode: 'observe', mbtiType: '', mbtiAnswers: [],
      selfWords: [], observationIntent: 'Observe.', observerTone: 'gentle', reducedMotion: false,
      permissions: { dailyReflections: false, confirmedMemories: false, openQuestions: true, periodReviews: true },
      createdAt: 1, updatedAt: 1,
    },
    traits: [],
    cards: [],
    activeCard: null,
  } as unknown as MindGardenStarMapOverview
}

function source(id = 'source-1'): MindGardenPeriodReviewSource {
  return { id, sourceType: 'journal', fingerprint: 'fingerprint', localDates: ['2026-08-19'] } as unknown as MindGardenPeriodReviewSource
}

function periodReview(status: 'proposed' | 'saved' | 'archived', stale = false): MindGardenPeriodReview {
  return {
    type: 'period-review',
    id: `review-${status}`,
    version: `review-version-${status}`,
    periodType: 'week',
    startStamp: stamp,
    endStamp: stamp,
    status,
    content: `${status} review`,
    sources: [source()],
    sourceHash: 'hash',
    stale,
    staleSources: stale ? [{ id: source().id, reason: 'changed' }] : [],
    sourceSessionId: 'session-1',
    createdAt: 1,
    updatedAt: 1,
  } as unknown as MindGardenPeriodReview
}

function concern(status: 'active' | 'completed' | 'converted' = 'active'): MindGardenConcern {
  return {
    type: 'concern',
    id: `concern-${status}`,
    version: `concern-version-${status}`,
    content: 'A private concern',
    status,
    createdStamp: stamp,
    reminder: null,
    convertedJournalId: null,
    sourceSessionId: 'session-1',
    createdAt: 1,
    updatedAt: 1,
  } as unknown as MindGardenConcern
}

function experiment(status: 'proposed' | 'trying' | 'observed' | 'revised' | 'stopped' = 'proposed'): MindGardenExperiment {
  return {
    type: 'experiment', id: `experiment-${status}`, version: `experiment-version-${status}`,
    title: 'A small experiment', hypothesis: '', action: 'Take one step', reviewStamp: null,
    status, result: '', judgment: '', sourceSessionId: 'session-1', sourceMessageId: null,
    evidenceQuote: '', observations: [], createdStamp: stamp, startedAt: null, stoppedAt: null,
    createdAt: 1, updatedAt: 1,
  } as unknown as MindGardenExperiment
}

function principle(status: MindGardenPrincipleStatus = 'trying'): MindGardenPrinciple {
  const current = {
    expression: 'Be honest with myself', formationContext: 'A real experience', userQuote: 'My words',
    supportingExperiences: [], counterexample: 'Not always', appliesTo: ['choices'], notAppliesTo: [],
    lastChallenged: '2026-08-19', status,
  }
  return {
    type: 'principle', id: 'principle-1', version: `principle-${status}`, status, current,
    versions: [{ number: 1, content: current, stamp }], createdAt: 1, updatedAt: 1,
  } as unknown as MindGardenPrinciple
}

function proposal(): MindGardenPrincipleProposal {
  return {
    type: 'principle-proposal', id: 'proposal-1', version: 'proposal-version-1', status: 'proposed',
    content: principle().current, sourceContemplationId: 'contemplation-1', sourceSessionId: 'session-1',
    targetPrincipleId: null, targetVersion: null, resultingPrincipleId: null, createdAt: 1, updatedAt: 1,
    rejectedAt: null,
  } as unknown as MindGardenPrincipleProposal
}

function reviewMaterial(withSources = true): MindGardenPeriodReviewMaterialValue {
  const categories = ['events', 'ongoing', 'changes', 'experiments', 'focus'] as const
  return {
    periodType: 'week',
    startStamp: stamp,
    endStamp: stamp,
    sources: withSources ? [source()] : [],
    items: withSources ? categories.map((category, index) => ({
      category,
      sourceId: source().id,
      localDate: '2026-08-19',
      title: `Material ${index}`,
      text: `Text ${index}`,
    })) : [],
    materialHash: 'a'.repeat(64),
  }
}

function actions(overrides: Partial<MindGardenViewActions> = {}): MindGardenViewActions {
  const photo = {} as MindGardenPhotoStory
  const checkin = {} as MindGardenCheckin
  const journal = {} as MindGardenJournal
  const memory = {} as MindGardenMemoryItem
  const starCard = {} as MindGardenStarCard
  return {
    onActivate: vi.fn(() => Promise.resolve({ ok: true as const, value: undefined })),
    onSelectMode: vi.fn(() => Promise.resolve({ ok: true as const, value: undefined })),
    onSelectSupportIntent: vi.fn(() => Promise.resolve({ ok: true as const, value: undefined })),
    onExportBackup: vi.fn(() => Promise.resolve({ ok: false as const, code: 'unused' })),
    onInspectBackup: vi.fn(() => Promise.resolve({ ok: false as const, code: 'unused' })),
    onRestoreBackup: vi.fn(() => Promise.resolve({ ok: false as const, code: 'unused' })),
    onRotateVaultKey: vi.fn(() => Promise.resolve({ ok: false as const, code: 'unused' })),
    onStarMapOverview: vi.fn(() => Promise.resolve({ ok: true as const, value: starOverview() })),
    onSaveStarRitual: vi.fn(() => Promise.resolve({ ok: true as const, value: starOverview() })),
    onCompleteStarRitual: vi.fn(() => Promise.resolve({ ok: true as const, value: starOverview() })),
    onUpdateStarProfile: vi.fn(() => Promise.resolve({ ok: true as const, value: starOverview() })),
    onUpdateStarTrait: vi.fn(() => Promise.resolve({ ok: true as const, value: {} as MindGardenStarTrait })),
    onDrawStarCard: vi.fn(() => Promise.resolve({ ok: true as const, value: starCard })),
    onCalibrateStarCard: vi.fn(() => Promise.resolve({ ok: true as const, value: starCard })),
    onFinalizeStarCard: vi.fn(() => Promise.resolve({ ok: true as const, value: starCard })),
    onContinueStarCard: vi.fn(() => Promise.resolve({ ok: true as const, value: starCard })),
    onApplyStarCardRevision: vi.fn(() => Promise.resolve({ ok: true as const, value: starCard })),
    onListMemories: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onProposeMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: memory })),
    onConfirmMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: memory })),
    onUpdateMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: memory })),
    onRejectMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: memory })),
    onResolveMemoryRelationship: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: {} as MindGardenMemoryResolveRelationshipValue,
    })),
    onListMemoryRevisions: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onExtractMemories: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: {} as MindGardenMemoryExtractValue,
    })),
    onLatestMemoryExtraction: vi.fn(() => Promise.resolve({ ok: true as const, value: null })),
    onMemoryAutomationPolicy: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: {
        enabled: false,
        minimumCompletedTurns: 3 as const,
        version: null,
        updatedAt: null,
        lastAttemptedTurn: 0,
        lastAttemptAt: null,
        lastOutcome: null,
      },
    })),
    onSetMemoryAutomationPolicy: vi.fn((
      _policy: MindGardenMemoryAutomationPolicy,
      enabled: boolean,
      minimumCompletedTurns: MindGardenMemoryAutomationInterval,
    ) => Promise.resolve({
      ok: true as const,
      value: {
        enabled,
        minimumCompletedTurns,
        version: null,
        updatedAt: null,
        lastAttemptedTurn: 0,
        lastAttemptAt: null,
        lastOutcome: null,
      },
    })),
    onDeleteMemory: vi.fn(() => Promise.resolve({ ok: true as const, value: true as const })),
    onLatestMemoryAudit: vi.fn(() => Promise.resolve({ ok: true as const, value: null })),
    onListPhotoStories: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onCreatePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: photo })),
    onReadPhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: 'data:image/png;base64,AQID' })),
    onObservePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: photo })),
    onContinuePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: photo })),
    onUpdatePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: photo })),
    onDeletePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: true as const })),
    onListConcerns: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onCreateConcern: vi.fn(() => Promise.resolve({ ok: true as const, value: concern() })),
    onUpdateConcern: vi.fn(() => Promise.resolve({ ok: true as const, value: concern() })),
    onCompleteConcern: vi.fn(() => Promise.resolve({ ok: true as const, value: concern('completed') })),
    onConvertConcern: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { concern: concern('converted'), journal: {} } as MindGardenConcernConversionValue,
    })),
    onCalendarMonth: vi.fn((month: string) => Promise.resolve({ ok: true as const, value: { month, days: [] } })),
    onCalendarDay: vi.fn((localDate: string) => Promise.resolve({
      ok: true as const,
      value: { date: localDate, events: [] },
    })),
    onCreateCheckin: vi.fn(() => Promise.resolve({ ok: true as const, value: checkin })),
    onCreateJournal: vi.fn(() => Promise.resolve({ ok: true as const, value: journal })),
    onUpdateJournal: vi.fn(() => Promise.resolve({ ok: true as const, value: journal })),
    onDeleteJournal: vi.fn(() => Promise.resolve({ ok: true as const, value: true as const })),
    onReflectionTrend: vi.fn((days: 7 | 30, endDate: string) => Promise.resolve({
      ok: true as const,
      value: { days, startDate: endDate, endDate, canPlot: false, recordedDays: 0, points: [] },
    })),
    onListExperiments: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onCreateExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiment() })),
    onStartExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiment('trying') })),
    onObserveExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiment('observed') })),
    onStopExperiment: vi.fn(() => Promise.resolve({ ok: true as const, value: experiment('stopped') })),
    onListContemplations: vi.fn(() => Promise.resolve({
      ok: true as const,
      value: [] as readonly MindGardenContemplation[],
    })),
    onListPrincipleProposals: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onListPrinciples: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onAcceptPrincipleProposal: vi.fn(() => Promise.resolve({ ok: true as const, value: principle() })),
    onRejectPrincipleProposal: vi.fn(() => Promise.resolve({ ok: true as const, value: proposal() })),
    onRevisePrincipleStatus: vi.fn((_principle, status: MindGardenPrincipleStatus) => Promise.resolve({
      ok: true as const,
      value: principle(status),
    })),
    onListOpenQuestions: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onCreateOpenQuestion: vi.fn((_question, _stamp) => Promise.resolve({
      ok: true as const,
      value: openQuestion('open'),
    })),
    onUpdateOpenQuestion: vi.fn((question: MindGardenOpenQuestion) => Promise.resolve({ ok: true as const, value: question })),
    onPeriodReviewMaterial: vi.fn(() => Promise.resolve({ ok: true as const, value: reviewMaterial() })),
    onCreatePeriodReview: vi.fn((_material, _content) => Promise.resolve({ ok: true as const, value: periodReview('proposed') })),
    onListPeriodReviews: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onUpdatePeriodReview: vi.fn((review: MindGardenPeriodReview) => Promise.resolve({ ok: true as const, value: review })),
    ...overrides,
  }
}

describe('Mind Garden full view', () => {
  it('renders loading and inactive gateway states and adapts the session projection', () => {
    const props = actions()
    const loading = render(<MindGardenReviewCenter projection={undefined} {...props} t={t} />)
    expect(loading.getByText(zh['review.loading'])).toBeTruthy()
    loading.rerender(<MindGardenReviewCenter projection={null} {...props} t={t} />)
    expect(loading.getByText(zh['review.inactive.title'])).toBeTruthy()
    expect(loading.getByRole('button', { name: zh['entry.open'] })).toBeTruthy()

    const useProjection = vi.fn(() => active())
    const useStore = vi.fn((selector: (state: { activeSpace: 'today'; sidebarCollapsed: false }) => unknown) => selector({
      activeSpace: 'today',
      sidebarCollapsed: false,
    }))
    const storeActions = { selectSpace: vi.fn(), toggleSidebar: vi.fn() }
    const viewProps = {
      useProjection,
      useStore,
      actions: storeActions,
      inputActions: { setDraft: vi.fn() },
      ...props,
      t,
    } as unknown as Parameters<typeof MindGardenView>[0]
    loading.rerender(<MindGardenView {...viewProps} />)
    expect(useProjection).toHaveBeenCalledWith('mind-garden')
    expect(useStore).toHaveBeenCalledOnce()
  })

  it('runs the complete question and period-review workflow', async () => {
    const questions = [openQuestion('open', true), openQuestion('resolved'), openQuestion('dismissed')]
    const reviews = [periodReview('proposed'), periodReview('saved', true), periodReview('archived')]
    const props = actions({
      onListOpenQuestions: vi.fn(() => Promise.resolve({ ok: true as const, value: questions })),
      onListPeriodReviews: vi.fn(() => Promise.resolve({ ok: true as const, value: reviews })),
    })
    const view = render(<MindGardenReviewCenter projection={active('clarity')} {...props} t={t} />)
    expect(await view.findAllByText('open question')).not.toHaveLength(0)
    expect(view.getByText('Exact evidence')).toBeTruthy()
    expect(view.getByText(zh['question.status.resolved'])).toBeTruthy()
    expect(view.getAllByText(zh['question.status.dismissed'])).toHaveLength(2)
    expect(view.getByText(zh['review.stale'])).toBeTruthy()
    expect(view.getByText(zh['mode.clarity'])).toBeTruthy()

    fireEvent.change(view.getByLabelText(zh['question.input.label']), { target: { value: '  A new question?  ' } })
    fireEvent.change(view.getByLabelText(new RegExp(zh['question.date'])), { target: { value: '2026-08-20' } })
    fireEvent.click(view.getByRole('button', { name: zh['question.add'] }))
    await waitFor(() => { expect(props.onCreateOpenQuestion).toHaveBeenCalledWith('A new question?', expect.objectContaining({ localDate: '2026-08-20' })) })
    expect((view.getByLabelText(zh['question.input.label']) as HTMLTextAreaElement).value).toBe('')

    fireEvent.click(view.getByRole('button', { name: zh['question.resolve'] }))
    await waitFor(() => { expect(props.onUpdateOpenQuestion).toHaveBeenCalledWith(questions[0], questions[0]?.question, 'resolved', expect.anything()) })
    fireEvent.click(view.getByRole('button', { name: zh['question.dismiss'] }))
    await waitFor(() => { expect(props.onUpdateOpenQuestion).toHaveBeenCalledWith(questions[0], questions[0]?.question, 'dismissed', expect.anything()) })
    fireEvent.click(view.getAllByRole('button', { name: zh['question.reopen'] })[0]!)
    await waitFor(() => { expect(props.onUpdateOpenQuestion).toHaveBeenCalledWith(questions[1], questions[1]?.question, 'open', expect.anything()) })

    fireEvent.change(view.getByLabelText(zh['review.period.type']), { target: { value: 'month' } })
    fireEvent.change(view.getByLabelText(zh['review.period.type']), { target: { value: 'year' } })
    fireEvent.change(view.getByLabelText(zh['review.period.type']), { target: { value: 'week' } })
    fireEvent.change(view.getByLabelText(zh['review.period.start']), { target: { value: '2026-08-01' } })
    fireEvent.change(view.getByLabelText(zh['review.period.end']), { target: { value: '2026-08-19' } })
    fireEvent.click(view.getByRole('button', { name: zh['review.period.load'] }))
    await view.findByText('Material 4')
    expect(view.getByText(zh['review.category.events'])).toBeTruthy()
    expect(view.getByText(zh['review.notice.materialReady'])).toBeTruthy()

    fireEvent.change(view.getByLabelText(zh['review.editor.label']), { target: { value: '  My connected review  ' } })
    fireEvent.click(view.getByRole('button', { name: zh['review.create'] }))
    await waitFor(() => { expect(props.onCreatePeriodReview).toHaveBeenCalledWith(expect.anything(), 'My connected review') })

    fireEvent.click(view.getByRole('button', { name: zh['review.save'] }))
    await waitFor(() => { expect(props.onUpdatePeriodReview).toHaveBeenCalledWith(reviews[0], reviews[0]?.content, 'saved') })
    fireEvent.click(view.getByRole('button', { name: zh['review.archive'] }))
    await waitFor(() => { expect(props.onUpdatePeriodReview).toHaveBeenCalledWith(reviews[1], reviews[1]?.content, 'archived') })
  })

  it('shows empty states, guards empty forms, and handles an empty material range', async () => {
    const props = actions({
      onPeriodReviewMaterial: vi.fn(() => Promise.resolve({ ok: true as const, value: reviewMaterial(false) })),
    })
    const view = render(<MindGardenReviewCenter projection={active()} {...props} t={t} />)
    await view.findByText(zh['question.empty.title'])
    fireEvent.click(view.getByRole('button', { name: zh['space.memory'] }))
    fireEvent.click(view.getByRole('button', { name: zh['space.collapse'] }))
    expect(view.getByText(zh['review.empty.title'])).toBeTruthy()
    const questionForm = view.getByLabelText(zh['question.input.label']).closest('form')
    if (questionForm === null) throw new Error('question form missing')
    fireEvent.submit(questionForm)
    expect(props.onCreateOpenQuestion).not.toHaveBeenCalled()

    const start = view.getByLabelText(zh['review.period.start'])
    const end = view.getByLabelText(zh['review.period.end'])
    fireEvent.change(start, { target: { value: '' } })
    expect((view.getByRole('button', { name: zh['review.period.load'] }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(start, { target: { value: '2026-08-20' } })
    fireEvent.change(end, { target: { value: '2026-08-19' } })
    expect((view.getByRole('button', { name: zh['review.period.load'] }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(start, { target: { value: '2026-08-01' } })
    fireEvent.click(view.getByRole('button', { name: zh['review.period.load'] }))
    await view.findByText(zh['review.material.empty.title'])
    expect((view.getByRole('button', { name: zh['review.create'] }) as HTMLButtonElement).disabled).toBe(true)
    const reviewForm = view.getByLabelText(zh['review.editor.label']).closest('form')
    if (reviewForm === null) throw new Error('review form missing')
    fireEvent.submit(reviewForm)
    expect(props.onCreatePeriodReview).not.toHaveBeenCalled()
  })

  it('recovers stale mutations and reports ordinary and thrown failures', async () => {
    const item = openQuestion('open')
    const create = vi.fn()
      .mockResolvedValueOnce({ ok: false, code: 'ordinary-failure' })
      .mockRejectedValueOnce(new Error('offline'))
    const update = vi.fn(() => Promise.resolve({ ok: false as const, code: 'open-question-version-conflict' }))
    const listReviews = vi.fn()
      .mockResolvedValueOnce(successReviews())
      .mockResolvedValueOnce(successReviews())
      .mockResolvedValueOnce({ ok: false as const, code: 'offline' })
    const props = actions({
      onListOpenQuestions: vi.fn(() => Promise.resolve({ ok: true as const, value: [item] })),
      onListPeriodReviews: listReviews,
      onCreateOpenQuestion: create,
      onUpdateOpenQuestion: update,
    })
    const view = render(<MindGardenReviewCenter projection={active()} {...props} t={t} />)
    expect(await view.findAllByText(item.question)).not.toHaveLength(0)
    const input = view.getByLabelText(zh['question.input.label'])
    fireEvent.change(input, { target: { value: 'Will fail' } })
    fireEvent.click(view.getByRole('button', { name: zh['question.add'] }))
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.generic'])
    fireEvent.click(view.getByRole('button', { name: zh['question.add'] }))
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.generic'])
    fireEvent.click(view.getByRole('button', { name: zh['question.resolve'] }))
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.conflict'])
    expect(props.onListOpenQuestions).toHaveBeenCalledTimes(2)
    fireEvent.click(view.getByRole('button', { name: zh['question.resolve'] }))
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.generic'])
    expect(props.onListOpenQuestions).toHaveBeenCalledTimes(3)
  })

  it('maps load and material failures and lets the user retry', async () => {
    const listQuestions = vi.fn()
      .mockResolvedValueOnce({ ok: false, code: 'period-review-version-conflict' })
      .mockResolvedValue({ ok: true, value: [] })
    const listReviews = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: [] })
      .mockResolvedValueOnce({ ok: false, code: 'unknown' })
      .mockResolvedValue({ ok: true, value: [] })
    const material = vi.fn()
      .mockResolvedValueOnce({ ok: false, code: 'period-review-source-required' })
      .mockResolvedValueOnce({ ok: false, code: 'period-review-material-conflict' })
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ ok: true, value: reviewMaterial() })
    const props = actions({
      onListOpenQuestions: listQuestions,
      onListPeriodReviews: listReviews,
      onPeriodReviewMaterial: material,
      onCreatePeriodReview: vi.fn(() => Promise.resolve({ ok: false as const, code: 'ordinary-failure' })),
    })
    const view = render(<MindGardenReviewCenter projection={active()} {...props} t={t} />)
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.conflict'])
    fireEvent.click(view.getByRole('button', { name: zh['review.retry'] }))
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.generic'])
    fireEvent.click(view.getByRole('button', { name: zh['review.retry'] }))
    await view.findByText(zh['question.empty.title'])
    const load = view.getByRole('button', { name: zh['review.period.load'] })
    fireEvent.click(load)
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.noMaterial'])
    fireEvent.click(load)
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.materialChanged'])
    fireEvent.click(load)
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.generic'])
    fireEvent.click(load)
    await view.findByText('Material 0')
    fireEvent.change(view.getByLabelText(zh['review.editor.label']), { target: { value: 'Will not save' } })
    fireEvent.click(view.getByRole('button', { name: zh['review.create'] }))
    expect((await view.findByRole('alert')).textContent).toContain(zh['review.error.generic'])
  })

  it('ignores an obsolete load after the view unmounts', async () => {
    const deferredQuestions = Promise.withResolvers<ReturnType<typeof successQuestions>>()
    const deferredReviews = Promise.withResolvers<ReturnType<typeof successReviews>>()
    const props = actions({
      onListOpenQuestions: () => deferredQuestions.promise,
      onListPeriodReviews: () => deferredReviews.promise,
    })
    const view = render(<MindGardenReviewCenter projection={active()} {...props} t={t} />)
    view.unmount()
    deferredQuestions.resolve(successQuestions())
    deferredReviews.resolve(successReviews())
    await Promise.all([deferredQuestions.promise, deferredReviews.promise])
  })

  it('returns from the constellation through the persisted space action', async () => {
    const onSelectSpace = vi.fn()
    const props = actions({
      onListOpenQuestions: vi.fn(() => Promise.resolve({ ok: true as const, value: [openQuestion('open')] })),
      onListPeriodReviews: vi.fn(() => Promise.resolve({ ok: true as const, value: [periodReview('saved')] })),
    })
    const view = render(
      <MindGardenReviewCenter
        projection={active()}
        activeSpace="star-map"
        onSelectSpace={onSelectSpace}
        {...props}
        t={t}
      />,
    )
    await view.findByTestId('star-field')
    fireEvent.click(await view.findByRole('button', { name: zh['star.back'] }))
    expect(onSelectSpace).toHaveBeenCalledWith('today')
  })

  it('routes dedicated reflection spaces through the full view slot', async () => {
    const viewActions = actions()
    const view = render(
      <MindGardenReviewCenter projection={active()} activeSpace="concerns" {...viewActions} t={t} />,
    )
    expect(view.container.querySelector('[data-mind-garden-space="concerns"]')).toBeTruthy()
    await view.findByText(zh['concern.empty'])
    view.rerender(
      <MindGardenReviewCenter projection={active()} activeSpace="calendar" {...viewActions} t={t} />,
    )
    expect(view.container.querySelector('[data-mind-garden-space="calendar"]')).toBeTruthy()
    await view.findByText(zh['calendar.emptyDay'])
    view.rerender(
      <MindGardenReviewCenter projection={active()} activeSpace="growth" {...viewActions} t={t} />,
    )
    expect(view.container.querySelector('[data-mind-garden-space="growth"]')).toBeTruthy()
    await view.findByText(zh['growth.empty'])
    view.rerender(
      <MindGardenReviewCenter projection={active()} activeSpace="philosophy" {...viewActions} t={t} />,
    )
    expect(view.container.querySelector('[data-mind-garden-space="philosophy"]')).toBeTruthy()
    await view.findByText(zh['philosophy.emptyPrinciples'])
    view.rerender(
      <MindGardenReviewCenter projection={active()} activeSpace="memory" {...viewActions} t={t} />,
    )
    await view.findByText(zh['memory.title'])
    expect(view.getByText(zh['question.empty.title'])).toBeTruthy()
    expect(view.queryByText(zh['review.empty.title'])).toBeNull()
    view.rerender(
      <MindGardenReviewCenter projection={active()} activeSpace="life" {...viewActions} t={t} />,
    )
    await view.findByText(zh['life.title'])
    expect(view.getByText(zh['review.empty.title'])).toBeTruthy()
    expect(view.queryByText(zh['question.empty.title'])).toBeNull()
    view.rerender(
      <MindGardenReviewCenter projection={active()} activeSpace="photo-story" {...viewActions} t={t} />,
    )
    expect(view.container.querySelector('[data-mind-garden-space="photo-story"]')).toBeTruthy()
    await view.findByText(zh['photo.empty.title'])
  })

  it('returns a life review to the resident Harness composer without sending it', async () => {
    const onDraftConversation = vi.fn()
    const viewActions = actions({
      onListPeriodReviews: vi.fn(() => Promise.resolve({
        ok: true as const,
        value: [periodReview('saved')],
      })),
    })
    const view = render(
      <MindGardenReviewCenter
        projection={active()}
        activeSpace="life"
        onDraftConversation={onDraftConversation}
        {...viewActions}
        t={t}
      />,
    )
    await view.findByText('saved review')
    fireEvent.click(view.getByRole('button', { name: zh['life.continue'] }))
    expect(onDraftConversation).toHaveBeenCalledWith(expect.stringContaining('saved review'))
    expect(view.getByRole('status').textContent).toContain(zh['life.notice.drafted'])
  })
})

function successQuestions() {
  return { ok: true as const, value: [] as readonly MindGardenOpenQuestion[] }
}

function successReviews() {
  return { ok: true as const, value: [] as readonly MindGardenPeriodReview[] }
}
