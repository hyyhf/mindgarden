import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Agent } from '@deepseek-ai/dsh-agent'
import LlmRuntime, {
  LlmAdapter,
  type GenerateOptions,
  type StreamChunk,
} from '@deepseek-ai/dsh-llm'
import type { Session } from '@deepseek-ai/dsh-session'
import { Session as SessionValue, SessionId } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import MindGardenVault, {
  createMindGardenDataKey,
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden-vault'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden-core'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import MindGardenStarMap, {
  type Config,
  type MindGardenStarProfileInput,
} from '../src/index.ts'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import {
  MemoryMediaPool,
  MemoryStorageBackend,
} from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import { apply as invariantApply } from '../src/invariant.ts'

function activeState(privacy: MindGardenSessionState['privacy'] = 'durable'): MindGardenSessionState {
  return {
    revision: 1,
    activatedAt: 1,
    updatedAt: 1,
    mode: 'serenity',
    supportIntent: 'listen',
    privacy,
    contractVersion: 1,
    modelDisclosureAccepted: true,
  }
}

const profileInput = (overrides: Partial<MindGardenStarProfileInput> = {}): MindGardenStarProfileInput => ({
  displayName: 'Lin',
  birthMonth: null,
  birthDay: null,
  birthYear: null,
  birthTime: '',
  birthTimeKnown: false,
  birthCity: '',
  birthCityKnown: false,
  mbtiMode: 'observe',
  mbtiType: '',
  mbtiAnswers: [],
  selfWords: ['curious', 'steady'],
  observationIntent: 'Notice patterns without turning them into verdicts.',
  observerTone: 'gentle',
  permissions: {
    dailyReflections: false,
    confirmedMemories: false,
    openQuestions: true,
    periodReviews: false,
  },
  reducedMotion: false,
  ...overrides,
})

async function harness(config: Config = {}) {
  const ctx = new Context()
  const pool = new MemoryMediaPool()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(MemoryCredentials, { MIND_GARDEN_DATA_KEY: createMindGardenDataKey() })
  const live = new Map<string, Agent>()
  const states = new WeakMap<Session, MindGardenSessionState | null>()
  const sourceState = { memories: [] as unknown[] }
  ctx.provide('agents', { get: (id: string) => live.get(id) } as never)
  ctx.provide('mindGarden', { current: (session: Session) => states.get(session) ?? null } as never)
  ctx.provide('mindGardenMemory', {
    list: () => Promise.resolve({ ok: true, value: { items: sourceState.memories } }),
  } as never)
  ctx.provide('mindGardenReflection', {
    authorizedContext: () => Promise.resolve({
      ok: true,
      value: { todayCheckin: null, retrievableJournals: [] },
    }),
    openQuestionContext: () => Promise.resolve({ ok: true, value: { openQuestions: [] } }),
    listPeriodReviews: () => Promise.resolve({ ok: true, value: { reviews: [] } }),
  } as never)
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(MindGardenVault)
  await ctx.plugin(MindGardenStarMap, config)
  const makeAgent = (
    id: string,
    state: MindGardenSessionState | null = activeState(),
  ): Agent => {
    const session = SessionValue.create(SessionId(id))
    const agent = { id: session.id, session, options: {}, status: 'idle' } as Agent
    live.set(agent.id, agent)
    states.set(session, state)
    return agent
  }
  return { ctx, pool, sourceState, makeAgent }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Mind Garden Star Map service', () => {
  it('requires the exact live Agent, an activated garden, and durable privacy', async () => {
    const { ctx, makeAgent } = await harness()
    const inactive = makeAgent('inactive', null)
    const ephemeral = makeAgent('ephemeral', activeState('ephemeral'))
    await expect(ctx.mindGardenStarMap.overview(inactive)).resolves.toEqual({
      ok: false,
      error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenStarMap.overview(ephemeral)).resolves.toEqual({
      ok: false,
      error: { code: 'durable-session-required' },
    })
    const owned = makeAgent('owned')
    await expect(ctx.mindGardenStarMap.overview({ ...owned }))
      .rejects.toThrow("agent 'owned' is not live in this registry")
    const service = ctx.mindGardenStarMap
    await ctx.fiber.dispose()
    await expect(service.overview(owned)).rejects.toThrow('service is disposing')
  })

  it('saves resumable forward-only ritual progress under profile CAS', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('resume')
    await expect(ctx.mindGardenStarMap.overview(agent)).resolves.toMatchObject({
      ok: true,
      value: { profile: { version: null, onboardingStage: 0, onboardingCompleted: false }, traits: [] },
    })
    const first = await ctx.mindGardenStarMap.saveRitualProgress(agent, {
      ...profileInput({ displayName: '', selfWords: [], observationIntent: '' }),
      onboardingStage: 1,
      ifVersion: null,
    })
    if (!first.ok) throw new Error('first checkpoint failed')
    expect(first.value.profile).toMatchObject({ onboardingStage: 1, createdAt: 1_000, updatedAt: 1_000 })

    await expect(ctx.mindGardenStarMap.saveRitualProgress(agent, {
      ...profileInput({ displayName: '', selfWords: [], observationIntent: '' }),
      onboardingStage: 2,
      ifVersion: null,
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'star-profile-version-conflict', current: first.value.profile },
    })

    vi.setSystemTime(2_000)
    const revised = await ctx.mindGardenStarMap.saveRitualProgress(agent, {
      ...profileInput({ selfWords: [], observationIntent: '' }),
      onboardingStage: 0,
      ifVersion: first.value.profile.version,
    })
    expect(revised).toMatchObject({
      ok: true,
      value: { profile: { onboardingStage: 1, createdAt: 1_000, updatedAt: 2_000 }, traits: [] },
    })
  })

  it('completes atomically with only self-authored stars and stores no plaintext', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(3_000)
    const { ctx, pool, makeAgent } = await harness()
    const agent = makeAgent('complete')
    const completed = await ctx.mindGardenStarMap.completeRitual(agent, {
      ...profileInput({ displayName: 'Private stargazer', selfWords: ['quiet courage', 'playful'] }),
      ifVersion: null,
    })
    if (!completed.ok) throw new Error('completion failed')
    expect(completed.value.profile).toMatchObject({
      onboardingStage: 3,
      onboardingCompleted: true,
      displayName: 'Private stargazer',
      createdAt: 3_000,
    })
    expect(completed.value.traits).toMatchObject([
      { label: 'quiet courage', status: 'self-reported', source: 'ritual-self-report', confidence: 1 },
      { label: 'playful', status: 'self-reported', source: 'ritual-self-report', confidence: 1 },
    ])
    await expect(ctx.mindGardenStarMap.completeRitual(agent, {
      ...profileInput({ displayName: 'ignored after completion' }),
      ifVersion: null,
    })).resolves.toEqual(completed)

    const persisted = JSON.stringify(pool.media.get('mind_garden_vault'))
    expect(persisted).not.toContain('Private stargazer')
    expect(persisted).not.toContain('quiet courage')
    await expect(ctx.mindGardenVault.status()).resolves.toMatchObject({
      records: { memories: 0, reflections: 0, media: 0, stars: 1 },
    })
  })

  it('updates profiles and lets users correct or retire self-reported stars under separate CAS', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(4_000)
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('govern')
    const completed = await ctx.mindGardenStarMap.completeRitual(agent, {
      ...profileInput({ selfWords: ['curious'] }),
      ifVersion: null,
    })
    if (!completed.ok) throw new Error('completion failed')
    const trait = completed.value.traits[0]
    if (trait === undefined || completed.value.profile.version === null) throw new Error('seed state missing')

    vi.setSystemTime(5_000)
    const updated = await ctx.mindGardenStarMap.updateProfile(agent, {
      ...profileInput({ displayName: 'Lin updated', selfWords: ['curious'], reducedMotion: true }),
      ifVersion: completed.value.profile.version,
    })
    if (!updated.ok) throw new Error('profile update failed')
    expect(updated.value).toMatchObject({
      profile: { displayName: 'Lin updated', reducedMotion: true, updatedAt: 5_000 },
      traits: [{ id: trait.id, version: trait.version }],
    })
    await expect(ctx.mindGardenStarMap.updateProfile(agent, {
      ...profileInput(),
      ifVersion: completed.value.profile.version,
    })).resolves.toMatchObject({ error: { code: 'star-profile-version-conflict' } })

    const renamed = await ctx.mindGardenStarMap.updateTrait(agent, {
      id: trait.id,
      ifVersion: trait.version,
      status: 'self-reported',
      label: 'open curiosity',
      description: 'A word I chose for myself.',
    })
    if (!renamed.ok) throw new Error('trait update failed')
    expect(renamed.value).toMatchObject({ label: 'open curiosity', status: 'self-reported', updatedAt: 5_000 })
    await expect(ctx.mindGardenStarMap.updateTrait(agent, {
      id: trait.id,
      ifVersion: trait.version,
      status: 'retired',
    })).resolves.toMatchObject({ error: { code: 'star-trait-version-conflict' } })
    await expect(ctx.mindGardenStarMap.updateTrait(agent, {
      id: renamed.value.id,
      ifVersion: renamed.value.version,
      status: 'retired',
    })).resolves.toMatchObject({ ok: true, value: { status: 'retired' } })
    await expect(ctx.mindGardenStarMap.overview(agent)).resolves.toMatchObject({
      ok: true,
      value: { traits: [] },
    })
  })

  it('rejects invalid ritual fields and impossible programmatic bounds', async () => {
    const { ctx, makeAgent } = await harness({ maxDisplayNameBytes: 4, maxIntentBytes: 8, maxSelfWords: 2 })
    const agent = makeAgent('validate')
    const complete = (overrides: Partial<MindGardenStarProfileInput>) => ctx.mindGardenStarMap.completeRitual(agent, {
      ...profileInput(overrides),
      ifVersion: null,
    })
    await expect(complete({ displayName: 'long name' }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'displayName', reason: 'too-large' } })
    await expect(complete({ displayName: '' }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'displayName', reason: 'blank' } })
    await expect(complete({ observationIntent: '' }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'observationIntent', reason: 'blank' } })
    await expect(complete({ birthMonth: 2, birthDay: 30 }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'birthDate' } })
    await expect(complete({ birthYear: 1800 }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'birthDate' } })
    await expect(complete({ birthTimeKnown: true, birthTime: '25:00' }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'birthTime' } })
    await expect(complete({ mbtiMode: 'known', mbtiType: 'XXXX' }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'mbti' } })
    await expect(complete({ selfWords: ['same', ' same '] }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'selfWords', reason: 'duplicate' } })
    await expect(complete({ selfWords: ['one', 'two', 'three'] }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'selfWords' } })
    expect(() => new MindGardenStarMap(new Context(), { maxSelfWords: 6 })).toThrow(TypeError)
    expect(() => new MindGardenStarMap(new Context(), { maxTraitTextBytes: 0 })).toThrow(TypeError)
  })

  it('maps authenticated plaintext corruption and vault failures to stable errors', async () => {
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('failure')
    const id = MindGardenVaultRecordId('7f76c63c-e3d1-4fe9-b951-9f703999803b')
    await ctx.mindGardenVault.put('stars', id, { recordType: 'star-state', invalid: true })
    await expect(ctx.mindGardenStarMap.overview(agent)).resolves.toEqual({
      ok: false,
      error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.mindGardenVault.delete('stars', id)
    vi.spyOn(ctx.mindGardenVault, 'entries').mockRejectedValueOnce(new MindGardenVaultError('locked', 'locked'))
    await expect(ctx.mindGardenStarMap.overview(agent)).resolves.toEqual({
      ok: false,
      error: { code: 'vault-unavailable', state: 'locked' },
    })
  })

  it('draws a provisional card through the auxiliary LLM lane and requires terminal review', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(8_000)
    const { ctx, pool, makeAgent } = await harness()
    const adapter = new ObserverAdapter([observerResponse({ confidence: 0.9 })])
    ctx.llm.registerAdapter(['observer'], adapter)
    const agent = makeAgent('observer-flow')
    const completed = await ctx.mindGardenStarMap.completeRitual(agent, {
      ...profileInput({ permissions: {
        dailyReflections: false,
        confirmedMemories: false,
        openQuestions: false,
        periodReviews: false,
      } }),
      ifVersion: null,
    })
    if (!completed.ok) throw new Error('completion failed')

    const drawn = await ctx.mindGardenStarMap.drawCard(agent, {
      deck: 'current-self',
      question: 'What am I overlooking?',
      observedLocalDate: '2026-08-19',
      provider: 'observer',
      model: 'observer-v1',
    })
    if (!drawn.ok) throw new Error(`draw failed: ${drawn.error.code}`)
    expect(drawn.value).toMatchObject({
      status: 'draft',
      cardKind: 'imagination',
      traitKind: 'pattern',
      confidence: 0.45,
      evidence: [],
      provider: 'observer',
      model: 'observer-v1',
    })
    expect(adapter.requests[0]).toMatchObject({
      purpose: 'mind-garden-star-observer-draw',
      sessionId: agent.session.id,
      maxTokens: 2048,
    })
    await expect(ctx.mindGardenStarMap.drawCard(agent, {
      deck: 'random',
      question: '',
      observedLocalDate: '2026-08-19',
      provider: 'observer',
      model: 'observer-v1',
    })).resolves.toMatchObject({ error: { code: 'star-active-card-exists' } })

    await expect(ctx.mindGardenStarMap.calibrateCard(agent, {
      id: drawn.value.id,
      ifVersion: drawn.value.version,
      verdict: 'rejects',
    })).resolves.toMatchObject({
      error: { code: 'invalid-field', field: 'correction', reason: 'blank' },
    })
    const calibrated = await ctx.mindGardenStarMap.calibrateCard(agent, {
      id: drawn.value.id,
      ifVersion: drawn.value.version,
      verdict: 'uncertain',
      correction: 'I need a real example before deciding.',
    })
    if (!calibrated.ok) throw new Error('calibration failed')
    expect(calibrated.value).toMatchObject({ calibration: { verdict: 'uncertain' } })
    const saved = await ctx.mindGardenStarMap.finalizeCard(agent, {
      id: calibrated.value.id,
      ifVersion: calibrated.value.version,
      action: 'save',
    })
    expect(saved).toMatchObject({ ok: true, value: { status: 'saved' } })
    await expect(ctx.mindGardenStarMap.overview(agent)).resolves.toMatchObject({
      ok: true,
      value: {
        activeCard: null,
        cards: [{ status: 'saved' }],
        traits: [
          { source: 'ritual-self-report' },
          { source: 'ritual-self-report' },
          { source: 'star-observer', status: 'uncertain' },
        ],
      },
    })
    const second = await ctx.mindGardenStarMap.drawCard(agent, {
      deck: 'inner-debate',
      question: 'What can I release?',
      observedLocalDate: '2026-08-19',
      provider: 'observer',
      model: 'observer-v1',
    })
    if (!second.ok) throw new Error('second draw failed')
    const resonated = await ctx.mindGardenStarMap.calibrateCard(agent, {
      id: second.value.id,
      ifVersion: second.value.version,
      verdict: 'resonates',
    })
    if (!resonated.ok) throw new Error('second calibration failed')
    await expect(ctx.mindGardenStarMap.finalizeCard(agent, {
      id: resonated.value.id,
      ifVersion: resonated.value.version,
      action: 'dissolve',
    })).resolves.toMatchObject({ ok: true, value: { status: 'dissolved' } })
    await expect(ctx.mindGardenStarMap.overview(agent)).resolves.toMatchObject({
      ok: true,
      value: {
        cards: [{ status: 'saved' }],
        traits: [
          { source: 'ritual-self-report' },
          { source: 'ritual-self-report' },
          { source: 'star-observer', status: 'uncertain' },
        ],
      },
    })
    const persisted = JSON.stringify(pool.media.get('mind_garden_vault'))
    expect(persisted).not.toContain('A reversible pause')
    expect(persisted).not.toContain('I need a real example before deciding.')
  })

  it('rejects invalid observer output without fabricating a fallback card', async () => {
    const { ctx, makeAgent } = await harness()
    ctx.llm.registerAdapter(['observer'], new ObserverAdapter([observerResponse({
      openQuestion: 'What should you do?',
    })]))
    const agent = makeAgent('observer-invalid')
    await ctx.mindGardenStarMap.completeRitual(agent, { ...profileInput(), ifVersion: null })
    await expect(ctx.mindGardenStarMap.drawCard(agent, {
      deck: 'inner-debate',
      question: '',
      observedLocalDate: '2026-08-19',
      provider: 'observer',
      model: 'observer-v1',
    })).resolves.toEqual({ ok: false, error: { code: 'star-observer-output-invalid' } })
    await expect(ctx.mindGardenStarMap.overview(agent)).resolves.toMatchObject({
      ok: true, value: { activeCard: null, cards: [] },
    })
  })

  it('continues a saved card, keeps revisions inert, and resets linked calibration only on acceptance', async () => {
    const { ctx, pool, makeAgent } = await harness()
    const adapter = new ObserverAdapter([observerResponse(), dialogueResponse()])
    ctx.llm.registerAdapter(['observer'], adapter)
    const agent = makeAgent('observer-dialogue')
    await ctx.mindGardenStarMap.completeRitual(agent, { ...profileInput(), ifVersion: null })
    const drawn = await ctx.mindGardenStarMap.drawCard(agent, {
      deck: 'current-self', question: '', observedLocalDate: '2026-08-19', provider: 'observer', model: 'v1',
    })
    if (!drawn.ok) throw new Error('draw failed')
    const calibrated = await ctx.mindGardenStarMap.calibrateCard(agent, {
      id: drawn.value.id, ifVersion: drawn.value.version, verdict: 'resonates',
    })
    if (!calibrated.ok) throw new Error('calibration failed')
    const saved = await ctx.mindGardenStarMap.finalizeCard(agent, {
      id: calibrated.value.id, ifVersion: calibrated.value.version, action: 'save',
    })
    if (!saved.ok) throw new Error('save failed')

    const continued = await ctx.mindGardenStarMap.continueCard(agent, {
      id: saved.value.id,
      ifVersion: saved.value.version,
      content: 'I pause because one necessary fact is still missing.',
      quickReplyKind: 'correct',
      provider: 'observer',
      model: 'v1',
    })
    if (!continued.ok) throw new Error(`dialogue failed: ${continued.error.code}`)
    expect(continued.value).toMatchObject({
      status: 'saved',
      title: 'A reversible pause',
      calibration: { verdict: 'resonates' },
      turns: [
        { role: 'user', quickReplyKind: 'correct' },
        { role: 'assistant', content: 'The missing fact makes this pause more bounded than the original card suggested.' },
      ],
      pendingRevision: { title: 'Waiting for one necessary fact', confidence: 0.45 },
    })
    expect(adapter.requests[1]).toMatchObject({ purpose: 'mind-garden-star-observer-dialogue' })
    expect(JSON.stringify(adapter.requests[1])).toContain('I pause because one necessary fact is still missing.')

    const revision = continued.value.pendingRevision
    if (revision === null) throw new Error('revision missing')
    const applied = await ctx.mindGardenStarMap.applyCardRevision(agent, {
      id: continued.value.id,
      ifVersion: continued.value.version,
      revisionId: revision.id,
    })
    if (!applied.ok) throw new Error('revision failed')
    expect(applied.value).toMatchObject({
      title: 'Waiting for one necessary fact',
      calibration: null,
      pendingRevision: null,
      turns: [{ role: 'user' }, { role: 'assistant' }],
    })
    const afterRevision = await ctx.mindGardenStarMap.overview(agent)
    if (!afterRevision.ok) throw new Error('overview failed')
    expect(afterRevision.value.traits.find(trait => trait.source === 'star-observer'))
      .toMatchObject({ label: 'Waiting for one necessary fact', status: 'pending' })

    await expect(ctx.mindGardenStarMap.calibrateCard(agent, {
      id: applied.value.id, ifVersion: applied.value.version, verdict: 'resonates',
    })).resolves.toMatchObject({ ok: true, value: { status: 'saved', calibration: { verdict: 'resonates' } } })
    const encrypted = JSON.stringify(pool.media.get('mind_garden_vault'))
    expect(encrypted).not.toContain('one necessary fact')
    expect(encrypted).not.toContain('more bounded')
  })

  it('binds cards only to explicitly authorized, recallable, normal-sensitivity evidence', async () => {
    const { ctx, sourceState, makeAgent } = await harness()
    sourceState.memories = [
      {
        id: 'memory-approved', status: 'confirmed', kind: 'preference', sensitivity: 'normal',
        content: 'I prefer one reversible first step.', scope: 'important choices', recallPolicy: 'relevant',
      },
      {
        id: 'memory-private', status: 'confirmed', kind: 'fact', sensitivity: 'high',
        content: 'HIGHLY PRIVATE MATERIAL', recallPolicy: 'always',
      },
      {
        id: 'memory-candidate', status: 'candidate', kind: 'fact', sensitivity: 'normal',
        content: 'UNCONFIRMED MATERIAL', recallPolicy: 'never',
      },
    ]
    const adapter = new ObserverAdapter([observerResponse({ evidenceKeys: ['e1'], confidence: 0.9 })])
    ctx.llm.registerAdapter(['observer'], adapter)
    const agent = makeAgent('observer-evidence')
    await ctx.mindGardenStarMap.completeRitual(agent, {
      ...profileInput({ permissions: {
        dailyReflections: false,
        confirmedMemories: true,
        openQuestions: false,
        periodReviews: false,
      } }),
      ifVersion: null,
    })
    const drawn = await ctx.mindGardenStarMap.drawCard(agent, {
      deck: 'unfolded-self', question: '', observedLocalDate: '2026-08-19', provider: 'observer', model: 'v1',
    })
    if (!drawn.ok) throw new Error('evidence draw failed')
    expect(drawn.value).toMatchObject({
      cardKind: 'observation', confidence: 0.82,
      evidence: [{ sourceType: 'confirmed-memory', sourceId: 'memory-approved' }],
    })
    expect(drawn.value.evidence[0]?.summary).toContain('reversible')
    const requestText = JSON.stringify(adapter.requests[0])
    expect(requestText).toContain('I prefer one reversible first step.')
    expect(requestText).not.toContain('HIGHLY PRIVATE MATERIAL')
    expect(requestText).not.toContain('UNCONFIRMED MATERIAL')
    const saved = await ctx.mindGardenStarMap.finalizeCard(agent, {
      id: drawn.value.id, ifVersion: drawn.value.version, action: 'save',
    })
    expect(saved).toMatchObject({ ok: true, value: { status: 'saved' } })
    const current = await ctx.mindGardenStarMap.overview(agent)
    if (!current.ok) throw new Error('overview failed')
    expect(current.value.traits.some(trait => trait.source === 'star-observer' && trait.status === 'pending')).toBe(true)
  })
})

