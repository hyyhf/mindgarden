/**
 * Encrypted Star Map ritual, profile, and governed constellation traits.
 * @module @deepseek-ai/dsh-mind-garden/star-map
 */
import { Context } from '@deepseek-ai/cordis';
import s from '@deepseek-ai/schemastery';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { MindGardenApplyStarCardRevisionRequest, MindGardenApplyStarCardRevisionResult, MindGardenCalibrateStarCardRequest, MindGardenCalibrateStarCardResult, MindGardenCompleteStarRitualRequest, MindGardenCompleteStarRitualResult, MindGardenContinueStarCardRequest, MindGardenContinueStarCardResult, MindGardenDrawStarCardRequest, MindGardenDrawStarCardResult, MindGardenFinalizeStarCardRequest, MindGardenFinalizeStarCardResult, MindGardenSaveStarRitualRequest, MindGardenSaveStarRitualResult, MindGardenStarMapOverviewResult, MindGardenStarProfile, MindGardenUpdateStarProfileRequest, MindGardenUpdateStarProfileResult, MindGardenUpdateStarTraitRequest, MindGardenUpdateStarTraitResult } from './types.ts';
export type * from './types.ts';
export { decodeStoredStarState, storedStarCardSchema, storedStarDialogueRunSchema, storedStarObservationRunSchema, storedStarProfileSchema, storedStarStateSchema, storedStarTraitSchema, } from './records.ts';
export { buildStarObserverDialogueEnvelope, buildStarObserverEnvelope, decodeStarObserverDialogueOutput, decodeStarObserverOutput, STAR_OBSERVER_DIALOGUE_SYSTEM_PROMPT, STAR_OBSERVER_SYSTEM_PROMPT, type StarObserverEnvelope, type StarObserverProposal, type StarObserverSource, } from './observer.ts';
/** Cordis plugin name. */
export declare const name = "mind-garden-star-map";
/** Cordis plugin configuration. */
export interface Config {
    /** Maximum UTF-8 bytes accepted for the private display name. */
    maxDisplayNameBytes?: number;
    /** Maximum UTF-8 bytes accepted for an optional birthplace. */
    maxLocationBytes?: number;
    /** Maximum UTF-8 bytes accepted for the observation intention. */
    maxIntentBytes?: number;
    /** Maximum UTF-8 bytes accepted for one trait label or description. */
    maxTraitTextBytes?: number;
    /** Maximum self-authored words admitted by the ritual. */
    maxSelfWords?: number;
    /** Maximum UTF-8 bytes accepted for one card-draw question. */
    maxObserverQuestionBytes?: number;
    /** Maximum UTF-8 bytes accepted for one card-owned dialogue message. */
    maxObserverMessageBytes?: number;
    /** Maximum complete UTF-8 bytes sent in one Star Observer request. */
    maxObserverInputBytes?: number;
    /** Maximum provider output tokens accepted for one Star Observer request. */
    maxObserverOutputTokens?: number;
    /** Maximum UTF-8 bytes retained from each authorized evidence source. */
    maxObserverSourceBytes?: number;
    /** Maximum authorized evidence sources admitted to one draw. */
    maxObserverSources?: number;
    /** Optional default observer provider; configure together with `observerModel`. */
    observerProvider?: string;
    /** Optional default observer model; configure together with `observerProvider`. */
    observerModel?: string;
}
/**
 * Return the empty, non-authorized Star Map profile.
 * @returns A frozen profile that has not begun the ritual.
 */
