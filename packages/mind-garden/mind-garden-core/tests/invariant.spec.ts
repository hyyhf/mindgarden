import { Context } from '@deepseek-ai/cordis'
import MindGardenService from '@deepseek-ai/dsh-mind-garden-core'
import * as MindGardenInvariant from '@deepseek-ai/dsh-mind-garden-core/invariant'
import InvariantRegistry, { InvariantError } from '@deepseek-ai/dsh-invariants'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import { describe, expect, it } from 'vitest'

async function setup(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(InvariantRegistry, { enabled: true })
  await ctx.plugin(MindGardenInvariant)
  ctx.provide('agents', { get: () => undefined } as never)
  await ctx.plugin(MindGardenService)
  return ctx
}

describe('Mind Garden stream invariant', () => {
  it('accepts canonical service mutations', async () => {
    const ctx = await setup()
    const session = ctx.sessions.create(SessionId('mind-garden-invariant-valid'))
    const first = ctx.mindGarden.activate(session, { mode: 'serenity', privacy: 'durable' })
    expect(() => ctx.mindGarden.selectMode(session, first.revision, 'clarity')).not.toThrow()
    await ctx.fiber.dispose()
  })

  it('rejects an illegal stream event before commit and keeps the fold reusable', async () => {
    const ctx = await setup()
    const session = ctx.sessions.create(SessionId('mind-garden-invariant-invalid'))
    expect(() => {
      session.append('mind-garden/session-state', {
        version: 1,
        operation: 'activate',
        state: {
          revision: 2,
          activatedAt: 1,
          updatedAt: 1,
          mode: 'serenity',
          supportIntent: 'auto',
          privacy: 'durable',
          contractVersion: 1,
          modelDisclosureAccepted: false,
        },
      })
    }).toThrow(expect.objectContaining<Partial<InvariantError>>({
      code: 'INVARIANT',
      packageName: '@deepseek-ai/dsh-mind-garden-core',
    }))
    expect(session.seq).toBe(0)
    expect(() => ctx.mindGarden.activate(session, { mode: 'clarity', privacy: 'durable' })).not.toThrow()
    await ctx.fiber.dispose()
  })

  it('reconstructs existing durable state before checking a later event', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    const session = ctx.sessions.create(SessionId('mind-garden-invariant-late-load'))
    session.append('mind-garden/session-state', {
      version: 1,
      operation: 'activate',
      state: {
        revision: 1,
        activatedAt: 1,
        updatedAt: 1,
        mode: 'serenity',
        supportIntent: 'auto',
        privacy: 'durable',
        contractVersion: 1,
        modelDisclosureAccepted: false,
      },
    })
    await ctx.plugin(InvariantRegistry, { enabled: true })
    await ctx.plugin(MindGardenInvariant)
    expect(() => {
      session.append('mind-garden/session-state', {
        version: 1,
        operation: 'select-mode',
        state: {
          revision: 2,
          activatedAt: 1,
          updatedAt: 2,
          mode: 'clarity',
          supportIntent: 'auto',
          privacy: 'durable',
          contractVersion: 1,
          modelDisclosureAccepted: false,
        },
      })
    }).not.toThrow()
    await ctx.fiber.dispose()
  })
})