describe('Mind Garden Star Map invariant companion', () => {
  it('registers package ownership and its service dependency', async () => {
    let installer: InvariantInstaller | undefined
    const disposer = () => {}
    const ctx = {
      invariants: {
        register: vi.fn((_name: string, value: InvariantInstaller) => { installer = value; return disposer }),
      },
    } as never
    await expect(invariantApply(ctx)).resolves.toBe(disposer)
    expect(installer?.inject).toEqual(['mindGardenStarMap'])
    expect(installer?.(new Context(), () => { throw new Error('unused') })).toBeUndefined()
  })
})

function observerResponse(overrides: Record<string, unknown> = {}): StreamChunk[] {
  const text = JSON.stringify({
    card: {
      title: 'A reversible pause',
      frontText: 'You may be treating one uncertain signal as a final verdict.',
      analysis: {
        situation: 'The question points to a decision that still has unknowns.',
        coreIssue: 'The smallest test has not been named yet.',
        tradeoff: 'Acting now creates momentum; pausing creates evidence but costs time.',
        guidance: 'Name one assumption and test it with a small reversible action.',
      },
      openQuestion: '我想先验证哪一个最小假设？',
      symbolicBasis: ['A dim star can be a temporary navigation marker.'],
      evidenceKeys: [],
      confidence: 0.6,
      traitKind: 'pattern',
      ...overrides,
    },
  })
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text },
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

function dialogueResponse(): StreamChunk[] {
  const text = JSON.stringify({
    reply: 'The missing fact makes this pause more bounded than the original card suggested.',
    quickReplies: [
      { kind: 'deepen', label: '我想说清楚缺少的具体信息' },
      { kind: 'shift', label: '我想比较一次没有等待的经历' },
      { kind: 'correct', label: '我觉得这个修订仍不准确' },
    ],
    revision: {
      title: 'Waiting for one necessary fact',
      frontText: 'This pause may be an information boundary rather than broad hesitation.',
      analysis: {
        situation: 'One decision is waiting on a named fact.',
        coreIssue: 'Whether that fact is necessary remains testable.',
        tradeoff: 'Waiting may reduce avoidable cost; acting now may preserve momentum.',
        guidance: 'Name the fact and set a short point for deciding without it.',
      },
      openQuestion: '我缺少的事实真的是做决定所必需的吗？',
      symbolicBasis: [],
      confidence: 0.6,
      traitKind: 'pattern',
    },
  })
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text },
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

class ObserverAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []

  constructor(private readonly scripts: StreamChunk[][]) {
    super()
  }

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    yield* (this.scripts.shift() ?? observerResponse())
  }
}
