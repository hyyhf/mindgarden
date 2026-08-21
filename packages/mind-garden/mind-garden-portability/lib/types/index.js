/** Passphrase-encrypted profile backup and migration service for Mind Garden. */
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
import { createHash } from 'node:crypto';
import s from '@deepseek-ai/schemastery';
import { AttachmentError } from '@deepseek-ai/dsh-attachment';
import { decodeStoredRecord } from '@deepseek-ai/dsh-mind-garden/memory';
import { decodeStoredMediaRecord } from '@deepseek-ai/dsh-mind-garden/media';
import { decodeStoredReflection } from '@deepseek-ai/dsh-mind-garden/reflection';
import { decodeStoredStarState } from '@deepseek-ai/dsh-mind-garden/star-map';
import { MindGardenVaultError, MindGardenVaultRecordId, } from '@deepseek-ai/dsh-mind-garden/vault';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { encryptMindGardenBackup, decryptMindGardenBackup, MindGardenPortabilityError, } from "./backup.js";
import { isLegacyMindGardenPackage, loadLegacyMindGardenBackup } from "./legacy.js";
export { assertMindGardenBackupPassphrase, decryptMindGardenBackup, encryptMindGardenBackup, MindGardenPortabilityError, } from "./backup.js";
const DEFAULT_MAX_PLAINTEXT_BYTES = 128 * 1024 * 1024;
const DEFAULT_MAX_PACKAGE_BYTES = 160 * 1024 * 1024;
const BACKUP_MEDIA_TYPE = 'application/vnd.deepseek-harness.mind-garden-backup';
function positiveSafeInteger(value) {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new TypeError('mind-garden-portability: maxPlaintextBytes must be a positive safe integer');
    }
    return value;
}
function rejected(code) {
    return { ok: false, error: { code } };
}
function rotationRejected(code) {
    return { ok: false, error: { code } };
}
function restoreRejected(code) {
    return { ok: false, error: { code } };
}
function restoreCommitRejected(code) {
    return { ok: false, error: { code } };
}
function backupFilename(createdAt) {
    const stamp = new Date(createdAt).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    return `mind-garden-${stamp}.mgarden`;
}
function decodeTransportPackage(data, maxPackageBytes) {
    const maxBase64Length = Math.ceil(maxPackageBytes / 3) * 4;
    if (data.length === 0) {
        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup transport is empty');
    }
    if (data.length > maxBase64Length) {
        throw new MindGardenPortabilityError('backup-too-large', 'Mind Garden backup package exceeds the configured transport bound');
    }
    const bytes = Buffer.from(data, 'base64');
    if (bytes.length > maxPackageBytes) {
        bytes.fill(0);
        throw new MindGardenPortabilityError('backup-too-large', 'Mind Garden backup package exceeds the configured transport bound');
    }
    if (bytes.toString('base64') !== data) {
        bytes.fill(0);
        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup transport is not canonical base64');
    }
    return bytes;
}
function decodeAttachmentData(value) {
    const bytes = Buffer.from(value, 'base64');
    if (bytes.length === 0 || bytes.toString('base64') !== value) {
        bytes.fill(0);
        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup attachment is not canonical base64');
    }
    return bytes;
}
function sameImageRef(left, right) {
    return left.attachmentId === right.attachmentId
        && left.mediaType === right.mediaType
        && left.bytes === right.bytes
        && left.width === right.width
        && left.height === right.height
        && left.name === right.name;
}
function recordCounts(payload) {
    return {
        memories: payload.collections.memories.length,
        reflections: payload.collections.reflections.length,
        media: payload.collections.media.length,
        stars: payload.collections.stars.length,
        attachments: payload.attachments.length,
    };
}
function mergeCandidates(payload) {
    return {
        memories: payload.collections.memories.map(record => MindGardenVaultRecordId(record.id)),
        reflections: payload.collections.reflections.map(record => MindGardenVaultRecordId(record.id)),
        media: payload.collections.media.map(record => MindGardenVaultRecordId(record.id)),
        stars: payload.collections.stars.map(record => MindGardenVaultRecordId(record.id)),
    };
}
function vaultCollections(payload) {
    return {
        memories: payload.collections.memories.map(record => ({ ...record, id: MindGardenVaultRecordId(record.id) })),
        reflections: payload.collections.reflections.map(record => ({ ...record, id: MindGardenVaultRecordId(record.id) })),
        media: payload.collections.media.map(record => ({ ...record, id: MindGardenVaultRecordId(record.id) })),
        stars: payload.collections.stars.map(record => ({ ...record, id: MindGardenVaultRecordId(record.id) })),
    };
}
/** Host authority for complete encrypted profile packages. */
let MindGardenPortabilityService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _exportBackup_decorators;
    let _inspectBackup_decorators;
    let _restoreBackup_decorators;
    let _rotateDataKey_decorators;
    return class MindGardenPortabilityService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _exportBackup_decorators = [Remote('exportBackup')];
            _inspectBackup_decorators = [Remote('inspectBackup')];
            _restoreBackup_decorators = [Remote('restoreBackup')];
            _rotateDataKey_decorators = [Remote('rotateDataKey')];
            __esDecorate(this, null, _exportBackup_decorators, { kind: "method", name: "exportBackup", static: false, private: false, access: { has: obj => "exportBackup" in obj, get: obj => obj.exportBackup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _inspectBackup_decorators, { kind: "method", name: "inspectBackup", static: false, private: false, access: { has: obj => "inspectBackup" in obj, get: obj => obj.inspectBackup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _restoreBackup_decorators, { kind: "method", name: "restoreBackup", static: false, private: false, access: { has: obj => "restoreBackup" in obj, get: obj => obj.restoreBackup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rotateDataKey_decorators, { kind: "method", name: "rotateDataKey", static: false, private: false, access: { has: obj => "rotateDataKey" in obj, get: obj => obj.rotateDataKey }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['agents', 'attachments', 'mindGarden', 'mindGardenVault'];
        /** Loader validation for the bounded in-memory export pipeline. */
        static Config = s.object({
            maxPlaintextBytes: s.number().default(DEFAULT_MAX_PLAINTEXT_BYTES),
            maxPackageBytes: s.number().default(DEFAULT_MAX_PACKAGE_BYTES),
        });
        maxPlaintextBytes = __runInitializers(this, _instanceExtraInitializers);
        maxPackageBytes;
        constructor(ctx, config) {
            super(ctx, 'mindGardenPortability');
            this.maxPlaintextBytes = positiveSafeInteger(config.maxPlaintextBytes ?? DEFAULT_MAX_PLAINTEXT_BYTES);
            this.maxPackageBytes = positiveSafeInteger(config.maxPackageBytes ?? DEFAULT_MAX_PACKAGE_BYTES);
        }
        /**
         * Build a coherent profile snapshot and encrypt it before returning bytes.
         * @param passphrase - User-held secret that is not persisted by the service.
         * @returns Complete encrypted package and non-sensitive delivery metadata.
         */
        async createBackup(passphrase) {
            const createdAt = Date.now();
            const snapshot = await this.ctx.mindGardenVault.snapshot();
            const attachments = await this.readAttachments(snapshot.collections.media);
            const payload = {
                format: 'deepseek-harness.mind-garden.profile',
                version: 1,
                createdAt,
                vaultCreatedAt: snapshot.vaultCreatedAt,
                collections: snapshot.collections,
                attachments,
            };
            const data = await encryptMindGardenBackup(payload, passphrase, this.maxPlaintextBytes);
            const records = {
                memories: snapshot.collections.memories.length,
                reflections: snapshot.collections.reflections.length,
                media: snapshot.collections.media.length,
                stars: snapshot.collections.stars.length,
                attachments: attachments.length,
            };
            try {
                return {
                    formatVersion: 1,
                    filename: backupFilename(createdAt),
                    mediaType: BACKUP_MEDIA_TYPE,
                    data: data.toString('base64'),
                    bytes: data.length,
                    createdAt,
                    records,
                };
            }
            finally {
                data.fill(0);
            }
        }
        /**
         * Prepare an encrypted browser download for one live durable garden.
         * @param agent - Exact live Agent used only as the authorization boundary.
         * @param request - Passphrase supplied by the user for this package.
         * @returns Stable whole-operation result; plaintext never crosses Remote.
         */
        async exportBackup(agent, request) {
            if (this.ctx.agents.get(agent.id) !== agent)
                return rejected('agent-not-live');
            const state = this.ctx.mindGarden.current(agent.session);
            if (state === null)
                return rejected('mind-garden-not-active');
            if (state.privacy !== 'durable')
                return rejected('durable-session-required');
            try {
                return { ok: true, value: await this.createBackup(request.passphrase) };
            }
            catch (error) {
                if (error instanceof MindGardenPortabilityError) {
                    return rejected(error.code === 'invalid-backup' ? 'backup-failed' : error.code);
                }
                if (error instanceof MindGardenVaultError)
                    return rejected('vault-unavailable');
                if (error instanceof AttachmentError)
                    return rejected('attachment-unavailable');
                return rejected('backup-failed');
            }
        }
        /**
         * Authenticate a current or original encrypted package and compute a non-overwriting restore plan.
         * @param agent - Exact live Agent used only as the authorization boundary.
         * @param request - Encrypted browser bytes and the user-held passphrase.
         * @returns Non-sensitive archive totals and current-id conflicts; no records are written.
         */
        async inspectBackup(agent, request) {
            const denied = this.restoreAuthority(agent);
            if (denied !== undefined)
                return restoreRejected(denied);
            try {
                const loaded = await this.loadBackup(request);
                const plan = await this.ctx.mindGardenVault.previewMissing(mergeCandidates(loaded.payload));
                const value = {
                    formatVersion: 1,
                    sourceFormat: loaded.sourceFormat,
                    scope: loaded.scope,
                    archiveCreatedAt: loaded.payload.createdAt,
                    bytes: loaded.bytes,
                    records: recordCounts(loaded.payload),
                    willAdd: plan.added,
                    willKeep: plan.kept,
                };
                return { ok: true, value };
            }
            catch (error) {
                return restoreRejected(this.restoreErrorCode(error));
            }
        }
        /**
         * Validate the detected source format again, restore immutable attachments, and add only missing private records.
         * @param agent - Exact live Agent used only as the authorization boundary.
         * @param request - Repeated encrypted package, secret, and explicit confirmation.
         * @returns Authoritative merge receipt; existing record ids are never overwritten.
         */
        async restoreBackup(agent, request) {
            const denied = this.restoreAuthority(agent);
            if (denied !== undefined)
                return restoreCommitRejected(denied);
            if (!request.confirm)
                return restoreCommitRejected('confirmation-required');
            try {
                const loaded = await this.loadBackup(request);
                await this.restoreAttachments(loaded.payload);
                const merged = await this.ctx.mindGardenVault.mergeMissing(vaultCollections(loaded.payload));
                return {
                    ok: true,
                    value: {
                        sourceFormat: loaded.sourceFormat,
                        scope: loaded.scope,
                        archiveCreatedAt: loaded.payload.createdAt,
                        restoredAt: Date.now(),
                        added: merged.added,
                        kept: merged.kept,
                        attachments: loaded.payload.attachments.length,
                    },
                };
            }
            catch (error) {
                return restoreCommitRejected(this.restoreErrorCode(error));
            }
        }
        /**
         * Rotate the complete profile vault key behind the same durable-garden authority as export.
         * @param agent - Exact live Agent used only as the authorization boundary.
         * @param request - Explicit confirmation from the browser's two-step ceremony.
         * @returns Non-secret durable receipt or a stable whole-operation rejection.
         */
        async rotateDataKey(agent, request) {
            if (this.ctx.agents.get(agent.id) !== agent)
                return rotationRejected('agent-not-live');
            const state = this.ctx.mindGarden.current(agent.session);
            if (state === null)
                return rotationRejected('mind-garden-not-active');
            if (state.privacy !== 'durable')
                return rotationRejected('durable-session-required');
            if (!request.confirm)
                return rotationRejected('confirmation-required');
            try {
                return { ok: true, value: await this.ctx.mindGardenVault.rotateDataKey() };
            }
            catch (error) {
                if (error instanceof MindGardenVaultError) {
                    return rotationRejected(error.code === 'rotation-unavailable' ? 'rotation-unavailable' : 'vault-unavailable');
                }
                return rotationRejected('rotation-failed');
            }
        }
        async readAttachments(media) {
            const references = new Map();
            for (const record of media) {
                const story = decodeStoredMediaRecord(record.value);
                references.set(story.attachment.attachmentId, story.attachment);
            }
            const attachments = [];
            for (const ref of [...references.values()].sort((a, b) => a.attachmentId.localeCompare(b.attachmentId))) {
                const stored = await this.ctx.attachments.readImage(ref);
                attachments.push({ ref: stored.ref, data: Buffer.from(stored.data).toString('base64') });
            }
            return attachments;
        }
        restoreAuthority(agent) {
            if (this.ctx.agents.get(agent.id) !== agent)
                return 'agent-not-live';
            const state = this.ctx.mindGarden.current(agent.session);
            if (state === null)
                return 'mind-garden-not-active';
            if (state.privacy !== 'durable')
                return 'durable-session-required';
            return undefined;
        }
        async loadBackup(request) {
            const data = decodeTransportPackage(request.data, this.maxPackageBytes);
            try {
                if (isLegacyMindGardenPackage(data)) {
                    const legacy = await loadLegacyMindGardenBackup(data, request.passphrase, this.maxPlaintextBytes);
                    await this.validateBackupPayload(legacy.payload);
                    return { ...legacy, bytes: data.length };
                }
                const payload = await decryptMindGardenBackup(data, request.passphrase, this.maxPlaintextBytes);
                await this.validateBackupPayload(payload);
                return {
                    payload,
                    bytes: data.length,
                    sourceFormat: 'deepseek-harness-v1',
                    scope: 'full-profile',
                };
            }
            finally {
                data.fill(0);
            }
        }
        async validateBackupPayload(payload) {
            try {
                for (const record of payload.collections.memories) {
                    if (decodeStoredRecord(record.value).id !== record.id) {
                        throw new TypeError('Mind Garden backup memory id differs from its record id');
                    }
                }
                for (const record of payload.collections.reflections) {
                    if (decodeStoredReflection(record.value).id !== record.id) {
                        throw new TypeError('Mind Garden backup reflection id differs from its record id');
                    }
                }
                for (const record of payload.collections.stars) {
                    if (decodeStoredStarState(record.value).id !== record.id) {
                        throw new TypeError('Mind Garden backup Star Map id differs from its record id');
                    }
                }
                const attachments = new Map();
                for (const attachment of payload.attachments) {
                    if (attachments.has(attachment.ref.attachmentId)) {
                        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup repeats one attachment');
                    }
                    const data = decodeAttachmentData(attachment.data);
                    try {
                        const digest = `sha256:${createHash('sha256').update(data).digest('hex')}`;
                        if (attachment.ref.attachmentId !== digest || attachment.ref.bytes !== data.length) {
                            throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup attachment reference does not match its bytes');
                        }
                        await this.ctx.attachments.validateImage({
                            data,
                            mediaType: attachment.ref.mediaType,
                            ...attachment.ref.name === undefined ? {} : { name: attachment.ref.name },
                        });
                    }
                    finally {
                        data.fill(0);
                    }
                    attachments.set(attachment.ref.attachmentId, attachment);
                }
                const referenced = new Set();
                for (const record of payload.collections.media) {
                    const story = decodeStoredMediaRecord(record.value);
                    if (story.id !== record.id) {
                        throw new TypeError('Mind Garden backup media id differs from its record id');
                    }
                    const attachment = attachments.get(story.attachment.attachmentId);
                    if (attachment === undefined || !sameImageRef(attachment.ref, story.attachment)) {
                        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup photo record has no matching attachment');
                    }
                    referenced.add(attachment.ref.attachmentId);
                }
                if (referenced.size !== attachments.size) {
                    throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup contains an unreferenced attachment');
                }
            }
            catch (error) {
                if (error instanceof MindGardenPortabilityError || error instanceof AttachmentError)
                    throw error;
                throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup contains an unsupported private record', { cause: error });
            }
        }
        async restoreAttachments(payload) {
            for (const attachment of payload.attachments) {
                const data = decodeAttachmentData(attachment.data);
                try {
                    const restored = await this.ctx.attachments.saveImage({
                        data,
                        mediaType: attachment.ref.mediaType,
                        ...attachment.ref.name === undefined ? {} : { name: attachment.ref.name },
                    });
                    if (!sameImageRef(restored, attachment.ref)) {
                        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden restored attachment metadata does not match its archive');
                    }
                }
                finally {
                    data.fill(0);
                }
            }
        }
        restoreErrorCode(error) {
            if (error instanceof MindGardenPortabilityError)
                return error.code;
            if (error instanceof AttachmentError)
                return 'attachment-unavailable';
            if (error instanceof MindGardenVaultError) {
                return error.code === 'invalid-record-id'
                    || error.code === 'invalid-value'
                    || error.code === 'record-too-large'
                    ? 'invalid-backup'
                    : 'vault-unavailable';
            }
            return 'restore-failed';
        }
    };
})();
export { MindGardenPortabilityService };
export default MindGardenPortabilityService;
//# sourceMappingURL=index.js.map