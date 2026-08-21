import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { AttachmentError, AttachmentId, type ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { Session } from '@deepseek-ai/dsh-session'
import { Session as SessionValue, SessionId } from '@deepseek-ai/dsh-session'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import MindGardenVault, {
  createMindGardenDataKey,
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden/vault'
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden/core'
import MindGardenMedia, {
  defaultPhotoParticleConfig,
  type Config,
  type MindGardenMediaStamp,
} from '../src/index.ts'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import { MemoryMediaPool, MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import { apply as invariantApply } from '../src/invariant.ts'

const attachment: ImageAttachmentRef = {
  attachmentId: AttachmentId(`sha256:${'a'.repeat(64)}`),
  mediaType: 'image/png',
  bytes: 3,
  width: 2,
  height: 1,
  name: 'frame.png',
}
const unnamedAttachment: ImageAttachmentRef = {
  attachmentId: attachment.attachmentId,
  mediaType: attachment.mediaType,
  bytes: attachment.bytes,
  width: attachment.width,
  height: attachment.height,
}
const stamp = (overrides: Partial<MindGardenMediaStamp> = {}): MindGardenMediaStamp => ({
  localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480, ...overrides,
})
const activeState = (privacy: MindGardenSessionState['privacy'] = 'durable'): MindGardenSessionState => ({
  revision: 1, activatedAt: 1, updatedAt: 1, mode: 'serenity', supportIntent: 'listen', privacy,
  contractVersion: 1, modelDisclosureAccepted: true,
})

const observationOutput = JSON.stringify({
  grounding: {
    visualSummary: '暖色灯光下，一只白色杯子放在木桌靠近窗边的位置。',
    visibleElements: ['白色杯子', '木桌', '窗边的暖色光影'],
    textInImage: [],
    uncertainDetails: ['杯中内容不可见'],
  },
  opening: '我先把它看作一个仍待你确认的画面：暖光落在窗边木桌与白色杯子上，杯中内容并不可见。那束光对你来说更像清晨还是傍晚？',
  quickReplies: [
    { kind: 'remember', label: '我想起了拍下它时的心情' },
    { kind: 'detail', label: '我想先聊聊那只白色杯子' },
    { kind: 'correct', label: '我想纠正一处画面细节' },
  ],
})

const dialogueOutput = JSON.stringify({
  reply: '你记得那是傍晚；画面本身只能确认暖色光影，而“傍晚”来自你的记忆。那一刻最想留住的是什么？',
  quickReplies: [
    { kind: 'remember', label: '我想继续说说那天傍晚' },
    { kind: 'detail', label: '我想再看看光影的细节' },
    { kind: 'correct', label: '我想补充一处真实情况' },
  ],
})

function textStream(output: string): AsyncIterable<StreamChunk> {
  return (async function* () {
    yield { type: 'block-start', index: 0, blockType: 'text' }
    yield { type: 'text-delta', index: 0, text: output }
    yield { type: 'block-end', index: 0, block: { type: 'text', text: output } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })()
}

async function harness(config: Config = {}, direct = false) {
  const ctx = new Context()
  const pool = new MemoryMediaPool()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(MemoryCredentials, { MIND_GARDEN_DATA_KEY: createMindGardenDataKey() })
  const live = new Map<string, Agent>()
  const states = new WeakMap<Session, MindGardenSessionState | null>()
  ctx.provide('agents', { get: (id: string) => live.get(id) } as never)
  ctx.provide('mindGarden', { current: (session: Session) => states.get(session) ?? null } as never)
  const saveImage = vi.fn(() => Promise.resolve(attachment))
  const readImage = vi.fn(() => Promise.resolve({ ref: attachment, data: Uint8Array.from([1, 2, 3]) }))
  ctx.provide('attachments', {
    imageLimits: { maxImageBytes: 12, maxImagePixels: 100 }, saveImage, readImage,
  } as never)
  const modelOutputs: Array<string | Error | AsyncIterable<StreamChunk>> = []
  const modelCalls: GenerateOptions[] = []
  const resolveModelInfo = vi.fn(() => Promise.resolve({
    provider: 'vision', id: 'garden-eye', name: 'Garden Eye', inputModalities: ['text', 'image'],
  }))
  const stream = vi.fn((options: GenerateOptions): AsyncIterable<StreamChunk> => {
    modelCalls.push(options)
    const next = modelOutputs.shift()
    if (next instanceof Error) {
      return (async function* () { throw next })()
    }
    if (next !== undefined && typeof next !== 'string') return next
    return textStream(next ?? observationOutput)
  })
  ctx.provide('llm', { resolveModelInfo, stream } as never)
  await ctx.plugin(MindGardenVault)
  const service = direct
    ? new MindGardenMedia(ctx, config)
    : (await ctx.plugin(MindGardenMedia, config), ctx.mindGardenMedia)
  const makeAgent = (id: string, state: MindGardenSessionState | null = activeState()): Agent => {
    const session = SessionValue.create(SessionId(id))
    const agent = { id: session.id, session, options: {}, status: 'idle' } as Agent
    live.set(agent.id, agent)
    states.set(session, state)
    return agent
  }
  return { ctx, service, makeAgent, saveImage, readImage, modelCalls, modelOutputs, resolveModelInfo, pool }
}

const createRequest = (overrides: Record<string, unknown> = {}) => ({
  data: 'AQID', mediaType: 'image/png' as const, name: 'x', title: 'ok', note: 'ok',
  stamp: stamp(), particleConfig: defaultPhotoParticleConfig(), ...overrides,
})

afterEach(() => { vi.useRealTimers() })

describe('Mind Garden media service', () => {
  it('requires a live activated durable Agent and drains admitted operations', async () => {
    const { ctx, makeAgent } = await harness()
    const inactive = makeAgent('inactive', null)
    const ephemeral = makeAgent('ephemeral', activeState('ephemeral'))
    await expect(ctx.mindGardenMedia.createPhotoStory(inactive, createRequest())).resolves.toEqual({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMedia.readPhotoStory(inactive, { id: 'missing' as never })).resolves.toEqual({
      ok: false, error: { code: 'mind-garden-not-active' },
    })
    await expect(ctx.mindGardenMedia.updatePhotoStory(inactive, {
      id: 'missing' as never, ifVersion: 'version' as never, title: 'title',
    })).resolves.toEqual({ ok: false, error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenMedia.deletePhotoStory(inactive, {
      id: 'missing' as never, ifVersion: 'version' as never,
    })).resolves.toEqual({ ok: false, error: { code: 'mind-garden-not-active' } })
    await expect(ctx.mindGardenMedia.listPhotoStories(ephemeral, {})).resolves.toEqual({
      ok: false, error: { code: 'durable-session-required' },
    })
    const owned = makeAgent('owned')
    await expect(ctx.mindGardenMedia.readPhotoStory({ ...owned }, { id: 'missing' as never }))
      .rejects.toThrow("agent 'owned' is not live in this registry")
    const service = ctx.mindGardenMedia
    await ctx.fiber.dispose()
    await expect(service.listPhotoStories(inactive, {})).rejects.toThrow('service is disposing')
  })

  it('supports direct defaults, omitted optional fields, deterministic sorting, and partial updates', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const { service, makeAgent, saveImage } = await harness({}, true)
    const agent = makeAgent('direct-defaults')
    saveImage.mockResolvedValueOnce(unnamedAttachment)
    const first = await service.createPhotoStory(agent, createRequest({
      name: undefined, title: undefined, note: undefined, particleConfig: undefined,
    }))
    if (!first.ok) throw new Error('first create failed')
    expect(first.value).toMatchObject({ title: '', note: '', attachment: { mediaType: 'image/png' } })
    expect(first.value.attachment).not.toHaveProperty('name')
    const second = await service.createPhotoStory(agent, createRequest({ title: 'same time' }))
    if (!second.ok) throw new Error('second create failed')
    vi.setSystemTime(2_000)
    const third = await service.createPhotoStory(agent, createRequest({ title: 'newest' }))
    if (!third.ok) throw new Error('third create failed')
    const listed = await service.listPhotoStories(agent, {})
    if (!listed.ok) throw new Error('list failed')
    expect(listed.value.stories).toHaveLength(3)
    expect(listed.value.stories[0]?.title).toBe('newest')

    const noteOnly = await service.updatePhotoStory(agent, {
      id: first.value.id, ifVersion: first.value.version, note: 'next',
    })
    if (!noteOnly.ok) throw new Error('note update failed')
    expect(noteOnly.value).toMatchObject({ title: '', note: 'next' })
    const titleOnly = await service.updatePhotoStory(agent, {
      id: noteOnly.value.id, ifVersion: noteOnly.value.version, title: 'next title',
    })
    expect(titleOnly).toMatchObject({ ok: true, value: { title: 'next title', note: 'next' } })
  })

  it('creates, lists, verifies, updates, and idempotently deletes photo stories', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const { ctx, makeAgent, saveImage, readImage } = await harness()
    const agent = makeAgent('lifecycle')
    const created = await ctx.mindGardenMedia.createPhotoStory(agent, createRequest({
      name: 'frame.png', title: 'A frame', note: 'A note',
    }))
    expect(created).toMatchObject({ ok: true, value: { title: 'A frame', note: 'A note', createdAt: 1_000 } })
    if (!created.ok) throw new Error('create failed')
    expect(saveImage).toHaveBeenCalledWith({ data: Buffer.from([1, 2, 3]), mediaType: 'image/png', name: 'frame.png' })
    await expect(ctx.mindGardenMedia.listPhotoStories(agent, { limit: 1 })).resolves.toEqual({
      ok: true, value: { stories: [created.value] },
    })
    await expect(ctx.mindGardenMedia.readPhotoStory(agent, { id: created.value.id })).resolves.toEqual({
      ok: true, value: { attachment, data: 'AQID' },
    })
    expect(readImage).toHaveBeenCalledWith(attachment)

    vi.setSystemTime(2_000)
    const updated = await ctx.mindGardenMedia.updatePhotoStory(agent, {
      id: created.value.id, ifVersion: created.value.version, title: 'A clearer frame', note: '',
      particleConfig: { ...created.value.particleConfig, preset: 'dust' },
    })
    expect(updated).toMatchObject({ ok: true, value: { title: 'A clearer frame', note: '', updatedAt: 2_000 } })
    if (!updated.ok) throw new Error('update failed')
    await expect(ctx.mindGardenMedia.updatePhotoStory(agent, {
      id: updated.value.id, ifVersion: created.value.version, title: 'stale',
    })).resolves.toMatchObject({ error: { code: 'photo-story-version-conflict', current: updated.value } })
    await expect(ctx.mindGardenMedia.deletePhotoStory(agent, {
      id: updated.value.id, ifVersion: created.value.version,
    })).resolves.toMatchObject({ error: { code: 'photo-story-version-conflict' } })
    await expect(ctx.mindGardenMedia.deletePhotoStory(agent, {
      id: updated.value.id, ifVersion: updated.value.version,
    })).resolves.toEqual({ ok: true, value: { absent: true } })
    await expect(ctx.mindGardenMedia.deletePhotoStory(agent, {
      id: updated.value.id, ifVersion: updated.value.version,
    })).resolves.toEqual({ ok: true, value: { absent: true } })
  })

  it('maps strict request and attachment failures without leaking infrastructure errors', async () => {
    const { ctx, makeAgent, saveImage, readImage } = await harness({
      maxTitleBytes: 4, maxNoteBytes: 4, maxNameBytes: 4, maxTimeZoneBytes: 128, maxStoriesPerList: 2,
    })
    const agent = makeAgent('validation')
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ data: '' })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'data', reason: 'blank' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ data: 'not-base64' })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'data', reason: 'invalid' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ data: Buffer.alloc(13).toString('base64') })))
      .resolves.toMatchObject({ error: { code: 'attachment-rejected', reason: 'IMAGE_TOO_LARGE' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ name: 'long-name.png' })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'name', reason: 'too-large' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ name: ' ' })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'name', reason: 'blank' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ title: 'long title' })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'title', reason: 'too-large' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ note: 'long note' })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'note', reason: 'too-large' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ stamp: stamp({ localDate: 'bad' }) })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'stamp', reason: 'invalid' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ stamp: stamp({ timeZone: ' ' }) })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'stamp', reason: 'blank' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ stamp: stamp({ timeZone: 'Mars/Base' }) })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'stamp', reason: 'invalid' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ stamp: stamp({ timeZone: 'x'.repeat(129) }) })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'stamp', reason: 'too-large' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ stamp: stamp({ utcOffsetMinutes: 900 }) })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'stamp', reason: 'invalid' } })
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ particleConfig: {} })))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'particleConfig', reason: 'invalid' } })
    await expect(ctx.mindGardenMedia.listPhotoStories(agent, { limit: 0 }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'limit' } })
    await expect(ctx.mindGardenMedia.updatePhotoStory(agent, { id: 'missing' as never, ifVersion: 'v' as never }))
      .resolves.toMatchObject({ error: { code: 'invalid-field', field: 'mutation', reason: 'blank' } })
    await expect(ctx.mindGardenMedia.readPhotoStory(agent, { id: 'missing' as never }))
      .resolves.toMatchObject({ error: { code: 'photo-story-not-found' } })

    saveImage.mockRejectedValueOnce(new AttachmentError('bad image', 'INVALID_IMAGE'))
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ name: 'x' })))
      .resolves.toMatchObject({ error: { code: 'attachment-rejected', reason: 'INVALID_IMAGE' } })
    saveImage.mockRejectedValueOnce(new AttachmentError('disk', 'ATTACHMENT_WRITE_FAILED'))
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ name: 'x' })))
      .resolves.toMatchObject({ error: { code: 'attachment-unavailable' } })
    saveImage.mockRejectedValueOnce(new Error('unexpected attachment failure'))
    await expect(ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ name: 'x' })))
      .rejects.toThrow('unexpected attachment failure')
    const created = await ctx.mindGardenMedia.createPhotoStory(agent, createRequest({ name: 'x', title: 'ok', note: 'ok' }))
    if (!created.ok) throw new Error('create failed')
    readImage.mockRejectedValueOnce(new AttachmentError('corrupt', 'ATTACHMENT_CORRUPT'))
    await expect(ctx.mindGardenMedia.readPhotoStory(agent, { id: created.value.id }))
      .resolves.toEqual({ ok: false, error: { code: 'attachment-unavailable' } })
    readImage.mockRejectedValueOnce(new Error('unexpected read failure'))
    await expect(ctx.mindGardenMedia.readPhotoStory(agent, { id: created.value.id }))
      .rejects.toThrow('unexpected read failure')
  })

  it('observes an explicitly authorized image once and continues from frozen grounding without resending it', async () => {
    const { ctx, makeAgent, modelCalls, modelOutputs, pool, readImage } = await harness({
      observerProvider: 'vision', observerModel: 'garden-eye',
    })
    const agent = makeAgent('photo-dialogue')
    const created = await ctx.mindGardenMedia.createPhotoStory(agent, createRequest({
      title: '窗边', note: '这是我保存的一段私人记忆。',
    }))
    if (!created.ok) throw new Error('create failed')
    modelOutputs.push(observationOutput)
    const observed = await ctx.mindGardenMedia.observePhotoStory(agent, {
      id: created.value.id, ifVersion: created.value.version,
    })
    expect(observed).toMatchObject({
      ok: true,
      value: {
        observation: {
          grounding: { source: 'model-observation-unconfirmed' },
          provider: 'vision', model: 'garden-eye', promptVersion: 'mind-garden-photo-observe-v1',
        },
        turns: [{ role: 'assistant' }],
        quickReplies: [
          { kind: 'remember' }, { kind: 'detail' }, { kind: 'correct' },
        ],
      },
    })
    if (!observed.ok) throw new Error('observe failed')
    expect(observed.value.observation?.grounding.visualSummary).toContain('白色杯子')
    expect(observed.value.turns[0]?.content).toContain('仍待你确认')
    expect(readImage).toHaveBeenCalledWith(attachment, expect.any(AbortSignal))
    expect(modelCalls[0]).toMatchObject({
      provider: 'vision', model: 'garden-eye', purpose: 'mind-garden-photo-observation',
      sessionId: agent.session.id,
    })
    expect(JSON.stringify(modelCalls[0]?.messages)).toContain(`\"attachmentId\":\"${attachment.attachmentId}\"`)
    expect(JSON.stringify(modelCalls[0]?.messages)).toContain('\"type\":\"image\"')

    modelOutputs.push(dialogueOutput)
    const continued = await ctx.mindGardenMedia.continuePhotoStory(agent, {
      id: observed.value.id,
      ifVersion: observed.value.version,
      content: '那确实是傍晚，我刚回到家。',
      quickReplyKind: 'remember',
    })
    expect(continued).toMatchObject({
      ok: true,
      value: {
        observation: observed.value.observation,
        turns: [
          { role: 'assistant' },
          { role: 'user', content: '那确实是傍晚，我刚回到家。', quickReplyKind: 'remember' },
          { role: 'assistant' },
        ],
      },
    })
    if (!continued.ok) throw new Error('continue failed')
    expect(continued.value.turns[2]?.content).toContain('来自你的记忆')
    expect(modelCalls[1]?.purpose).toBe('mind-garden-photo-dialogue')
    const dialogueRequest = JSON.stringify(modelCalls[1]?.messages)
    expect(dialogueRequest).not.toContain('\"type\":\"image\"')
    expect(dialogueRequest).not.toContain(attachment.attachmentId)
    expect(dialogueRequest).toContain('model-observation-unconfirmed')
    expect(dialogueRequest).toContain('那确实是傍晚')

    const durableMedium = JSON.stringify(pool.media.get('mind_garden_vault'))
    expect(durableMedium).not.toContain('白色杯子')
    expect(durableMedium).not.toContain('那确实是傍晚')
    expect(durableMedium).not.toContain('来自你的记忆')
  })

  it('preflights route and attachment capability and keeps invalid model output atomic', async () => {
    const { ctx, makeAgent, modelCalls, modelOutputs, readImage, resolveModelInfo } = await harness({
      observerProvider: 'vision', observerModel: 'garden-eye',
    })
    const agent = makeAgent('photo-preflight')
    const first = await ctx.mindGardenMedia.createPhotoStory(agent, createRequest())
    if (!first.ok) throw new Error('create failed')
    resolveModelInfo.mockResolvedValueOnce({
      provider: 'vision', id: 'text-only', name: 'Text only', inputModalities: ['text'],
    })
    await expect(ctx.mindGardenMedia.observePhotoStory(agent, {
      id: first.value.id, ifVersion: first.value.version,
    })).resolves.toEqual({
      ok: false,
      error: { code: 'photo-image-unsupported', provider: 'vision', model: 'garden-eye' },
    })
    expect(modelCalls).toHaveLength(0)

    readImage.mockRejectedValueOnce(new AttachmentError('missing', 'ATTACHMENT_READ_FAILED'))
    await expect(ctx.mindGardenMedia.observePhotoStory(agent, {
      id: first.value.id, ifVersion: first.value.version,
    })).resolves.toEqual({ ok: false, error: { code: 'attachment-unavailable' } })
    expect(modelCalls).toHaveLength(0)

    modelOutputs.push('{"grounding":{}}')
    await expect(ctx.mindGardenMedia.observePhotoStory(agent, {
      id: first.value.id, ifVersion: first.value.version,
    })).resolves.toEqual({ ok: false, error: { code: 'photo-output-invalid' } })
    await expect(ctx.mindGardenMedia.listPhotoStories(agent, {})).resolves.toMatchObject({
      ok: true, value: { stories: [{ version: first.value.version, observation: null, turns: [] }] },
    })

    await expect(ctx.mindGardenMedia.continuePhotoStory(agent, {
      id: first.value.id, ifVersion: first.value.version, content: '现在开始聊天',
    })).resolves.toEqual({ ok: false, error: { code: 'photo-observation-required' } })
  })

  it('rejects a completed observation when the story changes during the model call', async () => {
    const { ctx, makeAgent, modelCalls, modelOutputs } = await harness({
      observerProvider: 'vision', observerModel: 'garden-eye',
    })
    const agent = makeAgent('photo-race')
    const created = await ctx.mindGardenMedia.createPhotoStory(agent, createRequest())
    if (!created.ok) throw new Error('create failed')
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    modelOutputs.push((async function* () {
      await gate
      yield * textStream(observationOutput)
    })())
    const observing = ctx.mindGardenMedia.observePhotoStory(agent, {
      id: created.value.id, ifVersion: created.value.version,
    })
    await vi.waitFor(() => { expect(modelCalls).toHaveLength(1) })
    const updated = await ctx.mindGardenMedia.updatePhotoStory(agent, {
      id: created.value.id, ifVersion: created.value.version, title: '调用期间的新标题',
    })
    if (!updated.ok) throw new Error('update failed')
    release()
    await expect(observing).resolves.toMatchObject({
      ok: false,
      error: { code: 'photo-story-version-conflict', current: { version: updated.value.version, observation: null } },
    })
  })

  it('treats invalid authenticated media plaintext as a corrupt vault', async () => {
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('corrupt')
    await ctx.mindGardenVault.put('media', MindGardenVaultRecordId('10000000-0000-4000-8000-000000000001'), {
      recordType: 'photo-story', invalid: true,
    })
    await expect(ctx.mindGardenMedia.listPhotoStories(agent, {})).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
    const invalidId = MindGardenVaultRecordId('10000000-0000-4000-8000-000000000001')
    await ctx.mindGardenVault.delete('media', invalidId)
    const created = await ctx.mindGardenMedia.createPhotoStory(agent, createRequest())
    if (!created.ok) throw new Error('create failed')
    const stored = (await ctx.mindGardenVault.entries('media'))[0]
    if (stored === undefined) throw new Error('stored record missing')
    await ctx.mindGardenVault.delete('media', stored[0])
    await ctx.mindGardenVault.put('media', MindGardenVaultRecordId('different-id'), stored[1])
    await expect(ctx.mindGardenMedia.listPhotoStories(agent, {})).resolves.toEqual({
      ok: false, error: { code: 'vault-unavailable', state: 'corrupt-state' },
    })
  })

  it('maps every encrypted-vault availability state without exposing vault exceptions', async () => {
    const { ctx, makeAgent } = await harness()
    const agent = makeAgent('vault-errors')
    const entries = vi.spyOn(ctx.mindGardenVault, 'entries')
    const cases = [
      ['locked', 'locked'],
      ['invalid-key', 'invalid-key'],
      ['key-mismatch', 'key-mismatch'],
      ['corrupt-state', 'corrupt-state'],
    ] as const
    for (const [code, state] of cases) {
      entries.mockRejectedValueOnce(new MindGardenVaultError(code, 'safe failure'))
      await expect(ctx.mindGardenMedia.listPhotoStories(agent, {})).resolves.toEqual({
        ok: false, error: { code: 'vault-unavailable', state },
      })
    }
  })
})

describe('Mind Garden media invariant companion', () => {
  it('registers package ownership and its service dependency', async () => {
    let installer: InvariantInstaller | undefined
    const disposer = () => {}
    const ctx = {
      invariants: {
        register: vi.fn((_name: string, value: InvariantInstaller) => { installer = value; return disposer }),
      },
    } as never
    await expect(invariantApply(ctx)).resolves.toBe(disposer)
    expect(installer?.inject).toEqual(['mindGardenMedia'])
    expect(installer?.(new Context(), () => { throw new Error('unused') })).toBeUndefined()
  })
})
