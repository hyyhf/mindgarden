/**
 * Attachment-backed photo stories with encrypted metadata and particle settings.
 * @module @deepseek-ai/dsh-mind-garden/media
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
import { AttachmentId, AttachmentError, isImageAdmissionError, } from '@deepseek-ai/dsh-attachment';
import { BlockAssembler, createUserMessage } from '@deepseek-ai/dsh-llm';
import { MindGardenVaultError, MindGardenVaultRecordId, } from '@deepseek-ai/dsh-mind-garden/vault';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { decodeStoredMediaRecord, mindGardenPhotoParticleConfigSchema, storedPhotoModelRunSchema, storedPhotoStorySchema, } from "./records.js";
import { buildPhotoDialogueEnvelope, buildPhotoObservationEnvelope, decodePhotoDialogueOutput, decodePhotoObservationOutput, PHOTO_OBSERVATION_PROMPT_VERSION, } from "./observer.js";
export { decodeStoredMediaRecord, mindGardenPhotoParticleConfigSchema, storedPhotoModelRunSchema, storedPhotoStorySchema, } from "./records.js";
export { buildPhotoDialogueEnvelope, buildPhotoObservationEnvelope, decodePhotoDialogueOutput, decodePhotoObservationOutput, PHOTO_DIALOGUE_SYSTEM_PROMPT, PHOTO_OBSERVATION_PROMPT_VERSION, PHOTO_OBSERVATION_SYSTEM_PROMPT, } from "./observer.js";
/** Cordis plugin name. */
export const name = 'mind-garden-media';
const DEFAULT_MAX_TITLE_BYTES = 512;
const DEFAULT_MAX_NOTE_BYTES = 128 * 1024;
const DEFAULT_MAX_NAME_BYTES = 1024;
const DEFAULT_MAX_TIME_ZONE_BYTES = 128;
const DEFAULT_MAX_STORIES_PER_LIST = 100;
const DEFAULT_MAX_OBSERVER_MESSAGE_BYTES = 4096;
const DEFAULT_MAX_OBSERVER_INPUT_BYTES = 24 * 1024;
const DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS = 1600;
const MAX_DIALOGUE_TURNS = 25;
class MediaBusinessError extends Error {
    failure;
    constructor(failure) {
        super(failure.code);
        this.failure = failure;
        this.name = 'MediaBusinessError';
    }
}
class CorruptMediaStoreError extends Error {
    name = 'CorruptMediaStoreError';
}
function positiveInteger(value, fallback) {
    return value === undefined ? fallback : value;
}
function resolveConfig(config) {
    const observerProvider = config.observerProvider?.trim() ?? '';
    const observerModel = config.observerModel?.trim() ?? '';
    if ((observerProvider.length === 0) !== (observerModel.length === 0)) {
        throw new TypeError('mind-garden-media: observerProvider and observerModel must be configured together');
    }
    return {
        maxTitleBytes: positiveInteger(config.maxTitleBytes, DEFAULT_MAX_TITLE_BYTES),
        maxNoteBytes: positiveInteger(config.maxNoteBytes, DEFAULT_MAX_NOTE_BYTES),
        maxNameBytes: positiveInteger(config.maxNameBytes, DEFAULT_MAX_NAME_BYTES),
        maxTimeZoneBytes: positiveInteger(config.maxTimeZoneBytes, DEFAULT_MAX_TIME_ZONE_BYTES),
        maxStoriesPerList: positiveInteger(config.maxStoriesPerList, DEFAULT_MAX_STORIES_PER_LIST),
        maxObserverMessageBytes: positiveInteger(config.maxObserverMessageBytes, DEFAULT_MAX_OBSERVER_MESSAGE_BYTES),
        maxObserverInputBytes: positiveInteger(config.maxObserverInputBytes, DEFAULT_MAX_OBSERVER_INPUT_BYTES),
        maxObserverOutputTokens: positiveInteger(config.maxObserverOutputTokens, DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS),
        observerProvider,
        observerModel,
    };
}
/**
 * Build the default particle behavior for a new photo story.
 *
 * @returns A frozen default particle configuration.
 */
