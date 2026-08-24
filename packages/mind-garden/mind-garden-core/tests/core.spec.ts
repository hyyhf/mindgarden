import { Context } from '@deepseek-ai/cordis'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MindGardenService, {
  applyMindGardenChange,
  applyMindGardenEvent,
  applyMindGardenProjection,
  decodeMindGardenStateEvent,
  foldMindGarden,
  MindGardenError,
  mindGardenProjectionDefinition,
  mindGardenProjectionSchema,
  mindGardenSessionStateSchema,
} from '@deepseek-ai/dsh-mind-garden/core'
import type {
  MindGardenOperation,
  MindGardenSessionState,
  MindGardenSessionStateEvent,
} from '@deepseek-ai/dsh-mind-garden/core'

const activated: MindGardenSessionState = {
  revision: 1,
  activatedAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  mode: 'serenity',
  supportIntent: 'listen',
  privacy: 'durable',
  contractVersion: 1,
  modelDisclosureAccepted: false,
}

function change(
  operation: MindGardenOperation = 'activate',
  state: MindGardenSessionState = activated,
): MindGardenSessionStateEvent {
  return { version: 1, operation, state }
}

function event(
  operation: MindGardenOperation = 'activate',
  state: MindGardenSessionState = activated,
  seq = 0,
): SessionEvent<'mind-garden/session-state'> {
  return {
    type: 'mind-garden/session-state',
    seq,
    time: state.updatedAt,
    data: change(operation, state),
  }
}

async function setup(): Promise<{
  ctx: Context
  service: MindGardenService
  setLive: (agent: import('@deepseek-ai/dsh-agent').Agent | undefined) => void
}> {
  const ctx = new Context()
  let live: import('@deepseek-ai/dsh-agent').Agent | undefined
  ctx.provide('agents', {
    get: (id: unknown) => live?.id === id ? live : undefined,
  } as never)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(MindGardenService)
  return { ctx, service: ctx.mindGarden, setLive: (agent) => { live = agent } }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Mind Garden service and projection', () => {
  it('registers and disposes its real projection unit', async () => {
    const ctx = new Context()
    ctx.provide('agents', { get: () => undefined } as never)
    await ctx.plugin(SessionProjectionRegistry)
    const fiber = await ctx.plugin(MindGardenService)
    expect(ctx.sessionProjections.restoreFloor({})).toBe(0)
    await fiber.dispose()
    expect(ctx.sessionProjections.restoreFloor({})).toBeUndefined()
    await ctx.fiber.dispose()
  })

  it('owns activation and compare-and-set state changes', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(activated.activatedAt)
    const { ctx, service } = await setup()
    const session = Session.create(SessionId('garden-state-machine'))

    const first = service.activate(session, {
      mode: 'serenity', privacy: 'durable', supportIntent: 'listen',
    })
    expect(first).toEqual(activated)
    expect(session.events[0]?.data).toMatchObject({ version: 2, disclosureAcceptance: null })
    const detached = service.current(session)
    expect(detached).toEqual(first)
    expect(detached).not.toBe(first)

    vi.setSystemTime(activated.updatedAt + 10)
    const clarity = service.selectMode(session, 1, 'clarity')
    expect(clarity).toMatchObject({ revision: 2, mode: 'clarity', updatedAt: activated.updatedAt + 10 })
    vi.setSystemTime(activated.updatedAt + 20)
    const nextStep = service.selectSupportIntent(session, 2, 'next-step')
    expect(nextStep).toMatchObject({ revision: 3, supportIntent: 'next-step', updatedAt: activated.updatedAt + 20 })
    vi.setSystemTime(activated.updatedAt + 30)
    const disclosed = service.acceptModelDisclosure(session, 3)
    expect(disclosed).toMatchObject({ revision: 4, modelDisclosureAccepted: true, updatedAt: activated.updatedAt + 30 })
    expect(session.events[3]?.data).toMatchObject({
      version: 2,
      disclosureAcceptance: {
        acceptedAt: activated.updatedAt + 30,
        locale: 'zh-CN',
        contractVersion: 1,
      },
    })
    expect(ctx.sessionProjections.snapshot(session).values['mind-garden']).toEqual({ state: disclosed })
    expect(session.events).toHaveLength(4)
    await ctx.fiber.dispose()
  })

  it('keeps repeated choices idempotent before checking stale revisions', async () => {
    const { ctx, service } = await setup()
    const session = Session.create(SessionId('garden-idempotent'))
    const first = service.activate(session, {
      mode: 'clarity', privacy: 'ephemeral', modelDisclosureAccepted: true,
    })
    expect(service.selectMode(session, 0, 'clarity')).toEqual(first)
    expect(service.selectSupportIntent(session, 0, 'auto')).toEqual(first)
    expect(service.acceptModelDisclosure(session, 0)).toEqual(first)
    expect(session.events).toHaveLength(1)
    await ctx.fiber.dispose()
  })

  it('rejects invalid lifecycle and stale real changes with stable codes', async () => {
    const { ctx, service } = await setup()
    const inactive = Session.create(SessionId('garden-inactive'))
    expect(service.current(inactive)).toBeNull()
    expect(() => service.selectMode(inactive, 0, 'clarity'))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_NOT_ACTIVE' }))
    expect(() => service.selectSupportIntent(inactive, 0, 'listen'))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_NOT_ACTIVE' }))
    expect(() => service.acceptModelDisclosure(inactive, 0))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_NOT_ACTIVE' }))

    const stillBlank = Session.create(SessionId('garden-standalone-log'))
    stillBlank.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'rejected before a turn started' }], source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    expect(() => service.activate(stillBlank, { mode: 'serenity', privacy: 'durable' })).not.toThrow()

    const nonBlank = Session.create(SessionId('garden-non-blank'))
    nonBlank.append('turn/start', { turn: 0 })
    expect(() => service.activate(nonBlank, { mode: 'serenity', privacy: 'durable' }))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_SESSION_NOT_BLANK' }))

    const active = Session.create(SessionId('garden-errors'))
    service.activate(active, { mode: 'serenity', privacy: 'durable' })
    expect(() => service.activate(active, { mode: 'clarity', privacy: 'durable' }))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_ALREADY_ACTIVE' }))
    expect(() => service.selectMode(active, 0, 'clarity'))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_STALE_REVISION' }))
    expect(() => service.selectSupportIntent(active, 0, 'listen'))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_STALE_REVISION' }))
    expect(() => service.acceptModelDisclosure(active, 0))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_STALE_REVISION' }))
    await ctx.fiber.dispose()
  })

  it('strictly replays externally appended whole states before the next read', async () => {
    const { ctx, service } = await setup()
    const session = Session.create(SessionId('garden-replay'))
    session.append('mind-garden/session-state', change())
    const next = { ...activated, revision: 2, updatedAt: activated.updatedAt + 1, mode: 'clarity' as const }
    session.append('mind-garden/session-state', change('select-mode', next))
    expect(service.current(session)).toEqual(next)
    expect(foldMindGarden(session.events)).toEqual(next)
    await ctx.fiber.dispose()
  })

  it('exposes a fail-soft last-wins projection contract', () => {
    expect(foldMindGarden([])).toBeNull()
    expect(mindGardenProjectionDefinition.init()).toBeNull()
    expect(mindGardenProjectionDefinition.key).toBe('mind-garden')
    expect(mindGardenProjectionDefinition.stateVersion).toBe(1)
    expect(mindGardenProjectionDefinition.wire.view(null)).toBeNull()
    const first = applyMindGardenProjection(null, event())
    expect(first).toEqual({ state: activated })
    expect(mindGardenProjectionSchema.parse(first)).toEqual(first)
    expect(mindGardenSessionStateSchema.parse(activated)).toEqual(activated)

    const unrelated = {
      type: 'turn/start', seq: 1, time: activated.updatedAt, data: { turn: 1 },
    } satisfies SessionEvent<'turn/start'>
    expect(applyMindGardenProjection(first, unrelated)).toBe(first)
    const malformed = { ...event(), data: { ...change(), extra: true } } as unknown as SessionEvent
    expect(applyMindGardenProjection(first, malformed)).toBe(first)
    expect(mindGardenSessionStateSchema.safeParse({ ...activated, updatedAt: activated.activatedAt - 1 }).success)
      .toBe(false)
  })
})

