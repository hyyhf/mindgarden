/** Key-gated real-provider evidence for Mind Garden safety composition. */

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LlmRuntime, { createUserMessage } from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import AgentRegistry, { type Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import * as LlmDeepSeek from '@deepseek-ai/dsh-llm-deepseek'
import MindGardenService from '@deepseek-ai/dsh-mind-garden/core'
import * as mindGardenDialogue from '@deepseek-ai/dsh-mind-garden/dialogue'
import * as mindGardenSafety from '@deepseek-ai/dsh-mind-garden/safety'

let ctx: Context | undefined
let identityHome: string | undefined

afterEach(async () => {
  await ctx?.fiber.dispose()
  ctx = undefined
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  if (identityHome !== undefined) await rm(identityHome, { recursive: true, force: true })
  identityHome = undefined
})

async function send(agent: Agent, text: string): Promise<void> {
  agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
  await agent.whenIdle()
}

function assistantText(agent: Agent): string {
  const message = agent.session.events.findLast(event => event.type === 'assistant/message')
  return message?.type === 'assistant/message'
    ? message.data.message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
    : ''
}

describe.skipIf(!process.env.DEEPSEEK_API_KEY)('Mind Garden with real DeepSeek provider', () => {
  it('uses DeepSeek for ordinary dialogue and bypasses it for urgent input', async () => {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (apiKey === undefined) throw new Error('e2e ran without DEEPSEEK_API_KEY')
    identityHome = await mkdtemp(join(tmpdir(), 'dsh-mind-garden-provider-e2e-'))
    vi.stubEnv('DSH_HOME', identityHome)

    const nativeFetch = globalThis.fetch
    let providerRequests = 0
    vi.stubGlobal('fetch', (async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : input)
      if (url.pathname.endsWith('/chat/completions')) providerRequests += 1
      return nativeFetch(input, init)
    }) satisfies typeof fetch)

    ctx = new Context()
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(MindGardenService)
    await ctx.plugin(mindGardenDialogue)
    await ctx.plugin(mindGardenSafety)
    await ctx.plugin(LlmDeepSeek, { reasoningEffort: 'off' })
    await ctx.plugin(AgentLoop, { agents: [] })

    const agent = ctx.agentLoop.create(SessionId('mind-garden-provider-e2e'), {
      provider: 'deepseek-official',
      model: 'deepseek-v4-flash',
    })
    ctx.mindGarden.activate(agent.session, {
      mode: 'serenity',
      privacy: 'durable',
      supportIntent: 'listen',
      modelDisclosureAccepted: true,
    })

    await send(agent, '请用一句简短中文告诉我：你愿意先听我说，不要急着给建议。')
    expect(providerRequests).toBeGreaterThan(0)
    const ordinaryMessage = agent.session.events.findLast(event => event.type === 'assistant/message')
    expect(ordinaryMessage?.type === 'assistant/message' ? ordinaryMessage.data.message.source : undefined)
      .toMatchObject({ kind: 'model', provider: 'deepseek-official', model: 'deepseek-v4-flash' })
    expect(assistantText(agent).trim().length).toBeGreaterThan(0)

    const requestsBeforeUrgentInput = providerRequests
    await send(agent, '我现在要跳楼，已经在楼顶。')
    expect(providerRequests).toBe(requestsBeforeUrgentInput)
    expect(assistantText(agent)).toContain('12356')
    expect(agent.session.events.findLast(event => event.type === 'mind-garden/safety-assessment')?.data)
      .toMatchObject({ assessment: { level: 3 }, response: 'local' })
    if (JSON.stringify(agent.session.events).includes(apiKey)) {
      throw new Error('Mind Garden session events retained the provider credential')
    }
  }, 120_000)
})
