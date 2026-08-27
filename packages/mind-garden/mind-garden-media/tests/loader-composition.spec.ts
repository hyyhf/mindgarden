/** Cold-restart Loader composition over shipped attachment, storage, and credential providers. */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import type { Agent } from '@deepseek-ai/dsh-agent'
import LocalAttachmentStore from '@deepseek-ai/dsh-attachment-local'
import type { Session } from '@deepseek-ai/dsh-session'
import { Session as SessionValue, SessionId } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import * as StorageDomain from '@deepseek-ai/dsh-storage-domain'
import * as StorageJson from '@deepseek-ai/dsh-storage-json'
import LocalCredentialProvider from '@deepseek-ai/dsh-credentials-local'
import MindGardenVault from '@deepseek-ai/dsh-mind-garden/vault'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden/core'
import MindGardenMedia from '../src/index.ts'

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
const OBSERVATION = JSON.stringify({
  grounding: {
    visualSummary: 'A single pale pixel forms the admitted test image.',
    visibleElements: ['one pale pixel'],
    textInImage: [],
    uncertainDetails: ['no larger scene is visible'],
  },
  opening: 'I can only ground this in one pale visible pixel, with no larger scene available. What memory would you like to place beside it?',
  quickReplies: [
    { kind: 'remember', label: 'I want to add the memory behind it' },
    { kind: 'detail', label: 'I want to stay with the visible detail' },
    { kind: 'correct', label: 'I want to correct this observation' },
  ],
})
const DIALOGUE = JSON.stringify({
  reply: 'The visible record remains one pale pixel; the private meaning comes from your memory.',
  quickReplies: [
    { kind: 'remember', label: 'I want to continue the memory' },
    { kind: 'detail', label: 'I want to revisit the visible detail' },
    { kind: 'correct', label: 'I want to correct the distinction' },
  ],
})

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
    '- id: attachment-local',
    "  name: '@deepseek-ai/dsh-attachment-local'",
    '  config:',
    `    dshHome: ${JSON.stringify(home)}`,
    '- id: mind-garden-vault',
    "  name: '@deepseek-ai/dsh-mind-garden/vault'",
    '- id: mind-garden-media',
    "  name: '@deepseek-ai/dsh-mind-garden/media'",
    '  config:',
    '    observerProvider: test-vision',
    '    observerModel: test-eye',
    '',
  ].join('\n'))

  const live = new Map<string, Agent>()
  const states = new WeakMap<Session, MindGardenSessionState>()
  const TestRuntime = (ctx: Context) => {
    ctx.provide('agents', { get: (id: string) => live.get(id) } as never)
    ctx.provide('mindGarden', { current: (session: Session) => states.get(session) ?? null } as never)
    ctx.provide('llm', {
      resolveModelInfo(provider: string, model: string) {
        return Promise.resolve({ provider, id: model, name: model, inputModalities: ['text', 'image'] })
      },
      async * stream(options: { purpose?: string }) {
        const text = options.purpose === 'mind-garden-photo-dialogue' ? DIALOGUE : OBSERVATION
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
    ['@deepseek-ai/dsh-attachment-local', LocalAttachmentStore],
    ['@deepseek-ai/dsh-mind-garden/vault', MindGardenVault],
    ['@deepseek-ai/dsh-mind-garden/media', MindGardenMedia],
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

describe('Mind Garden media real Loader composition', () => {
  it('persists encrypted visual dialogue and reopens it with verified attachment bytes', async () => {
    root = await mkdtemp(join(tmpdir(), 'dsh-mind-garden-media-'))
    const first = await loadComposition(root)
    const agent = first.makeAgent('media-restart')
    const created = await first.ctx.mindGardenMedia.createPhotoStory(agent, {
      data: PNG,
      mediaType: 'image/png',
      name: 'private-pixel.png',
      title: 'Private test photo',
      note: 'A private note that must remain encrypted.',
      stamp: { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 },
    })
    if (!created.ok) throw new Error('create failed')
    const admitted = await first.ctx.mindGardenMedia.readPhotoStory(agent, { id: created.value.id })
    if (!admitted.ok) throw new Error('admitted photo read failed')
    const admittedData = admitted.value.data
    const observed = await first.ctx.mindGardenMedia.observePhotoStory(agent, {
      id: created.value.id, ifVersion: created.value.version,
    })
    if (!observed.ok) throw new Error('observe failed')
    const continued = await first.ctx.mindGardenMedia.continuePhotoStory(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      content: 'This private memory belongs to a larger evening scene.',
    })
    expect(continued).toMatchObject({
      ok: true,
      value: { turns: [{ role: 'assistant' }, { role: 'user' }, { role: 'assistant' }] },
    })

    const storageText = await readFile(join(root, 'storages', 'mind_garden_vault.json'), 'utf8')
    expect(storageText).not.toContain('Private test photo')
    expect(storageText).not.toContain('private note')
    expect(storageText).not.toContain('one pale pixel')
    expect(storageText).not.toContain('larger evening scene')
    expect(storageText).not.toContain('private meaning')

    await first.ctx.fiber.dispose()
    context = undefined
    const restarted = await loadComposition(root)
    const restartedAgent = restarted.makeAgent('media-restart')
    const listed = await restarted.ctx.mindGardenMedia.listPhotoStories(restartedAgent, {})
    expect(listed).toMatchObject({
      ok: true,
      value: {
        stories: [{
          title: 'Private test photo',
          observation: { grounding: { visualSummary: 'A single pale pixel forms the admitted test image.' } },
          turns: [
            { role: 'assistant' },
            { role: 'user', content: 'This private memory belongs to a larger evening scene.' },
            { role: 'assistant' },
          ],
        }],
      },
    })
    if (!listed.ok || listed.value.stories[0] === undefined) throw new Error('restarted story missing')
    expect(listed.value.stories[0].turns[2]?.content).toContain('private meaning')
    await expect(restarted.ctx.mindGardenMedia.readPhotoStory(restartedAgent, {
      id: listed.value.stories[0].id,
    })).resolves.toMatchObject({ ok: true, value: { data: admittedData } })
  })
})
