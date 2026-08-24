/**
 * Client-safe contracts for governed Mind Garden memories.
 * @module @deepseek-ai/dsh-mind-garden/memory/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'
import type { MessageId } from '@deepseek-ai/dsh-llm/brand'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Stable profile-wide identity of one memory. */
export type MindGardenMemoryId = Branded<'MindGardenMemoryId'>

/** Equality-only token replaced by each material mutation. */
export type MindGardenMemoryVersion = Branded<'MindGardenMemoryVersion'>

/** User-meaningful memory category; it never implies a psychological diagnosis. */
export type MindGardenMemoryKind =
  | 'fact'
  | 'preference'
  | 'value'
  | 'support-preference'
  | 'decision'
  | 'emotion'
  | 'episode'

/** User-owned privacy classification. */
export type MindGardenMemorySensitivity = 'normal' | 'high'

/** Whether a confirmed memory may enter later model requests. */
export type MindGardenMemoryRecallPolicy = 'never' | 'relevant' | 'always'

/** Current lifecycle state. `expired` is projected from an elapsed temporary record. */
export type MindGardenMemoryStatus =
  | 'candidate'
  | 'confirmed'
  | 'temporary'
  | 'rejected'
  | 'superseded'
  | 'expired'

/** How one confirmation-gated candidate entered the review queue. */
export type MindGardenMemoryProposalOrigin = 'human' | 'model-extraction' | 'legacy-import'

/** Non-authoritative relationship suggested for explicit human review. */
export type MindGardenMemoryRelationshipType = 'duplicate' | 'contradiction' | 'refinement'

/** User-owned disposition of one suggested relationship. */
export type MindGardenMemoryRelationshipResolution =
  | 'keep-existing'
  | 'keep-both'
  | 'replace-existing'

/** Suggested relationship between one candidate and an active memory. */
export interface MindGardenMemoryRelationship {
  readonly type: MindGardenMemoryRelationshipType
  readonly targetMemoryId: MindGardenMemoryId
  /** Target version that the suggestion actually compared. */
  readonly targetVersion: MindGardenMemoryVersion
  readonly rationale: string
  readonly status: 'pending' | 'resolved'
  readonly resolution?: MindGardenMemoryRelationshipResolution
}

/** Optional exact user-message evidence attached to a human proposal. */
export interface MindGardenMemorySourceRequest {
  /** User message that contains the evidence. */
  readonly messageId: MessageId
  /** Exact non-blank substring copied from that message. */
  readonly evidenceQuote: string
}

/** Provenance retained in the encrypted record but excluded from model recall text. */
export interface MindGardenMemorySource {
  /** Durable Mind Garden Session where the proposal was made. */
  readonly sessionId: SessionId
  /** Cited user message when the proposer supplied exact evidence. */
  readonly messageId?: MessageId
  /** Exact cited text when the proposer supplied exact evidence. */
  readonly evidenceQuote?: string
}

/** Detached current view of one encrypted profile-wide memory. */
export interface MindGardenMemoryItem {
  readonly id: MindGardenMemoryId
  readonly version: MindGardenMemoryVersion
  readonly status: MindGardenMemoryStatus
  readonly kind: MindGardenMemoryKind
  readonly sensitivity: MindGardenMemorySensitivity
  /** Verbatim user-approved statement. */
  readonly content: string
  /** Why retaining this statement may help future conversations. */
  readonly reason: string
  /** Optional time, topic, or situation boundary. */
  readonly scope?: string
  readonly recallPolicy: MindGardenMemoryRecallPolicy
  readonly sources: readonly MindGardenMemorySource[]
  readonly proposalOrigin: MindGardenMemoryProposalOrigin
  /** Model-reported extraction confidence, present only for extracted candidates. */
  readonly confidence?: number
  /** Model-reported future usefulness, present only for extracted candidates. */
  readonly importance?: number
  /** Suggested relationship; it remains non-authoritative until explicitly resolved. */
  readonly relationship?: MindGardenMemoryRelationship
  /** Active memory that absorbed this record through an explicit replacement. */
  readonly supersededBy?: MindGardenMemoryId
  readonly revisionCount: number
  readonly createdAt: number
  readonly updatedAt: number
  readonly confirmedAt?: number
  readonly expiresAt?: number
}

