/**
 * Credential-backed encrypted private-record service for Mind Garden.
 * @module @deepseek-ai/dsh-mind-garden/vault
 */
import { Context, Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { Branded } from '@deepseek-ai/dsh-brand';
import type { JsonValue } from '@deepseek-ai/dsh-session';
import { type MindGardenVaultCollection } from './domain.ts';
import { MIND_GARDEN_VAULT_ASSERT } from './private.ts';
export { MIND_GARDEN_VAULT_COLLECTIONS, mindGardenVaultDomainSpec } from './domain.ts';
export type * from './domain.ts';
export type { MindGardenVaultErrorCode } from './error.ts';
export { MindGardenVaultError } from './error.ts';
export { createMindGardenDataKey, decodeMindGardenDataKey, decryptMindGardenJson, encryptMindGardenJson, mindGardenDataKeyId, } from './crypto.ts';
/** Cordis plugin configuration. */
export interface Config {
    /** Credential reference containing one canonical base64 32-byte data key. */
    dataKeyEnv?: string;
    /** Writable staging credential used only while a recoverable data-key rotation is in progress. */
    rotationKeyEnv?: string;
    /** Generate and persist a key on first initialization when the provider is writable. */
    autoCreateKey?: boolean;
    /** Maximum UTF-8 bytes accepted for an opaque record id. */
    maxIdBytes?: number;
    /** Maximum lossless-JSON plaintext bytes accepted per record. */
    maxPlaintextBytes?: number;
}
/** Safe state for settings and health surfaces; never includes credential values. */
export interface MindGardenVaultStatus {
    readonly state: 'uninitialized' | 'ready' | 'rotating' | 'locked' | 'invalid-key' | 'key-mismatch';
    readonly credentialRef: string;
    readonly configured: boolean;
    readonly source?: string;
    readonly keyId?: string;
    readonly records: Readonly<Record<MindGardenVaultCollection, number>>;
    readonly rotation?: {
        readonly completedRecords: number;
        readonly totalRecords: number;
        readonly startedAt: number;
    };
}
/** Non-secret completion receipt for one fully durable data-key rotation. */
export interface MindGardenVaultRotationResult {
    readonly fromKeyId: string;
    readonly toKeyId: string;
    readonly records: number;
    readonly startedAt: number;
    readonly completedAt: number;
}
/** Metadata returned after one encrypted record is committed. */
export interface MindGardenVaultRecordMeta {
    readonly id: MindGardenVaultRecordId;
    readonly collection: MindGardenVaultCollection;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** One authenticated private record in a coherent profile snapshot. */
export interface MindGardenVaultSnapshotRecord {
    readonly id: MindGardenVaultRecordId;
    readonly value: JsonValue;
}
/** Detached point-in-time plaintext used only by trusted profile-lifecycle plugins. */
export interface MindGardenVaultSnapshot {
    readonly vaultCreatedAt: number;
    readonly collections: Readonly<Record<MindGardenVaultCollection, readonly MindGardenVaultSnapshotRecord[]>>;
}
/** Record totals from one non-overwriting profile merge. */
export interface MindGardenVaultMergeCounts {
    readonly memories: number;
    readonly reflections: number;
    readonly media: number;
    readonly stars: number;
}
/** Receipt from an idempotent merge that preserves every current record. */
export interface MindGardenVaultMergeResult {
    readonly added: MindGardenVaultMergeCounts;
    readonly kept: MindGardenVaultMergeCounts;
}
/** Candidate ids used to preview a non-overwriting profile merge. */
export type MindGardenVaultMergeCandidates = Readonly<Record<MindGardenVaultCollection, readonly MindGardenVaultRecordId[]>>;
/** Opaque record identity owned by a private-data consumer. */
export type MindGardenVaultRecordId = Branded<'MindGardenVaultRecordId'>;
/**
 * Brand an opaque private-record id for the vault API.
 * @param id - Consumer-owned stable identifier.
 * @returns The same string with its compile-time vault-record brand.
 */
export declare function MindGardenVaultRecordId(id: string): MindGardenVaultRecordId;
declare module '@deepseek-ai/cordis' {
    interface Context {
        mindGardenVault: MindGardenVault;
    }
}
/** Encrypted private-record service shared by memory, reflection, media, and Star Map plugins. */
export declare class MindGardenVault extends Service {
    static inject: string[];
    /** Loader validation for credential and record bounds. */
    static Config: z<Config>;
    private readonly options;
    private domain?;
    private keyResolutionTail;
    constructor(ctx: Context, config: Config);
    /** Open and own the ciphertext domain before the service becomes injectable. */
    protected [Service.init](): Promise<void>;
    /**
     * Initialize the data-key binding, creating a provider-owned key when allowed.
     * @returns Safe post-initialization status; rejects without changing an initialized vault on key failure.
     */
    initialize(): Promise<MindGardenVaultStatus>;
    /**
     * Inspect key availability and record counts without returning secret values or record ids.
     * @returns Current credential compatibility and per-collection counts without mutating the vault.
     */
    status(): Promise<MindGardenVaultStatus>;
    /**
     * Encrypt and durably insert or replace one private JSON record.
     * @param collection - Fixed private-data family.
     * @param id - Consumer-owned opaque record id.
     * @param value - Lossless JSON to detach and encrypt.
     * @returns Committed record metadata after backend durability.
     */
    put(collection: MindGardenVaultCollection, id: MindGardenVaultRecordId, value: JsonValue): Promise<MindGardenVaultRecordMeta>;
    /**
     * Authenticate and return one detached private JSON record.
     * @param collection - Fixed private-data family.
     * @param id - Consumer-owned opaque record id.
     * @returns Detached lossless JSON, or `undefined` when the authenticated vault has no record.
     */
    get(collection: MindGardenVaultCollection, id: MindGardenVaultRecordId): Promise<JsonValue | undefined>;
    /**
     * Authenticate and return every private JSON record in stable table order.
     * @param collection - Fixed private-data family.
     * @returns Opaque ids and detached values; one authentication failure rejects the complete read.
     */
    entries(collection: MindGardenVaultCollection): Promise<[MindGardenVaultRecordId, JsonValue][]>;
    /**
     * Authenticate and detach every private record at one vault operation boundary.
     *
     * The snapshot is intentionally profile-wide and plaintext. Only trusted
     * lifecycle plugins such as encrypted export and key rotation should call
     * it; browser and model surfaces must receive a separately protected form.
     *
     * @returns All four collections from one serialized point in time.
     */
    snapshot(): Promise<MindGardenVaultSnapshot>;
    /**
     * Count candidate ids that a non-overwriting merge would add or preserve.
     * @param candidates - Opaque ids from a fully validated portable profile.
     * @returns Current per-collection plan; the later merge recomputes it authoritatively.
     */
    previewMissing(candidates: MindGardenVaultMergeCandidates): Promise<MindGardenVaultMergeResult>;
    /**
     * Encrypt and add snapshot records whose ids are absent from the current profile.
     *
     * Every id and value is validated and encrypted before the first durable write.
     * Existing ids are never compared, decrypted, or overwritten. A backend failure
     * can leave a prefix committed; repeating the same merge safely converges because
     * committed ids become `kept` on the next attempt.
     *
     * @param collections - Fully decoded records from a trusted profile-lifecycle plugin.
     * @returns Per-collection counts for added records and preserved current records.
     */
    mergeMissing(collections: MindGardenVaultSnapshot['collections']): Promise<MindGardenVaultMergeResult>;
    /**
     * Replace the profile data key through a crash-recoverable, idempotent journal.
     *
     * The primary and staging credential references must both be writable. A
     * failed attempt deliberately leaves its non-secret journal and staged key
     * in place; the next vault operation or explicit retry resumes from the
     * first envelope still protected by the previous key.
     *
     * @returns Non-secret key fingerprints, record count, and durable timing.
     */
    rotateDataKey(): Promise<MindGardenVaultRotationResult>;
    /**
     * Delete one private record only after proving the configured key still matches the vault.
     * @param collection - Fixed private-data family.
     * @param id - Consumer-owned opaque record id.
     * @returns Whether an authenticated record existed and was durably removed.
     */
    delete(collection: MindGardenVaultCollection, id: MindGardenVaultRecordId): Promise<boolean>;
    /** Validate the non-secret state/envelope relationship for startup and the package companion. */
    [MIND_GARDEN_VAULT_ASSERT](fail: (message: string) => never): void;
    private table;
    private validateId;
    private validateMergeIds;
    private mergeCounts;
    private recordCounts;
    private rotationProgress;
    private serialize;
    private withDataKey;
    private startDataKeyRotation;
    private resumeDataKeyRotation;
    private resolveCredentialKey;
    private resolveDataKey;
    private requireDomain;
}
export default MindGardenVault;
//# sourceMappingURL=index.d.ts.map