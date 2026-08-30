/**
 * Attachment-backed photo stories with encrypted metadata and particle settings.
 * @module @deepseek-ai/dsh-mind-garden/media
 */
import { Context } from '@deepseek-ai/cordis';
import s from '@deepseek-ai/schemastery';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { MindGardenContinuePhotoStoryRequest, MindGardenContinuePhotoStoryResult, MindGardenCreatePhotoStoryRequest, MindGardenCreatePhotoStoryResult, MindGardenDeletePhotoStoryRequest, MindGardenDeletePhotoStoryResult, MindGardenListPhotoStoriesRequest, MindGardenListPhotoStoriesResult, MindGardenObservePhotoStoryRequest, MindGardenObservePhotoStoryResult, MindGardenPhotoParticleConfig, MindGardenReadPhotoStoryRequest, MindGardenReadPhotoStoryResult, MindGardenUpdatePhotoStoryRequest, MindGardenUpdatePhotoStoryResult } from './types.ts';
export type * from './types.ts';
export { decodeStoredMediaRecord, mindGardenPhotoParticleConfigSchema, storedPhotoModelRunSchema, storedPhotoStorySchema, } from './records.ts';
export { buildPhotoDialogueEnvelope, buildPhotoObservationEnvelope, decodePhotoDialogueOutput, decodePhotoObservationOutput, PHOTO_DIALOGUE_SYSTEM_PROMPT, PHOTO_OBSERVATION_PROMPT_VERSION, PHOTO_OBSERVATION_SYSTEM_PROMPT, type PhotoDialogueProposal, type PhotoModelEnvelope, type PhotoObservationProposal, } from './observer.ts';
/** Cordis plugin name. */
export declare const name = "mind-garden-media";
/** Cordis plugin configuration. */
export interface Config {
    /** Maximum UTF-8 bytes accepted for one story title. */
    maxTitleBytes?: number;
    /** Maximum UTF-8 bytes accepted for one user-authored story note. */
    maxNoteBytes?: number;
    /** Maximum UTF-8 bytes accepted for an attachment display name. */
    maxNameBytes?: number;
    /** Maximum UTF-8 bytes accepted for one IANA time-zone name. */
    maxTimeZoneBytes?: number;
    /** Maximum stories returned by one list request. */
    maxStoriesPerList?: number;
    /** Maximum UTF-8 bytes accepted for one photo-owned dialogue message. */
    maxObserverMessageBytes?: number;
    /** Maximum complete UTF-8 bytes sent in one photo auxiliary request. */
    maxObserverInputBytes?: number;
    /** Optional deployment-owned output cap for one photo auxiliary request. */
    maxObserverOutputTokens?: number;
    /** Global bound for simultaneous photo-model calls; each story still admits only one. */
    maxConcurrentObserverRequests?: number;
    /** Optional default photo observer provider; configure with `observerModel`. */
    observerProvider?: string;
    /** Optional default photo observer model; configure with `observerProvider`. */
    observerModel?: string;
}
/**
 * Build the default particle behavior for a new photo story.
 *
 * @returns A frozen default particle configuration.
 */
export declare function defaultPhotoParticleConfig(): MindGardenPhotoParticleConfig;
declare module '@deepseek-ai/cordis' {
    interface Context {
        mindGardenMedia: MindGardenMediaService;
    }
}
/** Encrypted photo-story metadata and verified attachment access for Mind Garden. */
export declare class MindGardenMediaService extends TypertRemoteService {
    static inject: string[];
    /** Loader validation for story text, civil metadata, and list bounds. */
    static Config: s<Config>;
    private readonly options;
    private operationTail;
    private readonly modelOperations;
    private readonly modelControllers;
    private admissionOpen;
    /** Install the media Remote and drain admitted operations during disposal. */
    constructor(ctx: Context, config: Config);
    /**
     * Validate, save, and bind one image to encrypted story metadata.
     * @param agent - Exact live Agent whose durable garden owns the story.
     * @param request - Canonical image bytes, civil stamp, copy, and optional presentation.
     * @returns The immutable story snapshot or a stable media-domain rejection.
     */
    createPhotoStory(agent: Agent, request: MindGardenCreatePhotoStoryRequest): Promise<MindGardenCreatePhotoStoryResult>;
    /**
     * List bounded authenticated stories newest first.
     * @param agent - Exact live Agent whose durable garden owns the stories.
     * @param request - Optional result bound within the configured maximum.
     * @returns Current story snapshots or a stable media-domain rejection.
     */
    listPhotoStories(agent: Agent, request: MindGardenListPhotoStoriesRequest): Promise<MindGardenListPhotoStoriesResult>;
    /**
     * Return verified story-owned image bytes as canonical base64.
     * @param agent - Exact live Agent whose durable garden owns the story.
     * @param request - Stable photo-story identity to resolve and verify.
     * @returns The verified attachment reference and bytes, or a stable rejection.
     */
    readPhotoStory(agent: Agent, request: MindGardenReadPhotoStoryRequest): Promise<MindGardenReadPhotoStoryResult>;
    /**
     * Send one private story image through the selected Harness vision route after explicit user action.
     * @param agent - Exact live Agent whose durable garden owns the story.
     * @param request - Story CAS and optional complete provider/model override.
     * @returns The story with frozen unconfirmed grounding and an opening turn.
     */
    observePhotoStory(agent: Agent, request: MindGardenObservePhotoStoryRequest): Promise<MindGardenObservePhotoStoryResult>;
    /**
     * Continue one recoverable photo-owned conversation without resending the image.
     * @param agent - Exact live Agent whose durable garden owns the story.
     * @param request - Story CAS, newest message, continuation kind, and optional route override.
     * @returns The story with one atomic user/assistant exchange.
     */
    continuePhotoStory(agent: Agent, request: MindGardenContinuePhotoStoryRequest): Promise<MindGardenContinuePhotoStoryResult>;
    /**
     * Replace user-authored copy or particle settings under equality-only versioning.
     * @param agent - Exact live Agent whose durable garden owns the story.
     * @param request - Story identity, observed version, and fields to replace.
     * @returns The updated immutable snapshot or a stable media-domain rejection.
     */
    updatePhotoStory(agent: Agent, request: MindGardenUpdatePhotoStoryRequest): Promise<MindGardenUpdatePhotoStoryResult>;
    /**
     * Remove encrypted story metadata; unreferenced immutable bytes follow deployment retention policy.
     * @param agent - Exact live Agent whose durable garden owns the story.
     * @param request - Story identity and equality-only version observed by the caller.
     * @returns An idempotent absent postcondition or a stable version rejection.
     */
    deletePhotoStory(agent: Agent, request: MindGardenDeletePhotoStoryRequest): Promise<MindGardenDeletePhotoStoryResult>;
    private runObservation;
    private prepareObservation;
    private runDialogue;
    private prepareDialogue;
    private callPhotoModel;
    private finishFailed;
    private modelTarget;
    private interruptRunningModelRuns;
    private failedRunRecord;
    private failModelRun;
    private accessFailure;
    /** Require recorded provider disclosure only for operations that contact a model. */
    private modelAccessFailure;
    private imageInput;
    private validateStamp;
    private text;
    private particleConfig;
    private limit;
    private invalid;
    private readRecords;
    private writeRecord;
    private requireStory;
    private convertFailure;
    private enqueue;
    private serialize;
}
export default MindGardenMediaService;
//# sourceMappingURL=index.d.ts.map