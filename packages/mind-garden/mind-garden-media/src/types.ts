/**
 * Client-safe contracts for encrypted Mind Garden photo stories.
 * @module @deepseek-ai/dsh-mind-garden-media/types
 */

import type { ImageAdmissionErrorCode, ImageAttachmentRef, ImageMediaType } from '@deepseek-ai/dsh-attachment'
import type { Branded } from '@deepseek-ai/dsh-brand'

/** Stable profile-wide identity of one photo story. */
export type MindGardenMediaId = Branded<'MindGardenMediaId'>

/** Equality-only token replaced by each mutable media change. */
export type MindGardenMediaVersion = Branded<'MindGardenMediaVersion'>

/** Stable identity of one encrypted model observation attached to a photo story. */
export type MindGardenPhotoObservationId = Branded<'MindGardenPhotoObservationId'>

/** Stable identity of one encrypted turn in a photo-owned conversation. */
export type MindGardenPhotoDialogueTurnId = Branded<'MindGardenPhotoDialogueTurnId'>

/** Browser-observed civil date retained with one photo story. */
export interface MindGardenMediaStamp {
  readonly localDate: string
  readonly timeZone: string
  readonly utcOffsetMinutes: number
}

/** User-selectable particle presentation preset. */
export type MindGardenPhotoParticlePreset = 'soft' | 'dust' | 'fluid' | 'nebula'

/** Complete bounded presentation configuration for a particle photograph. */
export interface MindGardenPhotoParticleConfig {
  readonly version: 1
  readonly preset: MindGardenPhotoParticlePreset
  readonly rendering: {
    readonly quality: 'low' | 'medium' | 'high'
    readonly pointSize: number
    readonly density: number
    readonly opacity: number
    readonly preserveColors: boolean
    readonly background: string
  }
  readonly depth: { readonly strength: number; readonly randomness: number }
  readonly interaction: {
    readonly mode: 'repel' | 'attract' | 'vortex' | 'wave'
    readonly radius: number
    readonly strength: number
    readonly velocityInfluence: number
    readonly vortexStrength: number
    readonly clickBurst: boolean
  }
  readonly physics: {
    readonly spring: number
    readonly damping: number
    readonly maxVelocity: number
    readonly maxDistance: number
    readonly turbulence: number
  }
  readonly animation: {
    readonly idleStrength: number
    readonly idleSpeed: number
    readonly paperStrength: number
    readonly paperSpeed: number
  }
  readonly effects: {
    readonly saturation: number
    readonly exposure: number
    readonly tint: string
    readonly tintMix: number
    readonly bloom: number
    readonly vignette: number
  }
}

/** Frozen, explicitly unconfirmed visual grounding produced from one image send. */
export interface MindGardenPhotoObservation {
  readonly id: MindGardenPhotoObservationId
  readonly grounding: {
    readonly visualSummary: string
    readonly visibleElements: readonly string[]
    readonly textInImage: readonly string[]
    readonly uncertainDetails: readonly string[]
    readonly source: 'model-observation-unconfirmed'
  }
  readonly opening: string
  readonly provider: string
  readonly model: string
  readonly promptVersion: 'mind-garden-photo-observe-v1'
  readonly createdAt: number
}

/** One recoverable user or assistant message scoped to a single photo story. */
export interface MindGardenPhotoDialogueTurn {
  readonly id: MindGardenPhotoDialogueTurnId
  readonly role: 'user' | 'assistant'
  readonly content: string
  readonly quickReplyKind: '' | 'remember' | 'detail' | 'correct'
  readonly createdAt: number
}

/** First-person continuation that can be sent without rewriting it. */
export interface MindGardenPhotoQuickReply {
  readonly kind: 'remember' | 'detail' | 'correct'
  readonly label: string
}

/** Detached encrypted-at-rest story metadata with an immutable attachment reference. */
export interface MindGardenPhotoStory {
  readonly type: 'photo-story'
  readonly id: MindGardenMediaId
  readonly version: MindGardenMediaVersion
  readonly attachment: ImageAttachmentRef
  readonly title: string
  readonly note: string
  readonly stamp: MindGardenMediaStamp
  readonly particleConfig: MindGardenPhotoParticleConfig
  readonly observation: MindGardenPhotoObservation | null
  readonly turns: readonly MindGardenPhotoDialogueTurn[]
  readonly quickReplies: readonly MindGardenPhotoQuickReply[]
  readonly createdAt: number
  readonly updatedAt: number
}

/** Create a story from canonical base64 image bytes. */
export interface MindGardenCreatePhotoStoryRequest {
  readonly data: string
  readonly mediaType: ImageMediaType
  readonly name?: string
  readonly title?: string
  readonly note?: string
  readonly stamp: MindGardenMediaStamp
  readonly particleConfig?: MindGardenPhotoParticleConfig
}

