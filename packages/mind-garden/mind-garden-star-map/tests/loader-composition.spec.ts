/** Cold-restart Loader composition over shipped storage and credential providers. */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { Session } from '@deepseek-ai/dsh-session'
import { Session as SessionValue, SessionId } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import * as StorageDomain from '@deepseek-ai/dsh-storage-domain'
import * as StorageJson from '@deepseek-ai/dsh-storage-json'
import LocalCredentialProvider from '@deepseek-ai/dsh-credentials-local'
import MindGardenVault from '@deepseek-ai/dsh-mind-garden-vault'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden-core'
import MindGardenStarMap from '../src/index.ts'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

const activeState: MindGardenSessionState = {
  revision: 1,
  activatedAt: 1,
  updatedAt: 1,
  mode: 'serenity',
  supportIntent: 'listen',
  privacy: 'durable',
  contractVersion: 1,
  modelDisclosureAccepted: true,
}

async function loadComposition(home: string): Promise<{ ctx: Context; makeAgent: (id: string) => Agent }> {
  const storageRoot = join(home, 'storages')
  const credentialsPath = join(home, '.credentials.yaml')
  const configPath = join(home, 'cordis.yml')
  await writeFile(configPath, [
    '- id: storage',
    "  name: '@deepseek-ai/dsh-storage'",
    '- id: storage-json',
    "  name: '@deepseek-ai/dsh-storage-json'",
    '  config:',
    `    root: ${JSON.stringify(storageRoot)}`,
    '- id: storage-domain',
    "  name: '@deepseek-ai/dsh-storage-domain'",
    '  config:',
    '    backend: json',
    '- id: credentials',
    "  name: '@deepseek-ai/dsh-credentials-local'",
    '  config:',
    `    path: ${JSON.stringify(credentialsPath)}`,
    '    watch: false',
    '- id: test-runtime',
    "  name: 'test:mind-garden-runtime'",
    '- id: mind-garden-vault',
    "  name: '@deepseek-ai/dsh-mind-garden-vault'",
    '- id: mind-garden-star-map',
    "  name: '@deepseek-ai/dsh-mind-garden-star-map'",
    '',
  ].join('\n'))

  const live = new Map<string, Agent>()
  const states = new WeakMap<Session, MindGardenSessionState>()
  const TestRuntime = (ctx: Context) => {
    ctx.provide('agents', { get: (id: string) => live.get(id) } as never)
    ctx.provide('mindGarden', { current: (session: Session) => states.get(session) ?? null } as never)
    ctx.provide('mindGardenMemory', {
      list: () => Promise.resolve({ ok: true, value: { items: [] } }),
    } as never)
    ctx.provide('mindGardenReflection', {
      authorizedContext: () => Promise.resolve({ ok: true, value: { todayCheckin: null, retrievableJournals: [] } }),
      openQuestionContext: () => Promise.resolve({ ok: true, value: { openQuestions: [] } }),
      listPeriodReviews: () => Promise.resolve({ ok: true, value: { reviews: [] } }),
    } as never)
    ctx.provide('llm', {
      async * stream(options: { purpose?: string }) {
        const value = options.purpose === 'mind-garden-star-observer-dialogue' ? {
          reply: 'This private follow-up remains attached to the encrypted card.',
          quickReplies: [
            { kind: 'deepen', label: '我想补充一个具体例子' },
            { kind: 'shift', label: '我想换一个角度' },
            { kind: 'correct', label: '我觉得这里仍不准确' },
          ],
          revision: null,
        } : { card: {
          title: 'Encrypted observer card',
          frontText: 'A private hypothesis remains provisional.',
          analysis: {
            situation: 'A question is still open.',
            coreIssue: 'The smallest test is unknown.',
            tradeoff: 'Acting is faster; testing first may reduce avoidable cost.',
            guidance: 'Try one reversible step.',
          },
          openQuestion: '我愿意先验证哪个假设？',
          symbolicBasis: [], evidenceKeys: [], confidence: 0.4, traitKind: 'pattern',
        } }
        const text = JSON.stringify(value)
        yield { type: 'block-start', index: 0, blockType: 'text' }
        yield { type: 'text-delta', index: 0, text }
        yield { type: 'block-end', index: 0, block: { type: 'text', text } }
        yield { type: 'finish', reason: { kind: 'stop' } }
      },
    } as never)
  }
  const ctx = new Context()
  context = ctx
  ctx.baseUrl = pathToFileURL(home).href + '/'
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  const modules = new Map<string, unknown>([
    ['@deepseek-ai/dsh-storage', Storage],
    ['@deepseek-ai/dsh-storage-json', StorageJson],
    ['@deepseek-ai/dsh-storage-domain', StorageDomain],
    ['@deepseek-ai/dsh-credentials-local', LocalCredentialProvider],
    ['test:mind-garden-runtime', TestRuntime],
    ['@deepseek-ai/dsh-mind-garden-vault', MindGardenVault],
    ['@deepseek-ai/dsh-mind-garden-star-map', MindGardenStarMap],
  ])
  ctx.loader.internal = {
    version: 'v2',
    async import(specifier: string) {
      if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
      return modules.get(specifier)
    },
  } as unknown as NonNullable<typeof ctx.loader.internal>
  await ctx.loader.create({
    name: 'cordis:include',
    config: { path: pathToFileURL(configPath).href },
  })
  await ctx.loader.await()
  return {
    ctx,
    makeAgent(id: string) {
      const session = SessionValue.create(SessionId(id))
      const agent = { id: session.id, session, options: {}, status: 'idle' } as Agent
      live.set(agent.id, agent)
      states.set(session, activeState)
      return agent
    },
  }
}

