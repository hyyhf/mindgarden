// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  MindGardenCalibrateStarCardRequest,
  MindGardenApplyStarCardRevisionRequest,
  MindGardenContinueStarCardRequest,
  MindGardenDrawStarCardRequest,
  MindGardenFinalizeStarCardRequest,
  MindGardenStarCard,
  MindGardenStarProfile,
} from '@deepseek-ai/dsh-mind-garden/star-map/types'
import { StarObserver } from '../src/client/star-map/StarObserver.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

const t = (key: MindGardenKey) => zh[key]

afterEach(cleanup)

function profile(): MindGardenStarProfile {
  return {
    version: 'profile-1', onboardingStage: 3, onboardingCompleted: true, displayName: 'Lin',
    birthMonth: null, birthDay: null, birthYear: null, birthTime: '', birthTimeKnown: false,
    birthCity: '', birthCityKnown: false, mbtiMode: 'observe', mbtiType: '', mbtiAnswers: [],
    selfWords: ['好奇'], observationIntent: '更诚实地看见自己', observerTone: 'gentle',
    permissions: { dailyReflections: true, confirmedMemories: false, openQuestions: true, periodReviews: false },
    reducedMotion: false, createdAt: 1, updatedAt: 1,
  } as unknown as MindGardenStarProfile
}

function card(overrides: Partial<MindGardenStarCard> = {}): MindGardenStarCard {
  return {
    id: 'card-1', version: 'card-version-1', status: 'draft', deck: 'inner-debate', observerTone: 'gentle',
    question: '我要怎样开始？', title: '先验证，再定义', frontText: '你可能把一个未知结果提前当成了结论。',
    analysis: {
      situation: '一个决定仍有未知。', coreIssue: '最小假设还没有被验证。',
      tradeoff: '立刻行动有速度，短暂停顿能换来证据。', guidance: '先做一个可逆的小测试。',
    },
    openQuestion: '我愿意先验证哪个最小假设？', cardKind: 'observation', traitKind: 'pattern',
    symbolicBasis: [],
    evidence: [{ id: 'evidence-1', sourceType: 'daily-reflection', sourceId: 'journal-1', summary: '今天我写下：真正开始前，我又检查了三次。' }],
    confidence: 0.72, calibration: null, traitId: null, provider: 'observer', model: 'v1',
    turns: [], quickReplies: [], pendingRevision: null,
    createdAt: 1, updatedAt: 1,
    ...overrides,
  } as unknown as MindGardenStarCard
}

