/** Shared validation and authenticated-field helpers for original Fun Garden records. */
import { Buffer } from 'node:buffer';
import type { DatabaseSync, SQLOutputValue } from 'node:sqlite';
/** One untrusted row returned by the read-only original SQLite snapshot. */
export type LegacyRow = Readonly<Record<string, SQLOutputValue>>;
/**
 * Derive a stable current UUID from one original-record identity.
 *
 * @param seed - Original domain and record identity.
 * @returns A deterministic UUID string with version-five and RFC variant bits.
 */
export declare function deterministicLegacyUuid(seed: string): string;
/**
 * Authenticate and decrypt one original private field.
 *
 * @param value - Complete original MG1 ciphertext envelope.
 * @param key - Authenticated archive data key.
 * @param aad - Original field's additional authenticated data.
 * @returns A newly allocated plaintext buffer owned by the caller.
 */
export declare function decryptLegacyField(value: Uint8Array, key: Buffer, aad: string): Buffer;
/**
 * Require one finite SQLite number.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns The validated finite number.
 */
export declare function legacyFiniteNumber(value: SQLOutputValue, label: string): number;
/**
 * Require one positive safe SQLite integer.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns The validated positive integer.
 */
export declare function legacyPositiveInteger(value: SQLOutputValue, label: string): number;
/**
 * Require one safe SQLite integer.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns The validated integer.
 */
export declare function legacyInteger(value: SQLOutputValue, label: string): number;
/**
 * Require one bounded non-empty SQLite text value.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @param maximum - Maximum permitted UTF-8 byte length.
 * @returns The validated text.
 */
export declare function legacyText(value: SQLOutputValue, label: string, maximum?: number): string;
/**
 * Read optional bounded SQLite text, treating only null as absent.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @param maximum - Maximum permitted UTF-8 byte length.
 * @returns Validated text or null when the source value is null.
 */
export declare function legacyOptionalText(value: SQLOutputValue, label: string, maximum?: number): string | null;
/**
 * Require one non-empty SQLite byte string.
 *
 * @param value - Untrusted SQLite value.
 * @param label - Stable diagnostic label for this field.
 * @returns A detached buffer containing the validated bytes.
 */
export declare function legacyBlob(value: SQLOutputValue, label: string): Buffer;
/**
 * Convert original Unix seconds to current integer milliseconds.
 *
 * @param value - Untrusted original Unix-seconds value.
 * @param label - Stable diagnostic label for this field.
 * @returns A non-negative safe integer timestamp in milliseconds.
 */
export declare function legacyMilliseconds(value: SQLOutputValue, label: string): number;
/**
 * Check whether an original snapshot contains one known table.
 *
 * @param database - Read-only original SQLite snapshot.
 * @param table - Exact static table name expected by the converter.
 * @returns Whether the table exists.
 */
export declare function hasLegacyTable(database: DatabaseSync, table: string): boolean;
/**
 * Read a bounded result from one static original-database query.
 *
 * @param database - Read-only original SQLite snapshot.
 * @param table - Exact static table name used for presence and diagnostics.
 * @param query - Static converter-owned SQL with one row-limit parameter.
 * @param maximum - Maximum permitted result count.
 * @returns Bounded untrusted rows, or an empty list when the table is absent.
 */
export declare function readLegacyRows(database: DatabaseSync, table: string, query: string, maximum: number): readonly LegacyRow[];
//# sourceMappingURL=legacy-values.d.ts.map