/** Immutable encrypted before-image retained for one material mutation. */
export interface MindGardenMemoryRevision {
  readonly id: MindGardenMemoryVersion
  readonly action: 'confirmed' | 'updated' | 'rejected' | 'superseded' | 'replaced'
  readonly status: Exclude<MindGardenMemoryStatus, 'expired'>
  readonly kind: MindGardenMemoryKind
  readonly sensitivity: MindGardenMemorySensitivity
  readonly content: string
  readonly reason: string
  readonly scope?: string
  readonly recallPolicy: MindGardenMemoryRecallPolicy
  readonly sources: readonly MindGardenMemorySource[]
  readonly createdAt: number
  /** Candidate whose explicit resolution caused this mutation. */
  readonly relatedMemoryId?: MindGardenMemoryId
}

/** Propose a candidate that cannot be recalled until a later confirmation. */
export interface MindGardenMemoryProposeRequest {
  readonly kind: MindGardenMemoryKind
  readonly sensitivity?: MindGardenMemorySensitivity
  readonly content: string
  readonly reason: string
  readonly scope?: string
  readonly source?: MindGardenMemorySourceRequest
}

/** Confirm one candidate permanently or for a bounded number of days. */
export interface MindGardenMemoryConfirmRequest {
  readonly id: MindGardenMemoryId
  readonly ifVersion: MindGardenMemoryVersion
  readonly recallPolicy: MindGardenMemoryRecallPolicy
  /** Presence selects temporary status; absence selects confirmed status. */
  readonly temporaryDays?: number
  /** Optional correction applied atomically with confirmation. */
  readonly content?: string
  /** Optional replacement scope; an empty string removes the scope. */
  readonly scope?: string
}

/** Edit one candidate or active memory with optimistic concurrency. */
export interface MindGardenMemoryUpdateRequest {
  readonly id: MindGardenMemoryId
  readonly ifVersion: MindGardenMemoryVersion
  readonly content?: string
  readonly reason?: string
  /** An empty string removes the scope. */
  readonly scope?: string
  readonly sensitivity?: MindGardenMemorySensitivity
  readonly recallPolicy?: MindGardenMemoryRecallPolicy
}

/** Reject one candidate before it becomes model-recallable. */
export interface MindGardenMemoryRejectRequest {
  readonly id: MindGardenMemoryId
  readonly ifVersion: MindGardenMemoryVersion
}

/** Resolve a suggested relationship without granting the model decision authority. */
export type MindGardenMemoryResolveRelationshipRequest = {
  readonly id: MindGardenMemoryId
  readonly ifVersion: MindGardenMemoryVersion
} & (
  | { readonly resolution: 'keep-existing' }
  | {
    readonly resolution: 'keep-both'
    readonly recallPolicy: MindGardenMemoryRecallPolicy
    readonly temporaryDays?: number
    /** Optional reviewed scope; an empty string removes the candidate scope. */
    readonly scope?: string
  }
  | {
    readonly resolution: 'replace-existing'
    readonly recallPolicy: MindGardenMemoryRecallPolicy
    readonly temporaryDays?: number
    /** Optional reviewed scope; an empty string removes the replacement scope. */
    readonly scope?: string
  }
)

/** Settled candidate plus the active memory retained by the resolution. */
export interface MindGardenMemoryResolveRelationshipValue {
  readonly candidate: MindGardenMemoryItem
  readonly activeMemory: MindGardenMemoryItem
}

/** Address one memory's encrypted revision history. */
export interface MindGardenMemoryListRevisionsRequest {
  readonly id: MindGardenMemoryId
}

/** Oldest-first immutable revision history. */
export interface MindGardenMemoryListRevisionsValue {
  readonly revisions: readonly MindGardenMemoryRevision[]
}

/** Explicitly request one model-assisted review pass over the current transcript. */
export interface MindGardenMemoryExtractRequest {
  /** Optional route override; provider and model must be supplied together. */
  readonly provider?: string
  /** Optional route override; provider and model must be supplied together. */
  readonly model?: string
}

/** User-selected cadence for automatic review after newly completed eligible turns. */
export type MindGardenMemoryAutomationInterval = 1 | 3 | 5

/** Encrypted per-Session automatic-extraction authorization and latest progress. */
export interface MindGardenMemoryAutomationPolicy {
  readonly enabled: boolean
  readonly minimumCompletedTurns: MindGardenMemoryAutomationInterval
  /** Null before this Session has stored an explicit choice. */
  readonly version: MindGardenMemoryVersion | null
  readonly updatedAt: number | null
  readonly lastAttemptedTurn: number
  readonly lastAttemptAt: number | null
  readonly lastOutcome: 'running' | 'completed' | 'failed' | null
}

