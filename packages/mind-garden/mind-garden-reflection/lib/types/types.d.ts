/**
 * Client-safe contracts for encrypted Mind Garden reflections and calendar views.
 * @module @deepseek-ai/dsh-mind-garden/reflection/types
 */
import type { Branded } from '@deepseek-ai/dsh-brand';
import type { MessageId } from '@deepseek-ai/dsh-llm/brand';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Stable profile-wide identity of one reflection record. */
export type MindGardenReflectionId = Branded<'MindGardenReflectionId'>;
/** Equality-only token replaced by each mutable reflection change. */
export type MindGardenReflectionVersion = Branded<'MindGardenReflectionVersion'>;
/** Browser-observed civil date and zone metadata retained with a record. */
export interface MindGardenCalendarStamp {
    /** Strict Gregorian `YYYY-MM-DD` date selected by the user. */
    readonly localDate: string;
    /** Valid IANA time-zone name observed by the browser. */
    readonly timeZone: string;
    /** Browser-observed UTC offset for the selected date, in minutes. */
    readonly utcOffsetMinutes: number;
}
/** Point in the original check-in or journal flow. */
export type MindGardenCheckinPhase = 'standalone' | 'before' | 'after' | 'journal';
/** Locale-neutral mood band for UI translation. */
export type MindGardenMoodBand = 'heavy' | 'low' | 'steady' | 'light' | 'bright';
/** Locale-neutral energy band for UI translation. */
export type MindGardenEnergyBand = 'very-low' | 'low' | 'steady' | 'high' | 'very-high';
/** Detached encrypted-at-rest check-in. */
export interface MindGardenCheckin {
    readonly type: 'checkin';
    readonly id: MindGardenReflectionId;
    readonly stamp: MindGardenCalendarStamp;
    readonly mood: -2 | -1 | 0 | 1 | 2;
    readonly moodBand: MindGardenMoodBand;
    readonly energy: 1 | 2 | 3 | 4 | 5;
    readonly energyBand: MindGardenEnergyBand;
    readonly emotionWords: readonly string[];
    readonly phase: MindGardenCheckinPhase;
    readonly sourceSessionId: SessionId;
    readonly createdAt: number;
}
/** Detached encrypted-at-rest journal entry. */
export interface MindGardenJournal {
    readonly type: 'journal';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly stamp: MindGardenCalendarStamp;
    readonly title: string;
    readonly body: string;
    /** Explicit permission to include an excerpt in an authorized-context result. */
    readonly allowRetrieval: boolean;
    readonly sourceSessionId: SessionId;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** User-visible lifecycle of one private concern. */
export type MindGardenConcernStatus = 'active' | 'completed' | 'converted';
/** Detached concern held outside the conversation until the user acts on it. */
export interface MindGardenConcern {
    readonly type: 'concern';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly content: string;
    readonly status: MindGardenConcernStatus;
    readonly createdStamp: MindGardenCalendarStamp;
    readonly reminder: MindGardenCalendarStamp | null;
    readonly convertedJournalId: MindGardenReflectionId | null;
    readonly sourceSessionId: SessionId;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** User-controlled lifecycle of one post-conversation contemplation note. */
export type MindGardenContemplationStatus = 'draft' | 'confirmed';
/** Encrypted note proposed after a completed serenity turn. */
export interface MindGardenContemplation {
    readonly type: 'contemplation';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly markdown: string;
    readonly status: MindGardenContemplationStatus;
    readonly sourceSessionId: SessionId;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly confirmedAt: number | null;
}
/** User-owned maturity state of a life principle. */
export type MindGardenPrincipleStatus = 'trying' | 'adopted' | 'questioning' | 'retired';
/** One bounded experience supporting a proposed principle. */
export interface MindGardenPrincipleExperience {
    readonly summary: string;
    readonly sourceContemplationId?: MindGardenReflectionId;
}
/** Complete editable meaning of one principle version. */
export interface MindGardenPrincipleContent {
    readonly expression: string;
    readonly formationContext: string;
    readonly userQuote: string;
    readonly supportingExperiences: readonly MindGardenPrincipleExperience[];
    readonly counterexample: string;
    readonly appliesTo: readonly string[];
    readonly notAppliesTo: readonly string[];
    readonly lastChallenged: string;
    readonly status: MindGardenPrincipleStatus;
}
/** Immutable accepted or revised principle version. */
export interface MindGardenPrincipleVersion {
    readonly number: number;
    readonly content: MindGardenPrincipleContent;
    readonly sourceProposalId: MindGardenReflectionId | null;
    readonly sourceContemplationId: MindGardenReflectionId | null;
    readonly stamp: MindGardenCalendarStamp;
    readonly createdAt: number;
}
/** Encrypted principle with its complete append-only version history. */
export interface MindGardenPrinciple {
    readonly type: 'principle';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly status: MindGardenPrincipleStatus;
    readonly current: MindGardenPrincipleContent;
    readonly versions: readonly MindGardenPrincipleVersion[];
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** Review state of a principle proposal. */
export type MindGardenPrincipleProposalStatus = 'proposed' | 'accepted' | 'rejected';
/** Candidate principle that cannot become active without an explicit decision. */
export interface MindGardenPrincipleProposal {
    readonly type: 'principle-proposal';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly status: MindGardenPrincipleProposalStatus;
    readonly targetPrincipleId: MindGardenReflectionId | null;
    readonly targetVersion: MindGardenReflectionVersion | null;
    readonly content: MindGardenPrincipleContent;
    readonly sourceContemplationId: MindGardenReflectionId;
    readonly sourceSessionId: SessionId;
    readonly resultingPrincipleId: MindGardenReflectionId | null;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly rejectedAt: number | null;
}
/** User-controlled state of one small reality experiment. */
export type MindGardenExperimentStatus = 'proposed' | 'trying' | 'observed' | 'revised' | 'stopped';
/** Immutable observation recorded without success or failure scoring. */
export interface MindGardenExperimentObservation {
    readonly id: MindGardenReflectionId;
    readonly happened: string;
    readonly action: string;
    readonly observation: string;
    readonly mood: 1 | 2 | 3 | 4 | 5 | null;
    readonly energy: 1 | 2 | 3 | 4 | 5 | null;
    readonly stamp: MindGardenCalendarStamp;
    readonly createdAt: number;
}
/** Encrypted, user-governed reality experiment and its append-only observations. */
export interface MindGardenExperiment {
    readonly type: 'experiment';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly title: string;
    readonly hypothesis: string;
    readonly action: string;
    readonly reviewStamp: MindGardenCalendarStamp | null;
    readonly status: MindGardenExperimentStatus;
    readonly result: string;
    readonly judgment: string;
    readonly sourceSessionId: SessionId;
    readonly sourceMessageId: MessageId | null;
    readonly evidenceQuote: string;
    readonly observations: readonly MindGardenExperimentObservation[];
    readonly createdStamp: MindGardenCalendarStamp;
    readonly startedAt: number | null;
    readonly stoppedAt: number | null;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** One active experiment projected onto its next review date. */
export interface MindGardenExperimentReviewEvent {
    readonly type: 'experiment-review';
    readonly stamp: MindGardenCalendarStamp;
    readonly experiment: MindGardenExperiment;
}
/** One immutable experiment observation projected onto its occurrence date. */
export interface MindGardenExperimentObservationEvent {
    readonly type: 'experiment-observation';
    readonly experimentId: MindGardenReflectionId;
    readonly observation: MindGardenExperimentObservation;
}
/** One principle version projected onto its explicit civil date. */
export interface MindGardenPrincipleCalendarEvent {
    readonly type: 'principle';
    readonly principleId: MindGardenReflectionId;
    readonly version: MindGardenPrincipleVersion;
}
/** Active concern projected onto the civil date of its reminder. */
export interface MindGardenConcernReminder {
    readonly type: 'concern-reminder';
    readonly stamp: MindGardenCalendarStamp;
    readonly concern: MindGardenConcern;
}
/** Record shown in one calendar day, ordered by original creation time. */
export type MindGardenCalendarEvent = MindGardenCheckin | MindGardenJournal | MindGardenConcernReminder | MindGardenPrincipleCalendarEvent | MindGardenExperimentReviewEvent | MindGardenExperimentObservationEvent | MindGardenOpenQuestionCalendarEvent;
/** Create one immutable check-in. */
export interface MindGardenCreateCheckinRequest {
    readonly stamp: MindGardenCalendarStamp;
    readonly mood: -2 | -1 | 0 | 1 | 2;
    readonly energy: 1 | 2 | 3 | 4 | 5;
    readonly emotionWords: readonly string[];
    readonly phase: MindGardenCheckinPhase;
}
/** Create one mutable journal entry. */
export interface MindGardenCreateJournalRequest {
    readonly stamp: MindGardenCalendarStamp;
    readonly title?: string;
    readonly body: string;
    readonly allowRetrieval: boolean;
}
/** Replace the user-editable fields of one journal after observing its version. */
export interface MindGardenUpdateJournalRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly title?: string;
    readonly body: string;
    readonly allowRetrieval: boolean;
}
/** Delete one journal after observing its version. */
export interface MindGardenDeleteJournalRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
}
/** Stable absent postcondition for deletion and safe retries. */
export interface MindGardenDeleteJournalValue {
    readonly absent: true;
}
/** Create one private concern and optionally schedule a browser-local reminder. */
export interface MindGardenCreateConcernRequest {
    /** Browser-observed current civil date and zone. */
    readonly stamp: MindGardenCalendarStamp;
    readonly content: string;
    /** Reminder civil date and its browser-observed offset; omission means no reminder. */
    readonly reminder?: MindGardenCalendarStamp;
}
/** Replace one active concern after observing its version. */
export interface MindGardenUpdateConcernRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly content: string;
    /** Browser-local date at mutation time, used to reject past reminders. */
    readonly observedLocalDate: string;
    /** Replacement reminder; omission removes the current reminder. */
    readonly reminder?: MindGardenCalendarStamp;
}
/** Close one concern after observing its version. */
export interface MindGardenCompleteConcernRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
}
/** Convert one active concern into a journal on an explicit browser-local date. */
export interface MindGardenConvertConcernRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly stamp: MindGardenCalendarStamp;
    readonly allowRetrieval: boolean;
}
/** Query concerns in reminder-first order. */
export interface MindGardenListConcernsRequest {
    readonly includeClosed?: boolean;
    readonly limit?: number;
}
/** Bounded concern list detached from encrypted storage. */
export interface MindGardenConcernListValue {
    readonly concerns: readonly MindGardenConcern[];
}
/** Stable pair returned by idempotent concern-to-journal conversion. */
export interface MindGardenConcernConversionValue {
    readonly concern: MindGardenConcern;
    readonly journal: MindGardenJournal;
}
/** Propose one contemplation draft from the current completed serenity Session. */
export interface MindGardenCreateContemplationRequest {
    readonly markdown: string;
}
/** Query encrypted contemplation notes, optionally for one source Session. */
export interface MindGardenListContemplationsRequest {
    readonly sourceSessionId?: SessionId;
    readonly limit?: number;
}
/** Bounded newest-first list of contemplation notes. */
export interface MindGardenContemplationListValue {
    readonly contemplations: readonly MindGardenContemplation[];
}
/** Replace one unconfirmed contemplation draft after observing its version. */
export interface MindGardenUpdateContemplationRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly markdown: string;
}
/** Confirm one contemplation draft after observing its version. */
export interface MindGardenConfirmContemplationRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
}
/** Delete one contemplation after observing its version. */
export interface MindGardenDeleteContemplationRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
}
/** Stable absent postcondition for contemplation deletion and safe retries. */
export interface MindGardenDeleteContemplationValue {
    readonly absent: true;
}
/** Optional existing principle target observed while making a proposal. */
export interface MindGardenPrincipleProposalTarget {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
}
/** Create a confirmation-gated principle proposal from one confirmed contemplation. */
export interface MindGardenProposePrincipleRequest {
    readonly sourceContemplationId: MindGardenReflectionId;
    readonly target?: MindGardenPrincipleProposalTarget;
    readonly content: MindGardenPrincipleContent;
}
/** Query principle proposals newest first. */
export interface MindGardenListPrincipleProposalsRequest {
    readonly includeClosed?: boolean;
    readonly limit?: number;
}
/** Bounded list of principle proposals. */
export interface MindGardenPrincipleProposalListValue {
    readonly proposals: readonly MindGardenPrincipleProposal[];
}
/** Accept an observed proposal on an explicit browser-local date. */
export interface MindGardenAcceptPrincipleProposalRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly stamp: MindGardenCalendarStamp;
}
/** Reject an observed proposal. */
export interface MindGardenRejectPrincipleProposalRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
}
/** Query principles newest first. */
export interface MindGardenListPrinciplesRequest {
    readonly includeRetired?: boolean;
    readonly limit?: number;
}
/** Bounded list of principles with complete version histories. */
export interface MindGardenPrincipleListValue {
    readonly principles: readonly MindGardenPrinciple[];
}
/** Append one directly user-authored version after observing the principle. */
export interface MindGardenRevisePrincipleRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly stamp: MindGardenCalendarStamp;
    readonly content: MindGardenPrincipleContent;
}
/** Optional exact user-message evidence for an idempotent Session proposal. */
export interface MindGardenExperimentSource {
    readonly messageId: MessageId;
    readonly evidenceQuote: string;
}
/** Create an inactive small reality experiment. */
export interface MindGardenCreateExperimentRequest {
    readonly stamp: MindGardenCalendarStamp;
    readonly title: string;
    readonly hypothesis?: string;
    readonly action: string;
    readonly reviewStamp?: MindGardenCalendarStamp;
    readonly source?: MindGardenExperimentSource;
}
/** Query experiments in actionable-state order. */
export interface MindGardenListExperimentsRequest {
    readonly includeStopped?: boolean;
    readonly limit?: number;
}
/** Bounded list of experiments with complete observation histories. */
export interface MindGardenExperimentListValue {
    readonly experiments: readonly MindGardenExperiment[];
}
/** Explicitly start a proposed or revised experiment. */
export interface MindGardenStartExperimentRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly observedLocalDate: string;
    /** Omission retains the current review date; `null` clears it. */
    readonly reviewStamp?: MindGardenCalendarStamp | null;
}
/** Record what happened without assigning success or failure. */
export interface MindGardenObserveExperimentRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly stamp: MindGardenCalendarStamp;
    readonly happened?: string;
    readonly action?: string;
    readonly observation: string;
    readonly mood?: 1 | 2 | 3 | 4 | 5;
    readonly energy?: 1 | 2 | 3 | 4 | 5;
}
/** Record a user judgment after at least one observation. */
export interface MindGardenReviseExperimentRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly observedLocalDate: string;
    readonly result?: string;
    readonly judgment: string;
    /** Omission retains the current review date; `null` clears it. */
    readonly reviewStamp?: MindGardenCalendarStamp | null;
}
/** Move or clear an active experiment's next review date. */
export interface MindGardenScheduleExperimentRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly observedLocalDate: string;
    readonly reviewStamp: MindGardenCalendarStamp | null;
}
/** Stop one experiment without erasing its observations. */
export interface MindGardenStopExperimentRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
}
/** User-owned lifecycle of one question that still needs real-world observation. */
export type MindGardenOpenQuestionStatus = 'open' | 'resolved' | 'dismissed';
/** Exact current-Session user-message evidence retained with an open question. */
export interface MindGardenOpenQuestionMessageSource {
    readonly kind: 'message';
    readonly messageId: MessageId;
    readonly evidenceQuote: string;
}
/** Authenticated journal evidence retained with an open question. */
export interface MindGardenOpenQuestionJournalSource {
    readonly kind: 'journal';
    readonly journalId: MindGardenReflectionId;
    readonly journalVersion: MindGardenReflectionVersion;
    readonly evidenceQuote: string;
    /** Derived freshness of the cited encrypted journal. */
    readonly state: 'current' | 'changed' | 'missing';
}
/** Optional provenance shown with an open question. */
export type MindGardenOpenQuestionSource = MindGardenOpenQuestionMessageSource | MindGardenOpenQuestionJournalSource;
/** Immutable creation or lifecycle transition retained for calendar projection. */
export interface MindGardenOpenQuestionTransition {
    readonly id: MindGardenReflectionId;
    readonly status: MindGardenOpenQuestionStatus;
    readonly stamp: MindGardenCalendarStamp;
    readonly createdAt: number;
}
/** Encrypted personal question with append-only lifecycle history. */
export interface MindGardenOpenQuestion {
    readonly type: 'open-question';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly question: string;
    readonly status: MindGardenOpenQuestionStatus;
    readonly source: MindGardenOpenQuestionSource | null;
    readonly transitions: readonly MindGardenOpenQuestionTransition[];
    readonly createdStamp: MindGardenCalendarStamp;
    readonly sourceSessionId: SessionId;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** One open-question lifecycle transition projected onto its explicit civil date. */
export interface MindGardenOpenQuestionCalendarEvent {
    readonly type: 'open-question';
    readonly openQuestionId: MindGardenReflectionId;
    readonly question: string;
    readonly transition: MindGardenOpenQuestionTransition;
}
/** Exact current-Session user-message source accepted while creating a question. */
export interface MindGardenCreateOpenQuestionMessageSource {
    readonly kind: 'message';
    readonly messageId: MessageId;
    readonly evidenceQuote: string;
}
/** Exact authenticated journal source accepted while creating a question. */
export interface MindGardenCreateOpenQuestionJournalSource {
    readonly kind: 'journal';
    readonly journalId: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly evidenceQuote: string;
}
/** Optional evidence used to ground a new open question. */
export type MindGardenCreateOpenQuestionSource = MindGardenCreateOpenQuestionMessageSource | MindGardenCreateOpenQuestionJournalSource;
/** Create one directly user-authored question, optionally grounded in exact evidence. */
export interface MindGardenCreateOpenQuestionRequest {
    readonly stamp: MindGardenCalendarStamp;
    readonly question: string;
    readonly source?: MindGardenCreateOpenQuestionSource;
}
/** Query questions in open-first, creation order. */
export interface MindGardenListOpenQuestionsRequest {
    readonly includeClosed?: boolean;
    readonly limit?: number;
}
/** Bounded list of encrypted open questions. */
export interface MindGardenOpenQuestionListValue {
    readonly questions: readonly MindGardenOpenQuestion[];
}
/** Replace a question or move its lifecycle after observing its exact version. */
export interface MindGardenUpdateOpenQuestionRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly stamp: MindGardenCalendarStamp;
    readonly question: string;
    readonly status: MindGardenOpenQuestionStatus;
}
/** Explicitly request bounded unresolved questions for a caller-controlled context seam. */
export interface MindGardenOpenQuestionContextRequest {
    readonly limit?: number;
}
/** Minimal unresolved question released for logged, caller-controlled model context. */
export interface MindGardenAuthorizedOpenQuestion {
    readonly id: MindGardenReflectionId;
    readonly question: string;
    readonly createdLocalDate: string;
    readonly evidenceQuote: string;
}
/** Bounded plaintext released only by the dedicated open-question context operation. */
export interface MindGardenOpenQuestionContextValue {
    readonly openQuestions: readonly MindGardenAuthorizedOpenQuestion[];
}
/** User-visible lifecycle of one encrypted period review. */
export type MindGardenPeriodReviewStatus = 'proposed' | 'saved' | 'archived';
/** Calendar scale selected by the user for one review interval. */
export type MindGardenPeriodReviewType = 'week' | 'month' | 'year';
/** Reflection record kinds that can support a period review. */
export type MindGardenPeriodReviewSourceType = 'checkin' | 'journal' | 'concern' | 'contemplation' | 'principle' | 'experiment' | 'open-question' | 'legacy-original';
/** Authenticated source snapshot retained as review provenance. */
export interface MindGardenPeriodReviewSource {
    readonly id: MindGardenReflectionId;
    readonly sourceType: MindGardenPeriodReviewSourceType;
    /** Original artifact family when an imported review retains a frozen source unavailable in this profile. */
    readonly legacyType?: string;
    /** SHA-256 of the complete authenticated source record at capture time. */
    readonly fingerprint: string;
    readonly localDates: readonly string[];
}
/** Why one retained period-review source is no longer current. */
export interface MindGardenPeriodReviewStaleSource {
    readonly id: MindGardenReflectionId;
    readonly reason: 'changed' | 'missing';
}
/** Encrypted editable review with derived source freshness. */
export interface MindGardenPeriodReview {
    readonly type: 'period-review';
    readonly id: MindGardenReflectionId;
    readonly version: MindGardenReflectionVersion;
    readonly periodType: MindGardenPeriodReviewType;
    readonly startStamp: MindGardenCalendarStamp;
    readonly endStamp: MindGardenCalendarStamp;
    readonly status: MindGardenPeriodReviewStatus;
    readonly content: string;
    readonly sources: readonly MindGardenPeriodReviewSource[];
    readonly sourceHash: string;
    readonly stale: boolean;
    readonly staleSources: readonly MindGardenPeriodReviewStaleSource[];
    readonly sourceSessionId: SessionId;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** Evidence category exposed to an explicit review generator or editor. */
export type MindGardenPeriodReviewMaterialCategory = 'events' | 'ongoing' | 'changes' | 'experiments' | 'focus';
/** Bounded plaintext item derived from one authenticated source record. */
export interface MindGardenPeriodReviewMaterialItem {
    readonly category: MindGardenPeriodReviewMaterialCategory;
    readonly sourceId: MindGardenReflectionId;
    readonly localDate: string;
    readonly title: string;
    readonly text: string;
}
/** Explicit date range used to derive review material. */
export interface MindGardenPeriodReviewMaterialRequest {
    readonly periodType: MindGardenPeriodReviewType;
    readonly startStamp: MindGardenCalendarStamp;
    readonly endStamp: MindGardenCalendarStamp;
}
/** Stable source snapshot and bounded plaintext material for one review range. */
export interface MindGardenPeriodReviewMaterialValue {
    readonly periodType: MindGardenPeriodReviewType;
    readonly startStamp: MindGardenCalendarStamp;
    readonly endStamp: MindGardenCalendarStamp;
    readonly sources: readonly MindGardenPeriodReviewSource[];
    readonly items: readonly MindGardenPeriodReviewMaterialItem[];
    /** Equality token for rejecting generation against changed source material. */
    readonly materialHash: string;
}
/** Commit a proposed review only against material observed by the caller. */
export interface MindGardenCreatePeriodReviewRequest extends MindGardenPeriodReviewMaterialRequest {
    readonly materialHash: string;
    /** Exact material sources cited by the proposed content. */
    readonly sourceIds: readonly MindGardenReflectionId[];
    readonly content: string;
}
/** Query encrypted reviews newest first. */
export interface MindGardenListPeriodReviewsRequest {
    readonly periodType?: MindGardenPeriodReviewType;
    readonly includeArchived?: boolean;
    readonly limit?: number;
}
/** Bounded period-review list. */
export interface MindGardenPeriodReviewListValue {
    readonly reviews: readonly MindGardenPeriodReview[];
}
/** Replace review content and lifecycle after observing its equality-only version. */
export interface MindGardenUpdatePeriodReviewRequest {
    readonly id: MindGardenReflectionId;
    readonly ifVersion: MindGardenReflectionVersion;
    readonly content: string;
    readonly status: MindGardenPeriodReviewStatus;
}
/** Query one Gregorian calendar month. */
export interface MindGardenCalendarMonthRequest {
    readonly month: string;
}
/** Aggregate for one non-empty calendar date. */
export interface MindGardenCalendarMonthDay {
    readonly date: string;
    readonly eventCount: number;
    readonly checkinCount: number;
    readonly journalCount: number;
    readonly concernCount: number;
    readonly principleCount: number;
    readonly experimentCount: number;
    readonly openQuestionCount: number;
    /** Latest check-in mood for this date. */
    readonly mood?: -2 | -1 | 0 | 1 | 2;
    readonly moodBand?: MindGardenMoodBand;
    /** Latest check-in energy for this date. */
    readonly energy?: 1 | 2 | 3 | 4 | 5;
    readonly energyBand?: MindGardenEnergyBand;
}
/** Sparse month projection derived from authenticated reflection records. */
export interface MindGardenCalendarMonthValue {
    readonly month: string;
    readonly days: readonly MindGardenCalendarMonthDay[];
}
/** Query one Gregorian calendar date. */
export interface MindGardenCalendarDayRequest {
    readonly localDate: string;
}
/** Complete reflection events for one date. */
export interface MindGardenCalendarDayValue {
    readonly date: string;
    readonly events: readonly MindGardenCalendarEvent[];
}
/** Query a fixed-length trend ending on an explicit browser-local date. */
export interface MindGardenReflectionTrendRequest {
    readonly days: 7 | 30;
    readonly endDate: string;
}
/** Check-in series and plot-readiness for one explicit civil-date interval. */
export interface MindGardenReflectionTrendValue {
    readonly days: 7 | 30;
    readonly startDate: string;
    readonly endDate: string;
    readonly canPlot: boolean;
    readonly recordedDays: number;
    readonly points: readonly MindGardenCheckin[];
}
/** Explicit query for only user-authorized conversation material. */
export interface MindGardenAuthorizedContextRequest {
    /** Browser-local date; omit to disable check-ins and same-day journal boosting. */
    readonly localDate?: string;
    readonly query: string;
}
/** Bounded journal excerpt released by explicit per-entry permission. */
export interface MindGardenAuthorizedJournalExcerpt {
    readonly id: MindGardenReflectionId;
    readonly localDate: string;
    readonly title: string;
    readonly body: string;
}
/** Calendar material eligible for a caller to log before model use. */
export interface MindGardenAuthorizedContextValue {
    readonly todayCheckin: MindGardenCheckin | null;
    readonly retrievableJournals: readonly MindGardenAuthorizedJournalExcerpt[];
}
/** The operation requires an activated durable Mind Garden Session. */
export interface MindGardenReflectionAccessDenied {
    readonly code: 'mind-garden-not-active' | 'durable-session-required';
}
/** Encrypted storage could not be authenticated with the configured credential. */
export interface MindGardenReflectionVaultUnavailable {
    readonly code: 'vault-unavailable';
    readonly state: 'locked' | 'invalid-key' | 'key-mismatch' | 'corrupt-state';
}
/** A wire or text field failed domain validation. */
export interface MindGardenReflectionInvalidField {
    readonly code: 'invalid-field';
    readonly field: 'localDate' | 'month' | 'timeZone' | 'utcOffsetMinutes' | 'title' | 'body' | 'emotionWords' | 'query' | 'content' | 'markdown' | 'sourceSessionId' | 'expression' | 'formationContext' | 'userQuote' | 'supportingExperiences' | 'counterexample' | 'appliesTo' | 'notAppliesTo' | 'lastChallenged' | 'experimentTitle' | 'hypothesis' | 'action' | 'observation' | 'happened' | 'judgment' | 'result' | 'evidenceQuote' | 'periodType' | 'periodEnd' | 'periodReviewContent' | 'periodReviewStatus' | 'materialHash' | 'sourceIds' | 'openQuestion' | 'openQuestionStatus' | 'reminderDate' | 'reviewDate' | 'limit';
    readonly reason: 'invalid' | 'blank' | 'too-large' | 'too-many' | 'duplicate' | 'past' | 'placeholder' | 'source-visible';
    readonly maxBytes?: number;
}
/** The addressed journal does not exist. */
export interface MindGardenJournalNotFound {
    readonly code: 'journal-not-found';
    readonly id: MindGardenReflectionId;
}
/** The addressed concern does not exist. */
export interface MindGardenConcernNotFound {
    readonly code: 'concern-not-found';
    readonly id: MindGardenReflectionId;
}
/** The addressed concern has already left its editable state. */
export interface MindGardenConcernClosed {
    readonly code: 'concern-closed';
    readonly current: MindGardenConcern;
}
/** The mutation observed a stale journal version. */
export interface MindGardenReflectionVersionConflict {
    readonly code: 'version-conflict';
    readonly current: MindGardenJournal | null;
}
/** The mutation observed a stale concern version. */
export interface MindGardenConcernVersionConflict {
    readonly code: 'concern-version-conflict';
    readonly current: MindGardenConcern;
}
/** The current Session is not ready to yield a contemplation draft. */
export interface MindGardenContemplationSourceUnavailable {
    readonly code: 'contemplation-source-unavailable';
    readonly reason: 'mode-unavailable' | 'agent-running' | 'no-completed-turn';
}
/** The addressed contemplation note does not exist. */
export interface MindGardenContemplationNotFound {
    readonly code: 'contemplation-not-found';
    readonly id: MindGardenReflectionId;
}
/** A confirmed contemplation cannot be edited or confirmed again. */
export interface MindGardenContemplationLocked {
    readonly code: 'contemplation-locked';
    readonly current: MindGardenContemplation;
}
/** The mutation observed a stale contemplation version. */
export interface MindGardenContemplationVersionConflict {
    readonly code: 'contemplation-version-conflict';
    readonly current: MindGardenContemplation;
}
/** A proposal did not cite usable confirmed contemplation evidence. */
export interface MindGardenPrincipleSourceInvalid {
    readonly code: 'principle-source-invalid';
    readonly reason: 'contemplation-not-found' | 'not-confirmed' | 'quote-not-found';
}
/** The addressed principle proposal does not exist. */
export interface MindGardenPrincipleProposalNotFound {
    readonly code: 'principle-proposal-not-found';
    readonly id: MindGardenReflectionId;
}
/** The proposal has already reached an accepted or rejected postcondition. */
export interface MindGardenPrincipleProposalClosed {
    readonly code: 'principle-proposal-closed';
    readonly current: MindGardenPrincipleProposal;
}
/** The proposal decision observed a stale version. */
export interface MindGardenPrincipleProposalVersionConflict {
    readonly code: 'principle-proposal-version-conflict';
    readonly current: MindGardenPrincipleProposal;
}
/** The addressed principle does not exist. */
export interface MindGardenPrincipleNotFound {
    readonly code: 'principle-not-found';
    readonly id: MindGardenReflectionId;
}
/** A principle proposal or revision observed a stale version. */
export interface MindGardenPrincipleVersionConflict {
    readonly code: 'principle-version-conflict';
    readonly current: MindGardenPrinciple;
}
/** The configured append-only principle history bound has been reached. */
export interface MindGardenPrincipleVersionLimit {
    readonly code: 'principle-version-limit';
    readonly id: MindGardenReflectionId;
    readonly maxVersions: number;
}
/** A cited experiment source is not an exact current-Session user message. */
export interface MindGardenExperimentSourceInvalid {
    readonly code: 'experiment-source-invalid';
    readonly reason: 'message-not-found' | 'quote-not-found';
}
/** The addressed reality experiment does not exist. */
export interface MindGardenExperimentNotFound {
    readonly code: 'experiment-not-found';
    readonly id: MindGardenReflectionId;
}
/** The requested transition is unavailable from the experiment's current state. */
export interface MindGardenExperimentStateConflict {
    readonly code: 'experiment-state-conflict';
    readonly current: MindGardenExperiment;
}
/** The experiment mutation observed a stale equality-only version. */
export interface MindGardenExperimentVersionConflict {
    readonly code: 'experiment-version-conflict';
    readonly current: MindGardenExperiment;
}
/** The configured append-only observation bound has been reached. */
export interface MindGardenExperimentObservationLimit {
    readonly code: 'experiment-observation-limit';
    readonly id: MindGardenReflectionId;
    readonly maxObservations: number;
}
/** A cited open-question source is not exact authenticated user evidence. */
export interface MindGardenOpenQuestionSourceInvalid {
    readonly code: 'open-question-source-invalid';
    readonly reason: 'message-not-found' | 'journal-not-found' | 'journal-version-conflict' | 'quote-not-found';
}
/** The addressed open question does not exist. */
export interface MindGardenOpenQuestionNotFound {
    readonly code: 'open-question-not-found';
    readonly id: MindGardenReflectionId;
}
/** An open-question mutation observed a stale equality-only version. */
export interface MindGardenOpenQuestionVersionConflict {
    readonly code: 'open-question-version-conflict';
    readonly current: MindGardenOpenQuestion;
}
/** The configured append-only open-question transition bound has been reached. */
export interface MindGardenOpenQuestionTransitionLimit {
    readonly code: 'open-question-transition-limit';
    readonly id: MindGardenReflectionId;
    readonly maxTransitions: number;
}
/** The selected period contains no reviewable reflection evidence. */
export interface MindGardenPeriodReviewSourceRequired {
    readonly code: 'period-review-source-required';
}
/** The range contains more source records than the configured material bound. */
export interface MindGardenPeriodReviewSourceLimit {
    readonly code: 'period-review-source-limit';
    readonly sourceCount: number;
    readonly maxSources: number;
}
/** Source material changed after a caller observed it. */
export interface MindGardenPeriodReviewMaterialConflict {
    readonly code: 'period-review-material-conflict';
    readonly currentHash: string;
}
/** A review cited a source outside its authenticated material snapshot. */
export interface MindGardenPeriodReviewSourceInvalid {
    readonly code: 'period-review-source-invalid';
    readonly reason: 'unknown';
}
/** The addressed period review does not exist. */
export interface MindGardenPeriodReviewNotFound {
    readonly code: 'period-review-not-found';
    readonly id: MindGardenReflectionId;
}
/** A period-review mutation observed a stale equality-only version. */
export interface MindGardenPeriodReviewVersionConflict {
    readonly code: 'period-review-version-conflict';
    readonly current: MindGardenPeriodReview;
}
/** All stable business failures exposed by this package. */
export type MindGardenReflectionFailure = MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenJournalNotFound | MindGardenReflectionVersionConflict | MindGardenConcernNotFound | MindGardenConcernClosed | MindGardenConcernVersionConflict | MindGardenContemplationSourceUnavailable | MindGardenContemplationNotFound | MindGardenContemplationLocked | MindGardenContemplationVersionConflict | MindGardenPrincipleSourceInvalid | MindGardenPrincipleProposalNotFound | MindGardenPrincipleProposalClosed | MindGardenPrincipleProposalVersionConflict | MindGardenPrincipleNotFound | MindGardenPrincipleVersionConflict | MindGardenPrincipleVersionLimit | MindGardenExperimentSourceInvalid | MindGardenExperimentNotFound | MindGardenExperimentStateConflict | MindGardenExperimentVersionConflict | MindGardenExperimentObservationLimit | MindGardenOpenQuestionSourceInvalid | MindGardenOpenQuestionNotFound | MindGardenOpenQuestionVersionConflict | MindGardenOpenQuestionTransitionLimit | MindGardenPeriodReviewSourceRequired | MindGardenPeriodReviewSourceLimit | MindGardenPeriodReviewMaterialConflict | MindGardenPeriodReviewSourceInvalid | MindGardenPeriodReviewNotFound | MindGardenPeriodReviewVersionConflict;
/** Successful public operation result. */
export interface MindGardenReflectionSuccess<T> {
    readonly ok: true;
    readonly value: T;
}
/** Rejected public operation result. */
export interface MindGardenReflectionRejected<E extends MindGardenReflectionFailure> {
    readonly ok: false;
    readonly error: E;
}
/** Result of creating one check-in. */
export type MindGardenCreateCheckinResult = MindGardenReflectionSuccess<MindGardenCheckin> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of creating one journal. */
export type MindGardenCreateJournalResult = MindGardenReflectionSuccess<MindGardenJournal> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of updating one journal. */
export type MindGardenUpdateJournalResult = MindGardenReflectionSuccess<MindGardenJournal> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenJournalNotFound | MindGardenReflectionVersionConflict>;
/** Result of deleting one journal. */
export type MindGardenDeleteJournalResult = MindGardenReflectionSuccess<MindGardenDeleteJournalValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionVersionConflict>;
/** Result of creating one concern. */
export type MindGardenCreateConcernResult = MindGardenReflectionSuccess<MindGardenConcern> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of listing concerns. */
export type MindGardenListConcernsResult = MindGardenReflectionSuccess<MindGardenConcernListValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of updating one concern. */
export type MindGardenUpdateConcernResult = MindGardenReflectionSuccess<MindGardenConcern> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenConcernNotFound | MindGardenConcernClosed | MindGardenConcernVersionConflict>;
/** Result of completing one concern. */
export type MindGardenCompleteConcernResult = MindGardenReflectionSuccess<MindGardenConcern> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenConcernNotFound | MindGardenConcernVersionConflict>;
/** Result of idempotently converting one concern into a journal. */
export type MindGardenConvertConcernResult = MindGardenReflectionSuccess<MindGardenConcernConversionValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenConcernNotFound | MindGardenConcernClosed | MindGardenConcernVersionConflict | MindGardenJournalNotFound>;
/** Result of idempotently proposing one draft for the current source Session. */
export type MindGardenCreateContemplationResult = MindGardenReflectionSuccess<MindGardenContemplation> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenContemplationSourceUnavailable>;
/** Result of listing contemplation notes. */
export type MindGardenListContemplationsResult = MindGardenReflectionSuccess<MindGardenContemplationListValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of editing one contemplation draft. */
export type MindGardenUpdateContemplationResult = MindGardenReflectionSuccess<MindGardenContemplation> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenContemplationNotFound | MindGardenContemplationLocked | MindGardenContemplationVersionConflict>;
/** Result of explicitly confirming one contemplation draft. */
export type MindGardenConfirmContemplationResult = MindGardenReflectionSuccess<MindGardenContemplation> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenContemplationNotFound | MindGardenContemplationLocked | MindGardenContemplationVersionConflict>;
/** Result of deleting one contemplation note. */
export type MindGardenDeleteContemplationResult = MindGardenReflectionSuccess<MindGardenDeleteContemplationValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenContemplationVersionConflict>;
/** Result of creating a principle proposal without activating it. */
export type MindGardenProposePrincipleResult = MindGardenReflectionSuccess<MindGardenPrincipleProposal> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenPrincipleSourceInvalid | MindGardenPrincipleNotFound | MindGardenPrincipleVersionConflict>;
/** Result of listing principle proposals. */
export type MindGardenListPrincipleProposalsResult = MindGardenReflectionSuccess<MindGardenPrincipleProposalListValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of explicitly accepting one principle proposal. */
export type MindGardenAcceptPrincipleProposalResult = MindGardenReflectionSuccess<MindGardenPrinciple> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenPrincipleProposalNotFound | MindGardenPrincipleProposalClosed | MindGardenPrincipleProposalVersionConflict | MindGardenPrincipleNotFound | MindGardenPrincipleVersionConflict | MindGardenPrincipleVersionLimit>;
/** Result of idempotently rejecting one principle proposal. */
export type MindGardenRejectPrincipleProposalResult = MindGardenReflectionSuccess<MindGardenPrincipleProposal> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenPrincipleProposalNotFound | MindGardenPrincipleProposalClosed | MindGardenPrincipleProposalVersionConflict>;
/** Result of listing principles. */
export type MindGardenListPrinciplesResult = MindGardenReflectionSuccess<MindGardenPrincipleListValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of appending one directly user-authored principle version. */
export type MindGardenRevisePrincipleResult = MindGardenReflectionSuccess<MindGardenPrinciple> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenPrincipleNotFound | MindGardenPrincipleVersionConflict | MindGardenPrincipleVersionLimit>;
/** Result of creating one inactive reality experiment. */
export type MindGardenCreateExperimentResult = MindGardenReflectionSuccess<MindGardenExperiment> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenExperimentSourceInvalid>;
/** Result of listing reality experiments. */
export type MindGardenListExperimentsResult = MindGardenReflectionSuccess<MindGardenExperimentListValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of explicitly starting a proposed or revised experiment. */
export type MindGardenStartExperimentResult = MindGardenReflectionSuccess<MindGardenExperiment> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenExperimentNotFound | MindGardenExperimentStateConflict | MindGardenExperimentVersionConflict>;
/** Result of appending one non-scored observation. */
export type MindGardenObserveExperimentResult = MindGardenReflectionSuccess<MindGardenExperiment> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenExperimentNotFound | MindGardenExperimentStateConflict | MindGardenExperimentVersionConflict | MindGardenExperimentObservationLimit>;
/** Result of recording a post-observation judgment. */
export type MindGardenReviseExperimentResult = MindGardenReflectionSuccess<MindGardenExperiment> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenExperimentNotFound | MindGardenExperimentStateConflict | MindGardenExperimentVersionConflict>;
/** Result of moving or clearing an experiment review date. */
export type MindGardenScheduleExperimentResult = MindGardenReviseExperimentResult;
/** Result of idempotently stopping an experiment. */
export type MindGardenStopExperimentResult = MindGardenReflectionSuccess<MindGardenExperiment> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenExperimentNotFound | MindGardenExperimentVersionConflict>;
/** Result of creating one encrypted open question. */
export type MindGardenCreateOpenQuestionResult = MindGardenReflectionSuccess<MindGardenOpenQuestion> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenOpenQuestionSourceInvalid>;
/** Result of listing encrypted open questions. */
export type MindGardenListOpenQuestionsResult = MindGardenReflectionSuccess<MindGardenOpenQuestionListValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of editing or transitioning one open question. */
export type MindGardenUpdateOpenQuestionResult = MindGardenReflectionSuccess<MindGardenOpenQuestion> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenOpenQuestionNotFound | MindGardenOpenQuestionVersionConflict | MindGardenOpenQuestionTransitionLimit>;
/** Result of explicitly releasing bounded unresolved-question context. */
export type MindGardenOpenQuestionContextResult = MindGardenReflectionSuccess<MindGardenOpenQuestionContextValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of deriving bounded period-review material without making a model request. */
export type MindGardenPeriodReviewMaterialResult = MindGardenReflectionSuccess<MindGardenPeriodReviewMaterialValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenPeriodReviewSourceLimit>;
/** Result of committing one source-bound proposed period review. */
export type MindGardenCreatePeriodReviewResult = MindGardenReflectionSuccess<MindGardenPeriodReview> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenPeriodReviewSourceRequired | MindGardenPeriodReviewSourceLimit | MindGardenPeriodReviewMaterialConflict | MindGardenPeriodReviewSourceInvalid>;
/** Result of listing encrypted period reviews. */
export type MindGardenListPeriodReviewsResult = MindGardenReflectionSuccess<MindGardenPeriodReviewListValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of editing or changing the lifecycle of one period review. */
export type MindGardenUpdatePeriodReviewResult = MindGardenReflectionSuccess<MindGardenPeriodReview> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField | MindGardenPeriodReviewNotFound | MindGardenPeriodReviewVersionConflict>;
/** Result of reading one month projection. */
export type MindGardenCalendarMonthResult = MindGardenReflectionSuccess<MindGardenCalendarMonthValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of reading one day projection. */
export type MindGardenCalendarDayResult = MindGardenReflectionSuccess<MindGardenCalendarDayValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of reading one check-in trend. */
export type MindGardenReflectionTrendResult = MindGardenReflectionSuccess<MindGardenReflectionTrendValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
/** Result of reading explicitly authorized reflection context. */
export type MindGardenAuthorizedContextResult = MindGardenReflectionSuccess<MindGardenAuthorizedContextValue> | MindGardenReflectionRejected<MindGardenReflectionAccessDenied | MindGardenReflectionVaultUnavailable | MindGardenReflectionInvalidField>;
//# sourceMappingURL=types.d.ts.map