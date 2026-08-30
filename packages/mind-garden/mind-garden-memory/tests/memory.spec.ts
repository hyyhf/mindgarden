import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LlmRuntime, {
  createUserMessage,
  LlmAdapter,
  ReasoningEffortId,
  type GenerateOptions,
  type StreamChunk,
} from '@deepseek-ai/dsh-llm'
import SessionStore, { Session, SessionId, type JsonValue } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import MindGardenVault, {
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden/vault'
import MindGardenMemory, {
  storedExtractionRunSchema,
  storedMemorySchema,
  type Config,
  type MindGardenMemoryId,
  type MindGardenMemoryVersion,
} from '@deepseek-ai/dsh-mind-garden/memory'
import AgentRegistry, { agentEvents, assembleContextFor, type Agent, type PreStepDecision } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import MindGardenService from '@deepseek-ai/dsh-mind-garden/core'
import * as mindGardenSafety from '@deepseek-ai/dsh-mind-garden/safety'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden/core'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import {
  MemoryMediaPool,
  MemoryStorageBackend,
} from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'

const harnessContexts = new Set<Context>()

async function storageContext(): Promise<{ ctx: Context; pool: MemoryMediaPool }> {
  const ctx = new Context()
  harnessContexts.add(ctx)
  const pool = new MemoryMediaPool()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(MemoryCredentials)
  return { ctx, pool }
}

function activeState(
  privacy: MindGardenSessionState['privacy'] = 'durable',
  modelDisclosureAccepted = true,
): MindGardenSessionState {
  return {
    revision: 1,
    activatedAt: 1,
    updatedAt: 1,
    mode: 'serenity',
    supportIntent: 'listen',
    privacy,
    contractVersion: 1,
    modelDisclosureAccepted,
  }
}

async function serviceHarness(config: Config = {}) {
  const { ctx, pool } = await storageContext()
  const live = new Map<string, Agent>()
  const states = new WeakMap<Session, MindGardenSessionState | null>()
  ctx.provide('agents', { get: (id: string) => live.get(id) } as never)
  ctx.provide('mindGarden', { current: (session: Session) => states.get(session) ?? null } as never)
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(MindGardenVault)
  await ctx.plugin(MindGardenMemory, config)

  const makeAgent = (id: string, state: MindGardenSessionState | null = activeState()): Agent => {
    const session = Session.create(SessionId(id))
    const agent = {
      id: session.id,
      session,
      options: {},
      status: 'idle',
      runMaintenance: (task: (signal: AbortSignal) => Promise<unknown>) =>
        task(new AbortController().signal),
    } as Agent
    live.set(agent.id, agent)
    states.set(session, state)
    return agent
  }
  return { ctx, pool, makeAgent }
}

async function firePreStep(
  ctx: Context,
  agent: Agent,
  options: {
    readonly step?: number
    readonly signal?: AbortSignal
    readonly state?: PreStepDecision
    readonly text?: string
  } = {},
): Promise<PreStepDecision> {
  const message = createUserMessage({
    content: [{ type: 'text', text: options.text ?? 'How should I handle work today?' }],
    source: { kind: 'user' },
  })
  return await agentEvents(ctx, agent).waterfall(
    'agent/pre-step',
    {
      messages: [message],
      turn: 1,
      step: options.step ?? 1,
      signal: options.signal ?? new AbortController().signal,
    },
    () => Promise.resolve(options.state ?? { kind: 'enter', messages: [message] }),
  )
}

function appendCompletedTurn(agent: Agent, turn: number, text: string, safetyLocal = false): string {
  const message = createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })
  agent.session.append('turn/start', { turn })
  agent.session.append('step/start', { turn, step: 1 })
  agent.session.append('user/message', message, { surfaceOp: 'append' })
  if (safetyLocal) {
    const appendTestEvent = agent.session.append.bind(agent.session) as unknown as (
      type: string,
      data: unknown,
    ) => void
    appendTestEvent('mind-garden/safety-assessment', {
      version: 1,
      turn,
      step: 1,
      inputMessageIds: [message.id],
      assessment: { level: 2 },
      response: 'local',
    })
  }
  agent.session.append('step/end', { turn, step: 1 })
  agent.session.append('turn/end', { turn, reason: { kind: 'completed' } })
  return message.id
}

function emitIdle(ctx: Context, agent: Agent): void {
  agentEvents(ctx, agent).emit('agent/status', { status: 'idle' })
}

afterEach(async () => {
  vi.useRealTimers()
  await Promise.all([...harnessContexts].map(async (ctx) => {
    await ctx.fiber.dispose()
  }))
  harnessContexts.clear()
})

