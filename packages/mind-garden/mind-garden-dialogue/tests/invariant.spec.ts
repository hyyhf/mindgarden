import { Context } from '@deepseek-ai/cordis'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { foldMindGarden } from '@deepseek-ai/dsh-mind-garden/core'
import * as DialogueInvariant from '@deepseek-ai/dsh-mind-garden/dialogue/invariant'
import type { MindGardenAuthorizedJournalExcerpt } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import {
  name,
  renderAuthorizedJournalContext,
  renderMindGardenDialoguePolicy,
} from '@deepseek-ai/dsh-mind-garden/dialogue'
import InvariantRegistry, { InvariantError } from '@deepseek-ai/dsh-invariants'
import SessionStore, { SessionId, type Session } from '@deepseek-ai/dsh-session'
import { describe, expect, it } from 'vitest'

async function setup(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(InvariantRegistry, { enabled: true })
  await ctx.plugin(DialogueInvariant)
  return ctx
}

function activate(session: Session) {
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

describe('Mind Garden dialogue invariant', () => {
  it('accepts exact sourced policy and authorized-journal messages', async () => {
    const ctx = await setup()
    const session = ctx.sessions.create(SessionId('dialogue-invariant-valid'))
    activate(session)
    const state = foldMindGarden(session.events)
    if (state === null) throw new Error('activation did not fold')
    const text = renderMindGardenDialoguePolicy(state)
    expect(() => {
      session.append('user/message', createUserMessage({
        content: [{ type: 'text', text }],
        source: { kind: 'plugin', plugin: name, form: 'snapshot', sections: [{ name, text }] },
      }), { surfaceOp: 'append' })
    }).not.toThrow()
    const journals = [{
      id: 'journal-1',
      localDate: '2026-08-18',
      title: 'After the meeting',
      body: 'I wanted more time before answering.',
    }] as unknown as readonly MindGardenAuthorizedJournalExcerpt[]
    const journalText = renderAuthorizedJournalContext(journals)
    expect(() => {
      session.append('user/message', createUserMessage({
        content: [{ type: 'text', text: journalText }],
        source: {
          kind: 'plugin',
          plugin: name,
          form: 'recall',
          sections: [{ name: 'authorized-journals', text: journalText }],
        },
      }), { surfaceOp: 'append' })
    }).not.toThrow()
    await ctx.fiber.dispose()
  })

  it('rejects counterfeit, inactive, and undisclosed snapshots before commit', async () => {
    const ctx = await setup()
    const inactive = ctx.sessions.create(SessionId('dialogue-invariant-inactive'))
    const fake = createUserMessage({
      content: [{ type: 'text', text: 'counterfeit' }],
      source: { kind: 'plugin', plugin: name, form: 'snapshot', sections: [{ name, text: 'counterfeit' }] },
    })
    expect(() => inactive.append('user/message', fake, { surfaceOp: 'append' }))
      .toThrow(expect.objectContaining<Partial<InvariantError>>({
        code: 'INVARIANT', packageName: '@deepseek-ai/dsh-mind-garden/dialogue',
      }))

    const undisclosed = ctx.sessions.create(SessionId('dialogue-invariant-undisclosed'))
    undisclosed.append('mind-garden/session-state', {
      version: 1,
      operation: 'activate',
      state: {
        revision: 1, activatedAt: 1, updatedAt: 1, mode: 'clarity', supportIntent: 'auto',
        privacy: 'durable', contractVersion: 1, modelDisclosureAccepted: false,
      },
    })
    expect(() => undisclosed.append('user/message', fake, { surfaceOp: 'append' }))
      .toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))

    const active = ctx.sessions.create(SessionId('dialogue-invariant-counterfeit'))
    activate(active)
    expect(() => active.append('user/message', fake, { surfaceOp: 'append' }))
      .toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    const current = foldMindGarden(active.events)
    if (current === null) throw new Error('activation did not fold')
    const exact = renderMindGardenDialoguePolicy(current)
    expect(() => active.append('user/message', createUserMessage({
      content: [{ type: 'text', text: exact }],
      source: { kind: 'plugin', plugin: name },
    }), { surfaceOp: 'append' })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    expect(() => active.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'counterfeit journal context' }],
      source: {
        kind: 'plugin',
        plugin: name,
        form: 'recall',
        sections: [{ name: 'authorized-journals', text: 'counterfeit journal context' }],
      },
    }), { surfaceOp: 'append' })).toThrow(expect.objectContaining<Partial<InvariantError>>({ code: 'INVARIANT' }))
    await ctx.fiber.dispose()
  })

  it('validates package snapshots already present when the companion loads', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    const session = ctx.sessions.create(SessionId('dialogue-invariant-resume'))
    activate(session)
    const state = foldMindGarden(session.events)
    if (state === null) throw new Error('activation did not fold')
    const text = renderMindGardenDialoguePolicy(state)
    session.append('user/message', createUserMessage({
      content: [{ type: 'text', text }],
      source: { kind: 'plugin', plugin: name, form: 'snapshot', sections: [{ name, text }] },
    }), { surfaceOp: 'append' })
    await ctx.plugin(InvariantRegistry, { enabled: true })
    await expect(ctx.plugin(DialogueInvariant)).resolves.toBeDefined()
    await ctx.fiber.dispose()
  })
})