/** Replace one Session's automatic-extraction authorization using equality-only concurrency. */
export interface MindGardenMemorySetAutomationPolicyRequest {
  readonly enabled: boolean
  readonly minimumCompletedTurns: MindGardenMemoryAutomationInterval
  readonly ifVersion: MindGardenMemoryVersion | null
}

/** Durable metadata for one encrypted auxiliary-model extraction run. */
export interface MindGardenMemoryExtractionRun {
  readonly id: string
  readonly trigger: 'manual' | 'automatic'
  readonly status: 'running' | 'committing' | 'completed' | 'failed'
  readonly provider: string
  readonly model: string
  readonly sourceMessageIds: readonly MessageId[]
  readonly comparedMemoryIds: readonly MindGardenMemoryId[]
  readonly candidateIds: readonly MindGardenMemoryId[]
  readonly createdAt: number
  readonly updatedAt: number
  readonly failure?: 'interrupted' | 'model-failed' | 'invalid-output'
}

/** Completed extraction run and its still-confirmation-gated candidates. */
export interface MindGardenMemoryExtractValue {
  readonly run: MindGardenMemoryExtractionRun
  readonly candidates: readonly MindGardenMemoryItem[]
}

/** Newest encrypted extraction audit for the addressed Session. */
export interface MindGardenMemoryLatestExtractionValue {
  readonly run: MindGardenMemoryExtractionRun | null
}

/** Delete one memory after observing its exact version. */
export interface MindGardenMemoryDeleteRequest {
  readonly id: MindGardenMemoryId
  readonly ifVersion: MindGardenMemoryVersion
}

/** Stable absent postcondition for deletion and safe retries. */
export interface MindGardenMemoryDeleteValue {
  readonly absent: true
  /** Whether the primary encrypted memory record existed and was removed. */
  readonly memoryRecordRemoved: boolean
  /** Whether a content-free marker now prevents an older backup from reviving this id. */
  readonly deletionTombstoneRecorded: boolean
  /** Number of encrypted extraction-run copies whose prompt/output plan was redacted. */
  readonly extractionRunsRedacted: number
  /** Host Session history is governed by the configured Harness provider. */
  readonly sessionHistory: 'retained-by-host'
  /** Copies already processed by a model provider remain provider-controlled. */
  readonly providerCopies: 'provider-controlled'
}

/** Profile-wide list in first-creation order. */
export interface MindGardenMemoryListValue {
  readonly items: readonly MindGardenMemoryItem[]
}

/** Why one memory was selected for a model request. */
export interface MindGardenMemoryRecallMatch {
  readonly memoryId: MindGardenMemoryId
  readonly reason: 'always' | 'relevant'
  /** Deterministic overlap count; zero is reserved for `always`. */
  readonly score: number
}

/** Latest encrypted retrieval audit for the addressed Session. */
export interface MindGardenMemoryRetrievalAudit {
  readonly sessionId: SessionId
  readonly createdAt: number
  /** True only when the recalled plaintext was committed to model-visible context. */
  readonly sentToModel: boolean
  readonly matches: readonly MindGardenMemoryRecallMatch[]
}

/** Latest audit, or null before a retrieval attempt. */
export interface MindGardenMemoryLatestAuditValue {
  readonly audit: MindGardenMemoryRetrievalAudit | null
}

/** The operation requires an activated durable Mind Garden Session. */
export interface MindGardenMemoryAccessDenied {
  readonly code: 'mind-garden-not-active' | 'durable-session-required'
}

/** Encrypted storage could not be authenticated with the configured credential. */
export interface MindGardenMemoryVaultUnavailable {
  readonly code: 'vault-unavailable'
  readonly state: 'locked' | 'invalid-key' | 'key-mismatch' | 'corrupt-state'
}

/** The requested memory does not exist. */
export interface MindGardenMemoryNotFound {
  readonly code: 'memory-not-found'
  readonly id: MindGardenMemoryId
}

/** The mutation observed a stale item version. */
export interface MindGardenMemoryVersionConflict {
  readonly code: 'version-conflict'
  readonly current: MindGardenMemoryItem | null
}

/** An automatic-extraction preference changed after the caller read it. */
export interface MindGardenMemoryAutomationVersionConflict {
  readonly code: 'automation-version-conflict'
  readonly current: MindGardenMemoryAutomationPolicy
}

/** The requested mutation is not valid from the current lifecycle state. */
export interface MindGardenMemoryInvalidTransition {
  readonly code: 'invalid-transition'
  readonly status: MindGardenMemoryStatus
}

