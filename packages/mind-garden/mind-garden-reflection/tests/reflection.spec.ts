import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { Session } from '@deepseek-ai/dsh-session'
import { Session as SessionValue, SessionId } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import MindGardenVault, {
  createMindGardenDataKey,
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden/vault'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden/core'
import MindGardenReflection, {
  storedContemplationSchema,
  storedConcernSchema,
  storedExperimentSchema,
  storedOpenQuestionSchema,
  storedPeriodReviewSchema,
  storedPrincipleSchema,
  type Config,
  type MindGardenCalendarStamp,
  type MindGardenPrincipleContent,
} from '@deepseek-ai/dsh-mind-garden/reflection'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import {
  MemoryMediaPool,
  MemoryStorageBackend,
} from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import { apply as invariantApply } from '../src/invariant.ts'

const stamp = (localDate: string, overrides: Partial<MindGardenCalendarStamp> = {}): MindGardenCalendarStamp => ({
  localDate,
  timeZone: 'Asia/Shanghai',
  utcOffsetMinutes: 480,
  ...overrides,
})

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

async function harness(config: Config = {}, key = createMindGardenDataKey()) {
  const ctx = new Context()
  const pool = new MemoryMediaPool()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(MemoryCredentials, { MIND_GARDEN_DATA_KEY: key })
  const live = new Map<string, Agent>()
  const states = new WeakMap<Session, MindGardenSessionState | null>()
  ctx.provide('agents', { get: (id: string) => live.get(id) } as never)
  ctx.provide('mindGarden', { current: (session: Session) => states.get(session) ?? null } as never)
  await ctx.plugin(MindGardenVault)
  await ctx.plugin(MindGardenReflection, config)
  const makeAgent = (
    id: string,
    state: MindGardenSessionState | null = activeState(),
    status: Agent['status'] = 'idle',
  ): Agent => {
    const session = SessionValue.create(SessionId(id))
    const agent = { id: session.id, session, options: {}, status } as Agent
    live.set(agent.id, agent)
    states.set(session, state)
    return agent
  }
  return { ctx, pool, makeAgent }
}

function completeTurn(agent: Agent, turn = 1): void {
  agent.session.append('turn/start', { turn })
  agent.session.append('turn/end', { turn, reason: { kind: 'completed' } })
}

const principleContent = (
  overrides: Partial<MindGardenPrincipleContent> = {},
): MindGardenPrincipleContent => ({
  expression: 'Speak one honest sentence before solving the whole problem.',
  formationContext: 'A difficult meeting became easier after naming one need.',
  userQuote: 'I can begin with one honest sentence.',
  supportingExperiences: [],
  counterexample: 'Immediate danger still calls for leaving first.',
  appliesTo: ['difficult conversations'],
  notAppliesTo: ['immediate danger'],
  lastChallenged: '2026-08-18',
  status: 'trying',
  ...overrides,
})

async function createConfirmedContemplation(ctx: Context, agent: Agent, markdown: string) {
  completeTurn(agent)
  const draft = await ctx.mindGardenReflection.createContemplation(agent, { markdown })
  if (!draft.ok) throw new Error('contemplation creation failed')
  const confirmed = await ctx.mindGardenReflection.confirmContemplation(agent, {
    id: draft.value.id,
    ifVersion: draft.value.version,
  })
  if (!confirmed.ok) throw new Error('contemplation confirmation failed')
  return confirmed.value
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Mind Garden reflection service', () => {
  it('requires a live activated durable Agent and validates every config bound', async () => {
    const { ctx, makeAgent } = await harness()
    const inactive = makeAgent('inactive', null)
    await expect(ctx.mindGardenReflection.month(inactive, { month: '2026-08' })).resolves.toEqual({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenReflection.createJournal(inactive, {
      stamp: stamp('2026-08-18'), body: 'x', allowRetrieval: false,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.createConcern(inactive, {
      stamp: stamp('2026-08-18'), content: 'x',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.listConcerns(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.updateConcern(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      content: 'x',
      observedLocalDate: '2026-08-18',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.completeConcern(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.convertConcern(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      stamp: stamp('2026-08-18'),
      allowRetrieval: false,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.createContemplation(inactive, { markdown: 'x' }))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.listContemplations(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.updateContemplation(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      markdown: 'x',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.confirmContemplation(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.deleteContemplation(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    const principleRequest = {
      sourceContemplationId: '10000000-0000-4000-8000-000000000001' as never,
      content: principleContent(),
    }
    await expect(ctx.mindGardenReflection.proposePrinciple(inactive, principleRequest))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.listPrincipleProposals(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.acceptPrincipleProposal(inactive, {
      id: principleRequest.sourceContemplationId,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      stamp: stamp('2026-08-18'),
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.rejectPrincipleProposal(inactive, {
      id: principleRequest.sourceContemplationId,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.listPrinciples(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.revisePrinciple(inactive, {
      id: principleRequest.sourceContemplationId,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      stamp: stamp('2026-08-18'),
      content: principleContent(),
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    const experimentId = principleRequest.sourceContemplationId
    const experimentVersion = '20000000-0000-4000-8000-000000000002' as never
    await expect(ctx.mindGardenReflection.createExperiment(inactive, {
      stamp: stamp('2026-08-18'), title: 'x', action: 'x',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.listExperiments(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.startExperiment(inactive, {
      id: experimentId, ifVersion: experimentVersion, observedLocalDate: '2026-08-18',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.observeExperiment(inactive, {
      id: experimentId,
      ifVersion: experimentVersion,
      stamp: stamp('2026-08-18'),
      observation: 'x',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.reviseExperiment(inactive, {
      id: experimentId,
      ifVersion: experimentVersion,
      observedLocalDate: '2026-08-18',
      judgment: 'x',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.scheduleExperiment(inactive, {
      id: experimentId,
      ifVersion: experimentVersion,
      observedLocalDate: '2026-08-18',
      reviewStamp: null,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.stopExperiment(inactive, {
      id: experimentId, ifVersion: experimentVersion,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.createOpenQuestion(inactive, {
      stamp: stamp('2026-08-18'), question: 'x',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.listOpenQuestions(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.updateOpenQuestion(inactive, {
      id: experimentId,
      ifVersion: experimentVersion,
      stamp: stamp('2026-08-18'),
      question: 'x',
      status: 'open',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.openQuestionContext(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    const periodRange = {
      periodType: 'week' as const,
      startStamp: stamp('2026-08-12'),
      endStamp: stamp('2026-08-18'),
    }
    await expect(ctx.mindGardenReflection.periodReviewMaterial(inactive, periodRange))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(inactive, {
      ...periodRange, materialHash: '0'.repeat(64), sourceIds: [], content: 'x',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.listPeriodReviews(inactive, {}))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.updatePeriodReview(inactive, {
      id: experimentId, ifVersion: experimentVersion, content: 'x', status: 'proposed',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.updateJournal(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      body: 'x', allowRetrieval: false,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.deleteJournal(inactive, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.day(inactive, { localDate: '2026-08-18' }))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.trend(inactive, { days: 7, endDate: '2026-08-18' }))
      .resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.authorizedContext(inactive, {
      localDate: '2026-08-18', query: '',
    })).resolves.toMatchObject({ error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenReflection.createCheckin(makeAgent('ephemeral', activeState('ephemeral')), {
      stamp: stamp('2026-08-18'), mood: 0, energy: 3, emotionWords: [], phase: 'standalone',
    })).resolves.toEqual({ ok: false, error: { code: 'durable-session-required' } })
    const impostor = { ...makeAgent('owned') } as Agent
    await expect(ctx.mindGardenReflection.day(impostor, { localDate: '2026-08-18' }))
      .rejects.toThrow("agent 'owned' is not live in this registry")
    const service = ctx.mindGardenReflection
    await ctx.fiber.dispose()
    await expect(service.month(inactive, { month: '2026-08' })).rejects.toThrow('service is disposing')

    for (const field of [
      'maxTitleBytes',
      'maxBodyBytes',
      'maxConcernBytes',
      'maxContemplationBytes',
      'maxEmotionWordBytes',
      'maxTimeZoneBytes',
      'maxQueryBytes',
      'maxContextJournals',
      'maxContextBodyBytes',
      'maxConcernsPerList',
      'maxContemplationsPerList',
      'maxPrincipleFieldBytes',
      'maxPrincipleItems',
      'maxPrincipleVersions',
      'maxPrincipleProposalsPerList',
      'maxPrinciplesPerList',
      'maxExperimentFieldBytes',
      'maxExperimentObservations',
      'maxExperimentsPerList',
      'maxOpenQuestionBytes',
      'maxOpenQuestionTransitions',
      'maxOpenQuestionsPerList',
      'maxContextOpenQuestions',
      'maxPeriodReviewContentBytes',
      'maxPeriodReviewMaterialItemBytes',
      'maxPeriodReviewSources',
      'maxPeriodReviewsPerList',
    ] as const) {
      expect(() => new MindGardenReflection(new Context(), { [field]: 0 })).toThrow(field)
    }
    expect(() => new MindGardenReflection(new Context(), { maxTitleBytes: 1.5 })).toThrow('maxTitleBytes')
    const standalone = new Context()
    new MindGardenReflection(standalone, {})
    await standalone.fiber.dispose()
  })

  it('stores only ciphertext and derives day, month, trend, and authorized context views', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const { ctx, pool, makeAgent } = await harness({
      maxContextJournals: 2,
      maxContextBodyBytes: 7,
    })
    const agent = makeAgent('reflection-lifecycle')
    const first = await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-16'), mood: -1, energy: 2, emotionWords: ['焦虑', '疲惫'], phase: 'before',
    })
    expect(first).toMatchObject({
      ok: true,
      value: { moodBand: 'low', energyBand: 'low', stamp: { timeZone: 'Asia/Shanghai' } },
    })
    vi.setSystemTime(2_000)
    await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-17'), mood: 0, energy: 3, emotionWords: [], phase: 'standalone',
    })
    vi.setSystemTime(3_000)
    const latest = await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-18'), mood: 1, energy: 4, emotionWords: ['期待'], phase: 'after',
    })
    vi.setSystemTime(4_000)
    const publicJournal = await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18'),
      title: '  会议之后  ',
      body: '  今天会议后我没有表达清楚。  ',
      allowRetrieval: true,
    })
    vi.setSystemTime(4_000)
    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18'), title: '私人记录', body: '绝不能进入未来对话。', allowRetrieval: false,
    })
    vi.setSystemTime(6_000)
    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-15'), title: '项目会议', body: '会后可以先写下一个问题。', allowRetrieval: true,
    })
    vi.setSystemTime(7_000)
    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-14'), title: '无关记录', body: '浇花和整理书架。', allowRetrieval: true,
    })

    const raw = JSON.stringify(pool.media.get('mind_garden_vault'))
    expect(raw).not.toContain('今天会议后我没有表达清楚')
    expect(raw).not.toContain('焦虑')

    await expect(ctx.mindGardenReflection.month(agent, { month: '2026-08' })).resolves.toMatchObject({
      ok: true,
      value: {
        days: [
          { date: '2026-08-14', eventCount: 1, journalCount: 1 },
          { date: '2026-08-15', eventCount: 1, journalCount: 1 },
          { date: '2026-08-16', eventCount: 1, checkinCount: 1, moodBand: 'low' },
          { date: '2026-08-17', eventCount: 1, checkinCount: 1, moodBand: 'steady' },
          { date: '2026-08-18', eventCount: 3, checkinCount: 1, journalCount: 2, moodBand: 'light' },
        ],
      },
    })
    const day = await ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })
    expect(day).toMatchObject({
      ok: true,
      value: { events: [{ type: 'checkin' }, { type: 'journal' }, { type: 'journal' }] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-13' })).resolves.toEqual({
      ok: true, value: { date: '2026-08-13', events: [] },
    })
    await expect(ctx.mindGardenReflection.trend(agent, { days: 7, endDate: '2026-08-17' })).resolves.toMatchObject({
      ok: true, value: { startDate: '2026-08-11', canPlot: false, recordedDays: 2 },
    })
    await expect(ctx.mindGardenReflection.trend(agent, { days: 30, endDate: '2026-08-18' })).resolves.toMatchObject({
      ok: true,
      value: { startDate: '2026-07-20', canPlot: true, recordedDays: 3, points: [{}, {}, {}] },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-18', query: '会议后没有表达清楚',
    })).resolves.toMatchObject({
      ok: true,
      value: {
        todayCheckin: { id: latest.ok ? latest.value.id : undefined },
        retrievableJournals: [
          { id: publicJournal.ok ? publicJournal.value.id : undefined, title: '会议之后', body: '今天' },
          { title: '项目会议' },
        ],
      },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-13', query: '浇花',
    })).resolves.toMatchObject({
      ok: true,
      value: { todayCheckin: null, retrievableJournals: [{ title: '无关记录', body: '浇花' }] },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-13', query: '',
    })).resolves.toEqual({
      ok: true, value: { todayCheckin: null, retrievableJournals: [] },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-13', query: '浇',
    })).resolves.toEqual({
      ok: true, value: { todayCheckin: null, retrievableJournals: [] },
    })
    vi.setSystemTime(8_000)
    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-12'), title: 'A', body: 'ok', allowRetrieval: true,
    })
    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-12'), title: 'B', body: 'ok', allowRetrieval: true,
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-12', query: '',
    })).resolves.toMatchObject({
      ok: true,
      value: { retrievableJournals: [{ body: 'ok' }, { body: 'ok' }] },
    })
    await ctx.fiber.dispose()
  })

  it('updates journals with exact versions and deletes to a stable absent state', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('journal-mutations')
    const created = await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18'), title: '', body: 'Initial body.', allowRetrieval: false,
    })
    if (!created.ok) throw new Error('journal creation failed')
    await expect(ctx.mindGardenReflection.updateJournal(agent, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: created.value.version,
      body: 'Missing.',
      allowRetrieval: false,
    })).resolves.toMatchObject({ ok: false, error: { code: 'journal-not-found' } })
    await expect(ctx.mindGardenReflection.updateJournal(agent, {
      id: created.value.id,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      body: 'Stale.',
      allowRetrieval: false,
    })).resolves.toMatchObject({ ok: false, error: { code: 'version-conflict', current: { body: 'Initial body.' } } })
    vi.setSystemTime(9_000)
    const updated = await ctx.mindGardenReflection.updateJournal(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      title: 'Observation',
      body: 'Silence felt protective.',
      allowRetrieval: true,
    })
    expect(updated).toMatchObject({ ok: true, value: { updatedAt: 10_000, allowRetrieval: true } })
    if (!updated.ok) throw new Error('journal update failed')
    const untitled = await ctx.mindGardenReflection.updateJournal(agent, {
      id: updated.value.id,
      ifVersion: updated.value.version,
      body: 'Second edit.',
      allowRetrieval: false,
    })
    if (!untitled.ok) throw new Error('second journal update failed')
    expect(untitled.value.title).toBe('')
    await expect(ctx.mindGardenReflection.deleteJournal(agent, {
      id: untitled.value.id,
      ifVersion: created.value.version,
    })).resolves.toMatchObject({ ok: false, error: { code: 'version-conflict' } })
    await expect(ctx.mindGardenReflection.deleteJournal(agent, {
      id: untitled.value.id,
      ifVersion: untitled.value.version,
    })).resolves.toEqual({ ok: true, value: { absent: true } })
    await expect(ctx.mindGardenReflection.deleteJournal(agent, {
      id: untitled.value.id,
      ifVersion: untitled.value.version,
    })).resolves.toEqual({ ok: true, value: { absent: true } })
    await ctx.fiber.dispose()
  })

  it('keeps encrypted concerns reminder-first and removes closed reminders from the calendar', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    const { ctx, pool, makeAgent } = await harness({ maxConcernsPerList: 2 })
    const agent = makeAgent('concern-lifecycle')
    const later = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'),
      content: '  Prepare the difficult conversation.  ',
      reminder: stamp('2026-08-20'),
    })
    if (!later.ok) throw new Error('reminded concern creation failed')
    vi.setSystemTime(20_000)
    const unscheduled = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'),
      content: 'Notice what happens after the meeting.',
    })
    if (!unscheduled.ok) throw new Error('unscheduled concern creation failed')

    expect(JSON.stringify(pool.media.get('mind_garden_vault'))).not.toContain('difficult conversation')
    await expect(ctx.mindGardenReflection.listConcerns(agent, { limit: 1 })).resolves.toMatchObject({
      ok: true,
      value: { concerns: [{ id: later.value.id, content: 'Prepare the difficult conversation.' }] },
    })
    await expect(ctx.mindGardenReflection.month(agent, { month: '2026-08' })).resolves.toMatchObject({
      ok: true,
      value: { days: [{ date: '2026-08-20', eventCount: 1, concernCount: 1 }] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-20' })).resolves.toMatchObject({
      ok: true,
      value: { events: [{ type: 'concern-reminder', concern: { id: later.value.id } }] },
    })

    await expect(ctx.mindGardenReflection.updateConcern(agent, {
      id: later.value.id,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      content: 'stale',
      observedLocalDate: '2026-08-18',
    })).resolves.toMatchObject({ ok: false, error: { code: 'concern-version-conflict' } })
    vi.setSystemTime(30_000)
    const updated = await ctx.mindGardenReflection.updateConcern(agent, {
      id: later.value.id,
      ifVersion: later.value.version,
      content: 'Prepare one honest opening sentence.',
      observedLocalDate: '2026-08-18',
      reminder: stamp('2026-08-19'),
    })
    if (!updated.ok) throw new Error('concern update failed')
    expect(updated.value).toMatchObject({ content: 'Prepare one honest opening sentence.', updatedAt: 30_000 })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-20' })).resolves.toMatchObject({
      ok: true, value: { events: [] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-19' })).resolves.toMatchObject({
      ok: true, value: { events: [{ type: 'concern-reminder' }] },
    })

    const completed = await ctx.mindGardenReflection.completeConcern(agent, {
      id: updated.value.id,
      ifVersion: updated.value.version,
    })
    if (!completed.ok) throw new Error('concern completion failed')
    expect(completed.value).toMatchObject({ status: 'completed', reminder: null })
    await expect(ctx.mindGardenReflection.completeConcern(agent, {
      id: completed.value.id,
      ifVersion: updated.value.version,
    })).resolves.toMatchObject({ ok: true, value: { id: completed.value.id, status: 'completed' } })
    await expect(ctx.mindGardenReflection.updateConcern(agent, {
      id: completed.value.id,
      ifVersion: completed.value.version,
      content: 'closed',
      observedLocalDate: '2026-08-18',
    })).resolves.toMatchObject({ ok: false, error: { code: 'concern-closed' } })
    await expect(ctx.mindGardenReflection.listConcerns(agent, {})).resolves.toMatchObject({
      ok: true, value: { concerns: [{ id: unscheduled.value.id }] },
    })
    await expect(ctx.mindGardenReflection.listConcerns(agent, { includeClosed: true })).resolves.toMatchObject({
      ok: true, value: { concerns: [{ id: completed.value.id }, { id: unscheduled.value.id }] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-19' })).resolves.toMatchObject({
      ok: true, value: { events: [] },
    })
    await expect(ctx.mindGardenReflection.completeConcern(agent, {
      id: '10000000-0000-4000-8000-000000000001' as never,
      ifVersion: completed.value.version,
    })).resolves.toMatchObject({ ok: false, error: { code: 'concern-not-found' } })
    vi.setSystemTime(40_000)
    await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'), content: 'First same-day reminder.', reminder: stamp('2026-08-21'),
    })
    await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'), content: 'Second same-day reminder.', reminder: stamp('2026-08-21'),
    })
    await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'), content: 'Later reminder.', reminder: stamp('2026-08-22'),
    })
    await expect(ctx.mindGardenReflection.listConcerns(agent, {})).resolves.toMatchObject({
      ok: true, value: { concerns: [{ reminder: { localDate: '2026-08-21' } }, { reminder: { localDate: '2026-08-21' } }] },
    })
    await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-22'), mood: 0, energy: 3, emotionWords: [], phase: 'standalone',
    })
    await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-22'), mood: 0, energy: 3, emotionWords: [], phase: 'standalone',
    })
    await ctx.mindGardenReflection.month(agent, { month: '2026-08' })
    await ctx.fiber.dispose()
  })

  it('converts concerns idempotently and keeps them outside context unless the journal is authorized', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(40_000)
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('concern-conversion')
    const created = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'),
      content: 'Write about the boundary I avoided naming.',
      reminder: stamp('2026-08-19'),
    })
    if (!created.ok) throw new Error('concern creation failed')
    vi.setSystemTime(50_000)
    const converted = await ctx.mindGardenReflection.convertConcern(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      stamp: stamp('2026-08-20'),
      allowRetrieval: true,
    })
    if (!converted.ok) throw new Error('concern conversion failed')
    expect(converted.value).toMatchObject({
      concern: { status: 'converted', reminder: null },
      journal: { title: '', body: 'Write about the boundary I avoided naming.', allowRetrieval: true },
    })
    expect(converted.value.concern.convertedJournalId).toBe(converted.value.journal.id)
    await expect(ctx.mindGardenReflection.convertConcern(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      stamp: stamp('2026-08-21'),
      allowRetrieval: false,
    })).resolves.toMatchObject({
      ok: true,
      value: { concern: { id: converted.value.concern.id }, journal: { id: converted.value.journal.id } },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-19' })).resolves.toMatchObject({
      ok: true, value: { events: [] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-20' })).resolves.toMatchObject({
      ok: true, value: { events: [{ type: 'journal', id: converted.value.journal.id }] },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-20', query: '',
    })).resolves.toMatchObject({
      ok: true, value: { retrievableJournals: [{ id: converted.value.journal.id }] },
    })

    const completed = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'), content: 'Already resolved.',
    })
    if (!completed.ok) throw new Error('second concern creation failed')
    const closed = await ctx.mindGardenReflection.completeConcern(agent, {
      id: completed.value.id, ifVersion: completed.value.version,
    })
    if (!closed.ok) throw new Error('second concern completion failed')
    await expect(ctx.mindGardenReflection.convertConcern(agent, {
      id: closed.value.id,
      ifVersion: closed.value.version,
      stamp: stamp('2026-08-20'),
      allowRetrieval: false,
    })).resolves.toMatchObject({ ok: false, error: { code: 'concern-closed' } })
    vi.setSystemTime(60_000)
    const rollback = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-20'), content: 'Clock rollback conversion.',
    })
    if (!rollback.ok) throw new Error('clock rollback concern creation failed')
    vi.setSystemTime(55_000)
    await expect(ctx.mindGardenReflection.convertConcern(agent, {
      id: rollback.value.id,
      ifVersion: rollback.value.version,
      stamp: stamp('2026-08-20'),
      allowRetrieval: false,
    })).resolves.toMatchObject({ ok: true, value: { journal: { createdAt: 60_000 } } })
    await ctx.mindGardenReflection.deleteJournal(agent, {
      id: converted.value.journal.id,
      ifVersion: converted.value.journal.version,
    })
    await expect(ctx.mindGardenReflection.convertConcern(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      stamp: stamp('2026-08-21'),
      allowRetrieval: false,
    })).resolves.toMatchObject({ ok: false, error: { code: 'journal-not-found' } })
    await ctx.fiber.dispose()
  })

  it('repairs an interrupted concern conversion and rejects a conflicting recovery target', async () => {
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('concern-recovery')
    const plan = {
      journalId: '20000000-0000-4000-8000-000000000002',
      journalVersion: '30000000-0000-4000-8000-000000000003',
      finalConcernVersion: '40000000-0000-4000-8000-000000000004',
      stamp: stamp('2026-08-20'),
      allowRetrieval: false,
      createdAt: 200,
    }
    const interrupted = storedConcernSchema.parse({
      recordType: 'concern',
      formatVersion: 1,
      id: '10000000-0000-4000-8000-000000000001',
      version: '50000000-0000-4000-8000-000000000005',
      content: 'Recovered private thought.',
      status: 'converting',
      createdStamp: stamp('2026-08-18'),
      reminder: null,
      convertedJournalId: null,
      conversion: plan,
      sourceSessionId: agent.session.id,
      createdAt: 100,
      updatedAt: 200,
    })
    await ctx.mindGardenVault.put(
      'reflections', MindGardenVaultRecordId(interrupted.id), interrupted,
    )
    await expect(ctx.mindGardenReflection.listConcerns(agent, { includeClosed: true })).resolves.toMatchObject({
      ok: true,
      value: { concerns: [{ status: 'converted', convertedJournalId: plan.journalId }] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-20' })).resolves.toMatchObject({
      ok: true, value: { events: [{ type: 'journal', body: 'Recovered private thought.' }] },
    })
    const landedPlan = {
      ...plan,
      journalId: '80000000-0000-4000-8000-000000000008',
      journalVersion: '90000000-0000-4000-8000-000000000009',
      finalConcernVersion: 'a0000000-0000-4000-8000-00000000000a',
      createdAt: 300,
    }
    const journalLanded = storedConcernSchema.parse({
      ...interrupted,
      id: 'b0000000-0000-4000-8000-00000000000b',
      version: 'c0000000-0000-4000-8000-00000000000c',
      content: 'Journal landed before the final concern write.',
      conversion: landedPlan,
      updatedAt: 300,
    })
    await ctx.mindGardenVault.put(
      'reflections', MindGardenVaultRecordId(journalLanded.id), journalLanded,
    )
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId(landedPlan.journalId), {
      recordType: 'journal',
      formatVersion: 1,
      id: landedPlan.journalId,
      version: landedPlan.journalVersion,
      stamp: landedPlan.stamp,
      title: '',
      body: journalLanded.content,
      allowRetrieval: landedPlan.allowRetrieval,
      sourceSessionId: journalLanded.sourceSessionId,
      createdAt: landedPlan.createdAt,
      updatedAt: landedPlan.createdAt,
    } as never)
    await expect(ctx.mindGardenReflection.listConcerns(agent, { includeClosed: true })).resolves.toMatchObject({
      ok: true,
      value: { concerns: [{ convertedJournalId: landedPlan.journalId }, { convertedJournalId: plan.journalId }] },
    })
    await ctx.fiber.dispose()

    const conflicting = await harness()
    const otherAgent = conflicting.makeAgent('concern-recovery-conflict')
    const otherPlan = { ...plan, journalId: '60000000-0000-4000-8000-000000000006' }
    const otherConcern = storedConcernSchema.parse({
      ...interrupted,
      id: '70000000-0000-4000-8000-000000000007',
      conversion: otherPlan,
      sourceSessionId: otherAgent.session.id,
    })
    await conflicting.ctx.mindGardenVault.put(
      'reflections', MindGardenVaultRecordId(otherConcern.id), otherConcern,
    )
    await conflicting.ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId(otherPlan.journalId), {
      recordType: 'checkin',
      formatVersion: 1,
      id: otherPlan.journalId,
      stamp: otherPlan.stamp,
      mood: 0,
      energy: 3,
      emotionWords: [],
      phase: 'standalone',
      sourceSessionId: otherAgent.session.id,
      createdAt: otherPlan.createdAt,
    } as never)
    await expect(conflicting.ctx.mindGardenReflection.listConcerns(otherAgent, {})).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await conflicting.ctx.fiber.dispose()
  })

  it('only proposes contemplation drafts from completed idle serenity Sessions', async () => {
    const { ctx, makeAgent } = await harness()
    const empty = makeAgent('contemplation-empty')
    await expect(ctx.mindGardenReflection.createContemplation(empty, { markdown: 'A draft.' }))
      .resolves.toEqual({
        ok: false,
        error: { code: 'contemplation-source-unavailable', reason: 'no-completed-turn' },
      })
    empty.session.append('turn/start', { turn: 1 })
    empty.session.append('turn/end', { turn: 1, reason: { kind: 'blocked' } })
    await expect(ctx.mindGardenReflection.createContemplation(empty, { markdown: 'A draft.' }))
      .resolves.toMatchObject({ error: { reason: 'no-completed-turn' } })

    const running = makeAgent('contemplation-running', activeState(), 'running')
    completeTurn(running)
    await expect(ctx.mindGardenReflection.createContemplation(running, { markdown: 'A draft.' }))
      .resolves.toMatchObject({ error: { reason: 'agent-running' } })

    const clarity = makeAgent('contemplation-clarity', { ...activeState(), mode: 'clarity' })
    completeTurn(clarity)
    await expect(ctx.mindGardenReflection.createContemplation(clarity, { markdown: 'A draft.' }))
      .resolves.toMatchObject({ error: { reason: 'mode-unavailable' } })
    await ctx.fiber.dispose()
  })

  it('keeps contemplation drafts encrypted, confirmation-gated, bounded, and outside model context', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(100)
    const { ctx, pool, makeAgent } = await harness({
      maxContemplationBytes: 64,
      maxContemplationsPerList: 2,
    })
    const firstAgent = makeAgent('contemplation-first')
    completeTurn(firstAgent)
    const first = await ctx.mindGardenReflection.createContemplation(firstAgent, {
      markdown: '  ## What stayed with me\n\nA private insight.  ',
    })
    expect(first).toMatchObject({
      ok: true,
      value: {
        type: 'contemplation',
        markdown: '## What stayed with me\n\nA private insight.',
        status: 'draft',
        confirmedAt: null,
      },
    })
    if (!first.ok) throw new Error('contemplation creation failed')
    await expect(ctx.mindGardenReflection.createContemplation(firstAgent, { markdown: 'Ignored retry.' }))
      .resolves.toEqual(first)
    expect(JSON.stringify(pool.media.get('mind_garden_vault'))).not.toContain('private insight')

    await expect(ctx.mindGardenReflection.updateContemplation(firstAgent, {
      id: first.value.id,
      ifVersion: '00000000-0000-4000-8000-000000000000' as never,
      markdown: 'Edited insight.',
    })).resolves.toMatchObject({ error: { code: 'contemplation-version-conflict' } })
    vi.setSystemTime(200)
    const updated = await ctx.mindGardenReflection.updateContemplation(firstAgent, {
      id: first.value.id,
      ifVersion: first.value.version,
      markdown: 'Edited insight.',
    })
    if (!updated.ok) throw new Error('contemplation update failed')
    await expect(ctx.mindGardenReflection.confirmContemplation(firstAgent, {
      id: updated.value.id,
      ifVersion: first.value.version,
    })).resolves.toMatchObject({ error: { code: 'contemplation-version-conflict' } })
    vi.setSystemTime(300)
    const confirmed = await ctx.mindGardenReflection.confirmContemplation(firstAgent, {
      id: updated.value.id,
      ifVersion: updated.value.version,
    })
    expect(confirmed).toMatchObject({
      ok: true,
      value: { status: 'confirmed', confirmedAt: 300, updatedAt: 300 },
    })
    if (!confirmed.ok) throw new Error('contemplation confirmation failed')
    await expect(ctx.mindGardenReflection.updateContemplation(firstAgent, {
      id: confirmed.value.id,
      ifVersion: confirmed.value.version,
      markdown: 'Too late.',
    })).resolves.toMatchObject({ error: { code: 'contemplation-locked', current: { status: 'confirmed' } } })
    await expect(ctx.mindGardenReflection.confirmContemplation(firstAgent, {
      id: confirmed.value.id,
      ifVersion: confirmed.value.version,
    })).resolves.toMatchObject({ error: { code: 'contemplation-locked' } })

    vi.setSystemTime(400)
    const secondAgent = makeAgent('contemplation-second')
    completeTurn(secondAgent)
    const second = await ctx.mindGardenReflection.createContemplation(secondAgent, { markdown: 'Second draft.' })
    if (!second.ok) throw new Error('second contemplation creation failed')
    vi.setSystemTime(400)
    const thirdAgent = makeAgent('contemplation-third')
    completeTurn(thirdAgent)
    const third = await ctx.mindGardenReflection.createContemplation(thirdAgent, { markdown: 'Third draft.' })
    if (!third.ok) throw new Error('third contemplation creation failed')
    const newest = [second.value, third.value].sort((left, right) => right.id.localeCompare(left.id))
    await expect(ctx.mindGardenReflection.listContemplations(firstAgent, {})).resolves.toMatchObject({
      ok: true,
      value: { contemplations: [{ id: newest[0]?.id }, { id: newest[1]?.id }] },
    })
    await expect(ctx.mindGardenReflection.listContemplations(firstAgent, {
      sourceSessionId: firstAgent.session.id,
      limit: 1,
    })).resolves.toMatchObject({ value: { contemplations: [{ id: first.value.id }] } })
    await expect(ctx.mindGardenReflection.day(firstAgent, { localDate: '2026-08-18' }))
      .resolves.toEqual({ ok: true, value: { date: '2026-08-18', events: [] } })
    await expect(ctx.mindGardenReflection.authorizedContext(firstAgent, {
      localDate: '2026-08-18', query: 'insight',
    })).resolves.toEqual({
      ok: true,
      value: { todayCheckin: null, retrievableJournals: [] },
    })

    await expect(ctx.mindGardenReflection.deleteContemplation(firstAgent, {
      id: confirmed.value.id,
      ifVersion: updated.value.version,
    })).resolves.toMatchObject({ error: { code: 'contemplation-version-conflict' } })
    await expect(ctx.mindGardenReflection.deleteContemplation(firstAgent, {
      id: confirmed.value.id,
      ifVersion: confirmed.value.version,
    })).resolves.toEqual({ ok: true, value: { absent: true } })
    await expect(ctx.mindGardenReflection.deleteContemplation(firstAgent, {
      id: confirmed.value.id,
      ifVersion: confirmed.value.version,
    })).resolves.toEqual({ ok: true, value: { absent: true } })
    const recreated = await ctx.mindGardenReflection.createContemplation(firstAgent, { markdown: 'Fresh draft.' })
    expect(recreated).toMatchObject({ ok: true, value: { status: 'draft', markdown: 'Fresh draft.' } })

    const missingId = '10000000-0000-4000-8000-000000000001' as never
    await expect(ctx.mindGardenReflection.updateContemplation(firstAgent, {
      id: missingId, ifVersion: confirmed.value.version, markdown: 'Missing.',
    })).resolves.toMatchObject({ error: { code: 'contemplation-not-found' } })
    await expect(ctx.mindGardenReflection.confirmContemplation(firstAgent, {
      id: missingId, ifVersion: confirmed.value.version,
    })).resolves.toMatchObject({ error: { code: 'contemplation-not-found' } })
    await ctx.fiber.dispose()
  })

  it('rejects malformed contemplation input and duplicate per-Session records', async () => {
    const { ctx, makeAgent } = await harness({
      maxContemplationBytes: 4,
      maxContemplationsPerList: 2,
    })
    const agent = makeAgent('contemplation-validation')
    completeTurn(agent)
    await expect(ctx.mindGardenReflection.createContemplation(agent, { markdown: ' ' }))
      .resolves.toMatchObject({ error: { field: 'markdown', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.createContemplation(agent, { markdown: '12345' }))
      .resolves.toMatchObject({ error: { field: 'markdown', reason: 'too-large', maxBytes: 4 } })
    await expect(ctx.mindGardenReflection.listContemplations(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listContemplations(agent, { limit: 3 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listContemplations(agent, { sourceSessionId: ' ' as never }))
      .resolves.toMatchObject({ error: { field: 'sourceSessionId', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.listContemplations(agent, {
      sourceSessionId: 'x'.repeat(1025) as never,
    })).resolves.toMatchObject({ error: { field: 'sourceSessionId', reason: 'too-large', maxBytes: 1024 } })

    const common = {
      recordType: 'contemplation' as const,
      formatVersion: 1 as const,
      version: '30000000-0000-4000-8000-000000000003',
      markdown: 'note',
      status: 'draft' as const,
      sourceSessionId: agent.session.id,
      createdAt: 1,
      updatedAt: 1,
      confirmedAt: null,
    }
    const first = storedContemplationSchema.parse({
      ...common, id: '40000000-0000-4000-8000-000000000004',
    })
    const second = storedContemplationSchema.parse({
      ...common,
      id: '50000000-0000-4000-8000-000000000005',
      version: '60000000-0000-4000-8000-000000000006',
    })
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId(first.id), first)
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId(second.id), second)
    await expect(ctx.mindGardenReflection.listContemplations(agent, {})).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.fiber.dispose()
  })

  it('keeps principle proposals inert until explicit acceptance and preserves every adopted revision', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    const { ctx, pool, makeAgent } = await harness()
    const agent = makeAgent('principle-lifecycle')
    const source = await createConfirmedContemplation(
      ctx,
      agent,
      '# Contemplation\n\nI can begin with one honest sentence.',
    )
    vi.setSystemTime(20_000)
    const proposed = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: source.id,
      content: principleContent({
        supportingExperiences: [
          { summary: 'The meeting on Tuesday.', sourceContemplationId: source.id },
          { summary: 'A later conversation.' },
        ],
      }),
    })
    if (!proposed.ok) throw new Error('principle proposal failed')
    expect(proposed.value).toMatchObject({ status: 'proposed', targetPrincipleId: null, resultingPrincipleId: null })
    expect(JSON.stringify(pool.media.get('mind_garden_vault'))).not.toContain('one honest sentence')
    await expect(ctx.mindGardenReflection.listPrinciples(agent, {})).resolves.toEqual({
      ok: true, value: { principles: [] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: true, value: { date: '2026-08-18', events: [] },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-18', query: 'honest sentence',
    })).resolves.toEqual({ ok: true, value: { todayCheckin: null, retrievableJournals: [] } })
    await expect(ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: proposed.value.id,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      stamp: stamp('2026-08-18'),
    })).resolves.toMatchObject({ error: { code: 'principle-proposal-version-conflict' } })

    vi.setSystemTime(30_000)
    const accepted = await ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: proposed.value.id,
      ifVersion: proposed.value.version,
      stamp: stamp('2026-08-18'),
    })
    if (!accepted.ok) throw new Error('principle acceptance failed')
    expect(accepted.value).toMatchObject({ status: 'trying', versions: [{ number: 1, sourceProposalId: proposed.value.id }] })
    await expect(ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: proposed.value.id,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      stamp: stamp('2026-08-30'),
    })).resolves.toEqual(accepted)
    await expect(ctx.mindGardenReflection.listPrincipleProposals(agent, {})).resolves.toEqual({
      ok: true, value: { proposals: [] },
    })
    await expect(ctx.mindGardenReflection.listPrincipleProposals(agent, { includeClosed: true })).resolves.toMatchObject({
      ok: true,
      value: { proposals: [{ status: 'accepted', resultingPrincipleId: accepted.value.id }] },
    })

    await expect(ctx.mindGardenReflection.revisePrinciple(agent, {
      id: accepted.value.id,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      stamp: stamp('2026-08-19'),
      content: principleContent(),
    })).resolves.toMatchObject({ error: { code: 'principle-version-conflict' } })
    vi.setSystemTime(40_000)
    const revised = await ctx.mindGardenReflection.revisePrinciple(agent, {
      id: accepted.value.id,
      ifVersion: accepted.value.version,
      stamp: stamp('2026-08-19'),
      content: principleContent({
        expression: 'Ask one honest question before offering a solution.',
        status: 'questioning',
      }),
    })
    if (!revised.ok) throw new Error('principle revision failed')
    expect(revised.value).toMatchObject({ status: 'questioning', versions: [{ number: 1 }, { number: 2 }] })

    const staleTarget = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: source.id,
      target: { id: revised.value.id, ifVersion: revised.value.version },
      content: principleContent({ status: 'adopted' }),
    })
    if (!staleTarget.ok) throw new Error('targeted principle proposal failed')
    const intervening = await ctx.mindGardenReflection.revisePrinciple(agent, {
      id: revised.value.id,
      ifVersion: revised.value.version,
      stamp: stamp('2026-08-20'),
      content: principleContent({ status: 'trying' }),
    })
    if (!intervening.ok) throw new Error('intervening principle revision failed')
    await expect(ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: staleTarget.value.id,
      ifVersion: staleTarget.value.version,
      stamp: stamp('2026-08-20'),
    })).resolves.toMatchObject({ error: { code: 'principle-version-conflict', current: { versions: [{}, {}, {}] } } })

    const currentTarget = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: source.id,
      target: { id: intervening.value.id, ifVersion: intervening.value.version },
      content: principleContent({ status: 'adopted' }),
    })
    if (!currentTarget.ok) throw new Error('current targeted proposal failed')
    const adopted = await ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: currentTarget.value.id,
      ifVersion: currentTarget.value.version,
      stamp: stamp('2026-08-20'),
    })
    if (!adopted.ok) throw new Error('targeted proposal acceptance failed')
    expect(adopted.value).toMatchObject({ id: accepted.value.id, status: 'adopted', versions: [{}, {}, {}, { number: 4 }] })

    const rejectedProposal = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: source.id,
      content: principleContent({ expression: 'A proposal to reject.' }),
    })
    if (!rejectedProposal.ok) throw new Error('rejectable proposal failed')
    await expect(ctx.mindGardenReflection.rejectPrincipleProposal(agent, {
      id: rejectedProposal.value.id,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
    })).resolves.toMatchObject({ error: { code: 'principle-proposal-version-conflict' } })
    const rejectedProposalResult = await ctx.mindGardenReflection.rejectPrincipleProposal(agent, {
      id: rejectedProposal.value.id,
      ifVersion: rejectedProposal.value.version,
    })
    if (!rejectedProposalResult.ok) throw new Error('principle rejection failed')
    expect(rejectedProposalResult.value.status).toBe('rejected')
    await expect(ctx.mindGardenReflection.rejectPrincipleProposal(agent, {
      id: rejectedProposal.value.id,
      ifVersion: rejectedProposal.value.version,
    })).resolves.toEqual(rejectedProposalResult)
    await expect(ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: rejectedProposal.value.id,
      ifVersion: rejectedProposalResult.value.version,
      stamp: stamp('2026-08-21'),
    })).resolves.toMatchObject({ error: { code: 'principle-proposal-closed', current: { status: 'rejected' } } })
    await expect(ctx.mindGardenReflection.rejectPrincipleProposal(agent, {
      id: proposed.value.id,
      ifVersion: proposed.value.version,
    })).resolves.toMatchObject({ error: { code: 'principle-proposal-closed', current: { status: 'accepted' } } })
    await expect(ctx.mindGardenReflection.listPrincipleProposals(agent, { includeClosed: true }))
      .resolves.toMatchObject({ ok: true, value: { proposals: [{}, {}, {}, {}] } })

    await expect(ctx.mindGardenReflection.month(agent, { month: '2026-08' })).resolves.toMatchObject({
      ok: true,
      value: { days: [
        { date: '2026-08-18', eventCount: 1, principleCount: 1 },
        { date: '2026-08-19', eventCount: 1, principleCount: 1 },
        { date: '2026-08-20', eventCount: 2, principleCount: 2 },
      ] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-20' })).resolves.toMatchObject({
      ok: true, value: { events: [{ type: 'principle', version: { number: 3 } }, { type: 'principle', version: { number: 4 } }] },
    })

    const secondProposal = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: source.id,
      content: principleContent({ expression: 'A separate retired principle.', status: 'retired' }),
    })
    if (!secondProposal.ok) throw new Error('second principle proposal failed')
    const secondPrinciple = await ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: secondProposal.value.id,
      ifVersion: secondProposal.value.version,
      stamp: stamp('2026-08-22'),
    })
    if (!secondPrinciple.ok) throw new Error('second principle acceptance failed')
    await expect(ctx.mindGardenReflection.listPrinciples(agent, { includeRetired: true }))
      .resolves.toMatchObject({ ok: true, value: { principles: [{}, {}] } })

    vi.setSystemTime(50_000)
    const retired = await ctx.mindGardenReflection.revisePrinciple(agent, {
      id: adopted.value.id,
      ifVersion: adopted.value.version,
      stamp: stamp('2026-08-21'),
      content: principleContent({ status: 'retired' }),
    })
    if (!retired.ok) throw new Error('principle retirement failed')
    await expect(ctx.mindGardenReflection.listPrinciples(agent, {})).resolves.toEqual({
      ok: true, value: { principles: [] },
    })
    await expect(ctx.mindGardenReflection.listPrinciples(agent, { includeRetired: true, limit: 1 }))
      .resolves.toMatchObject({ ok: true, value: { principles: [{ id: retired.value.id, versions: [{}, {}, {}, {}, {}] }] } })
    await ctx.fiber.dispose()
  })

  it('rejects principle histories whose acceptance evidence cannot be recovered', async () => {
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('principle-corruption')
    const content = principleContent()
    const corrupt = storedPrincipleSchema.parse({
      recordType: 'principle',
      formatVersion: 1,
      id: '10000000-0000-4000-8000-000000000001',
      version: '20000000-0000-4000-8000-000000000002',
      status: content.status,
      current: content,
      versions: [{
        number: 1,
        content,
        sourceProposalId: '30000000-0000-4000-8000-000000000003',
        sourceContemplationId: '40000000-0000-4000-8000-000000000004',
        stamp: stamp('2026-08-18'),
        createdAt: 1,
      }],
      createdAt: 1,
      updatedAt: 1,
    })
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId(corrupt.id), corrupt)
    await expect(ctx.mindGardenReflection.listPrinciples(agent, {})).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.fiber.dispose()
  })

  it('validates principle evidence, bounded content, targets, lists, and history limits', async () => {
    const { ctx, makeAgent } = await harness({
      maxPrincipleFieldBytes: 4,
      maxPrincipleItems: 2,
      maxPrincipleVersions: 2,
      maxPrincipleProposalsPerList: 1,
      maxPrinciplesPerList: 1,
    })
    const agent = makeAgent('principle-validation')
    completeTurn(agent)
    const draft = await ctx.mindGardenReflection.createContemplation(agent, { markdown: 'I ok' })
    if (!draft.ok) throw new Error('validation draft failed')
    const missingId = '10000000-0000-4000-8000-000000000001' as never
    const shortContent = principleContent({
      expression: 'act', formationContext: '', userQuote: 'I', counterexample: '',
      appliesTo: [], notAppliesTo: [], lastChallenged: '',
    })
    await expect(ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: missingId, content: shortContent,
    })).resolves.toMatchObject({ error: { code: 'principle-source-invalid', reason: 'contemplation-not-found' } })
    await expect(ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: draft.value.id, content: shortContent,
    })).resolves.toMatchObject({ error: { code: 'principle-source-invalid', reason: 'not-confirmed' } })
    const confirmed = await ctx.mindGardenReflection.confirmContemplation(agent, {
      id: draft.value.id, ifVersion: draft.value.version,
    })
    if (!confirmed.ok) throw new Error('validation confirmation failed')
    await expect(ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: confirmed.value.id, content: { ...shortContent, userQuote: 'no' },
    })).resolves.toMatchObject({ error: { code: 'principle-source-invalid', reason: 'quote-not-found' } })

    const invalidCases: Array<[Partial<MindGardenPrincipleContent>, string, string]> = [
      [{ expression: ' ' }, 'expression', 'blank'],
      [{ formationContext: '12345' }, 'formationContext', 'too-large'],
      [{ userQuote: '12345' }, 'userQuote', 'too-large'],
      [{ supportingExperiences: [{ summary: ' ' }] }, 'supportingExperiences', 'blank'],
      [{ supportingExperiences: [{ summary: '12345' }] }, 'supportingExperiences', 'too-large'],
      [{ supportingExperiences: [{ summary: 'a' }, { summary: 'b' }, { summary: 'c' }] }, 'supportingExperiences', 'too-many'],
      [{ supportingExperiences: [{ summary: 'a' }, { summary: 'a' }] }, 'supportingExperiences', 'duplicate'],
      [{ counterexample: '12345' }, 'counterexample', 'too-large'],
      [{ appliesTo: [' '] }, 'appliesTo', 'blank'],
      [{ appliesTo: ['a', 'b', 'c'] }, 'appliesTo', 'too-many'],
      [{ appliesTo: ['a', 'a'] }, 'appliesTo', 'duplicate'],
      [{ notAppliesTo: ['12345'] }, 'notAppliesTo', 'too-large'],
      [{ lastChallenged: '12345' }, 'lastChallenged', 'too-large'],
    ]
    for (const [override, field, reason] of invalidCases) {
      await expect(ctx.mindGardenReflection.proposePrinciple(agent, {
        sourceContemplationId: confirmed.value.id,
        content: { ...shortContent, ...override },
      })).resolves.toMatchObject({ error: { field, reason } })
    }
    await expect(ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: confirmed.value.id,
      target: { id: missingId, ifVersion: missingId },
      content: shortContent,
    })).resolves.toMatchObject({ error: { code: 'principle-not-found' } })
    const proposed = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: confirmed.value.id, content: shortContent,
    })
    if (!proposed.ok) throw new Error('bounded proposal failed')
    await expect(ctx.mindGardenReflection.listPrincipleProposals(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listPrincipleProposals(agent, { limit: 2 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: missingId, ifVersion: missingId, stamp: stamp('2026-08-18'),
    })).resolves.toMatchObject({ error: { code: 'principle-proposal-not-found' } })
    await expect(ctx.mindGardenReflection.rejectPrincipleProposal(agent, {
      id: missingId, ifVersion: missingId,
    })).resolves.toMatchObject({ error: { code: 'principle-proposal-not-found' } })
    const accepted = await ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: proposed.value.id, ifVersion: proposed.value.version, stamp: stamp('2026-08-18'),
    })
    if (!accepted.ok) throw new Error('bounded principle acceptance failed')
    await expect(ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: confirmed.value.id,
      target: { id: accepted.value.id, ifVersion: missingId },
      content: shortContent,
    })).resolves.toMatchObject({ error: { code: 'principle-version-conflict' } })
    await expect(ctx.mindGardenReflection.revisePrinciple(agent, {
      id: missingId, ifVersion: missingId, stamp: stamp('2026-08-19'), content: shortContent,
    })).resolves.toMatchObject({ error: { code: 'principle-not-found' } })
    const revised = await ctx.mindGardenReflection.revisePrinciple(agent, {
      id: accepted.value.id, ifVersion: accepted.value.version, stamp: stamp('2026-08-19'), content: shortContent,
    })
    if (!revised.ok) throw new Error('bounded revision failed')
    await expect(ctx.mindGardenReflection.revisePrinciple(agent, {
      id: revised.value.id, ifVersion: revised.value.version, stamp: stamp('2026-08-20'), content: shortContent,
    })).resolves.toMatchObject({ error: { code: 'principle-version-limit', maxVersions: 2 } })
    const targetProposal = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: confirmed.value.id,
      target: { id: revised.value.id, ifVersion: revised.value.version },
      content: shortContent,
    })
    if (!targetProposal.ok) throw new Error('capacity proposal failed')
    await expect(ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: targetProposal.value.id, ifVersion: targetProposal.value.version, stamp: stamp('2026-08-20'),
    })).resolves.toMatchObject({ error: { code: 'principle-version-limit', maxVersions: 2 } })
    await expect(ctx.mindGardenReflection.listPrinciples(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listPrinciples(agent, { limit: 2 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await ctx.fiber.dispose()
  })

  it('governs small reality experiments without scoring and preserves every observation', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    const { ctx, pool, makeAgent } = await harness()
    const agent = makeAgent('experiment-lifecycle')
    const evidence = createUserMessage({
      content: [
        { type: 'reasoning', text: 'This block is not admissible as evidence.' },
        { type: 'text', text: 'After tense meetings, I want to try one quiet five-minute walk.' },
      ],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', evidence, { surfaceOp: 'append' })
    const created = await ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-18'),
      title: '  Five-minute walk  ',
      hypothesis: 'A short transition may make the next choice easier.',
      action: 'Walk quietly for five minutes after one tense meeting.',
      reviewStamp: stamp('2026-08-20'),
      source: { messageId: evidence.id, evidenceQuote: 'I want to try one quiet five-minute walk' },
    })
    if (!created.ok) throw new Error('experiment creation failed')
    expect(created.value).toMatchObject({
      title: 'Five-minute walk',
      status: 'proposed',
      sourceMessageId: evidence.id,
      observations: [],
    })
    expect(JSON.stringify(pool.media.get('mind_garden_vault'))).not.toContain('Five-minute walk')
    await expect(ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-18'),
      title: 'Retry',
      action: 'Retry action.',
      source: { messageId: evidence.id, evidenceQuote: 'one quiet five-minute walk' },
    })).resolves.toEqual(created)
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-20' })).resolves.toMatchObject({
      ok: true,
      value: { events: [{ type: 'experiment-review', experiment: { status: 'proposed' } }] },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-18', query: 'walk',
    })).resolves.toEqual({ ok: true, value: { todayCheckin: null, retrievableJournals: [] } })

    await expect(ctx.mindGardenReflection.startExperiment(agent, {
      id: created.value.id,
      ifVersion: '20000000-0000-4000-8000-000000000002' as never,
      observedLocalDate: '2026-08-18',
    })).resolves.toMatchObject({ error: { code: 'experiment-version-conflict' } })
    vi.setSystemTime(20_000)
    const trying = await ctx.mindGardenReflection.startExperiment(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      observedLocalDate: '2026-08-18',
    })
    if (!trying.ok) throw new Error('experiment start failed')
    expect(trying.value).toMatchObject({ status: 'trying', startedAt: 20_000 })
    await expect(ctx.mindGardenReflection.startExperiment(agent, {
      id: trying.value.id,
      ifVersion: created.value.version,
      observedLocalDate: '2026-08-18',
    })).resolves.toEqual(trying)

    const scheduled = await ctx.mindGardenReflection.scheduleExperiment(agent, {
      id: trying.value.id,
      ifVersion: trying.value.version,
      observedLocalDate: '2026-08-18',
      reviewStamp: stamp('2026-08-21'),
    })
    if (!scheduled.ok) throw new Error('experiment schedule failed')
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-20' }))
      .resolves.toMatchObject({ ok: true, value: { events: [] } })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-21' }))
      .resolves.toMatchObject({ ok: true, value: { events: [{ type: 'experiment-review' }] } })

    vi.setSystemTime(30_000)
    const observed = await ctx.mindGardenReflection.observeExperiment(agent, {
      id: scheduled.value.id,
      ifVersion: scheduled.value.version,
      stamp: stamp('2026-08-19'),
      happened: 'The meeting ended with my shoulders tight.',
      action: 'I walked without checking my phone.',
      observation: 'The tension was still present, but the next decision felt less urgent.',
      mood: 2,
      energy: 3,
    })
    if (!observed.ok) throw new Error('experiment observation failed')
    expect(observed.value).toMatchObject({
      status: 'observed',
      reviewStamp: null,
      result: 'The tension was still present, but the next decision felt less urgent.',
      observations: [{ mood: 2, energy: 3 }],
    })
    await expect(ctx.mindGardenReflection.startExperiment(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      observedLocalDate: '2026-08-19',
    })).resolves.toMatchObject({ error: { code: 'experiment-state-conflict', current: { status: 'observed' } } })

    vi.setSystemTime(40_000)
    const observedAgain = await ctx.mindGardenReflection.observeExperiment(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      stamp: stamp('2026-08-20'),
      observation: 'On a calmer day, the walk mainly marked a clean transition.',
    })
    if (!observedAgain.ok) throw new Error('second experiment observation failed')
    expect(observedAgain.value.observations).toHaveLength(2)
    const revised = await ctx.mindGardenReflection.reviseExperiment(agent, {
      id: observedAgain.value.id,
      ifVersion: observedAgain.value.version,
      observedLocalDate: '2026-08-20',
      result: 'The effect varies, but the transition itself is useful.',
      judgment: 'Keep the walk optional and shorten it when energy is low.',
      reviewStamp: stamp('2026-08-22'),
    })
    if (!revised.ok) throw new Error('experiment revision failed')
    expect(revised.value).toMatchObject({ status: 'revised', observations: [{}, {}] })
    await expect(ctx.mindGardenReflection.month(agent, { month: '2026-08' })).resolves.toMatchObject({
      ok: true,
      value: { days: [
        { date: '2026-08-19', experimentCount: 1 },
        { date: '2026-08-20', experimentCount: 1 },
        { date: '2026-08-22', experimentCount: 1 },
      ] },
    })

    const restarted = await ctx.mindGardenReflection.startExperiment(agent, {
      id: revised.value.id,
      ifVersion: revised.value.version,
      observedLocalDate: '2026-08-20',
    })
    if (!restarted.ok) throw new Error('experiment restart failed')
    const thirdObservation = await ctx.mindGardenReflection.observeExperiment(agent, {
      id: restarted.value.id,
      ifVersion: restarted.value.version,
      stamp: stamp('2026-08-21'),
      observation: 'Two minutes was enough today.',
    })
    if (!thirdObservation.ok) throw new Error('third experiment observation failed')
    expect(thirdObservation.value.observations).toHaveLength(3)
    vi.setSystemTime(50_000)
    const stopped = await ctx.mindGardenReflection.stopExperiment(agent, {
      id: thirdObservation.value.id,
      ifVersion: thirdObservation.value.version,
    })
    if (!stopped.ok) throw new Error('experiment stop failed')
    expect(stopped.value).toMatchObject({ status: 'stopped', reviewStamp: null, stoppedAt: 50_000 })
    await expect(ctx.mindGardenReflection.stopExperiment(agent, {
      id: stopped.value.id,
      ifVersion: thirdObservation.value.version,
    })).resolves.toEqual(stopped)
    await expect(ctx.mindGardenReflection.listExperiments(agent, {})).resolves.toEqual({
      ok: true, value: { experiments: [] },
    })
    await expect(ctx.mindGardenReflection.listExperiments(agent, { includeStopped: true }))
      .resolves.toMatchObject({ ok: true, value: { experiments: [{ id: stopped.value.id, observations: [{}, {}, {}] }] } })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-21' })).resolves.toMatchObject({
      ok: true,
      value: { events: [{ type: 'experiment-observation', experimentId: stopped.value.id }] },
    })
    vi.setSystemTime(60_000)
    const older = await ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-23'), title: 'Older proposal', action: 'Pause once.',
    })
    if (!older.ok) throw new Error('older proposal failed')
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-23' })).resolves.toMatchObject({
      ok: true,
      value: { events: [{ type: 'experiment-review', experiment: { id: older.value.id } }] },
    })
    vi.setSystemTime(70_000)
    const newer = await ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-24'), title: 'Newer proposal', action: 'Notice once.',
    })
    const tied = await ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-24'), title: 'Tied proposal', action: 'Breathe once.',
    })
    if (!newer.ok || !tied.ok) throw new Error('sortable proposals failed')
    const sorted = await ctx.mindGardenReflection.listExperiments(agent, { includeStopped: true })
    if (!sorted.ok) throw new Error('sorted experiment list failed')
    expect(sorted.value.experiments.map(experiment => experiment.status))
      .toEqual(['proposed', 'proposed', 'proposed', 'stopped'])
    expect(sorted.value.experiments.slice(0, 2).map(experiment => experiment.updatedAt))
      .toEqual([70_000, 70_000])
    await ctx.fiber.dispose()
  })

  it('validates experiment evidence, transitions, review dates, text, lists, and observation bounds', async () => {
    const { ctx, makeAgent } = await harness({
      maxExperimentFieldBytes: 4,
      maxExperimentObservations: 1,
      maxExperimentsPerList: 1,
    })
    const agent = makeAgent('experiment-validation')
    const evidence = createUserMessage({
      content: [{ type: 'text', text: 'I try.' }],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', evidence, { surfaceOp: 'append' })
    const missingMessageId = '10000000-0000-4000-8000-000000000001' as never
    await expect(ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-18'),
      title: 'walk',
      action: 'walk',
      source: { messageId: missingMessageId, evidenceQuote: 'I' },
    })).resolves.toMatchObject({ error: { code: 'experiment-source-invalid', reason: 'message-not-found' } })
    await expect(ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-18'),
      title: 'walk',
      action: 'walk',
      source: { messageId: evidence.id, evidenceQuote: 'no' },
    })).resolves.toMatchObject({ error: { code: 'experiment-source-invalid', reason: 'quote-not-found' } })
    const invalidCreates: Array<[Record<string, unknown>, string, string]> = [
      [{ title: ' ' }, 'experimentTitle', 'blank'],
      [{ title: '12345' }, 'experimentTitle', 'too-large'],
      [{ hypothesis: '12345' }, 'hypothesis', 'too-large'],
      [{ action: ' ' }, 'action', 'blank'],
      [{ action: '12345' }, 'action', 'too-large'],
      [{ source: { messageId: evidence.id, evidenceQuote: ' ' } }, 'evidenceQuote', 'blank'],
    ]
    for (const [override, field, reason] of invalidCreates) {
      await expect(ctx.mindGardenReflection.createExperiment(agent, {
        stamp: stamp('2026-08-18'), title: 'walk', action: 'walk', ...override,
      })).resolves.toMatchObject({ error: { field, reason } })
    }
    await expect(ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-18'), title: 'walk', action: 'walk', reviewStamp: stamp('2026-08-17'),
    })).resolves.toMatchObject({ error: { field: 'reviewDate', reason: 'past' } })

    const created = await ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-18'), title: 'walk', action: 'walk',
    })
    if (!created.ok) throw new Error('validation experiment failed')
    const missingId = missingMessageId
    await expect(ctx.mindGardenReflection.startExperiment(agent, {
      id: missingId, ifVersion: missingId, observedLocalDate: '2026-08-18',
    })).resolves.toMatchObject({ error: { code: 'experiment-not-found' } })
    await expect(ctx.mindGardenReflection.observeExperiment(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      stamp: stamp('2026-08-18'),
      observation: 'okay',
    })).resolves.toMatchObject({ error: { code: 'experiment-state-conflict' } })
    await expect(ctx.mindGardenReflection.reviseExperiment(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      observedLocalDate: '2026-08-18',
      judgment: 'okay',
    })).resolves.toMatchObject({ error: { code: 'experiment-state-conflict' } })
    const trying = await ctx.mindGardenReflection.startExperiment(agent, {
      id: created.value.id, ifVersion: created.value.version, observedLocalDate: '2026-08-18', reviewStamp: null,
    })
    if (!trying.ok) throw new Error('validation experiment start failed')
    await expect(ctx.mindGardenReflection.scheduleExperiment(agent, {
      id: trying.value.id,
      ifVersion: trying.value.version,
      observedLocalDate: '2026-08-18',
      reviewStamp: stamp('2026-08-17'),
    })).resolves.toMatchObject({ error: { field: 'reviewDate', reason: 'past' } })
    for (const [payload, field, reason] of [
      [{ observation: ' ' }, 'observation', 'blank'],
      [{ observation: '12345' }, 'observation', 'too-large'],
      [{ observation: '无' }, 'observation', 'placeholder'],
      [{ observation: 'okay', happened: '12345' }, 'happened', 'too-large'],
      [{ observation: 'okay', action: '12345' }, 'action', 'too-large'],
    ] as const) {
      await expect(ctx.mindGardenReflection.observeExperiment(agent, {
        id: trying.value.id,
        ifVersion: trying.value.version,
        stamp: stamp('2026-08-18'),
        ...payload,
      })).resolves.toMatchObject({ error: { field, reason } })
    }
    const observed = await ctx.mindGardenReflection.observeExperiment(agent, {
      id: trying.value.id,
      ifVersion: trying.value.version,
      stamp: stamp('2026-08-18'),
      observation: 'okay',
    })
    if (!observed.ok) throw new Error('validation observation failed')
    await expect(ctx.mindGardenReflection.observeExperiment(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      stamp: stamp('2026-08-19'),
      observation: 'more',
    })).resolves.toMatchObject({ error: { code: 'experiment-observation-limit', maxObservations: 1 } })
    await expect(ctx.mindGardenReflection.reviseExperiment(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      observedLocalDate: '2026-08-18',
      judgment: ' ',
    })).resolves.toMatchObject({ error: { field: 'judgment', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.reviseExperiment(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      observedLocalDate: '2026-08-18',
      judgment: 'okay',
      result: '12345',
    })).resolves.toMatchObject({ error: { field: 'result', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.listExperiments(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listExperiments(agent, { limit: 2 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    const stopped = await ctx.mindGardenReflection.stopExperiment(agent, {
      id: observed.value.id, ifVersion: observed.value.version,
    })
    if (!stopped.ok) throw new Error('validation experiment stop failed')
    await expect(ctx.mindGardenReflection.scheduleExperiment(agent, {
      id: stopped.value.id,
      ifVersion: stopped.value.version,
      observedLocalDate: '2026-08-18',
      reviewStamp: null,
    })).resolves.toMatchObject({ error: { code: 'experiment-state-conflict' } })
    await expect(ctx.mindGardenReflection.stopExperiment(agent, {
      id: missingId, ifVersion: missingId,
    })).resolves.toMatchObject({ error: { code: 'experiment-not-found' } })
    await ctx.fiber.dispose()
  })

  it('keeps open questions encrypted, source-grounded, explicitly contextual, and lifecycle-complete', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    const { ctx, pool, makeAgent } = await harness({ maxContextOpenQuestions: 2 })
    const agent = makeAgent('open-question-lifecycle')
    const evidence = createUserMessage({
      content: [
        { type: 'reasoning', text: 'Reasoning is not admissible evidence.' },
        { type: 'text', text: 'I still do not know whether this collaboration is reciprocal.' },
      ],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', evidence, { surfaceOp: 'append' })
    const sessionEventCount = agent.session.events.length
    const messageQuestion = await ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'),
      question: '  Which interactions show that both of us are choosing to continue?  ',
      source: {
        kind: 'message',
        messageId: evidence.id,
        evidenceQuote: 'whether this collaboration is reciprocal',
      },
    })
    if (!messageQuestion.ok) throw new Error('message open question failed')
    expect(messageQuestion.value).toMatchObject({
      question: 'Which interactions show that both of us are choosing to continue?',
      status: 'open',
      source: { kind: 'message', messageId: evidence.id },
      transitions: [{ status: 'open', stamp: { localDate: '2026-08-18' }, createdAt: 10_000 }],
    })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'),
      question: 'A different retry should not duplicate exact evidence.',
      source: { kind: 'message', messageId: evidence.id, evidenceQuote: 'collaboration is reciprocal' },
    })).resolves.toEqual(messageQuestion)

    vi.setSystemTime(20_000)
    const journal = await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-19'),
      title: 'After the meeting',
      body: 'I noticed that I filled every silence before the other person could respond.',
      allowRetrieval: false,
    })
    if (!journal.ok) throw new Error('open question journal failed')
    const journalQuestion = await ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-19'),
      question: 'What happens if I leave one silence unfilled?',
      source: {
        kind: 'journal',
        journalId: journal.value.id,
        ifVersion: journal.value.version,
        evidenceQuote: 'I filled every silence',
      },
    })
    if (!journalQuestion.ok) throw new Error('journal open question failed')
    expect(journalQuestion.value.source).toMatchObject({ kind: 'journal', state: 'current' })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-19'),
      question: 'A retry must retain the original journal-grounded question.',
      source: {
        kind: 'journal',
        journalId: journal.value.id,
        ifVersion: journal.value.version,
        evidenceQuote: 'filled every silence',
      },
    })).resolves.toEqual(journalQuestion)
    vi.setSystemTime(21_000)
    const direct = await ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-20'),
      question: 'What evidence would genuinely change my mind?',
    })
    if (!direct.ok) throw new Error('direct open question failed')
    expect(JSON.stringify(pool.media.get('mind_garden_vault'))).not.toContain('What evidence would genuinely change')
    expect(agent.session.events).toHaveLength(sessionEventCount)

    await expect(ctx.mindGardenReflection.listOpenQuestions(agent, {})).resolves.toMatchObject({
      ok: true,
      value: { questions: [
        { id: messageQuestion.value.id },
        { id: journalQuestion.value.id },
        { id: direct.value.id },
      ] },
    })
    await expect(ctx.mindGardenReflection.openQuestionContext(agent, {})).resolves.toEqual({
      ok: true,
      value: { openQuestions: [
        {
          id: messageQuestion.value.id,
          question: messageQuestion.value.question,
          createdLocalDate: '2026-08-18',
          evidenceQuote: 'whether this collaboration is reciprocal',
        },
        {
          id: journalQuestion.value.id,
          question: journalQuestion.value.question,
          createdLocalDate: '2026-08-19',
          evidenceQuote: 'I filled every silence',
        },
      ] },
    })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-20', query: 'change my mind',
    })).resolves.toEqual({ ok: true, value: { todayCheckin: null, retrievableJournals: [] } })

    const tied = await ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-09-01'),
      question: 'Which equal-time question sorts deterministically?',
    })
    if (!tied.ok) throw new Error('tied open question failed')
    const tiedList = await ctx.mindGardenReflection.listOpenQuestions(agent, {})
    if (!tiedList.ok) throw new Error('tied open question list failed')
    expect(tiedList.value.questions
      .filter(question => question.createdAt === 21_000)
      .map(question => question.id))
      .toEqual([direct.value.id, tied.value.id].sort())
    const editedTied = await ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: tied.value.id,
      ifVersion: tied.value.version,
      stamp: stamp('2026-09-01'),
      question: 'Which equal-time question remains deterministic after an edit?',
      status: 'open',
    })
    if (!editedTied.ok) throw new Error('same-state open question edit failed')

    vi.setSystemTime(30_000)
    const resolved = await ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: messageQuestion.value.id,
      ifVersion: messageQuestion.value.version,
      stamp: stamp('2026-08-21'),
      question: messageQuestion.value.question,
      status: 'resolved',
    })
    if (!resolved.ok) throw new Error('open question resolution failed')
    expect(resolved.value).toMatchObject({ status: 'resolved', transitions: [{}, { status: 'resolved' }] })
    await expect(ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: resolved.value.id,
      ifVersion: messageQuestion.value.version,
      stamp: stamp('2026-08-21'),
      question: resolved.value.question,
      status: 'resolved',
    })).resolves.toEqual(resolved)
    await expect(ctx.mindGardenReflection.openQuestionContext(agent, { limit: 1 })).resolves.toMatchObject({
      ok: true, value: { openQuestions: [{ id: journalQuestion.value.id }] },
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-21' })).resolves.toMatchObject({
      ok: true,
      value: { events: [{
        type: 'open-question',
        openQuestionId: resolved.value.id,
        transition: { status: 'resolved' },
      }] },
    })
    await expect(ctx.mindGardenReflection.month(agent, { month: '2026-08' })).resolves.toMatchObject({
      ok: true,
      value: { days: [
        { date: '2026-08-18', openQuestionCount: 1 },
        { date: '2026-08-19', openQuestionCount: 1 },
        { date: '2026-08-20', openQuestionCount: 1 },
        { date: '2026-08-21', openQuestionCount: 1 },
      ] },
    })
    const material = await ctx.mindGardenReflection.periodReviewMaterial(agent, {
      periodType: 'week', startStamp: stamp('2026-08-18'), endStamp: stamp('2026-08-21'),
    })
    if (!material.ok) throw new Error('open question period material failed')
    expect(material.value.sources.some(source => source.sourceType === 'open-question')).toBe(true)
    expect(material.value.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: 'focus', text: 'open' }),
      expect.objectContaining({ category: 'changes', text: 'resolved' }),
    ]))

    const dismissed = await ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: direct.value.id,
      ifVersion: direct.value.version,
      stamp: stamp('2026-08-22'),
      question: direct.value.question,
      status: 'dismissed',
    })
    if (!dismissed.ok) throw new Error('open question dismissal failed')

    const changedJournal = await ctx.mindGardenReflection.updateJournal(agent, {
      id: journal.value.id,
      ifVersion: journal.value.version,
      title: journal.value.title,
      body: `${journal.value.body} I waited once.`,
      allowRetrieval: false,
    })
    if (!changedJournal.ok) throw new Error('open question journal change failed')
    const changedSources = await ctx.mindGardenReflection.listOpenQuestions(agent, { includeClosed: true })
    if (!changedSources.ok) throw new Error('changed open question source list failed')
    expect(changedSources.value.questions.find(question => question.id === journalQuestion.value.id)?.source)
      .toMatchObject({ state: 'changed' })
    await ctx.mindGardenReflection.deleteJournal(agent, {
      id: changedJournal.value.id, ifVersion: changedJournal.value.version,
    })
    const missingSources = await ctx.mindGardenReflection.listOpenQuestions(agent, { includeClosed: true })
    if (!missingSources.ok) throw new Error('missing open question source list failed')
    expect(missingSources.value.questions.find(question => question.id === journalQuestion.value.id)?.source)
      .toMatchObject({ state: 'missing' })
    await ctx.fiber.dispose()
  })

  it('rejects invalid open-question evidence, fields, versions, lists, and transition capacity', async () => {
    const { ctx, makeAgent } = await harness({
      maxOpenQuestionBytes: 4,
      maxOpenQuestionTransitions: 1,
      maxOpenQuestionsPerList: 1,
      maxContextOpenQuestions: 1,
    })
    const agent = makeAgent('open-question-validation')
    const evidence = createUserMessage({
      content: [
        { type: 'reasoning', text: 'only' },
        { type: 'text', text: 'real text' },
      ],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', evidence, { surfaceOp: 'append' })
    const missingId = '10000000-0000-4000-8000-000000000001' as never
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: 'ask',
      source: { kind: 'message', messageId: missingId, evidenceQuote: 'real' },
    })).resolves.toMatchObject({ error: { code: 'open-question-source-invalid', reason: 'message-not-found' } })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: 'ask',
      source: { kind: 'message', messageId: evidence.id, evidenceQuote: 'only' },
    })).resolves.toMatchObject({ error: { code: 'open-question-source-invalid', reason: 'quote-not-found' } })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: ' ',
    })).resolves.toMatchObject({ error: { field: 'openQuestion', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: '12345',
    })).resolves.toMatchObject({ error: { field: 'openQuestion', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: 'ask',
      source: { kind: 'message', messageId: evidence.id, evidenceQuote: '12345' },
    })).resolves.toMatchObject({ error: { field: 'evidenceQuote', reason: 'too-large' } })

    const journal = await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18'), body: 'real', allowRetrieval: false,
    })
    if (!journal.ok) throw new Error('validation source journal failed')
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: 'ask',
      source: { kind: 'journal', journalId: missingId, ifVersion: missingId, evidenceQuote: 'real' },
    })).resolves.toMatchObject({ error: { code: 'open-question-source-invalid', reason: 'journal-not-found' } })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: 'ask',
      source: { kind: 'journal', journalId: journal.value.id, ifVersion: missingId, evidenceQuote: 'real' },
    })).resolves.toMatchObject({ error: { code: 'open-question-source-invalid', reason: 'journal-version-conflict' } })
    await expect(ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: 'ask',
      source: {
        kind: 'journal', journalId: journal.value.id, ifVersion: journal.value.version, evidenceQuote: 'no',
      },
    })).resolves.toMatchObject({ error: { code: 'open-question-source-invalid', reason: 'quote-not-found' } })

    const created = await ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'), question: 'ask',
    })
    if (!created.ok) throw new Error('validation open question failed')
    await expect(ctx.mindGardenReflection.openQuestionContext(agent, { limit: 1 })).resolves.toEqual({
      ok: true,
      value: { openQuestions: [{
        id: created.value.id,
        question: 'ask',
        createdLocalDate: '2026-08-18',
        evidenceQuote: '',
      }] },
    })
    await expect(ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: missingId, ifVersion: missingId, stamp: stamp('2026-08-19'), question: 'ask', status: 'open',
    })).resolves.toMatchObject({ error: { code: 'open-question-not-found' } })
    await expect(ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: created.value.id, ifVersion: missingId, stamp: stamp('2026-08-19'), question: 'edit', status: 'open',
    })).resolves.toMatchObject({ error: { code: 'open-question-version-conflict' } })
    await expect(ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      stamp: stamp('2026-08-19'),
      question: 'ask',
      status: 'invalid' as never,
    })).resolves.toMatchObject({ error: { field: 'openQuestionStatus', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.updateOpenQuestion(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      stamp: stamp('2026-08-19'),
      question: 'ask',
      status: 'resolved',
    })).resolves.toMatchObject({ error: { code: 'open-question-transition-limit', maxTransitions: 1 } })
    await expect(ctx.mindGardenReflection.listOpenQuestions(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listOpenQuestions(agent, { limit: 2 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.openQuestionContext(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.openQuestionContext(agent, { limit: 2 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    const sourced = await ctx.mindGardenReflection.createOpenQuestion(agent, {
      stamp: stamp('2026-08-18'),
      question: 'real',
      source: { kind: 'message', messageId: evidence.id, evidenceQuote: 'real' },
    })
    if (!sourced.ok) throw new Error('duplicate-source setup failed')
    const duplicateId = '30000000-0000-4000-8000-000000000003'
    await ctx.mindGardenVault.put(
      'reflections',
      MindGardenVaultRecordId(duplicateId),
      storedOpenQuestionSchema.parse({
        recordType: 'open-question',
        formatVersion: 1,
        id: duplicateId,
        version: '40000000-0000-4000-8000-000000000004',
        question: 'copy',
        status: 'open',
        source: { kind: 'message', messageId: evidence.id, evidenceQuote: 'real' },
        transitions: [{
          id: '50000000-0000-4000-8000-000000000005',
          status: 'open',
          stamp: stamp('2026-08-18'),
          createdAt: sourced.value.createdAt,
        }],
        createdStamp: stamp('2026-08-18'),
        sourceSessionId: agent.session.id,
        createdAt: sourced.value.createdAt,
        updatedAt: sourced.value.createdAt,
      }),
    )
    await expect(ctx.mindGardenReflection.listOpenQuestions(agent, {})).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.fiber.dispose()
  })

  it('builds source-bound period reviews and derives stale provenance without model or Session leakage', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.parse('2026-08-18T00:00:00.000Z'))
    const { ctx, pool, makeAgent } = await harness()
    const agent = makeAgent('period-review-lifecycle')
    await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-16'), mood: 0, energy: 3, emotionWords: ['steadier'], phase: 'standalone',
    })
    await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-16'), mood: 1, energy: 4, emotionWords: [], phase: 'standalone',
    })
    await ctx.mindGardenReflection.createCheckin(agent, {
      stamp: stamp('2026-08-16'), mood: 1, energy: 4, emotionWords: ['lighter'], phase: 'standalone',
    })
    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-15'), body: 'Outside this review range.', allowRetrieval: false,
    })
    const journal = await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-17'),
      title: 'A little more room',
      body: 'I paused before answering and noticed that the choice did not disappear.',
      allowRetrieval: false,
    })
    if (!journal.ok) throw new Error('period review journal failed')
    const concern = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'), content: 'How can I keep the pause gentle rather than turning it into another rule?',
    })
    if (!concern.ok) throw new Error('period review concern failed')
    const completedConcern = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18'), content: 'A concern that is already complete.',
    })
    if (!completedConcern.ok) throw new Error('completed concern setup failed')
    await ctx.mindGardenReflection.completeConcern(agent, {
      id: completedConcern.value.id, ifVersion: completedConcern.value.version,
    })
    const confirmed = await createConfirmedContemplation(
      ctx,
      agent,
      '# A pause can be a choice\n\nI do not have to turn every pause into a final answer.',
    )
    const draftAgent = makeAgent('period-review-draft')
    completeTurn(draftAgent)
    await ctx.mindGardenReflection.createContemplation(draftAgent, { markdown: 'Unconfirmed material.' })
    const proposed = await ctx.mindGardenReflection.proposePrinciple(agent, {
      sourceContemplationId: confirmed.id,
      content: principleContent({
        expression: 'Leave a little room before saying yes.',
        userQuote: 'I do not have to turn every pause into a final answer.',
        supportingExperiences: [{ summary: 'One pause made a difficult answer feel more deliberate.' }],
      }),
    })
    if (!proposed.ok) throw new Error('period review principle proposal failed')
    const principle = await ctx.mindGardenReflection.acceptPrincipleProposal(agent, {
      id: proposed.value.id,
      ifVersion: proposed.value.version,
      stamp: stamp('2026-08-18'),
    })
    if (!principle.ok) throw new Error('period review principle acceptance failed')
    await ctx.mindGardenReflection.revisePrinciple(agent, {
      id: principle.value.id,
      ifVersion: principle.value.version,
      stamp: stamp('2026-08-19'),
      content: principleContent({
        expression: 'Leave room before a consequential yes.',
        userQuote: 'The pause matters most when the choice has weight.',
      }),
    })
    const experiment = await ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-18'), title: 'One quiet pause', action: 'Wait for one breath before answering.',
    })
    if (!experiment.ok) throw new Error('period review experiment failed')
    const trying = await ctx.mindGardenReflection.startExperiment(agent, {
      id: experiment.value.id,
      ifVersion: experiment.value.version,
      observedLocalDate: '2026-08-18',
    })
    if (!trying.ok) throw new Error('period review experiment start failed')
    const observed = await ctx.mindGardenReflection.observeExperiment(agent, {
      id: trying.value.id,
      ifVersion: trying.value.version,
      stamp: stamp('2026-08-19'),
      happened: 'A request arrived late in the day.',
      action: 'I waited for one breath.',
      observation: 'I could hear my own uncertainty before replying.',
    })
    if (!observed.ok) throw new Error('period review observation failed')
    vi.setSystemTime(Date.parse('2026-08-20T00:00:00.000Z'))
    await ctx.mindGardenReflection.reviseExperiment(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      observedLocalDate: '2026-08-20',
      judgment: 'Keep this as an option, not a performance target.',
    })
    await ctx.mindGardenReflection.createExperiment(agent, {
      stamp: stamp('2026-08-20'), title: 'Still proposed', action: 'Notice one transition.',
    })

    const range = {
      periodType: 'week' as const,
      startStamp: stamp('2026-08-16'),
      endStamp: stamp('2026-08-22'),
    }
    const sessionEventCount = agent.session.events.length
    const material = await ctx.mindGardenReflection.periodReviewMaterial(agent, range)
    if (!material.ok) throw new Error('period review material failed')
    expect(new Set(material.value.sources.map(source => source.sourceType)))
      .toEqual(new Set(['checkin', 'journal', 'concern', 'contemplation', 'principle', 'experiment']))
    expect(new Set(material.value.items.map(item => item.category)))
      .toEqual(new Set(['events', 'ongoing', 'focus', 'changes', 'experiments']))
    expect(material.value.items.some(item => item.text === 'Unconfirmed material.')).toBe(false)
    expect(material.value.items.some(item => item.text === 'A concern that is already complete.')).toBe(false)
    expect(agent.session.events).toHaveLength(sessionEventCount)

    const created = await ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: material.value.materialHash,
      sourceIds: material.value.sources.map(source => source.id),
      content: '# Weekly reflection\n\n## What repeated\n\nA small pause created more room for choice.',
    })
    if (!created.ok) throw new Error('period review creation failed')
    expect(created.value).toMatchObject({ status: 'proposed', stale: false })
    expect(created.value.sources).toHaveLength(material.value.sources.length)
    expect(JSON.stringify(pool.media.get('mind_garden_vault'))).not.toContain('Weekly reflection')
    expect(agent.session.events).toHaveLength(sessionEventCount)
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-22' }))
      .resolves.not.toMatchObject({ value: { events: [{ type: 'period-review' }] } })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-20', query: 'pause',
    })).resolves.toEqual({ ok: true, value: { todayCheckin: null, retrievableJournals: [] } })

    const saved = await ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: created.value.id,
      ifVersion: created.value.version,
      content: `${created.value.content}\n\n## Next focus\n\nNotice when a pause feels supportive.`,
      status: 'saved',
    })
    if (!saved.ok) throw new Error('period review save failed')
    const changedJournal = await ctx.mindGardenReflection.updateJournal(agent, {
      id: journal.value.id,
      ifVersion: journal.value.version,
      title: journal.value.title,
      body: `${journal.value.body} I also noticed less urgency.`,
      allowRetrieval: false,
    })
    if (!changedJournal.ok) throw new Error('period review source revision failed')
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, { periodType: 'week' }))
      .resolves.toMatchObject({
        ok: true,
        value: { reviews: [{ id: saved.value.id, stale: true, staleSources: [{ id: journal.value.id, reason: 'changed' }] }] },
      })
    await ctx.mindGardenReflection.deleteJournal(agent, {
      id: changedJournal.value.id, ifVersion: changedJournal.value.version,
    })
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, {})).resolves.toMatchObject({
      ok: true,
      value: { reviews: [{ stale: true, staleSources: [{ id: journal.value.id, reason: 'missing' }] }] },
    })
    const archived = await ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: saved.value.id,
      ifVersion: saved.value.version,
      content: saved.value.content,
      status: 'archived',
    })
    if (!archived.ok) throw new Error('period review archive failed')
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, {}))
      .resolves.toEqual({ ok: true, value: { reviews: [] } })
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, { includeArchived: true }))
      .resolves.toMatchObject({ ok: true, value: { reviews: [{ id: archived.value.id, status: 'archived' }] } })
    await ctx.fiber.dispose()
  })

  it('rejects invalid period ranges, stale material, uncited sources, visible ids, and stale versions', async () => {
    const { ctx, makeAgent } = await harness({
      maxPeriodReviewContentBytes: 64,
      maxPeriodReviewSources: 2,
      maxPeriodReviewsPerList: 1,
    })
    const agent = makeAgent('period-review-validation')
    const range = {
      periodType: 'week' as const,
      startStamp: stamp('2026-08-18'),
      endStamp: stamp('2026-08-20'),
    }
    await expect(ctx.mindGardenReflection.periodReviewMaterial(agent, {
      ...range, periodType: 'quarter' as never,
    })).resolves.toMatchObject({ error: { field: 'periodType', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.periodReviewMaterial(agent, {
      ...range, startStamp: stamp('2026-08-21'),
    })).resolves.toMatchObject({ error: { field: 'periodEnd', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.periodReviewMaterial(agent, {
      ...range, endStamp: stamp('2026-08-20', { timeZone: 'UTC', utcOffsetMinutes: 0 }),
    })).resolves.toMatchObject({ error: { field: 'timeZone', reason: 'invalid' } })
    const empty = await ctx.mindGardenReflection.periodReviewMaterial(agent, range)
    if (!empty.ok) throw new Error('empty period material failed')
    expect(empty.value).toMatchObject({ sources: [], items: [] })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range, materialHash: empty.value.materialHash, sourceIds: [], content: 'review',
    })).resolves.toMatchObject({ error: { code: 'period-review-source-required' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: empty.value.materialHash,
      sourceIds: ['10000000-0000-4000-8000-000000000001' as never],
      content: 'review',
    })).resolves.toMatchObject({ error: { code: 'period-review-source-required' } })
    const first = await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18'), body: 'one', allowRetrieval: false,
    })
    if (!first.ok) throw new Error('first validation journal failed')
    const material = await ctx.mindGardenReflection.periodReviewMaterial(agent, range)
    if (!material.ok) throw new Error('validation material failed')
    const firstSourceId = material.value.sources[0]?.id
    if (firstSourceId === undefined) throw new Error('validation source missing')
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range, materialHash: 'bad', sourceIds: [firstSourceId], content: 'review',
    })).resolves.toMatchObject({ error: { field: 'materialHash', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range, materialHash: material.value.materialHash, sourceIds: [firstSourceId], content: 'x'.repeat(65),
    })).resolves.toMatchObject({ error: { field: 'periodReviewContent', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range, materialHash: material.value.materialHash, sourceIds: [firstSourceId], content: ' ',
    })).resolves.toMatchObject({ error: { field: 'periodReviewContent', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: material.value.materialHash,
      sourceIds: [firstSourceId, firstSourceId],
      content: 'review',
    })).resolves.toMatchObject({ error: { field: 'sourceIds', reason: 'duplicate' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: material.value.materialHash,
      sourceIds: [firstSourceId, firstSourceId, firstSourceId],
      content: 'review',
    })).resolves.toMatchObject({ error: { field: 'sourceIds', reason: 'too-many' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: material.value.materialHash,
      sourceIds: ['10000000-0000-4000-8000-000000000001' as never],
      content: 'review',
    })).resolves.toMatchObject({ error: { code: 'period-review-source-invalid', reason: 'unknown' } })
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: material.value.materialHash,
      sourceIds: [firstSourceId],
      content: firstSourceId,
    })).resolves.toMatchObject({ error: { field: 'periodReviewContent', reason: 'source-visible' } })
    const updated = await ctx.mindGardenReflection.updateJournal(agent, {
      id: first.value.id,
      ifVersion: first.value.version,
      body: 'two',
      allowRetrieval: false,
    })
    if (!updated.ok) throw new Error('material conflict setup failed')
    await expect(ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: material.value.materialHash,
      sourceIds: [firstSourceId],
      content: 'review',
    })).resolves.toMatchObject({ error: { code: 'period-review-material-conflict' } })
    const currentMaterial = await ctx.mindGardenReflection.periodReviewMaterial(agent, range)
    if (!currentMaterial.ok) throw new Error('current validation material failed')
    const review = await ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: currentMaterial.value.materialHash,
      sourceIds: currentMaterial.value.sources.map(source => source.id),
      content: 'review',
    })
    if (!review.ok) throw new Error('validation review failed')
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    await ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: currentMaterial.value.materialHash,
      sourceIds: currentMaterial.value.sources.map(source => source.id),
      content: 'second',
    })
    await ctx.mindGardenReflection.createPeriodReview(agent, {
      ...range,
      materialHash: currentMaterial.value.materialHash,
      sourceIds: currentMaterial.value.sources.map(source => source.id),
      content: 'third',
    })
    const shorterRange = { ...range, endStamp: stamp('2026-08-19') }
    const shorterMaterial = await ctx.mindGardenReflection.periodReviewMaterial(agent, shorterRange)
    if (!shorterMaterial.ok) throw new Error('shorter material failed')
    await ctx.mindGardenReflection.createPeriodReview(agent, {
      ...shorterRange,
      materialHash: shorterMaterial.value.materialHash,
      sourceIds: shorterMaterial.value.sources.map(source => source.id),
      content: 'shorter',
    })
    vi.useRealTimers()
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, { limit: 1 }))
      .resolves.toMatchObject({ ok: true, value: { reviews: [{}] } })
    const missingId = '10000000-0000-4000-8000-000000000001' as never
    await expect(ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: missingId, ifVersion: missingId, content: 'review', status: 'saved',
    })).resolves.toMatchObject({ error: { code: 'period-review-not-found' } })
    await expect(ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: review.value.id, ifVersion: missingId, content: 'review', status: 'saved',
    })).resolves.toMatchObject({ error: { code: 'period-review-version-conflict' } })
    await expect(ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: review.value.id, ifVersion: review.value.version, content: 'review', status: 'invalid' as never,
    })).resolves.toMatchObject({ error: { field: 'periodReviewStatus', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: review.value.id, ifVersion: review.value.version, content: firstSourceId, status: 'saved',
    })).resolves.toMatchObject({ error: { field: 'periodReviewContent', reason: 'source-visible' } })
    await expect(ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: review.value.id, ifVersion: review.value.version, content: 'x'.repeat(65), status: 'saved',
    })).resolves.toMatchObject({ error: { field: 'periodReviewContent', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.updatePeriodReview(agent, {
      id: review.value.id, ifVersion: review.value.version, content: ' ', status: 'saved',
    })).resolves.toMatchObject({ error: { field: 'periodReviewContent', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, { periodType: 'quarter' as never }))
      .resolves.toMatchObject({ error: { field: 'periodType', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listPeriodReviews(agent, { limit: 2 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })

    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-19'), body: 'three', allowRetrieval: false,
    })
    await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-20'), body: 'four', allowRetrieval: false,
    })
    await expect(ctx.mindGardenReflection.periodReviewMaterial(agent, range))
      .resolves.toMatchObject({ error: { code: 'period-review-source-limit', sourceCount: 3, maxSources: 2 } })
    await ctx.fiber.dispose()
  })

  it('returns stable validation failures for dates, zones, text, emotion words, and queries', async () => {
    const { ctx, makeAgent } = await harness({
      maxTitleBytes: 3,
      maxBodyBytes: 4,
      maxConcernBytes: 4,
      maxEmotionWordBytes: 3,
      maxTimeZoneBytes: 4,
      maxQueryBytes: 3,
      maxConcernsPerList: 2,
    })
    const agent = makeAgent('validation')
    const checkin = (value: MindGardenCalendarStamp, emotionWords: readonly string[] = []) =>
      ctx.mindGardenReflection.createCheckin(agent, {
        stamp: value, mood: 0, energy: 3, emotionWords, phase: 'standalone',
      })
    await expect(checkin(stamp('2026-2-3'))).resolves.toMatchObject({ error: { field: 'localDate', reason: 'invalid' } })
    await expect(checkin(stamp('2026-02-30'))).resolves.toMatchObject({ error: { field: 'localDate', reason: 'invalid' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: ' ' }))).resolves.toMatchObject({ error: { field: 'timeZone', reason: 'blank' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'Asia/Shanghai' }))).resolves.toMatchObject({ error: { field: 'timeZone', reason: 'too-large', maxBytes: 4 } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'Nope' }))).resolves.toMatchObject({ error: { field: 'timeZone', reason: 'invalid' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'UTC', utcOffsetMinutes: 1.5 }))).resolves.toMatchObject({ error: { field: 'utcOffsetMinutes' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'UTC', utcOffsetMinutes: 841 }))).resolves.toMatchObject({ error: { field: 'utcOffsetMinutes' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'UTC' }), ['a', 'b', 'c', 'd'])).resolves.toMatchObject({ error: { field: 'emotionWords', reason: 'too-many' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'UTC' }), [' '])).resolves.toMatchObject({ error: { field: 'emotionWords', reason: 'blank' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'UTC' }), ['四a'])).resolves.toMatchObject({ error: { field: 'emotionWords', reason: 'too-large' } })
    await expect(checkin(stamp('2026-08-18', { timeZone: 'UTC' }), ['a', 'a'])).resolves.toMatchObject({ error: { field: 'emotionWords', reason: 'duplicate' } })
    await expect(ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18', { timeZone: 'UTC' }), title: 'long', body: 'ok', allowRetrieval: false,
    })).resolves.toMatchObject({ error: { field: 'title', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18', { timeZone: 'UTC' }), body: ' ', allowRetrieval: false,
    })).resolves.toMatchObject({ error: { field: 'body', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18', { timeZone: 'UTC' }), body: '12345', allowRetrieval: false,
    })).resolves.toMatchObject({ error: { field: 'body', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18', { timeZone: 'UTC' }), content: ' ',
    })).resolves.toMatchObject({ error: { field: 'content', reason: 'blank' } })
    await expect(ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18', { timeZone: 'UTC' }), content: '12345',
    })).resolves.toMatchObject({ error: { field: 'content', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18', { timeZone: 'UTC' }),
      content: 'okay',
      reminder: stamp('2026-08-17', { timeZone: 'UTC' }),
    })).resolves.toMatchObject({ error: { field: 'reminderDate', reason: 'past' } })
    const concern = await ctx.mindGardenReflection.createConcern(agent, {
      stamp: stamp('2026-08-18', { timeZone: 'UTC' }), content: 'okay',
    })
    if (!concern.ok) throw new Error('validation concern creation failed')
    await expect(ctx.mindGardenReflection.updateConcern(agent, {
      id: concern.value.id,
      ifVersion: concern.value.version,
      content: 'okay',
      observedLocalDate: '2026-08-17',
    })).resolves.toMatchObject({ error: { field: 'localDate', reason: 'past' } })
    await expect(ctx.mindGardenReflection.convertConcern(agent, {
      id: concern.value.id,
      ifVersion: concern.value.version,
      stamp: stamp('2026-08-17', { timeZone: 'UTC' }),
      allowRetrieval: false,
    })).resolves.toMatchObject({ error: { field: 'localDate', reason: 'past' } })
    await expect(ctx.mindGardenReflection.listConcerns(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.listConcerns(agent, { limit: 3 }))
      .resolves.toMatchObject({ error: { field: 'limit', reason: 'invalid' } })
    await expect(ctx.mindGardenReflection.authorizedContext(agent, {
      localDate: '2026-08-18', query: 'long',
    })).resolves.toMatchObject({ error: { field: 'query', reason: 'too-large' } })
    await expect(ctx.mindGardenReflection.month(agent, { month: '2026-8' })).resolves.toMatchObject({ error: { field: 'month' } })
    await expect(ctx.mindGardenReflection.month(agent, { month: '2026-13' })).resolves.toMatchObject({ error: { field: 'month' } })
    await expect(ctx.mindGardenReflection.trend(agent, { days: 7, endDate: 'invalid' })).resolves.toMatchObject({
      error: { field: 'localDate' },
    })
    await ctx.fiber.dispose()
  })

  it('maps key and authenticated-plaintext failures without leaking private values', async () => {
    const originalKey = createMindGardenDataKey()
    const { ctx, makeAgent } = await harness({}, originalKey)
    const agent = makeAgent('vault-errors')
    const initialized = await ctx.mindGardenReflection.createJournal(agent, {
      stamp: stamp('2026-08-18'), body: 'initialize vault', allowRetrieval: false,
    })
    if (!initialized.ok) throw new Error('vault initialization failed')
    await ctx.credentials.unset('MIND_GARDEN_DATA_KEY' as never)
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'locked' },
    })
    await ctx.credentials.set('MIND_GARDEN_DATA_KEY' as never, 'invalid')
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'invalid-key' },
    })
    await ctx.credentials.set('MIND_GARDEN_DATA_KEY' as never, createMindGardenDataKey())
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'key-mismatch' },
    })
    await ctx.credentials.set('MIND_GARDEN_DATA_KEY' as never, originalKey)
    await ctx.mindGardenReflection.deleteJournal(agent, {
      id: initialized.value.id,
      ifVersion: initialized.value.version,
    })
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId('record-id'), {
      recordType: 'unknown',
    })
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.mindGardenVault.delete('reflections', MindGardenVaultRecordId('record-id'))
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId('wrong-id'), {
      recordType: 'journal',
      formatVersion: 1,
      id: '10000000-0000-4000-8000-000000000001',
      version: '20000000-0000-4000-8000-000000000002',
      stamp: stamp('2026-08-18'),
      title: '',
      body: 'private',
      allowRetrieval: false,
      sourceSessionId: agent.session.id,
      createdAt: 1,
      updatedAt: 1,
    } as never)
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.mindGardenVault.delete('reflections', MindGardenVaultRecordId('wrong-id'))
    const experimentBase = {
      formatVersion: 1 as const,
      version: '20000000-0000-4000-8000-000000000002',
      recordType: 'experiment' as const,
      title: 'private title',
      hypothesis: '',
      action: 'private action',
      reviewStamp: null,
      status: 'proposed' as const,
      result: '',
      judgment: '',
      sourceMessageId: 'message-1',
      evidenceQuote: 'private quote',
      observations: [],
      createdStamp: stamp('2026-08-18'),
      sourceSessionId: agent.session.id,
      createdAt: 1,
      startedAt: null,
      stoppedAt: null,
      updatedAt: 1,
    }
    const firstExperimentId = '30000000-0000-4000-8000-000000000003'
    const secondExperimentId = '40000000-0000-4000-8000-000000000004'
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId(firstExperimentId),
      storedExperimentSchema.parse({ ...experimentBase, id: firstExperimentId }))
    await ctx.mindGardenVault.put('reflections', MindGardenVaultRecordId(secondExperimentId),
      storedExperimentSchema.parse({ ...experimentBase, id: secondExperimentId }))
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.mindGardenVault.delete('reflections', MindGardenVaultRecordId(firstExperimentId))
    await ctx.mindGardenVault.delete('reflections', MindGardenVaultRecordId(secondExperimentId))
    const periodReviewId = '50000000-0000-4000-8000-000000000005'
    await ctx.mindGardenVault.put(
      'reflections',
      MindGardenVaultRecordId(periodReviewId),
      storedPeriodReviewSchema.parse({
        formatVersion: 1,
        id: periodReviewId,
        version: '60000000-0000-4000-8000-000000000006',
        recordType: 'period-review',
        periodType: 'week',
        startStamp: stamp('2026-08-18'),
        endStamp: stamp('2026-08-18'),
        status: 'proposed',
        content: 'private review',
        sources: [{
          id: '70000000-0000-4000-8000-000000000007',
          sourceType: 'checkin',
          fingerprint: 'a'.repeat(64),
          localDates: ['2026-08-18'],
        }],
        sourceHash: '0'.repeat(64),
        sourceSessionId: agent.session.id,
        createdAt: 1,
        updatedAt: 1,
      }),
    )
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.mindGardenVault.delete('reflections', MindGardenVaultRecordId(periodReviewId))
    const entries = vi.spyOn(ctx.mindGardenVault, 'entries')
    entries.mockRejectedValueOnce(new MindGardenVaultError('invalid-record-id', 'safe diagnostic'))
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' })).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    entries.mockRejectedValueOnce(new Error('programming failure'))
    await expect(ctx.mindGardenReflection.day(agent, { localDate: '2026-08-18' }))
      .rejects.toThrow('programming failure')
    await ctx.fiber.dispose()
  })

  it('registers an inert package invariant companion', async () => {
    let installer: InvariantInstaller | undefined
    const disposer = () => {}
    const register = vi.fn((_packageName: string, value: InvariantInstaller) => {
      installer = value
      return disposer
    })
    await expect(invariantApply({ invariants: { register } } as never)).resolves.toBe(disposer)
    expect(register).toHaveBeenCalledWith('@deepseek-ai/dsh-mind-garden/reflection', expect.any(Function))
    if (installer === undefined) throw new Error('invariant installer missing')
    await installer(new Context(), () => { throw new Error('unused') })
  })
})