/** Query recent stories in newest-first order. */
export interface MindGardenListPhotoStoriesRequest {
  readonly limit?: number
}

/** Bounded photo-story list. */
export interface MindGardenPhotoStoryListValue {
  readonly stories: readonly MindGardenPhotoStory[]
}

/** Read verified bytes for one story-owned attachment. */
export interface MindGardenReadPhotoStoryRequest {
  readonly id: MindGardenMediaId
}

/** Verified image bytes encoded for the JSON Remote transport. */
export interface MindGardenPhotoStoryImageValue {
  readonly attachment: ImageAttachmentRef
  readonly data: string
}

/** Update story copy or particle presentation after observing its version. */
export interface MindGardenUpdatePhotoStoryRequest {
  readonly id: MindGardenMediaId
  readonly ifVersion: MindGardenMediaVersion
  readonly title?: string
  readonly note?: string
  readonly particleConfig?: MindGardenPhotoParticleConfig
}

/** Delete story metadata after observing its version. */
export interface MindGardenDeletePhotoStoryRequest {
  readonly id: MindGardenMediaId
  readonly ifVersion: MindGardenMediaVersion
}

/** Send one story-owned image to an explicitly selected vision-capable model. */
export interface MindGardenObservePhotoStoryRequest {
  readonly id: MindGardenMediaId
  readonly ifVersion: MindGardenMediaVersion
  readonly provider?: string
  readonly model?: string
}

/** Continue from frozen visual grounding without sending the image again. */
export interface MindGardenContinuePhotoStoryRequest {
  readonly id: MindGardenMediaId
  readonly ifVersion: MindGardenMediaVersion
  readonly content: string
  readonly quickReplyKind?: '' | 'remember' | 'detail' | 'correct'
  readonly provider?: string
  readonly model?: string
}

/** Stable absent postcondition for safe delete retries. */
export interface MindGardenDeletePhotoStoryValue {
  readonly absent: true
}

/** The operation requires an activated durable Mind Garden Session. */
export interface MindGardenMediaAccessDenied {
  readonly code: 'mind-garden-not-active' | 'durable-session-required'
}

/** Encrypted metadata could not be authenticated. */
export interface MindGardenMediaVaultUnavailable {
  readonly code: 'vault-unavailable'
  readonly state: 'locked' | 'invalid-key' | 'key-mismatch' | 'corrupt-state'
}

/** A request field failed media-domain validation. */
export interface MindGardenMediaInvalidField {
  readonly code: 'invalid-field'
  readonly field: 'data' | 'name' | 'title' | 'note' | 'message' | 'stamp' | 'particleConfig' | 'limit' | 'mutation'
  readonly reason: 'invalid' | 'blank' | 'too-large'
  readonly maxBytes?: number
}

/** Attachment admission rejected caller-provided image bytes. */
export interface MindGardenMediaAttachmentRejected {
  readonly code: 'attachment-rejected'
  readonly reason: ImageAdmissionErrorCode
}

/** A previously admitted attachment is unavailable or failed integrity verification. */
export interface MindGardenMediaAttachmentUnavailable {
  readonly code: 'attachment-unavailable'
}

/** The addressed photo story does not exist. */
export interface MindGardenPhotoStoryNotFound {
  readonly code: 'photo-story-not-found'
  readonly id: MindGardenMediaId
}

/** A mutation observed a stale equality-only version. */
export interface MindGardenPhotoStoryVersionConflict {
  readonly code: 'photo-story-version-conflict'
  readonly current: MindGardenPhotoStory
}

/** No usable model route was configured for this auxiliary photo flow. */
export interface MindGardenPhotoModelUnavailable {
  readonly code: 'photo-model-unavailable'
}

/** The selected model explicitly declares that image input is unsupported. */
export interface MindGardenPhotoImageUnsupported {
  readonly code: 'photo-image-unsupported'
  readonly provider: string
  readonly model: string
}

/** The selected model failed before a complete valid response was available. */
export interface MindGardenPhotoModelFailed {
  readonly code: 'photo-model-failed'
}

/** The complete provider response did not satisfy the photo contract. */
export interface MindGardenPhotoOutputInvalid {
  readonly code: 'photo-output-invalid'
}

/** Another photo observation or dialogue request already owns the model lane. */
export interface MindGardenPhotoModelInProgress {
  readonly code: 'photo-model-in-progress'
}

/** The story already owns a completed visual observation. */
export interface MindGardenPhotoObservationComplete {
  readonly code: 'photo-observation-complete'
}

/** A conversation cannot begin before a successful visual observation. */
export interface MindGardenPhotoObservationRequired {
  readonly code: 'photo-observation-required'
}

/** One photo story reached its bounded recoverable conversation capacity. */
export interface MindGardenPhotoDialogueLimitReached {
  readonly code: 'photo-dialogue-limit-reached'
  readonly maxTurns: number
}

