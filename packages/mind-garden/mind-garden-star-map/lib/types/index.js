/**
 * Encrypted Star Map ritual, profile, and governed constellation traits.
 * @module @deepseek-ai/dsh-mind-garden/star-map
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import s from '@deepseek-ai/schemastery';
import { BlockAssembler, createUserMessage, ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { MindGardenVaultError, MindGardenVaultRecordId, } from '@deepseek-ai/dsh-mind-garden/vault';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { decodeStoredStarState, storedStarStateSchema, storedStarCardSchema, storedStarDialogueRunSchema, storedStarObservationRunSchema, storedStarTraitSchema, } from "./records.js";
import { buildStarObserverDialogueEnvelope, buildStarObserverEnvelope, decodeStarObserverDialogueOutput, decodeStarObserverOutput, } from "./observer.js";
export { decodeStoredStarState, storedStarCardSchema, storedStarDialogueRunSchema, storedStarObservationRunSchema, storedStarProfileSchema, storedStarStateSchema, storedStarTraitSchema, } from "./records.js";
export { buildStarObserverDialogueEnvelope, buildStarObserverEnvelope, decodeStarObserverDialogueOutput, decodeStarObserverOutput, STAR_OBSERVER_DIALOGUE_SYSTEM_PROMPT, STAR_OBSERVER_SYSTEM_PROMPT, } from "./observer.js";
/** Cordis plugin name. */
export const name = 'mind-garden-star-map';
const STATE_ID = '7f76c63c-e3d1-4fe9-b951-9f703999803b';
const DEFAULT_MAX_DISPLAY_NAME_BYTES = 256;
const DEFAULT_MAX_LOCATION_BYTES = 1024;
const DEFAULT_MAX_INTENT_BYTES = 4096;
const DEFAULT_MAX_TRAIT_TEXT_BYTES = 2048;
const DEFAULT_MAX_SELF_WORDS = 5;
const DEFAULT_MAX_OBSERVER_QUESTION_BYTES = 4096;
const DEFAULT_MAX_OBSERVER_MESSAGE_BYTES = 4096;
const DEFAULT_MAX_OBSERVER_INPUT_BYTES = 32 * 1024;
const DEFAULT_MAX_OBSERVER_SOURCE_BYTES = 1200;
const DEFAULT_MAX_OBSERVER_SOURCES = 12;
const MAX_STORED_TRAITS = 64;
const MAX_DIALOGUE_TURNS = 24;
const STAR_DECKS = ['current-self', 'unfolded-self', 'inner-debate'];
class StarBusinessError extends Error {
    failure;
    constructor(failure) {
        super(failure.code);
        this.failure = failure;
        this.name = 'StarBusinessError';
    }
}
class CorruptStarStoreError extends Error {
    name = 'CorruptStarStoreError';
}
function positiveSafeInteger(value, fallback, name) {
    const resolved = value ?? fallback;
    if (!Number.isSafeInteger(resolved) || resolved < 1) {
        throw new TypeError(`mind-garden-star-map: ${name} must be a positive safe integer`);
    }
    return resolved;
}
function resolveConfig(config) {
    const maxSelfWords = positiveSafeInteger(config.maxSelfWords, DEFAULT_MAX_SELF_WORDS, 'maxSelfWords');
    if (maxSelfWords > DEFAULT_MAX_SELF_WORDS) {
        throw new TypeError(`mind-garden-star-map: maxSelfWords cannot exceed ${DEFAULT_MAX_SELF_WORDS}`);
    }
    const observerProvider = config.observerProvider ?? '';
    const observerModel = config.observerModel ?? '';
    if ((observerProvider.length === 0) !== (observerModel.length === 0)) {
        throw new TypeError('mind-garden-star-map: observerProvider and observerModel must be configured together');
    }
    const maxObserverSources = positiveSafeInteger(config.maxObserverSources, DEFAULT_MAX_OBSERVER_SOURCES, 'maxObserverSources');
    if (maxObserverSources > DEFAULT_MAX_OBSERVER_SOURCES) {
        throw new TypeError(`mind-garden-star-map: maxObserverSources cannot exceed ${DEFAULT_MAX_OBSERVER_SOURCES}`);
    }
    return {
        maxDisplayNameBytes: positiveSafeInteger(config.maxDisplayNameBytes, DEFAULT_MAX_DISPLAY_NAME_BYTES, 'maxDisplayNameBytes'),
        maxLocationBytes: positiveSafeInteger(config.maxLocationBytes, DEFAULT_MAX_LOCATION_BYTES, 'maxLocationBytes'),
        maxIntentBytes: positiveSafeInteger(config.maxIntentBytes, DEFAULT_MAX_INTENT_BYTES, 'maxIntentBytes'),
        maxTraitTextBytes: positiveSafeInteger(config.maxTraitTextBytes, DEFAULT_MAX_TRAIT_TEXT_BYTES, 'maxTraitTextBytes'),
        maxSelfWords,
        maxObserverQuestionBytes: positiveSafeInteger(config.maxObserverQuestionBytes, DEFAULT_MAX_OBSERVER_QUESTION_BYTES, 'maxObserverQuestionBytes'),
        maxObserverMessageBytes: positiveSafeInteger(config.maxObserverMessageBytes, DEFAULT_MAX_OBSERVER_MESSAGE_BYTES, 'maxObserverMessageBytes'),
        maxObserverInputBytes: positiveSafeInteger(config.maxObserverInputBytes, DEFAULT_MAX_OBSERVER_INPUT_BYTES, 'maxObserverInputBytes'),
        ...(config.maxObserverOutputTokens === undefined
            ? {}
            : {
                maxObserverOutputTokens: positiveSafeInteger(config.maxObserverOutputTokens, config.maxObserverOutputTokens, 'maxObserverOutputTokens'),
            }),
        maxObserverSourceBytes: positiveSafeInteger(config.maxObserverSourceBytes, DEFAULT_MAX_OBSERVER_SOURCE_BYTES, 'maxObserverSourceBytes'),
        maxObserverSources,
        observerProvider,
        observerModel,
    };
}
function success(value) {
    return { ok: true, value };
}
function rejected(error) {
    return { ok: false, error };
}
function profileVersion(value) {
    return value;
}
function traitId(value) {
    return value;
}
function traitVersion(value) {
    return value;
}
function cardId(value) {
    return value;
}
function cardVersion(value) {
    return value;
}
function evidenceId(value) {
    return value;
}
function dialogueTurnId(value) {
    return value;
}
function cardRevisionId(value) {
    return value;
}
/**
 * Return the empty, non-authorized Star Map profile.
 * @returns A frozen profile that has not begun the ritual.
 */
