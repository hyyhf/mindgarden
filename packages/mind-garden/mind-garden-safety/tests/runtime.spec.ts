import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import LlmRuntime, {
  createUserMessage,
  LlmAdapter,
  markAgentLoopRequest,
  type GenerateOptions,
  type StreamChunk,
} from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import AgentRegistry, { type Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import MindGardenService from '@deepseek-ai/dsh-mind-garden/core'
import * as mindGardenDialogue from '@deepseek-ai/dsh-mind-garden/dialogue'
import * as mindGardenSafety from '@deepseek-ai/dsh-mind-garden/safety'

function textResponse(text: string): StreamChunk[] {
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text: text.slice(0, Math.ceil(text.length / 2)) },
    { type: 'text-delta', index: 0, text: text.slice(Math.ceil(text.length / 2)) },
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 10, outputTokens: text.length } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

class ScriptAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []

  constructor(private readonly script: StreamChunk[][]) {
    super()
  }

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    const response = this.script.shift()
    if (response === undefined) throw new Error('unexpected model call')
    yield* response
  }
}

class GatedAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = []
  readonly waiting = Promise.withResolvers<undefined>()
  readonly release = Promise.withResolvers<undefined>()
  private readonly text = '我会先陪你把这段感受慢慢说清楚。'.repeat(12)

  override async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    yield { type: 'block-start', index: 0, blockType: 'text' }
    yield { type: 'text-delta', index: 0, text: this.text }
    this.waiting.resolve(undefined)
    await this.release.promise
    yield { type: 'block-end', index: 0, block: { type: 'text', text: this.text } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }
}

async function compose(
  adapter: LlmAdapter & { readonly requests: GenerateOptions[] },
  config: mindGardenSafety.Config = {},
  activate = true,
) {
  const ctx = new Context()
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(MindGardenService)
  await ctx.plugin(mindGardenDialogue)
  await ctx.plugin(mindGardenSafety, config)
  await ctx.plugin(AgentLoop, { agents: [] })
  ctx.llm.registerAdapter(['mock'], adapter)
  const agent = ctx.agentLoop.create(SessionId(crypto.randomUUID()), { provider: 'mock', model: 'test' })
  if (activate) {
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity', privacy: 'durable', supportIntent: 'listen', modelDisclosureAccepted: true,
    })
  }
  return { ctx, agent, adapter }
}

async function harness(
  script: StreamChunk[][],
  config: mindGardenSafety.Config = {},
  activate = true,
) {
  const adapter = new ScriptAdapter(script)
  return compose(adapter, config, activate)
}

async function drain(ctx: Context, options: GenerateOptions): Promise<StreamChunk[]> {
  const chunks: StreamChunk[] = []
  for await (const chunk of ctx.llm.stream(options)) chunks.push(chunk)
  return chunks
}

function loopRequest(sessionId?: SessionId, signal?: AbortSignal): GenerateOptions {
  return markAgentLoopRequest({
    provider: 'mock',
    model: 'test',
    messages: [],
    ...sessionId === undefined ? {} : { sessionId },
    ...signal === undefined ? {} : { signal },
  })
}

async function send(agent: Agent, text: string): Promise<void> {
  agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
  await agent.whenIdle()
}

function assistantTexts(agent: Agent): string[] {
  return agent.session.events.flatMap(event => event.type === 'assistant/message'
    ? event.data.message.content.flatMap(block => block.type === 'text' ? [block.text] : [])
    : [])
}

