import { Context } from '@deepseek-ai/cordis'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import * as SafetyInvariant from '@deepseek-ai/dsh-mind-garden-safety/invariant'
import { assessMindGardenInput } from '@deepseek-ai/dsh-mind-garden-safety'
import InvariantRegistry, { InvariantError } from '@deepseek-ai/dsh-invariants'
import SessionStore, { SessionId, type Session } from '@deepseek-ai/dsh-session'
import { describe, expect, it } from 'vitest'

async function setup(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(InvariantRegistry, { enabled: true })
  await ctx.plugin(SafetyInvariant)
  return ctx
}

function activate(session: Session): void {
  session.append('mind-garden/session-state', {
    version: 1,
    operation: 'activate',
    state: {
      revision: 1,
      activatedAt: 1,
      updatedAt: 1,
      mode: 'serenity',
      supportIntent: 'listen',
      privacy: 'durable',
      contractVersion: 1,
      modelDisclosureAccepted: true,
    },
  })
}

function enter(session: Session, text: string) {
  session.append('turn/start', { turn: 1 })
  session.append('step/start', { turn: 1, step: 1 })
  const message = createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })
  session.append('user/message', message, { surfaceOp: 'append' })
  return message
}

describe('Mind Garden safety invariant', () => {
  it('accepts the exact deterministic assessment and output-guard relation', async () => {
    const ctx = await setup()
    const session = ctx.sessions.create(SessionId('safety-invariant-valid'))
    activate(session)
    const message = enter(session, '今天工作很累。')
    expect(() => session.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [message.id],
      assessment: assessMindGardenInput('今天工作很累。'),
      response: 'model-guarded',
    })).not.toThrow()
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'policy-violation',
      violations: ['diagnosis'],
    })).not.toThrow()
    session.append('step/end', { turn: 1, step: 1 })
    session.append('step/start', { turn: 1, step: 2 })
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 2,
      reason: 'buffer-limit',
      violations: [],
    })).not.toThrow()
    session.append('step/end', { turn: 1, step: 2 })
    session.append('step/start', { turn: 1, step: 3 })
    const followUp = createUserMessage({
      content: [
        {
          type: 'image',
          attachment: {
            attachmentId: `sha256:${'a'.repeat(64)}` as never,
            mediaType: 'image/png',
            bytes: 1,
            width: 1,
            height: 1,
          },
        },
      ],
      source: { kind: 'user' },
    })
    session.append('user/message', followUp, { surfaceOp: 'append' })
    expect(() => session.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 3,
      inputMessageIds: [followUp.id],
      assessment: assessMindGardenInput(''),
      response: 'model-guarded',
    })).not.toThrow()
    await ctx.fiber.dispose()
  })

  it('rejects inactive, misattributed, and counterfeit assessments before commit', async () => {
    const ctx = await setup()
    const inactive = ctx.sessions.create(SessionId('safety-invariant-inactive'))
    const inactiveMessage = enter(inactive, '我已经割腕。')
    expect(() => inactive.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [inactiveMessage.id],
      assessment: assessMindGardenInput('我已经割腕。'),
      response: 'local',
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({
      code: 'INVARIANT', packageName: '@deepseek-ai/dsh-mind-garden-safety',
    }))

    const active = ctx.sessions.create(SessionId('safety-invariant-counterfeit'))
    activate(active)
    const message = enter(active, '我已经割腕。')
    expect(() => active.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [],
      assessment: assessMindGardenInput('我已经割腕。'),
      response: 'local',
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => active.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [message.id],
      assessment: assessMindGardenInput('普通烦恼'),
      response: 'model-guarded',
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    await ctx.fiber.dispose()
  })

  it('rejects malformed output-guard reasons and open-step mismatches', async () => {
    const ctx = await setup()
    const session = ctx.sessions.create(SessionId('safety-invariant-output'))
    activate(session)
    const message = enter(session, '普通烦恼')
    session.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [message.id],
      assessment: assessMindGardenInput('普通烦恼'),
      response: 'model-guarded',
    })
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'policy-violation',
      violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 2,
      step: 1,
      reason: 'buffer-limit',
      violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'buffer-limit',
      violations: ['diagnosis'],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'policy-violation',
      violations: ['unknown-rule' as 'diagnosis'],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'policy-violation',
      violations: ['diagnosis', 'diagnosis'],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'policy-violation',
      violations: [42 as never],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => session.append('mind-garden/output-guarded', {
      version: 2 as 1,
      turn: 1,
      step: 1,
      reason: 'buffer-limit',
      violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'unknown' as 'buffer-limit',
      violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    await ctx.fiber.dispose()
  })

  it('rejects inactive, closed, unassessed, stale, and locally routed output records', async () => {
    const ctx = await setup()
    const inactive = ctx.sessions.create(SessionId('safety-output-inactive'))
    enter(inactive, '普通烦恼')
    expect(() => inactive.append('mind-garden/output-guarded', {
      version: 1, turn: 1, step: 1, reason: 'buffer-limit', violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))

    const closed = ctx.sessions.create(SessionId('safety-output-closed'))
    activate(closed)
    enter(closed, '普通烦恼')
    closed.append('step/end', { turn: 1, step: 1 })
    expect(() => closed.append('mind-garden/output-guarded', {
      version: 1, turn: 1, step: 1, reason: 'buffer-limit', violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))

    const unassessed = ctx.sessions.create(SessionId('safety-output-unassessed'))
    activate(unassessed)
    enter(unassessed, '普通烦恼')
    expect(() => unassessed.append('mind-garden/output-guarded', {
      version: 1, turn: 1, step: 1, reason: 'buffer-limit', violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))

    const urgent = ctx.sessions.create(SessionId('safety-output-local'))
    activate(urgent)
    const urgentMessage = enter(urgent, '我已经割腕。')
    urgent.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [urgentMessage.id],
      assessment: assessMindGardenInput('我已经割腕。'),
      response: 'local',
    })
    expect(() => urgent.append('mind-garden/output-guarded', {
      version: 1, turn: 1, step: 1, reason: 'buffer-limit', violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))

    const stale = ctx.sessions.create(SessionId('safety-output-stale'))
    activate(stale)
    const staleMessage = enter(stale, '普通烦恼')
    stale.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [staleMessage.id],
      assessment: assessMindGardenInput('普通烦恼'),
      response: 'model-guarded',
    })
    stale.append('step/end', { turn: 1, step: 1 })
    stale.append('step/start', { turn: 2, step: 1 })
    expect(() => stale.append('mind-garden/output-guarded', {
      version: 1, turn: 2, step: 1, reason: 'buffer-limit', violations: [],
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))

    const route = ctx.sessions.create(SessionId('safety-route-mismatch'))
    activate(route)
    const message = enter(route, '普通烦恼')
    expect(() => route.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [message.id],
      assessment: assessMindGardenInput('普通烦恼'),
      response: 'local',
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    await ctx.fiber.dispose()
  })

  it('rejects assessments without an open step or with a mismatched step', async () => {
    const ctx = await setup()
    const boundaryless = ctx.sessions.create(SessionId('safety-no-step'))
    activate(boundaryless)
    expect(() => boundaryless.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [],
      assessment: assessMindGardenInput(''),
      response: 'model-guarded',
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))

    const wrongStep = ctx.sessions.create(SessionId('safety-wrong-step'))
    activate(wrongStep)
    const message = enter(wrongStep, '普通烦恼')
    expect(() => wrongStep.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 2,
      inputMessageIds: [message.id],
      assessment: assessMindGardenInput('普通烦恼'),
      response: 'model-guarded',
    })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    await ctx.fiber.dispose()
  })

  it('validates existing durable records when the companion loads', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    const session = ctx.sessions.create(SessionId('safety-invariant-resume'))
    activate(session)
    const message = enter(session, '普通烦恼')
    session.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [message.id],
      assessment: assessMindGardenInput('普通烦恼'),
      response: 'model-guarded',
    })
    session.append('mind-garden/output-guarded', {
      version: 1,
      turn: 1,
      step: 1,
      reason: 'buffer-limit',
      violations: [],
    })
    await ctx.plugin(InvariantRegistry, { enabled: true })
    await expect(ctx.plugin(SafetyInvariant)).resolves.toBeDefined()
    await ctx.fiber.dispose()
  })
})
