/**
 * Encrypted, confirmation-gated long-term memory for Mind Garden.
 * @module @deepseek-ai/dsh-mind-garden/memory
 */

import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import s from '@deepseek-ai/schemastery'
import type { Agent, PreStepDecision } from '@deepseek-ai/dsh-agent'
import { BlockAssembler, createUserMessage, MessageId } from '@deepseek-ai/dsh-llm'
import type { FinishReason, GenerateOptions } from '@deepseek-ai/dsh-llm'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-mind-garden/core'
import {
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden/vault'
import type {} from '@deepseek-ai/dsh-mind-garden/vault'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import {
  decodeStoredRecord,
  storedAuditSchema,
  storedAutomationPolicySchema,
  storedAutomationStateSchema,
  storedExtractionRunSchema,
  storedMemoryTombstoneSchema,
  storedMemorySchema,
} from './records.ts'
import type {
  StoredAudit,
  StoredAutomationPolicy,
  StoredAutomationState,
  StoredExtractionRun,
  StoredMemory,
  StoredMindGardenMemoryRecord,
} from './records.ts'
import {
  buildExtractionEnvelope,
  decodeExtractionOutput,
  type ExtractionEnvelope,
  type ExtractionProposal,
} from './extraction.ts'
import { retrieveMemories, userQuery, type MemoryRecall } from './retrieval.ts'
import type {
  MindGardenMemoryAccessDenied,
  MindGardenMemoryAutomationPolicy,
  MindGardenMemoryAutomationPolicyResult,
  MindGardenMemoryConfirmRequest,
  MindGardenMemoryConfirmResult,
  MindGardenMemoryDeleteRequest,
  MindGardenMemoryDeleteResult,
  MindGardenMemoryDeleteValue,
  MindGardenMemoryExtractRequest,
  MindGardenMemoryExtractResult,
  MindGardenMemoryExtractValue,
  MindGardenMemoryExtractionRun,
  MindGardenMemoryFailure,
  MindGardenMemoryFieldBlank,
  MindGardenMemoryFieldTooLarge,
  MindGardenMemoryId,
  MindGardenMemoryItem,
  MindGardenMemoryLatestAuditResult,
  MindGardenMemoryLatestAuditValue,
  MindGardenMemoryLatestExtractionResult,
  MindGardenMemoryLatestExtractionValue,
  MindGardenMemoryListRevisionsRequest,
  MindGardenMemoryListRevisionsResult,
  MindGardenMemoryListRevisionsValue,
  MindGardenMemoryListResult,
  MindGardenMemoryListValue,
  MindGardenMemoryProposeRequest,
  MindGardenMemoryProposeResult,
  MindGardenMemoryRecallPolicy,
  MindGardenMemoryRejectRequest,
  MindGardenMemoryRejectResult,
  MindGardenMemoryRejected,
  MindGardenMemoryRetrievalAudit,
  MindGardenMemoryRevision,
  MindGardenMemoryResolveRelationshipRequest,
  MindGardenMemoryResolveRelationshipResult,
  MindGardenMemoryResolveRelationshipValue,
  MindGardenMemorySource,
  MindGardenMemorySuccess,
  MindGardenMemorySetAutomationPolicyRequest,
  MindGardenMemorySetAutomationPolicyResult,
  MindGardenMemoryUpdateRequest,
  MindGardenMemoryUpdateResult,
  MindGardenMemoryVaultUnavailable,
  MindGardenMemoryVersion,
} from './types.ts'

export type * from './types.ts'
export {
  decodeStoredRecord,
  storedAuditSchema,
  storedAutomationPolicySchema,
  storedAutomationStateSchema,
  storedExtractionRunSchema,
  storedMemoryTombstoneSchema,
  storedMemorySchema,
} from './records.ts'
export {
  buildExtractionEnvelope,
  decodeExtractionOutput,
  EXTRACTION_SYSTEM_PROMPT,
  type ExtractionComparableMemory,
  type ExtractionEnvelope,
  type ExtractionProposal,
  type ExtractionTranscriptRow,
} from './extraction.ts'
export {
  relevanceScore,
  retrievalTerms,
  retrieveMemories,
  userQuery,
  type MemoryRecall,
  type RetrievedMemory,
} from './retrieval.ts'

/** Cordis plugin name and durable model-message source. */
export const name = 'mind-garden-memory'

const DEFAULT_MAX_CONTENT_BYTES = 4096
const DEFAULT_MAX_REASON_BYTES = 1024
const DEFAULT_MAX_SCOPE_BYTES = 512
const DEFAULT_MAX_EVIDENCE_BYTES = 1024
const DEFAULT_MAX_INJECTED_MEMORIES = 6
const DEFAULT_MAX_INJECTED_BYTES = 4096
const DEFAULT_MAX_AUDIT_ENTRIES = 200
const DEFAULT_MAX_EXTRACTION_RUN_ENTRIES = 50
const DEFAULT_MAX_TEMPORARY_DAYS = 365
const DEFAULT_MAX_REVISIONS_PER_MEMORY = 50
const DEFAULT_MAX_EXTRACTION_CANDIDATES = 3
const DEFAULT_MIN_EXTRACTION_CONFIDENCE = 0.65
const DEFAULT_MAX_EXTRACTION_INPUT_BYTES = 32 * 1024
const DEFAULT_MAX_EXTRACTION_MEMORY_BYTES = 16 * 1024
const DEFAULT_MAX_EXTRACTION_OUTPUT_TOKENS = 2048
const DEFAULT_AUTOMATION_INTERVAL = 3
const DAY_MS = 24 * 60 * 60 * 1000
const FORBIDDEN_INFERENCE_PATTERN = new RegExp(
  '(?:diagnos(?:is|ed)|personality disorder|attachment style|trauma type|subconscious|risk score|'
  + '诊断|患有|人格障碍|依恋类型|创伤类型|潜意识|危险等级|风险评分)',
  'iu',
)

/** Cordis plugin configuration. */
export interface Config {
  /** Maximum UTF-8 bytes retained in one memory statement. */
  readonly maxContentBytes?: number
  /** Maximum UTF-8 bytes retained in one memory-retention reason. */
  readonly maxReasonBytes?: number
  /** Maximum UTF-8 bytes retained in one optional scope. */
  readonly maxScopeBytes?: number
  /** Maximum UTF-8 bytes retained in one exact source quotation. */
  readonly maxEvidenceBytes?: number
  /** Maximum complete memories injected into one model-visible recall. */
  readonly maxInjectedMemories?: number
  /** Maximum UTF-8 bytes for one complete model-visible recall, including its header. */
  readonly maxInjectedBytes?: number
  /** Maximum encrypted retrieval audits retained profile-wide. */
  readonly maxAuditEntries?: number
  /** Maximum settled encrypted extraction-run audits retained profile-wide. */
  readonly maxExtractionRunEntries?: number
  /** Maximum whole-day lifetime accepted for a temporary memory. */
  readonly maxTemporaryDays?: number
  /** Maximum encrypted before-images retained for one memory. */
  readonly maxRevisionsPerMemory?: number
  /** Maximum candidates retained from one explicit auxiliary-model pass. */
  readonly maxExtractionCandidates?: number
  /** Minimum model-reported confidence accepted into the review queue. */
  readonly minExtractionConfidence?: number
  /** Maximum complete serialized transcript bytes sent to extraction. */
  readonly maxExtractionInputBytes?: number
  /** Maximum complete serialized active-memory bytes sent for relationship suggestions. */
  readonly maxExtractionMemoryBytes?: number
  /** Maximum output tokens for one auxiliary extraction request. */
  readonly maxExtractionOutputTokens?: number
  /** Optional default extraction provider; configure together with `extractionModel`. */
  readonly extractionProvider?: string
  /** Optional default extraction model; configure together with `extractionProvider`. */
  readonly extractionModel?: string
}

interface ResolvedConfig {
  readonly maxContentBytes: number
  readonly maxReasonBytes: number
  readonly maxScopeBytes: number
  readonly maxEvidenceBytes: number
  readonly maxInjectedMemories: number
  readonly maxInjectedBytes: number
  readonly maxAuditEntries: number
  readonly maxExtractionRunEntries: number
  readonly maxTemporaryDays: number
  readonly maxRevisionsPerMemory: number
  readonly maxExtractionCandidates: number
  readonly minExtractionConfidence: number
  readonly maxExtractionInputBytes: number
  readonly maxExtractionMemoryBytes: number
  readonly maxExtractionOutputTokens: number
  readonly extractionProvider: string
  readonly extractionModel: string
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    mindGardenMemory: MindGardenMemoryService
  }
}

class MemoryBusinessError extends Error {
  constructor(readonly failure: MindGardenMemoryFailure) {
    super(failure.code)
  }
}

class CorruptMemoryStoreError extends Error {}

type ResultFailure<R> = R extends MindGardenMemoryRejected<infer E> ? E : never

function positiveSafeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TypeError(`mind-garden-memory: ${name} must be a positive safe integer`)
  }
  return value
}