export function defaultStarProfile() {
    return Object.freeze({
        version: null,
        onboardingStage: 0,
        onboardingCompleted: false,
        displayName: '',
        birthMonth: null,
        birthDay: null,
        birthYear: null,
        birthTime: '',
        birthTimeKnown: false,
        birthCity: '',
        birthCityKnown: false,
        mbtiMode: 'observe',
        mbtiType: '',
        mbtiAnswers: Object.freeze([]),
        selfWords: Object.freeze([]),
        observationIntent: '',
        observerTone: 'gentle',
        permissions: Object.freeze({
            dailyReflections: false,
            confirmedMemories: false,
            openQuestions: false,
            periodReviews: false,
        }),
        reducedMotion: false,
        createdAt: null,
        updatedAt: null,
    });
}
function snapshotProfile(state) {
    return Object.freeze({
        version: profileVersion(state.version),
        ...state.profile,
        mbtiAnswers: Object.freeze([...state.profile.mbtiAnswers]),
        selfWords: Object.freeze([...state.profile.selfWords]),
        permissions: Object.freeze({ ...state.profile.permissions }),
    });
}
function snapshotTrait(trait) {
    return Object.freeze({
        ...trait,
        id: traitId(trait.id),
        version: traitVersion(trait.version),
    });
}
function snapshotEvidence(evidence) {
    return Object.freeze({ ...evidence, id: evidenceId(evidence.id) });
}
function snapshotCard(card) {
    return Object.freeze({
        ...card,
        id: cardId(card.id),
        version: cardVersion(card.version),
        analysis: Object.freeze({ ...card.analysis }),
        symbolicBasis: Object.freeze([...card.symbolicBasis]),
        evidence: Object.freeze(card.evidence.map(snapshotEvidence)),
        calibration: card.calibration === null ? null : Object.freeze({ ...card.calibration }),
        traitId: card.traitId === null ? null : traitId(card.traitId),
        turns: Object.freeze(card.turns.map(turn => Object.freeze({ ...turn, id: dialogueTurnId(turn.id) }))),
        quickReplies: Object.freeze(card.quickReplies.map(reply => Object.freeze({ ...reply }))),
        pendingRevision: card.pendingRevision === null ? null : Object.freeze({
            ...card.pendingRevision,
            id: cardRevisionId(card.pendingRevision.id),
            analysis: Object.freeze({ ...card.pendingRevision.analysis }),
            symbolicBasis: Object.freeze([...card.pendingRevision.symbolicBasis]),
        }),
    });
}
function snapshotOverview(state) {
    if (state === undefined) {
        return Object.freeze({
            profile: defaultStarProfile(),
            traits: Object.freeze([]),
            cards: Object.freeze([]),
            activeCard: null,
        });
    }
    const visibleCards = state.cards.filter(card => card.status !== 'dissolved').map(snapshotCard);
    return Object.freeze({
        profile: snapshotProfile(state),
        traits: Object.freeze(state.traits.filter(trait => trait.status !== 'retired').map(snapshotTrait)),
        cards: Object.freeze(visibleCards),
        activeCard: visibleCards.find(card => card.status === 'draft') ?? null,
    });
}
function sceneMbti(answers) {
    const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    const pairs = [['E', 'I'], ['J', 'P'], ['F', 'T'], ['N', 'S'], ['I', 'E'], ['T', 'F']];
    answers.forEach((answer, index) => {
        const pair = pairs[index];
        if (pair === undefined)
            return;
        score[answer.endsWith('a') ? pair[0] : pair[1]] += index < 4 ? 2 : 1;
    });
    return [
        score.E >= score.I ? 'E' : 'I',
        score.S >= score.N ? 'S' : 'N',
        score.T >= score.F ? 'T' : 'F',
        score.J >= score.P ? 'J' : 'P',
    ].join('');
}
function truncateUtf8(value, maxBytes) {
    let result = '';
    let used = 0;
    for (const character of value) {
        const bytes = Buffer.byteLength(character, 'utf8');
        if (used + bytes > maxBytes)
            break;
        result += character;
        used += bytes;
    }
    return result;
}
/** Encrypted Star Map profile, ritual progress, and user-governed constellation traits. */
let MindGardenStarMapService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _overview_decorators;
    let _saveRitualProgress_decorators;
    let _completeRitual_decorators;
    let _updateProfile_decorators;
    let _updateTrait_decorators;
    let _drawCard_decorators;
    let _continueCard_decorators;
    let _applyCardRevision_decorators;
    let _calibrateCard_decorators;
    let _finalizeCard_decorators;
    return class MindGardenStarMapService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _overview_decorators = [Remote('overview')];
            _saveRitualProgress_decorators = [Remote('saveRitualProgress')];
            _completeRitual_decorators = [Remote('completeRitual')];
            _updateProfile_decorators = [Remote('updateProfile')];
            _updateTrait_decorators = [Remote('updateTrait')];
            _drawCard_decorators = [Remote('drawCard')];
            _continueCard_decorators = [Remote('continueCard')];
            _applyCardRevision_decorators = [Remote('applyCardRevision')];
            _calibrateCard_decorators = [Remote('calibrateCard')];
            _finalizeCard_decorators = [Remote('finalizeCard')];
            __esDecorate(this, null, _overview_decorators, { kind: "method", name: "overview", static: false, private: false, access: { has: obj => "overview" in obj, get: obj => obj.overview }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _saveRitualProgress_decorators, { kind: "method", name: "saveRitualProgress", static: false, private: false, access: { has: obj => "saveRitualProgress" in obj, get: obj => obj.saveRitualProgress }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _completeRitual_decorators, { kind: "method", name: "completeRitual", static: false, private: false, access: { has: obj => "completeRitual" in obj, get: obj => obj.completeRitual }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateProfile_decorators, { kind: "method", name: "updateProfile", static: false, private: false, access: { has: obj => "updateProfile" in obj, get: obj => obj.updateProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTrait_decorators, { kind: "method", name: "updateTrait", static: false, private: false, access: { has: obj => "updateTrait" in obj, get: obj => obj.updateTrait }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawCard_decorators, { kind: "method", name: "drawCard", static: false, private: false, access: { has: obj => "drawCard" in obj, get: obj => obj.drawCard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _continueCard_decorators, { kind: "method", name: "continueCard", static: false, private: false, access: { has: obj => "continueCard" in obj, get: obj => obj.continueCard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _applyCardRevision_decorators, { kind: "method", name: "applyCardRevision", static: false, private: false, access: { has: obj => "applyCardRevision" in obj, get: obj => obj.applyCardRevision }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calibrateCard_decorators, { kind: "method", name: "calibrateCard", static: false, private: false, access: { has: obj => "calibrateCard" in obj, get: obj => obj.calibrateCard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _finalizeCard_decorators, { kind: "method", name: "finalizeCard", static: false, private: false, access: { has: obj => "finalizeCard" in obj, get: obj => obj.finalizeCard }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = [
            'agents',
            'llm',
            'mindGarden',
            'mindGardenMemory',
            'mindGardenReflection',
            'mindGardenVault',
        ];
        /** Loader validation for private copy and bounded ritual inputs. */
        static Config = s.object({
            maxDisplayNameBytes: s.number().default(DEFAULT_MAX_DISPLAY_NAME_BYTES),
            maxLocationBytes: s.number().default(DEFAULT_MAX_LOCATION_BYTES),
            maxIntentBytes: s.number().default(DEFAULT_MAX_INTENT_BYTES),
            maxTraitTextBytes: s.number().default(DEFAULT_MAX_TRAIT_TEXT_BYTES),
            maxSelfWords: s.number().default(DEFAULT_MAX_SELF_WORDS),
            maxObserverQuestionBytes: s.number().default(DEFAULT_MAX_OBSERVER_QUESTION_BYTES),
            maxObserverMessageBytes: s.number().default(DEFAULT_MAX_OBSERVER_MESSAGE_BYTES),
            maxObserverInputBytes: s.number().default(DEFAULT_MAX_OBSERVER_INPUT_BYTES),
            maxObserverOutputTokens: s.number(),
            maxObserverSourceBytes: s.number().default(DEFAULT_MAX_OBSERVER_SOURCE_BYTES),
            maxObserverSources: s.number().default(DEFAULT_MAX_OBSERVER_SOURCES),
            observerProvider: s.string(),
            observerModel: s.string(),
        });
        options = __runInitializers(this, _instanceExtraInitializers);
        operationTail = Promise.resolve();
        observerOperation = null;
        observationControllers = new Set();
        admissionOpen = true;
        /** Install the Star Map Remote and drain admitted operations during disposal. */
        constructor(ctx, config) {
            super(ctx, 'mindGardenStarMap');
            this.options = resolveConfig(config);
            ctx.effect(() => async () => {
                this.admissionOpen = false;
                for (const controller of this.observationControllers)
                    controller.abort();
                await this.observerOperation?.catch(() => undefined);
                await this.operationTail;
            }, 'mind-garden-star-map.drain');
        }
        /**
         * Read the current profile and visible traits.
         * @param agent - Exact live Agent whose durable garden owns the Star Map.
         * @returns The immutable current projection or a stable access or vault rejection.
         */
        overview(agent) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    return success(snapshotOverview(await this.readState()));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Save one recoverable ritual checkpoint without creating inferred traits.
         * @param agent - Exact live Agent whose durable garden owns the Star Map.
         * @param request - Complete checkpoint and observed profile version.
         * @returns The committed profile projection or a stable rejection.
         */
        saveRitualProgress(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const current = await this.readState();
                    if (current?.profile.onboardingCompleted === true) {
                        throw new StarBusinessError({ code: 'star-ritual-completed' });
                    }
                    this.assertProfileVersion(current, request.ifVersion);
                    if (!Number.isInteger(request.onboardingStage)
                        || request.onboardingStage < 0
                        || request.onboardingStage > 2) {
                        this.invalid('onboardingStage', 'invalid');
                    }
                    const now = Date.now();
                    const onboardingStage = Math.max(current?.profile.onboardingStage ?? 0, request.onboardingStage);
                    const state = storedStarStateSchema.parse({
                        recordType: 'star-state',
                        formatVersion: 1,
                        id: STATE_ID,
                        version: randomUUID(),
                        profile: this.resolveProfile(request, onboardingStage, false, current?.profile.createdAt ?? now, now),
                        traits: [],
                    });
                    await this.writeState(state);
                    return success(snapshotOverview(state));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Complete the ritual atomically and create only self-authored profile stars.
         * @param agent - Exact live Agent whose durable garden owns the Star Map.
         * @param request - Complete ritual input and observed profile version.
         * @returns The initialized profile and its self-report stars or a stable rejection.
         */
        completeRitual(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const current = await this.readState();
                    if (current?.profile.onboardingCompleted === true)
                        return success(snapshotOverview(current));
                    this.assertProfileVersion(current, request.ifVersion);
                    const now = Date.now();
                    const profile = this.resolveProfile(request, 3, true, current?.profile.createdAt ?? now, now);
                    const traits = profile.selfWords.map((word) => ({
                        id: randomUUID(),
                        version: randomUUID(),
                        kind: 'strength',
                        status: 'self-reported',
                        label: word,
                        description: '',
                        confidence: 1,
                        source: 'ritual-self-report',
                        createdAt: now,
                        updatedAt: now,
                    }));
                    const state = storedStarStateSchema.parse({
                        recordType: 'star-state',
                        formatVersion: 1,
                        id: STATE_ID,
                        version: randomUUID(),
                        profile,
                        traits,
                    });
                    await this.writeState(state);
                    return success(snapshotOverview(state));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Replace the completed profile without changing its governed trait history.
         * @param agent - Exact live Agent whose durable garden owns the Star Map.
         * @param request - Complete profile replacement and observed version.
         * @returns The updated projection or a stable rejection.
         */
        updateProfile(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const current = await this.readState();
                    if (current === undefined || !current.profile.onboardingCompleted) {
                        throw new StarBusinessError({ code: 'star-ritual-required' });
                    }
                    this.assertProfileVersion(current, request.ifVersion);
                    const now = Date.now();
                    const state = storedStarStateSchema.parse({
                        ...current,
                        version: randomUUID(),
                        profile: this.resolveProfile(request, 3, true, current.profile.createdAt, now),
                    });
                    await this.writeState(state);
                    return success(snapshotOverview(state));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Decide or correct one trait without changing any other constellation record.
         * @param agent - Exact live Agent whose durable garden owns the Star Map.
         * @param request - Trait identity, observed version, and complete decision fields.
         * @returns The updated trait or a stable rejection.
         */
        updateTrait(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const current = await this.readState();
                    if (current === undefined || !current.profile.onboardingCompleted) {
                        throw new StarBusinessError({ code: 'star-ritual-required' });
                    }
                    const index = current.traits.findIndex(trait => trait.id === request.id);
                    const trait = current.traits[index];
                    if (trait === undefined)
                        throw new StarBusinessError({ code: 'star-trait-not-found', id: request.id });
                    if (trait.version !== request.ifVersion) {
                        throw new StarBusinessError({ code: 'star-trait-version-conflict', current: snapshotTrait(trait) });
                    }
                    if (trait.source === 'ritual-self-report'
                        && request.status !== 'self-reported'
                        && request.status !== 'retired') {
                        this.invalid('trait', 'invalid');
                    }
                    const updated = storedStarTraitSchema.parse({
                        ...trait,
                        version: randomUUID(),
                        status: request.status,
                        label: request.label === undefined
                            ? trait.label
                            : this.text(request.label, 'trait', this.options.maxTraitTextBytes, true),
                        description: request.description === undefined
                            ? trait.description
                            : this.text(request.description, 'trait', this.options.maxTraitTextBytes),
                        updatedAt: Date.now(),
                    });
                    const traits = [...current.traits];
                    traits[index] = updated;
                    const state = storedStarStateSchema.parse({ ...current, traits });
                    await this.writeState(state);
                    return success(snapshotTrait(updated));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Draw one provisional card from an exact permission-bounded evidence snapshot.
         * @param agent - Exact live Agent whose durable garden authorizes the draw.
         * @param request - Deck, optional question, civil date, tone, and optional route override.
         * @returns One encrypted draft card or a stable access, source, model, or lifecycle rejection.
         */
        drawCard(agent, request) {
            if (!this.admissionOpen)
                return Promise.reject(new Error('mind-garden-star-map: service is disposing'));
            const access = this.modelAccessFailure(agent);
            if (access !== null)
                return Promise.resolve(rejected(access));
            if (this.observerOperation !== null) {
                return Promise.resolve(rejected({ code: 'star-observation-in-progress' }));
            }
            const controller = new AbortController();
            this.observationControllers.add(controller);
            const operation = this.runObservation(agent, request, controller.signal).finally(() => {
                this.observationControllers.delete(controller);
                this.observerOperation = null;
            });
            this.observerOperation = operation;
            return operation;
        }
        /**
         * Continue one recoverable, card-owned conversation through the shared Observer lane.
         * @param agent - Exact live Agent whose durable garden owns the card.
         * @param request - Card CAS, user message, optional quick-reply kind, and route override.
         * @returns The card with one atomic user/assistant exchange and an inert revision proposal.
         */
        continueCard(agent, request) {
            if (!this.admissionOpen)
                return Promise.reject(new Error('mind-garden-star-map: service is disposing'));
            const access = this.modelAccessFailure(agent);
            if (access !== null)
                return Promise.resolve(rejected(access));
            if (this.observerOperation !== null) {
                return Promise.resolve(rejected({ code: 'star-observation-in-progress' }));
            }
            const controller = new AbortController();
            this.observationControllers.add(controller);
            const operation = this.runDialogue(agent, request, controller.signal).finally(() => {
                this.observationControllers.delete(controller);
                this.observerOperation = null;
            });
            this.observerOperation = operation;
            return operation;
        }
        /**
         * Accept the latest model-proposed revision without treating it as a fresh calibration.
         * @param agent - Exact live Agent whose durable garden owns the card.
         * @param request - Card CAS and exact pending revision identity rendered to the user.
         * @returns The explicitly revised card or a stable stale-revision rejection.
         */
        applyCardRevision(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const current = await this.requireCompletedState();
                    const index = current.cards.findIndex(card => card.id === request.id);
                    const card = current.cards[index];
                    if (card === undefined)
                        throw new StarBusinessError({ code: 'star-card-not-found', id: request.id });
                    if (card.version !== request.ifVersion) {
                        throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) });
                    }
                    if (card.status === 'dissolved') {
                        throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status });
                    }
                    const revision = card.pendingRevision;
                    if (revision === null || revision.id !== request.revisionId) {
                        throw new StarBusinessError({ code: 'star-card-revision-conflict', current: snapshotCard(card) });
                    }
                    const now = Date.now();
                    const traits = [...current.traits];
                    if (card.traitId !== null) {
                        const traitIndex = traits.findIndex(trait => trait.id === card.traitId);
                        const linked = traits[traitIndex];
                        if (linked === undefined)
                            throw new CorruptStarStoreError('Star Observer card references a missing trait');
                        traits[traitIndex] = storedStarTraitSchema.parse({
                            ...linked,
                            version: randomUUID(),
                            kind: revision.traitKind,
                            status: 'pending',
                            label: revision.title,
                            description: truncateUtf8(revision.frontText, this.options.maxTraitTextBytes),
                            confidence: Math.min(revision.confidence, 0.55),
                            updatedAt: now,
                        });
                    }
                    const updated = storedStarCardSchema.parse({
                        ...card,
                        version: randomUUID(),
                        title: revision.title,
                        frontText: revision.frontText,
                        analysis: revision.analysis,
                        openQuestion: revision.openQuestion,
                        traitKind: revision.traitKind,
                        symbolicBasis: revision.symbolicBasis,
                        confidence: revision.confidence,
                        calibration: null,
                        pendingRevision: null,
                        updatedAt: now,
                    });
                    const cards = [...current.cards];
                    cards[index] = updated;
                    await this.writeState(storedStarStateSchema.parse({ ...current, cards, traits }));
                    return success(snapshotCard(updated));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Record the user's verdict and create or revise only this card's governed trait.
         * @param agent - Exact live Agent whose durable garden owns the card.
         * @param request - Card identity, observed version, verdict, and optional correction.
         * @returns The revised draft card or a stable validation and concurrency rejection.
         */
        calibrateCard(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const current = await this.requireCompletedState();
                    const index = current.cards.findIndex(card => card.id === request.id);
                    const card = current.cards[index];
                    if (card === undefined)
                        throw new StarBusinessError({ code: 'star-card-not-found', id: request.id });
                    if (card.version !== request.ifVersion) {
                        throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) });
                    }
                    if (card.status === 'dissolved') {
                        throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status });
                    }
                    if (!['resonates', 'uncertain', 'rejects'].includes(request.verdict)) {
                        this.invalid('correction', 'invalid');
                    }
                    const correction = this.text(request.correction ?? '', 'correction', this.options.maxTraitTextBytes, request.verdict === 'rejects');
                    const now = Date.now();
                    const traitStatus = request.verdict === 'resonates' ? 'confirmed'
                        : request.verdict === 'uncertain' ? 'uncertain'
                            : 'rejected';
                    const description = truncateUtf8([card.frontText, correction].filter(Boolean).join('\n\nUser correction: '), this.options.maxTraitTextBytes);
                    const traits = [...current.traits];
                    let linkedTraitId = card.traitId;
                    if (linkedTraitId === null) {
                        this.assertTraitCapacity(traits);
                        linkedTraitId = randomUUID();
                        traits.push(storedStarTraitSchema.parse({
                            id: linkedTraitId,
                            version: randomUUID(),
                            kind: card.traitKind,
                            status: traitStatus,
                            label: card.title,
                            description,
                            confidence: request.verdict === 'resonates'
                                ? Math.min(card.confidence, 0.75)
                                : request.verdict === 'uncertain' ? Math.min(card.confidence, 0.45) : 0,
                            source: 'star-observer',
                            createdAt: now,
                            updatedAt: now,
                        }));
                    }
                    else {
                        const traitIndex = traits.findIndex(trait => trait.id === linkedTraitId);
                        const linked = traits[traitIndex];
                        if (linked === undefined)
                            throw new CorruptStarStoreError('Star Observer card references a missing trait');
                        traits[traitIndex] = storedStarTraitSchema.parse({
                            ...linked,
                            version: randomUUID(),
                            kind: card.traitKind,
                            status: traitStatus,
                            label: card.title,
                            description,
                            confidence: request.verdict === 'resonates'
                                ? Math.min(card.confidence, 0.75)
                                : request.verdict === 'uncertain' ? Math.min(card.confidence, 0.45) : 0,
                            updatedAt: now,
                        });
                    }
                    const updated = storedStarCardSchema.parse({
                        ...card,
                        version: randomUUID(),
                        calibration: { verdict: request.verdict, correction, createdAt: now },
                        traitId: linkedTraitId,
                        updatedAt: now,
                    });
                    const cards = [...current.cards];
                    cards[index] = updated;
                    await this.writeState(storedStarStateSchema.parse({ ...current, traits, cards }));
                    return success(snapshotCard(updated));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Save or dissolve one reviewed draft without silently upgrading an inference.
         * @param agent - Exact live Agent whose durable garden owns the card.
         * @param request - Card identity, observed version, and terminal action.
         * @returns The terminal card or a stable concurrency and lifecycle rejection.
         */
        finalizeCard(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const current = await this.requireCompletedState();
                    const index = current.cards.findIndex(card => card.id === request.id);
                    const card = current.cards[index];
                    if (card === undefined)
                        throw new StarBusinessError({ code: 'star-card-not-found', id: request.id });
                    if (card.version !== request.ifVersion) {
                        throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) });
                    }
                    if (card.status !== 'draft') {
                        throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status });
                    }
                    const now = Date.now();
                    const traits = [...current.traits];
                    let linkedTraitId = card.traitId;
                    if (request.action === 'save' && card.cardKind === 'observation' && linkedTraitId === null) {
                        this.assertTraitCapacity(traits);
                        linkedTraitId = randomUUID();
                        traits.push(storedStarTraitSchema.parse({
                            id: linkedTraitId,
                            version: randomUUID(),
                            kind: card.traitKind,
                            status: 'pending',
                            label: card.title,
                            description: truncateUtf8(card.frontText, this.options.maxTraitTextBytes),
                            confidence: Math.min(card.confidence, 0.55),
                            source: 'star-observer',
                            createdAt: now,
                            updatedAt: now,
                        }));
                    }
                    if (request.action === 'dissolve' && linkedTraitId !== null) {
                        const traitIndex = traits.findIndex(trait => trait.id === linkedTraitId);
                        const linked = traits[traitIndex];
                        if (linked === undefined)
                            throw new CorruptStarStoreError('Star Observer card references a missing trait');
                        traits[traitIndex] = storedStarTraitSchema.parse({
                            ...linked,
                            version: randomUUID(),
                            status: 'retired',
                            updatedAt: now,
                        });
                    }
                    const updated = storedStarCardSchema.parse({
                        ...card,
                        version: randomUUID(),
                        status: request.action === 'save' ? 'saved' : 'dissolved',
                        traitId: linkedTraitId,
                        updatedAt: now,
                    });
                    const cards = [...current.cards];
                    cards[index] = updated;
                    await this.writeState(storedStarStateSchema.parse({ ...current, traits, cards }));
                    return success(snapshotCard(updated));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        async runDialogue(agent, request, signal) {
            let prepared;
            try {
                prepared = await this.serialize(() => this.prepareDialogue(agent, request));
            }
            catch (error) {
                return this.convertFailure(error);
            }
            let rawOutput;
            try {
                rawOutput = await this.callDialogueModel(agent, prepared, signal);
            }
            catch {
                await this.serialize(() => this.failDialogue(prepared.run.id, 'model-failed', ''));
                return rejected({ code: 'star-observer-model-failed' });
            }
            const proposal = decodeStarObserverDialogueOutput(rawOutput, prepared.envelope.evidence, prepared.cardKind);
            if (proposal === null) {
                await this.serialize(() => this.failDialogue(prepared.run.id, 'invalid-output', rawOutput));
                return rejected({ code: 'star-observer-output-invalid' });
            }
            try {
                return success(await this.serialize(async () => {
                    const current = await this.requireCompletedState();
                    const cardIndex = current.cards.findIndex(card => card.id === prepared.run.cardId);
                    const card = current.cards[cardIndex];
                    if (card === undefined)
                        throw new StarBusinessError({
                            code: 'star-card-not-found',
                            id: cardId(prepared.run.cardId),
                        });
                    if (card.version !== prepared.run.cardVersion) {
                        await this.failDialogueInState(current, prepared.run.id, 'card-changed', rawOutput);
                        throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) });
                    }
                    if (card.status === 'dissolved') {
                        await this.failDialogueInState(current, prepared.run.id, 'card-changed', rawOutput);
                        throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status });
                    }
                    if (card.turns.length + 2 > MAX_DIALOGUE_TURNS) {
                        await this.failDialogueInState(current, prepared.run.id, 'card-changed', rawOutput);
                        throw new StarBusinessError({ code: 'star-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS });
                    }
                    const now = Date.now();
                    const userTurnId = randomUUID();
                    const assistantTurnId = randomUUID();
                    const updated = storedStarCardSchema.parse({
                        ...card,
                        version: randomUUID(),
                        turns: [
                            ...card.turns,
                            {
                                id: userTurnId,
                                role: 'user',
                                content: prepared.content,
                                quickReplyKind: prepared.quickReplyKind,
                                createdAt: now,
                            },
                            {
                                id: assistantTurnId,
                                role: 'assistant',
                                content: proposal.reply,
                                quickReplyKind: '',
                                createdAt: now,
                            },
                        ],
                        quickReplies: proposal.quickReplies,
                        pendingRevision: proposal.revision === null ? null : {
                            id: randomUUID(),
                            ...proposal.revision,
                            createdAt: now,
                        },
                        updatedAt: now,
                    });
                    const cards = [...current.cards];
                    cards[cardIndex] = updated;
                    const runIndex = current.dialogueRuns.findIndex(run => run.id === prepared.run.id);
                    if (runIndex < 0)
                        throw new CorruptStarStoreError('Star Observer dialogue audit is missing');
                    const dialogueRuns = [...current.dialogueRuns];
                    dialogueRuns[runIndex] = storedStarDialogueRunSchema.parse({
                        ...prepared.run,
                        status: 'completed',
                        failure: null,
                        rawOutput,
                        userTurnId,
                        assistantTurnId,
                        updatedAt: now,
                    });
                    await this.writeState(storedStarStateSchema.parse({ ...current, cards, dialogueRuns }));
                    return snapshotCard(updated);
                }));
            }
            catch (error) {
                return this.convertFailure(error);
            }
        }
        async prepareDialogue(agent, request) {
            let current = await this.requireCompletedState();
            if (current.dialogueRuns.some(run => run.status === 'running')) {
                const now = Date.now();
                current = storedStarStateSchema.parse({
                    ...current,
                    dialogueRuns: current.dialogueRuns.map(run => run.status === 'running'
                        ? { ...run, status: 'failed', failure: 'interrupted', updatedAt: now }
                        : run),
                });
                await this.writeState(current);
            }
            const card = current.cards.find(item => item.id === request.id);
            if (card === undefined)
                throw new StarBusinessError({ code: 'star-card-not-found', id: request.id });
            if (card.version !== request.ifVersion) {
                throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) });
            }
            if (card.status === 'dissolved') {
                throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status });
            }
            if (card.turns.length + 2 > MAX_DIALOGUE_TURNS) {
                throw new StarBusinessError({ code: 'star-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS });
            }
            const content = this.text(request.content, 'message', this.options.maxObserverMessageBytes, true);
            const quickReplyKind = request.quickReplyKind ?? '';
            if (!['', 'deepen', 'shift', 'correct'].includes(quickReplyKind))
                this.invalid('message', 'invalid');
            const target = this.observationTarget(agent, request);
            if (target === null)
                throw new StarBusinessError({ code: 'star-observer-model-unavailable' });
            const envelope = buildStarObserverDialogueEnvelope(snapshotCard(card), content, quickReplyKind, this.options.maxObserverInputBytes);
            if (envelope === null) {
                throw new StarBusinessError({
                    code: 'star-observer-input-too-large',
                    maxBytes: this.options.maxObserverInputBytes,
                });
            }
            const now = Date.now();
            const run = storedStarDialogueRunSchema.parse({
                id: randomUUID(),
                cardId: card.id,
                cardVersion: card.version,
                status: 'running',
                failure: null,
                provider: target.provider,
                model: target.model,
                system: envelope.system,
                prompt: envelope.prompt,
                rawOutput: '',
                userTurnId: null,
                assistantTurnId: null,
                createdAt: now,
                updatedAt: now,
            });
            await this.writeState(storedStarStateSchema.parse({
                ...current,
                dialogueRuns: [...current.dialogueRuns.slice(-31), run],
            }));
            return { run, cardKind: card.cardKind, tone: card.observerTone, envelope, content, quickReplyKind };
        }
        async runObservation(agent, request, signal) {
            let prepared;
            try {
                prepared = await this.serialize(() => this.prepareObservation(agent, request));
            }
            catch (error) {
                return this.convertFailure(error);
            }
            let rawOutput;
            try {
                rawOutput = await this.callObservationModel(agent, prepared, signal);
            }
            catch {
                await this.serialize(() => this.failObservation(prepared.run.id, 'model-failed', ''));
                return rejected({ code: 'star-observer-model-failed' });
            }
            const proposal = decodeStarObserverOutput(rawOutput, prepared.envelope.evidence);
            if (proposal === null) {
                await this.serialize(() => this.failObservation(prepared.run.id, 'invalid-output', rawOutput));
                return rejected({ code: 'star-observer-output-invalid' });
            }
            try {
                return success(await this.serialize(async () => {
                    const current = await this.requireCompletedState();
                    if (current.version !== prepared.run.profileVersion
                        || this.observerContextFingerprint(current) !== prepared.contextFingerprint) {
                        await this.failObservationInState(current, prepared.run.id, 'context-changed', rawOutput);
                        throw new StarBusinessError({ code: 'star-observer-context-changed' });
                    }
                    if (current.cards.some(card => card.status === 'draft')) {
                        await this.failObservationInState(current, prepared.run.id, 'context-changed', rawOutput);
                        throw new StarBusinessError({ code: 'star-observer-context-changed' });
                    }
                    const evidenceByKey = new Map(prepared.envelope.evidence.map((source, index) => [
                        source.key,
                        prepared.run.evidence[index],
                    ]));
                    const cited = proposal.evidenceKeys.map(key => evidenceByKey.get(key));
                    if (cited.some(item => item === undefined)) {
                        await this.failObservationInState(current, prepared.run.id, 'invalid-output', rawOutput);
                        throw new StarBusinessError({ code: 'star-observer-output-invalid' });
                    }
                    const now = Date.now();
                    const id = randomUUID();
                    const card = storedStarCardSchema.parse({
                        id,
                        version: randomUUID(),
                        status: 'draft',
                        deck: prepared.deck,
                        observerTone: prepared.tone,
                        question: prepared.question,
                        title: proposal.title,
                        frontText: proposal.frontText,
                        analysis: proposal.analysis,
                        openQuestion: proposal.openQuestion,
                        cardKind: cited.length > 0 ? 'observation' : 'imagination',
                        traitKind: proposal.traitKind,
                        symbolicBasis: proposal.symbolicBasis,
                        evidence: cited,
                        confidence: proposal.confidence,
                        calibration: null,
                        traitId: null,
                        provider: prepared.run.provider,
                        model: prepared.run.model,
                        createdAt: now,
                        updatedAt: now,
                    });
                    const cards = [...current.cards.slice(-63), card];
                    const knownCardIds = new Set(cards.map(item => item.id));
                    const completedRun = storedStarObservationRunSchema.parse({
                        ...prepared.run,
                        status: 'completed',
                        failure: null,
                        rawOutput,
                        cardId: id,
                        updatedAt: now,
                    });
                    const observationRuns = current.observationRuns
                        .filter(run => run.id !== completedRun.id)
                        .filter(run => run.cardId === null || knownCardIds.has(run.cardId))
                        .concat(completedRun)
                        .slice(-32);
                    const dialogueRuns = current.dialogueRuns.filter(run => knownCardIds.has(run.cardId));
                    await this.writeState(storedStarStateSchema.parse({
                        ...current,
                        cards,
                        observationRuns,
                        dialogueRuns,
                    }));
                    return snapshotCard(card);
                }));
            }
            catch (error) {
                return this.convertFailure(error);
            }
        }
        async prepareObservation(agent, request) {
            let current = await this.requireCompletedState();
            const interrupted = current.observationRuns.some(run => run.status === 'running');
            if (interrupted) {
                const now = Date.now();
                current = storedStarStateSchema.parse({
                    ...current,
                    observationRuns: current.observationRuns.map(run => run.status === 'running'
                        ? { ...run, status: 'failed', failure: 'interrupted', updatedAt: now }
                        : run),
                });
                await this.writeState(current);
            }
            const activeCard = current.cards.find(card => card.status === 'draft');
            if (activeCard !== undefined) {
                throw new StarBusinessError({ code: 'star-active-card-exists', current: snapshotCard(activeCard) });
            }
            const target = this.observationTarget(agent, request);
            if (target === null)
                throw new StarBusinessError({ code: 'star-observer-model-unavailable' });
            const deck = request.deck === 'random'
                ? STAR_DECKS[Number.parseInt(randomUUID().slice(0, 2), 16) % STAR_DECKS.length] ?? 'current-self'
                : request.deck;
            if (!STAR_DECKS.includes(deck))
                this.invalid('question', 'invalid');
            const tone = request.observerTone ?? current.profile.observerTone;
            if (!['gentle', 'direct', 'mystic'].includes(tone))
                this.invalid('question', 'invalid');
            const question = this.text(request.question, 'question', this.options.maxObserverQuestionBytes);
            this.validateLocalDate(request.observedLocalDate);
            const sources = await this.observationSources(agent, current, request.observedLocalDate, question);
            const envelope = buildStarObserverEnvelope(snapshotProfile(current), current.traits.map(snapshotTrait), deck, question, tone, sources, this.options.maxObserverInputBytes);
            if (envelope === null) {
                throw new StarBusinessError({
                    code: 'star-observer-input-too-large',
                    maxBytes: this.options.maxObserverInputBytes,
                });
            }
            const now = Date.now();
            const evidence = sources.map(source => ({
                id: randomUUID(),
                sourceType: source.sourceType,
                sourceId: source.sourceId,
                summary: source.summary,
            }));
            const run = storedStarObservationRunSchema.parse({
                id: randomUUID(),
                status: 'running',
                failure: null,
                profileVersion: current.version,
                provider: target.provider,
                model: target.model,
                system: envelope.system,
                prompt: envelope.prompt,
                evidence,
                rawOutput: '',
                cardId: null,
                createdAt: now,
                updatedAt: now,
            });
            await this.writeState(storedStarStateSchema.parse({
                ...current,
                observationRuns: [...current.observationRuns.slice(-31), run],
            }));
            return {
                run,
                deck,
                tone,
                question,
                envelope,
                contextFingerprint: this.observerContextFingerprint(current),
            };
        }
        observationTarget(agent, request) {
            const hasOverride = request.provider !== undefined || request.model !== undefined;
            if (hasOverride) {
                if (request.provider === undefined
                    || request.provider.trim().length === 0
                    || request.model === undefined
                    || request.model.trim().length === 0)
                    return null;
                return { provider: request.provider.trim(), model: request.model.trim() };
            }
            if (this.options.observerProvider.length > 0) {
                return { provider: this.options.observerProvider, model: this.options.observerModel };
            }
            const latest = agent.session.requestHeader()?.config;
            if (latest !== undefined)
                return { provider: latest.provider, model: latest.model };
            if (agent.options.provider !== undefined
                && agent.options.provider.length > 0
                && agent.options.model !== undefined
                && agent.options.model.length > 0) {
                return { provider: agent.options.provider, model: agent.options.model };
            }
            return null;
        }
        async observationSources(agent, state, localDate, question) {
            const candidates = [];
            const add = (sourceType, sourceId, summary) => {
                const bounded = truncateUtf8(summary.trim(), this.options.maxObserverSourceBytes);
                if (bounded.length > 0)
                    candidates.push({ sourceType, sourceId, summary: bounded });
            };
            const permissions = state.profile.permissions;
            if (permissions.dailyReflections) {
                const result = await this.ctx.mindGardenReflection.authorizedContext(agent, {
                    localDate,
                    query: question || state.profile.observationIntent,
                });
                if (!result.ok)
                    throw new StarBusinessError({ code: 'star-source-unavailable', source: 'daily-reflection' });
                const checkin = result.value.todayCheckin;
                if (checkin !== null) {
                    add('daily-reflection', String(checkin.id), `Check-in ${checkin.stamp.localDate}: mood ${checkin.moodBand}; energy ${checkin.energyBand}; emotions ${checkin.emotionWords.join(', ') || 'not recorded'}.`);
                }
                for (const journal of result.value.retrievableJournals) {
                    add('daily-reflection', String(journal.id), `${journal.localDate} — ${journal.title}\n${journal.body}`);
                }
            }
            if (permissions.confirmedMemories) {
                const result = await this.ctx.mindGardenMemory.list(agent);
                if (!result.ok)
                    throw new StarBusinessError({ code: 'star-source-unavailable', source: 'confirmed-memory' });
                for (const memory of result.value.items) {
                    if ((memory.status === 'confirmed' || memory.status === 'temporary')
                        && memory.sensitivity === 'normal'
                        && memory.recallPolicy !== 'never') {
                        add('confirmed-memory', String(memory.id), `${memory.kind}: ${memory.content}${memory.scope === undefined ? '' : `\nScope: ${memory.scope}`}`);
                    }
                }
            }
            if (permissions.openQuestions) {
                const result = await this.ctx.mindGardenReflection.openQuestionContext(agent, {});
                if (!result.ok)
                    throw new StarBusinessError({ code: 'star-source-unavailable', source: 'open-question' });
                for (const openQuestion of result.value.openQuestions) {
                    add('open-question', String(openQuestion.id), `${openQuestion.createdLocalDate}: ${openQuestion.question}${openQuestion.evidenceQuote.length === 0 ? '' : `\nEvidence: ${openQuestion.evidenceQuote}`}`);
                }
            }
            if (permissions.periodReviews) {
                const result = await this.ctx.mindGardenReflection.listPeriodReviews(agent, {});
                if (!result.ok)
                    throw new StarBusinessError({ code: 'star-source-unavailable', source: 'period-review' });
                for (const review of result.value.reviews) {
                    if (review.status === 'saved') {
                        add('period-review', String(review.id), `${review.periodType} ${review.startStamp.localDate}–${review.endStamp.localDate}\n${review.content}`);
                    }
                }
            }
            return Object.freeze(candidates.slice(0, this.options.maxObserverSources).map((source, index) => Object.freeze({
                ...source,
                key: `e${index + 1}`,
            })));
        }
        async callObservationModel(agent, prepared, signal) {
            const assembler = new BlockAssembler();
            const options = {
                provider: prepared.run.provider,
                model: prepared.run.model,
                ...(prepared.run.provider === 'deepseek-official' && prepared.run.model === 'deepseek-v4-flash'
                    ? { reasoningEffort: ReasoningEffortId('off') }
                    : {}),
                system: prepared.envelope.system,
                messages: [createUserMessage({
                        content: [{ type: 'text', text: prepared.envelope.prompt }],
                        source: { kind: 'plugin', plugin: name },
                    })],
                temperature: prepared.tone === 'direct' ? 0.25 : prepared.tone === 'mystic' ? 0.55 : 0.4,
                ...(this.options.maxObserverOutputTokens === undefined
                    ? {}
                    : { maxTokens: this.options.maxObserverOutputTokens }),
                sessionId: agent.session.id,
                purpose: 'mind-garden-star-observer-draw',
                signal,
            };
            for await (const chunk of this.ctx.llm.stream(options))
                assembler.push(chunk);
            if (this.observationFinishFailed(assembler.finish)) {
                throw new Error('Star Observer model did not finish completely');
            }
            const blocks = assembler.blocks();
            if (blocks.some(block => block.type !== 'text' && block.type !== 'reasoning')) {
                throw new Error('Star Observer model returned executable content');
            }
            const output = blocks.flatMap(block => block.type === 'text' ? [block.text] : []).join('');
            if (output.trim().length === 0)
                throw new Error('Star Observer model returned empty content');
            return output;
        }
        async callDialogueModel(agent, prepared, signal) {
            const assembler = new BlockAssembler();
            const options = {
                provider: prepared.run.provider,
                model: prepared.run.model,
                ...(prepared.run.provider === 'deepseek-official' && prepared.run.model === 'deepseek-v4-flash'
                    ? { reasoningEffort: ReasoningEffortId('off') }
                    : {}),
                system: prepared.envelope.system,
                messages: [createUserMessage({
                        content: [{ type: 'text', text: prepared.envelope.prompt }],
                        source: { kind: 'plugin', plugin: name },
                    })],
                temperature: prepared.tone === 'direct' ? 0.25 : prepared.tone === 'mystic' ? 0.55 : 0.4,
                ...(this.options.maxObserverOutputTokens === undefined
                    ? {}
                    : { maxTokens: this.options.maxObserverOutputTokens }),
                sessionId: agent.session.id,
                purpose: 'mind-garden-star-observer-dialogue',
                signal,
            };
            for await (const chunk of this.ctx.llm.stream(options))
                assembler.push(chunk);
            if (this.observationFinishFailed(assembler.finish)) {
                throw new Error('Star Observer dialogue model did not finish completely');
            }
            const blocks = assembler.blocks();
            if (blocks.some(block => block.type !== 'text' && block.type !== 'reasoning')) {
                throw new Error('Star Observer dialogue model returned executable content');
            }
            const output = blocks.flatMap(block => block.type === 'text' ? [block.text] : []).join('');
            if (output.trim().length === 0)
                throw new Error('Star Observer dialogue model returned empty content');
            return output;
        }
        observationFinishFailed(finish) {
            return finish.kind !== 'stop';
        }
        observerContextFingerprint(state) {
            return JSON.stringify({
                profileVersion: state.version,
                traits: state.traits
                    .filter(trait => trait.status === 'self-reported' || trait.status === 'confirmed')
                    .map(trait => [trait.id, trait.version, trait.kind, trait.status, trait.label, trait.description]),
            });
        }
        async failObservation(runId, failure, rawOutput) {
            const current = await this.requireCompletedState();
            await this.failObservationInState(current, runId, failure, rawOutput);
        }
        async failDialogue(runId, failure, rawOutput) {
            const current = await this.requireCompletedState();
            await this.failDialogueInState(current, runId, failure, rawOutput);
        }
        async failDialogueInState(current, runId, failure, rawOutput) {
            const index = current.dialogueRuns.findIndex(run => run.id === runId);
            const run = current.dialogueRuns[index];
            if (run === undefined || run.status !== 'running' || failure === null)
                return;
            const dialogueRuns = [...current.dialogueRuns];
            dialogueRuns[index] = storedStarDialogueRunSchema.parse({
                ...run,
                status: 'failed',
                failure,
                rawOutput,
                updatedAt: Date.now(),
            });
            await this.writeState(storedStarStateSchema.parse({ ...current, dialogueRuns }));
        }
        async failObservationInState(current, runId, failure, rawOutput) {
            const index = current.observationRuns.findIndex(run => run.id === runId);
            const run = current.observationRuns[index];
            if (run === undefined || run.status !== 'running' || failure === null)
                return;
            const observationRuns = [...current.observationRuns];
            observationRuns[index] = storedStarObservationRunSchema.parse({
                ...run,
                status: 'failed',
                failure,
                rawOutput,
                updatedAt: Date.now(),
            });
            await this.writeState(storedStarStateSchema.parse({ ...current, observationRuns }));
        }
        async requireCompletedState() {
            const current = await this.readState();
            if (current === undefined || !current.profile.onboardingCompleted) {
                throw new StarBusinessError({ code: 'star-ritual-required' });
            }
            return current;
        }
        validateLocalDate(value) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
                this.invalid('observedLocalDate', 'invalid');
            const parts = value.split('-').map(Number);
            const year = parts[0] ?? Number.NaN;
            const month = parts[1] ?? Number.NaN;
            const day = parts[2] ?? Number.NaN;
            const date = new Date(Date.UTC(year, month - 1, day));
            if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
                this.invalid('observedLocalDate', 'invalid');
            }
        }
        assertTraitCapacity(traits) {
            if (traits.length >= MAX_STORED_TRAITS) {
                throw new StarBusinessError({ code: 'star-trait-limit-reached', max: MAX_STORED_TRAITS });
            }
        }
        accessFailure(agent) {
            if (this.ctx.agents.get(agent.id) !== agent) {
                throw new Error(`mind-garden-star-map: agent '${agent.id}' is not live in this registry`);
            }
            const state = this.ctx.mindGarden.current(agent.session);
            if (state === null)
                return { code: 'mind-garden-not-active' };
            if (state.privacy !== 'durable')
                return { code: 'durable-session-required' };
            return null;
        }
        /** Require recorded provider disclosure only for operations that contact a model. */
        modelAccessFailure(agent) {
            const access = this.accessFailure(agent);
            if (access !== null)
                return access;
            const state = this.ctx.mindGarden.current(agent.session);
            if (state?.modelDisclosureAccepted !== true)
                return { code: 'model-disclosure-required' };
            return null;
        }
        resolveProfile(input, onboardingStage, onboardingCompleted, createdAt, updatedAt) {
            const displayName = this.text(input.displayName, 'displayName', this.options.maxDisplayNameBytes, onboardingCompleted);
            this.validateBirthDate(input.birthMonth, input.birthDay, input.birthYear);
            const birthTime = input.birthTimeKnown
                ? this.text(input.birthTime, 'birthTime', 5, true)
                : '';
            if (input.birthTimeKnown && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(birthTime))
                this.invalid('birthTime', 'invalid');
            const birthCity = input.birthCityKnown
                ? this.text(input.birthCity, 'birthCity', this.options.maxLocationBytes, true)
                : '';
            const mbti = this.resolveMbti(input);
            const selfWords = this.resolveSelfWords(input.selfWords, onboardingCompleted);
            const observationIntent = this.text(input.observationIntent, 'observationIntent', this.options.maxIntentBytes, onboardingCompleted);
            return {
                onboardingStage,
                onboardingCompleted,
                displayName,
                birthMonth: input.birthMonth,
                birthDay: input.birthDay,
                birthYear: input.birthYear,
                birthTime,
                birthTimeKnown: input.birthTimeKnown,
                birthCity,
                birthCityKnown: input.birthCityKnown,
                mbtiMode: input.mbtiMode,
                mbtiType: mbti.type,
                mbtiAnswers: [...mbti.answers],
                selfWords,
                observationIntent,
                observerTone: input.observerTone,
                permissions: { ...input.permissions },
                reducedMotion: input.reducedMotion,
                createdAt,
                updatedAt,
            };
        }
        resolveMbti(input) {
            if (input.mbtiMode === 'observe')
                return { type: '', answers: [] };
            if (input.mbtiMode === 'known') {
                const type = input.mbtiType.trim().toUpperCase();
                if (!/^[EI][SN][TF][JP]$/.test(type))
                    this.invalid('mbti', 'invalid');
                return { type, answers: [] };
            }
            if (input.mbtiAnswers.length !== 6
                || input.mbtiAnswers.some((answer, index) => !answer.startsWith(String(index + 1)))) {
                return this.invalid('mbti', 'invalid');
            }
            return { type: sceneMbti(input.mbtiAnswers), answers: [...input.mbtiAnswers] };
        }
        resolveSelfWords(values, required) {
            if (values.length > this.options.maxSelfWords || (required && values.length === 0)) {
                this.invalid('selfWords', values.length === 0 ? 'blank' : 'invalid');
            }
            const words = values.map(value => this.text(value, 'selfWords', this.options.maxTraitTextBytes, true));
            if (new Set(words).size !== words.length)
                this.invalid('selfWords', 'duplicate');
            return words;
        }
        validateBirthDate(month, day, year) {
            if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
                this.invalid('birthDate', 'invalid');
            }
            if ((month === null) !== (day === null))
                this.invalid('birthDate', 'invalid');
            if (month === null || day === null)
                return;
            if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) {
                this.invalid('birthDate', 'invalid');
            }
            const validationYear = year ?? 2000;
            const date = new Date(Date.UTC(validationYear, month - 1, day));
            if (date.getUTCFullYear() !== validationYear || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
                this.invalid('birthDate', 'invalid');
            }
        }
        assertProfileVersion(state, ifVersion) {
            if ((state === undefined && ifVersion !== null)
                || (state !== undefined && state.version !== ifVersion)) {
                throw new StarBusinessError({
                    code: 'star-profile-version-conflict',
                    current: state === undefined ? defaultStarProfile() : snapshotProfile(state),
                });
            }
        }
        text(value, field, maxBytes, requireValue = false) {
            const text = value.trim();
            if (requireValue && text.length === 0)
                this.invalid(field, 'blank');
            if (Buffer.byteLength(text, 'utf8') > maxBytes)
                this.invalid(field, 'too-large', maxBytes);
            return text;
        }
        invalid(field, reason, maxBytes) {
            throw new StarBusinessError({
                code: 'invalid-field',
                field,
                reason,
                ...(maxBytes === undefined ? {} : { maxBytes }),
            });
        }
        async readState() {
            const entries = await this.ctx.mindGardenVault.entries('stars');
            try {
                if (entries.length === 0)
                    return undefined;
                if (entries.length !== 1)
                    throw new TypeError('Star Map vault contains more than one aggregate');
                const [id, value] = entries[0] ?? [];
                const state = decodeStoredStarState(value);
                if (state.id !== id || state.id !== STATE_ID) {
                    throw new TypeError('vault id differs from authenticated Star Map id');
                }
                return state;
            }
            catch (error) {
                throw new CorruptStarStoreError('Mind Garden Star Map plaintext record is invalid', { cause: error });
            }
        }
        async writeState(state) {
            const validated = decodeStoredStarState(state);
            await this.ctx.mindGardenVault.put('stars', MindGardenVaultRecordId(validated.id), validated);
        }
        convertFailure(error) {
            if (error instanceof StarBusinessError)
                return rejected(error.failure);
            if (error instanceof CorruptStarStoreError) {
                return rejected({ code: 'vault-unavailable', state: 'corrupt-state' });
            }
            if (error instanceof MindGardenVaultError) {
                const state = error.code === 'locked' ? 'locked'
                    : error.code === 'invalid-key' ? 'invalid-key'
                        : error.code === 'key-mismatch' ? 'key-mismatch'
                            : 'corrupt-state';
                return rejected({ code: 'vault-unavailable', state });
            }
            throw error;
        }
        enqueue(operation) {
            if (!this.admissionOpen)
                return Promise.reject(new Error('mind-garden-star-map: service is disposing'));
            return this.serialize(operation);
        }
        serialize(operation) {
            const result = this.operationTail.then(operation);
            this.operationTail = result.then(() => undefined, () => undefined);
            return result;
        }
    };
})();
export { MindGardenStarMapService };
export default MindGardenStarMapService;
//# sourceMappingURL=index.js.map