describe('Mind Garden memory service', () => {
  it('requires an activated durable session and validates programmatic config', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    await expect(ctx.mindGardenMemory.list(makeAgent('inactive', null))).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.propose(makeAgent('ephemeral', activeState('ephemeral')), {
      kind: 'fact', content: 'Local only', reason: 'test',
    })).resolves.toMatchObject({ ok: false, error: { code: 'durable-session-required' } })
    await ctx.fiber.dispose()

    expect(() => new MindGardenMemory(new Context(), { maxContentBytes: 0 })).toThrow('maxContentBytes')
    expect(() => new MindGardenMemory(new Context(), { maxInjectedMemories: 1.5 }))
      .toThrow('maxInjectedMemories')
    expect(() => new MindGardenMemory(new Context(), { minExtractionConfidence: Number.NaN }))
      .toThrow('minExtractionConfidence')
    expect(() => new MindGardenMemory(new Context(), { minExtractionConfidence: -0.1 }))
      .toThrow('minExtractionConfidence')
    expect(() => new MindGardenMemory(new Context(), { minExtractionConfidence: 1.1 }))
      .toThrow('minExtractionConfidence')
    expect(() => new MindGardenMemory(new Context(), { extractionProvider: 'mock' }))
      .toThrow('configured together')
    expect(() => new MindGardenMemory(new Context(), { extractionModel: 'mock' }))
      .toThrow('configured together')
    expect(() => new MindGardenMemory(new Context(), { maxExtractionCandidates: 9 }))
      .toThrow('schema limit of 8')
    const custom = await serviceHarness({
      maxContentBytes: 64,
      maxReasonBytes: 32,
      maxScopeBytes: 16,
      maxEvidenceBytes: 16,
      maxInjectedMemories: 2,
      maxInjectedBytes: 256,
      maxAuditEntries: 1,
      maxTemporaryDays: 2,
      maxRevisionsPerMemory: 2,
      maxExtractionCandidates: 2,
      minExtractionConfidence: 0.7,
      maxExtractionInputBytes: 256,
      maxExtractionMemoryBytes: 256,
      maxExtractionOutputTokens: 128,
      extractionProvider: 'mock',
      extractionModel: 'mock',
    })
    await custom.ctx.mindGardenMemory.list(custom.makeAgent('custom-config'))
    await custom.ctx.fiber.dispose()
  })

  it('applies every Remote access gate and rejects non-registry Agent objects', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const inactive = makeAgent('all-access-gates', null)
    const request = { id: '00000000-0000-4000-8000-000000000001' as never, ifVersion: 'v' as never }
    await expect(ctx.mindGardenMemory.confirm(inactive, {
      ...request, recallPolicy: 'never',
    })).resolves.toMatchObject({ ok: false, error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenMemory.update(inactive, request)).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.reject(inactive, request)).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.delete(inactive, request)).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.latestAudit(inactive)).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.resolveRelationship(inactive, {
      ...request, resolution: 'keep-existing',
    })).resolves.toMatchObject({ ok: false, error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenMemory.listRevisions(inactive, { id: request.id })).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.extract(inactive, {})).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.latestExtraction(inactive)).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.automationPolicy(inactive)).resolves.toMatchObject({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMemory.setAutomationPolicy(inactive, {
      enabled: true, minimumCompletedTurns: 3, ifVersion: null,
    })).resolves.toMatchObject({ ok: false, error: { code: 'mind-garden-not-active' } })

    const impostor = { ...makeAgent('registry-owned') } as Agent
    await expect(ctx.mindGardenMemory.list(impostor)).rejects.toThrow('is not live in this registry')
    const service = ctx.mindGardenMemory
    await ctx.fiber.dispose()
    await expect(service.list(inactive)).rejects.toThrow('service is disposing')
    await expect(service.extract(inactive, {})).rejects.toThrow('service is disposing')
  })

  it('keeps local review available but denies every model-facing path before disclosure acceptance', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('undisclosed-model-paths', activeState('durable', false))
    const proposal = await ctx.mindGardenMemory.propose(agent, {
      kind: 'support-preference',
      content: 'A short walk helps when work feels overwhelming.',
      reason: 'User-owned local review remains available.',
    })
    if (!proposal.ok) throw new Error('proposal failed')
    const confirmed = await ctx.mindGardenMemory.confirm(agent, {
      id: proposal.value.id,
      ifVersion: proposal.value.version,
      recallPolicy: 'relevant',
    })
    if (!confirmed.ok) throw new Error('confirmation failed')

    const assembled = await ctx.systemPrompt.assemble(assembleContextFor(agent))
    expect(assembled.tools.map(tool => tool.name)).not.toContain('mind_garden_memory_correction')
    const decision = await firePreStep(ctx, agent, { text: 'Work feels overwhelming; would a short walk help?' })
    expect(decision.kind).toBe('enter')
    if (decision.kind === 'enter') {
      expect(decision.messages.some(message => message.source.kind === 'plugin'
        && message.source.plugin === 'mind-garden-memory')).toBe(false)
    }

    appendCompletedTurn(agent, 1, 'A quiet walk helped after a demanding afternoon.')
    const adapter = new ScriptedExtractionAdapter([response('{"memories":[]}')])
    ctx.llm.registerAdapter(['undisclosed'], adapter)
    await expect(ctx.mindGardenMemory.extract(agent, {
      provider: 'undisclosed', model: 'undisclosed',
    })).resolves.toEqual({ ok: false, error: { code: 'model-disclosure-required' } })
    expect(adapter.requests).toHaveLength(0)
  })

  it('disables DeepSeek reasoning without adding an extraction output cap', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('deepseek-extraction-budget')
    appendCompletedTurn(agent, 1, 'I prefer one clear question before advice.')
    const adapter = new ScriptedExtractionAdapter([response('{"memories":[]}')])
    vi.spyOn(adapter, 'resolveModel').mockResolvedValue({
      provider: 'deepseek-official',
      id: 'deepseek-v4-flash',
      name: 'DeepSeek-V4-Flash',
      reasoning: {
        efforts: [
          { id: ReasoningEffortId('off'), name: 'Off' },
          { id: ReasoningEffortId('high'), name: 'High' },
        ],
        defaultEffort: ReasoningEffortId('high'),
      },
    })
    ctx.llm.registerAdapter(['deepseek-official'], adapter)

    await expect(ctx.mindGardenMemory.extract(agent, {
      provider: 'deepseek-official', model: 'deepseek-v4-flash',
    })).resolves.toMatchObject({ ok: true, value: { run: { status: 'completed' } } })
    expect(adapter.requests[0]?.reasoningEffort).toBe('off')
    expect(adapter.requests[0]?.maxTokens).toBeUndefined()
  })

  it('rechecks disclosure inside the queued recall operation before logging plaintext', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('recall-disclosure-race')
    const proposal = await ctx.mindGardenMemory.propose(agent, {
      kind: 'support-preference',
      content: 'A short walk helps when work feels overwhelming.',
      reason: 'Use a known helpful response when relevant.',
    })
    if (!proposal.ok) throw new Error('proposal failed')
    const confirmed = await ctx.mindGardenMemory.confirm(agent, {
      id: proposal.value.id,
      ifVersion: proposal.value.version,
      recallPolicy: 'relevant',
    })
    if (!confirmed.ok) throw new Error('confirmation failed')

    const current = vi.spyOn(ctx.mindGarden, 'current')
      .mockReturnValueOnce(activeState())
      .mockReturnValueOnce(activeState('durable', false))
    const decision = await firePreStep(ctx, agent, { text: 'Work feels overwhelming today.' })
    current.mockRestore()

    expect(decision.kind).toBe('enter')
    if (decision.kind === 'enter') {
      expect(decision.messages.some(message => message.source.kind === 'plugin'
        && message.source.plugin === 'mind-garden-memory')).toBe(false)
    }
    await expect(ctx.mindGardenMemory.latestAudit(agent)).resolves.toEqual({
      ok: true,
      value: { audit: null },
    })
  })

  it('stores forward-only automatic extraction authorization with equality-only updates', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(20_000)
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('automation-policy')
    await expect(ctx.mindGardenMemory.automationPolicy(agent)).resolves.toEqual({
      ok: true,
      value: {
        enabled: false,
        minimumCompletedTurns: 3,
        version: null,
        updatedAt: null,
        lastAttemptedTurn: 0,
        lastAttemptAt: null,
        lastOutcome: null,
      },
    })
    appendCompletedTurn(agent, 1, 'This older statement predates automatic review authorization.')
    const enabled = await ctx.mindGardenMemory.setAutomationPolicy(agent, {
      enabled: true,
      minimumCompletedTurns: 3,
      ifVersion: null,
    })
    expect(enabled).toMatchObject({
      ok: true,
      value: { enabled: true, minimumCompletedTurns: 3, lastAttemptedTurn: 1, lastOutcome: null },
    })
    if (!enabled.ok) throw new Error('automation policy failed')
    await expect(ctx.mindGardenMemory.setAutomationPolicy(agent, {
      enabled: false,
      minimumCompletedTurns: 1,
      ifVersion: null,
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'automation-version-conflict', current: { version: enabled.value.version } },
    })
    vi.setSystemTime(21_000)
    await expect(ctx.mindGardenMemory.setAutomationPolicy(agent, {
      enabled: false,
      minimumCompletedTurns: 1,
      ifVersion: enabled.value.version,
    })).resolves.toMatchObject({
      ok: true,
      value: { enabled: false, minimumCompletedTurns: 1, lastAttemptedTurn: 1, updatedAt: 21_000 },
    })
    await ctx.fiber.dispose()
  })

  it('runs authorized automatic extraction only for new safe completed turns while Agent idle', async () => {
    const { ctx, makeAgent } = await serviceHarness({
      extractionProvider: 'automatic',
      extractionModel: 'reviewer',
    })
    const agent = makeAgent('automatic-extraction')
    const maintenance = vi.spyOn(agent, 'runMaintenance')
    const adapter = new ScriptedExtractionAdapter([
      response('{"memories":[]}'),
      response('{"memories":[]}'),
      response('{"memories":[]}'),
    ])
    ctx.llm.registerAdapter(['automatic'], adapter)

    const olderId = appendCompletedTurn(agent, 1, 'This older private statement must stay outside automatic review.')
    const enabled = await ctx.mindGardenMemory.setAutomationPolicy(agent, {
      enabled: true,
      minimumCompletedTurns: 1,
      ifVersion: null,
    })
    if (!enabled.ok) throw new Error('automation policy failed')

    const firstId = appendCompletedTurn(agent, 2, 'A quiet walk helps me reset after focused work.')
    emitIdle(ctx, agent)
    await vi.waitFor(() => {
      expect(adapter.requests).toHaveLength(1)
    })
    await vi.waitFor(async () => {
      await expect(ctx.mindGardenMemory.automationPolicy(agent)).resolves.toMatchObject({
        ok: true,
        value: { lastAttemptedTurn: 2, lastOutcome: 'completed' },
      })
    })
    expect(maintenance).toHaveBeenCalledTimes(1)
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toMatchObject({
      ok: true,
      value: { run: { trigger: 'automatic', sourceMessageIds: [firstId] } },
    })
    expect(adapter.requests[0]?.messages.map(message => message.id)).not.toContain(olderId)

    emitIdle(ctx, agent)
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(adapter.requests).toHaveLength(1)
    expect(maintenance).toHaveBeenCalledTimes(1)

    appendCompletedTurn(agent, 3, 'This urgent local-safety turn is excluded from automatic review.', true)
    emitIdle(ctx, agent)
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(adapter.requests).toHaveLength(1)
    expect(maintenance).toHaveBeenCalledTimes(1)

    const secondId = appendCompletedTurn(agent, 4, 'One clear next step helps when a plan feels crowded.')
    emitIdle(ctx, agent)
    await vi.waitFor(() => {
      expect(adapter.requests).toHaveLength(2)
    })
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toMatchObject({
      ok: true,
      value: { run: { trigger: 'automatic', sourceMessageIds: [secondId] } },
    })
    const secondPrompt = adapter.requests[1]?.messages[0]?.content[0]
    expect(secondPrompt?.type === 'text' ? secondPrompt.text : '').not.toContain('urgent local-safety')

    await expect(ctx.mindGardenMemory.extract(agent, {})).resolves.toMatchObject({
      ok: true, value: { run: { trigger: 'manual' } },
    })
    await ctx.fiber.dispose()
  })

  it('charges failed automatic preflight once instead of retrying on every idle transition', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('automatic-missing-model')
    appendCompletedTurn(agent, 1, 'Existing text sets the authorization boundary.')
    const enabled = await ctx.mindGardenMemory.setAutomationPolicy(agent, {
      enabled: true,
      minimumCompletedTurns: 1,
      ifVersion: null,
    })
    if (!enabled.ok) throw new Error('automation policy failed')
    appendCompletedTurn(agent, 2, 'This new turn has no configured extraction route.')
    emitIdle(ctx, agent)
    let settledVersion = 0
    await vi.waitFor(async () => {
      const policy = await ctx.mindGardenMemory.automationPolicy(agent)
      expect(policy).toMatchObject({
        ok: true,
        value: { lastAttemptedTurn: 2, lastOutcome: 'failed' },
      })
      if (policy.ok) settledVersion = policy.value.lastAttemptAt ?? 0
    })
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toEqual({
      ok: true, value: { run: null },
    })
    emitIdle(ctx, agent)
    await new Promise(resolve => setTimeout(resolve, 20))
    await expect(ctx.mindGardenMemory.automationPolicy(agent)).resolves.toMatchObject({
      ok: true,
      value: { lastAttemptAt: settledVersion, lastOutcome: 'failed' },
    })
    await ctx.fiber.dispose()
  })

  it('governs proposal, evidence, confirmation, edits, conflicts, rejection, and deletion', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    const { ctx, pool, makeAgent } = await serviceHarness()
    const agent = makeAgent('memory-lifecycle')
    const evidence = createUserMessage({
      content: [{ type: 'text', text: 'When work piles up, a short walk helps me reset.' }],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', evidence, { surfaceOp: 'append' })

    const proposal = await ctx.mindGardenMemory.propose(agent, {
      kind: 'support-preference',
      content: 'A short walk helps when work feels overwhelming.',
      reason: 'Can make future support concrete.',
      scope: 'work stress',
      source: { messageId: evidence.id, evidenceQuote: 'a short walk helps me reset' },
    })
    expect(proposal).toMatchObject({
      ok: true,
      value: {
        status: 'candidate',
        recallPolicy: 'never',
        sources: [{ sessionId: agent.id, messageId: evidence.id }],
      },
    })
    if (!proposal.ok) throw new Error('proposal failed')

    await expect(ctx.mindGardenMemory.propose(agent, {
      kind: 'fact', content: 'api_key = abcdefghijklmnop', reason: 'unsafe',
    })).resolves.toMatchObject({ ok: false, error: { code: 'credential-like-content' } })
    await expect(ctx.mindGardenMemory.propose(agent, {
      kind: 'fact', content: 'quote mismatch', reason: 'invalid source',
      source: { messageId: evidence.id, evidenceQuote: 'not in the message' },
    })).resolves.toMatchObject({ ok: false, error: { code: 'source-invalid' } })

    await expect(ctx.mindGardenMemory.confirm(agent, {
      id: proposal.value.id,
      ifVersion: proposal.value.version,
      recallPolicy: 'never',
      temporaryDays: 0,
    })).resolves.toMatchObject({ ok: false, error: { code: 'temporary-period-invalid' } })

    const confirmed = await ctx.mindGardenMemory.confirm(agent, {
      id: proposal.value.id,
      ifVersion: proposal.value.version,
      recallPolicy: 'relevant',
      temporaryDays: 2,
      content: 'A five-minute walk helps when work feels overwhelming.',
      scope: 'focused work',
    })
    expect(confirmed).toMatchObject({
      ok: true,
      value: { status: 'temporary', recallPolicy: 'relevant', expiresAt: 10_000 + 2 * 86_400_000 },
    })
    if (!confirmed.ok) throw new Error('confirmation failed')

    await expect(ctx.mindGardenMemory.confirm(agent, {
      id: confirmed.value.id,
      ifVersion: confirmed.value.version,
      recallPolicy: 'never',
    })).resolves.toMatchObject({ ok: false, error: { code: 'invalid-transition' } })
    await expect(ctx.mindGardenMemory.reject(agent, {
      id: confirmed.value.id,
      ifVersion: confirmed.value.version,
    })).resolves.toMatchObject({ ok: false, error: { code: 'invalid-transition' } })

    await expect(ctx.mindGardenMemory.update(agent, {
      id: confirmed.value.id,
      ifVersion: proposal.value.version,
      reason: 'stale',
    })).resolves.toMatchObject({ ok: false, error: { code: 'version-conflict' } })
    await expect(ctx.mindGardenMemory.update(agent, {
      id: confirmed.value.id,
      ifVersion: confirmed.value.version,
      sensitivity: 'high',
    })).resolves.toMatchObject({
      ok: false, error: { code: 'high-sensitivity-recall-forbidden' },
    })

    const updates = await Promise.all([
      ctx.mindGardenMemory.update(agent, {
        id: confirmed.value.id,
        ifVersion: confirmed.value.version,
        reason: 'First concurrent update',
      }),
      ctx.mindGardenMemory.update(agent, {
        id: confirmed.value.id,
        ifVersion: confirmed.value.version,
        reason: 'Second concurrent update',
      }),
    ])
    expect(updates.filter(result => result.ok)).toHaveLength(1)
    const failedUpdate = updates.find(result => !result.ok)
    if (failedUpdate?.ok !== false) throw new Error('expected one failed update')
    expect(failedUpdate.error.code).toBe('version-conflict')

    const rejectedProposal = await ctx.mindGardenMemory.propose(agent, {
      kind: 'decision', content: 'I might move the meeting.', reason: 'Open decision',
    })
    if (!rejectedProposal.ok) throw new Error('second proposal failed')
    await expect(ctx.mindGardenMemory.update(agent, {
      id: rejectedProposal.value.id,
      ifVersion: rejectedProposal.value.version,
      recallPolicy: 'always',
    })).resolves.toMatchObject({ ok: false, error: { code: 'invalid-transition' } })
    await expect(ctx.mindGardenMemory.reject(agent, {
      id: rejectedProposal.value.id,
      ifVersion: rejectedProposal.value.version,
    })).resolves.toMatchObject({ ok: true, value: { status: 'rejected' } })
    const rejectedList = await ctx.mindGardenMemory.list(agent)
    if (!rejectedList.ok) throw new Error('list failed')
    await expect(ctx.mindGardenMemory.update(agent, {
      id: rejectedProposal.value.id,
      ifVersion: rejectedList.value.items[1]?.version as never,
      reason: 'too late',
    })).resolves.toMatchObject({ ok: false, error: { code: 'invalid-transition' } })

    const latest = updates.find(result => result.ok)
    if (latest === undefined || !latest.ok) throw new Error('update missing')
    await expect(ctx.mindGardenMemory.delete(agent, {
      id: latest.value.id,
      ifVersion: latest.value.version,
    })).resolves.toEqual({ ok: true, value: {
      absent: true,
      memoryRecordRemoved: true,
      deletionTombstoneRecorded: true,
      extractionRunsRedacted: 0,
      sessionHistory: 'retained-by-host',
      providerCopies: 'provider-controlled',
    } })
    await expect(ctx.mindGardenMemory.delete(agent, {
      id: rejectedProposal.value.id,
      ifVersion: rejectedProposal.value.version,
    })).resolves.toMatchObject({ ok: false, error: { code: 'version-conflict' } })
    await expect(ctx.mindGardenMemory.update(agent, {
      id: '00000000-0000-4000-8000-000000000099' as never,
      ifVersion: '10000000-0000-4000-8000-000000000099' as never,
    })).resolves.toMatchObject({ ok: false, error: { code: 'memory-not-found' } })
    await expect(ctx.mindGardenMemory.delete(agent, {
      id: latest.value.id,
      ifVersion: latest.value.version,
    })).resolves.toEqual({ ok: true, value: {
      absent: true,
      memoryRecordRemoved: false,
      deletionTombstoneRecorded: true,
      extractionRunsRedacted: 0,
      sessionHistory: 'retained-by-host',
      providerCopies: 'provider-controlled',
    } })

    const listed = await ctx.mindGardenMemory.list(agent)
    expect(listed).toMatchObject({ ok: true, value: { items: [{ status: 'rejected' }] } })
    const physical = JSON.stringify(pool.media.get('mind_garden_vault'))
    expect(physical).not.toContain('five-minute walk')
    expect(physical).not.toContain('I might move the meeting')
    await ctx.fiber.dispose()
  })

  it('keeps high-sensitivity records local and projects temporary expiry', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(20_000)
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('memory-sensitive')
    const proposed = await ctx.mindGardenMemory.propose(agent, {
      kind: 'fact', sensitivity: 'high', content: 'A private family detail.', reason: 'Only for local review.',
    })
    if (!proposed.ok) throw new Error('proposal failed')
    await expect(ctx.mindGardenMemory.confirm(agent, {
      id: proposed.value.id, ifVersion: proposed.value.version, recallPolicy: 'always',
    })).resolves.toMatchObject({ ok: false, error: { code: 'high-sensitivity-recall-forbidden' } })
    const local = await ctx.mindGardenMemory.confirm(agent, {
      id: proposed.value.id,
      ifVersion: proposed.value.version,
      recallPolicy: 'never',
      temporaryDays: 1,
    })
    if (!local.ok) throw new Error('confirmation failed')
    vi.setSystemTime(20_000 + 86_400_001)
    await expect(ctx.mindGardenMemory.list(agent)).resolves.toMatchObject({
      ok: true, value: { items: [{ status: 'expired', recallPolicy: 'never' }] },
    })
    await expect(ctx.mindGardenMemory.update(agent, {
      id: local.value.id, ifVersion: local.value.version, reason: 'too late',
    })).resolves.toMatchObject({ ok: false, error: { code: 'invalid-transition', status: 'expired' } })
    await ctx.fiber.dispose()
  })

  it('redacts extraction-plan plaintext when its candidate memory is deleted', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('memory-delete-extraction-copy')
    const runId = '10000000-0000-4000-8000-000000000081'
    const candidate = storedMemorySchema.parse({
      recordType: 'memory',
      formatVersion: 1,
      id: '20000000-0000-4000-8000-000000000081',
      version: '30000000-0000-4000-8000-000000000081',
      status: 'candidate',
      kind: 'support-preference',
      sensitivity: 'normal',
      content: 'Please listen before offering a plan.',
      reason: 'This preference should be removable.',
      recallPolicy: 'never',
      sources: [{ sessionId: agent.id }],
      proposalOrigin: 'model-extraction',
      confidence: 0.9,
      importance: 0.9,
      extractionRunId: runId,
      revisions: [],
      createdAt: 1,
      updatedAt: 1,
    })
    const run = storedExtractionRunSchema.parse({
      recordType: 'extraction-run',
      formatVersion: 1,
      id: runId,
      sessionId: agent.id,
      trigger: 'manual',
      status: 'completed',
      provider: 'fixture',
      model: 'fixture',
      system: 'safe system policy',
      prompt: JSON.stringify({ transcript: candidate.content }),
      sourceMessageIds: [],
      comparedMemoryIds: [],
      rawOutput: JSON.stringify({ memories: [{ content: candidate.content }] }),
      candidates: [candidate],
      createdAt: 1,
      updatedAt: 1,
    })
    await ctx.mindGardenVault.put(
      'memories',
      MindGardenVaultRecordId(candidate.id),
      candidate as unknown as JsonValue,
    )
    await ctx.mindGardenVault.put(
      'memories',
      MindGardenVaultRecordId(run.id),
      run as unknown as JsonValue,
    )

    await expect(ctx.mindGardenMemory.delete(agent, {
      id: candidate.id as MindGardenMemoryId,
      ifVersion: candidate.version as MindGardenMemoryVersion,
    })).resolves.toEqual({ ok: true, value: {
      absent: true,
      memoryRecordRemoved: true,
      deletionTombstoneRecorded: true,
      extractionRunsRedacted: 1,
      sessionHistory: 'retained-by-host',
      providerCopies: 'provider-controlled',
    } })
    const encryptedRecords = await ctx.mindGardenVault.entries('memories')
    expect(JSON.stringify(encryptedRecords)).not.toContain(candidate.content)
    expect(encryptedRecords).toHaveLength(2)
    expect(encryptedRecords.map(([, value]) => value)).toContainEqual(expect.objectContaining({
      recordType: 'memory-tombstone',
      id: candidate.id,
    }))
    const redactedRun = encryptedRecords.find(([, value]) => (
      typeof value === 'object'
      && value !== null
      && !Array.isArray(value)
      && value.recordType === 'extraction-run'
    ))?.[1]
    expect(storedExtractionRunSchema.parse(redactedRun)).toMatchObject({
      candidates: [],
      prompt: '{"redacted":true,"reason":"memory-deleted"}',
      rawOutput: '{"redacted":true,"reason":"memory-deleted"}',
    })
    await ctx.fiber.dispose()
  })

  it('validates every bounded field and evidence source without partial writes', async () => {
    const { ctx, makeAgent } = await serviceHarness({
      maxContentBytes: 64,
      maxReasonBytes: 8,
      maxScopeBytes: 8,
      maxEvidenceBytes: 8,
      maxTemporaryDays: 1,
    })
    const agent = makeAgent('memory-validation')
    const human = createUserMessage({
      content: [
        { type: 'text', text: 'walk now' },
        {
          type: 'image',
          attachment: {
            attachmentId: 'fixture-image' as never,
            mediaType: 'image/png',
            bytes: 1,
            width: 1,
            height: 1,
          },
        },
      ],
      source: { kind: 'user' },
    })
    const plugin = createUserMessage({
      content: [{ type: 'text', text: 'walk now' }],
      source: { kind: 'plugin', plugin: 'fixture' },
    })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    agent.session.append('user/message', plugin, { surfaceOp: 'append' })

    const cases = [
      { request: { kind: 'fact' as const, content: ' ', reason: 'why' }, code: 'field-blank' },
      { request: { kind: 'fact' as const, content: 'x'.repeat(65), reason: 'why' }, code: 'field-too-large' },
      { request: { kind: 'fact' as const, content: 'fact', reason: ' ' }, code: 'field-blank' },
      { request: { kind: 'fact' as const, content: 'fact', reason: '123456789' }, code: 'field-too-large' },
      { request: { kind: 'fact' as const, content: 'fact', reason: 'why', scope: '123456789' }, code: 'field-too-large' },
      {
        request: {
          kind: 'fact' as const,
          content: 'fact',
          reason: 'why',
          source: { messageId: human.id, evidenceQuote: ' ' },
        },
        code: 'field-blank',
      },
      {
        request: {
          kind: 'fact' as const,
          content: 'fact',
          reason: 'why',
          source: { messageId: human.id, evidenceQuote: '123456789' },
        },
        code: 'field-too-large',
      },
      {
        request: {
          kind: 'fact' as const,
          content: 'fact',
          reason: 'why',
          source: { messageId: 'missing' as never, evidenceQuote: 'walk' },
        },
        code: 'source-invalid',
      },
      {
        request: {
          kind: 'fact' as const,
          content: 'fact',
          reason: 'why',
          source: { messageId: plugin.id, evidenceQuote: 'walk' },
        },
        code: 'source-invalid',
      },
    ]
    for (const row of cases) {
      await expect(ctx.mindGardenMemory.propose(agent, row.request)).resolves.toMatchObject({
        ok: false, error: { code: row.code },
      })
    }
    for (const content of [
      '-----BEGIN PRIVATE KEY-----',
      'sk-abcdefghijklmnop',
      'password=abcdefghijkl',
    ]) {
      await expect(ctx.mindGardenMemory.propose(agent, {
        kind: 'fact', content, reason: 'why',
      })).resolves.toMatchObject({ ok: false, error: { code: 'credential-like-content' } })
    }

    const proposed = await ctx.mindGardenMemory.propose(agent, {
      kind: 'fact', content: 'fact', reason: 'why', scope: 'scope',
      source: { messageId: human.id, evidenceQuote: 'walk' },
    })
    if (!proposed.ok) throw new Error('proposal failed')
    const noOp = await ctx.mindGardenMemory.update(agent, {
      id: proposed.value.id, ifVersion: proposed.value.version,
    })
    expect(noOp).toEqual(proposed)
    if (!noOp.ok) throw new Error('no-op failed')
    const changed = await ctx.mindGardenMemory.update(agent, {
      id: noOp.value.id,
      ifVersion: noOp.value.version,
      content: 'edit',
      reason: 'better',
      scope: '',
      sensitivity: 'high',
      recallPolicy: 'never',
    })
    expect(changed).toMatchObject({ ok: true, value: { content: 'edit' } })
    if (changed.ok) expect(changed.value).not.toHaveProperty('scope')
    await expect(ctx.mindGardenMemory.confirm(agent, {
      id: changed.ok ? changed.value.id : proposed.value.id,
      ifVersion: changed.ok ? changed.value.version : proposed.value.version,
      recallPolicy: 'never',
      temporaryDays: 2,
    })).resolves.toMatchObject({ ok: false, error: { code: 'temporary-period-invalid' } })
    await ctx.fiber.dispose()
  })

  it('reports authenticated plaintext corruption as a closed vault failure', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('memory-corrupt')
    const id = MindGardenVaultRecordId('00000000-0000-4000-8000-000000000099')
    await ctx.mindGardenVault.put('memories', id, { recordType: 'unknown' })
    await expect(ctx.mindGardenMemory.list(agent)).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    await ctx.fiber.dispose()
  })

  it('projects and revises compatible records created before governance metadata existed', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('memory-compatible-record')
    const id = '00000000-0000-4000-8000-000000000095'
    await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(id), {
      recordType: 'memory',
      formatVersion: 1,
      id,
      version: '10000000-0000-4000-8000-000000000095',
      status: 'candidate',
      kind: 'fact',
      sensitivity: 'normal',
      content: 'A compatible statement.',
      reason: 'Compatibility review.',
      scope: 'legacy scope',
      recallPolicy: 'never',
      sources: [{ sessionId: agent.id }],
      createdAt: 1,
      updatedAt: 1,
    })
    const listed = await ctx.mindGardenMemory.list(agent)
    expect(listed).toMatchObject({
      ok: true,
      value: { items: [{ id, proposalOrigin: 'human', revisionCount: 0 }] },
    })
    if (!listed.ok) throw new Error('compatible list failed')
    await expect(ctx.mindGardenMemory.listRevisions(agent, { id: id as never })).resolves.toEqual({
      ok: true, value: { revisions: [] },
    })
    const updated = await ctx.mindGardenMemory.update(agent, {
      id: id as never,
      ifVersion: listed.value.items[0]!.version,
      reason: 'Updated compatibility review.',
    })
    expect(updated).toMatchObject({ ok: true, value: { revisionCount: 1 } })
    await expect(ctx.mindGardenMemory.listRevisions(agent, { id: id as never })).resolves.toMatchObject({
      ok: true, value: { revisions: [{ scope: 'legacy scope' }] },
    })
    const entries = vi.spyOn(ctx.mindGardenVault, 'entries')
      .mockRejectedValueOnce(new MindGardenVaultError('locked', 'fixture'))
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'locked' },
    })
    entries.mockRestore()
    await ctx.fiber.dispose()
  })

  it('detects an authenticated id mismatch and maps every vault boundary state', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('memory-vault-errors')
    const id = MindGardenVaultRecordId('00000000-0000-4000-8000-000000000098')
    await ctx.mindGardenVault.put('memories', id, {
      recordType: 'retrieval-audit',
      formatVersion: 1,
      id: '00000000-0000-4000-8000-000000000097',
      sessionId: agent.id,
      createdAt: 1,
      sentToModel: false,
      matches: [],
    })
    await expect(ctx.mindGardenMemory.latestAudit(agent)).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })

    const entries = vi.spyOn(ctx.mindGardenVault, 'entries')
    const rows = [
      ['locked', 'locked'],
      ['invalid-key', 'invalid-key'],
      ['key-mismatch', 'key-mismatch'],
      ['corrupt-record', 'corrupt-state'],
    ] as const
    for (const [code, state] of rows) {
      entries.mockRejectedValueOnce(new MindGardenVaultError(code, 'safe boundary failure'))
      await expect(ctx.mindGardenMemory.list(agent)).resolves.toEqual({
        ok: false, error: { code: 'vault-unavailable', state },
      })
    }
    entries.mockRejectedValueOnce(new Error('programming failure'))
    await expect(ctx.mindGardenMemory.list(agent)).rejects.toThrow('programming failure')
    await ctx.fiber.dispose()
  })

  it('covers pre-step early exits, empty audits, pruning, and secret-safe diagnostics', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(30_000)
    const { ctx, makeAgent } = await serviceHarness({ maxAuditEntries: 2 })
    const durable = makeAgent('memory-pre-step')
    const inactive = makeAgent('memory-pre-step-inactive', null)
    const ephemeral = makeAgent('memory-pre-step-ephemeral', activeState('ephemeral'))
    const aborted = new AbortController()
    aborted.abort()

    await expect(firePreStep(ctx, durable, { state: { kind: 'reject' } })).resolves.toEqual({ kind: 'reject' })
    await expect(firePreStep(ctx, durable, { signal: aborted.signal })).resolves.toMatchObject({ kind: 'enter' })
    await expect(firePreStep(ctx, durable, { step: 2 })).resolves.toMatchObject({ kind: 'enter' })
    await expect(firePreStep(ctx, inactive)).resolves.toMatchObject({ kind: 'enter' })
    await expect(firePreStep(ctx, ephemeral)).resolves.toMatchObject({ kind: 'enter' })
    await expect(ctx.mindGardenMemory.latestAudit(durable)).resolves.toEqual({
      ok: true, value: { audit: null },
    })

    await expect(firePreStep(ctx, durable)).resolves.toMatchObject({ kind: 'enter' })
    await expect(firePreStep(ctx, durable)).resolves.toMatchObject({ kind: 'enter' })
    await expect(ctx.mindGardenMemory.list(durable)).resolves.toMatchObject({ ok: true })
    await expect(ctx.mindGardenMemory.latestAudit(durable)).resolves.toMatchObject({
      ok: true, value: { audit: { sentToModel: false, matches: [] } },
    })
    vi.setSystemTime(30_001)
    await expect(firePreStep(ctx, durable)).resolves.toMatchObject({ kind: 'enter' })
    await expect(ctx.mindGardenMemory.latestAudit(durable)).resolves.toMatchObject({
      ok: true, value: { audit: { sentToModel: false, matches: [] } },
    })

    const warn = vi.spyOn(ctx.logger, 'warn')
    const entries = vi.spyOn(ctx.mindGardenVault, 'entries')
    entries.mockRejectedValueOnce(new MindGardenVaultError('locked', 'do not expose me'))
    await firePreStep(ctx, durable)
    entries.mockRejectedValueOnce(new Error('do not expose me'))
    await firePreStep(ctx, durable)
    entries.mockRejectedValueOnce('do not expose me')
    await firePreStep(ctx, durable)
    entries.mockRestore()
    await ctx.mindGardenVault.put(
      'memories',
      MindGardenVaultRecordId('00000000-0000-4000-8000-000000000096'),
      { recordType: 'unknown' },
    )
    await firePreStep(ctx, durable)
    expect(warn.mock.calls.map(call => String(call[0]))).toEqual(expect.arrayContaining([
      expect.stringContaining('locked'),
      expect.stringContaining('Error'),
      expect.stringContaining('unknown error'),
      expect.stringContaining('corrupt-state'),
    ]))
    expect(warn.mock.calls.join('\n')).not.toContain('do not expose me')
    await ctx.fiber.dispose()
  })

  it('extracts evidence-gated candidates and resolves every suggested relationship explicitly', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(40_000)
    const { ctx, pool, makeAgent } = await serviceHarness({ maxExtractionCandidates: 3 })
    const agent = makeAgent('memory-extraction')
    const existingCandidate = await ctx.mindGardenMemory.propose(agent, {
      kind: 'preference',
      content: 'I prefer direct advice immediately.',
      reason: 'Previously confirmed support preference.',
    })
    if (!existingCandidate.ok) throw new Error('existing proposal failed')
    const existing = await ctx.mindGardenMemory.confirm(agent, {
      id: existingCandidate.value.id,
      ifVersion: existingCandidate.value.version,
      recallPolicy: 'relevant',
    })
    if (!existing.ok) throw new Error('existing confirmation failed')
    const statements = [
      'I now prefer a short pause before advice.',
      'Please ignore the earlier wording instead of keeping both.',
      'In team meetings, both preferences can coexist.',
    ].map(text => createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
    for (const message of statements) agent.session.append('user/message', message, { surfaceOp: 'append' })
    const memories = statements.map((message, index) => ({
      kind: index === 0 ? 'preference' : 'fact',
      content: [
        'I prefer a short pause before advice.',
        'I want the earlier wording ignored.',
        'I use both preferences in team meetings.',
      ][index],
      reason: 'Useful reviewed context.',
      scope: index === 2 ? 'team meetings' : undefined,
      sourceMessageId: message.id,
      evidenceQuote: message.content[0]?.type === 'text' ? message.content[0].text : '',
      confidence: 0.95 - index * 0.01,
      importance: 0.9 - index * 0.01,
      relationship: {
        type: index === 0 ? 'contradiction' : index === 1 ? 'duplicate' : 'refinement',
        targetMemoryId: existing.value.id,
        rationale: 'This may change how the earlier preference should apply.',
      },
    }))
    const adapter = new ScriptedExtractionAdapter([response(JSON.stringify({ memories }))])
    ctx.llm.registerAdapter(['extract'], adapter)

    const extracted = await ctx.mindGardenMemory.extract(agent, { provider: 'extract', model: 'reviewer' })
    expect(extracted).toMatchObject({
      ok: true,
      value: {
        run: { status: 'completed', provider: 'extract', model: 'reviewer' },
        candidates: [
          { status: 'candidate', proposalOrigin: 'model-extraction', relationship: { status: 'pending' } },
          { status: 'candidate', proposalOrigin: 'model-extraction', relationship: { status: 'pending' } },
          { status: 'candidate', proposalOrigin: 'model-extraction', relationship: { status: 'pending' } },
        ],
      },
    })
    if (!extracted.ok) throw new Error('extraction failed')
    expect(adapter.requests[0]).toMatchObject({
      provider: 'extract',
      model: 'reviewer',
      temperature: 0.1,
      sessionId: agent.id,
      purpose: 'mind-garden-memory-extraction',
    })
    expect(adapter.requests[0]?.messages[0]?.source).toEqual({ kind: 'plugin', plugin: 'mind-garden-memory' })
    const extractionPrompt = adapter.requests[0]?.messages[0]?.content[0]
    expect(extractionPrompt?.type).toBe('text')
    if (extractionPrompt?.type !== 'text') throw new Error('extraction prompt is missing')
    expect(extractionPrompt.text).toContain(existing.value.id)
    await expect(ctx.mindGardenMemory.confirm(agent, {
      id: extracted.value.candidates[0]!.id,
      ifVersion: extracted.value.candidates[0]!.version,
      recallPolicy: 'relevant',
    })).resolves.toMatchObject({ ok: false, error: { code: 'relationship-review-required' } })

    const ignored = await ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[1]!.id,
      ifVersion: extracted.value.candidates[1]!.version,
      resolution: 'keep-existing',
    })
    expect(ignored).toMatchObject({ ok: true, value: { candidate: { status: 'rejected' } } })
    const coexisting = await ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[2]!.id,
      ifVersion: extracted.value.candidates[2]!.version,
      resolution: 'keep-both',
      recallPolicy: 'never',
      temporaryDays: 2,
    })
    expect(coexisting).toMatchObject({
      ok: true,
      value: { candidate: { status: 'temporary', relationship: { resolution: 'keep-both' } } },
    })
    const replaced = await ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[0]!.id,
      ifVersion: extracted.value.candidates[0]!.version,
      resolution: 'replace-existing',
      recallPolicy: 'relevant',
      scope: 'current preference',
    })
    expect(replaced).toMatchObject({
      ok: true,
      value: {
        candidate: { status: 'superseded', supersededBy: existing.value.id },
        activeMemory: {
          id: existing.value.id,
          content: 'I prefer a short pause before advice.',
          proposalOrigin: 'model-extraction',
          confidence: 0.95,
        },
      },
    })
    if (!replaced.ok) throw new Error('replacement failed')
    await expect(ctx.mindGardenMemory.listRevisions(agent, { id: existing.value.id })).resolves.toMatchObject({
      ok: true,
      value: { revisions: [{ action: 'confirmed' }, { action: 'replaced', relatedMemoryId: extracted.value.candidates[0]!.id }] },
    })
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toMatchObject({
      ok: true, value: { run: { id: extracted.value.run.id, status: 'completed' } },
    })
    const physical = JSON.stringify(pool.media.get('mind_garden_vault'))
    expect(physical).not.toContain('short pause before advice')
    expect(physical).not.toContain('This may change how')
    await ctx.fiber.dispose()
  })

  it('bounds settled extraction audit retention without deleting live recovery state', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(45_000)
    const { ctx, makeAgent } = await serviceHarness({ maxExtractionRunEntries: 2 })
    const agent = makeAgent('memory-extraction-retention')
    const human = createUserMessage({
      content: [{ type: 'text', text: 'I prefer a short pause before advice.' }],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    ctx.llm.registerAdapter(['retention'], new ScriptedExtractionAdapter([
      response('{"memories":[]}'),
      response('{"memories":[]}'),
      response('{"memories":[]}'),
    ]))

    const runIds: string[] = []
    for (let index = 0; index < 3; index += 1) {
      vi.setSystemTime(45_000 + index)
      const result = await ctx.mindGardenMemory.extract(agent, {
        provider: 'retention',
        model: 'retention-model',
      })
      if (!result.ok) throw new Error('retention extraction failed')
      runIds.push(result.value.run.id)
    }

    const settled = (await ctx.mindGardenVault.entries('memories')).flatMap(([, value]) => {
      const parsed = storedExtractionRunSchema.safeParse(value)
      return parsed.success ? [parsed.data] : []
    })
    expect(settled).toHaveLength(2)
    expect(settled.map(run => run.id)).not.toContain(runIds[0])
    expect(settled.map(run => run.id)).toEqual(expect.arrayContaining(runIds.slice(1)))
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toMatchObject({
      ok: true,
      value: { run: { id: runIds[2], status: 'completed' } },
    })
    await ctx.fiber.dispose()
  })

  it('fails closed on extraction routing, input, provider, and output errors', async () => {
    const noSource = await serviceHarness()
    const noSourceAgent = noSource.makeAgent('extract-no-source')
    await expect(noSource.ctx.mindGardenMemory.extract(noSourceAgent, {
      provider: 'missing', model: 'missing',
    })).resolves.toMatchObject({ ok: false, error: { code: 'extraction-no-source' } })
    await expect(noSource.ctx.mindGardenMemory.latestExtraction(noSourceAgent)).resolves.toEqual({
      ok: true, value: { run: null },
    })
    await noSource.ctx.fiber.dispose()

    const bounded = await serviceHarness({ maxExtractionInputBytes: 1 })
    const boundedAgent = bounded.makeAgent('extract-bounded')
    const human = createUserMessage({ content: [{ type: 'text', text: 'a complete statement' }], source: { kind: 'user' } })
    boundedAgent.session.append('user/message', human, { surfaceOp: 'append' })
    await expect(bounded.ctx.mindGardenMemory.extract(boundedAgent, {
      provider: 'missing', model: 'missing',
    })).resolves.toMatchObject({ ok: false, error: { code: 'extraction-input-too-large' } })
    await expect(bounded.ctx.mindGardenMemory.extract(boundedAgent, {})).resolves.toMatchObject({
      ok: false, error: { code: 'extraction-model-unavailable' },
    })
    await expect(bounded.ctx.mindGardenMemory.extract(boundedAgent, { provider: 'partial' })).resolves.toMatchObject({
      ok: false, error: { code: 'extraction-model-unavailable' },
    })
    await expect(bounded.ctx.mindGardenMemory.extract(boundedAgent, { model: 'partial' })).resolves.toMatchObject({
      ok: false, error: { code: 'extraction-model-unavailable' },
    })
    await expect(bounded.ctx.mindGardenMemory.extract(boundedAgent, { provider: '', model: '' })).resolves.toMatchObject({
      ok: false, error: { code: 'extraction-model-unavailable' },
    })
    await bounded.ctx.fiber.dispose()

    const failures = await serviceHarness()
    const failureAgent = failures.makeAgent('extract-failures')
    failureAgent.session.append('user/message', human, { surfaceOp: 'append' })
    failures.ctx.llm.registerAdapter(['invalid'], new ScriptedExtractionAdapter([
      response('not json'),
      [{ type: 'finish', reason: { kind: 'max-tokens' } }],
      response(' '),
      [
        { type: 'block-start', index: 0, blockType: 'tool-call' },
        {
          type: 'block-end',
          index: 0,
          block: { type: 'tool-call', id: 'call-extract' as never, name: 'unsafe', arguments: '{}' },
        },
        { type: 'finish', reason: { kind: 'stop' } },
      ],
      [
        { type: 'block-start', index: 0, blockType: 'reasoning' },
        { type: 'reasoning-delta', index: 0, text: 'private reasoning' },
        { type: 'block-end', index: 0, block: { type: 'reasoning', text: 'private reasoning' } },
        ...response('{"memories":[]}').map(chunk => 'index' in chunk ? { ...chunk, index: 1 } : chunk),
      ] as StreamChunk[],
    ]))
    await expect(failures.ctx.mindGardenMemory.extract(failureAgent, {
      provider: 'invalid', model: 'invalid',
    })).resolves.toMatchObject({ ok: false, error: { code: 'extraction-output-invalid' } })
    await expect(failures.ctx.mindGardenMemory.latestExtraction(failureAgent)).resolves.toMatchObject({
      ok: true, value: { run: { status: 'failed', failure: 'invalid-output' } },
    })
    await expect(failures.ctx.mindGardenMemory.extract(failureAgent, {
      provider: 'invalid', model: 'invalid',
    })).resolves.toMatchObject({ ok: false, error: { code: 'extraction-model-failed' } })
    await expect(failures.ctx.mindGardenMemory.latestExtraction(failureAgent)).resolves.toMatchObject({
      ok: true, value: { run: { status: 'failed', failure: 'model-failed' } },
    })
    await expect(failures.ctx.mindGardenMemory.extract(failureAgent, {
      provider: 'invalid', model: 'invalid',
    })).resolves.toMatchObject({ ok: false, error: { code: 'extraction-model-failed' } })
    await expect(failures.ctx.mindGardenMemory.extract(failureAgent, {
      provider: 'invalid', model: 'invalid',
    })).resolves.toMatchObject({ ok: false, error: { code: 'extraction-model-failed' } })
    await expect(failures.ctx.mindGardenMemory.extract(failureAgent, {
      provider: 'invalid', model: 'invalid',
    })).resolves.toMatchObject({ ok: true, value: { candidates: [] } })
    await failures.ctx.fiber.dispose()
  })

  it('resolves extraction routes from package config, logged request state, and Agent fallback', async () => {
    const configured = await serviceHarness({ extractionProvider: 'configured', extractionModel: 'configured-model' })
    const agent = configured.makeAgent('extract-route-order')
    const human = createUserMessage({ content: [{ type: 'text', text: 'I prefer route reuse.' }], source: { kind: 'user' } })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    vi.useFakeTimers()
    vi.setSystemTime(100_000)
    const expiringCandidate = await configured.ctx.mindGardenMemory.propose(agent, {
      kind: 'fact', content: 'Temporary comparison.', reason: 'Expiry fixture.',
    })
    if (!expiringCandidate.ok) throw new Error('expiring proposal failed')
    const expiring = await configured.ctx.mindGardenMemory.confirm(agent, {
      id: expiringCandidate.value.id,
      ifVersion: expiringCandidate.value.version,
      recallPolicy: 'relevant',
      temporaryDays: 1,
    })
    if (!expiring.ok || expiring.value.expiresAt === undefined) throw new Error('expiring confirmation failed')
    vi.setSystemTime(expiring.value.expiresAt + 1)
    configured.ctx.llm.registerAdapter(['configured'], new ScriptedExtractionAdapter([response('{"memories":[]}')]))
    await expect(configured.ctx.mindGardenMemory.extract(agent, {})).resolves.toMatchObject({
      ok: true, value: { run: { provider: 'configured', model: 'configured-model' } },
    })
    await configured.ctx.fiber.dispose()

    const routed = await serviceHarness()
    const routedAgent = routed.makeAgent('extract-route-history')
    routedAgent.session.append('user/message', human, { surfaceOp: 'append' })
    routedAgent.session.append('request/header', {
      header: { config: { provider: 'logged', model: 'logged-model' } }, reason: 'initial',
    })
    routed.ctx.llm.registerAdapter(['logged'], new ScriptedExtractionAdapter([response('{"memories":[]}')]))
    await expect(routed.ctx.mindGardenMemory.extract(routedAgent, {})).resolves.toMatchObject({
      ok: true, value: { run: { provider: 'logged', model: 'logged-model' } },
    })
    await routed.ctx.fiber.dispose()

    const fallback = await serviceHarness()
    const fallbackAgent = fallback.makeAgent('extract-route-agent')
    fallbackAgent.session.append('user/message', human, { surfaceOp: 'append' })
    Object.assign(fallbackAgent.options, { provider: 'agent-fallback', model: 'agent-model' })
    fallback.ctx.llm.registerAdapter(['agent-fallback'], new ScriptedExtractionAdapter([response('{"memories":[]}')]))
    await expect(fallback.ctx.mindGardenMemory.extract(fallbackAgent, {})).resolves.toMatchObject({
      ok: true, value: { run: { provider: 'agent-fallback', model: 'agent-model' } },
    })
    await fallback.ctx.fiber.dispose()
  })

  it('rechecks durable Mind Garden access immediately before logging an extraction request', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('extract-access-race')
    const human = createUserMessage({ content: [{ type: 'text', text: 'I prefer a pause.' }], source: { kind: 'user' } })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    const current = vi.spyOn(ctx.mindGarden, 'current')
      .mockReturnValueOnce(activeState())
      .mockReturnValueOnce(null)
    await expect(ctx.mindGardenMemory.extract(agent, {
      provider: 'unused', model: 'unused',
    })).resolves.toEqual({ ok: false, error: { code: 'mind-garden-not-active' } })
    current.mockRestore()
    await ctx.fiber.dispose()
  })

  it('treats a missing or externally mutated encrypted extraction audit as corrupt state', async () => {
    const mutated = await serviceHarness()
    const mutatedAgent = mutated.makeAgent('extract-mutated-audit')
    const human = createUserMessage({ content: [{ type: 'text', text: 'I prefer a pause.' }], source: { kind: 'user' } })
    mutatedAgent.session.append('user/message', human, { surfaceOp: 'append' })
    mutated.ctx.llm.registerAdapter(['mutate-audit'], new CallbackExtractionAdapter(async () => {
      const entry = (await mutated.ctx.mindGardenVault.entries('memories')).find(([, value]) =>
        (value as { recordType?: string }).recordType === 'extraction-run',
      )
      if (entry === undefined) throw new Error('run missing in fixture')
      const run = storedExtractionRunSchema.parse(entry[1])
      await mutated.ctx.mindGardenVault.put('memories', entry[0], {
        ...run,
        status: 'failed',
        failure: 'interrupted',
      } as never)
    }, response('{"memories":[]}')))
    await expect(mutated.ctx.mindGardenMemory.extract(mutatedAgent, {
      provider: 'mutate-audit', model: 'mutate-audit',
    })).resolves.toEqual({ ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' } })
    await mutated.ctx.fiber.dispose()

    const missing = await serviceHarness()
    const missingAgent = missing.makeAgent('extract-missing-audit')
    missingAgent.session.append('user/message', human, { surfaceOp: 'append' })
    missing.ctx.llm.registerAdapter(['delete-audit'], new CallbackExtractionAdapter(async () => {
      const entry = (await missing.ctx.mindGardenVault.entries('memories')).find(([, value]) =>
        (value as { recordType?: string }).recordType === 'extraction-run',
      )
      if (entry === undefined) throw new Error('run missing in fixture')
      await missing.ctx.mindGardenVault.delete('memories', entry[0])
    }, response('not json')))
    await expect(missing.ctx.mindGardenMemory.extract(missingAgent, {
      provider: 'delete-audit', model: 'delete-audit',
    })).resolves.toEqual({ ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' } })
    await missing.ctx.fiber.dispose()
  })

  it('rejects every extraction-plan candidate identity collision during recovery', async () => {
    for (const collision of ['record-type', 'run-id', 'version'] as const) {
      const { ctx, makeAgent } = await serviceHarness()
      const agent = makeAgent(`extract-collision-${collision}`)
      const runId = collision === 'record-type'
        ? '10000000-0000-4000-8000-000000000071'
        : collision === 'run-id'
          ? '10000000-0000-4000-8000-000000000072'
          : '10000000-0000-4000-8000-000000000073'
      const candidateId = collision === 'record-type'
        ? '20000000-0000-4000-8000-000000000071'
        : collision === 'run-id'
          ? '20000000-0000-4000-8000-000000000072'
          : '20000000-0000-4000-8000-000000000073'
      const candidate = storedMemorySchema.parse({
        recordType: 'memory',
        formatVersion: 1,
        id: candidateId,
        version: '30000000-0000-4000-8000-000000000073',
        status: 'candidate',
        kind: 'fact',
        sensitivity: 'normal',
        content: 'A planned candidate.',
        reason: 'Recovery fixture.',
        recallPolicy: 'never',
        sources: [{ sessionId: agent.id }],
        proposalOrigin: 'model-extraction',
        confidence: 0.9,
        importance: 0.9,
        extractionRunId: runId,
        revisions: [],
        createdAt: 1,
        updatedAt: 1,
      })
      const run = storedExtractionRunSchema.parse({
        recordType: 'extraction-run',
        formatVersion: 1,
        id: runId,
        sessionId: agent.id,
        status: 'committing',
        provider: 'unused',
        model: 'unused',
        system: 'system',
        prompt: 'prompt',
        sourceMessageIds: [],
        comparedMemoryIds: [],
        rawOutput: '{"memories":[]}',
        candidates: [candidate],
        createdAt: 1,
        updatedAt: 1,
      })
      const existing = collision === 'record-type'
        ? {
          recordType: 'retrieval-audit',
          formatVersion: 1,
          id: candidateId,
          sessionId: agent.id,
          createdAt: 1,
          sentToModel: false,
          matches: [],
        }
        : {
          ...candidate,
          ...(collision === 'run-id'
            ? { extractionRunId: '40000000-0000-4000-8000-000000000074' }
            : { version: '50000000-0000-4000-8000-000000000075' }),
        }
      await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(candidateId), existing as never)
      await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(runId), run as never)
      await expect(ctx.mindGardenMemory.extract(agent, {})).resolves.toEqual({
        ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
      })
      await ctx.fiber.dispose()
    }
  })

  it('preserves unexpected candidate codec failures as programming errors', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1)
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('extract-codec-failure')
    const human = createUserMessage({ content: [{ type: 'text', text: 'I prefer a pause.' }], source: { kind: 'user' } })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    ctx.llm.registerAdapter(['codec-failure'], new CallbackExtractionAdapter(() => {
      vi.setSystemTime(-1)
      return Promise.resolve()
    }, response(JSON.stringify({ memories: [{
      kind: 'preference',
      content: 'I prefer a pause.',
      reason: 'Support preference.',
      sourceMessageId: human.id,
      evidenceQuote: 'I prefer a pause.',
      confidence: 0.9,
      importance: 0.9,
    }] }))))
    await expect(ctx.mindGardenMemory.extract(agent, {
      provider: 'codec-failure', model: 'codec-failure',
    })).rejects.toThrow()
    await ctx.fiber.dispose()
  })

  it('recovers encrypted extraction commit plans without repeating model inference', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(50_000)
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('extract-recovery')
    const human = createUserMessage({
      content: [{ type: 'text', text: 'I recover with a quiet minute.' }],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    const runId = '30000000-0000-4000-8000-000000000050'
    const candidate = {
      recordType: 'memory' as const,
      formatVersion: 1 as const,
      id: '40000000-0000-4000-8000-000000000050',
      version: '50000000-0000-4000-8000-000000000050',
      status: 'candidate' as const,
      kind: 'support-preference' as const,
      sensitivity: 'normal' as const,
      content: 'I recover with a quiet minute.',
      reason: 'Useful support preference.',
      recallPolicy: 'never' as const,
      sources: [{ sessionId: agent.id, messageId: human.id, evidenceQuote: 'a quiet minute' }],
      proposalOrigin: 'model-extraction' as const,
      confidence: 0.9,
      importance: 0.8,
      extractionRunId: runId,
      revisions: [],
      createdAt: 50_000,
      updatedAt: 50_000,
    }
    const run = storedExtractionRunSchema.parse({
      recordType: 'extraction-run',
      formatVersion: 1,
      id: runId,
      sessionId: agent.id,
      status: 'committing',
      provider: 'unused',
      model: 'unused',
      system: 'system',
      prompt: 'prompt',
      sourceMessageIds: [human.id],
      comparedMemoryIds: [],
      rawOutput: '{"memories":[]}',
      candidates: [candidate],
      createdAt: 50_000,
      updatedAt: 50_000,
    })
    const interruptedId = '20000000-0000-4000-8000-000000000050'
    const interruptedInput = { ...run } as Record<string, unknown>
    delete interruptedInput.rawOutput
    const interrupted = storedExtractionRunSchema.parse({
      ...interruptedInput, id: interruptedId, status: 'running', candidates: [],
    })
    await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(interrupted.id), interrupted as never)
    await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(candidate.id), candidate)
    await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(run.id), run as never)
    const recovered = await ctx.mindGardenMemory.extract(agent, {})
    expect(recovered).toMatchObject({
      ok: true,
      value: { run: { id: runId, status: 'completed' }, candidates: [{ id: candidate.id }] },
    })
    await expect(ctx.mindGardenMemory.list(agent)).resolves.toMatchObject({
      ok: true, value: { items: [{ id: candidate.id, status: 'candidate' }] },
    })
    await expect(ctx.mindGardenVault.get(
      'memories', MindGardenVaultRecordId(interruptedId),
    )).resolves.toMatchObject({ status: 'failed', failure: 'interrupted' })
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toMatchObject({
      ok: true, value: { run: { id: runId } },
    })
    await expect(ctx.mindGardenMemory.extract(agent, {})).resolves.toMatchObject({
      ok: false, error: { code: 'extraction-model-unavailable' },
    })
    await ctx.fiber.dispose()
  })

  it('allows only one live extraction per Session while other memory operations remain responsive', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('extract-concurrency')
    const human = createUserMessage({
      content: [{ type: 'text', text: 'I need a moment before deciding.' }],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    const adapter = new HeldExtractionAdapter()
    ctx.llm.registerAdapter(['held'], adapter)
    const first = ctx.mindGardenMemory.extract(agent, { provider: 'held', model: 'held' })
    await adapter.entered
    await expect(ctx.mindGardenMemory.extract(agent, {
      provider: 'held', model: 'held',
    })).resolves.toEqual({ ok: false, error: { code: 'extraction-in-progress' } })
    await expect(ctx.mindGardenMemory.list(agent)).resolves.toEqual({ ok: true, value: { items: [] } })
    adapter.release()
    await expect(first).resolves.toMatchObject({ ok: true, value: { candidates: [] } })
    await ctx.fiber.dispose()
  })

  it('aborts and drains a live auxiliary request during plugin disposal', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('extract-disposal')
    const human = createUserMessage({
      content: [{ type: 'text', text: 'I need a pause.' }], source: { kind: 'user' },
    })
    agent.session.append('user/message', human, { surfaceOp: 'append' })
    const adapter = new HeldExtractionAdapter()
    ctx.llm.registerAdapter(['dispose-held'], adapter)
    const extraction = ctx.mindGardenMemory.extract(agent, { provider: 'dispose-held', model: 'dispose-held' })
    await adapter.entered
    const disposal = ctx.fiber.dispose()
    await Promise.resolve()
    adapter.release()
    await Promise.allSettled([extraction, disposal])
  })

  it('rejects stale, missing, unsafe, and invalid relationship decisions without partial writes', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('relationship-errors')
    const manual = await ctx.mindGardenMemory.propose(agent, {
      kind: 'fact', content: 'I use the train.', reason: 'Travel context.',
    })
    if (!manual.ok) throw new Error('manual proposal failed')
    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: manual.value.id, ifVersion: manual.value.version, resolution: 'keep-existing',
    })).resolves.toMatchObject({ ok: false, error: { code: 'relationship-not-pending' } })
    await expect(ctx.mindGardenMemory.listRevisions(agent, {
      id: '00000000-0000-4000-8000-000000000099' as never,
    })).resolves.toMatchObject({ ok: false, error: { code: 'memory-not-found' } })
    const target = await ctx.mindGardenMemory.confirm(agent, {
      id: manual.value.id, ifVersion: manual.value.version, recallPolicy: 'relevant',
    })
    if (!target.ok) throw new Error('target confirmation failed')
    const messages = [
      'I may use the bus now.',
      'This is a private high-sensitivity travel detail.',
      'I might keep both travel options.',
    ].map(text => createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
    for (const message of messages) agent.session.append('user/message', message, { surfaceOp: 'append' })
    const adapter = new ScriptedExtractionAdapter([response(JSON.stringify({
      memories: messages.map((message, index) => ({
        kind: 'fact',
        sensitivity: index === 1 ? 'high' : 'normal',
        content: ['I may use the bus now.', 'I keep a private travel detail.', 'I might keep both travel options.'][index],
        reason: 'Travel review.',
        sourceMessageId: message.id,
        evidenceQuote: message.content[0]?.type === 'text' ? message.content[0].text : '',
        confidence: 0.9,
        importance: 0.9,
        relationship: {
          type: 'refinement', targetMemoryId: target.value.id, rationale: 'Travel context changed.',
        },
      })),
    }))])
    ctx.llm.registerAdapter(['relationship-errors'], adapter)
    const extracted = await ctx.mindGardenMemory.extract(agent, {
      provider: 'relationship-errors', model: 'relationship-errors',
    })
    if (!extracted.ok) throw new Error('extraction failed')

    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[1]!.id,
      ifVersion: extracted.value.candidates[1]!.version,
      resolution: 'keep-both',
      recallPolicy: 'relevant',
    })).resolves.toMatchObject({ ok: false, error: { code: 'high-sensitivity-recall-forbidden' } })
    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[1]!.id,
      ifVersion: extracted.value.candidates[1]!.version,
      resolution: 'keep-both',
      recallPolicy: 'never',
      temporaryDays: 0,
    })).resolves.toMatchObject({ ok: false, error: { code: 'temporary-period-invalid' } })
    const accepted = await ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[1]!.id,
      ifVersion: extracted.value.candidates[1]!.version,
      resolution: 'keep-both',
      recallPolicy: 'never',
      scope: '',
    })
    expect(accepted).toMatchObject({ ok: true, value: { candidate: { status: 'confirmed' } } })
    if (!accepted.ok) throw new Error('coexistence failed')
    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: accepted.value.candidate.id,
      ifVersion: accepted.value.candidate.version,
      resolution: 'keep-existing',
    })).resolves.toMatchObject({ ok: false, error: { code: 'invalid-transition' } })

    const changedTarget = await ctx.mindGardenMemory.update(agent, {
      id: target.value.id,
      ifVersion: target.value.version,
      scope: 'weekday travel',
    })
    if (!changedTarget.ok) throw new Error('target update failed')
    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[0]!.id,
      ifVersion: extracted.value.candidates[0]!.version,
      resolution: 'keep-existing',
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'relationship-stale', current: { id: target.value.id, scope: 'weekday travel' } },
    })
    await expect(ctx.mindGardenMemory.reject(agent, {
      id: extracted.value.candidates[0]!.id,
      ifVersion: extracted.value.candidates[0]!.version,
    })).resolves.toMatchObject({
      ok: true,
      value: { status: 'rejected', relationship: { status: 'resolved', resolution: 'keep-existing' } },
    })
    await ctx.mindGardenMemory.delete(agent, {
      id: changedTarget.value.id, ifVersion: changedTarget.value.version,
    })
    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: extracted.value.candidates[2]!.id,
      ifVersion: extracted.value.candidates[2]!.version,
      resolution: 'keep-existing',
    })).resolves.toEqual({ ok: false, error: { code: 'relationship-stale', current: null } })
    await ctx.fiber.dispose()
  })

  it('supports temporary replacement and idempotently finishes an already-applied replacement', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('relationship-recovery')
    const shared = createUserMessage({
      content: [{ type: 'text', text: 'I now prefer a quiet minute.' }], source: { kind: 'user' },
    })
    agent.session.append('user/message', shared, { surfaceOp: 'append' })
    const targetCandidate = await ctx.mindGardenMemory.propose(agent, {
      kind: 'preference',
      content: 'I previously preferred immediate advice.',
      reason: 'Earlier support preference.',
      scope: 'old context',
      source: { messageId: shared.id, evidenceQuote: 'I now prefer a quiet minute.' },
    })
    if (!targetCandidate.ok) throw new Error('target proposal failed')
    const target = await ctx.mindGardenMemory.confirm(agent, {
      id: targetCandidate.value.id,
      ifVersion: targetCandidate.value.version,
      recallPolicy: 'relevant',
      temporaryDays: 2,
    })
    if (!target.ok) throw new Error('temporary target failed')
    const second = createUserMessage({
      content: [{ type: 'text', text: 'I later prefer one written next step.' }], source: { kind: 'user' },
    })
    agent.session.append('user/message', second, { surfaceOp: 'append' })
    const adapter = new ScriptedExtractionAdapter([
      response(JSON.stringify({ memories: [{
        kind: 'preference',
        content: 'I now prefer a quiet minute.',
        reason: 'Current support preference.',
        sourceMessageId: shared.id,
        evidenceQuote: 'I now prefer a quiet minute.',
        confidence: 0.95,
        importance: 0.95,
        relationship: {
          type: 'contradiction', targetMemoryId: target.value.id, rationale: 'The preference changed.',
        },
      }] })),
      response(JSON.stringify({ memories: [{
        kind: 'preference',
        content: 'I later prefer one written next step.',
        reason: 'Later support preference.',
        sourceMessageId: second.id,
        evidenceQuote: 'I later prefer one written next step.',
        confidence: 0.95,
        importance: 0.95,
        relationship: {
          type: 'refinement', targetMemoryId: target.value.id, rationale: 'The preferred format changed.',
        },
      }] })),
    ])
    ctx.llm.registerAdapter(['relationship-recovery'], adapter)
    const first = await ctx.mindGardenMemory.extract(agent, {
      provider: 'relationship-recovery', model: 'relationship-recovery',
    })
    if (!first.ok) throw new Error('first extraction failed')
    const temporary = await ctx.mindGardenMemory.resolveRelationship(agent, {
      id: first.value.candidates[0]!.id,
      ifVersion: first.value.candidates[0]!.version,
      resolution: 'replace-existing',
      recallPolicy: 'relevant',
      temporaryDays: 1,
    })
    expect(temporary).toMatchObject({
      ok: true,
      value: { activeMemory: { status: 'temporary', content: 'I now prefer a quiet minute.' } },
    })
    if (!temporary.ok) throw new Error('temporary replacement failed')

    const secondExtraction = await ctx.mindGardenMemory.extract(agent, {
      provider: 'relationship-recovery', model: 'relationship-recovery',
    })
    if (!secondExtraction.ok) throw new Error('second extraction failed')
    const pending = secondExtraction.value.candidates[0]!
    const rawTarget = storedMemorySchema.parse(await ctx.mindGardenVault.get(
      'memories', MindGardenVaultRecordId(target.value.id),
    ))
    const applied = storedMemorySchema.parse({
      ...rawTarget,
      version: '60000000-0000-4000-8000-000000000060',
      content: pending.content,
      revisions: [...(rawTarget.revisions ?? []), {
        id: '70000000-0000-4000-8000-000000000070',
        action: 'replaced',
        status: rawTarget.status,
        kind: rawTarget.kind,
        sensitivity: rawTarget.sensitivity,
        content: rawTarget.content,
        reason: rawTarget.reason,
        ...(rawTarget.scope === undefined ? {} : { scope: rawTarget.scope }),
        recallPolicy: rawTarget.recallPolicy,
        sources: rawTarget.sources,
        createdAt: rawTarget.updatedAt,
        relatedMemoryId: pending.id,
      }],
      updatedAt: rawTarget.updatedAt + 1,
    })
    await ctx.mindGardenVault.put(
      'memories', MindGardenVaultRecordId(applied.id), applied as never,
    )
    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: pending.id,
      ifVersion: pending.version,
      resolution: 'replace-existing',
      recallPolicy: 'never',
    })).resolves.toMatchObject({
      ok: true,
      value: { candidate: { status: 'superseded' }, activeMemory: { version: applied.version } },
    })
    await ctx.fiber.dispose()
  })

  it('treats an unchanged but inactive relationship target as stale', async () => {
    const { ctx, makeAgent } = await serviceHarness()
    const agent = makeAgent('relationship-inactive-target')
    const targetId = '10000000-0000-4000-8000-000000000081'
    const targetVersion = '20000000-0000-4000-8000-000000000082'
    const target = storedMemorySchema.parse({
      recordType: 'memory',
      formatVersion: 1,
      id: targetId,
      version: targetVersion,
      status: 'rejected',
      kind: 'fact',
      sensitivity: 'normal',
      content: 'Inactive target.',
      reason: 'Fixture.',
      recallPolicy: 'never',
      sources: [{ sessionId: agent.id }],
      createdAt: 1,
      updatedAt: 1,
    })
    const candidate = storedMemorySchema.parse({
      ...target,
      id: '30000000-0000-4000-8000-000000000083',
      version: '40000000-0000-4000-8000-000000000084',
      status: 'candidate',
      content: 'Pending candidate.',
      relationship: {
        type: 'refinement',
        targetMemoryId: targetId,
        targetVersion,
        rationale: 'Possible relation.',
        status: 'pending',
      },
    })
    await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(target.id), target as never)
    await ctx.mindGardenVault.put('memories', MindGardenVaultRecordId(candidate.id), candidate as never)
    await expect(ctx.mindGardenMemory.resolveRelationship(agent, {
      id: candidate.id as never,
      ifVersion: candidate.version as never,
      resolution: 'replace-existing',
      recallPolicy: 'never',
    })).resolves.toMatchObject({
      ok: false, error: { code: 'relationship-stale', current: { status: 'rejected' } },
    })
    await ctx.fiber.dispose()
  })

  it('ranks and filters unreviewable extraction proposals before encrypted persistence', async () => {
    const { ctx, makeAgent } = await serviceHarness({
      maxContentBytes: 64,
      maxReasonBytes: 32,
      maxScopeBytes: 16,
      maxEvidenceBytes: 16,
      maxExtractionCandidates: 3,
    })
    const agent = makeAgent('extraction-filtering')
    const targetCandidate = await ctx.mindGardenMemory.propose(agent, {
      kind: 'fact', content: 'I use a simple baseline.', reason: 'Comparison baseline.',
    })
    if (!targetCandidate.ok) throw new Error('target proposal failed')
    const target = await ctx.mindGardenMemory.confirm(agent, {
      id: targetCandidate.value.id,
      ifVersion: targetCandidate.value.version,
      recallPolicy: 'relevant',
    })
    if (!target.ok) throw new Error('target confirmation failed')
    const texts = [
      'low confidence',
      'quote source',
      'blank content source',
      'question source',
      'diagnosis source',
      'secret source',
      'valid evidence',
      'second evidence',
      'third evidence',
      'evidence long evidence long',
    ]
    const messages = texts.map(text => createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
    for (const message of messages) agent.session.append('user/message', message, { surfaceOp: 'append' })
    const proposal = (index: number, overrides: Record<string, unknown> = {}) => ({
      kind: 'fact',
      content: `I retain ${texts[index]}.`,
      reason: 'Review value.',
      sourceMessageId: messages[index]!.id,
      evidenceQuote: texts[index],
      confidence: 0.9,
      importance: 0.9,
      ...overrides,
    })
    const firstRows = [
      proposal(0, { confidence: 0.1 }),
      proposal(1, { sourceMessageId: 'missing' }),
      proposal(1, { evidenceQuote: 'not present' }),
      proposal(2, { content: '   ' }),
      proposal(3, { content: 'Is this a memory?' }),
      proposal(4, { content: 'I have a personality disorder diagnosis.' }),
      proposal(5, { content: 'password = abcdefghijklmnop' }),
      proposal(6, { content: 'I value a short reset.', sensitivity: 'high', scope: 'work' }),
    ]
    const secondRows = [
      proposal(7, { content: 'I prefer one clear next step.', importance: 1 }),
      proposal(7, { content: 'I prefer another next step.', importance: 0.99 }),
      proposal(8, { content: 'I prefer one clear next step.', importance: 0.98 }),
      proposal(8, { content: 'x'.repeat(65), importance: 0.97 }),
      proposal(8, { reason: '   ', importance: 0.96 }),
      proposal(8, { scope: 'x'.repeat(17), importance: 0.95 }),
      proposal(9, { importance: 0.94 }),
      proposal(8, {
        importance: 0.93,
        relationship: {
          type: 'duplicate',
          targetMemoryId: '00000000-0000-4000-8000-000000000098',
          rationale: 'Unknown target.',
        },
      }),
    ]
    const adapter = new ScriptedExtractionAdapter([
      response(JSON.stringify({ memories: firstRows })),
      response(JSON.stringify({ memories: secondRows })),
      response(JSON.stringify({ memories: [
        proposal(7, { content: 'I prefer one clear next step.', importance: 1 }),
        proposal(4, { content: 'Your attachment style is avoidant.', importance: 0.99 }),
        proposal(4, { content: 'Your subconscious controls this choice.', importance: 0.98 }),
        proposal(4, { content: 'Your risk level is high.', importance: 0.97 }),
        proposal(4, {
          content: 'I keep a related valid fact.',
          importance: 0.95,
          relationship: {
            type: 'refinement',
            targetMemoryId: target.value.id,
            rationale: 'x'.repeat(33),
          },
        }),
        proposal(8, { content: 'I keep a distinct valid fact.', importance: 0.9 }),
        proposal(6, { content: 'I keep another distinct valid fact.', importance: 0.9 }),
        proposal(5, { content: 'I keep a third distinct valid fact.', importance: 0.8 }),
      ] })),
    ])
    ctx.llm.registerAdapter(['filtering'], adapter)
    const first = await ctx.mindGardenMemory.extract(agent, { provider: 'filtering', model: 'filtering' })
    expect(first).toMatchObject({
      ok: true, value: { candidates: [{ content: 'I value a short reset.', sensitivity: 'high', scope: 'work' }] },
    })
    const second = await ctx.mindGardenMemory.extract(agent, { provider: 'filtering', model: 'filtering' })
    expect(second).toMatchObject({
      ok: true, value: { candidates: [{ content: 'I prefer one clear next step.' }] },
    })
    const third = await ctx.mindGardenMemory.extract(agent, { provider: 'filtering', model: 'filtering' })
    expect(third).toMatchObject({
      ok: true,
      value: { candidates: [
        { content: 'I keep a distinct valid fact.' },
        { content: 'I keep another distinct valid fact.' },
        { content: 'I keep a third distinct valid fact.' },
      ] },
    })
    await ctx.fiber.dispose()
  })
})

