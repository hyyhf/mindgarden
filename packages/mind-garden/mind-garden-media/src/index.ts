/**
 * Attachment-backed photo stories with encrypted metadata and particle settings.
 * @module @deepseek-ai/dsh-mind-garden/media
 */

import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import s from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import {
  AttachmentId,
  AttachmentError,
  isImageAdmissionError,
  type ImageAttachmentRef,
  type SaveImageAttachment,
} from '@deepseek-ai/dsh-attachment'
import { BlockAssembler, createUserMessage, ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import type { FinishReason, GenerateOptions } from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-mind-garden/core'
import type { JsonValue } from '@deepseek-ai/dsh-session/types'
import {
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden/vault'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import {
  decodeStoredMediaRecord,
  mindGardenPhotoParticleConfigSchema,
  storedPhotoModelRunSchema,
  storedPhotoStorySchema,
  type StoredPhotoModelRun,
  type StoredPhotoStory,
} from './records.ts'
import {
  buildPhotoDialogueEnvelope,
  buildPhotoObservationEnvelope,
  decodePhotoDialogueOutput,
  decodePhotoObservationOutput,
  PHOTO_OBSERVATION_PROMPT_VERSION,
  type PhotoModelEnvelope,
} from './observer.ts'
import type {
  MindGardenContinuePhotoStoryRequest,
  MindGardenContinuePhotoStoryResult,
  MindGardenCreatePhotoStoryRequest,
  MindGardenCreatePhotoStoryResult,
  MindGardenDeletePhotoStoryRequest,
  MindGardenDeletePhotoStoryResult,
  MindGardenDeletePhotoStoryValue,
  MindGardenListPhotoStoriesRequest,
  MindGardenListPhotoStoriesResult,
  MindGardenMediaAccessDenied,
  MindGardenMediaFailure,
  MindGardenMediaInvalidField,
  MindGardenMediaRejected,
  MindGardenMediaStamp,
  MindGardenMediaSuccess,
  MindGardenMediaVaultUnavailable,
  MindGardenObservePhotoStoryRequest,
  MindGardenObservePhotoStoryResult,
  MindGardenPhotoDialogueTurnId,
  MindGardenPhotoObservationId,
  MindGardenPhotoParticleConfig,
  MindGardenPhotoStory,
  MindGardenPhotoStoryListValue,
  MindGardenReadPhotoStoryRequest,
  MindGardenReadPhotoStoryResult,
  MindGardenUpdatePhotoStoryRequest,
  MindGardenUpdatePhotoStoryResult,
} from './types.ts'

export type * from './types.ts'
export {
  decodeStoredMediaRecord,
  mindGardenPhotoParticleConfigSchema,
  storedPhotoModelRunSchema,
  storedPhotoStorySchema,
} from './records.ts'
export {
  buildPhotoDialogueEnvelope,
  buildPhotoObservationEnvelope,
  decodePhotoDialogueOutput,
  decodePhotoObservationOutput,
  PHOTO_DIALOGUE_SYSTEM_PROMPT,
  PHOTO_OBSERVATION_PROMPT_VERSION,
  PHOTO_OBSERVATION_SYSTEM_PROMPT,
  type PhotoDialogueProposal,
  type PhotoModelEnvelope,
  type PhotoObservationProposal,
} from './observer.ts'

/** Cordis plugin name. */
export const name = 'mind-garden-media'

const DEFAULT_MAX_TITLE_BYTES = 512
const DEFAULT_MAX_NOTE_BYTES = 128 * 1024
const DEFAULT_MAX_NAME_BYTES = 1024
const DEFAULT_MAX_TIME_ZONE_BYTES = 128
const DEFAULT_MAX_STORIES_PER_LIST = 100
const DEFAULT_MAX_OBSERVER_MESSAGE_BYTES = 4096
const DEFAULT_MAX_OBSERVER_INPUT_BYTES = 24 * 1024
const DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS = 1600
const DEFAULT_MAX_CONCURRENT_OBSERVER_REQUESTS = 2
const MAX_DIALOGUE_TURNS = 25

/** Cordis plugin configuration. */
export interface Config {
  /** Maximum UTF-8 bytes accepted for one story title. */
  maxTitleBytes?: number
  /** Maximum UTF-8 bytes accepted for one user-authored story note. */
  maxNoteBytes?: number
  /** Maximum UTF-8 bytes accepted for an attachment display name. */
  maxNameBytes?: number
  /** Maximum UTF-8 bytes accepted for one IANA time-zone name. */
  maxTimeZoneBytes?: number
  /** Maximum stories returned by one list request. */
  maxStoriesPerList?: number
  /** Maximum UTF-8 bytes accepted for one photo-owned dialogue message. */
  maxObserverMessageBytes?: number
  /** Maximum complete UTF-8 bytes sent in one photo auxiliary request. */
  maxObserverInputBytes?: number
  /** Maximum provider output tokens accepted by one photo auxiliary request. */
  maxObserverOutputTokens?: number
  /** Global bound for simultaneous photo-model calls; each story still admits only one. */
  maxConcurrentObserverRequests?: number
  /** Optional default photo observer provider; configure with `observerModel`. */
  observerProvider?: string
  /** Optional default photo observer model; configure with `observerProvider`. */
  observerModel?: string
}

interface ResolvedConfig {
  readonly maxTitleBytes: number
  readonly maxNoteBytes: number
  readonly maxNameBytes: number
  readonly maxTimeZoneBytes: number
  readonly maxStoriesPerList: number
  readonly maxObserverMessageBytes: number
  readonly maxObserverInputBytes: number
  readonly maxObserverOutputTokens: number
  readonly maxConcurrentObserverRequests: number
  readonly observerProvider: string
  readonly observerModel: string
}

interface PreparedPhotoModelCall {
  readonly run: StoredPhotoModelRun
  readonly storyId: string
  readonly attachment: ImageAttachmentRef
  readonly envelope: PhotoModelEnvelope
  readonly content: string
  readonly quickReplyKind: '' | 'remember' | 'detail' | 'correct'
}

class MediaBusinessError extends Error {
  constructor(readonly failure: MindGardenMediaFailure) {
    super(failure.code)
    this.name = 'MediaBusinessError'
  }
}

class CorruptMediaStoreError extends Error {
  override name = 'CorruptMediaStoreError'
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return value === undefined ? fallback : value
}

function resolveConfig(config: Config): ResolvedConfig {
  const observerProvider = config.observerProvider?.trim() ?? ''
  const observerModel = config.observerModel?.trim() ?? ''
  if ((observerProvider.length === 0) !== (observerModel.length === 0)) {
    throw new TypeError('mind-garden-media: observerProvider and observerModel must be configured together')
  }
  return {
    maxTitleBytes: positiveInteger(config.maxTitleBytes, DEFAULT_MAX_TITLE_BYTES),
    maxNoteBytes: positiveInteger(config.maxNoteBytes, DEFAULT_MAX_NOTE_BYTES),
    maxNameBytes: positiveInteger(config.maxNameBytes, DEFAULT_MAX_NAME_BYTES),
    maxTimeZoneBytes: positiveInteger(config.maxTimeZoneBytes, DEFAULT_MAX_TIME_ZONE_BYTES),
    maxStoriesPerList: positiveInteger(config.maxStoriesPerList, DEFAULT_MAX_STORIES_PER_LIST),
    maxObserverMessageBytes: positiveInteger(config.maxObserverMessageBytes, DEFAULT_MAX_OBSERVER_MESSAGE_BYTES),
    maxObserverInputBytes: positiveInteger(config.maxObserverInputBytes, DEFAULT_MAX_OBSERVER_INPUT_BYTES),
    maxObserverOutputTokens: positiveInteger(config.maxObserverOutputTokens, DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS),
    maxConcurrentObserverRequests: positiveInteger(
      config.maxConcurrentObserverRequests,
      DEFAULT_MAX_CONCURRENT_OBSERVER_REQUESTS,
    ),
    observerProvider,
    observerModel,
  }
}

/**
 * Build the default particle behavior for a new photo story.
 *
 * @returns A frozen default particle configuration.
 */
export function defaultPhotoParticleConfig(): MindGardenPhotoParticleConfig {
  return Object.freeze({
    version: 1,
    preset: 'soft',
    rendering: Object.freeze({
      quality: 'high', pointSize: 2.45, density: 0.94, opacity: 0.98,
      preserveColors: true, background: '#100f14',
    }),
    depth: Object.freeze({ strength: 28, randomness: 4 }),
    interaction: Object.freeze({
      mode: 'repel', radius: 1.25, strength: 2.8, velocityInfluence: 0.55,
      vortexStrength: 0, clickBurst: true,
    }),
    physics: Object.freeze({
      spring: 5.5, damping: 0.94, maxVelocity: 7, maxDistance: 8, turbulence: 0.12,
    }),
    animation: Object.freeze({ idleStrength: 0.56, idleSpeed: 0.42, paperStrength: 0.55, paperSpeed: 0.28 }),
    effects: Object.freeze({
      saturation: 1.02, exposure: 1.02, tint: '#ffffff', tintMix: 0, bloom: 0.34, vignette: 0.28,
    }),
  })
}

function success<T>(value: T): MindGardenMediaSuccess<T> {
  return { ok: true, value }
}

function rejected<E extends MindGardenMediaFailure>(error: E): MindGardenMediaRejected<E> {
  return { ok: false, error }
}

function mediaId(value: string): MindGardenPhotoStory['id'] {
  return value as MindGardenPhotoStory['id']
}

function mediaVersion(value: string): MindGardenPhotoStory['version'] {
  return value as MindGardenPhotoStory['version']
}

function observationId(value: string): MindGardenPhotoObservationId {
  return value as MindGardenPhotoObservationId
}

function dialogueTurnId(value: string): MindGardenPhotoDialogueTurnId {
  return value as MindGardenPhotoDialogueTurnId
}

function attachmentRef(value: StoredPhotoStory['attachment']): ImageAttachmentRef {
  return Object.freeze({
    attachmentId: AttachmentId(value.attachmentId),
    mediaType: value.mediaType,
    bytes: value.bytes,
    width: value.width,
    height: value.height,
    ...(value.name === undefined ? {} : { name: value.name }),
  })
}

function snapshot(record: StoredPhotoStory): MindGardenPhotoStory {
  return Object.freeze({
    type: 'photo-story',
    id: mediaId(record.id),
    version: mediaVersion(record.version),
    attachment: attachmentRef(record.attachment),
    title: record.title,
    note: record.note,
    stamp: Object.freeze({ ...record.stamp }),
    particleConfig: Object.freeze(structuredClone(record.particleConfig)),
    observation: record.observation === null ? null : Object.freeze({
      ...record.observation,
      id: observationId(record.observation.id),
      grounding: Object.freeze({
        ...record.observation.grounding,
        visibleElements: Object.freeze([...record.observation.grounding.visibleElements]),
        textInImage: Object.freeze([...record.observation.grounding.textInImage]),
        uncertainDetails: Object.freeze([...record.observation.grounding.uncertainDetails]),
      }),
    }),
    turns: Object.freeze(record.turns.map(turn => Object.freeze({ ...turn, id: dialogueTurnId(turn.id) }))),
    quickReplies: Object.freeze(record.quickReplies.map(reply => Object.freeze({ ...reply }))),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function canonicalBase64(value: string): Buffer | null {
  if (value.length === 0) return null
  const decoded = Buffer.from(value, 'base64')
  return decoded.toString('base64') === value ? decoded : null
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    mindGardenMedia: MindGardenMediaService
  }
}

/** Encrypted photo-story metadata and verified attachment access for Mind Garden. */
export class MindGardenMediaService extends TypertRemoteService {
  static inject = ['agents', 'attachments', 'llm', 'mindGarden', 'mindGardenVault']

  /** Loader validation for story text, civil metadata, and list bounds. */
  static Config: s<Config> = s.object({
    maxTitleBytes: s.number().default(DEFAULT_MAX_TITLE_BYTES),
    maxNoteBytes: s.number().default(DEFAULT_MAX_NOTE_BYTES),
    maxNameBytes: s.number().default(DEFAULT_MAX_NAME_BYTES),
    maxTimeZoneBytes: s.number().default(DEFAULT_MAX_TIME_ZONE_BYTES),
    maxStoriesPerList: s.number().default(DEFAULT_MAX_STORIES_PER_LIST),
    maxObserverMessageBytes: s.number().default(DEFAULT_MAX_OBSERVER_MESSAGE_BYTES),
    maxObserverInputBytes: s.number().default(DEFAULT_MAX_OBSERVER_INPUT_BYTES),
    maxObserverOutputTokens: s.number().default(DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS),
    maxConcurrentObserverRequests: s.number().default(DEFAULT_MAX_CONCURRENT_OBSERVER_REQUESTS),
    observerProvider: s.string().default(''),
    observerModel: s.string().default(''),
  })

  private readonly options: ResolvedConfig
  private operationTail: Promise<void> = Promise.resolve()
  private readonly modelOperations = new Map<string, Promise<unknown>>()
  private readonly modelControllers = new Set<AbortController>()
  private admissionOpen = true

  /** Install the media Remote and drain admitted operations during disposal. */
  constructor(ctx: Context, config: Config) {
    super(ctx, 'mindGardenMedia')
    this.options = resolveConfig(config)
    ctx.effect(() => async () => {
      this.admissionOpen = false
      for (const controller of this.modelControllers) controller.abort()
      await Promise.all([...this.modelOperations.values()].map(async operation => {
        await operation.catch(() => undefined)
      }))
      await this.operationTail
    }, 'mind-garden-media.drain')
  }

  /**
   * Validate, save, and bind one image to encrypted story metadata.
   * @param agent - Exact live Agent whose durable garden owns the story.
   * @param request - Canonical image bytes, civil stamp, copy, and optional presentation.
   * @returns The immutable story snapshot or a stable media-domain rejection.
   */
  @Remote('createPhotoStory')
  createPhotoStory(agent: Agent, request: MindGardenCreatePhotoStoryRequest): Promise<MindGardenCreatePhotoStoryResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const input = this.imageInput(request)
        const stamp = this.validateStamp(request.stamp)
        const title = this.text(request.title ?? '', 'title', this.options.maxTitleBytes)
        const note = this.text(request.note ?? '', 'note', this.options.maxNoteBytes)
        const particleConfig = this.particleConfig(request.particleConfig ?? defaultPhotoParticleConfig())
        let attachment: ImageAttachmentRef
        try {
          attachment = await this.ctx.attachments.saveImage(input)
        } catch (error) {
          if (isImageAdmissionError(error)) {
            throw new MediaBusinessError({ code: 'attachment-rejected', reason: error.code })
          }
          if (error instanceof AttachmentError) {
            throw new MediaBusinessError({ code: 'attachment-unavailable' })
          }
          throw error
        }
        const now = Date.now()
        const record = storedPhotoStorySchema.parse({
          recordType: 'photo-story',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          attachment,
          title,
          note,
          stamp,
          particleConfig,
          createdAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshot(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreatePhotoStoryResult>>(error)
      }
    })
  }

  /**
   * List bounded authenticated stories newest first.
   * @param agent - Exact live Agent whose durable garden owns the stories.
   * @param request - Optional result bound within the configured maximum.
   * @returns Current story snapshots or a stable media-domain rejection.
   */
  @Remote('listPhotoStories')
  listPhotoStories(agent: Agent, request: MindGardenListPhotoStoriesRequest): Promise<MindGardenListPhotoStoriesResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.limit(request.limit)
        const stories = (await this.readRecords())
          .sort((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id))
          .slice(0, limit)
          .map(snapshot)
        return success<MindGardenPhotoStoryListValue>({ stories: Object.freeze(stories) })
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListPhotoStoriesResult>>(error)
      }
    })
  }

  /**
   * Return verified story-owned image bytes as canonical base64.
   * @param agent - Exact live Agent whose durable garden owns the story.
   * @param request - Stable photo-story identity to resolve and verify.
   * @returns The verified attachment reference and bytes, or a stable rejection.
   */
  @Remote('readPhotoStory')
  readPhotoStory(agent: Agent, request: MindGardenReadPhotoStoryRequest): Promise<MindGardenReadPhotoStoryResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const story = this.requireStory(await this.readRecords(), request.id)
        try {
          const stored = await this.ctx.attachments.readImage(attachmentRef(story.attachment))
          return success({
            attachment: Object.freeze({ ...stored.ref }),
            data: Buffer.from(stored.data).toString('base64'),
          })
        } catch (error) {
          if (error instanceof AttachmentError) {
            return rejected({ code: 'attachment-unavailable' })
          }
          throw error
        }
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenReadPhotoStoryResult>>(error)
      }
    })
  }

  /**
   * Send one private story image through the selected Harness vision route after explicit user action.
   * @param agent - Exact live Agent whose durable garden owns the story.
   * @param request - Story CAS and optional complete provider/model override.
   * @returns The story with frozen unconfirmed grounding and an opening turn.
   */
  @Remote('observePhotoStory')
  observePhotoStory(
    agent: Agent,
    request: MindGardenObservePhotoStoryRequest,
  ): Promise<MindGardenObservePhotoStoryResult> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-media: service is disposing'))
    const access = this.accessFailure(agent)
    if (access !== null) return Promise.resolve(rejected(access))
    const operationKey = `${agent.session.id}\0${String(request.id)}`
    if (this.modelOperations.has(operationKey)
      || this.modelOperations.size >= this.options.maxConcurrentObserverRequests) {
      return Promise.resolve(rejected({ code: 'photo-model-in-progress' }))
    }
    const controller = new AbortController()
    this.modelControllers.add(controller)
    const operation = this.runObservation(agent, request, controller.signal).finally(() => {
      this.modelControllers.delete(controller)
      this.modelOperations.delete(operationKey)
    })
    this.modelOperations.set(operationKey, operation)
    return operation
  }

  /**
   * Continue one recoverable photo-owned conversation without resending the image.
   * @param agent - Exact live Agent whose durable garden owns the story.
   * @param request - Story CAS, newest message, continuation kind, and optional route override.
   * @returns The story with one atomic user/assistant exchange.
   */
  @Remote('continuePhotoStory')
  continuePhotoStory(
    agent: Agent,
    request: MindGardenContinuePhotoStoryRequest,
  ): Promise<MindGardenContinuePhotoStoryResult> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-media: service is disposing'))
    const access = this.accessFailure(agent)
    if (access !== null) return Promise.resolve(rejected(access))
    const operationKey = `${agent.session.id}\0${String(request.id)}`
    if (this.modelOperations.has(operationKey)
      || this.modelOperations.size >= this.options.maxConcurrentObserverRequests) {
      return Promise.resolve(rejected({ code: 'photo-model-in-progress' }))
    }
    const controller = new AbortController()
    this.modelControllers.add(controller)
    const operation = this.runDialogue(agent, request, controller.signal).finally(() => {
      this.modelControllers.delete(controller)
      this.modelOperations.delete(operationKey)
    })
    this.modelOperations.set(operationKey, operation)
    return operation
  }

  /**
   * Replace user-authored copy or particle settings under equality-only versioning.
   * @param agent - Exact live Agent whose durable garden owns the story.
   * @param request - Story identity, observed version, and fields to replace.
   * @returns The updated immutable snapshot or a stable media-domain rejection.
   */
  @Remote('updatePhotoStory')
  updatePhotoStory(agent: Agent, request: MindGardenUpdatePhotoStoryRequest): Promise<MindGardenUpdatePhotoStoryResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        if (request.title === undefined && request.note === undefined && request.particleConfig === undefined) {
          this.invalid('mutation', 'blank')
        }
        const current = this.requireStory(await this.readRecords(), request.id)
        if (current.version !== request.ifVersion) {
          throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) })
        }
        const record = storedPhotoStorySchema.parse({
          ...current,
          version: randomUUID(),
          title: request.title === undefined
            ? current.title
            : this.text(request.title, 'title', this.options.maxTitleBytes),
          note: request.note === undefined
            ? current.note
            : this.text(request.note, 'note', this.options.maxNoteBytes),
          particleConfig: request.particleConfig === undefined
            ? current.particleConfig
            : this.particleConfig(request.particleConfig),
          updatedAt: Date.now(),
        })
        await this.writeRecord(record)
        return success(snapshot(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdatePhotoStoryResult>>(error)
      }
    })
  }

  /**
   * Remove encrypted story metadata; unreferenced immutable bytes follow deployment retention policy.
   * @param agent - Exact live Agent whose durable garden owns the story.
   * @param request - Story identity and equality-only version observed by the caller.
   * @returns An idempotent absent postcondition or a stable version rejection.
   */
  @Remote('deletePhotoStory')
  deletePhotoStory(agent: Agent, request: MindGardenDeletePhotoStoryRequest): Promise<MindGardenDeletePhotoStoryResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = records.find(record => record.id === request.id)
        if (current === undefined) return success<MindGardenDeletePhotoStoryValue>({ absent: true })
        if (current.version !== request.ifVersion) {
          throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) })
        }
        await this.ctx.mindGardenVault.delete('media', MindGardenVaultRecordId(current.id))
        return success<MindGardenDeletePhotoStoryValue>({ absent: true })
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenDeletePhotoStoryResult>>(error)
      }
    })
  }

  private async runObservation(
    agent: Agent,
    request: MindGardenObservePhotoStoryRequest,
    signal: AbortSignal,
  ): Promise<MindGardenObservePhotoStoryResult> {
    let prepared: PreparedPhotoModelCall
    try {
      prepared = await this.serialize(() => this.prepareObservation(agent, request, signal))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenObservePhotoStoryResult>>(error)
    }
    let rawOutput: string
    try {
      rawOutput = await this.callPhotoModel(agent, prepared, 'observation', signal)
    } catch {
      await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'model-failed', ''))
      return rejected({ code: 'photo-model-failed' })
    }
    const proposal = decodePhotoObservationOutput(rawOutput)
    if (proposal === null) {
      await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'invalid-output', rawOutput))
      return rejected({ code: 'photo-output-invalid' })
    }
    try {
      return success(await this.serialize(async () => {
        const records = await this.readRecords()
        const index = records.findIndex(record => record.id === prepared.storyId)
        const current = records[index]
        if (current === undefined) {
          throw new MediaBusinessError({ code: 'photo-story-not-found', id: mediaId(prepared.storyId) })
        }
        if (current.version !== prepared.run.storyVersion) {
          await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput))
          throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) })
        }
        if (current.observation !== null) {
          await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput))
          throw new MediaBusinessError({ code: 'photo-observation-complete' })
        }
        const runIndex = current.modelRuns.findIndex(run => run.id === prepared.run.id)
        if (runIndex < 0) throw new CorruptMediaStoreError('Photo observation audit is missing')
        const now = Date.now()
        const turnId = randomUUID()
        const observation = {
          id: randomUUID(),
          grounding: { ...proposal.grounding, source: 'model-observation-unconfirmed' as const },
          opening: proposal.opening,
          provider: prepared.run.provider,
          model: prepared.run.model,
          promptVersion: PHOTO_OBSERVATION_PROMPT_VERSION,
          createdAt: now,
        }
        const modelRuns = [...current.modelRuns]
        modelRuns[runIndex] = storedPhotoModelRunSchema.parse({
          ...prepared.run,
          status: 'completed',
          failure: null,
          rawOutput,
          turnIds: [turnId],
          updatedAt: now,
        })
        const updated = storedPhotoStorySchema.parse({
          ...current,
          version: randomUUID(),
          observation,
          turns: [{ id: turnId, role: 'assistant', content: proposal.opening, quickReplyKind: '', createdAt: now }],
          quickReplies: proposal.quickReplies,
          modelRuns,
          updatedAt: now,
        })
        await this.writeRecord(updated)
        return snapshot(updated)
      }))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenObservePhotoStoryResult>>(error)
    }
  }

  private async prepareObservation(
    agent: Agent,
    request: MindGardenObservePhotoStoryRequest,
    signal: AbortSignal,
  ): Promise<PreparedPhotoModelCall> {
    const records = await this.readRecords()
    let current = this.requireStory(records, request.id)
    current = await this.interruptRunningModelRuns(current)
    if (current.version !== request.ifVersion) {
      throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) })
    }
    if (current.observation !== null) throw new MediaBusinessError({ code: 'photo-observation-complete' })
    const target = this.modelTarget(agent, request)
    if (target === null) throw new MediaBusinessError({ code: 'photo-model-unavailable' })
    let info: Awaited<ReturnType<typeof this.ctx.llm.resolveModelInfo>>
    try {
      info = await this.ctx.llm.resolveModelInfo(target.provider, target.model, signal)
    } catch {
      throw new MediaBusinessError({ code: 'photo-model-unavailable' })
    }
    if (info.inputModalities !== undefined && !info.inputModalities.includes('image')) {
      throw new MediaBusinessError({
        code: 'photo-image-unsupported',
        provider: target.provider,
        model: target.model,
      })
    }
    try {
      await this.ctx.attachments.readImage(attachmentRef(current.attachment), signal)
    } catch (error) {
      if (error instanceof AttachmentError) {
        throw new MediaBusinessError({ code: 'attachment-unavailable' })
      }
      throw error
    }
    const envelope = buildPhotoObservationEnvelope(
      this.options.maxObserverInputBytes,
      request.locale ?? 'zh-CN',
    )
    if (envelope === null) {
      throw new MediaBusinessError({ code: 'photo-input-too-large', maxBytes: this.options.maxObserverInputBytes })
    }
    const now = Date.now()
    const run = storedPhotoModelRunSchema.parse({
      id: randomUUID(),
      kind: 'observation',
      storyVersion: current.version,
      status: 'running',
      failure: null,
      provider: target.provider,
      model: target.model,
      system: envelope.system,
      prompt: envelope.prompt,
      rawOutput: '',
      turnIds: [],
      createdAt: now,
      updatedAt: now,
    })
    current = storedPhotoStorySchema.parse({
      ...current,
      modelRuns: [...current.modelRuns.slice(-23), run],
    })
    await this.writeRecord(current)
    return {
      run,
      storyId: current.id,
      attachment: attachmentRef(current.attachment),
      envelope,
      content: '',
      quickReplyKind: '',
    }
  }

  private async runDialogue(
    agent: Agent,
    request: MindGardenContinuePhotoStoryRequest,
    signal: AbortSignal,
  ): Promise<MindGardenContinuePhotoStoryResult> {
    let prepared: PreparedPhotoModelCall
    try {
      prepared = await this.serialize(() => this.prepareDialogue(agent, request))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenContinuePhotoStoryResult>>(error)
    }
    let rawOutput: string
    try {
      rawOutput = await this.callPhotoModel(agent, prepared, 'dialogue', signal)
    } catch {
      await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'model-failed', ''))
      return rejected({ code: 'photo-model-failed' })
    }
    const proposal = decodePhotoDialogueOutput(rawOutput)
    if (proposal === null) {
      await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'invalid-output', rawOutput))
      return rejected({ code: 'photo-output-invalid' })
    }
    try {
      return success(await this.serialize(async () => {
        const records = await this.readRecords()
        const current = records.find(record => record.id === prepared.storyId)
        if (current === undefined) {
          throw new MediaBusinessError({ code: 'photo-story-not-found', id: mediaId(prepared.storyId) })
        }
        if (current.version !== prepared.run.storyVersion) {
          await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput))
          throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) })
        }
        if (current.observation === null) {
          await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput))
          throw new MediaBusinessError({ code: 'photo-observation-required' })
        }
        if (current.turns.length + 2 > MAX_DIALOGUE_TURNS) {
          await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput))
          throw new MediaBusinessError({ code: 'photo-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS })
        }
        const runIndex = current.modelRuns.findIndex(run => run.id === prepared.run.id)
        if (runIndex < 0) throw new CorruptMediaStoreError('Photo dialogue audit is missing')
        const now = Date.now()
        const userTurnId = randomUUID()
        const assistantTurnId = randomUUID()
        const modelRuns = [...current.modelRuns]
        modelRuns[runIndex] = storedPhotoModelRunSchema.parse({
          ...prepared.run,
          status: 'completed',
          failure: null,
          rawOutput,
          turnIds: [userTurnId, assistantTurnId],
          updatedAt: now,
        })
        const updated = storedPhotoStorySchema.parse({
          ...current,
          version: randomUUID(),
          turns: [
            ...current.turns,
            {
              id: userTurnId,
              role: 'user',
              content: prepared.content,
              quickReplyKind: prepared.quickReplyKind,
              createdAt: now,
            },
            { id: assistantTurnId, role: 'assistant', content: proposal.reply, quickReplyKind: '', createdAt: now },
          ],
          quickReplies: proposal.quickReplies,
          modelRuns,
          updatedAt: now,
        })
        await this.writeRecord(updated)
        return snapshot(updated)
      }))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenContinuePhotoStoryResult>>(error)
    }
  }

  private async prepareDialogue(
    agent: Agent,
    request: MindGardenContinuePhotoStoryRequest,
  ): Promise<PreparedPhotoModelCall> {
    const records = await this.readRecords()
    let current = this.requireStory(records, request.id)
    current = await this.interruptRunningModelRuns(current)
    if (current.version !== request.ifVersion) {
      throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) })
    }
    if (current.observation === null) throw new MediaBusinessError({ code: 'photo-observation-required' })
    if (current.turns.length + 2 > MAX_DIALOGUE_TURNS) {
      throw new MediaBusinessError({ code: 'photo-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS })
    }
    const content = this.text(request.content, 'message', this.options.maxObserverMessageBytes, true)
    const quickReplyKind = request.quickReplyKind ?? ''
    if (!['', 'remember', 'detail', 'correct'].includes(quickReplyKind)) this.invalid('message', 'invalid')
    const target = this.modelTarget(agent, request)
    if (target === null) throw new MediaBusinessError({ code: 'photo-model-unavailable' })
    const envelope = buildPhotoDialogueEnvelope(
      snapshot(current),
      content,
      quickReplyKind,
      this.options.maxObserverInputBytes,
      request.locale ?? 'zh-CN',
    )
    if (envelope === null) {
      throw new MediaBusinessError({ code: 'photo-input-too-large', maxBytes: this.options.maxObserverInputBytes })
    }
    const now = Date.now()
    const run = storedPhotoModelRunSchema.parse({
      id: randomUUID(),
      kind: 'dialogue',
      storyVersion: current.version,
      status: 'running',
      failure: null,
      provider: target.provider,
      model: target.model,
      system: envelope.system,
      prompt: envelope.prompt,
      rawOutput: '',
      turnIds: [],
      createdAt: now,
      updatedAt: now,
    })
    current = storedPhotoStorySchema.parse({
      ...current,
      modelRuns: [...current.modelRuns.slice(-23), run],
    })
    await this.writeRecord(current)
    return {
      run,
      storyId: current.id,
      attachment: attachmentRef(current.attachment),
      envelope,
      content,
      quickReplyKind,
    }
  }

  private async callPhotoModel(
    agent: Agent,
    prepared: PreparedPhotoModelCall,
    kind: 'observation' | 'dialogue',
    signal: AbortSignal,
  ): Promise<string> {
    const assembler = new BlockAssembler()
    const content: GenerateOptions['messages'][number]['content'] = kind === 'observation'
      ? [
        { type: 'text', text: prepared.envelope.prompt },
        { type: 'image', attachment: prepared.attachment },
      ]
      : [{ type: 'text', text: prepared.envelope.prompt }]
    const options: GenerateOptions = {
      provider: prepared.run.provider,
      model: prepared.run.model,
      ...(prepared.run.provider === 'deepseek-official'
        && prepared.run.model === 'deepseek-v4-flash-vision-exp'
        ? { reasoningEffort: ReasoningEffortId('off') }
        : {}),
      system: prepared.envelope.system,
      messages: [createUserMessage({ content, source: { kind: 'plugin', plugin: name } })],
      temperature: kind === 'observation' ? 0.2 : 0.45,
      maxTokens: this.options.maxObserverOutputTokens,
      sessionId: agent.session.id,
      purpose: kind === 'observation' ? 'mind-garden-photo-observation' : 'mind-garden-photo-dialogue',
      signal,
    }
    for await (const chunk of this.ctx.llm.stream(options)) assembler.push(chunk)
    if (this.finishFailed(assembler.finish)) throw new Error('Photo model did not finish completely')
    const blocks = assembler.blocks()
    if (blocks.some(block => block.type !== 'text' && block.type !== 'reasoning')) {
      throw new Error('Photo model returned executable content')
    }
    const output = blocks.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
    if (output.trim().length === 0) throw new Error('Photo model returned empty content')
    return output
  }

  private finishFailed(finish: FinishReason): boolean {
    return finish.kind !== 'stop'
  }

  private modelTarget(
    agent: Agent,
    request: Pick<MindGardenObservePhotoStoryRequest, 'provider' | 'model'>,
  ): { readonly provider: string; readonly model: string } | null {
    const hasOverride = request.provider !== undefined || request.model !== undefined
    if (hasOverride) {
      if (request.provider === undefined
        || request.provider.trim().length === 0
        || request.model === undefined
        || request.model.trim().length === 0) return null
      return { provider: request.provider.trim(), model: request.model.trim() }
    }
    if (this.options.observerProvider.length > 0 && this.options.observerModel.length > 0) {
      return { provider: this.options.observerProvider, model: this.options.observerModel }
    }
    const latest = agent.session.requestHeader()?.config
    if (latest !== undefined) return { provider: latest.provider, model: latest.model }
    if (agent.options.provider !== undefined
      && agent.options.provider.length > 0
      && agent.options.model !== undefined
      && agent.options.model.length > 0) {
      return { provider: agent.options.provider, model: agent.options.model }
    }
    return null
  }

  private async interruptRunningModelRuns(record: StoredPhotoStory): Promise<StoredPhotoStory> {
    if (!record.modelRuns.some(run => run.status === 'running')) return record
    const now = Date.now()
    const interrupted = storedPhotoStorySchema.parse({
      ...record,
      modelRuns: record.modelRuns.map(run => run.status === 'running'
        ? { ...run, status: 'failed', failure: 'interrupted', updatedAt: now }
        : run),
    })
    await this.writeRecord(interrupted)
    return interrupted
  }

  private failedRunRecord(
    record: StoredPhotoStory,
    runId: string,
    failure: StoredPhotoModelRun['failure'],
    rawOutput: string,
  ): StoredPhotoStory {
    const index = record.modelRuns.findIndex(run => run.id === runId)
    const run = record.modelRuns[index]
    if (run === undefined || run.status !== 'running' || failure === null) return record
    const modelRuns = [...record.modelRuns]
    modelRuns[index] = storedPhotoModelRunSchema.parse({
      ...run,
      status: 'failed',
      failure,
      rawOutput,
      updatedAt: Date.now(),
    })
    return storedPhotoStorySchema.parse({ ...record, modelRuns })
  }

  private async failModelRun(
    storyId: string,
    runId: string,
    failure: StoredPhotoModelRun['failure'],
    rawOutput: string,
  ): Promise<void> {
    const record = (await this.readRecords()).find(item => item.id === storyId)
    if (record === undefined) return
    const failed = this.failedRunRecord(record, runId, failure, rawOutput)
    if (failed !== record) await this.writeRecord(failed)
  }

  private accessFailure(agent: Agent): MindGardenMediaAccessDenied | null {
    if (this.ctx.agents.get(agent.id) !== agent) {
      throw new Error(`mind-garden-media: agent '${agent.id}' is not live in this registry`)
    }
    const state = this.ctx.mindGarden.current(agent.session)
    if (state === null) return { code: 'mind-garden-not-active' }
    if (state.privacy !== 'durable') return { code: 'durable-session-required' }
    return null
  }

  private imageInput(request: MindGardenCreatePhotoStoryRequest): SaveImageAttachment {
    const data = canonicalBase64(request.data)
    if (data === null) this.invalid('data', request.data.length === 0 ? 'blank' : 'invalid')
    const estimatedBytes = Math.floor(request.data.length * 3 / 4)
    if (estimatedBytes > this.ctx.attachments.imageLimits.maxImageBytes) {
      throw new MediaBusinessError({ code: 'attachment-rejected', reason: 'IMAGE_TOO_LARGE' })
    }
    const name = request.name === undefined ? undefined : this.text(request.name, 'name', this.options.maxNameBytes, true)
    return { data, mediaType: request.mediaType, ...(name === undefined ? {} : { name }) }
  }

  private validateStamp(stamp: MindGardenMediaStamp): StoredPhotoStory['stamp'] {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp.localDate)
      || Number.isNaN(Date.parse(`${stamp.localDate}T00:00:00.000Z`))) {
      this.invalid('stamp', 'invalid')
    }
    const timeZone = stamp.timeZone.trim()
    if (timeZone.length === 0) this.invalid('stamp', 'blank')
    if (Buffer.byteLength(timeZone, 'utf8') > this.options.maxTimeZoneBytes) {
      this.invalid('stamp', 'too-large', this.options.maxTimeZoneBytes)
    }
    let canonical: string
    try {
      canonical = new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone
    } catch {
      return this.invalid('stamp', 'invalid')
    }
    if (!Number.isInteger(stamp.utcOffsetMinutes)
      || stamp.utcOffsetMinutes < -840
      || stamp.utcOffsetMinutes > 840) {
      this.invalid('stamp', 'invalid')
    }
    return { localDate: stamp.localDate, timeZone: canonical, utcOffsetMinutes: stamp.utcOffsetMinutes }
  }

  private text(
    value: string,
    field: 'name' | 'title' | 'note' | 'message',
    maxBytes: number,
    requireValue = false,
  ): string {
    const text = value.trim()
    if (requireValue && text.length === 0) this.invalid(field, 'blank')
    if (Buffer.byteLength(text, 'utf8') > maxBytes) this.invalid(field, 'too-large', maxBytes)
    return text
  }

  private particleConfig(value: MindGardenPhotoParticleConfig): StoredPhotoStory['particleConfig'] {
    const parsed = mindGardenPhotoParticleConfigSchema.safeParse(value)
    if (!parsed.success) this.invalid('particleConfig', 'invalid')
    return parsed.data
  }

  private limit(value: number | undefined): number {
    if (value === undefined) return this.options.maxStoriesPerList
    if (!Number.isInteger(value) || value < 1 || value > this.options.maxStoriesPerList) {
      this.invalid('limit', 'invalid')
    }
    return value
  }

  private invalid(
    field: MindGardenMediaInvalidField['field'],
    reason: MindGardenMediaInvalidField['reason'],
    maxBytes?: number,
  ): never {
    throw new MediaBusinessError({
      code: 'invalid-field',
      field,
      reason,
      ...(maxBytes === undefined ? {} : { maxBytes }),
    })
  }

  private async readRecords(): Promise<StoredPhotoStory[]> {
    const entries = await this.ctx.mindGardenVault.entries('media')
    try {
      return entries.map(([id, value]) => {
        const record = decodeStoredMediaRecord(value)
        if (record.id !== id) throw new TypeError('vault id differs from authenticated media id')
        return record
      })
    } catch (error) {
      throw new CorruptMediaStoreError('Mind Garden media plaintext record is invalid', { cause: error })
    }
  }

  private async writeRecord(record: StoredPhotoStory): Promise<void> {
    const validated = decodeStoredMediaRecord(record)
    await this.ctx.mindGardenVault.put(
      'media',
      MindGardenVaultRecordId(validated.id),
      validated as unknown as JsonValue,
    )
  }

  private requireStory(records: readonly StoredPhotoStory[], id: MindGardenPhotoStory['id']): StoredPhotoStory {
    const story = records.find(record => record.id === id)
    if (story === undefined) throw new MediaBusinessError({ code: 'photo-story-not-found', id })
    return story
  }

  private convertFailure<E extends MindGardenMediaFailure>(error: unknown): MindGardenMediaRejected<E> {
    if (error instanceof MediaBusinessError) return rejected(error.failure as E)
    if (error instanceof CorruptMediaStoreError) {
      return rejected({ code: 'vault-unavailable', state: 'corrupt-state' } as E)
    }
    if (error instanceof MindGardenVaultError) {
      const state: MindGardenMediaVaultUnavailable['state'] =
        error.code === 'locked' ? 'locked'
          : error.code === 'invalid-key' ? 'invalid-key'
            : error.code === 'key-mismatch' ? 'key-mismatch'
              : 'corrupt-state'
      return rejected({ code: 'vault-unavailable', state } as E)
    }
    throw error
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-media: service is disposing'))
    return this.serialize(operation)
  }

  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationTail.then(operation)
    this.operationTail = result.then(() => undefined, () => undefined)
    return result
  }
}

type ResultFailure<T> = T extends MindGardenMediaRejected<infer E> ? E : never

export default MindGardenMediaService
