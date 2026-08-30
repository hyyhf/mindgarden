/**
 * Encrypted reflections, governed principles, calendar projections, trends, and authorized context.
 * @module @deepseek-ai/dsh-mind-garden/reflection
 */
import { Context } from '@deepseek-ai/cordis';
import s from '@deepseek-ai/schemastery';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { MindGardenAcceptPrincipleProposalRequest, MindGardenAcceptPrincipleProposalResult, MindGardenAuthorizedContextRequest, MindGardenAuthorizedContextResult, MindGardenCalendarDayRequest, MindGardenCalendarDayResult, MindGardenCalendarMonthRequest, MindGardenCalendarMonthResult, MindGardenConfirmContemplationRequest, MindGardenConfirmContemplationResult, MindGardenCompleteConcernRequest, MindGardenCompleteConcernResult, MindGardenConvertConcernRequest, MindGardenConvertConcernResult, MindGardenCreateCheckinRequest, MindGardenCreateCheckinResult, MindGardenCreateContemplationRequest, MindGardenCreateContemplationResult, MindGardenCreateConcernRequest, MindGardenCreateConcernResult, MindGardenCreateExperimentRequest, MindGardenCreateExperimentResult, MindGardenCreateJournalRequest, MindGardenCreateJournalResult, MindGardenCreateOpenQuestionRequest, MindGardenCreateOpenQuestionResult, MindGardenCreatePeriodReviewRequest, MindGardenCreatePeriodReviewResult, MindGardenDeleteJournalRequest, MindGardenDeleteJournalResult, MindGardenDeleteContemplationRequest, MindGardenDeleteContemplationResult, MindGardenListConcernsRequest, MindGardenListConcernsResult, MindGardenListContemplationsRequest, MindGardenListContemplationsResult, MindGardenListExperimentsRequest, MindGardenListExperimentsResult, MindGardenListOpenQuestionsRequest, MindGardenListOpenQuestionsResult, MindGardenListPrincipleProposalsRequest, MindGardenListPrincipleProposalsResult, MindGardenListPrinciplesRequest, MindGardenListPrinciplesResult, MindGardenListPeriodReviewsRequest, MindGardenListPeriodReviewsResult, MindGardenObserveExperimentRequest, MindGardenObserveExperimentResult, MindGardenOpenQuestionContextRequest, MindGardenOpenQuestionContextResult, MindGardenPeriodReviewMaterialRequest, MindGardenPeriodReviewMaterialResult, MindGardenProposePrincipleRequest, MindGardenProposePrincipleResult, MindGardenRejectPrincipleProposalRequest, MindGardenRejectPrincipleProposalResult, MindGardenReflectionTrendRequest, MindGardenReflectionTrendResult, MindGardenUpdateJournalRequest, MindGardenUpdateJournalResult, MindGardenUpdateOpenQuestionRequest, MindGardenUpdateOpenQuestionResult, MindGardenUpdatePeriodReviewRequest, MindGardenUpdatePeriodReviewResult, MindGardenUpdateConcernRequest, MindGardenUpdateConcernResult, MindGardenUpdateContemplationRequest, MindGardenUpdateContemplationResult, MindGardenRevisePrincipleRequest, MindGardenRevisePrincipleResult, MindGardenReviseExperimentRequest, MindGardenReviseExperimentResult, MindGardenScheduleExperimentRequest, MindGardenScheduleExperimentResult, MindGardenStartExperimentRequest, MindGardenStartExperimentResult, MindGardenStopExperimentRequest, MindGardenStopExperimentResult } from './types.ts';
export type * from './types.ts';
export { decodeStoredReflection, storedCheckinSchema, storedContemplationSchema, storedConcernSchema, storedExperimentSchema, storedJournalSchema, storedOpenQuestionSchema, storedPeriodReviewSchema, storedPrincipleProposalSchema, storedPrincipleSchema, } from './records.ts';
/** Cordis plugin name. */
export declare const name = "mind-garden-reflection";
/** Cordis plugin configuration. */
export interface Config {
    /** Maximum UTF-8 bytes accepted for a journal title. */
    maxTitleBytes?: number;
    /** Maximum UTF-8 bytes accepted for a journal body. */
    maxBodyBytes?: number;
    /** Maximum UTF-8 bytes accepted for one concern. */
    maxConcernBytes?: number;
    /** Maximum UTF-8 bytes accepted for one contemplation note. */
    maxContemplationBytes?: number;
    /** Maximum UTF-8 bytes accepted for one emotion word. */
    maxEmotionWordBytes?: number;
    /** Maximum UTF-8 bytes accepted for one IANA time-zone name. */
    maxTimeZoneBytes?: number;
    /** Maximum UTF-8 bytes accepted for an authorized-context query. */
    maxQueryBytes?: number;
    /** Maximum authorized journal excerpts returned by one query. */
    maxContextJournals?: number;
    /** Maximum UTF-8 bytes returned from each authorized journal body. */
    maxContextBodyBytes?: number;
    /** Maximum concerns returned by one list request. */
    maxConcernsPerList?: number;
    /** Maximum contemplation notes returned by one list request. */
    maxContemplationsPerList?: number;
    /** Maximum UTF-8 bytes accepted for each principle text field. */
    maxPrincipleFieldBytes?: number;
    /** Maximum supporting experiences or applicability entries in one principle. */
    maxPrincipleItems?: number;
    /** Maximum append-only versions retained by one principle. */
    maxPrincipleVersions?: number;
    /** Maximum principle proposals returned by one list request. */
    maxPrincipleProposalsPerList?: number;
    /** Maximum principles returned by one list request. */
    maxPrinciplesPerList?: number;
    /** Maximum UTF-8 bytes accepted for each reality-experiment text field. */
    maxExperimentFieldBytes?: number;
    /** Maximum append-only observations retained by one reality experiment. */
    maxExperimentObservations?: number;
    /** Maximum reality experiments returned by one list request. */
    maxExperimentsPerList?: number;
    /** Maximum UTF-8 bytes accepted for one open question or its evidence quote. */
    maxOpenQuestionBytes?: number;
    /** Maximum append-only lifecycle transitions retained by one open question. */
    maxOpenQuestionTransitions?: number;
    /** Maximum open questions returned by one list request. */
    maxOpenQuestionsPerList?: number;
    /** Maximum unresolved questions released by the dedicated context operation. */
    maxContextOpenQuestions?: number;
    /** Maximum UTF-8 bytes accepted for one period-review document. */
    maxPeriodReviewContentBytes?: number;
    /** Maximum UTF-8 bytes returned for each period-review material item. */
    maxPeriodReviewMaterialItemBytes?: number;
    /** Maximum authenticated source records admitted into one period-review material snapshot. */
    maxPeriodReviewSources?: number;
    /** Maximum period reviews returned by one list request. */
    maxPeriodReviewsPerList?: number;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        mindGardenReflection: MindGardenReflectionService;
    }
}
/** Encrypted reflection records and deterministic calendar projections for Mind Garden. */
export declare class MindGardenReflectionService extends TypertRemoteService {
    static inject: string[];
    /** Loader validation for complete UTF-8 and authorized-context bounds. */
    static Config: s<Config>;
    private readonly options;
    private operationTail;
    private admissionOpen;
    /**
     * Install the Remote service and disposal drain.
     * @param ctx - Host context carrying live Agents, Mind Garden state, and the encrypted vault.
     * @param config - Complete text and authorized-context limits.
     */
    constructor(ctx: Context, config: Config);
    /**
     * Create one encrypted check-in tied to an explicit civil-date snapshot.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Mood, energy, emotion words, phase, and browser date metadata.
     * @returns The committed check-in or a stable access, validation, or vault failure.
     */
    createCheckin(agent: Agent, request: MindGardenCreateCheckinRequest): Promise<MindGardenCreateCheckinResult>;
    /**
     * Create one encrypted journal with retrieval disabled unless explicitly granted.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Civil date, text, and explicit future-retrieval permission.
     * @returns The committed journal or a stable access, validation, or vault failure.
     */
    createJournal(agent: Agent, request: MindGardenCreateJournalRequest): Promise<MindGardenCreateJournalResult>;
    /**
     * Replace a journal's editable fields using equality-only optimistic concurrency.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Journal id, observed version, replacement text, and retrieval permission.
     * @returns The updated journal or a stable access, validation, version, or vault failure.
     */
    updateJournal(agent: Agent, request: MindGardenUpdateJournalRequest): Promise<MindGardenUpdateJournalResult>;
    /**
     * Delete one journal after observing its version; retries after absence remain successful.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Journal id and last observed version.
     * @returns A stable absent postcondition or access, version, or vault failure.
     */
    deleteJournal(agent: Agent, request: MindGardenDeleteJournalRequest): Promise<MindGardenDeleteJournalResult>;
    /**
     * Create one encrypted concern outside the conversation transcript.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Concern text, current browser-local stamp, and optional reminder stamp.
     * @returns The committed concern or a stable access, validation, or vault failure.
     */
    createConcern(agent: Agent, request: MindGardenCreateConcernRequest): Promise<MindGardenCreateConcernResult>;
    /**
     * List concerns in reminder-first order, hiding closed records by default.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Closed-record visibility and optional bounded result limit.
     * @returns Detached concerns or a stable access, validation, or vault failure.
     */
    listConcerns(agent: Agent, request: MindGardenListConcernsRequest): Promise<MindGardenListConcernsResult>;
    /**
     * Replace one active concern and its reminder using equality-only concurrency.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Concern id, observed version, replacement text, current date, and reminder.
     * @returns The updated concern or a stable access, lifecycle, version, validation, or vault failure.
     */
    updateConcern(agent: Agent, request: MindGardenUpdateConcernRequest): Promise<MindGardenUpdateConcernResult>;
    /**
     * Complete one concern, removing its reminder; retries after closure return the same postcondition.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Concern id and last observed active version.
     * @returns The closed concern or a stable access, not-found, version, or vault failure.
     */
    completeConcern(agent: Agent, request: MindGardenCompleteConcernRequest): Promise<MindGardenCompleteConcernResult>;
    /**
     * Convert one concern into a journal through a recoverable encrypted two-record commit.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Concern id, observed version, journal stamp, and retrieval permission.
     * @returns The linked concern and journal, including on safe retry after conversion.
     */
    convertConcern(agent: Agent, request: MindGardenConvertConcernRequest): Promise<MindGardenConvertConcernResult>;
    /**
     * Propose one encrypted contemplation draft for the current completed serenity Session.
     * @param agent - Exact idle Agent whose Session supplies the completed source turn.
     * @param request - User-visible Markdown proposal; the service never derives or sends model context.
     * @returns The existing per-Session note, a new draft, or a stable readiness, validation, access, or vault failure.
     */
    createContemplation(agent: Agent, request: MindGardenCreateContemplationRequest): Promise<MindGardenCreateContemplationResult>;
    /**
     * List encrypted contemplation notes newest first.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Optional source Session filter and bounded result limit.
     * @returns Detached notes or a stable access, validation, or vault failure.
     */
    listContemplations(agent: Agent, request: MindGardenListContemplationsRequest): Promise<MindGardenListContemplationsResult>;
    /**
     * Replace an unconfirmed contemplation draft using equality-only concurrency.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Note id, observed version, and replacement Markdown.
     * @returns The updated draft or a stable lifecycle, version, validation, access, or vault failure.
     */
    updateContemplation(agent: Agent, request: MindGardenUpdateContemplationRequest): Promise<MindGardenUpdateContemplationResult>;
    /**
     * Confirm one contemplation draft without projecting it into model-visible context.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Note id and observed draft version.
     * @returns The confirmed note or a stable lifecycle, version, access, or vault failure.
     */
    confirmContemplation(agent: Agent, request: MindGardenConfirmContemplationRequest): Promise<MindGardenConfirmContemplationResult>;
    /**
     * Physically remove one contemplation after observing its version.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Note id and last observed version.
     * @returns A stable absent postcondition or an access, version, or vault failure.
     */
    deleteContemplation(agent: Agent, request: MindGardenDeleteContemplationRequest): Promise<MindGardenDeleteContemplationResult>;
    /**
     * Create an encrypted principle proposal from confirmed contemplation evidence.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Confirmed source note, optional observed target, and complete proposed meaning.
     * @returns An inactive proposal or a stable evidence, target, validation, access, or vault failure.
     */
    proposePrinciple(agent: Agent, request: MindGardenProposePrincipleRequest): Promise<MindGardenProposePrincipleResult>;
    /**
     * List encrypted principle proposals newest first.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Closed-state visibility and bounded result limit.
     * @returns Detached proposals with accepted state recovered from principle history.
     */
    listPrincipleProposals(agent: Agent, request: MindGardenListPrincipleProposalsRequest): Promise<MindGardenListPrincipleProposalsResult>;
    /**
     * Accept one proposal by creating or appending a single recoverable principle record.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed proposal version and explicit browser-local adoption date.
     * @returns The resulting principle, including on a safe retry after acceptance.
     */
    acceptPrincipleProposal(agent: Agent, request: MindGardenAcceptPrincipleProposalRequest): Promise<MindGardenAcceptPrincipleProposalResult>;
    /**
     * Reject one open proposal without deleting its encrypted review evidence.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Proposal id and equality-only observed version.
     * @returns The rejected proposal, including on a safe repeated rejection.
     */
    rejectPrincipleProposal(agent: Agent, request: MindGardenRejectPrincipleProposalRequest): Promise<MindGardenRejectPrincipleProposalResult>;
    /**
     * List principles newest first with their complete bounded histories.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Retired-state visibility and bounded result limit.
     * @returns Detached principles or a stable access, validation, or vault failure.
     */
    listPrinciples(agent: Agent, request: MindGardenListPrinciplesRequest): Promise<MindGardenListPrinciplesResult>;
    /**
     * Append one directly user-authored principle version without erasing its history.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed principle, explicit date, and complete replacement meaning.
     * @returns The revised principle or a stable version, limit, validation, access, or vault failure.
     */
    revisePrinciple(agent: Agent, request: MindGardenRevisePrincipleRequest): Promise<MindGardenRevisePrincipleResult>;
    /**
     * Create one inactive, encrypted, non-scored reality experiment.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Small action, optional hypothesis and review date, and optional exact user evidence.
     * @returns A proposed experiment or the existing proposal for the same evidenced Session.
     */
    createExperiment(agent: Agent, request: MindGardenCreateExperimentRequest): Promise<MindGardenCreateExperimentResult>;
    /**
     * List encrypted reality experiments in actionable-state order.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Stopped-state visibility and bounded result limit.
     * @returns Detached experiments with complete bounded observation histories.
     */
    listExperiments(agent: Agent, request: MindGardenListExperimentsRequest): Promise<MindGardenListExperimentsResult>;
    /**
     * Explicitly start a proposed or revised experiment.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed version, current civil date, and optional review-date replacement.
     * @returns The trying experiment, including on a safe repeated start.
     */
    startExperiment(agent: Agent, request: MindGardenStartExperimentRequest): Promise<MindGardenStartExperimentResult>;
    /**
     * Append one observation without assigning success or failure.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed experiment, occurrence stamp, optional context, and required observation.
     * @returns The observed experiment with its new immutable observation.
     */
    observeExperiment(agent: Agent, request: MindGardenObserveExperimentRequest): Promise<MindGardenObserveExperimentResult>;
    /**
     * Record a post-observation judgment and optional next review date.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed version, non-empty judgment, result, and optional review-date replacement.
     * @returns The revised experiment without changing its observation history.
     */
    reviseExperiment(agent: Agent, request: MindGardenReviseExperimentRequest): Promise<MindGardenReviseExperimentResult>;
    /**
     * Move or clear the next review date without changing experiment meaning or state.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed version, current civil date, and replacement review stamp.
     * @returns The rescheduled experiment or a stable state, version, validation, access, or vault failure.
     */
    scheduleExperiment(agent: Agent, request: MindGardenScheduleExperimentRequest): Promise<MindGardenScheduleExperimentResult>;
    /**
     * Stop one experiment without deleting its observations.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Experiment id and last observed equality-only version.
     * @returns The stopped experiment, including on a safe repeated stop.
     */
    stopExperiment(agent: Agent, request: MindGardenStopExperimentRequest): Promise<MindGardenStopExperimentResult>;
    /**
     * Create one encrypted question that still needs real-world observation.
     * @param agent - Exact live Agent authorizing durable profile access and optional message evidence.
     * @param request - Browser-local creation stamp, question, and optional exact evidence source.
     * @returns The open question or a stable source, validation, access, or vault failure.
     */
    createOpenQuestion(agent: Agent, request: MindGardenCreateOpenQuestionRequest): Promise<MindGardenCreateOpenQuestionResult>;
    /**
     * List encrypted questions in open-first creation order.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Closed-record visibility and bounded result limit.
     * @returns Detached questions with derived journal-source freshness.
     */
    listOpenQuestions(agent: Agent, request: MindGardenListOpenQuestionsRequest): Promise<MindGardenListOpenQuestionsResult>;
    /**
     * Edit or transition one open question while retaining append-only lifecycle history.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed version, replacement meaning, target state, and transition stamp.
     * @returns The updated question, including when a safe retry already reached the same postcondition.
     */
    updateOpenQuestion(agent: Agent, request: MindGardenUpdateOpenQuestionRequest): Promise<MindGardenUpdateOpenQuestionResult>;
    /**
     * Release a minimal bounded set of unresolved questions through an explicit context seam.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Optional limit within the configured context bound.
     * @returns Oldest unresolved questions without making or mutating a model request.
     */
    openQuestionContext(agent: Agent, request: MindGardenOpenQuestionContextRequest): Promise<MindGardenOpenQuestionContextResult>;
    /**
     * Derive bounded plaintext evidence for one explicit period without contacting a model.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Calendar scale and browser-observed inclusive date range.
     * @returns Authenticated source snapshots, reviewable items, and one equality hash.
     */
    periodReviewMaterial(agent: Agent, request: MindGardenPeriodReviewMaterialRequest): Promise<MindGardenPeriodReviewMaterialResult>;
    /**
     * Commit a proposed review against an exact authenticated material snapshot.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed material hash, cited source ids, and editable review Markdown.
     * @returns The encrypted proposed review or a stable material, validation, access, or vault failure.
     */
    createPeriodReview(agent: Agent, request: MindGardenCreatePeriodReviewRequest): Promise<MindGardenCreatePeriodReviewResult>;
    /**
     * List encrypted period reviews with freshness derived from current authenticated sources.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Optional scale and archive filters plus a bounded result limit.
     * @returns Newest-first reviews whose source changes are reported without rewriting history.
     */
    listPeriodReviews(agent: Agent, request: MindGardenListPeriodReviewsRequest): Promise<MindGardenListPeriodReviewsResult>;
    /**
     * Replace review content and lifecycle after observing its equality-only version.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Review identity, observed version, replacement Markdown, and status.
     * @returns The updated review while retaining its immutable source snapshot.
     */
    updatePeriodReview(agent: Agent, request: MindGardenUpdatePeriodReviewRequest): Promise<MindGardenUpdatePeriodReviewResult>;
    /**
     * Derive one sparse month projection from authenticated encrypted records.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Strict Gregorian month.
     * @returns Non-empty days with counts and each date's latest check-in summary.
     */
    month(agent: Agent, request: MindGardenCalendarMonthRequest): Promise<MindGardenCalendarMonthResult>;
    /**
     * Read every reflection event for one explicit civil date.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Strict Gregorian date.
     * @returns Creation-ordered detached check-ins and journals.
     */
    day(agent: Agent, request: MindGardenCalendarDayRequest): Promise<MindGardenCalendarDayResult>;
    /**
     * Derive a seven- or thirty-day check-in trend from an explicit end date.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Supported interval length and browser-local end date.
     * @returns Ordered points and whether at least three distinct dates can be plotted.
     */
    trend(agent: Agent, request: MindGardenReflectionTrendRequest): Promise<MindGardenReflectionTrendResult>;
    /**
     * Select bounded reflection context without sending it to a model.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Current conversation query and optional browser-local date.
     * @returns The latest same-day check-in when requested and only explicitly retrievable journal excerpts.
     */
    authorizedContext(agent: Agent, request: MindGardenAuthorizedContextRequest): Promise<MindGardenAuthorizedContextResult>;
    private accessFailure;
    private assertContemplationSource;
    private validateStamp;
    private validateLocalDate;
    private validateMonth;
    private validateEmotionWords;
    private validateReminder;
    private validateExperimentReviewStamp;
    private validatePeriodType;
    private validatePeriodReviewRange;
    private buildPeriodReviewMaterial;
    private resolveExperimentSource;
    private resolveOpenQuestionSource;
    private validateConcernLimit;
    private validateListLimit;
    private validatePrincipleContent;
    private validatePrincipleItems;
    private text;
    private invalid;
    private readRecords;
    private writeRecord;
    private requireJournal;
    private requireConcern;
    private requireContemplation;
    private requireConfirmedContemplation;
    private requirePrinciple;
    private requirePrincipleProposal;
    private requireExperiment;
    private requireOpenQuestion;
    private requirePeriodReview;
    private assertVersion;
    private assertConcernActive;
    private assertConcernVersion;
    private assertContemplationDraft;
    private assertContemplationVersion;
    private assertPrincipleVersion;
    private assertPrincipleProposalVersion;
    private principleProposalClosed;
    private assertPrincipleVersionCapacity;
    private assertExperimentVersion;
    private assertOpenQuestionVersion;
    private assertPeriodReviewVersion;
    private experimentStateConflict;
    private assertPrincipleRecordIntegrity;
    private settleConcernConversion;
    private convertFailure;
    private enqueue;
}
export default MindGardenReflectionService;
//# sourceMappingURL=index.d.ts.map