/** A related candidate must use the dedicated relationship-resolution operation. */
export interface MindGardenMemoryRelationshipReviewRequired {
  readonly code: 'relationship-review-required'
}

/** The candidate has no pending relationship to resolve. */
export interface MindGardenMemoryRelationshipNotPending {
  readonly code: 'relationship-not-pending'
}

/** The compared target changed or stopped being active before the decision. */
export interface MindGardenMemoryRelationshipStale {
  readonly code: 'relationship-stale'
  readonly current: MindGardenMemoryItem | null
}

/** A required text field contains no non-whitespace character. */
export interface MindGardenMemoryFieldBlank {
  readonly code: 'field-blank'
  readonly field: 'content' | 'reason' | 'evidenceQuote'
}

/** One text field exceeds its complete UTF-8 bound. */
export interface MindGardenMemoryFieldTooLarge {
  readonly code: 'field-too-large'
  readonly field: 'content' | 'reason' | 'scope' | 'evidenceQuote'
  readonly maxBytes: number
  readonly actualBytes: number
}

/** Supplied evidence does not exactly match the addressed user message. */
export interface MindGardenMemorySourceInvalid {
  readonly code: 'source-invalid'
}

/** A temporary lifetime is outside the configured whole-day range. */
export interface MindGardenMemoryTemporaryPeriodInvalid {
  readonly code: 'temporary-period-invalid'
  readonly maxDays: number
}

/** High-sensitivity memories are never eligible for model recall. */
export interface MindGardenMemoryHighSensitivityRecall {
  readonly code: 'high-sensitivity-recall-forbidden'
}

/** The content resembles a credential that should not be retained as a memory. */
export interface MindGardenMemoryCredentialLikeContent {
  readonly code: 'credential-like-content'
}

/** No eligible human-authored text exists in the current transcript. */
export interface MindGardenMemoryExtractionNoSource {
  readonly code: 'extraction-no-source'
}

/** No complete eligible human message fits the configured extraction input bound. */
export interface MindGardenMemoryExtractionInputTooLarge {
  readonly code: 'extraction-input-too-large'
  readonly maxBytes: number
}

/** No complete provider/model pair can be resolved for the auxiliary call. */
export interface MindGardenMemoryExtractionModelUnavailable {
  readonly code: 'extraction-model-unavailable'
}

/** The auxiliary model call failed or ended before a complete response. */
export interface MindGardenMemoryExtractionModelFailed {
  readonly code: 'extraction-model-failed'
}

/** The auxiliary model returned no strictly reviewable candidate envelope. */
export interface MindGardenMemoryExtractionOutputInvalid {
  readonly code: 'extraction-output-invalid'
}

/** This Session already has a live extraction request. */
export interface MindGardenMemoryExtractionInProgress {
  readonly code: 'extraction-in-progress'
}

/** All stable business failures exposed by this package. */
export type MindGardenMemoryFailure =
  | MindGardenMemoryAccessDenied
  | MindGardenMemoryVaultUnavailable
  | MindGardenMemoryNotFound
  | MindGardenMemoryVersionConflict
  | MindGardenMemoryInvalidTransition
  | MindGardenMemoryRelationshipReviewRequired
  | MindGardenMemoryRelationshipNotPending
  | MindGardenMemoryRelationshipStale
  | MindGardenMemoryFieldBlank
  | MindGardenMemoryFieldTooLarge
  | MindGardenMemorySourceInvalid
  | MindGardenMemoryTemporaryPeriodInvalid
  | MindGardenMemoryHighSensitivityRecall
  | MindGardenMemoryCredentialLikeContent
  | MindGardenMemoryExtractionNoSource
  | MindGardenMemoryExtractionInputTooLarge
  | MindGardenMemoryExtractionModelUnavailable
  | MindGardenMemoryExtractionModelFailed
  | MindGardenMemoryExtractionOutputInvalid
  | MindGardenMemoryExtractionInProgress
  | MindGardenMemoryAutomationVersionConflict

/** Successful public operation result. */
export interface MindGardenMemorySuccess<T> {
  readonly ok: true
  readonly value: T
}

/** Rejected public operation result. */
export interface MindGardenMemoryRejected<E extends MindGardenMemoryFailure> {
  readonly ok: false
  readonly error: E
}

/** Result of listing the current encrypted profile-memory view. */
export type MindGardenMemoryListResult =
  | MindGardenMemorySuccess<MindGardenMemoryListValue>
  | MindGardenMemoryRejected<MindGardenMemoryAccessDenied | MindGardenMemoryVaultUnavailable>

