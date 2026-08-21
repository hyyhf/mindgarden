// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden-reflection/types'
import type {
  MindGardenCompleteStarRitualRequest,
  MindGardenSaveStarRitualRequest,
  MindGardenStarMapOverview,
} from '@deepseek-ai/dsh-mind-garden-star-map/types'
import { StarMapSpace } from '../src/client/star-map/StarMapSpace.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

vi.mock('../src/client/star-map/StarField.tsx', () => ({
  StarField: ({ fallback }: { readonly fallback: string }) => <div data-testid="star-field">{fallback}</div>,
}))

afterEach(cleanup)

const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }
const t = (key: MindGardenKey) => zh[key]

function question(): MindGardenOpenQuestion {
  return {
    id: 'question-1',
    question: '什么值得我继续留意？',
    status: 'open',
    source: null,
    createdStamp: stamp,
  } as unknown as MindGardenOpenQuestion
}

function review(): MindGardenPeriodReview {
  return {
    id: 'review-1',
    status: 'saved',
    content: '我开始看见一条新的路',
    startStamp: stamp,
    endStamp: stamp,
    sources: [],
  } as unknown as MindGardenPeriodReview
}

function overview(): MindGardenStarMapOverview {
  return {
    profile: {
      version: 'profile-version', onboardingStage: 3, onboardingCompleted: true, displayName: '',
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

function actions(value = overview()) {
  return {
    onOverview: vi.fn(() => Promise.resolve({ ok: true as const, value })),
    onSaveRitual: vi.fn(),
    onCompleteRitual: vi.fn(),
    onUpdateProfile: vi.fn(),
    onUpdateTrait: vi.fn(),
    onDrawCard: vi.fn(),
    onCalibrateCard: vi.fn(),
    onFinalizeCard: vi.fn(),
    onContinueCard: vi.fn(),
    onApplyCardRevision: vi.fn(),
  }
}

function ritualOverview(stage: 0 | 1 | 2): MindGardenStarMapOverview {
  const complete = overview()
  return {
    profile: {
      ...complete.profile,
      version: stage === 0 ? null : `profile-${stage}`,
      onboardingStage: stage,
      onboardingCompleted: false,
      displayName: stage === 0 ? '' : 'Lin',
      selfWords: [],
      observationIntent: '',
      permissions: { dailyReflections: false, confirmedMemories: false, openQuestions: false, periodReviews: false },
    },
    traits: [],
    cards: [],
    activeCard: null,
  } as unknown as MindGardenStarMapOverview
}

describe('StarMapSpace', () => {
  it('renders live metrics, selects an accessible node, and returns to today', async () => {
    const onBack = vi.fn()
    const remoteActions = actions()
    const view = render(
      <StarMapSpace questions={[question()]} reviews={[review()]} mode="serenity" t={t} onBack={onBack} {...remoteActions} />,
    )

    expect((await view.findByTestId('star-field')).textContent).toBe(zh['star.fallback'])
    expect(view.getByLabelText(zh['star.metrics']).textContent).toContain('1')
    expect(view.getByText('正在以观心姿态靠近自己')).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: '什么值得我继续留意？' }))
    expect(view.getByRole('heading', { level: 2 }).textContent).toBe('什么值得我继续留意？')
    expect(view.getByRole('button', { name: '什么值得我继续留意？' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(view.getByRole('button', { name: zh['star.back'] }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('falls back to the center when a selected record leaves the model', async () => {
    const remoteActions = actions()
    const view = render(
      <StarMapSpace questions={[question()]} reviews={[]} mode="clarity" t={t} onBack={vi.fn()} {...remoteActions} />,
    )
    fireEvent.click(await view.findByRole('button', { name: '什么值得我继续留意？' }))
    view.rerender(<StarMapSpace questions={[]} reviews={[]} mode="clarity" t={t} onBack={vi.fn()} {...remoteActions} />)
    expect(view.getByRole('heading', { level: 2 }).textContent).toBe(zh['star.center'])
    expect(view.getByText(zh['star.center.clarity'])).toBeTruthy()
  })

  it('resumes each encrypted ritual checkpoint and completes with user-authored words', async () => {
    let current = ritualOverview(0)
    const onOverview = vi.fn(() => Promise.resolve({ ok: true as const, value: current }))
    const onSaveRitual = vi.fn((request: MindGardenSaveStarRitualRequest) => {
      current = {
        ...ritualOverview(request.onboardingStage),
        profile: { ...ritualOverview(request.onboardingStage).profile, displayName: request.displayName },
      }
      return Promise.resolve({ ok: true as const, value: current })
    })
    const onCompleteRitual = vi.fn((request: MindGardenCompleteStarRitualRequest) => {
      const value = overview()
      current = {
        ...value,
        profile: { ...value.profile, displayName: request.displayName, selfWords: request.selfWords },
      }
      return Promise.resolve({ ok: true as const, value: current })
    })
    const view = render(<StarMapSpace
      questions={[]}
      reviews={[]}
      mode="serenity"
      t={t}
      onBack={vi.fn()}
      onOverview={onOverview}
      onSaveRitual={onSaveRitual}
      onCompleteRitual={onCompleteRitual}
      onUpdateProfile={vi.fn()}
      onUpdateTrait={vi.fn()}
      onDrawCard={vi.fn()}
      onCalibrateCard={vi.fn()}
      onFinalizeCard={vi.fn()}
      onContinueCard={vi.fn()}
      onApplyCardRevision={vi.fn()}
    />)

    fireEvent.change(await view.findByLabelText(zh['star.ritual.displayName']), { target: { value: 'Lin' } })
    fireEvent.click(view.getByRole('button', { name: zh['star.ritual.next'] }))
    await view.findByText(zh['star.ritual.self.title'])
    fireEvent.click(view.getByRole('button', { name: zh['star.ritual.next'] }))
    await view.findByText(zh['star.ritual.consent.title'])
    fireEvent.change(view.getByLabelText(zh['star.ritual.words']), { target: { value: '好奇，愿意修正' } })
    fireEvent.change(view.getByLabelText(zh['star.ritual.intent']), { target: { value: '我什么时候最像自己？' } })
    fireEvent.click(view.getByRole('button', { name: zh['star.ritual.complete'] }))
    await waitFor(() => { expect(onCompleteRitual).toHaveBeenCalledOnce() })
    expect(onSaveRitual).toHaveBeenCalledTimes(2)
    expect(onCompleteRitual.mock.calls[0]?.[0]).toMatchObject({
      displayName: 'Lin',
      selfWords: ['好奇', '愿意修正'],
      observationIntent: '我什么时候最像自己？',
    })
    expect(await view.findByTestId('star-field')).toBeTruthy()
  })
})
