/**
 * Encrypted, confirmation-gated long-term memory for Mind Garden.
 * @module @deepseek-ai/dsh-mind-garden/memory
 */
import { Context } from '@deepseek-ai/cordis';
import s from '@deepseek-ai/schemastery';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { MindGardenMemoryAutomationPolicyResult, MindGardenMemoryConfirmRequest, MindGardenMemoryConfirmResult, MindGardenMemoryDeleteRequest, MindGardenMemoryDeleteResult, MindGardenMemoryExtractRequest, MindGardenMemoryExtractResult, MindGardenMemoryLatestAuditResult, MindGardenMemoryLatestExtractionResult, MindGardenMemoryListRevisionsRequest, MindGardenMemoryListRevisionsResult, MindGardenMemoryListResult, MindGardenMemoryProposeRequest, MindGardenMemoryProposeResult, MindGardenMemoryRejectRequest, MindGardenMemoryRejectResult, MindGardenMemoryResolveRelationshipRequest, MindGardenMemoryResolveRelationshipResult, MindGardenMemorySetAutomationPolicyRequest, MindGardenMemorySetAutomationPolicyResult, MindGardenMemoryUpdateRequest, MindGardenMemoryUpdateResult } from './types.ts';
export type * from './types.ts';
export { decodeStoredRecord, storedAuditSchema, storedAutomationPolicySchema, storedAutomationStateSchema, storedExtractionRunSchema, storedMemoryTombstoneSchema, storedMemorySchema, } from './records.ts';
export { buildExtractionEnvelope, decodeExtractionOutput, EXTRACTION_SYSTEM_PROMPT, type ExtractionComparableMemory, type ExtractionEnvelope, type ExtractionProposal, type ExtractionTranscriptRow, } from './extraction.ts';
export { relevanceScore, retrievalTerms, retrieveMemories, userQuery, type MemoryRecall, type RetrievedMemory, } from './retrieval.ts';
/** Cordis plugin name and durable model-message source. */
export declare const name = "mind-garden-memory";
/** Cordis plugin configuration. */
export interface Config {
    /** Maximum UTF-8 bytes retained in one memory statement. */
    readonly maxContentBytes?: number;
    /** Maximum UTF-8 bytes retained in one memory-retention reason. */
    readonly maxReasonBytes?: number;
    /** Maximum UTF-8 bytes retained in one optional scope. */
    readonly maxScopeBytes?: number;
    /** Maximum UTF-8 bytes retained in one exact source quotation. */
    readonly maxEvidenceBytes?: number;
    /** Maximum complete memories injected into one model-visible recall. */
    readonly maxInjectedMemories?: number;
    /** Maximum UTF-8 bytes for one complete model-visible recall, including its header. */
    readonly maxInjectedBytes?: number;
    /** Maximum encrypted retrieval audits retained profile-wide. */
    readonly maxAuditEntries?: number;
    /** Maximum settled encrypted extraction-run audits retained profile-wide. */
    readonly maxExtractionRunEntries?: number;
    /** Maximum whole-day lifetime accepted for a temporary memory. */
    readonly maxTemporaryDays?: number;
    /** Maximum encrypted before-images retained for one memory. */
    readonly maxRevisionsPerMemory?: number;
    /** Maximum candidates retained from one explicit auxiliary-model pass. */
    readonly maxExtractionCandidates?: number;
    /** Minimum model-reported confidence accepted into the review queue. */
    readonly minExtractionConfidence?: number;
    /** Maximum complete serialized transcript bytes sent to extraction. */
    readonly maxExtractionInputBytes?: number;
    /** Maximum complete serialized active-memory bytes sent for relationship suggestions. */
    readonly maxExtractionMemoryBytes?: number;
    /** Maximum output tokens for one auxiliary extraction request. */
    readonly maxExtractionOutputTokens?: number;
    /** Optional default extraction provider; configure together with `extractionModel`. */
    readonly extractionProvider?: string;
    /** Optional default extraction model; configure together with `extractionProvider`. */
    readonly extractionModel?: string;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        mindGardenMemory: MindGardenMemoryService;
    }
}
/** Governed encrypted profile memory, auxiliary extraction, revisions, and deterministic recall. */
export declare class MindGardenMemoryService extends TypertRemoteService {
    static inject: string[];
    /** Loader validation for complete UTF-8, retrieval, audit, and lifetime bounds. */
    static Config: s<Config>;
    private readonly options;
    private operationTail;
    private admissionOpen;
    private readonly extractionOperations;
    private readonly extractionControllers;
    private readonly automationOperations;
    /**
     * Install the Remote service and first-step recall listener.
     * @param ctx - Host context carrying live Agents, Mind Garden state, and the encrypted vault.
     * @param config - Complete text, retrieval, audit, and temporary-memory limits.
     */
    constructor(ctx: Context, config: Config);
    /**
     * List every encrypted profile memory through one activated durable Session.
     * @param agent - Exact live Agent resolved by the Remote boundary.
     * @returns Detached current items, including rejected, superseded, and projected-expired records.
     */
    list(agent: Agent): Promise<MindGardenMemoryListResult>;
    /**
     * Store one encrypted candidate with local-session provenance and recall disabled.
     * @param agent - Exact live Agent and source Session.
     * @param request - Human-authored statement, retention reason, classification, and optional exact evidence.
     * @returns The candidate, or a stable validation, access, or vault failure.
     */
    propose(agent: Agent, request: MindGardenMemoryProposeRequest): Promise<MindGardenMemoryProposeResult>;
    /**
     * Confirm an unrelated candidate with an explicit recall policy and optional bounded expiry.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Candidate identity, observed version, policy, lifetime, and optional correction.
     * @returns The committed confirmed or temporary item, or a stable failure.
     */
    confirm(agent: Agent, request: MindGardenMemoryConfirmRequest): Promise<MindGardenMemoryConfirmResult>;
    /**
     * Edit one candidate or active memory; rejected, superseded, and expired records are immutable.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Observed version and optional replacement fields.
     * @returns The unchanged item for a semantic no-op, otherwise a newly versioned item.
     */
    update(agent: Agent, request: MindGardenMemoryUpdateRequest): Promise<MindGardenMemoryUpdateResult>;
    /**
     * Reject one candidate and keep the encrypted decision for transparency.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Candidate identity and observed version.
     * @returns The rejected item, or a stable failure.
     */
    reject(agent: Agent, request: MindGardenMemoryRejectRequest): Promise<MindGardenMemoryRejectResult>;
    /**
     * Resolve one model-suggested relationship through an explicit human choice.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Candidate version and keep, coexist, or replacement decision.
     * @returns Settled candidate and the active memory retained by the decision.
     */
    resolveRelationship(agent: Agent, request: MindGardenMemoryResolveRelationshipRequest): Promise<MindGardenMemoryResolveRelationshipResult>;
    /**
     * Read one memory's encrypted before-image history.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Memory identity whose revisions should be reviewed.
     * @returns Oldest-first detached revision snapshots.
     */
    listRevisions(agent: Agent, request: MindGardenMemoryListRevisionsRequest): Promise<MindGardenMemoryListRevisionsResult>;
    /**
     * Read this Session's encrypted automatic-extraction authorization and progress.
     * @param agent - Exact live Agent whose Session owns the preference.
     * @returns Explicit policy or the disabled default, plus the latest attempt state.
     */
    automationPolicy(agent: Agent): Promise<MindGardenMemoryAutomationPolicyResult>;
    /**
     * Replace this Session's automatic-extraction authorization without processing older turns.
     * @param agent - Exact live Agent whose Session owns the preference.
     * @param request - Enabled state, cadence, and last observed preference version.
     * @returns The committed preference with its reset forward-only progress cursor.
     */
    setAutomationPolicy(agent: Agent, request: MindGardenMemorySetAutomationPolicyRequest): Promise<MindGardenMemorySetAutomationPolicyResult>;
    /**
     * Run one explicit auxiliary-model pass that can create review-only candidates.
     * @param agent - Exact live Agent and transcript owner.
     * @param request - Optional complete provider/model override.
     * @returns Encrypted run metadata and candidates that still require confirmation or relationship review.
     */
    extract(agent: Agent, request: MindGardenMemoryExtractRequest): Promise<MindGardenMemoryExtractResult>;
    /** Start one single-flight extraction and bind it to service and optional Agent cancellation. */
    private startExtraction;
    /**
     * Read the newest encrypted auxiliary-model extraction audit for this Session.
     * @param agent - Exact live Agent whose Session owns the audit view.
     * @returns Latest run metadata or null before any extraction request.
     */
    latestExtraction(agent: Agent): Promise<MindGardenMemoryLatestExtractionResult>;
    /**
     * Delete one encrypted memory; retrying after absence remains successful.
     * @param agent - Exact live Agent authorizing durable profile access.
     * @param request - Memory identity and last observed version.
     * @returns A stable absent postcondition or version/access/vault failure.
     */
    delete(agent: Agent, request: MindGardenMemoryDeleteRequest): Promise<MindGardenMemoryDeleteResult>;
    /**
     * Read the newest encrypted retrieval audit for this Session.
     * @param agent - Exact live Agent whose Session owns the audit view.
     * @returns The latest audit or null before any retrieval attempt.
     */
    latestAudit(agent: Agent): Promise<MindGardenMemoryLatestAuditResult>;
    /** Coalesce one idle transition into a fail-closed automatic-extraction check. */
    private scheduleAutomaticExtraction;
    /** Claim true Agent idle only when the encrypted policy and new-turn count are due. */
    private runAutomaticExtraction;
    /** Recover an interrupted cursor and determine whether enough new eligible turns exist. */
    private automaticExtractionDue;
    /** Recheck authorization inside maintenance, then durably charge the latest eligible turn. */
    private prepareAutomaticAttempt;
    /** Settle the exact automatic attempt unless a later preference write replaced its cursor. */
    private finishAutomaticAttempt;
    /** Read one unique per-Session automation record and reject ambiguous ciphertext state. */
    private automationRecord;
    /** Project one public preference from its independent authorization and progress records. */
    private automationSnapshot;
    /** Completed turns are eligible unless deterministic safety kept their response local. */
    private eligibleCompletedTurns;
    /** Return the newest eligible completed turn, or the empty-log cursor. */
    private latestEligibleCompletedTurn;
    /** Select human inputs logged inside the exact completed turns charged to one attempt. */
    private userMessageIdsForTurns;
    /** Require the exact registry-owned Agent, then project the memory access policy. */
    private accessFailure;
    /** Read, authenticate, decode, and cross-check every record in one vault snapshot. */
    private readRecords;
    /** Validate once more, then commit through the ciphertext-only vault API. */
    private writeRecord;
    /** Find one memory without allowing audit ids to enter memory mutations. */
    private requireMemory;
    /** Retain one bounded encrypted before-image for a material mutation. */
    private appendRevision;
    /** Confirm one related candidate while recording the explicit coexist decision. */
    private acceptCandidate;
    /** Validate the optional whole-day lifetime shared by confirmation paths. */
    private assertTemporaryDays;
    /** Merge exact provenance tuples without losing target history. */
    private mergeSources;
    /** Compare one equality-only version and include the authoritative view on failure. */
    private assertVersion;
    /** Validate and preserve one required string without trimming user-owned content. */
    private requiredText;
    /** Normalize blank optional scope to absence and bound any retained value. */
    private optionalScope;
    /** Enforce one complete UTF-8 field bound. */
    private assertBytes;
    /** Preserve exact evidence only when the cited user message contains it. */
    private resolveSource;
    /** Refuse common credential shapes even though the vault itself is encrypted. */
    private assertNotCredentialLike;
    /** High-sensitivity records retain local visibility but can never enter model context. */
    private assertRecallAllowed;
    /** Execute one recoverable extraction without holding the profile writer during provider I/O. */
    private runExtraction;
    /** Close interrupted audit rows and finish one durable commit plan before starting new provider I/O. */
    private recoverExtraction;
    /** Resolve exact route and commit the encrypted model-visible request before dispatch. */
    private prepareExtraction;
    /** Resolve request override, package default, latest routed call, then Agent fallback. */
    private extractionTarget;
    /** Assemble one text-only auxiliary response and reject every incomplete finish. */
    private callExtractionModel;
    /** Treat only an ordinary stop as a complete structured extraction response. */
    private extractionFinishFailed;
    /** Convert reviewed model proposals into bounded, evidence-valid, encrypted candidates. */
    private extractionCandidates;
    /** Finish a durable plan idempotently; missing candidate writes are replayed from ciphertext. */
    private commitExtractionRun;
    /** Settle one pre-dispatch extraction audit without exposing provider text in the failure. */
    private failExtractionRun;
    /** Normalize model-authored candidate text only for exact duplicate suppression. */
    private normalizedCandidateContent;
    /** Reject diagnostic or hidden-cause claims from the candidate queue. */
    private forbiddenInference;
    /** Select a bounded recall and persist its audit before releasing plaintext to the loop. */
    private prepareRecall;
    /** Keep the newest configured number of audits without counting memory records. */
    private pruneAudits;
    /** Keep the newest settled extraction audits without deleting live recovery state. */
    private pruneExtractionRuns;
    /** Convert only known validation and encrypted-boundary failures; preserve programming errors. */
    private convertFailure;
    /** Serialize every complete read/compare/write and retrieval-audit transaction. */
    private enqueue;
    /** Return a non-secret log diagnostic for a fail-closed retrieval path. */
    private safeDiagnostic;
}
export default MindGardenMemoryService;
//# sourceMappingURL=index.d.ts.map