function resolveConfig(config: Config): ResolvedConfig {
  const minExtractionConfidence = config.minExtractionConfidence ?? DEFAULT_MIN_EXTRACTION_CONFIDENCE
  if (!Number.isFinite(minExtractionConfidence)
    || minExtractionConfidence < 0
    || minExtractionConfidence > 1) {
    throw new TypeError('mind-garden-memory: minExtractionConfidence must be between 0 and 1')
  }
  const extractionProvider = config.extractionProvider ?? ''
  const extractionModel = config.extractionModel ?? ''
  if ((extractionProvider.length === 0) !== (extractionModel.length === 0)) {
    throw new TypeError('mind-garden-memory: extractionProvider and extractionModel must be configured together')
  }
  const maxExtractionCandidates = positiveSafeInteger(
    config.maxExtractionCandidates ?? DEFAULT_MAX_EXTRACTION_CANDIDATES,
    'maxExtractionCandidates',
  )
  if (maxExtractionCandidates > 8) {
    throw new TypeError('mind-garden-memory: maxExtractionCandidates cannot exceed the extraction schema limit of 8')
  }
  return Object.freeze({
    maxContentBytes: positiveSafeInteger(config.maxContentBytes ?? DEFAULT_MAX_CONTENT_BYTES, 'maxContentBytes'),
    maxReasonBytes: positiveSafeInteger(config.maxReasonBytes ?? DEFAULT_MAX_REASON_BYTES, 'maxReasonBytes'),
    maxScopeBytes: positiveSafeInteger(config.maxScopeBytes ?? DEFAULT_MAX_SCOPE_BYTES, 'maxScopeBytes'),
    maxEvidenceBytes: positiveSafeInteger(config.maxEvidenceBytes ?? DEFAULT_MAX_EVIDENCE_BYTES, 'maxEvidenceBytes'),
    maxInjectedMemories: positiveSafeInteger(
      config.maxInjectedMemories ?? DEFAULT_MAX_INJECTED_MEMORIES,
      'maxInjectedMemories',
    ),
    maxInjectedBytes: positiveSafeInteger(config.maxInjectedBytes ?? DEFAULT_MAX_INJECTED_BYTES, 'maxInjectedBytes'),
    maxAuditEntries: positiveSafeInteger(config.maxAuditEntries ?? DEFAULT_MAX_AUDIT_ENTRIES, 'maxAuditEntries'),
    maxExtractionRunEntries: positiveSafeInteger(
      config.maxExtractionRunEntries ?? DEFAULT_MAX_EXTRACTION_RUN_ENTRIES,
      'maxExtractionRunEntries',
    ),
    maxTemporaryDays: positiveSafeInteger(
      config.maxTemporaryDays ?? DEFAULT_MAX_TEMPORARY_DAYS,
      'maxTemporaryDays',
    ),
    maxRevisionsPerMemory: positiveSafeInteger(
      config.maxRevisionsPerMemory ?? DEFAULT_MAX_REVISIONS_PER_MEMORY,
      'maxRevisionsPerMemory',
    ),
    maxExtractionCandidates,
    minExtractionConfidence,
    maxExtractionInputBytes: positiveSafeInteger(
      config.maxExtractionInputBytes ?? DEFAULT_MAX_EXTRACTION_INPUT_BYTES,
      'maxExtractionInputBytes',
    ),
    maxExtractionMemoryBytes: positiveSafeInteger(
      config.maxExtractionMemoryBytes ?? DEFAULT_MAX_EXTRACTION_MEMORY_BYTES,
      'maxExtractionMemoryBytes',
    ),
    maxExtractionOutputTokens: positiveSafeInteger(
      config.maxExtractionOutputTokens ?? DEFAULT_MAX_EXTRACTION_OUTPUT_TOKENS,
      'maxExtractionOutputTokens',
    ),
    extractionProvider,
    extractionModel,
  })
}

function success<T>(value: T): MindGardenMemorySuccess<T> {
  return Object.freeze({ ok: true, value })
}

function rejected<E extends MindGardenMemoryFailure>(error: E): MindGardenMemoryRejected<E> {
  return Object.freeze({ ok: false, error: Object.freeze(error) })
}

function memoryId(value: string): MindGardenMemoryId {
  return value as MindGardenMemoryId
}

function memoryVersion(value: string): MindGardenMemoryVersion {
  return value as MindGardenMemoryVersion
}

function snapshotSource(source: StoredMemory['sources'][number]): MindGardenMemorySource {
  return Object.freeze({
    sessionId: SessionId(source.sessionId),
    ...(source.messageId === undefined ? {} : { messageId: MessageId(source.messageId) }),
    ...(source.evidenceQuote === undefined ? {} : { evidenceQuote: source.evidenceQuote }),
  })
}

function statusAt(memory: StoredMemory, now: number): MindGardenMemoryItem['status'] {
  const expiresAt = memory.expiresAt as number
  return memory.status === 'temporary' && expiresAt <= now ? 'expired' : memory.status
}

function snapshotMemory(memory: StoredMemory, now = Date.now()): MindGardenMemoryItem {
  return Object.freeze({
    id: memoryId(memory.id),
    version: memoryVersion(memory.version),
    status: statusAt(memory, now),
    kind: memory.kind,
    sensitivity: memory.sensitivity,
    content: memory.content,
    reason: memory.reason,
    ...(memory.scope === undefined ? {} : { scope: memory.scope }),
    recallPolicy: memory.recallPolicy,
    sources: Object.freeze(memory.sources.map(snapshotSource)),
    proposalOrigin: memory.proposalOrigin ?? 'human',
    ...(memory.confidence === undefined ? {} : { confidence: memory.confidence }),
    ...(memory.importance === undefined ? {} : { importance: memory.importance }),
    ...(memory.relationship === undefined ? {} : {
      relationship: Object.freeze({
        type: memory.relationship.type,
        targetMemoryId: memoryId(memory.relationship.targetMemoryId),
        targetVersion: memoryVersion(memory.relationship.targetVersion),
        rationale: memory.relationship.rationale,
        status: memory.relationship.status,
        ...(memory.relationship.resolution === undefined ? {} : { resolution: memory.relationship.resolution }),
      }),
    }),
    ...(memory.supersededBy === undefined ? {} : { supersededBy: memoryId(memory.supersededBy) }),
    revisionCount: memory.revisions?.length ?? 0,
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt,
    ...(memory.confirmedAt === undefined ? {} : { confirmedAt: memory.confirmedAt }),
    ...(memory.expiresAt === undefined ? {} : { expiresAt: memory.expiresAt }),
  })
}

function snapshotRevision(revision: NonNullable<StoredMemory['revisions']>[number]): MindGardenMemoryRevision {
  return Object.freeze({
    id: memoryVersion(revision.id),
    action: revision.action,
    status: revision.status,
    kind: revision.kind,
    sensitivity: revision.sensitivity,
    content: revision.content,
    reason: revision.reason,
    ...(revision.scope === undefined ? {} : { scope: revision.scope }),
    recallPolicy: revision.recallPolicy,
    sources: Object.freeze(revision.sources.map(snapshotSource)),
    createdAt: revision.createdAt,
    ...(revision.relatedMemoryId === undefined ? {} : {
      relatedMemoryId: memoryId(revision.relatedMemoryId),
    }),
  })
}

function snapshotAudit(audit: StoredAudit): MindGardenMemoryRetrievalAudit {
  return Object.freeze({
    sessionId: SessionId(audit.sessionId),
    createdAt: audit.createdAt,
    sentToModel: audit.sentToModel,
    matches: Object.freeze(audit.matches.map(match => Object.freeze({
      memoryId: memoryId(match.memoryId),
      reason: match.reason,
      score: match.score,
    }))),
  })
}

function snapshotExtractionRun(run: StoredExtractionRun): MindGardenMemoryExtractionRun {
  return Object.freeze({
    id: run.id,
    trigger: run.trigger ?? 'manual',
    status: run.status,
    provider: run.provider,
    model: run.model,
    sourceMessageIds: Object.freeze(run.sourceMessageIds.map(MessageId)),
    comparedMemoryIds: Object.freeze(run.comparedMemoryIds.map(memoryId)),
    candidateIds: Object.freeze(run.candidates.map(candidate => memoryId(candidate.id))),
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    ...(run.failure === undefined ? {} : { failure: run.failure }),
  })
}

function snapshotAutomationPolicy(
  policy: StoredAutomationPolicy | undefined,
  state: StoredAutomationState | undefined,
): MindGardenMemoryAutomationPolicy {
  return Object.freeze({
    enabled: policy?.enabled ?? false,
    minimumCompletedTurns: policy?.minimumCompletedTurns ?? DEFAULT_AUTOMATION_INTERVAL,
    version: policy === undefined ? null : memoryVersion(policy.version),
    updatedAt: policy?.updatedAt ?? null,
    lastAttemptedTurn: state?.lastAttemptedTurn ?? 0,
    lastAttemptAt: state?.lastAttemptAt ?? null,
    lastOutcome: state?.lastOutcome ?? null,
  })
}

/** Governed encrypted profile memory, auxiliary extraction, revisions, and deterministic recall. */
export class MindGardenMemoryService extends TypertRemoteService {
  static inject = ['agents', 'llm', 'mindGarden', 'mindGardenVault']