describe('Mind Garden safety real agent composition', () => {
  it('rejects every non-positive or fractional request and buffering bound', () => {
    const unusable = {} as Context
    expect(() => { mindGardenSafety.apply(unusable, { maxModelOutputTokens: 0 }) }).toThrow('maxModelOutputTokens')
    expect(() => { mindGardenSafety.apply(unusable, { maxModelOutputTokens: 1.5 }) }).toThrow('maxModelOutputTokens')
    expect(() => { mindGardenSafety.apply(unusable, { maxBufferedCharacters: 0 }) }).toThrow('maxBufferedCharacters')
    expect(() => { mindGardenSafety.apply(unusable, { maxBufferedCharacters: 1.5 }) }).toThrow('maxBufferedCharacters')
    expect(() => { mindGardenSafety.apply(unusable, { maxBufferedChunks: 0 }) }).toThrow('maxBufferedChunks')
    expect(() => { mindGardenSafety.apply(unusable, { maxBufferedChunks: 1.5 }) }).toThrow('maxBufferedChunks')
  })

  it('bypasses the adapter and records a flushed deterministic urgent decision', async () => {
    const { ctx, agent, adapter } = await harness([])
    await send(agent, '我现在要跳楼，已经在楼顶。')

    expect(adapter.requests).toHaveLength(0)
    expect(assistantTexts(agent).at(-1)).toContain('12356')
    expect(assistantTexts(agent).at(-1)).toContain('110')
    expect(agent.session.events.find(event => event.type === 'mind-garden/safety-assessment')?.data)
      .toMatchObject({ assessment: { level: 3 }, response: 'local' })
    await ctx.fiber.dispose()
  })

  it('publishes a safe ordinary response without changing its assembled text', async () => {
    const { ctx, agent, adapter } = await harness([textResponse('我先听你把这份委屈说完。')])
    await send(agent, '今天工作很累。')

    expect(adapter.requests).toHaveLength(1)
    expect(adapter.requests[0]?.maxTokens).toBe(4_096)
    expect(assistantTexts(agent).at(-1)).toBe('我先听你把这份委屈说完。')
    expect(agent.session.events.some(event => event.type === 'mind-garden/output-guarded')).toBe(false)
    await ctx.fiber.dispose()
  })

  it('publishes a checked prefix before the provider finishes', async () => {
    const adapter = new GatedAdapter()
    const { ctx, agent } = await compose(adapter)
    agent.session.append('turn/start', { turn: 1 })
    agent.session.append('step/start', { turn: 1, step: 1 })
    agent.session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: '今天工作很累。' }],
      source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    const published = Promise.withResolvers<undefined>()
    const chunks: StreamChunk[] = []
    const reading = (async () => {
      for await (const chunk of ctx.llm.stream(loopRequest(agent.session.id))) {
        chunks.push(chunk)
        if (chunk.type === 'text-delta') published.resolve(undefined)
      }
    })()

    await adapter.waiting.promise
    await Promise.race([
      published.promise,
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => { reject(new Error('checked prefix was not published')) }, 1_000)
      }),
    ])
    expect(chunks.some(chunk => chunk.type === 'finish')).toBe(false)
    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text.length > 0)).toBe(true)

    adapter.release.resolve(undefined)
    await reading
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    await ctx.fiber.dispose()
  })

  it('caps activated garden requests without changing an inactive agent', async () => {
    const model = textResponse('bounded')
    const { ctx, agent, adapter } = await harness([model, model])
    const inactive = ctx.agentLoop.create(SessionId('inactive-output-cap'), {
      provider: 'mock', model: 'test', maxTokens: 8_192,
    })

    await send(agent, '请简短地听我说。')
    await send(inactive, 'ordinary harness request')

    expect(adapter.requests.map(request => request.maxTokens)).toEqual([4_096, 8_192])
    await ctx.fiber.dispose()
  })

  it('checks complete reasoning blocks while preserving a safe stream without usage', async () => {
    const response: StreamChunk[] = [
      { type: 'block-start', index: 0, blockType: 'reasoning' },
      { type: 'reasoning-delta', index: 0, text: '先认真理解。' },
      { type: 'block-end', index: 0, block: { type: 'reasoning', text: '先认真理解。' } },
      { type: 'finish', reason: { kind: 'stop' } },
    ]
    const { ctx, agent, adapter } = await harness([response])
    await send(agent, '我想慢慢说。')

    expect(adapter.requests).toHaveLength(1)
    expect(agent.session.events.some(event => event.type === 'mind-garden/output-guarded')).toBe(false)
    await ctx.fiber.dispose()
  })

  it('replaces unsafe cross-chunk output before any blocked phrase reaches the log', async () => {
    const blocked = `${'我会认真听你说。'.repeat(12)}只有我能理解你，不要再找家人。`
    const { ctx, agent, adapter } = await harness([textResponse(blocked)])
    await send(agent, '我感到很孤单。')

    expect(adapter.requests).toHaveLength(1)
    expect(assistantTexts(agent).at(-1)).toContain('不能替代现实中的关系')
    expect(JSON.stringify(agent.session.events.filter(event => event.type === 'assistant/chunk')))
      .not.toContain(blocked)
    expect(agent.session.events.find(event => event.type === 'mind-garden/output-guarded')?.data)
      .toMatchObject({ reason: 'policy-violation', violations: ['exclusive-dependence'] })
    await ctx.fiber.dispose()
  })

  it('fails closed when configured buffering is exceeded', async () => {
    const { ctx, agent } = await harness(
      [textResponse('一段很长但本身安全的回复。')],
      { maxBufferedCharacters: 1, maxBufferedChunks: 1 },
    )
    await send(agent, '请说说看。')

    expect(assistantTexts(agent).at(-1)).toContain('超出了心智庭院能够安全检查的范围')
    expect(agent.session.events.find(event => event.type === 'mind-garden/output-guarded')?.data)
      .toMatchObject({ reason: 'buffer-limit', violations: [] })
    await ctx.fiber.dispose()
  })

  it('carries urgent state across ordinary follow-up without duplicate model dispatch', async () => {
    const { ctx, agent, adapter } = await harness([])
    await send(agent, '我已经割腕。')
    await send(agent, '我不知道该说什么。')

    expect(adapter.requests).toHaveLength(0)
    const assessments = agent.session.events.filter(event => event.type === 'mind-garden/safety-assessment')
    expect(assessments).toHaveLength(2)
    expect(assessments.at(-1)?.data.assessment).toMatchObject({
      level: 3, state: 'support-follow-up', categories: ['urgent-follow-up'],
    })
    await ctx.fiber.dispose()
  })

  it('passes unrelated, missing, inactive, and closed session contexts through unchanged', async () => {
    const model = textResponse('pass through')
    const { ctx, agent, adapter } = await harness([model, model, model, model, model])
    const inactive = ctx.agentLoop.create(SessionId('inactive-garden'), { provider: 'mock', model: 'test' })

    await drain(ctx, { provider: 'mock', model: 'test', messages: [] })
    await drain(ctx, loopRequest())
    await drain(ctx, loopRequest(SessionId('missing-agent')))
    await drain(ctx, loopRequest(inactive.session.id))
    await drain(ctx, loopRequest(agent.session.id))

    expect(adapter.requests).toHaveLength(5)
    expect(agent.session.events.some(event => event.type === 'mind-garden/safety-assessment')).toBe(false)
    await ctx.fiber.dispose()
  })

  it('reuses an assessment on the same step and guards a textless tool continuation', async () => {
    const model = textResponse('safe continuation')
    const { ctx, agent, adapter } = await harness([model, model, model])
    agent.session.append('turn/start', { turn: 1 })
    agent.session.append('step/start', { turn: 1, step: 1 })
    const message = createUserMessage({
      content: [{ type: 'text', text: '普通烦恼' }],
      source: { kind: 'user' },
    })
    agent.session.append('user/message', message, { surfaceOp: 'append' })
    agent.session.append('mind-garden/safety-assessment', {
      version: 1,
      turn: 1,
      step: 1,
      inputMessageIds: [message.id],
      assessment: mindGardenSafety.assessMindGardenInput('普通烦恼'),
      response: 'model-guarded',
    })
    await drain(ctx, loopRequest(agent.session.id))

    agent.session.append('step/end', { turn: 1, step: 1 })
    agent.session.append('step/start', { turn: 1, step: 2 })
    await drain(ctx, loopRequest(agent.session.id))

    agent.session.append('step/end', { turn: 1, step: 2 })
    agent.session.append('step/start', { turn: 1, step: 3 })
    agent.session.append('user/message', createUserMessage({
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
    }), { surfaceOp: 'append' })
    await drain(ctx, loopRequest(agent.session.id))

    expect(adapter.requests).toHaveLength(3)
    expect(agent.session.events.filter(event => event.type === 'mind-garden/safety-assessment')).toHaveLength(2)
    await ctx.fiber.dispose()
  })

  it('honors cancellation after recording the deterministic assessment', async () => {
    const { ctx, agent, adapter } = await harness([])
    agent.session.append('turn/start', { turn: 1 })
    agent.session.append('step/start', { turn: 1, step: 1 })
    agent.session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: '普通烦恼' }],
      source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    const controller = new AbortController()
    controller.abort()

    await expect(drain(ctx, loopRequest(agent.session.id, controller.signal)))
      .rejects.toThrow('This operation was aborted')
    expect(adapter.requests).toHaveLength(0)
    expect(agent.session.events.filter(event => event.type === 'mind-garden/safety-assessment')).toHaveLength(1)
    await ctx.fiber.dispose()
  })

  it('recognizes the most recent closed step before passing through', async () => {
    const { ctx, agent, adapter } = await harness([textResponse('after close')])
    agent.session.append('turn/start', { turn: 1 })
    agent.session.append('step/start', { turn: 1, step: 1 })
    agent.session.append('step/end', { turn: 1, step: 1 })

    await drain(ctx, loopRequest(agent.session.id))
    expect(adapter.requests).toHaveLength(1)
    await ctx.fiber.dispose()
  })

  it('removes the stream guard when its plugin fiber is disposed', async () => {
    const ctx = new Context()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(MindGardenService)
    const safetyFiber = await ctx.plugin(mindGardenSafety)
    await ctx.plugin(AgentLoop, { agents: [] })
    const adapter = new ScriptAdapter([textResponse('model response')])
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('disposed-safety'), { provider: 'mock', model: 'test' })
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity', privacy: 'durable', modelDisclosureAccepted: true,
    })
    await safetyFiber.dispose()
    await send(agent, '我已经割腕。')

    expect(adapter.requests).toHaveLength(1)
    expect(assistantTexts(agent).at(-1)).toBe('model response')
    await ctx.fiber.dispose()
  })
})