export declare function defaultStarProfile(): MindGardenStarProfile;
declare module '@deepseek-ai/cordis' {
    interface Context {
        mindGardenStarMap: MindGardenStarMapService;
    }
}
/** Encrypted Star Map profile, ritual progress, and user-governed constellation traits. */
export declare class MindGardenStarMapService extends TypertRemoteService {
    static inject: string[];
    /** Loader validation for private copy and bounded ritual inputs. */
    static Config: s<Config>;
    private readonly options;
    private operationTail;
    private observerOperation;
    private readonly observationControllers;
    private admissionOpen;
    /** Install the Star Map Remote and drain admitted operations during disposal. */
    constructor(ctx: Context, config: Config);
    /**
     * Read the current profile and visible traits.
     * @param agent - Exact live Agent whose durable garden owns the Star Map.
     * @returns The immutable current projection or a stable access or vault rejection.
     */
    overview(agent: Agent): Promise<MindGardenStarMapOverviewResult>;
    /**
     * Save one recoverable ritual checkpoint without creating inferred traits.
     * @param agent - Exact live Agent whose durable garden owns the Star Map.
     * @param request - Complete checkpoint and observed profile version.
     * @returns The committed profile projection or a stable rejection.
     */
    saveRitualProgress(agent: Agent, request: MindGardenSaveStarRitualRequest): Promise<MindGardenSaveStarRitualResult>;
    /**
     * Complete the ritual atomically and create only self-authored profile stars.
     * @param agent - Exact live Agent whose durable garden owns the Star Map.
     * @param request - Complete ritual input and observed profile version.
     * @returns The initialized profile and its self-report stars or a stable rejection.
     */
    completeRitual(agent: Agent, request: MindGardenCompleteStarRitualRequest): Promise<MindGardenCompleteStarRitualResult>;
    /**
     * Replace the completed profile without changing its governed trait history.
     * @param agent - Exact live Agent whose durable garden owns the Star Map.
     * @param request - Complete profile replacement and observed version.
     * @returns The updated projection or a stable rejection.
     */
    updateProfile(agent: Agent, request: MindGardenUpdateStarProfileRequest): Promise<MindGardenUpdateStarProfileResult>;
    /**
     * Decide or correct one trait without changing any other constellation record.
     * @param agent - Exact live Agent whose durable garden owns the Star Map.
     * @param request - Trait identity, observed version, and complete decision fields.
     * @returns The updated trait or a stable rejection.
     */
    updateTrait(agent: Agent, request: MindGardenUpdateStarTraitRequest): Promise<MindGardenUpdateStarTraitResult>;
    /**
     * Draw one provisional card from an exact permission-bounded evidence snapshot.
     * @param agent - Exact live Agent whose durable garden authorizes the draw.
     * @param request - Deck, optional question, civil date, tone, and optional route override.
     * @returns One encrypted draft card or a stable access, source, model, or lifecycle rejection.
     */
    drawCard(agent: Agent, request: MindGardenDrawStarCardRequest): Promise<MindGardenDrawStarCardResult>;
    /**
     * Continue one recoverable, card-owned conversation through the shared Observer lane.
     * @param agent - Exact live Agent whose durable garden owns the card.
     * @param request - Card CAS, user message, optional quick-reply kind, and route override.
     * @returns The card with one atomic user/assistant exchange and an inert revision proposal.
     */
    continueCard(agent: Agent, request: MindGardenContinueStarCardRequest): Promise<MindGardenContinueStarCardResult>;
    /**
     * Accept the latest model-proposed revision without treating it as a fresh calibration.
     * @param agent - Exact live Agent whose durable garden owns the card.
     * @param request - Card CAS and exact pending revision identity rendered to the user.
     * @returns The explicitly revised card or a stable stale-revision rejection.
     */
    applyCardRevision(agent: Agent, request: MindGardenApplyStarCardRevisionRequest): Promise<MindGardenApplyStarCardRevisionResult>;
    /**
     * Record the user's verdict and create or revise only this card's governed trait.
     * @param agent - Exact live Agent whose durable garden owns the card.
     * @param request - Card identity, observed version, verdict, and optional correction.
     * @returns The revised draft card or a stable validation and concurrency rejection.
     */
    calibrateCard(agent: Agent, request: MindGardenCalibrateStarCardRequest): Promise<MindGardenCalibrateStarCardResult>;
    /**
     * Save or dissolve one reviewed draft without silently upgrading an inference.
     * @param agent - Exact live Agent whose durable garden owns the card.
     * @param request - Card identity, observed version, and terminal action.
     * @returns The terminal card or a stable concurrency and lifecycle rejection.
     */
    finalizeCard(agent: Agent, request: MindGardenFinalizeStarCardRequest): Promise<MindGardenFinalizeStarCardResult>;
    private runDialogue;
    private prepareDialogue;
    private runObservation;
    private prepareObservation;
    private observationTarget;
    private observationSources;
    private callObservationModel;
    private callDialogueModel;
    private observationFinishFailed;
    private observerContextFingerprint;
    private failObservation;
    private failDialogue;
    private failDialogueInState;
    private failObservationInState;
    private requireCompletedState;
    private validateLocalDate;
    private assertTraitCapacity;
    private accessFailure;
    private resolveProfile;
    private resolveMbti;
    private resolveSelfWords;
    private validateBirthDate;
    private assertProfileVersion;
    private text;
    private invalid;
    private readState;
    private writeState;
    private convertFailure;
    private enqueue;
    private serialize;
}
export default MindGardenStarMapService;
//# sourceMappingURL=index.d.ts.map