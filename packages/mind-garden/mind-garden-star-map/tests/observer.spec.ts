import { describe, expect, it } from 'vitest'
import type { MindGardenStarCard, MindGardenStarProfile, MindGardenStarTrait } from '../src/types.ts'
import {
  buildStarObserverDialogueEnvelope,
  buildStarObserverEnvelope,
  decodeStarObserverDialogueOutput,
  decodeStarObserverOutput,
  type StarObserverSource,
} from '../src/observer.ts'

const profile = {
  displayName: 'Lin', mbtiMode: 'observe', mbtiType: '', selfWords: ['curious'], observationIntent: 'Notice change.',
} as unknown as MindGardenStarProfile

const traits = [
  { id: 'self', status: 'self-reported', kind: 'strength', label: 'curious', description: '' },
  { id: 'confirmed', status: 'confirmed', kind: 'pattern', label: 'tests assumptions', description: 'with small steps' },
  { id: 'pending', status: 'pending', kind: 'tension', label: 'must not enter prompt', description: '' },
] as unknown as MindGardenStarTrait[]

const evidence: StarObserverSource[] = [{
  key: 'e1', sourceType: 'confirmed-memory', sourceId: '3d62eff1-9134-44db-b5f6-c31b94ef8bd7', summary: 'I prefer a reversible first step.',
}]

function output(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({ card: {
    title: 'Test one assumption', frontText: 'A small test may separate urgency from uncertainty.',
    analysis: {
      situation: 'A choice is waiting.', coreIssue: 'One assumption remains untested.',
      tradeoff: 'Moving now is faster; testing first reduces avoidable cost.', guidance: 'Run one reversible test.',
    },
    openQuestion: '我愿意先验证哪个假设？', symbolicBasis: [], evidenceKeys: ['e1'], confidence: 0.99,
    traitKind: 'pattern', ...overrides,
  } })
}

describe('Star Observer prompt and output boundary', () => {
  it('admits only self-reported and confirmed traits and rejects the complete oversized request', () => {
    const envelope = buildStarObserverEnvelope(profile, traits, 'current-self', '', 'gentle', evidence, 32_768)
    expect(envelope?.prompt).toContain('tests assumptions')
    expect(envelope?.prompt).not.toContain('must not enter prompt')
    expect(envelope?.prompt).not.toContain(evidence[0]!.sourceId)
    expect(buildStarObserverEnvelope(profile, traits, 'current-self', '', 'gentle', evidence, 8)).toBeNull()
  })

  it('caps confidence and rejects unknown evidence, internal identifiers, and non-first-person questions', () => {
    expect(decodeStarObserverOutput(output(), evidence)).toMatchObject({ confidence: 0.82, evidenceKeys: ['e1'] })
    expect(decodeStarObserverOutput(output({ evidenceKeys: ['missing'] }), evidence)).toBeNull()
    expect(decodeStarObserverOutput(output({ openQuestion: 'What should the user do?' }), evidence)).toBeNull()
    expect(decodeStarObserverOutput(output({ frontText: `Internal ${evidence[0]!.sourceId}` }), evidence)).toBeNull()
    expect(decodeStarObserverOutput(output({ evidenceKeys: [], confidence: 0.9 }), evidence))
      .toMatchObject({ confidence: 0.45, evidenceKeys: [] })
  })

  it('bounds dialogue history and decodes only first-person, identifier-safe continuations', () => {
    const card = {
      id: 'card', version: 'version', status: 'saved', deck: 'current-self', observerTone: 'gentle',
      cardKind: 'observation', title: 'Test one assumption', frontText: 'A provisional reading.',
      analysis: {
        situation: 'A choice is waiting.', coreIssue: 'One assumption remains untested.',
        tradeoff: 'Moving now is faster; testing first reduces avoidable cost.', guidance: 'Run one test.',
      },
      openQuestion: '我愿意先验证哪个假设？', traitKind: 'pattern', symbolicBasis: [], confidence: 0.7,
      evidence: [{ id: 'evidence', sourceType: 'confirmed-memory', sourceId: evidence[0]!.sourceId, summary: evidence[0]!.summary }],
      turns: Array.from({ length: 10 }, (_, index) => ({
        id: `turn-${index}`, role: index % 2 === 0 ? 'user' : 'assistant', content: `turn ${index}`,
        quickReplyKind: '', createdAt: index,
      })),
      quickReplies: [], pendingRevision: null, calibration: null, traitId: null,
      question: '', provider: 'observer', model: 'v1', createdAt: 1, updatedAt: 1,
    } as unknown as MindGardenStarCard
    const envelope = buildStarObserverDialogueEnvelope(card, 'I have a counterexample.', 'correct', 32_768)
    expect(envelope?.prompt).not.toContain('turn 0')
    expect(envelope?.prompt).toContain('turn 9')
    expect(envelope?.prompt).not.toContain(evidence[0]!.sourceId)
    expect(buildStarObserverDialogueEnvelope(card, 'I have a counterexample.', 'correct', 8)).toBeNull()

    const valid = JSON.stringify({
      reply: 'That counterexample narrows the claim.',
      quickReplies: [
        { kind: 'deepen', label: '我想补充当时的具体限制' },
        { kind: 'shift', label: '我想比较一次相反的经历' },
        { kind: 'correct', label: '我觉得修订后仍有一处不准确' },
      ],
      revision: {
        title: 'Wait for necessary information', frontText: 'The pause may be a bounded information check.',
        analysis: card.analysis, openQuestion: '我还缺少哪一项必要信息？', symbolicBasis: [],
        confidence: 0.99, traitKind: 'pattern',
      },
    })
    expect(decodeStarObserverDialogueOutput(valid, envelope!.evidence, 'observation'))
      .toMatchObject({ revision: { confidence: 0.82 } })
    expect(decodeStarObserverDialogueOutput(valid.replace('我想补充当时的具体限制', 'Tell the user more'), envelope!.evidence, 'observation'))
      .toBeNull()
    expect(decodeStarObserverDialogueOutput(valid.replace('That counterexample', evidence[0]!.sourceId), envelope!.evidence, 'observation'))
      .toBeNull()
  })
})
