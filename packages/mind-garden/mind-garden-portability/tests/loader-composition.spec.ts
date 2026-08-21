/** Cold-restart export over the shipped storage, credential, and attachment providers. */

import { Buffer } from 'node:buffer'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import type { Agent } from '@deepseek-ai/dsh-agent'
import LocalAttachmentStore from '@deepseek-ai/dsh-attachment-local'
import LocalCredentialProvider from '@deepseek-ai/dsh-credentials-local'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden/core'
import MindGardenMedia from '@deepseek-ai/dsh-mind-garden/media'
import MindGardenVault, { MindGardenVaultRecordId } from '@deepseek-ai/dsh-mind-garden/vault'
import { Session as SessionValue, SessionId, type Session } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import * as StorageDomain from '@deepseek-ai/dsh-storage-domain'
import * as StorageJson from '@deepseek-ai/dsh-storage-json'
import MindGardenPortability, { decryptMindGardenBackup } from '../src/index.ts'

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
const PASSPHRASE = 'warm observatory window'
const PRIVATE_MEMORY = 'A private cold-restart memory.'
const PRIVATE_TITLE = 'Rain on the observatory glass'
const PRIVATE_MEMORY_ID = MindGardenVaultRecordId('10000000-0000-4000-8000-000000000001')

const activeState: MindGardenSessionState = {
  revision: 1,
  activatedAt: 1,
  updatedAt: 1,
  mode: 'serenity',
  supportIntent: 'listen',
  privacy: 'durable',
  contractVersion: 1,
  modelDisclosureAccepted: false,
}

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

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
    "  name: 'test:mind-garden-portability-runtime'",
    '- id: attachment-local',
    "  name: '@deepseek-ai/dsh-attachment-local'",
    '  config:',
    `    dshHome: ${JSON.stringify(home)}`,
    '- id: mind-garden-vault',
    "  name: '@deepseek-ai/dsh-mind-garden/vault'",
    '- id: mind-garden-media',
    "  name: '@deepseek-ai/dsh-mind-garden/media'",
    '- id: mind-garden-portability',
    "  name: '@deepseek-ai/dsh-mind-garden/portability'",
    '',
  ].join('\n'))

  const live = new Map<string, Agent>()
  const states = new WeakMap<Session, MindGardenSessionState>()
  const TestRuntime = (ctx: Context) => {
    ctx.provide('agents', { get: (id: string) => live.get(id) } as never)
    ctx.provide('mindGarden', { current: (session: Session) => states.get(session) ?? null } as never)
    ctx.provide('llm', {} as never)
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
    ['test:mind-garden-portability-runtime', TestRuntime],
    ['@deepseek-ai/dsh-attachment-local', LocalAttachmentStore],
    ['@deepseek-ai/dsh-mind-garden/vault', MindGardenVault],
    ['@deepseek-ai/dsh-mind-garden/media', MindGardenMedia],
    ['@deepseek-ai/dsh-mind-garden/portability', MindGardenPortability],
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

describe('Mind Garden portability real Loader composition', () => {
  it('restores a cold-reopened archive into a second real profile and converges on retry', async () => {
    root = await mkdtemp(join(tmpdir(), 'dsh-mind-garden-portability-'))
    const first = await loadComposition(root)
    const agent = first.makeAgent('portable-restart')
    await first.ctx.mindGardenVault.put('memories', PRIVATE_MEMORY_ID, {
      recordType: 'memory',
      formatVersion: 1,
      id: PRIVATE_MEMORY_ID,
      version: '20000000-0000-4000-8000-000000000002',
      status: 'candidate',
      kind: 'fact',
      sensitivity: 'normal',
      content: PRIVATE_MEMORY,
      reason: 'Cold-restart composition coverage',
      recallPolicy: 'never',
      sources: [{ sessionId: agent.id }],
      proposalOrigin: 'human',
      createdAt: 1,
      updatedAt: 1,
    })
    const created = await first.ctx.mindGardenMedia.createPhotoStory(agent, {
      data: PNG,
      mediaType: 'image/png',
      name: 'observatory.png',
      title: PRIVATE_TITLE,
      note: 'Only the owner should read this note.',
      stamp: { localDate: '2026-08-20', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 },
    })
    if (!created.ok) throw new Error('photo story creation failed')

    await first.ctx.fiber.dispose()
    context = undefined
    const physicalVault = await readFile(join(root, 'storages', 'mind_garden_vault.json'), 'utf8')
    const physicalCredentials = await readFile(join(root, '.credentials.yaml'), 'utf8')
    expect(physicalVault).not.toContain(PRIVATE_MEMORY)
    expect(physicalVault).not.toContain(PRIVATE_TITLE)

    const restarted = await loadComposition(root)
    const restartedAgent = restarted.makeAgent('portable-restart')
    const exported = await restarted.ctx.mindGardenPortability.exportBackup(restartedAgent, {
      passphrase: PASSPHRASE,
    })
    if (!exported.ok) throw new Error(`backup failed: ${exported.error.code}`)
    const wireBytes = Buffer.from(exported.value.data, 'base64')
    const wireText = wireBytes.toString('utf8')
    expect(wireText).not.toContain(PRIVATE_MEMORY)
    expect(wireText).not.toContain(PRIVATE_TITLE)
    const credentialSecret = physicalCredentials.match(/MIND_GARDEN_DATA_KEY:\s*([^\s]+)/)?.[1]
    expect(credentialSecret).toBeDefined()
    expect(wireText).not.toContain(credentialSecret)

    const restored = await decryptMindGardenBackup(wireBytes, PASSPHRASE, 128 * 1024 * 1024)
    const restoredMemory = restored.collections.memories.find(record => record.id === PRIVATE_MEMORY_ID)
    expect(restoredMemory?.value).toMatchObject({ content: PRIVATE_MEMORY })
    expect(restored.collections.media[0]?.value).toMatchObject({ title: PRIVATE_TITLE })
    expect(restored.attachments).toHaveLength(1)
    expect(restored.attachments[0]?.data).toBe(PNG)

    await restarted.ctx.fiber.dispose()
    context = undefined
    const restoredHome = join(root, 'restored-profile')
    await mkdir(restoredHome)
    const target = await loadComposition(restoredHome)
    const targetAgent = target.makeAgent('portable-restart')
    const inspected = await target.ctx.mindGardenPortability.inspectBackup(targetAgent, {
      data: exported.value.data,
      passphrase: PASSPHRASE,
    })
    expect(inspected).toMatchObject({
      ok: true,
      value: {
        willAdd: { memories: 1, reflections: 0, media: 1, stars: 0 },
        willKeep: { memories: 0, reflections: 0, media: 0, stars: 0 },
      },
    })
    const imported = await target.ctx.mindGardenPortability.restoreBackup(targetAgent, {
      data: exported.value.data,
      passphrase: PASSPHRASE,
      confirm: true,
    })
    expect(imported).toMatchObject({
      ok: true,
      value: {
        added: { memories: 1, reflections: 0, media: 1, stars: 0 },
        kept: { memories: 0, reflections: 0, media: 0, stars: 0 },
        attachments: 1,
      },
    })
    await expect(target.ctx.mindGardenVault.get('memories', PRIVATE_MEMORY_ID))
      .resolves.toEqual(expect.objectContaining({ content: PRIVATE_MEMORY }))
    const listed = await target.ctx.mindGardenMedia.listPhotoStories(targetAgent, {})
    if (!listed.ok) throw new Error(`restored media list failed: ${listed.error.code}`)
    expect(listed.value.stories).toHaveLength(1)
    expect(listed.value.stories[0]?.title).toBe(PRIVATE_TITLE)
    const story = listed.value.stories[0]
    if (story === undefined) throw new Error('restored photo story missing')
    const image = await target.ctx.mindGardenMedia.readPhotoStory(targetAgent, { id: story.id })
    if (!image.ok) throw new Error(`restored media read failed: ${image.error.code}`)
    expect(image.value.data).toBe(PNG)

    await expect(target.ctx.mindGardenPortability.restoreBackup(targetAgent, {
      data: exported.value.data,
      passphrase: PASSPHRASE,
      confirm: true,
    })).resolves.toMatchObject({
      ok: true,
      value: {
        added: { memories: 0, reflections: 0, media: 0, stars: 0 },
        kept: { memories: 1, reflections: 0, media: 1, stars: 0 },
      },
    })
  })
})