describe('Mind Garden Star Map real Loader composition', () => {
  it('persists encrypted ritual state and reopens it after a cold restart', async () => {
    root = await mkdtemp(join(tmpdir(), 'dsh-mind-garden-stars-'))
    const first = await loadComposition(root)
    const agent = first.makeAgent('star-restart')
    const completed = await first.ctx.mindGardenStarMap.completeRitual(agent, {
      displayName: 'Private stargazer',
      birthMonth: null,
      birthDay: null,
      birthYear: null,
      birthTime: '',
      birthTimeKnown: false,
      birthCity: '',
      birthCityKnown: false,
      mbtiMode: 'observe',
      mbtiType: '',
      mbtiAnswers: [],
      selfWords: ['quiet courage'],
      observationIntent: 'Notice change without freezing it.',
      observerTone: 'gentle',
      permissions: {
        dailyReflections: false,
        confirmedMemories: false,
        openQuestions: false,
        periodReviews: false,
      },
      reducedMotion: true,
      ifVersion: null,
    })
    expect(completed).toMatchObject({ ok: true, value: { profile: { displayName: 'Private stargazer' } } })
    const drawn = await first.ctx.mindGardenStarMap.drawCard(agent, {
      deck: 'current-self',
      question: 'A private observer question',
      observedLocalDate: '2026-08-19',
      provider: 'test',
      model: 'test',
    })
    expect(drawn).toMatchObject({
      ok: true,
      value: { title: 'Encrypted observer card', status: 'draft', cardKind: 'imagination' },
    })
    if (!drawn.ok) throw new Error('draw failed')
    await expect(first.ctx.mindGardenStarMap.continueCard(agent, {
      id: drawn.value.id,
      ifVersion: drawn.value.version,
      content: 'A private follow-up from the user.',
      provider: 'test',
      model: 'test',
    })).resolves.toMatchObject({
      ok: true,
      value: { turns: [{ role: 'user' }, { role: 'assistant' }] },
    })

    const storageText = await readFile(join(root, 'storages', 'mind_garden_vault.json'), 'utf8')
    expect(storageText).not.toContain('Private stargazer')
    expect(storageText).not.toContain('quiet courage')
    expect(storageText).not.toContain('Encrypted observer card')
    expect(storageText).not.toContain('A private observer question')
    expect(storageText).not.toContain('A private follow-up from the user.')
    expect(storageText).not.toContain('This private follow-up remains attached')

    await first.ctx.fiber.dispose()
    context = undefined
    const restarted = await loadComposition(root)
    const restartedAgent = restarted.makeAgent('star-restart')
    await expect(restarted.ctx.mindGardenStarMap.overview(restartedAgent)).resolves.toMatchObject({
      ok: true,
      value: {
        profile: { displayName: 'Private stargazer', reducedMotion: true },
        traits: [{ label: 'quiet courage', source: 'ritual-self-report' }],
        activeCard: {
          title: 'Encrypted observer card',
          status: 'draft',
          turns: [
            { role: 'user', content: 'A private follow-up from the user.' },
            { role: 'assistant', content: 'This private follow-up remains attached to the encrypted card.' },
          ],
        },
      },
    })
  })
})
