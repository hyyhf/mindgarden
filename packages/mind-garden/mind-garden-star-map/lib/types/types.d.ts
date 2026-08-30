/**
 * Client-safe contracts for the encrypted Mind Garden Star Map.
 * @module @deepseek-ai/dsh-mind-garden/star-map/types
 */
import type { Branded } from '@deepseek-ai/dsh-brand';
/** Equality-only token replaced by each profile mutation. */
export type MindGardenStarProfileVersion = Branded<'MindGardenStarProfileVersion'>;
/** Stable identity of one governed constellation trait. */
export type MindGardenStarTraitId = Branded<'MindGardenStarTraitId'>;
/** Equality-only token replaced by each trait mutation. */
export type MindGardenStarTraitVersion = Branded<'MindGardenStarTraitVersion'>;
/** Stable identity of one evidence-bound Star Observer card. */
export type MindGardenStarCardId = Branded<'MindGardenStarCardId'>;
/** Equality-only token replaced by each card mutation. */
export type MindGardenStarCardVersion = Branded<'MindGardenStarCardVersion'>;
/** Stable identity of one frozen evidence excerpt attached to a card. */
export type MindGardenStarEvidenceId = Branded<'MindGardenStarEvidenceId'>;
/** Stable identity of one encrypted dialogue turn attached to a Star Observer card. */
export type MindGardenStarDialogueTurnId = Branded<'MindGardenStarDialogueTurnId'>;
/** Stable identity of one model-proposed card revision awaiting a user decision. */
export type MindGardenStarCardRevisionId = Branded<'MindGardenStarCardRevisionId'>;
/** User-selected voice for future Star Observer conversations. */
export type MindGardenStarObserverTone = 'gentle' | 'direct' | 'mystic';
/** How the user wants to supply or defer an MBTI self-description. */
export type MindGardenStarMbtiMode = 'known' | 'scenes' | 'observe';
/** One answer in the optional six-scene self-description. */
export type MindGardenStarSceneAnswer = '1a' | '1b' | '2a' | '2b' | '3a' | '3b' | '4a' | '4b' | '5a' | '5b' | '6a' | '6b';
/** Explicit future-use authorizations retained in the Star Map profile. */
export interface MindGardenStarDataPermissions {
    readonly dailyReflections: boolean;
    readonly confirmedMemories: boolean;
    readonly openQuestions: boolean;
    readonly periodReviews: boolean;
}
/** Durable, user-controlled Star Map profile and ritual progress. */
export interface MindGardenStarProfile {
    readonly version: MindGardenStarProfileVersion | null;
    readonly onboardingStage: 0 | 1 | 2 | 3;
    readonly onboardingCompleted: boolean;
    readonly displayName: string;
    readonly birthMonth: number | null;
    readonly birthDay: number | null;
    readonly birthYear: number | null;
    readonly birthTime: string;
    readonly birthTimeKnown: boolean;
    readonly birthCity: string;
    readonly birthCityKnown: boolean;
    readonly mbtiMode: MindGardenStarMbtiMode;
    readonly mbtiType: string;
    readonly mbtiAnswers: readonly MindGardenStarSceneAnswer[];
    readonly selfWords: readonly string[];
    readonly observationIntent: string;
    readonly observerTone: MindGardenStarObserverTone;
    readonly permissions: MindGardenStarDataPermissions;
    readonly reducedMotion: boolean;
    readonly createdAt: number | null;
    readonly updatedAt: number | null;
}
/** Lifecycle of one candidate or user-confirmed constellation trait. */
export type MindGardenStarTraitStatus = 'self-reported' | 'pending' | 'confirmed' | 'uncertain' | 'rejected' | 'retired';
/** Semantic family used to place a trait in the constellation. */
export type MindGardenStarTraitKind = 'strength' | 'tension' | 'pattern' | 'unfolded';
/** Stable card deck names; localized labels remain a Client concern. */
export type MindGardenStarDeck = 'current-self' | 'unfolded-self' | 'inner-debate';
/** Whether a card is still being reviewed, retained in the constellation, or dismissed. */
export type MindGardenStarCardStatus = 'draft' | 'saved' | 'dissolved';
/** Historical material families that can be released only by explicit profile permission. */
export type MindGardenStarEvidenceType = 'daily-reflection' | 'confirmed-memory' | 'open-question' | 'period-review';
/** One immutable, authenticated source excerpt frozen into an encrypted card. */
export interface MindGardenStarEvidence {
    readonly id: MindGardenStarEvidenceId;
    readonly sourceType: MindGardenStarEvidenceType;
    readonly sourceId: string;
    readonly summary: string;
}
/** Four non-overlapping analysis jobs rendered on the front of a card. */
export interface MindGardenStarCardAnalysis {
    readonly situation: string;
    readonly coreIssue: string;
    readonly tradeoff: string;
    readonly guidance: string;
}
/** User calibration retained separately from model-authored card copy. */
export interface MindGardenStarCardCalibration {
    readonly verdict: 'resonates' | 'uncertain' | 'rejects';
    readonly correction: string;
    readonly createdAt: number;
}
/** One recoverable user or Observer message in a card-owned conversation. */
export interface MindGardenStarDialogueTurn {
    readonly id: MindGardenStarDialogueTurnId;
    readonly role: 'user' | 'assistant';
    readonly content: string;
    readonly quickReplyKind: '' | 'deepen' | 'shift' | 'correct';
    readonly createdAt: number;
}
/** One first-person continuation offered by the Observer after a reply. */
export interface MindGardenStarQuickReply {
    readonly kind: 'deepen' | 'shift' | 'correct';
    readonly label: string;
}
/** Complete model-authored rewrite that remains inert until the user accepts it. */
export interface MindGardenStarCardRevision {
    readonly id: MindGardenStarCardRevisionId;
    readonly title: string;
    readonly frontText: string;
    readonly analysis: MindGardenStarCardAnalysis;
    readonly openQuestion: string;
    readonly traitKind: MindGardenStarTraitKind;
    readonly symbolicBasis: readonly string[];
    readonly confidence: number;
    readonly createdAt: number;
}
/** Encrypted evidence-bound card created by the auxiliary Star Observer. */
export interface MindGardenStarCard {
    readonly id: MindGardenStarCardId;
    readonly version: MindGardenStarCardVersion;
    readonly status: MindGardenStarCardStatus;
    readonly deck: MindGardenStarDeck;
    readonly observerTone: MindGardenStarObserverTone;
    readonly question: string;
    readonly title: string;
    readonly frontText: string;
    readonly analysis: MindGardenStarCardAnalysis;
    readonly openQuestion: string;
    readonly cardKind: 'observation' | 'imagination';
    readonly traitKind: MindGardenStarTraitKind;
    readonly symbolicBasis: readonly string[];
    readonly evidence: readonly MindGardenStarEvidence[];
    readonly confidence: number;
    readonly calibration: MindGardenStarCardCalibration | null;
    readonly traitId: MindGardenStarTraitId | null;
    readonly turns: readonly MindGardenStarDialogueTurn[];
    readonly quickReplies: readonly MindGardenStarQuickReply[];
    readonly pendingRevision: MindGardenStarCardRevision | null;
    readonly provider: string;
    readonly model: string;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** One encrypted trait whose status cannot be upgraded without a user operation. */
export interface MindGardenStarTrait {
    readonly id: MindGardenStarTraitId;
    readonly version: MindGardenStarTraitVersion;
    readonly kind: MindGardenStarTraitKind;
    readonly status: MindGardenStarTraitStatus;
    readonly label: string;
    readonly description: string;
    readonly confidence: number;
    readonly source: 'ritual-self-report' | 'star-observer';
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** Complete current Star Map projection. */
export interface MindGardenStarMapOverview {
    readonly profile: MindGardenStarProfile;
    readonly traits: readonly MindGardenStarTrait[];
    readonly cards: readonly MindGardenStarCard[];
    readonly activeCard: MindGardenStarCard | null;
}
/** Complete replace-style input shared by ritual and profile mutations. */
export interface MindGardenStarProfileInput {
    readonly displayName: string;
    readonly birthMonth: number | null;
    readonly birthDay: number | null;
    readonly birthYear: number | null;
    readonly birthTime: string;
    readonly birthTimeKnown: boolean;
    readonly birthCity: string;
    readonly birthCityKnown: boolean;
    readonly mbtiMode: MindGardenStarMbtiMode;
    readonly mbtiType: string;
    readonly mbtiAnswers: readonly MindGardenStarSceneAnswer[];
    readonly selfWords: readonly string[];
    readonly observationIntent: string;
    readonly observerTone: MindGardenStarObserverTone;
    readonly permissions: MindGardenStarDataPermissions;
    readonly reducedMotion: boolean;
}
/** Save resumable ritual progress against the currently observed profile version. */
export interface MindGardenSaveStarRitualRequest extends MindGardenStarProfileInput {
    readonly onboardingStage: 0 | 1 | 2;
    readonly ifVersion: MindGardenStarProfileVersion | null;
}
/** Complete the ritual and create only user-authored self-report stars. */
export interface MindGardenCompleteStarRitualRequest extends MindGardenStarProfileInput {
    readonly ifVersion: MindGardenStarProfileVersion | null;
}
/** Replace the completed Star Map profile without changing governed traits. */
export interface MindGardenUpdateStarProfileRequest extends MindGardenStarProfileInput {
    readonly ifVersion: MindGardenStarProfileVersion;
}
/** Decide or correct one constellation trait under equality-only versioning. */
export interface MindGardenUpdateStarTraitRequest {
    readonly id: MindGardenStarTraitId;
    readonly ifVersion: MindGardenStarTraitVersion;
    readonly status: MindGardenStarTraitStatus;
    readonly label?: string;
    readonly description?: string;
}
/** Draw one governed card against a frozen, permission-bounded evidence snapshot. */
export interface MindGardenDrawStarCardRequest {
    readonly deck: MindGardenStarDeck | 'random';
    readonly question: string;
    readonly observedLocalDate: string;
    readonly observerTone?: MindGardenStarObserverTone;
    readonly provider?: string;
    readonly model?: string;
}
/** Calibrate one draft card and create or revise only its linked governed trait. */
export interface MindGardenCalibrateStarCardRequest {
    readonly id: MindGardenStarCardId;
    readonly ifVersion: MindGardenStarCardVersion;
    readonly verdict: MindGardenStarCardCalibration['verdict'];
    readonly correction?: string;
}
/** Save or dissolve one reviewed card under equality-only card versioning. */
export interface MindGardenFinalizeStarCardRequest {
    readonly id: MindGardenStarCardId;
    readonly ifVersion: MindGardenStarCardVersion;
    readonly action: 'save' | 'dissolve';
}
/** Continue a card-owned Observer conversation against the rendered card version. */
export interface MindGardenContinueStarCardRequest {
    readonly id: MindGardenStarCardId;
    readonly ifVersion: MindGardenStarCardVersion;
    readonly content: string;
    readonly quickReplyKind?: '' | 'deepen' | 'shift' | 'correct';
    readonly provider?: string;
    readonly model?: string;
}
/** Explicitly accept the currently rendered model-proposed card revision. */
export interface MindGardenApplyStarCardRevisionRequest {
    readonly id: MindGardenStarCardId;
    readonly ifVersion: MindGardenStarCardVersion;
    readonly revisionId: MindGardenStarCardRevisionId;
}
/** The operation requires an activated durable Mind Garden Session and, for model calls, accepted disclosure. */
export interface MindGardenStarAccessDenied {
    readonly code: 'mind-garden-not-active' | 'durable-session-required' | 'model-disclosure-required';
}
/** Encrypted Star Map state could not be authenticated. */
export interface MindGardenStarVaultUnavailable {
    readonly code: 'vault-unavailable';
    readonly state: 'locked' | 'invalid-key' | 'key-mismatch' | 'corrupt-state';
}
/** A Star Map request field failed domain validation. */
export interface MindGardenStarInvalidField {
    readonly code: 'invalid-field';
    readonly field: 'displayName' | 'onboardingStage' | 'birthDate' | 'birthTime' | 'birthCity' | 'mbti' | 'selfWords' | 'observationIntent' | 'trait' | 'question' | 'message' | 'correction' | 'observedLocalDate';
    readonly reason: 'invalid' | 'blank' | 'too-large' | 'duplicate';
    readonly maxBytes?: number;
}
/** A profile mutation observed a stale equality-only version. */
export interface MindGardenStarProfileVersionConflict {
    readonly code: 'star-profile-version-conflict';
    readonly current: MindGardenStarProfile;
}
/** The requested ritual progress operation cannot change a completed profile. */
export interface MindGardenStarRitualCompleted {
    readonly code: 'star-ritual-completed';
}
/** The requested profile operation requires a completed ritual. */
export interface MindGardenStarRitualRequired {
    readonly code: 'star-ritual-required';
}
/** The addressed trait does not exist. */
export interface MindGardenStarTraitNotFound {
    readonly code: 'star-trait-not-found';
    readonly id: MindGardenStarTraitId;
}
/** A trait mutation observed a stale equality-only version. */
export interface MindGardenStarTraitVersionConflict {
    readonly code: 'star-trait-version-conflict';
    readonly current: MindGardenStarTrait;
}
/** The encrypted aggregate cannot admit another governed trait. */
export interface MindGardenStarTraitLimitReached {
    readonly code: 'star-trait-limit-reached';
    readonly max: number;
}
/** No complete provider/model route is available for an auxiliary observation. */
export interface MindGardenStarObserverModelUnavailable {
    readonly code: 'star-observer-model-unavailable';
}
/** The selected provider failed or returned an incomplete auxiliary response. */
export interface MindGardenStarObserverModelFailed {
    readonly code: 'star-observer-model-failed';
}
/** The provider response did not satisfy the strict Star Observer envelope. */
export interface MindGardenStarObserverOutputInvalid {
    readonly code: 'star-observer-output-invalid';
}
/** Another Star Observer request already owns the single-flight model lane. */
export interface MindGardenStarObservationInProgress {
    readonly code: 'star-observation-in-progress';
}
/** A draft card must be saved or dissolved before drawing another. */
export interface MindGardenStarActiveCardExists {
    readonly code: 'star-active-card-exists';
    readonly current: MindGardenStarCard;
}
/** One authorized encrypted source family could not be read atomically. */
export interface MindGardenStarSourceUnavailable {
    readonly code: 'star-source-unavailable';
    readonly source: MindGardenStarEvidenceType;
}
/** The complete model request would exceed the configured input boundary. */
export interface MindGardenStarObserverInputTooLarge {
    readonly code: 'star-observer-input-too-large';
    readonly maxBytes: number;
}
/** Profile permissions or identity changed while the auxiliary request was running. */
export interface MindGardenStarObserverContextChanged {
    readonly code: 'star-observer-context-changed';
}
/** The addressed card does not exist. */
export interface MindGardenStarCardNotFound {
    readonly code: 'star-card-not-found';
    readonly id: MindGardenStarCardId;
}
/** A card mutation observed a stale equality-only version. */
export interface MindGardenStarCardVersionConflict {
    readonly code: 'star-card-version-conflict';
    readonly current: MindGardenStarCard;
}
/** The requested card action is invalid for its current lifecycle state. */
export interface MindGardenStarCardStateConflict {
    readonly code: 'star-card-state-conflict';
    readonly status: MindGardenStarCardStatus;
}
/** The requested revision is absent or was superseded by a later dialogue turn. */
export interface MindGardenStarCardRevisionConflict {
    readonly code: 'star-card-revision-conflict';
    readonly current: MindGardenStarCard;
}
/** One card reached the bounded recoverable dialogue capacity. */
export interface MindGardenStarDialogueLimitReached {
    readonly code: 'star-dialogue-limit-reached';
    readonly maxTurns: number;
}
/** All stable business failures exposed by this package. */
export type MindGardenStarFailure = MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarProfileVersionConflict | MindGardenStarRitualCompleted | MindGardenStarRitualRequired | MindGardenStarTraitNotFound | MindGardenStarTraitVersionConflict | MindGardenStarTraitLimitReached | MindGardenStarObserverModelUnavailable | MindGardenStarObserverModelFailed | MindGardenStarObserverOutputInvalid | MindGardenStarObservationInProgress | MindGardenStarActiveCardExists | MindGardenStarSourceUnavailable | MindGardenStarObserverInputTooLarge | MindGardenStarObserverContextChanged | MindGardenStarCardNotFound | MindGardenStarCardVersionConflict | MindGardenStarCardStateConflict | MindGardenStarCardRevisionConflict | MindGardenStarDialogueLimitReached;
/** Successful public Star Map operation. */
export interface MindGardenStarSuccess<T> {
    readonly ok: true;
    readonly value: T;
}
/** Rejected public Star Map operation. */
export interface MindGardenStarRejected<E extends MindGardenStarFailure> {
    readonly ok: false;
    readonly error: E;
}
/** Result of reading current Star Map state. */
export type MindGardenStarMapOverviewResult = MindGardenStarSuccess<MindGardenStarMapOverview> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable>;
/** Result of saving resumable ritual progress. */
export type MindGardenSaveStarRitualResult = MindGardenStarSuccess<MindGardenStarMapOverview> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarProfileVersionConflict | MindGardenStarRitualCompleted>;
/** Result of completing the Star Map ritual. */
export type MindGardenCompleteStarRitualResult = MindGardenStarSuccess<MindGardenStarMapOverview> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarProfileVersionConflict>;
/** Result of replacing the completed Star Map profile. */
export type MindGardenUpdateStarProfileResult = MindGardenStarSuccess<MindGardenStarMapOverview> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarProfileVersionConflict | MindGardenStarRitualRequired>;
/** Result of deciding or correcting one Star Map trait. */
export type MindGardenUpdateStarTraitResult = MindGardenStarSuccess<MindGardenStarTrait> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarTraitNotFound | MindGardenStarTraitVersionConflict | MindGardenStarRitualRequired>;
/** Result of drawing one evidence-bound Star Observer card. */
export type MindGardenDrawStarCardResult = MindGardenStarSuccess<MindGardenStarCard> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarRitualRequired | MindGardenStarObserverModelUnavailable | MindGardenStarObserverModelFailed | MindGardenStarObserverOutputInvalid | MindGardenStarObservationInProgress | MindGardenStarActiveCardExists | MindGardenStarSourceUnavailable | MindGardenStarObserverInputTooLarge | MindGardenStarObserverContextChanged>;
/** Result of recording an explicit user calibration for one draft card. */
export type MindGardenCalibrateStarCardResult = MindGardenStarSuccess<MindGardenStarCard> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarRitualRequired | MindGardenStarCardNotFound | MindGardenStarCardVersionConflict | MindGardenStarCardStateConflict | MindGardenStarTraitLimitReached>;
/** Result of saving or dissolving one draft card. */
export type MindGardenFinalizeStarCardResult = MindGardenStarSuccess<MindGardenStarCard> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarRitualRequired | MindGardenStarCardNotFound | MindGardenStarCardVersionConflict | MindGardenStarCardStateConflict | MindGardenStarTraitLimitReached>;
/** Result of one complete model-backed Star Observer dialogue exchange. */
export type MindGardenContinueStarCardResult = MindGardenStarSuccess<MindGardenStarCard> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarInvalidField | MindGardenStarRitualRequired | MindGardenStarCardNotFound | MindGardenStarCardVersionConflict | MindGardenStarCardStateConflict | MindGardenStarDialogueLimitReached | MindGardenStarObserverModelUnavailable | MindGardenStarObserverModelFailed | MindGardenStarObserverOutputInvalid | MindGardenStarObservationInProgress | MindGardenStarObserverInputTooLarge>;
/** Result of explicitly accepting the latest proposed card revision. */
export type MindGardenApplyStarCardRevisionResult = MindGardenStarSuccess<MindGardenStarCard> | MindGardenStarRejected<MindGardenStarAccessDenied | MindGardenStarVaultUnavailable | MindGardenStarRitualRequired | MindGardenStarCardNotFound | MindGardenStarCardVersionConflict | MindGardenStarCardStateConflict | MindGardenStarCardRevisionConflict>;
//# sourceMappingURL=types.d.ts.map