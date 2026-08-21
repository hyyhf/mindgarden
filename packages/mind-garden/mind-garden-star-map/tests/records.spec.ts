import { describe, expect, it } from 'vitest'
import { decodeStoredStarState } from '../src/records.ts'

const state = () => ({
  recordType: 'star-state' as const,
  formatVersion: 1 as const,
  id: '10000000-0000-4000-8000-000000000001',
  version: '20000000-0000-4000-8000-000000000002',
  profile: {
    onboardingStage: 3 as const,
    onboardingCompleted: true,
    displayName: 'Lin',
    birthMonth: null,
    birthDay: null,
    birthYear: null,
    birthTime: '',
    birthTimeKnown: false,
    birthCity: '',
    birthCityKnown: false,
    mbtiMode: 'observe' as const,
    mbtiType: '',
    mbtiAnswers: [],
    selfWords: ['curious'],
    observationIntent: 'Observe gently.',
    observerTone: 'gentle' as const,
    permissions: {
      dailyReflections: false,
      confirmedMemories: false,
      openQuestions: false,
      periodReviews: false,
    },
    reducedMotion: false,
    createdAt: 1,
    updatedAt: 1,
  },
  traits: [{
    id: '30000000-0000-4000-8000-000000000003',
    version: '40000000-0000-4000-8000-000000000004',
    kind: 'strength' as const,
    status: 'self-reported' as const,
    label: 'curious',
    description: '',
    confidence: 1,
    source: 'ritual-self-report' as const,
    createdAt: 1,
    updatedAt: 1,
  }],
})

describe('Star Map authenticated record codec', () => {
  it('accepts a complete aggregate and permits retiring a self-report', () => {
    expect(decodeStoredStarState(state())).toMatchObject({
      profile: { displayName: 'Lin' }, cards: [], observationRuns: [], dialogueRuns: [],
    })
    expect(decodeStoredStarState({
      ...state(),
      traits: [{ ...state().traits[0], status: 'retired' }],
    })).toMatchObject({ traits: [{ status: 'retired' }] })
  })

  it('rejects inconsistent completion, duplicate traits, and inferred self-report status', () => {
    expect(() => decodeStoredStarState({
      ...state(),
      profile: { ...state().profile, onboardingStage: 2 },
    })).toThrow()
    expect(() => decodeStoredStarState({
      ...state(),
      traits: [state().traits[0], state().traits[0]],
    })).toThrow()
    expect(() => decodeStoredStarState({
      ...state(),
      traits: [{ ...state().traits[0], status: 'confirmed' }],
    })).toThrow()
  })

  it('requires dialogue audit terminal fields and a known card owner', () => {
    const cardId = '50000000-0000-4000-8000-000000000005'
    const card = {
      id: cardId,
      version: '60000000-0000-4000-8000-000000000006',
      status: 'draft',
      deck: 'current-self',
      observerTone: 'gentle',
      question: '',
      title: 'A provisional card',
      frontText: 'A provisional observation.',
      analysis: { situation: 'A choice.', coreIssue: 'An unknown.', tradeoff: 'Two costs.', guidance: 'One test.' },
      openQuestion: '我愿意验证什么？',
      cardKind: 'imagination',
      traitKind: 'pattern',
      symbolicBasis: [],
      evidence: [],
      confidence: 0.4,
      calibration: null,
      traitId: null,
      provider: 'observer',
      model: 'v1',
      createdAt: 1,
      updatedAt: 1,
    }
    const running = {
      id: '70000000-0000-4000-8000-000000000007',
      cardId,
      cardVersion: card.version,
      status: 'running',
      failure: null,
      provider: 'observer',
      model: 'v1',
      system: 'system',
      prompt: 'prompt',
      rawOutput: '',
      userTurnId: null,
      assistantTurnId: null,
      createdAt: 1,
      updatedAt: 1,
    }
    expect(decodeStoredStarState({ ...state(), cards: [card], dialogueRuns: [running] }))
      .toMatchObject({ dialogueRuns: [{ status: 'running' }] })
    expect(() => decodeStoredStarState({
      ...state(), cards: [card], dialogueRuns: [{ ...running, status: 'completed', rawOutput: '{}' }],
    })).toThrow()
    expect(() => decodeStoredStarState({
      ...state(), cards: [card], dialogueRuns: [{ ...running, cardId: '80000000-0000-4000-8000-000000000008' }],
    })).toThrow()
  })
})