describe('Mind Garden strict replay', () => {
  it('accepts each legal transition and ignores unrelated events', () => {
    let state = applyMindGardenEvent(null, event())
    const unrelated = { type: 'turn/start', seq: 1, time: 1, data: { turn: 1 } } as SessionEvent
    expect(applyMindGardenEvent(state, unrelated)).toBe(state)
    const mode = { ...activated, revision: 2, updatedAt: activated.updatedAt + 1, mode: 'clarity' as const }
    state = applyMindGardenChange(state, change('select-mode', mode))
    const intent = { ...mode, revision: 3, updatedAt: mode.updatedAt + 1, supportIntent: 'settle' as const }
    state = applyMindGardenChange(state, change('select-support-intent', intent))
    const accepted = { ...intent, revision: 4, updatedAt: intent.updatedAt, modelDisclosureAccepted: true }
    expect(applyMindGardenChange(state, change('accept-disclosure', accepted))).toEqual(accepted)
  })

  it.each([
    null,
    [],
    {},
    { version: 1, operation: 'activate', state: activated, extra: true },
    { version: 2, operation: 'activate', state: activated },
    { version: 1, operation: 'unknown', state: activated },
    { version: 1, operation: 'activate', state: null },
    { version: 1, operation: 'activate', state: { ...activated, extra: true } },
    { version: 1, operation: 'activate', state: { ...activated, mode: 'unknown' } },
    { version: 1, operation: 'activate', state: { ...activated, supportIntent: 'unknown' } },
    { version: 1, operation: 'activate', state: { ...activated, privacy: 'unknown' } },
    { version: 1, operation: 'activate', state: { ...activated, modelDisclosureAccepted: 'yes' } },
    { version: 1, operation: 'activate', state: { ...activated, activatedAt: -1 } },
    { version: 1, operation: 'activate', state: { ...activated, updatedAt: -1 } },
    { version: 1, operation: 'activate', state: { ...activated, updatedAt: activated.activatedAt - 1 } },
    { version: 1, operation: 'activate', state: { ...activated, revision: 0 } },
    { version: 1, operation: 'activate', state: { ...activated, contractVersion: 0 } },
  ])('rejects malformed payload %#', (payload) => {
    expect(() => decodeMindGardenStateEvent(payload)).toThrow()
  })

  it.each([
    ['activate twice', activated, change()] as const,
    ['bad activation revision', null, change('activate', { ...activated, revision: 2 })] as const,
    ['bad activation timestamps', null, change('activate', { ...activated, updatedAt: activated.updatedAt + 1 })] as const,
    ['mutation before activate', null, change('select-mode', { ...activated, revision: 2, mode: 'clarity' })] as const,
    ['revision gap', activated, change('select-mode', { ...activated, revision: 3, mode: 'clarity' })] as const,
    ['activation changed', activated, change('select-mode', { ...activated, revision: 2, activatedAt: 2, mode: 'clarity' })] as const,
    ['privacy changed', activated, change('select-mode', { ...activated, revision: 2, privacy: 'ephemeral', mode: 'clarity' })] as const,
    ['contract changed', activated, change('select-mode', { ...activated, revision: 2, contractVersion: 2, mode: 'clarity' })] as const,
    ['time moved backward', activated, change('select-mode', { ...activated, revision: 2, updatedAt: activated.updatedAt - 1, mode: 'clarity' })] as const,
    ['mode no-op', activated, change('select-mode', { ...activated, revision: 2 })] as const,
    ['mode changed intent', activated, change('select-mode', { ...activated, revision: 2, mode: 'clarity', supportIntent: 'settle' })] as const,
    ['intent no-op', activated, change('select-support-intent', { ...activated, revision: 2 })] as const,
    ['intent changed mode', activated, change('select-support-intent', { ...activated, revision: 2, supportIntent: 'settle', mode: 'clarity' })] as const,
    ['accept twice', { ...activated, modelDisclosureAccepted: true }, change('accept-disclosure', { ...activated, revision: 2, modelDisclosureAccepted: true })] as const,
    ['accept stayed false', activated, change('accept-disclosure', { ...activated, revision: 2 })] as const,
    ['accept changed intent', activated, change('accept-disclosure', { ...activated, revision: 2, modelDisclosureAccepted: true, supportIntent: 'settle' })] as const,
  ])('rejects illegal transition: %s', (_label, current, candidate) => {
    expect(() => applyMindGardenChange(current, candidate)).toThrow()
  })

  it('clamps service mutation time when the wall clock moves backward', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(activated.activatedAt)
    const { ctx, service } = await setup()
    const session = Session.create(SessionId('garden-clock-clamp'))
    service.activate(session, { mode: 'serenity', privacy: 'durable', supportIntent: 'listen' })
    vi.setSystemTime(activated.activatedAt - 100)
    expect(service.selectMode(session, 1, 'clarity').updatedAt).toBe(activated.updatedAt)
    await ctx.fiber.dispose()
  })

  it('adapts Remote mutations to the exact live Agent and rejects an impostor', async () => {
    const { ctx, service, setLive } = await setup()
    const session = Session.create(SessionId('garden-remote'))
    const agent = { id: session.id, session } as unknown as import('@deepseek-ai/dsh-agent').Agent
    setLive(agent)
    expect(service.remoteExportActivate(agent, {
      mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: true, disclosureLocale: 'en',
    })).toMatchObject({ revision: 1, mode: 'serenity', modelDisclosureAccepted: true })
    expect(session.events[0]?.data).toMatchObject({
      version: 2,
      disclosureAcceptance: { locale: 'en', contractVersion: 1 },
    })
    expect(service.remoteExportSelectMode(agent, 1, 'clarity')).toMatchObject({ revision: 2, mode: 'clarity' })
    expect(service.remoteExportSelectSupportIntent(agent, 2, 'listen'))
      .toMatchObject({ revision: 3, supportIntent: 'listen' })
    expect(service.remoteExportAcceptModelDisclosure(agent, 0)).toMatchObject({ revision: 3 })

    const impostor = { id: session.id, session } as unknown as import('@deepseek-ai/dsh-agent').Agent
    expect(() => service.remoteExportSelectMode(impostor, 3, 'serenity'))
      .toThrow(expect.objectContaining<Partial<MindGardenError>>({ code: 'MIND_GARDEN_AGENT_NOT_LIVE' }))
    await ctx.fiber.dispose()
  })
})