function response(text: string): StreamChunk[] {
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text },
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

function toolResponse(id: string, name: string, args: Record<string, string>): StreamChunk[] {
  const input = JSON.stringify(args)
  return [
    { type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id: id as never, name, argumentsDelta: input },
    { type: 'block-end', index: 0, block: { type: 'tool-call', id: id as never, name, arguments: input } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  ]
}

function textLeaves(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(textLeaves)
  if (value === null || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  const own = record.type === 'text' && typeof record.text === 'string' ? [record.text] : []
  return [...own, ...Object.values(record).flatMap(textLeaves)]
}

class RecallAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    yield* response('I remember that a short walk can help; would that fit today?')
  }
}

class CorrectionAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []
  private pending: { readonly id: string; readonly version: string } | undefined
  private attemptedSameTurnConfirmation = false
  private confirmationCalls = 0

  constructor(private readonly options: {
    readonly proposalReply?: string
    readonly confirmationText?: string
    readonly confirmationEvidenceQuote?: string
    readonly decisionAction?: 'confirm' | 'cancel'
  } = {}) {
    super()
  }

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    if (this.requests.length > 8) throw new Error('correction adapter exceeded its expected step count')
    const human = options.messages.filter(message => message.source.kind === 'user').at(-1)
    const humanText = human?.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('') ?? ''
    const result = textLeaves(options.messages.at(-1)).flatMap((text) => {
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>
        return typeof parsed.status === 'string' ? [parsed] : []
      } catch {
        return []
      }
    })[0]
    if (result?.status === 'awaiting-confirmation') {
      this.pending = { id: String(result.proposal_id), version: String(result.proposal_version) }
      this.attemptedSameTurnConfirmation = true
      yield* toolResponse('call-premature-confirm-correction', 'mind_garden_memory_correction', {
        action: 'confirm',
        evidence_quote: '你记错了：我难受时更希望先被听见，不要马上给建议。',
        proposal_id: this.pending.id,
        proposal_version: this.pending.version,
      })
      return
    }
    if (result?.status === 'updated') {
      yield* response('改好了。谢谢你直接纠正我；这一次我先听你说。')
      return
    }
    if (options.messages.at(-1)?.source.kind === 'tool') {
      if (this.attemptedSameTurnConfirmation) {
        this.attemptedSameTurnConfirmation = false
        yield* response(this.options.proposalReply
          ?? '我会以你现在说的为准。要把长期记忆改成“我难受时更希望先被听见，不要马上给建议。”吗？')
        return
      }
      yield* response(`Correction tool failed: ${textLeaves(options.messages.at(-1)).join(' ')}`)
      return
    }
    if (humanText.includes('你记错了')) {
      const recall = options.messages.find(message => message.source.kind === 'plugin'
        && message.source.plugin === 'mind-garden-memory'
        && message.source.form === 'recall')
      const recallText = recall?.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('') ?? ''
      const memoryId = /\[memory-id:([0-9a-f-]+)\]/u.exec(recallText)?.[1]
      if (memoryId === undefined) throw new Error('correction test did not receive a memory id')
      yield* toolResponse('call-propose-correction', 'mind_garden_memory_correction', {
        action: 'propose',
        evidence_quote: '你记错了：我难受时更希望先被听见，不要马上给建议。',
        memory_id: memoryId,
        corrected_content: '我难受时更希望先被听见，不要马上给建议。',
      })
      return
    }
    const confirmationText = this.options.confirmationText ?? '对，就这样改。'
    if (humanText.includes(confirmationText)) {
      if (this.pending === undefined) throw new Error('correction confirmation lacks a pending proposal')
      this.confirmationCalls += 1
      yield* toolResponse(`call-confirm-correction-${this.confirmationCalls}`, 'mind_garden_memory_correction', {
        action: this.options.decisionAction ?? 'confirm',
        evidence_quote: this.options.confirmationEvidenceQuote ?? confirmationText,
        proposal_id: this.pending.id,
        proposal_version: this.pending.version,
      })
      return
    }
    yield* response('I am listening.')
  }
}

class ScriptedExtractionAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []

  constructor(private readonly scripts: StreamChunk[][]) {
    super()
  }

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    yield* (this.scripts.shift() ?? response('{"memories":[]}'))
  }
}

class HeldExtractionAdapter extends LlmAdapter {
  private readonly enteredDeferred = Promise.withResolvers<undefined>()
  private readonly gate = Promise.withResolvers<undefined>()
  readonly entered = this.enteredDeferred.promise

  release(): void {
    this.gate.resolve(undefined)
  }

  override async * stream(_options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.enteredDeferred.resolve(undefined)
    await this.gate.promise
    yield* response('{"memories":[]}')
  }
}

class CallbackExtractionAdapter extends LlmAdapter {
  constructor(
    private readonly callback: () => Promise<void>,
    private readonly script: StreamChunk[],
  ) {
    super()
  }

  override async * stream(_options: GenerateOptions): AsyncIterable<StreamChunk> {
    await this.callback()
    yield* this.script
  }
}

class DialogueAndExtractionAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    yield* response(options.purpose === 'mind-garden-memory-extraction'
      ? '{"memories":[]}'
      : 'That sounds worth noticing gently.')
  }
}

class UndisclosedCorrectionAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    if (options.messages.at(-1)?.source.kind === 'tool') {
      yield* response(textLeaves(options.messages.at(-1)).join(' '))
      return
    }
    yield* toolResponse('call-undisclosed-correction', 'mind_garden_memory_correction', {
      action: 'propose',
      evidence_quote: '请改掉那条记忆。',
      memory_id: '00000000-0000-4000-8000-000000000001',
      corrected_content: '我希望先被听见。',
    })
  }
}