  /** Loader validation for complete UTF-8, retrieval, audit, and lifetime bounds. */
  static Config: s<Config> = s.object({
    maxContentBytes: s.number().default(DEFAULT_MAX_CONTENT_BYTES),
    maxReasonBytes: s.number().default(DEFAULT_MAX_REASON_BYTES),
    maxScopeBytes: s.number().default(DEFAULT_MAX_SCOPE_BYTES),
    maxEvidenceBytes: s.number().default(DEFAULT_MAX_EVIDENCE_BYTES),
    maxInjectedMemories: s.number().default(DEFAULT_MAX_INJECTED_MEMORIES),
    maxInjectedBytes: s.number().default(DEFAULT_MAX_INJECTED_BYTES),
    maxAuditEntries: s.number().default(DEFAULT_MAX_AUDIT_ENTRIES),
    maxExtractionRunEntries: s.number().default(DEFAULT_MAX_EXTRACTION_RUN_ENTRIES),
    maxTemporaryDays: s.number().default(DEFAULT_MAX_TEMPORARY_DAYS),
    maxRevisionsPerMemory: s.number().default(DEFAULT_MAX_REVISIONS_PER_MEMORY),
    maxExtractionCandidates: s.number().default(DEFAULT_MAX_EXTRACTION_CANDIDATES),
    minExtractionConfidence: s.number().default(DEFAULT_MIN_EXTRACTION_CONFIDENCE),
    maxExtractionInputBytes: s.number().default(DEFAULT_MAX_EXTRACTION_INPUT_BYTES),
    maxExtractionMemoryBytes: s.number().default(DEFAULT_MAX_EXTRACTION_MEMORY_BYTES),
    maxExtractionOutputTokens: s.number().default(DEFAULT_MAX_EXTRACTION_OUTPUT_TOKENS),
    extractionProvider: s.string().default(''),
    extractionModel: s.string().default(''),
  })

  private readonly options: ResolvedConfig
  private operationTail: Promise<void> = Promise.resolve()
  private admissionOpen = true
  private readonly extractionOperations = new Map<string, Promise<MindGardenMemoryExtractResult>>()
  private readonly extractionControllers = new Set<AbortController>()
  private readonly automationOperations = new Map<string, Promise<void>>()

  /**
   * Install the Remote service and first-step recall listener.
   * @param ctx - Host context carrying live Agents, Mind Garden state, and the encrypted vault.
   * @param config - Complete text, retrieval, audit, and temporary-memory limits.
   */
  constructor(ctx: Context, config: Config) {
    super(ctx, 'mindGardenMemory')
    this.options = resolveConfig(config)
    ctx.on('agent/pre-step', async ({ agent, step, signal }, next): Promise<PreStepDecision> => {
      const decision = await next()
      if (decision.kind === 'reject' || signal.aborted || step !== 1) return decision
      const state = ctx.mindGarden.current(agent.session)
      if (state === null || state.privacy !== 'durable') return decision
      try {
        const recall = await this.enqueue(async () => await this.prepareRecall(
          agent,
          userQuery(decision.messages),
        ))
        if (recall === null) return decision
        return {
          kind: 'enter',
          messages: [
            ...decision.messages,
            createUserMessage({
              content: [{ type: 'text', text: recall.text }],
              source: { kind: 'plugin', plugin: name, form: 'recall' },
            }),
          ],
        }
      } catch (error) {
        ctx.logger.warn(`mind-garden-memory: recall unavailable: ${this.safeDiagnostic(error)}`)
        return decision
      }
    })
    ctx.on('agent/status', ({ agent, status }) => {
      if (status === 'idle') this.scheduleAutomaticExtraction(agent)
    })
    ctx.effect(() => async () => {
      this.admissionOpen = false
      for (const controller of this.extractionControllers) controller.abort()
      await Promise.allSettled(this.automationOperations.values())
      await Promise.allSettled(this.extractionOperations.values())
      await this.operationTail
    }, 'mind-garden-memory.drain')
  }

