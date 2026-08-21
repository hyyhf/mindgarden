/** AES-256-GCM primitives for ciphertext-only Mind Garden records. */
import type { JsonValue } from '@deepseek-ai/dsh-session';
import type { MindGardenVaultCollection, MindGardenVaultEnvelope } from './domain.ts';
/**
 * Decode one canonical base64 AES-256 data key.
 * @param encoded - Credential value to decode.
 * @returns A mutable 32-byte buffer that the caller must zero after use.
 */
export declare function decodeMindGardenDataKey(encoded: string): Buffer;
/**
 * Create a fresh base64 AES-256 data key suitable for a credential provider.
 * @returns Canonical base64 containing 32 random bytes.
 */
export declare function createMindGardenDataKey(): string;
/**
 * Compute the non-secret fingerprint used to reject a wrong credential before decryption.
 * @param key - Decoded 32-byte data key.
 * @returns Base64url SHA-256 fingerprint.
 */
export declare function mindGardenDataKeyId(key: Buffer): string;
/**
 * Encrypt a detached lossless-JSON value and preserve creation time on overwrite.
 * @param options - Key, record identity, value, time, and plaintext bound.
 * @returns A version-one AES-256-GCM envelope.
 */
export declare function encryptMindGardenJson(options: {
    readonly key: Buffer;
    readonly keyId: string;
    readonly collection: MindGardenVaultCollection;
    readonly id: string;
    readonly value: JsonValue;
    readonly now: number;
    readonly previous?: MindGardenVaultEnvelope;
    readonly maxPlaintextBytes: number;
}): MindGardenVaultEnvelope;
/**
 * Authenticate, decrypt, parse, and detach one lossless-JSON record.
 * @param options - Key, record identity, envelope, and plaintext bound.
 * @returns Detached lossless JSON after authentication and validation.
 */
export declare function decryptMindGardenJson(options: {
    readonly key: Buffer;
    readonly keyId: string;
    readonly collection: MindGardenVaultCollection;
    readonly id: string;
    readonly envelope: MindGardenVaultEnvelope;
    readonly maxPlaintextBytes: number;
}): JsonValue;
//# sourceMappingURL=crypto.d.ts.map