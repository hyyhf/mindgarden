/** Injected action face for the Mind Garden conversation dock. */
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { MindGardenMode, MindGardenSupportIntent } from '@deepseek-ai/dsh-mind-garden/core/client';
import type { MindGardenMediaStamp, MindGardenPhotoParticleConfig, MindGardenPhotoStory } from '@deepseek-ai/dsh-mind-garden/media/types';
import type { MindGardenMemoryAutomationInterval, MindGardenMemoryAutomationPolicy, MindGardenMemoryConfirmRequest, MindGardenMemoryExtractValue, MindGardenMemoryExtractionRun, MindGardenMemoryItem, MindGardenMemoryLatestAuditValue, MindGardenMemoryProposeRequest, MindGardenMemoryResolveRelationshipRequest, MindGardenMemoryResolveRelationshipValue, MindGardenMemoryRevision, MindGardenMemoryUpdateRequest } from '@deepseek-ai/dsh-mind-garden/memory/types';
import type { MindGardenCalendarDayValue, MindGardenCalendarMonthValue, MindGardenCalendarStamp, MindGardenCheckin, MindGardenConcern, MindGardenConcernConversionValue, MindGardenContemplation, MindGardenExperiment, MindGardenJournal, MindGardenOpenQuestion, MindGardenOpenQuestionStatus, MindGardenPeriodReview, MindGardenPeriodReviewMaterialRequest, MindGardenPeriodReviewMaterialValue, MindGardenPeriodReviewStatus, MindGardenPrinciple, MindGardenPrincipleProposal, MindGardenPrincipleStatus, MindGardenReflectionTrendValue } from '@deepseek-ai/dsh-mind-garden/reflection/types';
import type { MindGardenApplyStarCardRevisionRequest, MindGardenCalibrateStarCardRequest, MindGardenCompleteStarRitualRequest, MindGardenContinueStarCardRequest, MindGardenDrawStarCardRequest, MindGardenFinalizeStarCardRequest, MindGardenSaveStarRitualRequest, MindGardenStarCard, MindGardenStarMapOverview, MindGardenStarTrait, MindGardenUpdateStarProfileRequest, MindGardenUpdateStarTraitRequest } from '@deepseek-ai/dsh-mind-garden/star-map/types';
import type { MindGardenBackupExportValue, MindGardenBackupInspectValue, MindGardenBackupRestoreValue, MindGardenKeyRotationValue } from '@deepseek-ai/dsh-mind-garden/portability/types';
/** Settled outcome rendered by the dock while projection updates arrive independently. */
export type MindGardenActionResult = RemoteResult<unknown>;
/** Browser actions bound to one session by the slot registry. */
export interface MindGardenDockActions {
    /** Activate a blank session with displayed disclosure accepted. */
    onActivate: (mode: MindGardenMode) => Promise<MindGardenActionResult>;
    /** Change the mode with the caller's current projected revision. */
    onSelectMode: (expectedRevision: number, mode: MindGardenMode) => Promise<MindGardenActionResult>;
    /** Change support style with the caller's current projected revision. */
    onSelectSupportIntent: (expectedRevision: number, supportIntent: MindGardenSupportIntent) => Promise<MindGardenActionResult>;
}
/** UI-safe settled outcome after transport and reflection results are flattened. */
export type MindGardenDataResult<T> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly code: string;
    readonly reason?: string;
};
type WithoutMemoryIdentity<T> = T extends unknown ? Omit<T, 'id' | 'ifVersion'> : never;
/** Session-bound reflection actions used by the full Mind Garden view. */
export interface MindGardenViewActions extends MindGardenDockActions {
    /** Create a passphrase-encrypted profile package for an explicit browser download. */
    onExportBackup: (passphrase: string) => Promise<MindGardenDataResult<MindGardenBackupExportValue>>;
    /** Authenticate one encrypted archive and preview its non-overwriting merge. */
    onInspectBackup: (file: File, passphrase: string) => Promise<MindGardenDataResult<MindGardenBackupInspectValue>>;
    /** Revalidate and add only records missing from the current private profile. */
    onRestoreBackup: (file: File, passphrase: string) => Promise<MindGardenDataResult<MindGardenBackupRestoreValue>>;
    /** Replace the profile vault data key after an explicit browser confirmation. */
    onRotateVaultKey: () => Promise<MindGardenDataResult<MindGardenKeyRotationValue>>;
    /** Read encrypted Star Map ritual progress, profile, and governed traits. */
    onStarMapOverview: () => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    /** Save one resumable Star Map ritual checkpoint under profile CAS. */
    onSaveStarRitual: (request: MindGardenSaveStarRitualRequest) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    /** Complete the ritual with only user-authored initial stars. */
    onCompleteStarRitual: (request: MindGardenCompleteStarRitualRequest) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    /** Replace the private Star Map profile and its data authorizations. */
    onUpdateStarProfile: (request: MindGardenUpdateStarProfileRequest) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    /** Correct or retire one rendered constellation trait under trait CAS. */
    onUpdateStarTrait: (request: MindGardenUpdateStarTraitRequest) => Promise<MindGardenDataResult<MindGardenStarTrait>>;
    /** Draw one permission-bounded provisional Star Observer card. */
    onDrawStarCard: (request: MindGardenDrawStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    /** Record the user's calibration of one draft card. */
    onCalibrateStarCard: (request: MindGardenCalibrateStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    /** Save or dissolve one reviewed draft card. */
    onFinalizeStarCard: (request: MindGardenFinalizeStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    /** Add one complete recoverable exchange to a draft or saved star card. */
    onContinueStarCard: (request: MindGardenContinueStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    /** Explicitly accept the latest model-proposed card revision. */
    onApplyStarCardRevision: (request: MindGardenApplyStarCardRevisionRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    /** Read the complete governed profile-memory view. */
    onListMemories: () => Promise<MindGardenDataResult<readonly MindGardenMemoryItem[]>>;
    /** Add one human-authored candidate with recall disabled. */
    onProposeMemory: (request: MindGardenMemoryProposeRequest) => Promise<MindGardenDataResult<MindGardenMemoryItem>>;
    /** Confirm one unrelated candidate against the rendered version. */
    onConfirmMemory: (item: MindGardenMemoryItem, request: WithoutMemoryIdentity<MindGardenMemoryConfirmRequest>) => Promise<MindGardenDataResult<MindGardenMemoryItem>>;
    /** Edit one candidate or active memory against the rendered version. */
    onUpdateMemory: (item: MindGardenMemoryItem, request: WithoutMemoryIdentity<MindGardenMemoryUpdateRequest>) => Promise<MindGardenDataResult<MindGardenMemoryItem>>;
    /** Reject one unconfirmed candidate against the rendered version. */
    onRejectMemory: (item: MindGardenMemoryItem) => Promise<MindGardenDataResult<MindGardenMemoryItem>>;
    /** Resolve one suggested relationship through an explicit human decision. */
    onResolveMemoryRelationship: (item: MindGardenMemoryItem, request: WithoutMemoryIdentity<MindGardenMemoryResolveRelationshipRequest>) => Promise<MindGardenDataResult<MindGardenMemoryResolveRelationshipValue>>;
    /** Read immutable encrypted before-images for one memory. */
    onListMemoryRevisions: (item: MindGardenMemoryItem) => Promise<MindGardenDataResult<readonly MindGardenMemoryRevision[]>>;
    /** Request one explicit auxiliary-model extraction pass. */
    onExtractMemories: () => Promise<MindGardenDataResult<MindGardenMemoryExtractValue>>;
    /** Read the newest extraction run for this Session. */
    onLatestMemoryExtraction: () => Promise<MindGardenDataResult<MindGardenMemoryExtractionRun | null>>;
    /** Read this Session's encrypted automatic-extraction authorization. */
    onMemoryAutomationPolicy: () => Promise<MindGardenDataResult<MindGardenMemoryAutomationPolicy>>;
    /** Replace automatic-extraction authorization against the rendered version. */
    onSetMemoryAutomationPolicy: (policy: MindGardenMemoryAutomationPolicy, enabled: boolean, minimumCompletedTurns: MindGardenMemoryAutomationInterval) => Promise<MindGardenDataResult<MindGardenMemoryAutomationPolicy>>;
    /** Delete one governed memory against the rendered version. */
    onDeleteMemory: (item: MindGardenMemoryItem) => Promise<MindGardenDataResult<true>>;
    /** Read the latest Session-scoped retrieval audit. */
    onLatestMemoryAudit: () => Promise<MindGardenDataResult<MindGardenMemoryLatestAuditValue['audit']>>;
    /** Read recent encrypted photo-story metadata. */
    onListPhotoStories: () => Promise<MindGardenDataResult<readonly MindGardenPhotoStory[]>>;
    /** Validate and store one browser image through the Host attachment capability. */
    onCreatePhotoStory: (file: File, stamp: MindGardenMediaStamp) => Promise<MindGardenDataResult<MindGardenPhotoStory>>;
    /** Read verified story-owned bytes as a browser-safe data URL. */
    onReadPhotoStory: (story: MindGardenPhotoStory) => Promise<MindGardenDataResult<string>>;
    /** Explicitly send one verified story image to the configured vision route. */
    onObservePhotoStory: (story: MindGardenPhotoStory) => Promise<MindGardenDataResult<MindGardenPhotoStory>>;
    /** Continue from frozen visual grounding without sending the image again. */
    onContinuePhotoStory: (story: MindGardenPhotoStory, content: string, quickReplyKind?: '' | 'remember' | 'detail' | 'correct') => Promise<MindGardenDataResult<MindGardenPhotoStory>>;
    /** Save story copy and the complete particle presentation under CAS. */
    onUpdatePhotoStory: (story: MindGardenPhotoStory, title: string, note: string, particleConfig: MindGardenPhotoParticleConfig) => Promise<MindGardenDataResult<MindGardenPhotoStory>>;
    /** Remove encrypted story metadata under CAS. */
    onDeletePhotoStory: (story: MindGardenPhotoStory) => Promise<MindGardenDataResult<true>>;
    /** Read active and closed private concerns in service-defined order. */
    onListConcerns: () => Promise<MindGardenDataResult<readonly MindGardenConcern[]>>;
    /** Hold one private concern, optionally with a browser-local reminder. */
    onCreateConcern: (content: string, stamp: MindGardenCalendarStamp, reminder?: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenConcern>>;
    /** Replace one active concern and its optional reminder under CAS. */
    onUpdateConcern: (concern: MindGardenConcern, content: string, observedLocalDate: string, reminder?: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenConcern>>;
    /** Close one concern without deleting its history. */
    onCompleteConcern: (concern: MindGardenConcern) => Promise<MindGardenDataResult<MindGardenConcern>>;
    /** Turn one concern into a retrievable or private journal. */
    onConvertConcern: (concern: MindGardenConcern, stamp: MindGardenCalendarStamp, allowRetrieval: boolean) => Promise<MindGardenDataResult<MindGardenConcernConversionValue>>;
    /** Read one sparse calendar month. */
    onCalendarMonth: (month: string) => Promise<MindGardenDataResult<MindGardenCalendarMonthValue>>;
    /** Read every reflection event projected onto one civil date. */
    onCalendarDay: (localDate: string) => Promise<MindGardenDataResult<MindGardenCalendarDayValue>>;
    /** Save one immutable browser-dated emotional check-in. */
    onCreateCheckin: (mood: -2 | -1 | 0 | 1 | 2, energy: 1 | 2 | 3 | 4 | 5, emotionWords: readonly string[], stamp: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenCheckin>>;
    /** Create one encrypted journal with an explicit retrieval decision. */
    onCreateJournal: (title: string, body: string, allowRetrieval: boolean, stamp: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenJournal>>;
    /** Replace one journal's editable fields against the rendered version. */
    onUpdateJournal: (journal: MindGardenJournal, title: string, body: string, allowRetrieval: boolean) => Promise<MindGardenDataResult<MindGardenJournal>>;
    /** Delete one journal against the rendered version. */
    onDeleteJournal: (journal: MindGardenJournal) => Promise<MindGardenDataResult<true>>;
    /** Read a fixed-length mood and energy trend. */
    onReflectionTrend: (days: 7 | 30, endDate: string) => Promise<MindGardenDataResult<MindGardenReflectionTrendValue>>;
    /** Read reality experiments in actionable-state order. */
    onListExperiments: () => Promise<MindGardenDataResult<readonly MindGardenExperiment[]>>;
    /** Create one inactive, user-authored reality experiment. */
    onCreateExperiment: (title: string, hypothesis: string, action: string, stamp: MindGardenCalendarStamp, reviewStamp?: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenExperiment>>;
    /** Explicitly begin an observed experiment. */
    onStartExperiment: (experiment: MindGardenExperiment, observedLocalDate: string) => Promise<MindGardenDataResult<MindGardenExperiment>>;
    /** Append one unscored observation to an experiment. */
    onObserveExperiment: (experiment: MindGardenExperiment, observation: string, stamp: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenExperiment>>;
    /** Stop an experiment without deleting its observations. */
    onStopExperiment: (experiment: MindGardenExperiment) => Promise<MindGardenDataResult<MindGardenExperiment>>;
    /** Read post-conversation contemplations, including unconfirmed drafts. */
    onListContemplations: () => Promise<MindGardenDataResult<readonly MindGardenContemplation[]>>;
    /** Read principle proposals, including decided records. */
    onListPrincipleProposals: () => Promise<MindGardenDataResult<readonly MindGardenPrincipleProposal[]>>;
    /** Read life principles with their complete version histories. */
    onListPrinciples: () => Promise<MindGardenDataResult<readonly MindGardenPrinciple[]>>;
    /** Accept one confirmation-gated proposal. */
    onAcceptPrincipleProposal: (proposal: MindGardenPrincipleProposal, stamp: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenPrinciple>>;
    /** Reject one proposal without activating it. */
    onRejectPrincipleProposal: (proposal: MindGardenPrincipleProposal) => Promise<MindGardenDataResult<MindGardenPrincipleProposal>>;
    /** Append a user-authored principle status revision without erasing meaning. */
    onRevisePrincipleStatus: (principle: MindGardenPrinciple, status: MindGardenPrincipleStatus, stamp: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenPrinciple>>;
    /** Read open and closed questions in service-defined display order. */
    onListOpenQuestions: () => Promise<MindGardenDataResult<readonly MindGardenOpenQuestion[]>>;
    /** Keep one directly authored question with the browser-observed date. */
    onCreateOpenQuestion: (question: string, stamp: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenOpenQuestion>>;
    /** Edit or transition one question against the exact rendered version. */
    onUpdateOpenQuestion: (question: MindGardenOpenQuestion, nextQuestion: string, status: MindGardenOpenQuestionStatus, stamp: MindGardenCalendarStamp) => Promise<MindGardenDataResult<MindGardenOpenQuestion>>;
    /** Read bounded evidence and its equality hash for one explicit date range. */
    onPeriodReviewMaterial: (request: MindGardenPeriodReviewMaterialRequest) => Promise<MindGardenDataResult<MindGardenPeriodReviewMaterialValue>>;
    /** Create one editable proposed review against the material shown to the user. */
    onCreatePeriodReview: (material: MindGardenPeriodReviewMaterialValue, content: string) => Promise<MindGardenDataResult<MindGardenPeriodReview>>;
    /** Read current proposed, saved, and archived reviews. */
    onListPeriodReviews: () => Promise<MindGardenDataResult<readonly MindGardenPeriodReview[]>>;
    /** Edit or transition one review against the exact rendered version. */
    onUpdatePeriodReview: (review: MindGardenPeriodReview, content: string, status: MindGardenPeriodReviewStatus) => Promise<MindGardenDataResult<MindGardenPeriodReview>>;
}
export {};
//# sourceMappingURL=slots.d.ts.map