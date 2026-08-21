/** Shared validation and authenticated-field helpers for original Fun Garden records. */
import { Buffer } from 'node:buffer';
import { createDecipheriv, createHash } from 'node:crypto';
import { MindGardenPortabilityError } from "./backup.js";
const LEGACY_CIPHERTEXT_MAGIC = Buffer.from('MG1', 'ascii');
const LEGACY_NONCE_BYTES = 12;
const LEGACY_TAG_BYTES = 16;
/**
 * Derive a stable current UUID from one original-record identity.
 *
 * @param seed - Original domain and record identity.
 * @returns A deterministic UUID string with version-five and RFC variant bits.
 */
export function deterministicLegacyUuid(seed) {
    const bytes = createHash('sha256').update(seed, 'utf8').digest().subarray(0, 16);
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    const hex = bytes.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
/**
 * Authenticate and decrypt one original private field.
 *
 * @param value - Complete original MG1 ciphertext envelope.
 * @param key - Authenticated archive data key.
 * @param aad - Original field's additional authenticated data.
 * @returns A newly allocated plaintext buffer owned by the caller.
 */
export function decryptLegacyField(value, key, aad) {
    const encrypted = Buffer.from(value);
    const minimumBytes = LEGACY_CIPHERTEXT_MAGIC.length + LEGACY_NONCE_BYTES + LEGACY_TAG_BYTES;
    if (encrypted.length < minimumBytes
        || !encrypted.subarray(0, LEGACY_CIPHERTEXT_MAGIC.length).equals(LEGACY_CIPHERTEXT_MAGIC)) {
        encrypted.fill(0);
        throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden private value has an invalid header');
    }
    const nonceStart = LEGACY_CIPHERTEXT_MAGIC.length;
    const nonce = Buffer.from(encrypted.subarray(nonceStart, nonceStart + LEGACY_NONCE_BYTES));
    try {
        const decipher = createDecipheriv('aes-256-gcm', key, nonce);
        decipher.setAAD(Buffer.from(aad, 'utf8'));
        decipher.setAuthTag(encrypted.subarray(encrypted.length - LEGACY_TAG_BYTES));
        return Buffer.concat([
            decipher.update(encrypted.subarray(nonceStart + LEGACY_NONCE_BYTES, encrypted.length - LEGACY_TAG_BYTES)),
            decipher.final(),
        ]);
    }
    catch (error) {
        throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden private value could not be authenticated', { cause: error });
    }
    finally {
        encrypted.fill(0);
        nonce.fill(0);
    }
}
/**
 * Require one finite SQLite number.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns The validated finite number.
 */
export function legacyFiniteNumber(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden ${label} is invalid`);
    }
    return value;
}
/**
 * Require one positive safe SQLite integer.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns The validated positive integer.
 */
export function legacyPositiveInteger(value, label) {
    const number = legacyFiniteNumber(value, label);
    if (!Number.isSafeInteger(number) || number < 1) {
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden ${label} is invalid`);
    }
    return number;
}
/**
 * Require one safe SQLite integer.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns The validated integer.
 */
export function legacyInteger(value, label) {
    const number = legacyFiniteNumber(value, label);
    if (!Number.isSafeInteger(number)) {
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden ${label} is invalid`);
    }
    return number;
}
/**
 * Require one bounded non-empty SQLite text value.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @param maximum - Maximum permitted UTF-8 byte length.
 * @returns The validated text.
 */
export function legacyText(value, label, maximum = 256) {
    if (typeof value !== 'string' || value.length === 0 || Buffer.byteLength(value, 'utf8') > maximum) {
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden ${label} is invalid`);
    }
    return value;
}
/**
 * Read optional bounded SQLite text, treating only null as absent.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @param maximum - Maximum permitted UTF-8 byte length.
 * @returns Validated text or null when the source value is null.
 */
export function legacyOptionalText(value, label, maximum = 256) {
    if (value === null)
        return null;
    if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > maximum) {
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden ${label} is invalid`);
    }
    return value;
}
/**
 * Require one non-empty SQLite byte string.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns A detached buffer containing the validated bytes.
 */
export function legacyBlob(value, label) {
    if (!(value instanceof Uint8Array) || value.byteLength === 0) {
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden ${label} is invalid`);
    }
    return Buffer.from(value);
}
/**
 * Convert original Unix seconds to current integer milliseconds.
 *
 * @param value - Untrusted original Unix-seconds value.
 * @param label - Stable diagnostic label for this field.
 * @returns A non-negative safe integer timestamp in milliseconds.
 */
export function legacyMilliseconds(value, label) {
    const result = Math.round(legacyFiniteNumber(value, label) * 1_000);
    if (!Number.isSafeInteger(result) || result < 0) {
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden ${label} is invalid`);
    }
    return result;
}
/**
 * Check whether an original snapshot contains one known table.
 *
 * @param database - Read-only original SQLite snapshot.
 * @param table - Exact static table name expected by the converter.
 * @returns Whether the table exists.
 */
export function hasLegacyTable(database, table) {
    return database.prepare('SELECT 1 AS present FROM sqlite_master WHERE type = \'table\' AND name = ?').get(table)?.present === 1;
}
/**
 * Read a bounded result from one static original-database query.
 *
 * @param database - Read-only original SQLite snapshot.
 * @param table - Exact static table name used for presence and diagnostics.
 * @param query - Static converter-owned SQL with one row-limit parameter.
 * @param maximum - Maximum permitted result count.
 * @returns Bounded untrusted rows, or an empty list when the table is absent.
 */
export function readLegacyRows(database, table, query, maximum) {
    if (!hasLegacyTable(database, table))
        return [];
    const rows = database.prepare(query).all(maximum + 1);
    if (rows.length > maximum) {
        throw new MindGardenPortabilityError('backup-too-large', `Original Mind Garden package contains too many ${table} records`);
    }
    return rows;
}
//# sourceMappingURL=legacy-values.js.map