describe('StarObserver', () => {
  it('draws from a chosen deck and exposes the permission boundary', async () => {
    const onDraw = vi.fn((_request: MindGardenDrawStarCardRequest) => (
      Promise.resolve({ ok: true as const, value: card() })
    ))
    const view = render(<StarObserver
      profile={profile()}
      cards={[]}
      activeCard={null}
      t={t}
      onDraw={onDraw}
      onCalibrate={vi.fn()}
      onFinalize={vi.fn()}
      onContinue={vi.fn()}
      onApplyRevision={vi.fn()}
    />)
    fireEvent.click(view.getByRole('button', { name: /抽一张心象卡/ }))
    expect(view.getAllByText(/2\/4/)).toHaveLength(2)
    fireEvent.click(view.getByRole('button', { name: zh['star.observer.deck.inner-debate'] }))
    fireEvent.change(view.getByLabelText(zh['star.observer.question']), { target: { value: '  我要怎样开始？  ' } })
    fireEvent.click(view.getByRole('button', { name: zh['star.observer.draw'] }))
    await waitFor(() => { expect(onDraw).toHaveBeenCalledOnce() })
    const request = onDraw.mock.calls[0]?.[0]
    expect(request).toMatchObject({ deck: 'inner-debate', question: '我要怎样开始？' })
    expect(request?.observedLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('renders frozen evidence and sends explicit calibration and terminal actions', async () => {
    const onCalibrate = vi.fn((_request: MindGardenCalibrateStarCardRequest) => (
      Promise.resolve({ ok: true as const, value: card() })
    ))
    const onFinalize = vi.fn((_request: MindGardenFinalizeStarCardRequest) => (
      Promise.resolve({ ok: true as const, value: card() })
    ))
    const view = render(<StarObserver
      profile={profile()}
      cards={[card()]}
      activeCard={card()}
      t={t}
      onDraw={vi.fn()}
      onCalibrate={onCalibrate}
      onFinalize={onFinalize}
      onContinue={vi.fn()}
      onApplyRevision={vi.fn()}
    />)
    expect(view.getByRole('heading', { name: '先验证，再定义' })).toBeTruthy()
    fireEvent.click(view.getByText(/查看本卡引用的原始片段/))
    expect(view.getByText(/真正开始前，我又检查了三次/)).toBeTruthy()
    const reject = view.getByRole('button', { name: zh['star.observer.rejects'] })
    expect(reject.hasAttribute('disabled')).toBe(true)
    fireEvent.change(view.getByPlaceholderText(zh['star.observer.correction.placeholder']), {
      target: { value: '我不是害怕开始，只是在等待必要信息。' },
    })
    fireEvent.click(reject)
    await waitFor(() => { expect(onCalibrate).toHaveBeenCalledOnce() })
    expect(onCalibrate.mock.calls[0]?.[0]).toMatchObject({
      id: card().id, ifVersion: card().version, verdict: 'rejects', correction: '我不是害怕开始，只是在等待必要信息。',
    })
    fireEvent.click(view.getByRole('button', { name: zh['star.observer.save'] }))
    await waitFor(() => { expect(onFinalize).toHaveBeenCalledOnce() })
    expect(onFinalize.mock.calls[0]?.[0]).toEqual({ id: card().id, ifVersion: card().version, action: 'save' })
  })

  it('restores card turns, sends a suggested follow-up, and applies only the rendered revision', async () => {
    const conversation = card({
      turns: [{ id: 'turn-1', role: 'assistant', content: '先说一件最近发生的事。', quickReplyKind: '', createdAt: 2 }],
      quickReplies: [{ kind: 'deepen', label: '我想从昨天那次决定说起' }],
      pendingRevision: {
        id: 'revision-1', title: '先确认必要信息', frontText: '这次停顿更像是在等待必要信息。',
        analysis: card().analysis, openQuestion: '我还缺少哪一项必要信息？', traitKind: 'pattern',
        symbolicBasis: [], confidence: 0.61, createdAt: 3,
      },
    } as unknown as Partial<MindGardenStarCard>)
    const onContinue = vi.fn((_request: MindGardenContinueStarCardRequest) => (
      Promise.resolve({ ok: true as const, value: conversation })
    ))
    const onApplyRevision = vi.fn((_request: MindGardenApplyStarCardRevisionRequest) => (
      Promise.resolve({ ok: true as const, value: conversation })
    ))
    const view = render(<StarObserver
      profile={profile()}
      cards={[conversation]}
      activeCard={conversation}
      t={t}
      onDraw={vi.fn()}
      onCalibrate={vi.fn()}
      onFinalize={vi.fn()}
      onContinue={onContinue}
      onApplyRevision={onApplyRevision}
    />)

    expect(view.getByText('先说一件最近发生的事。')).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: '我想从昨天那次决定说起' }))
    await waitFor(() => { expect(onContinue).toHaveBeenCalledOnce() })
    expect(onContinue.mock.calls[0]?.[0]).toMatchObject({
      id: conversation.id, ifVersion: conversation.version, quickReplyKind: 'deepen',
    })
    fireEvent.click(view.getByRole('button', { name: zh['star.observer.revision.apply'] }))
    await waitFor(() => { expect(onApplyRevision).toHaveBeenCalledOnce() })
    expect(onApplyRevision.mock.calls[0]?.[0]).toEqual({
      id: conversation.id, ifVersion: conversation.version, revisionId: conversation.pendingRevision?.id,
    })
  })
})