export function defaultPhotoParticleConfig() {
    return Object.freeze({
        version: 1,
        preset: 'soft',
        rendering: Object.freeze({
            quality: 'high', pointSize: 2.45, density: 0.94, opacity: 0.98,
            preserveColors: true, background: '#100f14',
        }),
        depth: Object.freeze({ strength: 28, randomness: 4 }),
        interaction: Object.freeze({
            mode: 'repel', radius: 1.25, strength: 2.8, velocityInfluence: 0.55,
            vortexStrength: 0, clickBurst: true,
        }),
        physics: Object.freeze({
            spring: 5.5, damping: 0.94, maxVelocity: 7, maxDistance: 8, turbulence: 0.12,
        }),
        animation: Object.freeze({ idleStrength: 0.56, idleSpeed: 0.42, paperStrength: 0.55, paperSpeed: 0.28 }),
        effects: Object.freeze({
            saturation: 1.02, exposure: 1.02, tint: '#ffffff', tintMix: 0, bloom: 0.34, vignette: 0.28,
        }),
    });
}
function success(value) {
    return { ok: true, value };
}
function rejected(error) {
    return { ok: false, error };
}
function mediaId(value) {
    return value;
}
function mediaVersion(value) {
    return value;
}
function observationId(value) {
    return value;
}
function dialogueTurnId(value) {
    return value;
}
function attachmentRef(value) {
    return Object.freeze({
        attachmentId: AttachmentId(value.attachmentId),
        mediaType: value.mediaType,
        bytes: value.bytes,
        width: value.width,
        height: value.height,
        ...(value.name === undefined ? {} : { name: value.name }),
    });
}
function snapshot(record) {
    return Object.freeze({
        type: 'photo-story',
        id: mediaId(record.id),
        version: mediaVersion(record.version),
        attachment: attachmentRef(record.attachment),
        title: record.title,
        note: record.note,
        stamp: Object.freeze({ ...record.stamp }),
        particleConfig: Object.freeze(structuredClone(record.particleConfig)),
        observation: record.observation === null ? null : Object.freeze({
            ...record.observation,
            id: observationId(record.observation.id),
            grounding: Object.freeze({
                ...record.observation.grounding,
                visibleElements: Object.freeze([...record.observation.grounding.visibleElements]),
                textInImage: Object.freeze([...record.observation.grounding.textInImage]),
                uncertainDetails: Object.freeze([...record.observation.grounding.uncertainDetails]),
            }),
        }),
        turns: Object.freeze(record.turns.map(turn => Object.freeze({ ...turn, id: dialogueTurnId(turn.id) }))),
        quickReplies: Object.freeze(record.quickReplies.map(reply => Object.freeze({ ...reply }))),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    });
}
function canonicalBase64(value) {
    if (value.length === 0)
        return null;
    const decoded = Buffer.from(value, 'base64');
    return decoded.toString('base64') === value ? decoded : null;
}
/** Encrypted photo-story metadata and verified attachment access for Mind Garden. */
let MindGardenMediaService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _createPhotoStory_decorators;
    let _listPhotoStories_decorators;
    let _readPhotoStory_decorators;
    let _observePhotoStory_decorators;
    let _continuePhotoStory_decorators;
    let _updatePhotoStory_decorators;
    let _deletePhotoStory_decorators;
    return class MindGardenMediaService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _createPhotoStory_decorators = [Remote('createPhotoStory')];
            _listPhotoStories_decorators = [Remote('listPhotoStories')];
            _readPhotoStory_decorators = [Remote('readPhotoStory')];
            _observePhotoStory_decorators = [Remote('observePhotoStory')];
            _continuePhotoStory_decorators = [Remote('continuePhotoStory')];
            _updatePhotoStory_decorators = [Remote('updatePhotoStory')];
            _deletePhotoStory_decorators = [Remote('deletePhotoStory')];
            __esDecorate(this, null, _createPhotoStory_decorators, { kind: "method", name: "createPhotoStory", static: false, private: false, access: { has: obj => "createPhotoStory" in obj, get: obj => obj.createPhotoStory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listPhotoStories_decorators, { kind: "method", name: "listPhotoStories", static: false, private: false, access: { has: obj => "listPhotoStories" in obj, get: obj => obj.listPhotoStories }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _readPhotoStory_decorators, { kind: "method", name: "readPhotoStory", static: false, private: false, access: { has: obj => "readPhotoStory" in obj, get: obj => obj.readPhotoStory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _observePhotoStory_decorators, { kind: "method", name: "observePhotoStory", static: false, private: false, access: { has: obj => "observePhotoStory" in obj, get: obj => obj.observePhotoStory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _continuePhotoStory_decorators, { kind: "method", name: "continuePhotoStory", static: false, private: false, access: { has: obj => "continuePhotoStory" in obj, get: obj => obj.continuePhotoStory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updatePhotoStory_decorators, { kind: "method", name: "updatePhotoStory", static: false, private: false, access: { has: obj => "updatePhotoStory" in obj, get: obj => obj.updatePhotoStory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deletePhotoStory_decorators, { kind: "method", name: "deletePhotoStory", static: false, private: false, access: { has: obj => "deletePhotoStory" in obj, get: obj => obj.deletePhotoStory }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['agents', 'attachments', 'llm', 'mindGarden', 'mindGardenVault'];
        /** Loader validation for story text, civil metadata, and list bounds. */
        static Config = s.object({
            maxTitleBytes: s.number().default(DEFAULT_MAX_TITLE_BYTES),
            maxNoteBytes: s.number().default(DEFAULT_MAX_NOTE_BYTES),
            maxNameBytes: s.number().default(DEFAULT_MAX_NAME_BYTES),
            maxTimeZoneBytes: s.number().default(DEFAULT_MAX_TIME_ZONE_BYTES),
            maxStoriesPerList: s.number().default(DEFAULT_MAX_STORIES_PER_LIST),
            maxObserverMessageBytes: s.number().default(DEFAULT_MAX_OBSERVER_MESSAGE_BYTES),
            maxObserverInputBytes: s.number().default(DEFAULT_MAX_OBSERVER_INPUT_BYTES),
            maxObserverOutputTokens: s.number().default(DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS),
            observerProvider: s.string().default(''),
            observerModel: s.string().default(''),
        });
        options = __runInitializers(this, _instanceExtraInitializers);
        operationTail = Promise.resolve();
        modelOperation = null;
        modelControllers = new Set();
        admissionOpen = true;
        /** Install the media Remote and drain admitted operations during disposal. */
        constructor(ctx, config) {
            super(ctx, 'mindGardenMedia');
            this.options = resolveConfig(config);
            ctx.effect(() => async () => {
                this.admissionOpen = false;
                for (const controller of this.modelControllers)
                    controller.abort();
                await this.modelOperation?.catch(() => undefined);
                await this.operationTail;
            }, 'mind-garden-media.drain');
        }
        /**
         * Validate, save, and bind one image to encrypted story metadata.
         * @param agent - Exact live Agent whose durable garden owns the story.
         * @param request - Canonical image bytes, civil stamp, copy, and optional presentation.
         * @returns The immutable story snapshot or a stable media-domain rejection.
         */
        createPhotoStory(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const input = this.imageInput(request);
                    const stamp = this.validateStamp(request.stamp);
                    const title = this.text(request.title ?? '', 'title', this.options.maxTitleBytes);
                    const note = this.text(request.note ?? '', 'note', this.options.maxNoteBytes);
                    const particleConfig = this.particleConfig(request.particleConfig ?? defaultPhotoParticleConfig());
                    let attachment;
                    try {
                        attachment = await this.ctx.attachments.saveImage(input);
                    }
                    catch (error) {
                        if (isImageAdmissionError(error)) {
                            throw new MediaBusinessError({ code: 'attachment-rejected', reason: error.code });
                        }
                        if (error instanceof AttachmentError) {
                            throw new MediaBusinessError({ code: 'attachment-unavailable' });
                        }
                        throw error;
                    }
                    const now = Date.now();
                    const record = storedPhotoStorySchema.parse({
                        recordType: 'photo-story',
                        formatVersion: 1,
                        id: randomUUID(),
                        version: randomUUID(),
                        attachment,
                        title,
                        note,
                        stamp,
                        particleConfig,
                        createdAt: now,
                        updatedAt: now,
                    });
                    await this.writeRecord(record);
                    return success(snapshot(record));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * List bounded authenticated stories newest first.
         * @param agent - Exact live Agent whose durable garden owns the stories.
         * @param request - Optional result bound within the configured maximum.
         * @returns Current story snapshots or a stable media-domain rejection.
         */
        listPhotoStories(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const limit = this.limit(request.limit);
                    const stories = (await this.readRecords())
                        .sort((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id))
                        .slice(0, limit)
                        .map(snapshot);
                    return success({ stories: Object.freeze(stories) });
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Return verified story-owned image bytes as canonical base64.
         * @param agent - Exact live Agent whose durable garden owns the story.
         * @param request - Stable photo-story identity to resolve and verify.
         * @returns The verified attachment reference and bytes, or a stable rejection.
         */
        readPhotoStory(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const story = this.requireStory(await this.readRecords(), request.id);
                    try {
                        const stored = await this.ctx.attachments.readImage(attachmentRef(story.attachment));
                        return success({
                            attachment: Object.freeze({ ...stored.ref }),
                            data: Buffer.from(stored.data).toString('base64'),
                        });
                    }
                    catch (error) {
                        if (error instanceof AttachmentError) {
                            return rejected({ code: 'attachment-unavailable' });
                        }
                        throw error;
                    }
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Send one private story image through the selected Harness vision route after explicit user action.
         * @param agent - Exact live Agent whose durable garden owns the story.
         * @param request - Story CAS and optional complete provider/model override.
         * @returns The story with frozen unconfirmed grounding and an opening turn.
         */
        observePhotoStory(agent, request) {
            if (!this.admissionOpen)
                return Promise.reject(new Error('mind-garden-media: service is disposing'));
            const access = this.accessFailure(agent);
            if (access !== null)
                return Promise.resolve(rejected(access));
            if (this.modelOperation !== null)
                return Promise.resolve(rejected({ code: 'photo-model-in-progress' }));
            const controller = new AbortController();
            this.modelControllers.add(controller);
            const operation = this.runObservation(agent, request, controller.signal).finally(() => {
                this.modelControllers.delete(controller);
                this.modelOperation = null;
            });
            this.modelOperation = operation;
            return operation;
        }
        /**
         * Continue one recoverable photo-owned conversation without resending the image.
         * @param agent - Exact live Agent whose durable garden owns the story.
         * @param request - Story CAS, newest message, continuation kind, and optional route override.
         * @returns The story with one atomic user/assistant exchange.
         */
        continuePhotoStory(agent, request) {
            if (!this.admissionOpen)
                return Promise.reject(new Error('mind-garden-media: service is disposing'));
            const access = this.accessFailure(agent);
            if (access !== null)
                return Promise.resolve(rejected(access));
            if (this.modelOperation !== null)
                return Promise.resolve(rejected({ code: 'photo-model-in-progress' }));
            const controller = new AbortController();
            this.modelControllers.add(controller);
            const operation = this.runDialogue(agent, request, controller.signal).finally(() => {
                this.modelControllers.delete(controller);
                this.modelOperation = null;
            });
            this.modelOperation = operation;
            return operation;
        }
        /**
         * Replace user-authored copy or particle settings under equality-only versioning.
         * @param agent - Exact live Agent whose durable garden owns the story.
         * @param request - Story identity, observed version, and fields to replace.
         * @returns The updated immutable snapshot or a stable media-domain rejection.
         */
        updatePhotoStory(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    if (request.title === undefined && request.note === undefined && request.particleConfig === undefined) {
                        this.invalid('mutation', 'blank');
                    }
                    const current = this.requireStory(await this.readRecords(), request.id);
                    if (current.version !== request.ifVersion) {
                        throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) });
                    }
                    const record = storedPhotoStorySchema.parse({
                        ...current,
                        version: randomUUID(),
                        title: request.title === undefined
                            ? current.title
                            : this.text(request.title, 'title', this.options.maxTitleBytes),
                        note: request.note === undefined
                            ? current.note
                            : this.text(request.note, 'note', this.options.maxNoteBytes),
                        particleConfig: request.particleConfig === undefined
                            ? current.particleConfig
                            : this.particleConfig(request.particleConfig),
                        updatedAt: Date.now(),
                    });
                    await this.writeRecord(record);
                    return success(snapshot(record));
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        /**
         * Remove encrypted story metadata; unreferenced immutable bytes follow deployment retention policy.
         * @param agent - Exact live Agent whose durable garden owns the story.
         * @param request - Story identity and equality-only version observed by the caller.
         * @returns An idempotent absent postcondition or a stable version rejection.
         */
        deletePhotoStory(agent, request) {
            return this.enqueue(async () => {
                const access = this.accessFailure(agent);
                if (access !== null)
                    return rejected(access);
                try {
                    const records = await this.readRecords();
                    const current = records.find(record => record.id === request.id);
                    if (current === undefined)
                        return success({ absent: true });
                    if (current.version !== request.ifVersion) {
                        throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) });
                    }
                    await this.ctx.mindGardenVault.delete('media', MindGardenVaultRecordId(current.id));
                    return success({ absent: true });
                }
                catch (error) {
                    return this.convertFailure(error);
                }
            });
        }
        async runObservation(agent, request, signal) {
            let prepared;
            try {
                prepared = await this.serialize(() => this.prepareObservation(agent, request, signal));
            }
            catch (error) {
                return this.convertFailure(error);
            }
            let rawOutput;
            try {
                rawOutput = await this.callPhotoModel(agent, prepared, 'observation', signal);
            }
            catch {
                await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'model-failed', ''));
                return rejected({ code: 'photo-model-failed' });
            }
            const proposal = decodePhotoObservationOutput(rawOutput);
            if (proposal === null) {
                await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'invalid-output', rawOutput));
                return rejected({ code: 'photo-output-invalid' });
            }
            try {
                return success(await this.serialize(async () => {
                    const records = await this.readRecords();
                    const index = records.findIndex(record => record.id === prepared.storyId);
                    const current = records[index];
                    if (current === undefined) {
                        throw new MediaBusinessError({ code: 'photo-story-not-found', id: mediaId(prepared.storyId) });
                    }
                    if (current.version !== prepared.run.storyVersion) {
                        await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput));
                        throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) });
                    }
                    if (current.observation !== null) {
                        await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput));
                        throw new MediaBusinessError({ code: 'photo-observation-complete' });
                    }
                    const runIndex = current.modelRuns.findIndex(run => run.id === prepared.run.id);
                    if (runIndex < 0)
                        throw new CorruptMediaStoreError('Photo observation audit is missing');
                    const now = Date.now();
                    const turnId = randomUUID();
                    const observation = {
                        id: randomUUID(),
                        grounding: { ...proposal.grounding, source: 'model-observation-unconfirmed' },
                        opening: proposal.opening,
                        provider: prepared.run.provider,
                        model: prepared.run.model,
                        promptVersion: PHOTO_OBSERVATION_PROMPT_VERSION,
                        createdAt: now,
                    };
                    const modelRuns = [...current.modelRuns];
                    modelRuns[runIndex] = storedPhotoModelRunSchema.parse({
                        ...prepared.run,
                        status: 'completed',
                        failure: null,
                        rawOutput,
                        turnIds: [turnId],
                        updatedAt: now,
                    });
                    const updated = storedPhotoStorySchema.parse({
                        ...current,
                        version: randomUUID(),
                        observation,
                        turns: [{ id: turnId, role: 'assistant', content: proposal.opening, quickReplyKind: '', createdAt: now }],
                        quickReplies: proposal.quickReplies,
                        modelRuns,
                        updatedAt: now,
                    });
                    await this.writeRecord(updated);
                    return snapshot(updated);
                }));
            }
            catch (error) {
                return this.convertFailure(error);
            }
        }
        async prepareObservation(agent, request, signal) {
            const records = await this.readRecords();
            let current = this.requireStory(records, request.id);
            current = await this.interruptRunningModelRuns(current);
            if (current.version !== request.ifVersion) {
                throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) });
            }
            if (current.observation !== null)
                throw new MediaBusinessError({ code: 'photo-observation-complete' });
            const target = this.modelTarget(agent, request);
            if (target === null)
                throw new MediaBusinessError({ code: 'photo-model-unavailable' });
            let info;
            try {
                info = await this.ctx.llm.resolveModelInfo(target.provider, target.model, signal);
            }
            catch {
                throw new MediaBusinessError({ code: 'photo-model-unavailable' });
            }
            if (info.inputModalities !== undefined && !info.inputModalities.includes('image')) {
                throw new MediaBusinessError({
                    code: 'photo-image-unsupported',
                    provider: target.provider,
                    model: target.model,
                });
            }
            try {
                await this.ctx.attachments.readImage(attachmentRef(current.attachment), signal);
            }
            catch (error) {
                if (error instanceof AttachmentError) {
                    throw new MediaBusinessError({ code: 'attachment-unavailable' });
                }
                throw error;
            }
            const envelope = buildPhotoObservationEnvelope(this.options.maxObserverInputBytes);
            if (envelope === null) {
                throw new MediaBusinessError({ code: 'photo-input-too-large', maxBytes: this.options.maxObserverInputBytes });
            }
            const now = Date.now();
            const run = storedPhotoModelRunSchema.parse({
                id: randomUUID(),
                kind: 'observation',
                storyVersion: current.version,
                status: 'running',
                failure: null,
                provider: target.provider,
                model: target.model,
                system: envelope.system,
                prompt: envelope.prompt,
                rawOutput: '',
                turnIds: [],
                createdAt: now,
                updatedAt: now,
            });
            current = storedPhotoStorySchema.parse({
                ...current,
                modelRuns: [...current.modelRuns.slice(-23), run],
            });
            await this.writeRecord(current);
            return {
                run,
                storyId: current.id,
                attachment: attachmentRef(current.attachment),
                envelope,
                content: '',
                quickReplyKind: '',
            };
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
                rawOutput = await this.callPhotoModel(agent, prepared, 'dialogue', signal);
            }
            catch {
                await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'model-failed', ''));
                return rejected({ code: 'photo-model-failed' });
            }
            const proposal = decodePhotoDialogueOutput(rawOutput);
            if (proposal === null) {
                await this.serialize(() => this.failModelRun(prepared.storyId, prepared.run.id, 'invalid-output', rawOutput));
                return rejected({ code: 'photo-output-invalid' });
            }
            try {
                return success(await this.serialize(async () => {
                    const records = await this.readRecords();
                    const current = records.find(record => record.id === prepared.storyId);
                    if (current === undefined) {
                        throw new MediaBusinessError({ code: 'photo-story-not-found', id: mediaId(prepared.storyId) });
                    }
                    if (current.version !== prepared.run.storyVersion) {
                        await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput));
                        throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) });
                    }
                    if (current.observation === null) {
                        await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput));
                        throw new MediaBusinessError({ code: 'photo-observation-required' });
                    }
                    if (current.turns.length + 2 > MAX_DIALOGUE_TURNS) {
                        await this.writeRecord(this.failedRunRecord(current, prepared.run.id, 'story-changed', rawOutput));
                        throw new MediaBusinessError({ code: 'photo-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS });
                    }
                    const runIndex = current.modelRuns.findIndex(run => run.id === prepared.run.id);
                    if (runIndex < 0)
                        throw new CorruptMediaStoreError('Photo dialogue audit is missing');
                    const now = Date.now();
                    const userTurnId = randomUUID();
                    const assistantTurnId = randomUUID();
                    const modelRuns = [...current.modelRuns];
                    modelRuns[runIndex] = storedPhotoModelRunSchema.parse({
                        ...prepared.run,
                        status: 'completed',
                        failure: null,
                        rawOutput,
                        turnIds: [userTurnId, assistantTurnId],
                        updatedAt: now,
                    });
                    const updated = storedPhotoStorySchema.parse({
                        ...current,
                        version: randomUUID(),
                        turns: [
                            ...current.turns,
                            {
                                id: userTurnId,
                                role: 'user',
                                content: prepared.content,
                                quickReplyKind: prepared.quickReplyKind,
                                createdAt: now,
                            },
                            { id: assistantTurnId, role: 'assistant', content: proposal.reply, quickReplyKind: '', createdAt: now },
                        ],
                        quickReplies: proposal.quickReplies,
                        modelRuns,
                        updatedAt: now,
                    });
                    await this.writeRecord(updated);
                    return snapshot(updated);
                }));
            }
            catch (error) {
                return this.convertFailure(error);
            }
        }
        async prepareDialogue(agent, request) {
            const records = await this.readRecords();
            let current = this.requireStory(records, request.id);
            current = await this.interruptRunningModelRuns(current);
            if (current.version !== request.ifVersion) {
                throw new MediaBusinessError({ code: 'photo-story-version-conflict', current: snapshot(current) });
            }
            if (current.observation === null)
                throw new MediaBusinessError({ code: 'photo-observation-required' });
            if (current.turns.length + 2 > MAX_DIALOGUE_TURNS) {
                throw new MediaBusinessError({ code: 'photo-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS });
            }
            const content = this.text(request.content, 'message', this.options.maxObserverMessageBytes, true);
            const quickReplyKind = request.quickReplyKind ?? '';
            if (!['', 'remember', 'detail', 'correct'].includes(quickReplyKind))
                this.invalid('message', 'invalid');
            const target = this.modelTarget(agent, request);
            if (target === null)
                throw new MediaBusinessError({ code: 'photo-model-unavailable' });
            const envelope = buildPhotoDialogueEnvelope(snapshot(current), content, quickReplyKind, this.options.maxObserverInputBytes);
            if (envelope === null) {
                throw new MediaBusinessError({ code: 'photo-input-too-large', maxBytes: this.options.maxObserverInputBytes });
            }
            const now = Date.now();
            const run = storedPhotoModelRunSchema.parse({
                id: randomUUID(),
                kind: 'dialogue',
                storyVersion: current.version,
                status: 'running',
                failure: null,
                provider: target.provider,
                model: target.model,
                system: envelope.system,
                prompt: envelope.prompt,
                rawOutput: '',
                turnIds: [],
                createdAt: now,
                updatedAt: now,
            });
            current = storedPhotoStorySchema.parse({
                ...current,
                modelRuns: [...current.modelRuns.slice(-23), run],
            });
            await this.writeRecord(current);
            return {
                run,
                storyId: current.id,
                attachment: attachmentRef(current.attachment),
                envelope,
                content,
                quickReplyKind,
            };
        }
        async callPhotoModel(agent, prepared, kind, signal) {
            const assembler = new BlockAssembler();
            const content = kind === 'observation'
                ? [
                    { type: 'text', text: prepared.envelope.prompt },
                    { type: 'image', attachment: prepared.attachment },
                ]
                : [{ type: 'text', text: prepared.envelope.prompt }];
            const options = {
                provider: prepared.run.provider,
                model: prepared.run.model,
                system: prepared.envelope.system,
                messages: [createUserMessage({ content, source: { kind: 'plugin', plugin: name } })],
                temperature: kind === 'observation' ? 0.2 : 0.45,
                maxTokens: this.options.maxObserverOutputTokens,
                sessionId: agent.session.id,
                purpose: kind === 'observation' ? 'mind-garden-photo-observation' : 'mind-garden-photo-dialogue',
                signal,
            };
            for await (const chunk of this.ctx.llm.stream(options))
                assembler.push(chunk);
            if (this.finishFailed(assembler.finish))
                throw new Error('Photo model did not finish completely');
            const blocks = assembler.blocks();
            if (blocks.some(block => block.type !== 'text' && block.type !== 'reasoning')) {
                throw new Error('Photo model returned executable content');
            }
            const output = blocks.flatMap(block => block.type === 'text' ? [block.text] : []).join('');
            if (output.trim().length === 0)
                throw new Error('Photo model returned empty content');
            return output;
        }
        finishFailed(finish) {
            return finish.kind !== 'stop';
        }
        modelTarget(agent, request) {
            const hasOverride = request.provider !== undefined || request.model !== undefined;
            if (hasOverride) {
                if (request.provider === undefined
                    || request.provider.trim().length === 0
                    || request.model === undefined
                    || request.model.trim().length === 0)
                    return null;
                return { provider: request.provider.trim(), model: request.model.trim() };
            }
            if (this.options.observerProvider.length > 0 && this.options.observerModel.length > 0) {
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
        async interruptRunningModelRuns(record) {
            if (!record.modelRuns.some(run => run.status === 'running'))
                return record;
            const now = Date.now();
            const interrupted = storedPhotoStorySchema.parse({
                ...record,
                modelRuns: record.modelRuns.map(run => run.status === 'running'
                    ? { ...run, status: 'failed', failure: 'interrupted', updatedAt: now }
                    : run),
            });
            await this.writeRecord(interrupted);
            return interrupted;
        }
        failedRunRecord(record, runId, failure, rawOutput) {
            const index = record.modelRuns.findIndex(run => run.id === runId);
            const run = record.modelRuns[index];
            if (run === undefined || run.status !== 'running' || failure === null)
                return record;
            const modelRuns = [...record.modelRuns];
            modelRuns[index] = storedPhotoModelRunSchema.parse({
                ...run,
                status: 'failed',
                failure,
                rawOutput,
                updatedAt: Date.now(),
            });
            return storedPhotoStorySchema.parse({ ...record, modelRuns });
        }
        async failModelRun(storyId, runId, failure, rawOutput) {
            const record = (await this.readRecords()).find(item => item.id === storyId);
            if (record === undefined)
                return;
            const failed = this.failedRunRecord(record, runId, failure, rawOutput);
            if (failed !== record)
                await this.writeRecord(failed);
        }
        accessFailure(agent) {
            if (this.ctx.agents.get(agent.id) !== agent) {
                throw new Error(`mind-garden-media: agent '${agent.id}' is not live in this registry`);
            }
            const state = this.ctx.mindGarden.current(agent.session);
            if (state === null)
                return { code: 'mind-garden-not-active' };
            if (state.privacy !== 'durable')
                return { code: 'durable-session-required' };
            return null;
        }
        imageInput(request) {
            const data = canonicalBase64(request.data);
            if (data === null)
                this.invalid('data', request.data.length === 0 ? 'blank' : 'invalid');
            const estimatedBytes = Math.floor(request.data.length * 3 / 4);
            if (estimatedBytes > this.ctx.attachments.imageLimits.maxImageBytes) {
                throw new MediaBusinessError({ code: 'attachment-rejected', reason: 'IMAGE_TOO_LARGE' });
            }
            const name = request.name === undefined ? undefined : this.text(request.name, 'name', this.options.maxNameBytes, true);
            return { data, mediaType: request.mediaType, ...(name === undefined ? {} : { name }) };
        }
        validateStamp(stamp) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp.localDate)
                || Number.isNaN(Date.parse(`${stamp.localDate}T00:00:00.000Z`))) {
                this.invalid('stamp', 'invalid');
            }
            const timeZone = stamp.timeZone.trim();
            if (timeZone.length === 0)
                this.invalid('stamp', 'blank');
            if (Buffer.byteLength(timeZone, 'utf8') > this.options.maxTimeZoneBytes) {
                this.invalid('stamp', 'too-large', this.options.maxTimeZoneBytes);
            }
            let canonical;
            try {
                canonical = new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone;
            }
            catch {
                return this.invalid('stamp', 'invalid');
            }
            if (!Number.isInteger(stamp.utcOffsetMinutes)
                || stamp.utcOffsetMinutes < -840
                || stamp.utcOffsetMinutes > 840) {
                this.invalid('stamp', 'invalid');
            }
            return { localDate: stamp.localDate, timeZone: canonical, utcOffsetMinutes: stamp.utcOffsetMinutes };
        }
        text(value, field, maxBytes, requireValue = false) {
            const text = value.trim();
            if (requireValue && text.length === 0)
                this.invalid(field, 'blank');
            if (Buffer.byteLength(text, 'utf8') > maxBytes)
                this.invalid(field, 'too-large', maxBytes);
            return text;
        }
        particleConfig(value) {
            const parsed = mindGardenPhotoParticleConfigSchema.safeParse(value);
            if (!parsed.success)
                this.invalid('particleConfig', 'invalid');
            return parsed.data;
        }
        limit(value) {
            if (value === undefined)
                return this.options.maxStoriesPerList;
            if (!Number.isInteger(value) || value < 1 || value > this.options.maxStoriesPerList) {
                this.invalid('limit', 'invalid');
            }
            return value;
        }
        invalid(field, reason, maxBytes) {
            throw new MediaBusinessError({
                code: 'invalid-field',
                field,
                reason,
                ...(maxBytes === undefined ? {} : { maxBytes }),
            });
        }
        async readRecords() {
            const entries = await this.ctx.mindGardenVault.entries('media');
            try {
                return entries.map(([id, value]) => {
                    const record = decodeStoredMediaRecord(value);
                    if (record.id !== id)
                        throw new TypeError('vault id differs from authenticated media id');
                    return record;
                });
            }
            catch (error) {
                throw new CorruptMediaStoreError('Mind Garden media plaintext record is invalid', { cause: error });
            }
        }
        async writeRecord(record) {
            const validated = decodeStoredMediaRecord(record);
            await this.ctx.mindGardenVault.put('media', MindGardenVaultRecordId(validated.id), validated);
        }
        requireStory(records, id) {
            const story = records.find(record => record.id === id);
            if (story === undefined)
                throw new MediaBusinessError({ code: 'photo-story-not-found', id });
            return story;
        }
        convertFailure(error) {
            if (error instanceof MediaBusinessError)
                return rejected(error.failure);
            if (error instanceof CorruptMediaStoreError) {
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
                return Promise.reject(new Error('mind-garden-media: service is disposing'));
            return this.serialize(operation);
        }
        serialize(operation) {
            const result = this.operationTail.then(operation);
            this.operationTail = result.then(() => undefined, () => undefined);
            return result;
        }
    };
})();
export { MindGardenMediaService };
export default MindGardenMediaService;
//# sourceMappingURL=index.js.map