/** Result of proposing one confirmation-gated candidate. */
export type MindGardenMemoryProposeResult =
  | MindGardenMemorySuccess<MindGardenMemoryItem>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryFieldBlank
    | MindGardenMemoryFieldTooLarge
    | MindGardenMemorySourceInvalid
    | MindGardenMemoryCredentialLikeContent
  >

/** Result of confirming a candidate and selecting its recall policy. */
export type MindGardenMemoryConfirmResult =
  | MindGardenMemorySuccess<MindGardenMemoryItem>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryNotFound
    | MindGardenMemoryVersionConflict
    | MindGardenMemoryInvalidTransition
    | MindGardenMemoryFieldBlank
    | MindGardenMemoryFieldTooLarge
    | MindGardenMemoryTemporaryPeriodInvalid
    | MindGardenMemoryHighSensitivityRecall
    | MindGardenMemoryCredentialLikeContent
    | MindGardenMemoryRelationshipReviewRequired
  >

/** Result of editing one mutable candidate or active memory. */
export type MindGardenMemoryUpdateResult = MindGardenMemoryConfirmResult

/** Result of rejecting one unconfirmed candidate. */
export type MindGardenMemoryRejectResult =
  | MindGardenMemorySuccess<MindGardenMemoryItem>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryNotFound
    | MindGardenMemoryVersionConflict
    | MindGardenMemoryInvalidTransition
  >

/** Result of making one memory durably absent. */
export type MindGardenMemoryDeleteResult =
  | MindGardenMemorySuccess<MindGardenMemoryDeleteValue>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryVersionConflict
  >

/** Result of reading the addressed Session's latest retrieval audit. */
export type MindGardenMemoryLatestAuditResult =
  | MindGardenMemorySuccess<MindGardenMemoryLatestAuditValue>
  | MindGardenMemoryRejected<MindGardenMemoryAccessDenied | MindGardenMemoryVaultUnavailable>

/** Result of explicitly settling one suggested duplicate, contradiction, or refinement. */
export type MindGardenMemoryResolveRelationshipResult =
  | MindGardenMemorySuccess<MindGardenMemoryResolveRelationshipValue>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryNotFound
    | MindGardenMemoryVersionConflict
    | MindGardenMemoryInvalidTransition
    | MindGardenMemoryRelationshipNotPending
    | MindGardenMemoryRelationshipStale
    | MindGardenMemoryFieldBlank
    | MindGardenMemoryFieldTooLarge
    | MindGardenMemoryTemporaryPeriodInvalid
    | MindGardenMemoryHighSensitivityRecall
    | MindGardenMemoryCredentialLikeContent
  >

/** Result of reading one memory's encrypted before-image history. */
export type MindGardenMemoryListRevisionsResult =
  | MindGardenMemorySuccess<MindGardenMemoryListRevisionsValue>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryNotFound
  >

/** Result of one explicit model-assisted candidate extraction. */
export type MindGardenMemoryExtractResult =
  | MindGardenMemorySuccess<MindGardenMemoryExtractValue>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryExtractionNoSource
    | MindGardenMemoryExtractionInputTooLarge
    | MindGardenMemoryExtractionModelUnavailable
    | MindGardenMemoryExtractionModelFailed
    | MindGardenMemoryExtractionOutputInvalid
    | MindGardenMemoryExtractionInProgress
  >

/** Result of reading the current Session's newest encrypted extraction audit. */
export type MindGardenMemoryLatestExtractionResult =
  | MindGardenMemorySuccess<MindGardenMemoryLatestExtractionValue>
  | MindGardenMemoryRejected<MindGardenMemoryAccessDenied | MindGardenMemoryVaultUnavailable>

/** Result of reading this Session's automatic-extraction authorization. */
export type MindGardenMemoryAutomationPolicyResult =
  | MindGardenMemorySuccess<MindGardenMemoryAutomationPolicy>
  | MindGardenMemoryRejected<MindGardenMemoryAccessDenied | MindGardenMemoryVaultUnavailable>

/** Result of replacing this Session's automatic-extraction authorization. */
export type MindGardenMemorySetAutomationPolicyResult =
  | MindGardenMemorySuccess<MindGardenMemoryAutomationPolicy>
  | MindGardenMemoryRejected<
    | MindGardenMemoryAccessDenied
    | MindGardenMemoryVaultUnavailable
    | MindGardenMemoryAutomationVersionConflict
  >
