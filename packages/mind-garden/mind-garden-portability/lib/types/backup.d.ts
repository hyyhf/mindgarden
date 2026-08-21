/** Versioned passphrase encryption for portable Mind Garden profile snapshots. */
import { Buffer } from 'node:buffer';
import { type ImageAttachmentRef } from '@deepseek-ai/dsh-attachment';
import type { JsonValue } from '@deepseek-ai/dsh-session';
declare const BACKUP_FORMAT = "deepseek-harness.mind-garden.profile";
declare const PAYLOAD_VERSION = 1;
/** One detached authenticated vault record inside the encrypted payload. */
export interface MindGardenBackupRecord {
    readonly id: string;
    readonly value: JsonValue;
}
/** One verified immutable image embedded alongside its encrypted story metadata. */
export interface MindGardenBackupAttachment {
    readonly ref: ImageAttachmentRef;
    readonly data: string;
}
/** Decrypted logical profile snapshot. This value never crosses the browser Remote. */
export interface MindGardenBackupPayload {
    readonly format: typeof BACKUP_FORMAT;
    readonly version: typeof PAYLOAD_VERSION;
    readonly createdAt: number;
    readonly vaultCreatedAt: number;
    readonly collections: Readonly<Record<'memories' | 'reflections' | 'media' | 'stars', readonly MindGardenBackupRecord[]>>;
    readonly attachments: readonly MindGardenBackupAttachment[];
}
/** Coded internal failure converted to a stable Remote result by the service. */
export declare class MindGardenPortabilityError extends Error {
    readonly code: 'invalid-passphrase' | 'backup-too-large' | 'invalid-backup';
    readonly name = "MindGardenPortabilityError";
    constructor(code: 'invalid-passphrase' | 'backup-too-large' | 'invalid-backup', message: string, options?: ErrorOptions);
}
/**
 * Require a memorable multi-word passphrase rather than an eight-character legacy password.
 *
 * @param passphrase User-held secret used to derive the archive encryption key.
 */
export declare function assertMindGardenBackupPassphrase(passphrase: string): void;
/**
 * Compress and passphrase-encrypt one complete logical profile snapshot.
 * @param payload - Detached vault records and verified image bytes.
 * @param passphrase - User-held recovery secret; it is never stored in the package.
 * @param maxPlaintextBytes - Upper bound before compression and Remote encoding.
 * @returns UTF-8 JSON package bytes containing only KDF metadata and ciphertext.
 */
export declare function encryptMindGardenBackup(payload: MindGardenBackupPayload, passphrase: string, maxPlaintextBytes: number): Promise<Buffer>;
/**
 * Authenticate and decode one version-one package for import and recovery.
 * @param data - Untrusted package bytes.
 * @param passphrase - User-held recovery secret.
 * @param maxPlaintextBytes - Decompression and JSON payload bound.
 * @returns Strictly validated logical profile payload.
 */
export declare function decryptMindGardenBackup(data: Uint8Array, passphrase: string, maxPlaintextBytes: number): Promise<MindGardenBackupPayload>;
export {};
//# sourceMappingURL=backup.d.ts.map