import { describe, expect, it } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, PreStepDecision } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden/core'
import type { MindGardenAuthorizedJournalExcerpt } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import {
  apply,
  name,
  renderAuthorizedJournalContext,
  renderMindGardenDialoguePolicy,
} from '@deepseek-ai/dsh-mind-garden/dialogue'

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

function bench(
  state: MindGardenSessionState | null,
  journals: readonly MindGardenAuthorizedJournalExcerpt[] = [],
  onContextRequest: () => void = () => undefined,
  reflectionAvailable = true,
) {
  let handler: Handler | undefined
  let currentState = state
  const contextRequests: unknown[] = []
  const reflection = {
    authorizedContext: (_agent: Agent, request: unknown) => {
      contextRequests.push(request)
      onContextRequest()
      return Promise.resolve({ ok: true, value: { todayCheckin: null, retrievableJournals: journals } })
    },
  }
  const ctx = {
    mindGarden: { current: () => currentState },
    get: (service: string) => service === 'mindGardenReflection' && reflectionAvailable
      ? reflection
      : undefined,
    logger: { warn: () => undefined },
    on: (_event: string, callback: Handler) => { handler = callback },
  } as unknown as Context
  apply(ctx)
  if (handler === undefined) throw new Error('dialogue plugin did not register pre-step')
  const session = Session.create(SessionId('dialogue'))
  const agent = { id: session.id, session } as unknown as Agent
  const original = createUserMessage({ content: [{ type: 'text', text: 'hello' }], source: { kind: 'user' } })
  const enter = () => Promise.resolve({ kind: 'enter' as const, messages: [original] })
  return {
    handler,
    agent,
    enter,
    original,
    contextRequests,
    setState: (next: MindGardenSessionState | null) => { currentState = next },
  }
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
          expect(rendered).toContain('Respond directly to ordinary language')
          expect(rendered).toContain('infer the response style quietly')
          expect(rendered).toContain('keep interpretations tentative')
          expect(rendered).toContain('entire response may contain at most one interrogative sentence')
          expect(rendered).toContain('join the newest live thread')
          expect(rendered).toContain('respond to that answer before opening another direction')
          expect(rendered).toContain('Treat an ordinary-language correction as authoritative new content')
          expect(rendered).toContain('Do not defend the earlier response')
          expect(rendered).toContain('Never promise healing, cure, recovery')
          expect(rendered).toContain('Do not force optimism, closure, forgiveness')
          expect(rendered).toContain('Do not use a question, exercise, positive reframe, or proposed action as a routine closing device')
          expect(rendered).toContain('silently choose the lowest helpful depth')
          expect(rendered).toContain('do not manufacture deeper meaning')
          expect(rendered).toContain('only with repeated longitudinal evidence')
          expect(rendered).toContain('use the smallest reversible option')
          expect(rendered).toContain('current message and explicit correction outrank')
          expect(rendered).toContain('do not give advice this time')
          expect(rendered).toContain('mind_garden_memory_correction')
          expect(rendered).toContain('complete proposed wording verbatim')
          expect(rendered).toContain('clearly approves without withdrawing that exact proposal')
          expect(rendered).toContain('cancel only when such a later complete message clearly declines it')
          expect(rendered).toContain('Do not diagnose')
          expect(rendered).toContain('does not by itself warrant a clinician or emergency disclaimer')
        }
      }
    }
  })

  it('renders operationally distinct posture and support behavior', () => {
    expect(renderMindGardenDialoguePolicy({ ...base, mode: 'serenity', supportIntent: 'listen' }))
      .toContain('Do not give advice, exercises, causal analysis, or a question')
    expect(renderMindGardenDialoguePolicy({ ...base, mode: 'serenity', supportIntent: 'settle' }))
      .toContain('grounding option only after asking permission')
    expect(renderMindGardenDialoguePolicy({ ...base, mode: 'clarity', supportIntent: 'clarify' }))
      .toContain('observations, interpretations, feelings, needs, or constraints')
    expect(renderMindGardenDialoguePolicy({ ...base, mode: 'clarity', supportIntent: 'clarify' }))
      .toContain('preserve those categories and fill each one from the user\'s own words')
    expect(renderMindGardenDialoguePolicy({ ...base, mode: 'clarity', supportIntent: 'next-step' }))
      .toContain('exactly one small, reversible, low-burden option')
    expect(renderMindGardenDialoguePolicy({ ...base, supportIntent: 'auto' }))
      .toContain('When uncertain, choose the least intervention, usually listening')
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

  it('adds only explicitly authorized, query-matched journal excerpts as lower-priority history', async () => {
    const journals = [{
      id: 'journal-1',
      localDate: '2026-08-18',
      title: 'After the meeting',
      body: 'I wanted more time before answering.',
    }] as unknown as readonly MindGardenAuthorizedJournalExcerpt[]
    const b = bench(base, journals)
    const result = await b.handler({
      agent: b.agent, step: 1, signal: new AbortController().signal,
    }, b.enter)
    expect(result.kind).toBe('enter')
    if (result.kind !== 'enter') throw new Error('expected enter')
    expect(b.contextRequests).toEqual([{ query: 'hello' }])
    expect(result.messages).toHaveLength(3)
    expect(result.messages[2]).toMatchObject({
      content: [{ type: 'text', text: renderAuthorizedJournalContext(journals) }],
      source: {
        kind: 'plugin',
        plugin: name,
        form: 'recall',
        sections: [{ name: 'authorized-journals' }],
      },
    })
    expect(JSON.stringify(result.messages[2])).not.toContain('todayCheckin')
  })

  it('authorizes journals against the messages returned by downstream pre-step handlers', async () => {
    const b = bench(base)
    const transformed = createUserMessage({
      content: [{ type: 'text', text: 'the current transformed query' }],
      source: { kind: 'user' },
    })

    await b.handler({
      agent: b.agent, step: 1, signal: new AbortController().signal,
    }, () => Promise.resolve({ kind: 'enter', messages: [transformed] }))

    expect(b.contextRequests).toEqual([{ query: 'the current transformed query' }])
  })

  it('keeps the companion policy working when the optional reflection service is absent', async () => {
    const b = bench(base, [], () => undefined, false)
    const result = await b.handler({
      agent: b.agent, step: 1, signal: new AbortController().signal,
    }, b.enter)
    expect(result.kind).toBe('enter')
    if (result.kind !== 'enter') throw new Error('expected enter')
    expect(result.messages).toHaveLength(2)
    expect(result.messages[1]?.content).toEqual([{
      type: 'text', text: renderMindGardenDialoguePolicy(base),
    }])
    expect(b.contextRequests).toEqual([])
  })

  it('discards authorized journal plaintext if the session becomes ephemeral before append', async () => {
    const journals = [{
      id: 'journal-1',
      localDate: '2026-08-18',
      title: 'Private note',
      body: 'This must not cross the changed privacy boundary.',
    }] as unknown as readonly MindGardenAuthorizedJournalExcerpt[]
    let changePrivacy = () => undefined
    const b = bench(base, journals, () => { changePrivacy() })
    const ephemeral = { ...base, revision: base.revision + 1, privacy: 'ephemeral' as const }
    changePrivacy = () => { b.setState(ephemeral) }
    const result = await b.handler({
      agent: b.agent, step: 1, signal: new AbortController().signal,
    }, b.enter)
    expect(result.kind).toBe('enter')
    if (result.kind !== 'enter') throw new Error('expected enter')
    expect(result.messages).toHaveLength(2)
    expect(JSON.stringify(result.messages)).not.toContain('This must not cross')
    expect(result.messages[1]?.content).toEqual([{
      type: 'text', text: renderMindGardenDialoguePolicy(ephemeral),
    }])
  })

  it('reuses an exact visible policy and appends again after its revision changes', async () => {
    const visible = bench(base)
    const appendVisiblePolicy = (agent: Agent, text: string) => {
      agent.session.append('turn/start', { turn: 1 })
      agent.session.append('step/start', { turn: 1, step: 1 })
      agent.session.append('user/message', createUserMessage({
        content: [{ type: 'text', text }],
        source: { kind: 'plugin', plugin: name, form: 'snapshot', sections: [{ name, text }] },
      }), { surfaceOp: 'append' })
      agent.session.append('step/end', { turn: 1, step: 1 })
      agent.session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    }
    appendVisiblePolicy(visible.agent, renderMindGardenDialoguePolicy(base))
    await expect(visible.handler({
      agent: visible.agent, step: 1, signal: new AbortController().signal,
    }, visible.enter)).resolves.toMatchObject({ messages: [visible.original] })

    const changedState = { ...base, revision: base.revision + 1 }
    const changed = bench(changedState)
    appendVisiblePolicy(changed.agent, renderMindGardenDialoguePolicy(base))
    const result = await changed.handler({
      agent: changed.agent, step: 1, signal: new AbortController().signal,
    }, changed.enter)
    expect(result.kind).toBe('enter')
    if (result.kind !== 'enter') throw new Error('expected enter')
    expect(result.messages).toHaveLength(2)
    expect(result.messages[1]?.content).toEqual([
      { type: 'text', text: renderMindGardenDialoguePolicy(changedState) },
    ])
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