async function correctionLoopHarness(id: string, adapter: CorrectionAdapter) {
  const { ctx, pool } = await storageContext()
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(MindGardenService)
  await ctx.plugin(MindGardenVault)
  await ctx.plugin(MindGardenMemory)
  await ctx.plugin(AgentLoop, { agents: [] })
  ctx.llm.registerAdapter(['mock'], adapter)
  const agent = ctx.agentLoop.create(SessionId(id), { provider: 'mock', model: 'test' })
  ctx.mindGarden.activate(agent.session, {
    mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: true,
  })
  const proposal = await ctx.mindGardenMemory.propose(agent, {
    kind: 'support-preference',
    content: '我难受时希望马上得到建议。',
    reason: 'Use the response style the user prefers.',
  })
  if (!proposal.ok) throw new Error('memory proposal failed')
  const original = await ctx.mindGardenMemory.confirm(agent, {
    id: proposal.value.id,
    ifVersion: proposal.value.version,
    recallPolicy: 'relevant',
  })
  if (!original.ok) throw new Error('memory confirmation failed')
  return { ctx, pool, agent, original }
}

describe('Mind Garden memory real AgentLoop composition', () => {
  it('unregisters the conversational correction tool when the plugin fiber is disposed', async () => {
    const { ctx } = await storageContext()
    ctx.provide('agents', { get: () => undefined } as never)
    ctx.provide('mindGarden', { current: () => null } as never)
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(MindGardenVault)
    const memoryFiber = await ctx.plugin(MindGardenMemory)
    const tool = ctx.tools.get('mind_garden_memory_correction')
    const presentationArgs = {
      action: 'propose',
      evidence_quote: 'That memory is wrong.',
      memory_id: 'memory-id',
      corrected_content: 'I prefer listening first.',
    }
    expect(tool?.presentCall?.(presentationArgs)).toEqual({
      card: 'generic',
      title: '更新记忆 · Memory correction',
      kind: 'other',
    })
    expect(tool?.presentResult?.(presentationArgs, { content: [], isError: false })).toEqual({
      card: 'generic',
      content: [],
    })

    await memoryFiber.dispose()
    expect(ctx.tools.get('mind_garden_memory_correction')).toBeUndefined()
    await ctx.fiber.dispose()
  })

  it('claims real Agent maintenance for an authorized post-turn automatic review', async () => {
    const { ctx } = await storageContext()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(MindGardenService)
    await ctx.plugin(MindGardenVault)
    await ctx.plugin(MindGardenMemory, { extractionProvider: 'mock', extractionModel: 'extractor' })
    await ctx.plugin(AgentLoop, { agents: [] })
    const adapter = new DialogueAndExtractionAdapter()
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('memory-automatic-real-loop'), {
      provider: 'mock', model: 'dialogue',
    })
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: true,
    })
    const policy = await ctx.mindGardenMemory.setAutomationPolicy(agent, {
      enabled: true,
      minimumCompletedTurns: 1,
      ifVersion: null,
    })
    if (!policy.ok) throw new Error('automation policy failed')
    const message = createUserMessage({
      content: [{ type: 'text', text: 'A quiet walk helped after a demanding afternoon.' }],
      source: { kind: 'user' },
    })
    agent.followup(message)
    await agent.whenIdle()
    await vi.waitFor(() => {
      expect(adapter.requests.filter(request => request.purpose === 'mind-garden-memory-extraction'))
        .toHaveLength(1)
    })
    await expect(ctx.mindGardenMemory.latestExtraction(agent)).resolves.toMatchObject({
      ok: true,
      value: { run: { trigger: 'automatic', sourceMessageIds: [message.id], status: 'completed' } },
    })
    await expect(ctx.mindGardenMemory.automationPolicy(agent)).resolves.toMatchObject({
      ok: true,
      value: { lastAttemptedTurn: 1, lastOutcome: 'completed' },
    })
    expect(agent.status).toBe('idle')
    await ctx.fiber.dispose()
  })

  it('logs and sends only confirmed bounded recall after persisting its encrypted audit', async () => {
    const { ctx, pool } = await storageContext()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(MindGardenService)
    await ctx.plugin(MindGardenVault)
    await ctx.plugin(MindGardenMemory)
    await ctx.plugin(AgentLoop, { agents: [] })
    const adapter = new RecallAdapter()
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('memory-real-loop'), { provider: 'mock', model: 'test' })
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: true,
    })

    const candidate = await ctx.mindGardenMemory.propose(agent, {
      kind: 'support-preference',
      content: 'A short walk helps when work feels overwhelming.',
      reason: 'User-approved support preference.',
      scope: 'work stress',
    })
    if (!candidate.ok) throw new Error('proposal failed')
    const confirmed = await ctx.mindGardenMemory.confirm(agent, {
      id: candidate.value.id,
      ifVersion: candidate.value.version,
      recallPolicy: 'relevant',
    })
    if (!confirmed.ok) throw new Error('confirmation failed')

    agent.followup(createUserMessage({
      content: [{ type: 'text', text: 'Work is overwhelming today.' }],
      source: { kind: 'user' },
    }))
    await agent.whenIdle()

    const recalled = adapter.requests[0]?.messages.find(message =>
      message.source.kind === 'plugin' && message.source.plugin === 'mind-garden-memory',
    )
    expect(recalled).toMatchObject({ role: 'user', source: { form: 'recall' } })
    expect(JSON.stringify(recalled)).toContain('A short walk helps')
    expect(agent.session.events.some(event =>
      event.type === 'user/message'
      && event.data.source.kind === 'plugin'
      && event.data.source.plugin === 'mind-garden-memory',
    )).toBe(true)
    await expect(ctx.mindGardenMemory.latestAudit(agent)).resolves.toMatchObject({
      ok: true,
      value: { audit: { sentToModel: true, matches: [{ memoryId: confirmed.value.id, reason: 'relevant' }] } },
    })
    expect(JSON.stringify(pool.media.get('mind_garden_vault'))).not.toContain('A short walk helps')
    await ctx.fiber.dispose()
  })

  it('suppresses matching recall and its sent audit when safety answers the turn locally', async () => {
    const { ctx } = await storageContext()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(MindGardenService)
    await ctx.plugin(MindGardenVault)
    await ctx.plugin(MindGardenMemory)
    await ctx.plugin(mindGardenSafety)
    await ctx.plugin(AgentLoop, { agents: [] })
    const adapter = new RecallAdapter()
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('memory-safety-local'), { provider: 'mock', model: 'test' })
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: true,
    })

    const candidate = await ctx.mindGardenMemory.propose(agent, {
      kind: 'fact',
      content: 'The rooftop is where I go when work feels overwhelming.',
      reason: 'User-confirmed place context.',
    })
    if (!candidate.ok) throw new Error('proposal failed')
    const confirmed = await ctx.mindGardenMemory.confirm(agent, {
      id: candidate.value.id,
      ifVersion: candidate.value.version,
      recallPolicy: 'relevant',
    })
    if (!confirmed.ok) throw new Error('confirmation failed')

    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '我现在要跳楼，已经在楼顶。' }],
      source: { kind: 'user' },
    }))
    await agent.whenIdle()

    expect(adapter.requests).toEqual([])
    expect(agent.session.events.some(event =>
      event.type === 'user/message'
      && event.data.source.kind === 'plugin'
      && event.data.source.plugin === 'mind-garden-memory',
    )).toBe(false)
    await expect(ctx.mindGardenMemory.latestAudit(agent)).resolves.toEqual({
      ok: true,
      value: { audit: null },
    })
    expect(agent.session.events.find(event => event.type === 'mind-garden/safety-assessment')?.data)
      .toMatchObject({ response: 'local', assessment: { level: 3 } })
    await ctx.fiber.dispose()
  })

  it('keeps correction invisible until activation and replaces recalled memory after a later confirmation', async () => {
    const { ctx } = await storageContext()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(MindGardenService)
    await ctx.plugin(MindGardenVault)
    await ctx.plugin(MindGardenMemory)
    await ctx.plugin(AgentLoop, { agents: [] })
    const adapter = new CorrectionAdapter()
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('memory-correction-real-loop'), {
      provider: 'mock', model: 'test',
    })
    const hidden = await ctx.systemPrompt.assemble(assembleContextFor(agent))
    expect(hidden.tools.map(tool => tool.name)).not.toContain('mind_garden_memory_correction')
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: true,
    })
    const visible = await ctx.systemPrompt.assemble(assembleContextFor(agent))
    expect(visible.tools.map(tool => tool.name)).toContain('mind_garden_memory_correction')

    const proposal = await ctx.mindGardenMemory.propose(agent, {
      kind: 'support-preference',
      content: '我难受时希望马上得到建议。',
      reason: 'Use the response style the user prefers.',
    })
    if (!proposal.ok) throw new Error('memory proposal failed')
    const original = await ctx.mindGardenMemory.confirm(agent, {
      id: proposal.value.id,
      ifVersion: proposal.value.version,
      recallPolicy: 'relevant',
    })
    if (!original.ok) throw new Error('memory confirmation failed')

    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })
    const awaiting = await ctx.mindGardenMemory.list(agent)
    if (!awaiting.ok) throw new Error('memory list failed')
    const correctionCandidate = awaiting.value.items.find(item => item.status === 'candidate')
    expect(awaiting.value.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: original.value.id, content: '我难受时希望马上得到建议。' }),
    ]))
    expect(correctionCandidate).toMatchObject({
      status: 'candidate',
      content: '我难受时更希望先被听见，不要马上给建议。',
    })
    expect(correctionCandidate?.relationship).toMatchObject({
      targetMemoryId: original.value.id,
      status: 'pending',
    })
    expect(adapter.requests[0]?.tools?.map(tool => tool.name)).toContain('mind_garden_memory_correction')
    const prematureResult = agent.session.events.find(event => event.type === 'tool/result'
      && event.data.message.source.callId === 'call-premature-confirm-correction')
    expect(JSON.stringify(prematureResult)).toContain('MIND_GARDEN_MEMORY_CORRECTION_CONFIRMATION_REQUIRED')

    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '对，就这样改。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })
    const assistantText = agent.session.events.flatMap(event => event.type === 'assistant/message'
      ? event.data.message.content.flatMap(block => block.type === 'text' ? [block.text] : [])
      : [])
    expect(assistantText).toEqual([
      '我会以你现在说的为准。要把长期记忆改成“我难受时更希望先被听见，不要马上给建议。”吗？',
      '改好了。谢谢你直接纠正我；这一次我先听你说。',
    ])
    const corrected = await ctx.mindGardenMemory.list(agent)
    if (!corrected.ok) throw new Error('memory list failed')
    const active = corrected.value.items.find(item => item.id === original.value.id)
    expect(corrected.value.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ status: 'superseded', supersededBy: original.value.id }),
    ]))
    expect(active).toMatchObject({
      status: 'confirmed',
      content: '我难受时更希望先被听见，不要马上给建议。',
      recallPolicy: 'relevant',
    })
    expect(active?.sources.some(source => source.evidenceQuote === '对，就这样改。')).toBe(true)
    await ctx.fiber.dispose()
  })

  it.each([
    ['Chinese mixed approval and refusal', 'memory-correction-refusal-zh', '对，但别改记忆。', '对'],
    ['Chinese approval followed by no-save', 'memory-correction-refusal-save', '没错，不过不要保存。', '没错'],
    ['Chinese approval followed by reluctance', 'memory-correction-refusal-reluctant', '对，但我不想改。', '对'],
    ['Chinese approval followed by no need', 'memory-correction-refusal-needless', '是的，但不需要保存。', '是的'],
    ['English approval followed by refusal', 'memory-correction-refusal-en', 'yes, but do not change it.', 'yes'],
    ['English approval followed by curly-apostrophe refusal', 'memory-correction-refusal-curly', 'Yes, but I don’t want it changed.', 'Yes'],
    ['question quoting approval', 'memory-correction-question-approval', '你是说“可以”就会保存吗？', '可以'],
    ['reported approval', 'memory-correction-reported-approval', '他说可以保存。', '可以'],
    ['uncertain approval', 'memory-correction-uncertain-approval', '可以吧，我还不确定。', '可以'],
    ['unrelated use of approval word', 'memory-correction-unrelated-approval', '我今天可以早点休息。', '可以'],
  ])('refuses confirmation for %s in the complete human message', async (
    _label,
    sessionId,
    confirmationText,
    confirmationEvidenceQuote,
  ) => {
    const adapter = new CorrectionAdapter({
      confirmationText,
      confirmationEvidenceQuote,
    })
    const { ctx, agent, original } = await correctionLoopHarness(sessionId, adapter)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: confirmationText }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })

    const result = agent.session.events.find(event => event.type === 'tool/result'
      && event.data.message.source.callId === 'call-confirm-correction-1')
    expect(JSON.stringify(result)).toContain('MIND_GARDEN_MEMORY_CORRECTION_CONFIRMATION_REQUIRED')
    const memories = await ctx.mindGardenMemory.list(agent)
    if (!memories.ok) throw new Error('memory list failed')
    expect(memories.value.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: original.value.id, content: '我难受时希望马上得到建议。' }),
      expect.objectContaining({ status: 'candidate', content: '我难受时更希望先被听见，不要马上给建议。' }),
    ]))
  })

  it('accepts a common clear approval phrased without a dedicated command', async () => {
    const confirmationText = '可以，就按你说的。'
    const adapter = new CorrectionAdapter({ confirmationText })
    const { ctx, agent, original } = await correctionLoopHarness('memory-correction-natural-approval', adapter)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: confirmationText }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })
    const memories = await ctx.mindGardenMemory.list(agent)
    if (!memories.ok) throw new Error('memory list failed')
    expect(memories.value.items.find(item => item.id === original.value.id)).toMatchObject({
      status: 'confirmed',
      content: '我难受时更希望先被听见，不要马上给建议。',
    })
  })

  it('refuses confirmation until the exact proposed wording appears in user-visible history', async () => {
    const adapter = new CorrectionAdapter({ proposalReply: '我记下了这个方向。这样改可以吗？' })
    const { ctx, agent, original } = await correctionLoopHarness('memory-correction-hidden-proposal', adapter)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '对，就这样改。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })

    const result = agent.session.events.find(event => event.type === 'tool/result'
      && event.data.message.source.callId === 'call-confirm-correction-1')
    expect(JSON.stringify(result)).toContain('MIND_GARDEN_MEMORY_CORRECTION_PROPOSAL_NOT_PRESENTED')
    const memories = await ctx.mindGardenMemory.list(agent)
    if (!memories.ok) throw new Error('memory list failed')
    expect(memories.value.items.find(item => item.id === original.value.id)).toMatchObject({
      content: '我难受时希望马上得到建议。',
    })
  })

  it('does not bind an unrelated later question to a proposal stated separately', async () => {
    const adapter = new CorrectionAdapter({
      proposalReply: '我会把长期记忆改成“我难受时更希望先被听见，不要马上给建议。”。今天还好吗？',
    })
    const { ctx, agent, original } = await correctionLoopHarness('memory-correction-unrelated-question', adapter)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '对，就这样改。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })

    const result = agent.session.events.find(event => event.type === 'tool/result'
      && event.data.message.source.callId === 'call-confirm-correction-1')
    expect(JSON.stringify(result)).toContain('MIND_GARDEN_MEMORY_CORRECTION_PROPOSAL_NOT_PRESENTED')
    const memories = await ctx.mindGardenMemory.list(agent)
    if (!memories.ok) throw new Error('memory list failed')
    expect(memories.value.items.find(item => item.id === original.value.id)).toMatchObject({
      content: '我难受时希望马上得到建议。',
    })
  })

  it('refuses to cancel a pending proposal from an unrelated complete message', async () => {
    const confirmationText = '今天天气不错。'
    const adapter = new CorrectionAdapter({ confirmationText, decisionAction: 'cancel' })
    const { ctx, agent, original } = await correctionLoopHarness('memory-correction-cancel-unrelated', adapter)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: confirmationText }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })

    const result = agent.session.events.find(event => event.type === 'tool/result'
      && event.data.message.source.callId === 'call-confirm-correction-1')
    expect(JSON.stringify(result)).toContain('MIND_GARDEN_MEMORY_CORRECTION_CANCELLATION_REQUIRED')
    const memories = await ctx.mindGardenMemory.list(agent)
    if (!memories.ok) throw new Error('memory list failed')
    expect(memories.value.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: original.value.id, status: 'confirmed' }),
      expect.objectContaining({ status: 'candidate' }),
    ]))
  })

  it('cancels only after a later complete human message explicitly withdraws the proposal', async () => {
    const confirmationText = '对，但别改记忆。'
    const adapter = new CorrectionAdapter({ confirmationText, decisionAction: 'cancel' })
    const { ctx, agent, original } = await correctionLoopHarness('memory-correction-cancel-explicit', adapter)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: confirmationText }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })

    const result = agent.session.events.find(event => event.type === 'tool/result'
      && event.data.message.source.callId === 'call-confirm-correction-1')
    expect(textLeaves(result).some(text => text.includes('"status":"cancelled"'))).toBe(true)
    const memories = await ctx.mindGardenMemory.list(agent)
    if (!memories.ok) throw new Error('memory list failed')
    expect(memories.value.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: original.value.id, status: 'confirmed' }),
      expect.objectContaining({ status: 'rejected' }),
    ]))
  })

  it('finishes candidate settlement when confirmation retries after the target write committed', async () => {
    const adapter = new CorrectionAdapter()
    const { ctx, agent, original } = await correctionLoopHarness('memory-correction-recovery', adapter)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '你记错了：我难受时更希望先被听见，不要马上给建议。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(3)
    })

    const put = ctx.mindGardenVault.put.bind(ctx.mindGardenVault)
    let interruptSettlement = true
    vi.spyOn(ctx.mindGardenVault, 'put').mockImplementation(async (domain, id, value) => {
      const record = value as Record<string, unknown>
      if (interruptSettlement && record.recordType === 'memory' && record.status === 'superseded') {
        interruptSettlement = false
        throw new Error('simulated candidate settlement interruption')
      }
      return await put(domain, id, value)
    })

    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '对，就这样改。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(5)
    })
    const interrupted = await ctx.mindGardenMemory.list(agent)
    if (!interrupted.ok) throw new Error('memory list failed')
    expect(interrupted.value.items.find(item => item.id === original.value.id)).toMatchObject({
      content: '我难受时更希望先被听见，不要马上给建议。',
    })
    expect(interrupted.value.items.some(item => item.status === 'candidate')).toBe(true)

    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '对，就这样改。' }],
      source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(agent.session.events.filter(event => event.type === 'assistant/message')).toHaveLength(7)
    })
    const recovered = await ctx.mindGardenMemory.list(agent)
    if (!recovered.ok) throw new Error('memory list failed')
    expect(recovered.value.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: original.value.id, content: '我难受时更希望先被听见，不要马上给建议。' }),
      expect.objectContaining({ status: 'superseded', supersededBy: original.value.id }),
    ]))
    expect(recovered.value.items.some(item => item.status === 'candidate')).toBe(false)
  })

  it('denies an undisclosed correction call even when an alternate model invokes the hidden tool', async () => {
    const { ctx } = await storageContext()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(MindGardenService)
    await ctx.plugin(MindGardenVault)
    await ctx.plugin(MindGardenMemory)
    await ctx.plugin(AgentLoop, { agents: [] })
    const adapter = new UndisclosedCorrectionAdapter()
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('memory-undisclosed-tool'), { provider: 'mock', model: 'test' })
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: false,
    })

    agent.followup(createUserMessage({
      content: [{ type: 'text', text: '请改掉那条记忆。' }],
      source: { kind: 'user' },
    }))
    await agent.whenIdle()
    expect(adapter.requests[0]?.tools?.map(tool => tool.name) ?? []).not.toContain('mind_garden_memory_correction')
    const result = agent.session.events.find(event => event.type === 'tool/result'
      && event.data.message.source.callId === 'call-undisclosed-correction')
    expect(JSON.stringify(result)).toContain('MIND_GARDEN_MEMORY_CORRECTION_ACCESS_DENIED')
    expect(JSON.stringify(result)).toContain('model-disclosure-required')
  })
})