/** The complete bounded prompt would exceed the configured auxiliary-call limit. */
export interface MindGardenPhotoInputTooLarge {
  readonly code: 'photo-input-too-large'
  readonly maxBytes: number
}

/** All stable business failures exposed by this package. */
export type MindGardenMediaFailure =
  | MindGardenMediaAccessDenied
  | MindGardenMediaVaultUnavailable
  | MindGardenMediaInvalidField
  | MindGardenMediaAttachmentRejected
  | MindGardenMediaAttachmentUnavailable
  | MindGardenPhotoStoryNotFound
  | MindGardenPhotoStoryVersionConflict
  | MindGardenPhotoModelUnavailable
  | MindGardenPhotoImageUnsupported
  | MindGardenPhotoModelFailed
  | MindGardenPhotoOutputInvalid
  | MindGardenPhotoModelInProgress
  | MindGardenPhotoObservationComplete
  | MindGardenPhotoObservationRequired
  | MindGardenPhotoDialogueLimitReached
  | MindGardenPhotoInputTooLarge

/** Successful public operation result. */
export interface MindGardenMediaSuccess<T> {
  readonly ok: true
  readonly value: T
}

/** Rejected public operation result. */
export interface MindGardenMediaRejected<E extends MindGardenMediaFailure> {
  readonly ok: false
  readonly error: E
}

/** Result of creating one photo story. */
export type MindGardenCreatePhotoStoryResult =
  | MindGardenMediaSuccess<MindGardenPhotoStory>
  | MindGardenMediaRejected<
    | MindGardenMediaAccessDenied
    | MindGardenMediaVaultUnavailable
    | MindGardenMediaInvalidField
    | MindGardenMediaAttachmentRejected
    | MindGardenMediaAttachmentUnavailable
  >

/** Result of listing photo stories. */
export type MindGardenListPhotoStoriesResult =
  | MindGardenMediaSuccess<MindGardenPhotoStoryListValue>
  | MindGardenMediaRejected<MindGardenMediaAccessDenied | MindGardenMediaVaultUnavailable | MindGardenMediaInvalidField>

/** Result of reading one story image. */
export type MindGardenReadPhotoStoryResult =
  | MindGardenMediaSuccess<MindGardenPhotoStoryImageValue>
  | MindGardenMediaRejected<
    MindGardenMediaAccessDenied | MindGardenMediaVaultUnavailable | MindGardenPhotoStoryNotFound | MindGardenMediaAttachmentUnavailable
  >

/** Result of updating one photo story. */
export type MindGardenUpdatePhotoStoryResult =
  | MindGardenMediaSuccess<MindGardenPhotoStory>
  | MindGardenMediaRejected<
    | MindGardenMediaAccessDenied
    | MindGardenMediaVaultUnavailable
    | MindGardenMediaInvalidField
    | MindGardenPhotoStoryNotFound
    | MindGardenPhotoStoryVersionConflict
  >

/** Result of deleting one photo story. */
export type MindGardenDeletePhotoStoryResult =
  | MindGardenMediaSuccess<MindGardenDeletePhotoStoryValue>
  | MindGardenMediaRejected<
    MindGardenMediaAccessDenied | MindGardenMediaVaultUnavailable | MindGardenPhotoStoryVersionConflict
  >

/** Result of one explicit, complete image observation. */
export type MindGardenObservePhotoStoryResult =
  | MindGardenMediaSuccess<MindGardenPhotoStory>
  | MindGardenMediaRejected<
    | MindGardenMediaAccessDenied
    | MindGardenMediaVaultUnavailable
    | MindGardenPhotoStoryNotFound
    | MindGardenPhotoStoryVersionConflict
    | MindGardenMediaAttachmentUnavailable
    | MindGardenPhotoModelUnavailable
    | MindGardenPhotoImageUnsupported
    | MindGardenPhotoModelFailed
    | MindGardenPhotoOutputInvalid
    | MindGardenPhotoModelInProgress
    | MindGardenPhotoObservationComplete
    | MindGardenPhotoInputTooLarge
  >

/** Result of one complete photo-owned dialogue exchange. */
export type MindGardenContinuePhotoStoryResult =
  | MindGardenMediaSuccess<MindGardenPhotoStory>
  | MindGardenMediaRejected<
    | MindGardenMediaAccessDenied
    | MindGardenMediaVaultUnavailable
    | MindGardenMediaInvalidField
    | MindGardenPhotoStoryNotFound
    | MindGardenPhotoStoryVersionConflict
    | MindGardenPhotoModelUnavailable
    | MindGardenPhotoModelFailed
    | MindGardenPhotoOutputInvalid
    | MindGardenPhotoModelInProgress
    | MindGardenPhotoObservationRequired
    | MindGardenPhotoDialogueLimitReached
    | MindGardenPhotoInputTooLarge
  >