  /**
   * List every encrypted profile memory through one activated durable Session.
   * @param agent - Exact live Agent resolved by the Remote boundary.
   * @returns Detached current items, including rejected, superseded, and projected-expired records.
   */
  @Remote('list')
  list(agent: Agent): Promise<MindGardenMemoryListResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const now = Date.now()
        const items = (await this.readRecords()).flatMap(record =>
          record.recordType === 'memory' ? [snapshotMemory(record, now)] : [],
        )
        return success<MindGardenMemoryListValue>(Object.freeze({ items: Object.freeze(items) }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryListResult>>(error)
      }
    })
  }

  /**
   * Store one encrypted candidate with local-session provenance and recall disabled.
   * @param agent - Exact live Agent and source Session.
   * @param request - Human-authored statement, retention reason, classification, and optional exact evidence.
   * @returns The candidate, or a stable validation, access, or vault failure.
   */
  @Remote('propose')
  propose(agent: Agent, request: MindGardenMemoryProposeRequest): Promise<MindGardenMemoryProposeResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const content = this.requiredText(request.content, 'content', this.options.maxContentBytes)
        this.assertNotCredentialLike(content)
        const reason = this.requiredText(request.reason, 'reason', this.options.maxReasonBytes)
        const scope = this.optionalScope(request.scope)
        const source = this.resolveSource(agent, request.source)
        const now = Date.now()
        const id = randomUUID()
        const record = storedMemorySchema.parse({
          recordType: 'memory',
          formatVersion: 1,
          id,
          version: randomUUID(),
          status: 'candidate',
          kind: request.kind,
          sensitivity: request.sensitivity ?? 'normal',
          content,
          reason,
          ...(scope === undefined ? {} : { scope }),
          recallPolicy: 'never',
          sources: [source],
          proposalOrigin: 'human',
          revisions: [],
          createdAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotMemory(record, now))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryProposeResult>>(error)
      }
    })
  }

  /**
   * Confirm an unrelated candidate with an explicit recall policy and optional bounded expiry.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Candidate identity, observed version, policy, lifetime, and optional correction.
   * @returns The committed confirmed or temporary item, or a stable failure.
   */
  @Remote('confirm')
  confirm(agent: Agent, request: MindGardenMemoryConfirmRequest): Promise<MindGardenMemoryConfirmResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = this.requireMemory(records, request.id)
        this.assertVersion(current, request.ifVersion)
        const observedAt = Date.now()
        if (statusAt(current, observedAt) !== 'candidate') {
          throw new MemoryBusinessError({ code: 'invalid-transition', status: statusAt(current, observedAt) })
        }
        if (current.relationship?.status === 'pending') {
          throw new MemoryBusinessError({ code: 'relationship-review-required' })
        }
        if (request.temporaryDays !== undefined
          && (!Number.isSafeInteger(request.temporaryDays)
            || request.temporaryDays < 1
            || request.temporaryDays > this.options.maxTemporaryDays)) {
          throw new MemoryBusinessError({
            code: 'temporary-period-invalid',
            maxDays: this.options.maxTemporaryDays,
          })
        }
        this.assertRecallAllowed(current.sensitivity, request.recallPolicy)
        const content = request.content === undefined
          ? current.content
          : this.requiredText(request.content, 'content', this.options.maxContentBytes)
        this.assertNotCredentialLike(content)
        const scope = request.scope === undefined ? current.scope : this.optionalScope(request.scope)
        const now = Math.max(observedAt, current.updatedAt)
        const candidate = {
          ...current,
          revisions: this.appendRevision(current, 'confirmed', now),
          version: randomUUID(),
          status: request.temporaryDays === undefined ? 'confirmed' : 'temporary',
          content,
          recallPolicy: request.recallPolicy,
          updatedAt: now,
          confirmedAt: now,
        }
        if (scope === undefined) delete candidate.scope
        else candidate.scope = scope
        if (request.temporaryDays === undefined) delete candidate.expiresAt
        else candidate.expiresAt = now + request.temporaryDays * DAY_MS
        const confirmed = storedMemorySchema.parse(candidate)
        await this.writeRecord(confirmed)
        return success(snapshotMemory(confirmed, now))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryConfirmResult>>(error)
      }
    })
  }

  /**
   * Edit one candidate or active memory; rejected, superseded, and expired records are immutable.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed version and optional replacement fields.
   * @returns The unchanged item for a semantic no-op, otherwise a newly versioned item.
   */
  @Remote('update')
  update(agent: Agent, request: MindGardenMemoryUpdateRequest): Promise<MindGardenMemoryUpdateResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = this.requireMemory(records, request.id)
        this.assertVersion(current, request.ifVersion)
        const observedAt = Date.now()
        const status = statusAt(current, observedAt)
        if (status === 'rejected' || status === 'expired') {
          throw new MemoryBusinessError({ code: 'invalid-transition', status })
        }
        const content = request.content === undefined
          ? current.content
          : this.requiredText(request.content, 'content', this.options.maxContentBytes)
        this.assertNotCredentialLike(content)
        const reason = request.reason === undefined
          ? current.reason
          : this.requiredText(request.reason, 'reason', this.options.maxReasonBytes)
        const scope = request.scope === undefined ? current.scope : this.optionalScope(request.scope)
        const sensitivity = request.sensitivity ?? current.sensitivity
        const recallPolicy = request.recallPolicy ?? current.recallPolicy
        if (status === 'candidate' && recallPolicy !== 'never') {
          throw new MemoryBusinessError({ code: 'invalid-transition', status })
        }
        this.assertRecallAllowed(sensitivity, recallPolicy)
        if (content === current.content
          && reason === current.reason
          && scope === current.scope
          && sensitivity === current.sensitivity
          && recallPolicy === current.recallPolicy) {
          return success(snapshotMemory(current, observedAt))
        }
        const now = Math.max(observedAt, current.updatedAt)
        const candidate = {
          ...current,
          revisions: this.appendRevision(current, 'updated', now),
          version: randomUUID(),
          content,
          reason,
          sensitivity,
          recallPolicy,
          updatedAt: now,
        }
        if (scope === undefined) delete candidate.scope
        else candidate.scope = scope
        const updated = storedMemorySchema.parse(candidate)
        await this.writeRecord(updated)
        return success(snapshotMemory(updated, now))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryUpdateResult>>(error)
      }
    })
  }

  /**
   * Reject one candidate and keep the encrypted decision for transparency.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Candidate identity and observed version.
   * @returns The rejected item, or a stable failure.
   */
  @Remote('reject')
  reject(agent: Agent, request: MindGardenMemoryRejectRequest): Promise<MindGardenMemoryRejectResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = this.requireMemory(records, request.id)
        this.assertVersion(current, request.ifVersion)
        const observedAt = Date.now()
        if (statusAt(current, observedAt) !== 'candidate') {
          throw new MemoryBusinessError({ code: 'invalid-transition', status: statusAt(current, observedAt) })
        }
        const now = Math.max(observedAt, current.updatedAt)
        const rejectedRecord = storedMemorySchema.parse({
          ...current,
          revisions: this.appendRevision(current, 'rejected', now),
          version: randomUUID(),
          status: 'rejected',
          recallPolicy: 'never',
          ...(current.relationship?.status === 'pending' ? {
            relationship: {
              ...current.relationship,
              status: 'resolved',
              resolution: 'keep-existing',
            },
          } : {}),
          updatedAt: now,
        })
        await this.writeRecord(rejectedRecord)
        return success(snapshotMemory(rejectedRecord, now))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryRejectResult>>(error)
      }
    })
  }

  /**
   * Resolve one model-suggested relationship through an explicit human choice.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Candidate version and keep, coexist, or replacement decision.
   * @returns Settled candidate and the active memory retained by the decision.
   */
  @Remote('resolveRelationship')
  resolveRelationship(
    agent: Agent,
    request: MindGardenMemoryResolveRelationshipRequest,
  ): Promise<MindGardenMemoryResolveRelationshipResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const candidate = this.requireMemory(records, request.id)
        this.assertVersion(candidate, request.ifVersion)
        const observedAt = Date.now()
        if (statusAt(candidate, observedAt) !== 'candidate') {
          throw new MemoryBusinessError({ code: 'invalid-transition', status: statusAt(candidate, observedAt) })
        }
        const relationship = candidate.relationship
        if (relationship === undefined || relationship.status !== 'pending') {
          throw new MemoryBusinessError({ code: 'relationship-not-pending' })
        }
        const target = records.find((record): record is StoredMemory =>
          record.recordType === 'memory' && record.id === relationship.targetMemoryId,
        )
        if (target === undefined) {
          throw new MemoryBusinessError({ code: 'relationship-stale', current: null })
        }
        const now = Math.max(observedAt, candidate.updatedAt, target.updatedAt)
        const alreadyApplied = request.resolution === 'replace-existing'
          && (target.revisions?.some(revision =>
            revision.action === 'replaced' && revision.relatedMemoryId === candidate.id,
          ) ?? false)
        if (!alreadyApplied) {
          const targetStatus = statusAt(target, observedAt)
          if (target.version !== relationship.targetVersion
            || (targetStatus !== 'confirmed' && targetStatus !== 'temporary')) {
            throw new MemoryBusinessError({ code: 'relationship-stale', current: snapshotMemory(target, observedAt) })
          }
        }
        if (request.resolution === 'keep-existing') {
          const settled = storedMemorySchema.parse({
            ...candidate,
            version: randomUUID(),
            status: 'rejected',
            recallPolicy: 'never',
            relationship: { ...relationship, status: 'resolved', resolution: 'keep-existing' },
            revisions: this.appendRevision(candidate, 'rejected', now),
            updatedAt: now,
          })
          await this.writeRecord(settled)
          return success<MindGardenMemoryResolveRelationshipValue>(Object.freeze({
            candidate: snapshotMemory(settled, now),
            activeMemory: snapshotMemory(target, now),
          }))
        }
        if (request.resolution === 'keep-both') {
          const active = this.acceptCandidate(candidate, request, now, 'keep-both')
          await this.writeRecord(active)
          return success<MindGardenMemoryResolveRelationshipValue>(Object.freeze({
            candidate: snapshotMemory(active, now),
            activeMemory: snapshotMemory(active, now),
          }))
        }

        let active = target
        if (!alreadyApplied) {
          this.assertTemporaryDays(request.temporaryDays)
          this.assertRecallAllowed(candidate.sensitivity, request.recallPolicy)
          const scope = request.scope === undefined ? candidate.scope : this.optionalScope(request.scope)
          const replacement = {
            ...target,
            version: randomUUID(),
            status: request.temporaryDays === undefined ? 'confirmed' : 'temporary',
            kind: candidate.kind,
            sensitivity: candidate.sensitivity,
            content: candidate.content,
            reason: candidate.reason,
            recallPolicy: request.recallPolicy,
            sources: this.mergeSources(target.sources, candidate.sources),
            proposalOrigin: candidate.proposalOrigin,
            confidence: candidate.confidence,
            importance: candidate.importance,
            extractionRunId: candidate.extractionRunId,
            revisions: this.appendRevision(target, 'replaced', now, candidate.id),
            updatedAt: now,
            confirmedAt: now,
          }
          if (scope === undefined) delete replacement.scope
          else replacement.scope = scope
          delete replacement.relationship
          delete replacement.supersededBy
          if (request.temporaryDays === undefined) delete replacement.expiresAt
          else replacement.expiresAt = now + request.temporaryDays * DAY_MS
          active = storedMemorySchema.parse(replacement)
          await this.writeRecord(active)
        }
        const superseded = { ...candidate } as StoredMemory
        delete superseded.confirmedAt
        delete superseded.expiresAt
        const settled = storedMemorySchema.parse({
          ...superseded,
          version: randomUUID(),
          status: 'superseded',
          recallPolicy: 'never',
          supersededBy: active.id,
          relationship: { ...relationship, status: 'resolved', resolution: 'replace-existing' },
          revisions: this.appendRevision(candidate, 'superseded', now, active.id),
          updatedAt: now,
        })
        await this.writeRecord(settled)
        return success<MindGardenMemoryResolveRelationshipValue>(Object.freeze({
          candidate: snapshotMemory(settled, now),
          activeMemory: snapshotMemory(active, now),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryResolveRelationshipResult>>(error)
      }
    })
  }

  /**
   * Read one memory's encrypted before-image history.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Memory identity whose revisions should be reviewed.
   * @returns Oldest-first detached revision snapshots.
   */
  @Remote('listRevisions')
  listRevisions(
    agent: Agent,
    request: MindGardenMemoryListRevisionsRequest,
  ): Promise<MindGardenMemoryListRevisionsResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const memory = this.requireMemory(await this.readRecords(), request.id)
        return success<MindGardenMemoryListRevisionsValue>(Object.freeze({
          revisions: Object.freeze((memory.revisions ?? []).map(snapshotRevision)),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryListRevisionsResult>>(error)
      }
    })
  }

  /**
   * Read this Session's encrypted automatic-extraction authorization and progress.
   * @param agent - Exact live Agent whose Session owns the preference.
   * @returns Explicit policy or the disabled default, plus the latest attempt state.
   */
  @Remote('automationPolicy')
  automationPolicy(agent: Agent): Promise<MindGardenMemoryAutomationPolicyResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        return success(this.automationSnapshot(records, agent.session.id))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryAutomationPolicyResult>>(error)
      }
    })
  }

  /**
   * Replace this Session's automatic-extraction authorization without processing older turns.
   * @param agent - Exact live Agent whose Session owns the preference.
   * @param request - Enabled state, cadence, and last observed preference version.
   * @returns The committed preference with its reset forward-only progress cursor.
   */
  @Remote('setAutomationPolicy')
  setAutomationPolicy(
    agent: Agent,
    request: MindGardenMemorySetAutomationPolicyRequest,
  ): Promise<MindGardenMemorySetAutomationPolicyResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = this.automationRecord(records, agent.session.id, 'automation-policy')
        if ((current === undefined && request.ifVersion !== null)
          || (current !== undefined && current.version !== request.ifVersion)) {
          throw new MemoryBusinessError({
            code: 'automation-version-conflict',
            current: this.automationSnapshot(records, agent.session.id),
          })
        }
        const now = Date.now()
        const policy = storedAutomationPolicySchema.parse({
          recordType: 'automation-policy',
          formatVersion: 1,
          id: current?.id ?? randomUUID(),
          sessionId: agent.session.id,
          version: randomUUID(),
          enabled: request.enabled,
          minimumCompletedTurns: request.minimumCompletedTurns,
          updatedAt: now,
        })
        const previousState = this.automationRecord(records, agent.session.id, 'automation-state')
        const state = storedAutomationStateSchema.parse({
          recordType: 'automation-state',
          formatVersion: 1,
          id: previousState?.id ?? randomUUID(),
          sessionId: agent.session.id,
          lastAttemptedTurn: this.latestEligibleCompletedTurn(agent),
          lastAttemptAt: null,
          lastOutcome: null,
          updatedAt: now,
        })
        await this.writeRecord(state)
        await this.writeRecord(policy)
        return success(snapshotAutomationPolicy(policy, state))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemorySetAutomationPolicyResult>>(error)
      }
    })
  }

  /**
   * Run one explicit auxiliary-model pass that can create review-only candidates.
   * @param agent - Exact live Agent and transcript owner.
   * @param request - Optional complete provider/model override.
   * @returns Encrypted run metadata and candidates that still require confirmation or relationship review.
   */
  @Remote('extract')
  extract(agent: Agent, request: MindGardenMemoryExtractRequest): Promise<MindGardenMemoryExtractResult> {
    return this.startExtraction(agent, request, 'manual')
  }

  /** Start one single-flight extraction and bind it to service and optional Agent cancellation. */
  private startExtraction(
    agent: Agent,
    request: MindGardenMemoryExtractRequest,
    trigger: MindGardenMemoryExtractionRun['trigger'],
    agentSignal?: AbortSignal,
    automaticSourceMessageIds?: ReadonlySet<string>,
  ): Promise<MindGardenMemoryExtractResult> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-memory: service is disposing'))
    const access = this.accessFailure(agent)
    if (access !== null) return Promise.resolve(rejected(access))
    if (this.extractionOperations.has(agent.session.id)) {
      return Promise.resolve(rejected({ code: 'extraction-in-progress' }))
    }
    const controller = new AbortController()
    this.extractionControllers.add(controller)
    const signal = agentSignal === undefined
      ? controller.signal
      : AbortSignal.any([controller.signal, agentSignal])
    const operation = this.runExtraction(
      agent,
      request,
      trigger,
      signal,
      automaticSourceMessageIds,
    ).finally(() => {
      this.extractionOperations.delete(agent.session.id)
      this.extractionControllers.delete(controller)
    })
    this.extractionOperations.set(agent.session.id, operation)
    return operation
  }

  /**
   * Read the newest encrypted auxiliary-model extraction audit for this Session.
   * @param agent - Exact live Agent whose Session owns the audit view.
   * @returns Latest run metadata or null before any extraction request.
   */
  @Remote('latestExtraction')
  latestExtraction(agent: Agent): Promise<MindGardenMemoryLatestExtractionResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const run = (await this.readRecords()).flatMap((record): StoredExtractionRun[] =>
          record.recordType === 'extraction-run' && record.sessionId === agent.session.id ? [record] : [],
        ).sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id))[0]
        return success<MindGardenMemoryLatestExtractionValue>(Object.freeze({
          run: run === undefined ? null : snapshotExtractionRun(run),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryLatestExtractionResult>>(error)
      }
    })
  }

  /**
   * Delete one encrypted memory; retrying after absence remains successful.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Memory identity and last observed version.
   * @returns A stable absent postcondition or version/access/vault failure.
   */
  @Remote('delete')
  delete(agent: Agent, request: MindGardenMemoryDeleteRequest): Promise<MindGardenMemoryDeleteResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = records.find((record): record is StoredMemory =>
          record.recordType === 'memory' && record.id === request.id,
        )
        if (current === undefined) {
          const tombstoneRecorded = records.some(record =>
            record.recordType === 'memory-tombstone' && record.id === request.id,
          )
          return success<MindGardenMemoryDeleteValue>(Object.freeze({
            absent: true,
            memoryRecordRemoved: false,
            deletionTombstoneRecorded: tombstoneRecorded,
            extractionRunsRedacted: 0,
            sessionHistory: 'retained-by-host',
            providerCopies: 'provider-controlled',
          }))
        }
        this.assertVersion(current, request.ifVersion)
        const associatedRuns = records.flatMap((record): StoredExtractionRun[] =>
          record.recordType === 'extraction-run'
            && (record.candidates.some(candidate => candidate.id === current.id)
              || record.comparedMemoryIds.includes(current.id))
            ? [record]
            : [],
        )
        for (const run of associatedRuns) {
          await this.writeRecord(storedExtractionRunSchema.parse({
            ...run,
            prompt: JSON.stringify({ redacted: true, reason: 'memory-deleted' }),
            ...(run.rawOutput === undefined
              ? {}
              : { rawOutput: JSON.stringify({ redacted: true, reason: 'memory-deleted' }) }),
            comparedMemoryIds: run.comparedMemoryIds.filter(id => id !== current.id),
            candidates: run.candidates.filter(candidate => candidate.id !== current.id),
            updatedAt: Math.max(Date.now(), run.updatedAt),
          }))
        }
        await this.writeRecord(storedMemoryTombstoneSchema.parse({
          recordType: 'memory-tombstone',
          formatVersion: 1,
          id: current.id,
          deletedAt: Date.now(),
        }))
        return success<MindGardenMemoryDeleteValue>(Object.freeze({
          absent: true,
          memoryRecordRemoved: true,
          deletionTombstoneRecorded: true,
          extractionRunsRedacted: associatedRuns.length,
          sessionHistory: 'retained-by-host',
          providerCopies: 'provider-controlled',
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryDeleteResult>>(error)
      }
    })
  }

  /**
   * Read the newest encrypted retrieval audit for this Session.
   * @param agent - Exact live Agent whose Session owns the audit view.
   * @returns The latest audit or null before any retrieval attempt.
   */
  @Remote('latestAudit')
  latestAudit(agent: Agent): Promise<MindGardenMemoryLatestAuditResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const audit = (await this.readRecords()).flatMap(record =>
          record.recordType === 'retrieval-audit' && record.sessionId === agent.session.id ? [record] : [],
        ).sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id))[0]
        return success<MindGardenMemoryLatestAuditValue>(Object.freeze({
          audit: audit === undefined ? null : snapshotAudit(audit),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenMemoryLatestAuditResult>>(error)
      }
    })
  }

  /** Coalesce one idle transition into a fail-closed automatic-extraction check. */
  private scheduleAutomaticExtraction(agent: Agent): void {
    if (!this.admissionOpen || this.automationOperations.has(agent.session.id)) return
    const operation = this.runAutomaticExtraction(agent).catch((error: unknown) => {
      if (this.admissionOpen) {
        this.ctx.logger.warn(
          `mind-garden-memory: automatic extraction unavailable: ${this.safeDiagnostic(error)}`,
        )
      }
    }).finally(() => {
      this.automationOperations.delete(agent.session.id)
    })
    this.automationOperations.set(agent.session.id, operation)
  }

  /** Claim true Agent idle only when the encrypted policy and new-turn count are due. */
  private async runAutomaticExtraction(agent: Agent): Promise<void> {
    const due = await this.enqueue(async () => await this.automaticExtractionDue(agent))
    if (!due || !this.admissionOpen) return
    let maintenance: Promise<void>
    try {
      maintenance = agent.runMaintenance(async (signal) => {
        const attempt = await this.enqueue(async () => await this.prepareAutomaticAttempt(agent))
        if (attempt === null) return
        let outcome: 'completed' | 'failed' = 'failed'
        try {
          const result = await this.startExtraction(
            agent,
            {},
            'automatic',
            signal,
            new Set(attempt.sourceMessageIds),
          )
          if (result.ok) outcome = 'completed'
        } finally {
          await this.enqueue(async () => {
            await this.finishAutomaticAttempt(
              agent.session.id,
              attempt.turn,
              attempt.startedAt,
              outcome,
            )
          })
        }
      })
    } catch {
      return
    }
    await maintenance
  }

  /** Recover an interrupted cursor and determine whether enough new eligible turns exist. */
  private async automaticExtractionDue(agent: Agent): Promise<boolean> {
    if (this.accessFailure(agent) !== null) return false
    const records = await this.readRecords()
    const policy = this.automationRecord(records, agent.session.id, 'automation-policy')
    if (policy === undefined || !policy.enabled) return false
    const state = this.automationRecord(records, agent.session.id, 'automation-state')
    if (state?.lastOutcome === 'running') {
      await this.writeRecord(storedAutomationStateSchema.parse({
        ...state,
        lastOutcome: 'failed',
        updatedAt: Math.max(Date.now(), state.updatedAt),
      }))
    }
    const cursor = state?.lastAttemptedTurn ?? 0
    const available = this.eligibleCompletedTurns(agent).filter(turn => turn > cursor).length
    return available >= policy.minimumCompletedTurns
  }

  /** Recheck authorization inside maintenance, then durably charge the latest eligible turn. */
  private async prepareAutomaticAttempt(
    agent: Agent,
  ): Promise<{
    readonly turn: number
    readonly startedAt: number
    readonly sourceMessageIds: readonly string[]
  } | null> {
    if (this.accessFailure(agent) !== null) return null
    const records = await this.readRecords()
    const policy = this.automationRecord(records, agent.session.id, 'automation-policy')
    if (policy === undefined || !policy.enabled) return null
    const previous = this.automationRecord(records, agent.session.id, 'automation-state')
    const cursor = previous?.lastAttemptedTurn ?? 0
    const available = this.eligibleCompletedTurns(agent).filter(turn => turn > cursor)
    if (available.length < policy.minimumCompletedTurns) return null
    const turn = available.at(-1)
    if (turn === undefined) return null
    const sourceMessageIds = this.userMessageIdsForTurns(agent, new Set(available))
    const startedAt = Date.now()
    await this.writeRecord(storedAutomationStateSchema.parse({
      recordType: 'automation-state',
      formatVersion: 1,
      id: previous?.id ?? randomUUID(),
      sessionId: agent.session.id,
      lastAttemptedTurn: turn,
      lastAttemptAt: startedAt,
      lastOutcome: 'running',
      updatedAt: startedAt,
    }))
    return Object.freeze({ turn, startedAt, sourceMessageIds: Object.freeze(sourceMessageIds) })
  }

  /** Settle the exact automatic attempt unless a later preference write replaced its cursor. */
  private async finishAutomaticAttempt(
    sessionId: string,
    turn: number,
    startedAt: number,
    outcome: 'completed' | 'failed',
  ): Promise<void> {
    const records = await this.readRecords()
    const state = this.automationRecord(records, sessionId, 'automation-state')
    if (state === undefined
      || state.lastAttemptedTurn !== turn
      || state.lastAttemptAt !== startedAt
      || state.lastOutcome !== 'running') return
    await this.writeRecord(storedAutomationStateSchema.parse({
      ...state,
      lastOutcome: outcome,
      updatedAt: Math.max(Date.now(), state.updatedAt),
    }))
  }

  /** Read one unique per-Session automation record and reject ambiguous ciphertext state. */
  private automationRecord(
    records: readonly StoredMindGardenMemoryRecord[],
    sessionId: string,
    recordType: 'automation-policy',
  ): StoredAutomationPolicy | undefined
  private automationRecord(
    records: readonly StoredMindGardenMemoryRecord[],
    sessionId: string,
    recordType: 'automation-state',
  ): StoredAutomationState | undefined
  private automationRecord(
    records: readonly StoredMindGardenMemoryRecord[],
    sessionId: string,
    recordType: 'automation-policy' | 'automation-state',
  ): StoredAutomationPolicy | StoredAutomationState | undefined {
    const matches = records.filter((record): record is StoredAutomationPolicy | StoredAutomationState =>
      record.recordType === recordType && record.sessionId === sessionId,
    )
    if (matches.length > 1) {
      throw new CorruptMemoryStoreError(`Mind Garden ${recordType} is not unique for this Session`)
    }
    return matches[0]
  }

  /** Project one public preference from its independent authorization and progress records. */
  private automationSnapshot(
    records: readonly StoredMindGardenMemoryRecord[],
    sessionId: string,
  ): MindGardenMemoryAutomationPolicy {
    return snapshotAutomationPolicy(
      this.automationRecord(records, sessionId, 'automation-policy'),
      this.automationRecord(records, sessionId, 'automation-state'),
    )
  }

  /** Completed turns are eligible unless deterministic safety kept their response local. */
  private eligibleCompletedTurns(agent: Agent): number[] {
    const excluded = new Set<number>()
    for (const event of agent.session.events) {
      const candidate = event as unknown as {
        readonly type: string
        readonly data?: {
          readonly turn?: unknown
          readonly response?: unknown
          readonly assessment?: { readonly level?: unknown }
        }
      }
      if (candidate.type !== 'mind-garden/safety-assessment') continue
      if (!Number.isSafeInteger(candidate.data?.turn)) continue
      if (candidate.data?.response === 'local'
        || (typeof candidate.data?.assessment?.level === 'number' && candidate.data.assessment.level > 0)) {
        excluded.add(candidate.data.turn as number)
      }
    }
    return [...new Set(agent.session.events.flatMap(event =>
      event.type === 'turn/end'
        && event.data.reason.kind === 'completed'
        && !excluded.has(event.data.turn)
        ? [event.data.turn]
        : [],
    ))].sort((left, right) => left - right)
  }

  /** Return the newest eligible completed turn, or the empty-log cursor. */
  private latestEligibleCompletedTurn(agent: Agent): number {
    return this.eligibleCompletedTurns(agent).at(-1) ?? 0
  }

  /** Select human inputs logged inside the exact completed turns charged to one attempt. */
  private userMessageIdsForTurns(agent: Agent, turns: ReadonlySet<number>): string[] {
    const ids: string[] = []
    let turn: number | null = null
    for (const event of agent.session.events) {
      if (event.type === 'turn/start') turn = event.data.turn
      else if (event.type === 'turn/end' && event.data.turn === turn) turn = null
      else if (event.type === 'user/message' && turn !== null && turns.has(turn)) ids.push(event.data.id)
    }
    return ids
  }

  /** Require the exact registry-owned Agent, then project the memory access policy. */
  private accessFailure(agent: Agent): MindGardenMemoryAccessDenied | null {
    if (this.ctx.agents.get(agent.id) !== agent) {
      throw new Error(`mind-garden-memory: agent '${agent.id}' is not live in this registry`)
    }
    const state = this.ctx.mindGarden.current(agent.session)
    if (state === null) return { code: 'mind-garden-not-active' }
    if (state.privacy !== 'durable') return { code: 'durable-session-required' }
    return null
  }

  /** Read, authenticate, decode, and cross-check every record in one vault snapshot. */
  private async readRecords(): Promise<StoredMindGardenMemoryRecord[]> {
    const entries = await this.ctx.mindGardenVault.entries('memories')
    try {
      return entries.map(([id, value]) => {
        const record = decodeStoredRecord(value)
        if (record.id !== id) throw new TypeError('vault id differs from authenticated record id')
        return record
      })
    } catch (error) {
      throw new CorruptMemoryStoreError('Mind Garden memory plaintext record is invalid', { cause: error })
    }
  }

  /** Validate once more, then commit through the ciphertext-only vault API. */
  private async writeRecord(record: StoredMindGardenMemoryRecord): Promise<void> {
    const validated = decodeStoredRecord(record)
    await this.ctx.mindGardenVault.put(
      'memories',
      MindGardenVaultRecordId(validated.id),
      validated as unknown as JsonValue,
    )
  }

  /** Find one memory without allowing audit ids to enter memory mutations. */
  private requireMemory(records: readonly StoredMindGardenMemoryRecord[], id: MindGardenMemoryId): StoredMemory {
    const memory = records.find((record): record is StoredMemory =>
      record.recordType === 'memory' && record.id === id,
    )
    if (memory === undefined) throw new MemoryBusinessError({ code: 'memory-not-found', id })
    return memory
  }

  /** Retain one bounded encrypted before-image for a material mutation. */
  private appendRevision(
    memory: StoredMemory,
    action: MindGardenMemoryRevision['action'],
    createdAt: number,
    relatedMemoryId?: string,
  ): NonNullable<StoredMemory['revisions']> {
    const revision = {
      id: randomUUID(),
      action,
      status: memory.status,
      kind: memory.kind,
      sensitivity: memory.sensitivity,
      content: memory.content,
      reason: memory.reason,
      ...(memory.scope === undefined ? {} : { scope: memory.scope }),
      recallPolicy: memory.recallPolicy,
      sources: memory.sources,
      createdAt,
      ...(relatedMemoryId === undefined ? {} : { relatedMemoryId }),
    }
    return [...(memory.revisions ?? []), revision].slice(-this.options.maxRevisionsPerMemory)
  }

  /** Confirm one related candidate while recording the explicit coexist decision. */
  private acceptCandidate(
    candidate: StoredMemory,
    request: Extract<MindGardenMemoryResolveRelationshipRequest, { resolution: 'keep-both' }>,
    now: number,
    resolution: 'keep-both',
  ): StoredMemory {
    this.assertTemporaryDays(request.temporaryDays)
    this.assertRecallAllowed(candidate.sensitivity, request.recallPolicy)
    const scope = request.scope === undefined ? candidate.scope : this.optionalScope(request.scope)
    const accepted = {
      ...candidate,
      version: randomUUID(),
      status: request.temporaryDays === undefined ? 'confirmed' : 'temporary',
      recallPolicy: request.recallPolicy,
      relationship: { ...candidate.relationship, status: 'resolved', resolution },
      revisions: this.appendRevision(candidate, 'confirmed', now),
      updatedAt: now,
      confirmedAt: now,
    }
    if (scope === undefined) delete accepted.scope
    else accepted.scope = scope
    if (request.temporaryDays === undefined) delete accepted.expiresAt
    else accepted.expiresAt = now + request.temporaryDays * DAY_MS
    return storedMemorySchema.parse(accepted)
  }

  /** Validate the optional whole-day lifetime shared by confirmation paths. */
  private assertTemporaryDays(temporaryDays: number | undefined): void {
    if (temporaryDays !== undefined
      && (!Number.isSafeInteger(temporaryDays)
        || temporaryDays < 1
        || temporaryDays > this.options.maxTemporaryDays)) {
      throw new MemoryBusinessError({
        code: 'temporary-period-invalid',
        maxDays: this.options.maxTemporaryDays,
      })
    }
  }

  /** Merge exact provenance tuples without losing target history. */
  private mergeSources(
    left: StoredMemory['sources'],
    right: StoredMemory['sources'],
  ): StoredMemory['sources'] {
    const seen = new Set<string>()
    return [...left, ...right].filter((source) => {
      const key = JSON.stringify([source.sessionId, source.messageId ?? '', source.evidenceQuote ?? ''])
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /** Compare one equality-only version and include the authoritative view on failure. */
  private assertVersion(memory: StoredMemory, ifVersion: MindGardenMemoryVersion): void {
    if (memory.version !== ifVersion) {
      throw new MemoryBusinessError({ code: 'version-conflict', current: snapshotMemory(memory) })
    }
  }

  /** Validate and preserve one required string without trimming user-owned content. */
  private requiredText(
    value: string,
    field: MindGardenMemoryFieldBlank['field'],
    maxBytes: number,
  ): string {
    if (value.trim().length === 0) throw new MemoryBusinessError({ code: 'field-blank', field })
    this.assertBytes(value, field, maxBytes)
    return value
  }

  /** Normalize blank optional scope to absence and bound any retained value. */
  private optionalScope(value: string | undefined): string | undefined {
    if (value === undefined || value.trim().length === 0) return undefined
    this.assertBytes(value, 'scope', this.options.maxScopeBytes)
    return value
  }

  /** Enforce one complete UTF-8 field bound. */
  private assertBytes(value: string, field: MindGardenMemoryFieldTooLarge['field'], maxBytes: number): void {
    const actualBytes = Buffer.byteLength(value, 'utf8')
    if (actualBytes > maxBytes) {
      throw new MemoryBusinessError({ code: 'field-too-large', field, maxBytes, actualBytes })
    }
  }

  /** Preserve exact evidence only when the cited user message contains it. */
  private resolveSource(
    agent: Agent,
    source: MindGardenMemoryProposeRequest['source'],
  ): StoredMemory['sources'][number] {
    if (source === undefined) return { sessionId: agent.session.id }
    const quote = this.requiredText(source.evidenceQuote, 'evidenceQuote', this.options.maxEvidenceBytes)
    const message = agent.session.events.flatMap(candidate =>
      candidate.type === 'user/message' && candidate.data.id === source.messageId ? [candidate.data] : [],
    )[0]
    if (message === undefined || message.source.kind !== 'user') {
      throw new MemoryBusinessError({ code: 'source-invalid' })
    }
    const text = message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('\n')
    if (!text.includes(quote)) throw new MemoryBusinessError({ code: 'source-invalid' })
    return { sessionId: agent.session.id, messageId: source.messageId, evidenceQuote: quote }
  }

  /** Refuse common credential shapes even though the vault itself is encrypted. */
  private assertNotCredentialLike(content: string): void {
    const patterns = [
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/iu,
      /\bsk-[a-z0-9_-]{16,}\b/iu,
      /\b(?:api[_ -]?key|access[_ -]?token|password)\s*[:=]\s*\S{8,}/iu,
    ]
    if (patterns.some(pattern => pattern.test(content))) {
      throw new MemoryBusinessError({ code: 'credential-like-content' })
    }
  }

  /** High-sensitivity records retain local visibility but can never enter model context. */
  private assertRecallAllowed(
    sensitivity: StoredMemory['sensitivity'],
    recallPolicy: MindGardenMemoryRecallPolicy,
  ): void {
    if (sensitivity === 'high' && recallPolicy !== 'never') {
      throw new MemoryBusinessError({ code: 'high-sensitivity-recall-forbidden' })
    }
  }

  /** Execute one recoverable extraction without holding the profile writer during provider I/O. */
  private async runExtraction(
    agent: Agent,
    request: MindGardenMemoryExtractRequest,
    trigger: MindGardenMemoryExtractionRun['trigger'],
    signal: AbortSignal,
    automaticSourceMessageIds?: ReadonlySet<string>,
  ): Promise<MindGardenMemoryExtractResult> {
    try {
      const recovered = await this.enqueue(async () => await this.recoverExtraction(agent))
      if (recovered !== null) return success(recovered)
      const prepared = await this.enqueue(async () => await this.prepareExtraction(
        agent,
        request,
        trigger,
        automaticSourceMessageIds,
      ))
      let rawOutput: string
      try {
        rawOutput = await this.callExtractionModel(agent, prepared.envelope, prepared.run, signal)
      } catch {
        await this.enqueue(async () => {
          await this.failExtractionRun(prepared.run.id, 'model-failed')
        })
        return rejected({ code: 'extraction-model-failed' })
      }
      const proposals = decodeExtractionOutput(rawOutput)
      if (proposals === null) {
        await this.enqueue(async () => {
          await this.failExtractionRun(prepared.run.id, 'invalid-output', rawOutput)
        })
        return rejected({ code: 'extraction-output-invalid' })
      }
      return await this.enqueue(async () => {
        const records = await this.readRecords()
        const run = records.find((record): record is StoredExtractionRun =>
          record.recordType === 'extraction-run' && record.id === prepared.run.id,
        )
        if (run === undefined || run.status !== 'running') {
          throw new CorruptMemoryStoreError('Mind Garden extraction run left running state unexpectedly')
        }
        const candidates = this.extractionCandidates(agent, prepared.envelope, proposals, records, run.id)
        const committing = storedExtractionRunSchema.parse({
          ...run,
          status: 'committing',
          rawOutput,
          candidates,
          updatedAt: Math.max(Date.now(), run.updatedAt),
        })
        await this.writeRecord(committing)
        return success(await this.commitExtractionRun(committing))
      })
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenMemoryExtractResult>>(error)
    }
  }

  /** Close interrupted audit rows and finish one durable commit plan before starting new provider I/O. */
  private async recoverExtraction(agent: Agent): Promise<MindGardenMemoryExtractValue | null> {
    const records = await this.readRecords()
    const runs = records.flatMap((record): StoredExtractionRun[] =>
      record.recordType === 'extraction-run' && record.sessionId === agent.session.id ? [record] : [],
    ).sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id))
    for (const run of runs.filter(candidate => candidate.status === 'running')) {
      await this.writeRecord(storedExtractionRunSchema.parse({
        ...run,
        status: 'failed',
        failure: 'interrupted',
        updatedAt: Math.max(Date.now(), run.updatedAt),
      }))
    }
    let recovered: MindGardenMemoryExtractValue | null = null
    for (const run of runs.filter(candidate => candidate.status === 'committing')) {
      recovered = await this.commitExtractionRun(run)
    }
    return recovered
  }

  /** Resolve exact route and commit the encrypted model-visible request before dispatch. */
  private async prepareExtraction(
    agent: Agent,
    request: MindGardenMemoryExtractRequest,
    trigger: MindGardenMemoryExtractionRun['trigger'],
    automaticSourceMessageIds?: ReadonlySet<string>,
  ): Promise<{ readonly run: StoredExtractionRun; readonly envelope: ExtractionEnvelope }> {
    const access = this.accessFailure(agent)
    if (access !== null) throw new MemoryBusinessError(access)
    const target = this.extractionTarget(agent, request)
    if (target === null) throw new MemoryBusinessError({ code: 'extraction-model-unavailable' })
    const records = await this.readRecords()
    const now = Date.now()
    const memories = records.flatMap((record) => {
      if (record.recordType !== 'memory'
        || record.sensitivity !== 'normal'
        || record.recallPolicy === 'never') return []
      const status = statusAt(record, now)
      if (status !== 'confirmed' && status !== 'temporary') return []
      return [{
        id: memoryId(record.id),
        version: memoryVersion(record.version),
        kind: record.kind,
        content: record.content,
        ...(record.scope === undefined ? {} : { scope: record.scope }),
      }]
    })
    const messages = automaticSourceMessageIds === undefined
      ? agent.session.deriveMessages()
      : agent.session.deriveMessages().filter(message => automaticSourceMessageIds.has(message.id))
    const envelope = buildExtractionEnvelope(
      messages,
      memories,
      this.options.maxExtractionInputBytes,
      this.options.maxExtractionMemoryBytes,
    )
    if (!envelope.hadHumanText) throw new MemoryBusinessError({ code: 'extraction-no-source' })
    if (!envelope.transcript.some(row => row.role === 'user')) {
      throw new MemoryBusinessError({
        code: 'extraction-input-too-large',
        maxBytes: this.options.maxExtractionInputBytes,
      })
    }
    const id = randomUUID()
    const run = storedExtractionRunSchema.parse({
      recordType: 'extraction-run',
      formatVersion: 1,
      id,
      sessionId: agent.session.id,
      trigger,
      status: 'running',
      provider: target.provider,
      model: target.model,
      system: envelope.system,
      prompt: envelope.prompt,
      sourceMessageIds: envelope.transcript.filter(row => row.role === 'user').map(row => row.id),
      comparedMemoryIds: envelope.memories.map(memory => memory.id),
      candidates: [],
      createdAt: now,
      updatedAt: now,
    })
    await this.writeRecord(run)
    await this.pruneExtractionRuns([...records, run])
    return { run, envelope }
  }

  /** Resolve request override, package default, latest routed call, then Agent fallback. */
  private extractionTarget(
    agent: Agent,
    request: MindGardenMemoryExtractRequest,
  ): { readonly provider: string; readonly model: string } | null {
    const hasOverride = request.provider !== undefined || request.model !== undefined
    if (hasOverride) {
      if (request.provider === undefined
        || request.provider.trim().length === 0
        || request.model === undefined
        || request.model.trim().length === 0) return null
      return { provider: request.provider, model: request.model }
    }
    if (this.options.extractionProvider.length > 0) {
      return { provider: this.options.extractionProvider, model: this.options.extractionModel }
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

  /** Assemble one text-only auxiliary response and reject every incomplete finish. */
  private async callExtractionModel(
    agent: Agent,
    envelope: ExtractionEnvelope,
    run: StoredExtractionRun,
    signal: AbortSignal,
  ): Promise<string> {
    const assembler = new BlockAssembler()
    const options: GenerateOptions = {
      provider: run.provider,
      model: run.model,
      system: envelope.system,
      messages: [createUserMessage({
        content: [{ type: 'text', text: envelope.prompt }],
        source: { kind: 'plugin', plugin: name },
      })],
      temperature: 0.1,
      maxTokens: this.options.maxExtractionOutputTokens,
      sessionId: agent.session.id,
      purpose: 'mind-garden-memory-extraction',
      signal,
    }
    for await (const chunk of this.ctx.llm.stream(options)) assembler.push(chunk)
    if (this.extractionFinishFailed(assembler.finish)) throw new Error('extraction model did not finish completely')
    const blocks = assembler.blocks()
    if (blocks.some(block => block.type !== 'text' && block.type !== 'reasoning')) {
      throw new Error('extraction model returned executable content')
    }
    const output = blocks.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
    if (output.trim().length === 0) throw new Error('extraction model returned empty content')
    return output
  }

  /** Treat only an ordinary stop as a complete structured extraction response. */
  private extractionFinishFailed(finish: FinishReason): boolean {
    return finish.kind !== 'stop'
  }

  /** Convert reviewed model proposals into bounded, evidence-valid, encrypted candidates. */
  private extractionCandidates(
    agent: Agent,
    envelope: ExtractionEnvelope,
    proposals: readonly ExtractionProposal[],
    records: readonly StoredMindGardenMemoryRecord[],
    runId: string,
  ): StoredMemory[] {
    const sources = new Map(envelope.transcript.filter(row => row.role === 'user').map(row => [row.id, row]))
    const compared = new Map(envelope.memories.map(memory => [memory.id, memory]))
    const existing = records.flatMap(record => record.recordType === 'memory' ? [record] : [])
    const ranked = proposals.map((proposal, index) => ({ proposal, index }))
      .sort((left, right) => {
        const leftScore = left.proposal.importance * 0.7 + left.proposal.confidence * 0.3
        const rightScore = right.proposal.importance * 0.7 + right.proposal.confidence * 0.3
        return rightScore - leftScore || left.index - right.index
      })
    const accepted: StoredMemory[] = []
    const usedSources = new Set<string>()
    const usedContent = new Set<string>()
    for (const { proposal } of ranked) {
      if (proposal.confidence < this.options.minExtractionConfidence) continue
      const source = sources.get(proposal.sourceMessageId)
      if (source === undefined || !source.text.includes(proposal.evidenceQuote)) continue
      const normalized = this.normalizedCandidateContent(proposal.content)
      if (normalized.length === 0
        || usedSources.has(proposal.sourceMessageId)
        || usedContent.has(normalized)
        || /[?？]\s*$/u.test(proposal.content)
        || this.forbiddenInference(proposal.content)) continue
      try {
        const content = this.requiredText(proposal.content.trim(), 'content', this.options.maxContentBytes)
        this.assertNotCredentialLike(content)
        const reason = this.requiredText(proposal.reason.trim(), 'reason', this.options.maxReasonBytes)
        const scope = this.optionalScope(proposal.scope)
        const quote = this.requiredText(
          proposal.evidenceQuote,
          'evidenceQuote',
          this.options.maxEvidenceBytes,
        )
        const duplicate = existing.some(memory =>
          this.normalizedCandidateContent(memory.content) === normalized
          && memory.sources.some(candidateSource =>
            candidateSource.sessionId === agent.session.id
            && candidateSource.messageId === proposal.sourceMessageId,
          ),
        )
        if (duplicate) continue
        let relationship: StoredMemory['relationship']
        if (proposal.relationship !== undefined) {
          const target = compared.get(proposal.relationship.targetMemoryId)
          if (target === undefined) continue
          const rationale = this.requiredText(
            proposal.relationship.rationale.trim(),
            'reason',
            this.options.maxReasonBytes,
          )
          relationship = {
            type: proposal.relationship.type,
            targetMemoryId: target.id,
            targetVersion: target.version,
            rationale,
            status: 'pending',
          }
        }
        const now = Date.now()
        const candidate = storedMemorySchema.parse({
          recordType: 'memory',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          status: 'candidate',
          kind: proposal.kind,
          sensitivity: proposal.sensitivity ?? 'normal',
          content,
          reason,
          ...(scope === undefined ? {} : { scope }),
          recallPolicy: 'never',
          sources: [{
            sessionId: agent.session.id,
            messageId: proposal.sourceMessageId,
            evidenceQuote: quote,
          }],
          proposalOrigin: 'model-extraction',
          confidence: proposal.confidence,
          importance: proposal.importance,
          extractionRunId: runId,
          ...(relationship === undefined ? {} : { relationship }),
          revisions: [],
          createdAt: now,
          updatedAt: now,
        })
        accepted.push(candidate)
        usedSources.add(proposal.sourceMessageId)
        usedContent.add(normalized)
      } catch (error) {
        if (!(error instanceof MemoryBusinessError)) throw error
      }
      if (accepted.length >= this.options.maxExtractionCandidates) break
    }
    return accepted
  }

  /** Finish a durable plan idempotently; missing candidate writes are replayed from ciphertext. */
  private async commitExtractionRun(run: StoredExtractionRun): Promise<MindGardenMemoryExtractValue> {
    const records = await this.readRecords()
    const byId = new Map(records.map(record => [record.id, record]))
    for (const candidate of run.candidates) {
      const current = byId.get(candidate.id)
      if (current === undefined) {
        await this.writeRecord(candidate)
      } else if (current.recordType !== 'memory'
        || current.extractionRunId !== run.id
        || current.version !== candidate.version) {
        throw new CorruptMemoryStoreError('Mind Garden extraction candidate id collides with another record')
      }
    }
    const completed = storedExtractionRunSchema.parse({
      ...run,
      status: 'completed',
      updatedAt: Math.max(Date.now(), run.updatedAt),
    })
    await this.writeRecord(completed)
    await this.pruneExtractionRuns([...records, completed])
    return Object.freeze({
      run: snapshotExtractionRun(completed),
      candidates: Object.freeze(run.candidates.map(candidate => snapshotMemory(candidate, completed.updatedAt))),
    })
  }

  /** Settle one pre-dispatch extraction audit without exposing provider text in the failure. */
  private async failExtractionRun(
    id: string,
    failure: 'model-failed' | 'invalid-output',
    rawOutput?: string,
  ): Promise<void> {
    const records = await this.readRecords()
    const run = records.find((record): record is StoredExtractionRun =>
      record.recordType === 'extraction-run' && record.id === id,
    )
    if (run === undefined) throw new CorruptMemoryStoreError('Mind Garden extraction audit is missing')
    await this.writeRecord(storedExtractionRunSchema.parse({
      ...run,
      status: 'failed',
      failure,
      ...(rawOutput === undefined ? {} : { rawOutput }),
      updatedAt: Math.max(Date.now(), run.updatedAt),
    }))
    await this.pruneExtractionRuns(await this.readRecords())
  }

  /** Normalize model-authored candidate text only for exact duplicate suppression. */
  private normalizedCandidateContent(value: string): string {
    return value.trim().replace(/\s+/gu, ' ').replace(/[.!。！]+$/gu, '').toLocaleLowerCase()
  }

  /** Reject diagnostic or hidden-cause claims from the candidate queue. */
  private forbiddenInference(value: string): boolean {
    return FORBIDDEN_INFERENCE_PATTERN.test(value)
  }

  /** Select a bounded recall and persist its audit before releasing plaintext to the loop. */
  private async prepareRecall(
    agent: Agent,
    query: string,
  ): Promise<MemoryRecall | null> {
    const records = await this.readRecords()
    const now = Date.now()
    const recall = retrieveMemories({
      memories: records.flatMap(record => record.recordType === 'memory' ? [record] : []),
      query,
      now,
      maxMemories: this.options.maxInjectedMemories,
      maxBytes: this.options.maxInjectedBytes,
    })
    const id = randomUUID()
    const audit = storedAuditSchema.parse({
      recordType: 'retrieval-audit',
      formatVersion: 1,
      id,
      sessionId: agent.session.id,
      createdAt: now,
      sentToModel: recall !== null,
      matches: recall?.matches.map(match => ({
        memoryId: match.memory.id,
        reason: match.reason,
        score: match.score,
      })) ?? [],
    })
    await this.writeRecord(audit)
    await this.pruneAudits([...records, audit])
    return recall
  }

  /** Keep the newest configured number of audits without counting memory records. */
  private async pruneAudits(records: readonly StoredMindGardenMemoryRecord[]): Promise<void> {
    const audits = records.flatMap(record => record.recordType === 'retrieval-audit' ? [record] : [])
      .sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id))
    for (const audit of audits.slice(this.options.maxAuditEntries)) {
      await this.ctx.mindGardenVault.delete('memories', MindGardenVaultRecordId(audit.id))
    }
  }

  /** Keep the newest settled extraction audits without deleting live recovery state. */
  private async pruneExtractionRuns(records: readonly StoredMindGardenMemoryRecord[]): Promise<void> {
    const settledById = new Map<string, StoredExtractionRun>()
    for (const record of records) {
      if (record.recordType !== 'extraction-run'
        || (record.status !== 'completed' && record.status !== 'failed')) continue
      const previous = settledById.get(record.id)
      if (previous === undefined || record.updatedAt >= previous.updatedAt) {
        settledById.set(record.id, record)
      }
    }
    const runs = [...settledById.values()]
      .sort((left, right) => right.updatedAt - left.updatedAt || right.id.localeCompare(left.id))
    for (const run of runs.slice(this.options.maxExtractionRunEntries)) {
      await this.ctx.mindGardenVault.delete('memories', MindGardenVaultRecordId(run.id))
    }
  }

  /** Convert only known validation and encrypted-boundary failures; preserve programming errors. */
  private convertFailure<E extends MindGardenMemoryFailure>(error: unknown): MindGardenMemoryRejected<E> {
    if (error instanceof MemoryBusinessError) return rejected(error.failure as E)
    if (error instanceof CorruptMemoryStoreError) {
      return rejected({ code: 'vault-unavailable', state: 'corrupt-state' } as E)
    }
    if (error instanceof MindGardenVaultError) {
      const state: MindGardenMemoryVaultUnavailable['state'] =
        error.code === 'locked' ? 'locked'
          : error.code === 'invalid-key' ? 'invalid-key'
            : error.code === 'key-mismatch' ? 'key-mismatch'
              : 'corrupt-state'
      return rejected({ code: 'vault-unavailable', state } as E)
    }
    throw error
  }

  /** Serialize every complete read/compare/write and retrieval-audit transaction. */
  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-memory: service is disposing'))
    const result = this.operationTail.then(operation)
    this.operationTail = result.then(() => undefined, () => undefined)
    return result
  }

  /** Return a non-secret log diagnostic for a fail-closed retrieval path. */
  private safeDiagnostic(error: unknown): string {
    if (error instanceof MindGardenVaultError) return error.code
    if (error instanceof CorruptMemoryStoreError) return 'corrupt-state'
    return error instanceof Error ? error.name : 'unknown error'
  }
}

export default MindGardenMemoryService
