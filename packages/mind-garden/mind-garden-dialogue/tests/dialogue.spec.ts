import { describe, expect, it } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, PreStepDecision } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden-core'
import { apply, name, renderMindGardenDialoguePolicy } from '@deepseek-ai/dsh-mind-garden-dialogue'

const base: MindGardenSessionState = {
  revision: 4,
  activatedAt: 1,
  updatedAt: 2,
  mode: 'serenity',
  supportIntent: 'auto',
  privacy: 'durable',
  contractVersion: 1,
  modelDisclosureAccepted: true,
}

type PreStepPayload = {
  agent: Agent
  step: number
  signal: AbortSignal
}
type Handler = (payload: PreStepPayload, next: () => Promise<PreStepDecision>) => Promise<PreStepDecision>

function bench(state: MindGardenSessionState | null) {
  let handler: Handler | undefined
  const ctx = {
    mindGarden: { current: () => state },
    on: (_event: string, callback: Handler) => { handler = callback },
  } as unknown as Context
  apply(ctx)
  if (handler === undefined) throw new Error('dialogue plugin did not register pre-step')
  const session = Session.create(SessionId('dialogue'))
  const agent = { id: session.id, session } as unknown as Agent
  const original = createUserMessage({ content: [{ type: 'text', text: 'hello' }], source: { kind: 'user' } })
  const enter = () => Promise.resolve({ kind: 'enter' as const, messages: [original] })
  return { handler, agent, enter, original }
}

describe('Mind Garden dialogue policy', () => {
  it('renders every mode, intent, and privacy policy deterministically', () => {
    for (const mode of ['serenity', 'clarity'] as const) {
      for (const supportIntent of ['auto', 'listen', 'settle', 'clarify', 'next-step'] as const) {
        for (const privacy of ['durable', 'ephemeral'] as const) {
          const rendered = renderMindGardenDialoguePolicy({ ...base, mode, supportIntent, privacy })
          expect(rendered).toContain(`Posture — ${mode}:`)
          expect(rendered).toContain(`Requested support — ${supportIntent}:`)
          expect(rendered).toContain(privacy === 'durable' ? 'durable session storage' : 'ephemeral policy label')
          expect(rendered).toContain('Do not diagnose')
        }
      }
    }
  })

  it('adds one exact sourced snapshot to the first entered step', async () => {
    const b = bench(base)
    const result = await b.handler({
      agent: b.agent, step: 1, signal: new AbortController().signal,
    }, b.enter)
    expect(result.kind).toBe('enter')
    if (result.kind !== 'enter') throw new Error('expected enter')
    expect(result.messages[0]).toBe(b.original)
    expect(result.messages[1]).toMatchObject({
      content: [{ type: 'text', text: renderMindGardenDialoguePolicy(base) }],
      source: {
        kind: 'plugin', plugin: name, form: 'snapshot',
        sections: [{ name, text: renderMindGardenDialoguePolicy(base) }],
      },
    })
  })

  it('does not add context for inactive, later, rejected, or aborted steps', async () => {
    const active = bench(base)
    const rejected = { kind: 'reject' as const }
    expect(await active.handler({
      agent: active.agent, step: 1, signal: new AbortController().signal,
    }, () => Promise.resolve(rejected))).toBe(rejected)
    expect(await active.handler({
      agent: active.agent, step: 2, signal: new AbortController().signal,
    }, active.enter)).toMatchObject({ messages: [active.original] })
    const aborted = new AbortController()
    aborted.abort()
    expect(await active.handler({
      agent: active.agent, step: 1, signal: aborted.signal,
    }, active.enter)).toMatchObject({ messages: [active.original] })
    const inactive = bench(null)
    expect(await inactive.handler({
      agent: inactive.agent, step: 1, signal: new AbortController().signal,
    }, inactive.enter)).toMatchObject({ messages: [inactive.original] })
  })

  it('rejects model entry while disclosure acceptance is pending', async () => {
    const b = bench({ ...base, modelDisclosureAccepted: false })
    expect(await b.handler({
      agent: b.agent, step: 1, signal: new AbortController().signal,
    }, b.enter)).toEqual({ kind: 'reject' })
  })
})
