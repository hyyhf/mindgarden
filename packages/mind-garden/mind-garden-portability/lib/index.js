import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes, scrypt } from "node:crypto";
import s from "@deepseek-ai/schemastery";
import { AttachmentError, AttachmentId } from "@deepseek-ai/dsh-attachment";
import { decodeStoredRecord } from "@deepseek-ai/dsh-mind-garden/memory";
import { decodeStoredMediaRecord } from "@deepseek-ai/dsh-mind-garden/media";
import { decodeStoredReflection } from "@deepseek-ai/dsh-mind-garden/reflection";
import { decodeStoredStarState } from "@deepseek-ai/dsh-mind-garden/star-map";
import { MindGardenVaultError, MindGardenVaultRecordId } from "@deepseek-ai/dsh-mind-garden/vault";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { gunzip, gzip } from "node:zlib";
import { z } from "zod";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
//#region lib/types/backup.js
/** Versioned passphrase encryption for portable Mind Garden profile snapshots. */
const BACKUP_MAGIC = "DSHMG01";
const BACKUP_FORMAT = "deepseek-harness.mind-garden.profile";
const PAYLOAD_VERSION = 1;
const SCRYPT_COST = 65536;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SCRYPT_MAX_MEMORY = 128 * 1024 * 1024;
const KEY_BYTES = 32;
const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const MIN_PASSPHRASE_CODE_POINTS = 12;
const MAX_PASSPHRASE_CODE_POINTS = 256;
/** Coded internal failure converted to a stable Remote result by the service. */
var MindGardenPortabilityError = class extends Error {
	code;
	name = "MindGardenPortabilityError";
	constructor(code, message, options) {
		super(message, options);
		this.code = code;
	}
};
const attachmentRefSchema = z.object({
	attachmentId: z.string().regex(/^sha256:[0-9a-f]{64}$/),
	mediaType: z.enum([
		"image/png",
		"image/jpeg",
		"image/webp",
		"image/gif"
	]),
	bytes: z.number().int().positive(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	name: z.string().min(1).optional()
}).strict();
const payloadSchema = z.object({
	format: z.literal(BACKUP_FORMAT),
	version: z.literal(PAYLOAD_VERSION),
	createdAt: z.number().int().nonnegative(),
	vaultCreatedAt: z.number().int().nonnegative(),
	collections: z.object({
		memories: z.array(z.object({
			id: z.string().min(1),
			value: z.json()
		}).strict()),
		reflections: z.array(z.object({
			id: z.string().min(1),
			value: z.json()
		}).strict()),
		media: z.array(z.object({
			id: z.string().min(1),
			value: z.json()
		}).strict()),
		stars: z.array(z.object({
			id: z.string().min(1),
			value: z.json()
		}).strict())
	}).strict(),
	attachments: z.array(z.object({
		ref: attachmentRefSchema,
		data: z.string().min(1)
	}).strict())
}).strict();
const packageSchema = z.object({
	magic: z.literal(BACKUP_MAGIC),
	version: z.literal(PAYLOAD_VERSION),
	kdf: z.object({
		name: z.literal("scrypt"),
		salt: z.string(),
		cost: z.literal(SCRYPT_COST),
		blockSize: z.literal(SCRYPT_BLOCK_SIZE),
		parallelization: z.literal(SCRYPT_PARALLELIZATION),
		keyBytes: z.literal(KEY_BYTES)
	}).strict(),
	cipher: z.object({
		name: z.literal("A256GCM"),
		nonce: z.string()
	}).strict(),
	compression: z.literal("gzip"),
	ciphertext: z.string()
}).strict();
/**
* Require a memorable multi-word passphrase rather than an eight-character legacy password.
*
* @param passphrase User-held secret used to derive the archive encryption key.
*/
function assertMindGardenBackupPassphrase(passphrase) {
	const codePoints = Array.from(passphrase).length;
	if (codePoints < MIN_PASSPHRASE_CODE_POINTS || codePoints > MAX_PASSPHRASE_CODE_POINTS || passphrase.trim().length === 0) throw new MindGardenPortabilityError("invalid-passphrase", `Mind Garden backup passphrase must contain ${MIN_PASSPHRASE_CODE_POINTS}-${MAX_PASSPHRASE_CODE_POINTS} characters`);
}
function deriveKey(passphrase, salt) {
	return new Promise((resolve, reject) => {
		scrypt(passphrase, salt, KEY_BYTES, {
			N: SCRYPT_COST,
			r: SCRYPT_BLOCK_SIZE,
			p: SCRYPT_PARALLELIZATION,
			maxmem: SCRYPT_MAX_MEMORY
		}, (error, key) => {
			if (error === null) resolve(key);
			else reject(error);
		});
	});
}
function gzipBuffer(input) {
	return new Promise((resolve, reject) => {
		gzip(input, { level: 6 }, (error, result) => {
			if (error === null) resolve(result);
			else reject(error);
		});
	});
}
function gunzipBuffer(input, maxOutputLength) {
	return new Promise((resolve, reject) => {
		gunzip(input, { maxOutputLength }, (error, result) => {
			if (error === null) resolve(result);
			else reject(error);
		});
	});
}
function decodeCanonicalBase64(value, label, length) {
	const decoded = Buffer.from(value, "base64");
	if (decoded.toString("base64") !== value || length !== void 0 && decoded.length !== length) {
		decoded.fill(0);
		throw new MindGardenPortabilityError("invalid-backup", `Mind Garden backup has invalid ${label}`);
	}
	return decoded;
}
function metadataOf(value) {
	return {
		magic: value.magic,
		version: value.version,
		kdf: value.kdf,
		cipher: value.cipher,
		compression: value.compression
	};
}
function additionalData(metadata) {
	return Buffer.from(JSON.stringify(metadata), "utf8");
}
/**
* Compress and passphrase-encrypt one complete logical profile snapshot.
* @param payload - Detached vault records and verified image bytes.
* @param passphrase - User-held recovery secret; it is never stored in the package.
* @param maxPlaintextBytes - Upper bound before compression and Remote encoding.
* @returns UTF-8 JSON package bytes containing only KDF metadata and ciphertext.
*/
async function encryptMindGardenBackup(payload, passphrase, maxPlaintextBytes) {
	assertMindGardenBackupPassphrase(passphrase);
	const plaintext = Buffer.from(JSON.stringify(payloadSchema.parse(payload)), "utf8");
	if (plaintext.length > maxPlaintextBytes) {
		plaintext.fill(0);
		throw new MindGardenPortabilityError("backup-too-large", "Mind Garden backup exceeds the configured plaintext bound");
	}
	const salt = randomBytes(SALT_BYTES);
	const nonce = randomBytes(NONCE_BYTES);
	let key;
	let compressed;
	try {
		compressed = await gzipBuffer(plaintext);
		key = await deriveKey(passphrase, salt);
		const metadata = {
			magic: BACKUP_MAGIC,
			version: PAYLOAD_VERSION,
			kdf: {
				name: "scrypt",
				salt: salt.toString("base64"),
				cost: SCRYPT_COST,
				blockSize: SCRYPT_BLOCK_SIZE,
				parallelization: SCRYPT_PARALLELIZATION,
				keyBytes: KEY_BYTES
			},
			cipher: {
				name: "A256GCM",
				nonce: nonce.toString("base64")
			},
			compression: "gzip"
		};
		const cipher = createCipheriv("aes-256-gcm", key, nonce);
		cipher.setAAD(additionalData(metadata));
		const body = Buffer.concat([
			cipher.update(compressed),
			cipher.final(),
			cipher.getAuthTag()
		]);
		const packaged = {
			...metadata,
			ciphertext: body.toString("base64")
		};
		body.fill(0);
		return Buffer.from(JSON.stringify(packaged), "utf8");
	} finally {
		plaintext.fill(0);
		compressed?.fill(0);
		key?.fill(0);
		salt.fill(0);
		nonce.fill(0);
	}
}
/**
* Authenticate and decode one version-one package for import and recovery.
* @param data - Untrusted package bytes.
* @param passphrase - User-held recovery secret.
* @param maxPlaintextBytes - Decompression and JSON payload bound.
* @returns Strictly validated logical profile payload.
*/
async function decryptMindGardenBackup(data, passphrase, maxPlaintextBytes) {
	assertMindGardenBackupPassphrase(passphrase);
	let parsed;
	try {
		parsed = packageSchema.parse(JSON.parse(Buffer.from(data).toString("utf8")));
	} catch (error) {
		throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup package is malformed", { cause: error });
	}
	const salt = decodeCanonicalBase64(parsed.kdf.salt, "salt", SALT_BYTES);
	const nonce = decodeCanonicalBase64(parsed.cipher.nonce, "nonce", NONCE_BYTES);
	const encrypted = decodeCanonicalBase64(parsed.ciphertext, "ciphertext");
	if (encrypted.length <= TAG_BYTES) {
		salt.fill(0);
		nonce.fill(0);
		encrypted.fill(0);
		throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup ciphertext is truncated");
	}
	let key;
	let compressed;
	let plaintext;
	try {
		key = await deriveKey(passphrase, salt);
		const decipher = createDecipheriv("aes-256-gcm", key, nonce);
		decipher.setAAD(additionalData(metadataOf(parsed)));
		decipher.setAuthTag(encrypted.subarray(encrypted.length - TAG_BYTES));
		compressed = Buffer.concat([decipher.update(encrypted.subarray(0, encrypted.length - TAG_BYTES)), decipher.final()]);
		plaintext = await gunzipBuffer(compressed, maxPlaintextBytes);
		const payload = payloadSchema.parse(JSON.parse(plaintext.toString("utf8")));
		return {
			...payload,
			attachments: payload.attachments.map((attachment) => ({
				...attachment,
				ref: {
					attachmentId: AttachmentId(attachment.ref.attachmentId),
					mediaType: attachment.ref.mediaType,
					bytes: attachment.ref.bytes,
					width: attachment.ref.width,
					height: attachment.ref.height,
					...attachment.ref.name === void 0 ? {} : { name: attachment.ref.name }
				}
			}))
		};
	} catch (error) {
		if (error instanceof MindGardenPortabilityError) throw error;
		throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup could not be authenticated", { cause: error });
	} finally {
		salt.fill(0);
		nonce.fill(0);
		encrypted.fill(0);
		key?.fill(0);
		compressed?.fill(0);
		plaintext?.fill(0);
	}
}
//#endregion
//#region lib/types/legacy-values.js
/** Shared validation and authenticated-field helpers for original Fun Garden records. */
const LEGACY_CIPHERTEXT_MAGIC = Buffer.from("MG1", "ascii");
const LEGACY_NONCE_BYTES$1 = 12;
const LEGACY_TAG_BYTES$1 = 16;
/**
* Derive a stable current UUID from one original-record identity.
*
* @param seed - Original domain and record identity.
* @returns A deterministic UUID string with version-five and RFC variant bits.
*/
function deterministicLegacyUuid(seed) {
	const bytes = createHash("sha256").update(seed, "utf8").digest().subarray(0, 16);
	bytes[6] = (bytes[6] ?? 0) & 15 | 80;
	bytes[8] = (bytes[8] ?? 0) & 63 | 128;
	const hex = bytes.toString("hex");
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
function decryptLegacyField(value, key, aad) {
	const encrypted = Buffer.from(value);
	const minimumBytes = LEGACY_CIPHERTEXT_MAGIC.length + LEGACY_NONCE_BYTES$1 + LEGACY_TAG_BYTES$1;
	if (encrypted.length < minimumBytes || !encrypted.subarray(0, LEGACY_CIPHERTEXT_MAGIC.length).equals(LEGACY_CIPHERTEXT_MAGIC)) {
		encrypted.fill(0);
		throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden private value has an invalid header");
	}
	const nonceStart = LEGACY_CIPHERTEXT_MAGIC.length;
	const nonce = Buffer.from(encrypted.subarray(nonceStart, nonceStart + LEGACY_NONCE_BYTES$1));
	try {
		const decipher = createDecipheriv("aes-256-gcm", key, nonce);
		decipher.setAAD(Buffer.from(aad, "utf8"));
		decipher.setAuthTag(encrypted.subarray(encrypted.length - LEGACY_TAG_BYTES$1));
		return Buffer.concat([decipher.update(encrypted.subarray(nonceStart + LEGACY_NONCE_BYTES$1, encrypted.length - LEGACY_TAG_BYTES$1)), decipher.final()]);
	} catch (error) {
		throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden private value could not be authenticated", { cause: error });
	} finally {
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
function legacyFiniteNumber(value, label) {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is invalid`);
	return value;
}
/**
* Require one positive safe SQLite integer.
*
* @param value - Untrusted SQLite value.
* @param label - Stable diagnostic label for this field.
* @returns The validated positive integer.
*/
function legacyPositiveInteger(value, label) {
	const number = legacyFiniteNumber(value, label);
	if (!Number.isSafeInteger(number) || number < 1) throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is invalid`);
	return number;
}
/**
* Require one safe SQLite integer.
*
* @param value - Untrusted SQLite value.
* @param label - Stable diagnostic label for this field.
* @returns The validated integer.
*/
function legacyInteger(value, label) {
	const number = legacyFiniteNumber(value, label);
	if (!Number.isSafeInteger(number)) throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is invalid`);
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
function legacyText(value, label, maximum = 256) {
	if (typeof value !== "string" || value.length === 0 || Buffer.byteLength(value, "utf8") > maximum) throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is invalid`);
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
function legacyOptionalText(value, label, maximum = 256) {
	if (value === null) return null;
	if (typeof value !== "string" || Buffer.byteLength(value, "utf8") > maximum) throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is invalid`);
	return value;
}
/**
* Require one non-empty SQLite byte string.
*
* @param value - Untrusted SQLite value.
* @param label - Stable diagnostic label for this field.
* @returns A detached buffer containing the validated bytes.
*/
function legacyBlob(value, label) {
	if (!(value instanceof Uint8Array) || value.byteLength === 0) throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is invalid`);
	return Buffer.from(value);
}
/**
* Convert original Unix seconds to current integer milliseconds.
*
* @param value - Untrusted original Unix-seconds value.
* @param label - Stable diagnostic label for this field.
* @returns A non-negative safe integer timestamp in milliseconds.
*/
function legacyMilliseconds(value, label) {
	const result = Math.round(legacyFiniteNumber(value, label) * 1e3);
	if (!Number.isSafeInteger(result) || result < 0) throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is invalid`);
	return result;
}
/**
* Check whether an original snapshot contains one known table.
*
* @param database - Read-only original SQLite snapshot.
* @param table - Exact static table name expected by the converter.
* @returns Whether the table exists.
*/
function hasLegacyTable(database, table) {
	return database.prepare("SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = ?").get(table)?.present === 1;
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
function readLegacyRows(database, table, query, maximum) {
	if (!hasLegacyTable(database, table)) return [];
	const rows = database.prepare(query).all(maximum + 1);
	if (rows.length > maximum) throw new MindGardenPortabilityError("backup-too-large", `Original Mind Garden package contains too many ${table} records`);
	return rows;
}
//#endregion
//#region lib/types/legacy-private.js
/** Read-only conversion of original private records into current vault collections. */
const MAX_LEGACY_RECORDS = 2e3;
const MAX_LEGACY_FIELD_BYTES = 4 * 1024 * 1024;
const LEGACY_SOURCE_PREFIX = "fun-garden-v1";
const UTF8 = new TextDecoder("utf-8", { fatal: true });
const stringArraySchema = z.array(z.string().min(1));
const emotionWordsSchema = stringArraySchema.max(3);
const moodSchema = z.union([
	z.literal(-2),
	z.literal(-1),
	z.literal(0),
	z.literal(1),
	z.literal(2)
]);
const energySchema = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5)
]);
const nullableEnergySchema = energySchema.nullable();
const checkinPhaseSchema = z.enum([
	"standalone",
	"before",
	"after",
	"journal"
]);
const contemplationStatusSchema = z.enum(["draft", "confirmed"]);
const experimentStatusSchema = z.enum([
	"proposed",
	"trying",
	"observed",
	"revised",
	"stopped"
]);
const openQuestionStatusSchema = z.enum([
	"open",
	"resolved",
	"dismissed"
]);
const periodReviewStatusSchema = z.enum([
	"proposed",
	"saved",
	"archived"
]);
const periodReviewTypeSchema = z.enum([
	"week",
	"month",
	"year"
]);
const memoryStatusSchema = z.enum([
	"candidate",
	"confirmed",
	"rejected"
]);
const sensitivitySchema = z.enum(["normal", "high"]);
const principleStatusSchema = z.enum([
	"trying",
	"adopted",
	"questioning",
	"retired"
]);
const starToneSchema = z.enum([
	"gentle",
	"direct",
	"mystic"
]);
const starModeSchema = z.enum([
	"known",
	"scenes",
	"observe"
]);
const starKindSchema = z.enum([
	"strength",
	"tension",
	"pattern",
	"unfolded"
]);
const starStatusSchema = z.enum([
	"pending",
	"confirmed",
	"uncertain",
	"rejected",
	"retired"
]);
const sceneAnswerSchema = z.enum([
	"1a",
	"1b",
	"2a",
	"2b",
	"3a",
	"3b",
	"4a",
	"4b",
	"5a",
	"5b",
	"6a",
	"6b"
]);
const legacyPeriodSourcesSchema = z.array(z.object({
	type: z.string().min(1).max(64),
	id: z.string().min(1).max(256),
	date: z.string().optional()
}).strip());
const legacyPrincipleContentSchema = z.looseObject({
	expression: z.string().min(1),
	formation_context: z.string().default(""),
	user_quote: z.string().default(""),
	supporting_experiences: z.array(z.looseObject({
		summary: z.string().default(""),
		source_note_id: z.string().nullable().optional()
	})).default([]),
	counterexample: z.string().default(""),
	applies_to: z.array(z.string()).default([]),
	not_applies_to: z.array(z.string()).default([]),
	last_challenged: z.string().default(""),
	status: principleStatusSchema.default("trying")
});
function invalid(label, cause) {
	return new MindGardenPortabilityError("invalid-backup", `Original Mind Garden ${label} is unsupported`, cause === void 0 ? void 0 : { cause });
}
function toBackupRecord(id, value) {
	return {
		id,
		value: JSON.parse(JSON.stringify(value))
	};
}
function originalId(context, domain, value) {
	const legacyId = legacyText(value, `${domain} id`, 256);
	return deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:${domain}:${legacyId}`);
}
function originalVersion(context, domain, legacyId, updatedAt) {
	return deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:${domain}-version:${legacyId}:${String(updatedAt)}`);
}
function bool(value, label) {
	const number = legacyInteger(value, label);
	if (number !== 0 && number !== 1) throw invalid(label);
	return number === 1;
}
function localDate(value, label) {
	const date = legacyText(value, label, 32);
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) throw invalid(label);
	return date;
}
function privateText(value, key, aad, label, allowEmpty = false) {
	const plaintext = decryptLegacyField(legacyBlob(value, label), key, aad);
	try {
		if (plaintext.length > MAX_LEGACY_FIELD_BYTES) throw invalid(label);
		const result = UTF8.decode(plaintext);
		if (!allowEmpty && result.length === 0) throw invalid(label);
		return result;
	} catch (error) {
		if (error instanceof MindGardenPortabilityError) throw error;
		throw invalid(label, error);
	} finally {
		plaintext.fill(0);
	}
}
function optionalPrivateText(value, key, aad, label) {
	if (value === null) return "";
	return privateText(value, key, aad, label, true);
}
function privateJson(value, key, aad, label, schema) {
	const plaintext = privateText(value, key, aad, label, true);
	try {
		return schema.parse(JSON.parse(plaintext));
	} catch (error) {
		throw invalid(label, error);
	}
}
function canonicalFile(files, name) {
	const encoded = files[name];
	if (encoded === void 0) return null;
	const bytes = Buffer.from(encoded, "base64");
	if (bytes.toString("base64") !== encoded) {
		bytes.fill(0);
		throw invalid(`${name} file`);
	}
	return bytes;
}
function settingsTimeZone(files) {
	const bytes = canonicalFile(files, "settings.json");
	if (bytes === null) return "Asia/Shanghai";
	try {
		const timeZone = z.looseObject({ timezone: z.string().min(1).max(128).optional() }).parse(JSON.parse(UTF8.decode(bytes))).timezone ?? "Asia/Shanghai";
		new Intl.DateTimeFormat("en-CA", { timeZone }).format(0);
		return timeZone;
	} catch (error) {
		throw invalid("settings file", error);
	} finally {
		bytes.fill(0);
	}
}
function stampAt(timestamp, timeZone) {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23"
	});
	const parts = new Map(formatter.formatToParts(timestamp).map((part) => [part.type, part.value]));
	const year = Number(parts.get("year"));
	const month = Number(parts.get("month"));
	const day = Number(parts.get("day"));
	const hour = Number(parts.get("hour"));
	const minute = Number(parts.get("minute"));
	const second = Number(parts.get("second"));
	const localMillis = Date.UTC(year, month - 1, day, hour, minute, second);
	const offset = Math.round((localMillis - Math.floor(timestamp / 1e3) * 1e3) / 6e4);
	if (![
		year,
		month,
		day,
		hour,
		minute,
		second,
		offset
	].every(Number.isFinite) || offset < -840 || offset > 840) throw invalid("time zone metadata");
	return {
		localDate: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
		timeZone,
		utcOffsetMinutes: offset
	};
}
function stampForDate(date, timeZone, referenceAt) {
	return {
		...stampAt(referenceAt, timeZone),
		localDate: date
	};
}
function reflectionRecord(record) {
	const decoded = decodeStoredReflection(record);
	return toBackupRecord(decoded.id, decoded);
}
function memoryRecord(record) {
	const decoded = decodeStoredRecord(record);
	return toBackupRecord(decoded.id, decoded);
}
function convertCheckins(context) {
	return readLegacyRows(context.database, "daily_checkins", `
    SELECT id, local_date, timezone, utc_offset_minutes, valence_enc, energy_enc,
      emotion_words_enc, phase, created_at
    FROM daily_checkins ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "check-in id", 256);
		const id = originalId(context, "checkin", row.id);
		const mood = moodSchema.parse(Number(privateText(row.valence_enc, context.key, `checkin:${legacyId}:mood`, "check-in mood")));
		const energy = energySchema.parse(Number(privateText(row.energy_enc, context.key, `checkin:${legacyId}:energy`, "check-in energy")));
		return reflectionRecord({
			recordType: "checkin",
			formatVersion: 1,
			id,
			sourceSessionId: context.sourceSessionId,
			stamp: {
				localDate: localDate(row.local_date, "check-in local date"),
				timeZone: legacyText(row.timezone, "check-in time zone", 128),
				utcOffsetMinutes: legacyInteger(row.utc_offset_minutes, "check-in UTC offset")
			},
			mood,
			energy,
			emotionWords: privateJson(row.emotion_words_enc, context.key, `checkin:${legacyId}:emotion_words`, "check-in emotion words", emotionWordsSchema),
			phase: checkinPhaseSchema.parse(legacyText(row.phase, "check-in phase", 32)),
			createdAt: legacyMilliseconds(row.created_at, "check-in creation time")
		});
	});
}
function convertJournals(context) {
	const versions = /* @__PURE__ */ new Map();
	return {
		records: readLegacyRows(context.database, "journal_entries", `
    SELECT id, local_date, timezone, utc_offset_minutes, title_enc, content_enc,
      allow_retrieval, created_at, updated_at
    FROM journal_entries ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
			const legacyId = legacyText(row.id, "journal id", 256);
			const id = originalId(context, "journal", row.id);
			const createdAt = legacyMilliseconds(row.created_at, "journal creation time");
			const updatedAt = legacyMilliseconds(row.updated_at, "journal update time");
			const version = originalVersion(context, "journal", legacyId, updatedAt);
			versions.set(legacyId, version);
			return reflectionRecord({
				recordType: "journal",
				formatVersion: 1,
				id,
				version,
				sourceSessionId: context.sourceSessionId,
				stamp: {
					localDate: localDate(row.local_date, "journal local date"),
					timeZone: legacyText(row.timezone, "journal time zone", 128),
					utcOffsetMinutes: legacyInteger(row.utc_offset_minutes, "journal UTC offset")
				},
				title: optionalPrivateText(row.title_enc, context.key, `journal:${legacyId}:title`, "journal title"),
				body: privateText(row.content_enc, context.key, `journal:${legacyId}:body`, "journal body"),
				allowRetrieval: bool(row.allow_retrieval, "journal retrieval permission"),
				createdAt,
				updatedAt
			});
		}),
		versions
	};
}
function convertConcerns(context) {
	return readLegacyRows(context.database, "concerns", `
    SELECT id, content_enc, status, created_local_date, remind_on, timezone,
      converted_journal_id, created_at, updated_at
    FROM concerns ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "concern id", 256);
		const id = originalId(context, "concern", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "concern creation time");
		const updatedAt = legacyMilliseconds(row.updated_at, "concern update time");
		const timeZone = legacyOptionalText(row.timezone, "concern time zone", 128) || context.timeZone;
		const originalStatus = legacyText(row.status, "concern status", 32);
		const convertedJournal = legacyOptionalText(row.converted_journal_id, "converted journal id", 256);
		const status = originalStatus === "done" ? "completed" : originalStatus;
		if (status !== "active" && status !== "completed" && status !== "converted") throw invalid("concern status");
		if (status === "converted" && convertedJournal === null) throw invalid("converted concern journal");
		const reminderDate = legacyOptionalText(row.remind_on, "concern reminder date", 32);
		return reflectionRecord({
			recordType: "concern",
			formatVersion: 1,
			id,
			version: originalVersion(context, "concern", legacyId, updatedAt),
			sourceSessionId: context.sourceSessionId,
			content: privateText(row.content_enc, context.key, `concern:${legacyId}:content`, "concern content"),
			status,
			createdStamp: stampForDate(localDate(row.created_local_date, "concern creation date"), timeZone, createdAt),
			reminder: status === "active" && reminderDate !== null ? stampForDate(localDate(reminderDate, "concern reminder date"), timeZone, updatedAt) : null,
			convertedJournalId: convertedJournal === null ? null : originalId(context, "journal", convertedJournal),
			conversion: null,
			createdAt,
			updatedAt
		});
	});
}
function convertContemplations(context) {
	const records = readLegacyRows(context.database, "contemplation_notes", `
    SELECT id, session_id, markdown_enc, status, confirmed_at, created_at, updated_at
    FROM contemplation_notes WHERE status != 'deleted' ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "contemplation id", 256);
		const id = originalId(context, "contemplation", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "contemplation creation time");
		const originalUpdatedAt = legacyMilliseconds(row.updated_at, "contemplation update time");
		const status = contemplationStatusSchema.parse(legacyText(row.status, "contemplation status", 32));
		const confirmedAt = status === "confirmed" ? Math.max(createdAt, row.confirmed_at === null ? originalUpdatedAt : legacyMilliseconds(row.confirmed_at, "contemplation confirmation time")) : null;
		const updatedAt = confirmedAt ?? originalUpdatedAt;
		return reflectionRecord({
			recordType: "contemplation",
			formatVersion: 1,
			id,
			version: originalVersion(context, "contemplation", legacyId, updatedAt),
			sourceSessionId: legacyOptionalText(row.session_id, "contemplation session id", 256) ?? context.sourceSessionId,
			markdown: privateText(row.markdown_enc, context.key, `contemplation_note:${legacyId}:markdown`, "contemplation markdown"),
			status,
			createdAt,
			updatedAt,
			confirmedAt
		});
	});
	for (const name of ["philosophy-notebook.md", "personal-philosophy.md"]) {
		const bytes = canonicalFile(context.files, name);
		if (bytes === null) continue;
		try {
			if (bytes.length > MAX_LEGACY_FIELD_BYTES) throw invalid(`${name} file`);
			const markdown = UTF8.decode(bytes).trim();
			if (markdown.length === 0) continue;
			const id = deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:markdown:${name}`);
			records.push(reflectionRecord({
				recordType: "contemplation",
				formatVersion: 1,
				id,
				version: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:markdown-version:${name}`),
				sourceSessionId: context.sourceSessionId,
				markdown,
				status: "confirmed",
				createdAt: context.createdAt,
				updatedAt: context.createdAt,
				confirmedAt: context.createdAt
			}));
		} catch (error) {
			if (error instanceof MindGardenPortabilityError) throw error;
			throw invalid(`${name} file`, error);
		} finally {
			bytes.fill(0);
		}
	}
	return records;
}
function convertNotes(context) {
	return readLegacyRows(context.database, "notes", `
    SELECT id, session_id, markdown_enc, status, created_at, updated_at
    FROM notes WHERE status != 'deleted' ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "note id", 256);
		const id = originalId(context, "note", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "note creation time");
		const confirmedAt = Math.max(createdAt, legacyMilliseconds(row.updated_at, "note update time"));
		return reflectionRecord({
			recordType: "contemplation",
			formatVersion: 1,
			id,
			version: originalVersion(context, "note", legacyId, confirmedAt),
			sourceSessionId: legacyOptionalText(row.session_id, "note session id", 256) ?? context.sourceSessionId,
			markdown: privateText(row.markdown_enc, context.key, `note:${legacyId}:markdown`, "note markdown"),
			status: "confirmed",
			createdAt,
			updatedAt: confirmedAt,
			confirmedAt
		});
	});
}
function convertPrinciples(context) {
	const versionRows = readLegacyRows(context.database, "principle_versions", `
    SELECT principle_id, version, content_enc, source_note_id, created_at
    FROM principle_versions ORDER BY principle_id, version LIMIT ?
  `, MAX_LEGACY_RECORDS);
	const versionsByPrinciple = /* @__PURE__ */ new Map();
	for (const row of versionRows) {
		const principleId = legacyText(row.principle_id, "principle version owner id", 256);
		const versions = versionsByPrinciple.get(principleId) ?? [];
		versions.push(row);
		versionsByPrinciple.set(principleId, versions);
	}
	return readLegacyRows(context.database, "principles", `
    SELECT id, status, current_version, created_at, updated_at
    FROM principles ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "principle id", 256);
		const id = originalId(context, "principle", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "principle creation time");
		const currentVersion = legacyInteger(row.current_version, "principle current version");
		const sourceRows = versionsByPrinciple.get(legacyId) ?? [];
		if (currentVersion < 1 || sourceRows.length !== currentVersion) throw invalid("principle version history");
		const versions = sourceRows.map((versionRow, index) => {
			const number = legacyInteger(versionRow.version, "principle version number");
			if (number !== index + 1) throw invalid("principle version sequence");
			const content = privateJson(versionRow.content_enc, context.key, `principle_version:${legacyId}:${String(number)}`, "principle version content", legacyPrincipleContentSchema);
			const sourceNoteId = legacyOptionalText(versionRow.source_note_id, "principle source note id", 256);
			const created = legacyMilliseconds(versionRow.created_at, "principle version creation time");
			const supportingExperiences = content.supporting_experiences.map((experience) => ({
				summary: experience.summary.trim(),
				sourceContemplationId: experience.source_note_id === null || experience.source_note_id === void 0 ? null : originalId(context, "note", experience.source_note_id)
			})).filter((experience) => experience.summary.length > 0);
			return {
				number,
				content: {
					expression: content.expression,
					formationContext: content.formation_context,
					userQuote: content.user_quote || content.expression,
					supportingExperiences,
					counterexample: content.counterexample,
					appliesTo: content.applies_to.filter(Boolean),
					notAppliesTo: content.not_applies_to.filter(Boolean),
					lastChallenged: content.last_challenged,
					status: content.status
				},
				sourceProposalId: null,
				sourceContemplationId: sourceNoteId === null ? null : originalId(context, "note", sourceNoteId),
				stamp: stampAt(created, context.timeZone),
				createdAt: created
			};
		});
		const latest = versions.at(-1);
		if (latest === void 0) throw invalid("principle version history");
		const status = principleStatusSchema.parse(legacyText(row.status, "principle status", 32));
		if (status !== latest.content.status) throw invalid("principle current status");
		return reflectionRecord({
			recordType: "principle",
			formatVersion: 1,
			id,
			version: originalVersion(context, "principle", legacyId, latest.createdAt),
			status,
			current: latest.content,
			versions,
			createdAt,
			updatedAt: latest.createdAt
		});
	});
}
function convertExperiments(context) {
	const observations = readLegacyRows(context.database, "experiment_observations", `
    SELECT id, experiment_id, happened_enc, action_enc, observation_enc, mood, energy,
      occurred_at, created_at
    FROM experiment_observations ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS);
	const byExperiment = /* @__PURE__ */ new Map();
	for (const row of observations) {
		const experimentId = legacyText(row.experiment_id, "experiment observation owner id", 256);
		const group = byExperiment.get(experimentId) ?? [];
		group.push(row);
		byExperiment.set(experimentId, group);
	}
	return readLegacyRows(context.database, "reality_experiments", `
    SELECT id, title_enc, hypothesis_enc, action_enc, review_on, status, result_enc,
      judgment_enc, source_session_id, source_message_id, evidence_quote_enc,
      created_at, updated_at
    FROM reality_experiments ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "experiment id", 256);
		const id = originalId(context, "experiment", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "experiment creation time");
		const updatedAt = legacyMilliseconds(row.updated_at, "experiment update time");
		const status = experimentStatusSchema.parse(legacyText(row.status, "experiment status", 32));
		const sourceMessageId = legacyOptionalText(row.source_message_id, "experiment source message id", 256);
		const evidenceQuote = optionalPrivateText(row.evidence_quote_enc, context.key, `experiment:${legacyId}:evidence`, "experiment evidence");
		const convertedObservations = (byExperiment.get(legacyId) ?? []).map((observation) => {
			const observationId = legacyText(observation.id, "experiment observation id", 256);
			const occurredAt = legacyMilliseconds(observation.occurred_at, "experiment observation time");
			return {
				id: originalId(context, "experiment-observation", observation.id),
				happened: optionalPrivateText(observation.happened_enc, context.key, `experiment_observation:${observationId}:happened`, "experiment observation event"),
				action: optionalPrivateText(observation.action_enc, context.key, `experiment_observation:${observationId}:action`, "experiment observation action"),
				observation: privateText(observation.observation_enc, context.key, `experiment_observation:${observationId}:observation`, "experiment observation"),
				mood: observation.mood === null ? null : nullableEnergySchema.parse(legacyInteger(observation.mood, "experiment mood")),
				energy: observation.energy === null ? null : nullableEnergySchema.parse(legacyInteger(observation.energy, "experiment energy")),
				stamp: stampAt(occurredAt, context.timeZone),
				createdAt: legacyMilliseconds(observation.created_at, "experiment observation creation time")
			};
		});
		const reviewOn = legacyOptionalText(row.review_on, "experiment review date", 32);
		return reflectionRecord({
			recordType: "experiment",
			formatVersion: 1,
			id,
			version: originalVersion(context, "experiment", legacyId, updatedAt),
			sourceSessionId: legacyOptionalText(row.source_session_id, "experiment source session id", 256) ?? context.sourceSessionId,
			title: privateText(row.title_enc, context.key, `experiment:${legacyId}:title`, "experiment title"),
			hypothesis: privateText(row.hypothesis_enc, context.key, `experiment:${legacyId}:hypothesis`, "experiment hypothesis", true),
			action: privateText(row.action_enc, context.key, `experiment:${legacyId}:action`, "experiment action"),
			reviewStamp: reviewOn !== null && status !== "observed" && status !== "stopped" ? stampForDate(localDate(reviewOn, "experiment review date"), context.timeZone, updatedAt) : null,
			status,
			result: optionalPrivateText(row.result_enc, context.key, `experiment:${legacyId}:result`, "experiment result"),
			judgment: optionalPrivateText(row.judgment_enc, context.key, `experiment:${legacyId}:judgment`, "experiment judgment"),
			sourceMessageId,
			evidenceQuote: sourceMessageId === null ? "" : evidenceQuote,
			observations: convertedObservations,
			createdStamp: stampAt(createdAt, context.timeZone),
			startedAt: status === "proposed" ? null : createdAt,
			stoppedAt: status === "stopped" ? updatedAt : null,
			createdAt,
			updatedAt
		});
	});
}
function convertOpenQuestions(context, journalVersions) {
	return readLegacyRows(context.database, "open_loops", `
    SELECT id, question_enc, status, source_session_id, source_message_id,
      source_journal_id, evidence_quote_enc, created_at, updated_at
    FROM open_loops ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "open question id", 256);
		const id = originalId(context, "open-question", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "open question creation time");
		const updatedAt = legacyMilliseconds(row.updated_at, "open question update time");
		const status = openQuestionStatusSchema.parse(legacyText(row.status, "open question status", 32));
		const sourceMessageId = legacyOptionalText(row.source_message_id, "open question source message id", 256);
		const sourceJournalId = legacyOptionalText(row.source_journal_id, "open question source journal id", 256);
		const evidenceQuote = optionalPrivateText(row.evidence_quote_enc, context.key, `open_loop:${legacyId}:evidence`, "open question evidence");
		const createdStamp = stampAt(createdAt, context.timeZone);
		const source = evidenceQuote.length === 0 ? null : sourceMessageId !== null ? {
			kind: "message",
			messageId: sourceMessageId,
			evidenceQuote
		} : sourceJournalId !== null && journalVersions.has(sourceJournalId) ? {
			kind: "journal",
			journalId: originalId(context, "journal", sourceJournalId),
			journalVersion: journalVersions.get(sourceJournalId),
			evidenceQuote
		} : null;
		const transitions = [{
			id: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:open-question-transition:${legacyId}:open`),
			status: "open",
			stamp: createdStamp,
			createdAt
		}];
		if (status !== "open") transitions.push({
			id: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:open-question-transition:${legacyId}:${status}`),
			status,
			stamp: stampAt(updatedAt, context.timeZone),
			createdAt: updatedAt
		});
		return reflectionRecord({
			recordType: "open-question",
			formatVersion: 1,
			id,
			version: originalVersion(context, "open-question", legacyId, updatedAt),
			sourceSessionId: legacyOptionalText(row.source_session_id, "open question source session id", 256) ?? context.sourceSessionId,
			question: privateText(row.question_enc, context.key, `open_loop:${legacyId}:question`, "open question"),
			status,
			source,
			transitions,
			createdStamp,
			createdAt,
			updatedAt
		});
	});
}
function convertPeriodReviews(context) {
	return readLegacyRows(context.database, "period_reviews", `
    SELECT id, period_type, start_date, end_date, status, content_enc, sources_json,
      created_at, updated_at
    FROM period_reviews ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "period review id", 256);
		const id = originalId(context, "period-review", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "period review creation time");
		const updatedAt = legacyMilliseconds(row.updated_at, "period review update time");
		const startDate = localDate(row.start_date, "period review start date");
		const endDate = localDate(row.end_date, "period review end date");
		let sourceValues;
		try {
			sourceValues = legacyPeriodSourcesSchema.parse(JSON.parse(legacyText(row.sources_json, "period review source manifest", MAX_LEGACY_FIELD_BYTES)));
		} catch (error) {
			throw invalid("period review source manifest", error);
		}
		if (sourceValues.length === 0) sourceValues = [{
			type: "empty-manifest",
			id: legacyId,
			date: endDate
		}];
		const sources = sourceValues.map((source) => {
			const date = source.date !== void 0 && /^\d{4}-\d{2}-\d{2}$/u.test(source.date) && source.date >= startDate && source.date <= endDate ? source.date : endDate;
			return {
				id: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:period-source:${source.type}:${source.id}`),
				sourceType: "legacy-original",
				legacyType: source.type,
				fingerprint: createHash("sha256").update(JSON.stringify(source)).digest("hex"),
				localDates: [date]
			};
		}).sort((left, right) => `${left.sourceType}:${left.id}`.localeCompare(`${right.sourceType}:${right.id}`));
		return reflectionRecord({
			recordType: "period-review",
			formatVersion: 1,
			id,
			version: originalVersion(context, "period-review", legacyId, updatedAt),
			sourceSessionId: context.sourceSessionId,
			periodType: periodReviewTypeSchema.parse(legacyText(row.period_type, "period review type", 16)),
			startStamp: stampForDate(startDate, context.timeZone, createdAt),
			endStamp: stampForDate(endDate, context.timeZone, updatedAt),
			status: periodReviewStatusSchema.parse(legacyText(row.status, "period review status", 32)),
			content: privateText(row.content_enc, context.key, `period_review:${legacyId}:content`, "period review content"),
			sources,
			sourceHash: createHash("sha256").update(JSON.stringify(sources)).digest("hex"),
			createdAt,
			updatedAt
		});
	});
}
function currentMemoryKind(value) {
	if (value === "fact") return "episode";
	if (value === "preference" || value === "support_preference") return "support-preference";
	if (value === "identity" || value === "value" || value === "decision" || value === "emotion" || value === "episode") return value;
	throw invalid("memory kind");
}
function convertMemories(context) {
	const sourceRows = readLegacyRows(context.database, "memory_sources", `
    SELECT memory_id, session_id, message_id, quote_enc
    FROM memory_sources ORDER BY memory_id, session_id, message_id LIMIT ?
  `, MAX_LEGACY_RECORDS);
	const sources = /* @__PURE__ */ new Map();
	for (const row of sourceRows) {
		const memoryId = legacyText(row.memory_id, "memory source owner id", 256);
		const group = sources.get(memoryId) ?? [];
		group.push(row);
		sources.set(memoryId, group);
	}
	return readLegacyRows(context.database, "memories", `
    SELECT id, kind, content_enc, status, sensitivity, reason_enc, expires_at,
      confirmed_at, disabled_at, created_at, updated_at
    FROM memories ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS).map((row) => {
		const legacyId = legacyText(row.id, "memory id", 256);
		const id = originalId(context, "memory", row.id);
		const createdAt = legacyMilliseconds(row.created_at, "memory creation time");
		const updatedAt = legacyMilliseconds(row.updated_at, "memory update time");
		const expiresAt = row.expires_at === null ? void 0 : legacyMilliseconds(row.expires_at, "memory expiry");
		const originalStatus = memoryStatusSchema.parse(legacyText(row.status, "memory status", 32));
		const status = originalStatus === "confirmed" && expiresAt !== void 0 ? "temporary" : originalStatus;
		const sensitivity = sensitivitySchema.parse(legacyText(row.sensitivity, "memory sensitivity", 32));
		const disabled = row.disabled_at !== null;
		const accepted = status === "confirmed" || status === "temporary";
		const convertedSources = (sources.get(legacyId) ?? []).map((source) => {
			const sessionId = legacyOptionalText(source.session_id, "memory source session id", 256) ?? context.sourceSessionId;
			const messageId = legacyOptionalText(source.message_id, "memory source message id", 256);
			const quote = messageId === null ? "" : optionalPrivateText(source.quote_enc, context.key, `memory_source:${legacyId}:${messageId}`, "memory source quote");
			return quote.length > 0 && messageId !== null ? {
				sessionId,
				messageId,
				evidenceQuote: quote
			} : { sessionId };
		});
		if (convertedSources.length === 0) convertedSources.push({ sessionId: context.sourceSessionId });
		const reason = optionalPrivateText(row.reason_enc, context.key, `memory:${legacyId}:reason`, "memory reason") || "原版记录未保存形成理由。";
		const confirmedAt = accepted ? row.confirmed_at === null ? updatedAt : Math.max(createdAt, legacyMilliseconds(row.confirmed_at, "memory confirmation time")) : void 0;
		return memoryRecord({
			recordType: "memory",
			formatVersion: 1,
			id,
			version: originalVersion(context, "memory", legacyId, updatedAt),
			status,
			kind: currentMemoryKind(legacyText(row.kind, "memory kind", 64)),
			sensitivity,
			content: privateText(row.content_enc, context.key, `memory:${legacyId}:content`, "memory content"),
			reason,
			recallPolicy: accepted && sensitivity === "normal" && !disabled ? "relevant" : "never",
			sources: convertedSources,
			proposalOrigin: "legacy-import",
			createdAt,
			updatedAt,
			...confirmedAt === void 0 ? {} : { confirmedAt },
			...status === "temporary" ? { expiresAt } : {}
		});
	});
}
function convertStarState(context) {
	const row = readLegacyRows(context.database, "star_profiles", `
    SELECT id, onboarding_stage, onboarding_completed, display_name_enc, birth_date_enc,
      birth_time_enc, birth_time_known, birth_city_enc, birth_city_known, mbti_mode,
      mbti_type_enc, mbti_answers_enc, self_words_enc, observation_intent_enc,
      observer_tone, reduced_motion, created_at, updated_at
    FROM star_profiles WHERE id = 'profile' ORDER BY id LIMIT ?
  `, 1)[0];
	if (row === void 0) return [];
	const prefix = "star_profile:profile";
	const createdAt = legacyMilliseconds(row.created_at, "star profile creation time");
	const updatedAt = legacyMilliseconds(row.updated_at, "star profile update time");
	const displayName = privateText(row.display_name_enc, context.key, `${prefix}:display_name`, "star display name", true);
	const birthDate = privateJson(row.birth_date_enc, context.key, `${prefix}:birth_date`, "star birth date", z.looseObject({
		year: z.number().int().min(1900).max(2200).optional(),
		month: z.number().int().min(1).max(12).optional(),
		day: z.number().int().min(1).max(31).optional()
	}));
	const birthTime = privateText(row.birth_time_enc, context.key, `${prefix}:birth_time`, "star birth time", true);
	const birthCity = privateText(row.birth_city_enc, context.key, `${prefix}:birth_city`, "star birth city", true);
	const rawMode = starModeSchema.parse(legacyText(row.mbti_mode, "star MBTI mode", 32));
	const rawType = privateText(row.mbti_type_enc, context.key, `${prefix}:mbti_type`, "star MBTI type", true);
	const rawAnswers = privateJson(row.mbti_answers_enc, context.key, `${prefix}:mbti_answers`, "star MBTI answers", z.array(z.string()));
	const knownMode = rawMode === "known" && /^[EI][SN][TF][JP]$/u.test(rawType);
	const sceneAnswers = z.array(sceneAnswerSchema).safeParse(rawAnswers);
	const scenesMode = rawMode === "scenes" && sceneAnswers.success && sceneAnswers.data.length === 6;
	const mbtiMode = knownMode ? "known" : scenesMode ? "scenes" : "observe";
	const selfWords = privateJson(row.self_words_enc, context.key, `${prefix}:self_words`, "star self words", stringArraySchema.max(5));
	const observationIntent = privateText(row.observation_intent_enc, context.key, `${prefix}:observation_intent`, "star observation intent", true);
	const complete = bool(row.onboarding_completed, "star ritual completion") && displayName.length > 0 && selfWords.length > 0 && observationIntent.length > 0;
	const profile = {
		onboardingStage: complete ? 3 : Math.min(2, Math.max(0, legacyInteger(row.onboarding_stage, "star onboarding stage"))),
		onboardingCompleted: complete,
		displayName,
		birthMonth: birthDate.month ?? null,
		birthDay: birthDate.day ?? null,
		birthYear: birthDate.year ?? null,
		birthTime: bool(row.birth_time_known, "star birth time knowledge") && birthTime.length > 0 ? birthTime : "",
		birthTimeKnown: bool(row.birth_time_known, "star birth time knowledge") && birthTime.length > 0,
		birthCity: bool(row.birth_city_known, "star birth city knowledge") && birthCity.length > 0 ? birthCity : "",
		birthCityKnown: bool(row.birth_city_known, "star birth city knowledge") && birthCity.length > 0,
		mbtiMode,
		mbtiType: mbtiMode === "known" ? rawType : "",
		mbtiAnswers: mbtiMode === "scenes" && sceneAnswers.success ? sceneAnswers.data : [],
		selfWords,
		observationIntent,
		observerTone: starToneSchema.parse(legacyText(row.observer_tone, "star observer tone", 32)),
		permissions: {
			dailyReflections: false,
			confirmedMemories: false,
			openQuestions: false,
			periodReviews: false
		},
		reducedMotion: bool(row.reduced_motion, "star reduced motion preference"),
		createdAt,
		updatedAt
	};
	const traits = complete ? selfWords.map((word, index) => ({
		id: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-self-word:${word}`),
		version: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-self-word-version:${word}`),
		kind: index === 0 ? "strength" : "pattern",
		status: "self-reported",
		label: word,
		description: "由原版观星礼中的自述词迁入。",
		confidence: 1,
		source: "ritual-self-report",
		createdAt,
		updatedAt
	})) : [];
	if (complete) {
		const seenLabels = new Set(selfWords);
		for (const traitRow of readLegacyRows(context.database, "star_traits", `
      SELECT id, kind, status, label_enc, description_enc, confidence, source_mode,
        created_at, updated_at
      FROM star_traits WHERE source_mode != 'ritual' ORDER BY created_at, id LIMIT ?
    `, MAX_LEGACY_RECORDS)) {
			const legacyId = legacyText(traitRow.id, "star trait id", 256);
			const label = privateText(traitRow.label_enc, context.key, `star_trait:${legacyId}:label`, "star trait label", true);
			if (label.length === 0 || seenLabels.has(label)) continue;
			seenLabels.add(label);
			const status = starStatusSchema.parse(legacyText(traitRow.status, "star trait status", 32));
			traits.push({
				id: originalId(context, "star-trait", traitRow.id),
				version: originalVersion(context, "star-trait", legacyId, legacyMilliseconds(traitRow.updated_at, "star trait update time")),
				kind: starKindSchema.parse(legacyText(traitRow.kind, "star trait kind", 32)),
				status,
				label,
				description: privateText(traitRow.description_enc, context.key, `star_trait:${legacyId}:description`, "star trait description", true),
				confidence: z.number().min(0).max(1).parse(legacyFiniteNumber(traitRow.confidence, "star trait confidence")),
				source: "star-observer",
				createdAt: legacyMilliseconds(traitRow.created_at, "star trait creation time"),
				updatedAt: legacyMilliseconds(traitRow.updated_at, "star trait update time")
			});
		}
	}
	const id = deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-state`);
	return [toBackupRecord(id, decodeStoredStarState({
		recordType: "star-state",
		formatVersion: 1,
		id,
		version: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-state-version:${String(updatedAt)}`),
		profile,
		traits,
		cards: [],
		observationRuns: [],
		dialogueRuns: []
	}))];
}
/**
* Convert supported original private records without mutating any current provider.
* @param database - Authenticated read-only original SQLite snapshot.
* @param key - Original data key retained only for this conversion.
* @param workspaceId - Original workspace identity used for deterministic record ids.
* @param createdAt - Authenticated package creation time in milliseconds.
* @param files - Authenticated original package files used for settings and Markdown projections.
* @returns Strictly decoded current vault records for a later non-overwriting merge.
*/
function convertLegacyPrivateCollections(database, key, workspaceId, createdAt, files) {
	const context = {
		database,
		key,
		workspaceId,
		sourceSessionId: `${LEGACY_SOURCE_PREFIX}:${workspaceId}`,
		timeZone: settingsTimeZone(files),
		createdAt,
		files
	};
	try {
		const journals = convertJournals(context);
		return {
			memories: convertMemories(context),
			reflections: [
				...convertCheckins(context),
				...journals.records,
				...convertConcerns(context),
				...convertContemplations(context),
				...convertNotes(context),
				...convertPrinciples(context),
				...convertExperiments(context),
				...convertOpenQuestions(context, journals.versions),
				...convertPeriodReviews(context)
			],
			stars: convertStarState(context)
		};
	} catch (error) {
		if (error instanceof MindGardenPortabilityError) throw error;
		throw invalid("private record", error);
	}
}
//#endregion
//#region lib/types/legacy.js
/** Read-only conversion of original Fun Garden migration packages. */
const LEGACY_MAGIC = Buffer.from("MGPKG1", "ascii");
const LEGACY_ITERATIONS = 2e5;
const LEGACY_SALT_BYTES = 16;
const LEGACY_NONCE_BYTES = 12;
const LEGACY_TAG_BYTES = 16;
const LEGACY_KEY_BYTES = 32;
const LEGACY_MIN_PASSPHRASE_CODE_POINTS = 8;
const LEGACY_MAX_PASSPHRASE_CODE_POINTS = 256;
const MAX_LEGACY_PHOTO_STORIES = 500;
const legacyPayloadSchema = z.object({
	v: z.literal(1),
	workspace_id: z.string().min(1).max(256),
	created_at: z.number().nonnegative(),
	data_key: z.string().min(1),
	files: z.record(z.string(), z.string())
}).strict();
function canonicalBase64(value, label, expectedBytes) {
	const bytes = Buffer.from(value, "base64");
	if (bytes.length === 0 || bytes.toString("base64") !== value || expectedBytes !== void 0 && bytes.length !== expectedBytes) {
		bytes.fill(0);
		throw new MindGardenPortabilityError("invalid-backup", `Original Mind Garden package has invalid ${label}`);
	}
	return bytes;
}
function assertLegacyPassphrase(passphrase) {
	const codePoints = Array.from(passphrase).length;
	if (codePoints < LEGACY_MIN_PASSPHRASE_CODE_POINTS || codePoints > LEGACY_MAX_PASSPHRASE_CODE_POINTS || passphrase.trim().length === 0) throw new MindGardenPortabilityError("invalid-passphrase", `Original Mind Garden passphrase must contain ${LEGACY_MIN_PASSPHRASE_CODE_POINTS}-${LEGACY_MAX_PASSPHRASE_CODE_POINTS} characters`);
}
function decryptLegacyPackage(data, passphrase, maxPlaintextBytes) {
	assertLegacyPassphrase(passphrase);
	const bytes = Buffer.from(data);
	const minimumBytes = LEGACY_MAGIC.length + LEGACY_SALT_BYTES + LEGACY_NONCE_BYTES + LEGACY_TAG_BYTES + 1;
	if (bytes.length < minimumBytes || !bytes.subarray(0, LEGACY_MAGIC.length).equals(LEGACY_MAGIC)) {
		bytes.fill(0);
		throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden package header is invalid");
	}
	const salt = Buffer.from(bytes.subarray(LEGACY_MAGIC.length, LEGACY_MAGIC.length + LEGACY_SALT_BYTES));
	const nonceStart = LEGACY_MAGIC.length + LEGACY_SALT_BYTES;
	const nonce = Buffer.from(bytes.subarray(nonceStart, nonceStart + LEGACY_NONCE_BYTES));
	const encrypted = Buffer.from(bytes.subarray(nonceStart + LEGACY_NONCE_BYTES));
	let key;
	let plaintext;
	try {
		key = pbkdf2Sync(passphrase, salt, LEGACY_ITERATIONS, LEGACY_KEY_BYTES, "sha256");
		const decipher = createDecipheriv("aes-256-gcm", key, nonce);
		decipher.setAAD(LEGACY_MAGIC);
		decipher.setAuthTag(encrypted.subarray(encrypted.length - LEGACY_TAG_BYTES));
		plaintext = Buffer.concat([decipher.update(encrypted.subarray(0, encrypted.length - LEGACY_TAG_BYTES)), decipher.final()]);
		if (plaintext.length > maxPlaintextBytes) throw new MindGardenPortabilityError("backup-too-large", "Original Mind Garden payload exceeds the configured plaintext bound");
		return legacyPayloadSchema.parse(JSON.parse(plaintext.toString("utf8")));
	} catch (error) {
		if (error instanceof MindGardenPortabilityError) throw error;
		throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden package could not be authenticated", { cause: error });
	} finally {
		bytes.fill(0);
		salt.fill(0);
		nonce.fill(0);
		encrypted.fill(0);
		key?.fill(0);
		plaintext?.fill(0);
	}
}
function mediaType(value) {
	const type = legacyText(value, "photo media type", 64);
	if (type !== "image/png" && type !== "image/jpeg" && type !== "image/webp" && type !== "image/gif") throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden photo media type is unsupported");
	return type;
}
function quickCheck(database) {
	const result = database.prepare("PRAGMA quick_check").get();
	if (result === void 0 || result.quick_check !== "ok") throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden database failed its integrity check");
}
function readLegacyPhotoRows(database) {
	const rows = database.prepare(`
    SELECT id, media_type, width, height, image_enc, particle_config_enc,
      local_date, timezone, utc_offset_minutes, created_at, updated_at
    FROM photo_stories
    ORDER BY created_at, id
    LIMIT ?
  `).all(501);
	if (rows.length > MAX_LEGACY_PHOTO_STORIES) throw new MindGardenPortabilityError("backup-too-large", "Original Mind Garden package contains too many photo stories");
	return rows;
}
async function convertLegacyProfile(databaseBytes, dataKey, workspaceId, createdAt, files) {
	const temporaryRoot = await mkdtemp(join(tmpdir(), "dsh-mind-garden-legacy-"));
	const databasePath = join(temporaryRoot, "mind_garden.db");
	let database;
	try {
		await writeFile(databasePath, databaseBytes, {
			mode: 384,
			flag: "wx"
		});
		const { DatabaseSync } = await import("node:sqlite");
		database = new DatabaseSync(databasePath, { readOnly: true });
		quickCheck(database);
		const privateCollections = convertLegacyPrivateCollections(database, dataKey, workspaceId, createdAt, files);
		const media = [];
		const attachments = /* @__PURE__ */ new Map();
		for (const row of readLegacyPhotoRows(database)) {
			const legacyId = legacyText(row.id, "photo id", 128);
			const image = decryptLegacyField(legacyBlob(row.image_enc, "photo image"), dataKey, `photo_story:${legacyId}:image`);
			const configBytes = decryptLegacyField(legacyBlob(row.particle_config_enc, "photo particle configuration"), dataKey, `photo_story:${legacyId}:particle_config`);
			try {
				const id = deterministicLegacyUuid(`fun-garden-v1:${workspaceId}:photo:${legacyId}`);
				const updatedAt = legacyMilliseconds(row.updated_at, "photo updated time");
				const createdPhotoAt = legacyMilliseconds(row.created_at, "photo created time");
				const type = mediaType(row.media_type);
				const attachment = {
					attachmentId: AttachmentId(`sha256:${createHash("sha256").update(image).digest("hex")}`),
					mediaType: type,
					bytes: image.length,
					width: legacyPositiveInteger(row.width, "photo width"),
					height: legacyPositiveInteger(row.height, "photo height")
				};
				const record = decodeStoredMediaRecord({
					recordType: "photo-story",
					formatVersion: 1,
					id,
					version: deterministicLegacyUuid(`fun-garden-v1:${workspaceId}:photo-version:${legacyId}:${String(updatedAt)}`),
					attachment,
					title: `Photo · ${legacyText(row.local_date, "photo local date", 32)}`,
					note: "",
					stamp: {
						localDate: row.local_date,
						timeZone: legacyText(row.timezone, "photo time zone", 128),
						utcOffsetMinutes: legacyInteger(row.utc_offset_minutes, "photo UTC offset")
					},
					particleConfig: JSON.parse(configBytes.toString("utf8")),
					observation: null,
					turns: [],
					quickReplies: [],
					modelRuns: [],
					createdAt: createdPhotoAt,
					updatedAt
				});
				const existing = attachments.get(attachment.attachmentId);
				if (existing !== void 0 && (existing.ref.mediaType !== attachment.mediaType || existing.ref.width !== attachment.width || existing.ref.height !== attachment.height)) throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden repeats photo bytes with conflicting metadata");
				attachments.set(attachment.attachmentId, {
					ref: attachment,
					data: image.toString("base64")
				});
				media.push({
					id,
					value: JSON.parse(JSON.stringify(record))
				});
			} catch (error) {
				if (error instanceof MindGardenPortabilityError) throw error;
				throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden photo record is unsupported", { cause: error });
			} finally {
				image.fill(0);
				configBytes.fill(0);
			}
		}
		return {
			format: "deepseek-harness.mind-garden.profile",
			version: 1,
			createdAt,
			vaultCreatedAt: createdAt,
			collections: {
				...privateCollections,
				media
			},
			attachments: [...attachments.values()]
		};
	} finally {
		database?.close();
		databaseBytes.fill(0);
		dataKey.fill(0);
		await rm(temporaryRoot, {
			recursive: true,
			force: true
		});
	}
}
/**
* Check whether untrusted bytes carry the original Fun Garden binary marker.
* @param data - Encrypted package bytes before any format-specific decoding.
* @returns Whether the package begins with the exact original marker.
*/
function isLegacyMindGardenPackage(data) {
	return data.byteLength >= LEGACY_MAGIC.length && Buffer.from(data).subarray(0, LEGACY_MAGIC.length).equals(LEGACY_MAGIC);
}
/**
* Authenticate one original package and convert supported private records without mutating a provider.
* @param data - Original binary `.mgarden` package bytes.
* @param passphrase - User-held original migration passphrase.
* @param maxPlaintextBytes - Bound for decrypted JSON transport and embedded database bytes.
* @returns Current private records and attachments with explicit legacy scope metadata.
*/
async function loadLegacyMindGardenBackup(data, passphrase, maxPlaintextBytes) {
	const legacy = decryptLegacyPackage(data, passphrase, maxPlaintextBytes);
	const database = canonicalBase64(legacy.files["mind_garden.db"] ?? "", "database");
	let dataKey;
	try {
		dataKey = canonicalBase64(legacy.data_key, "data key", LEGACY_KEY_BYTES);
		if (database.length > maxPlaintextBytes || !database.subarray(0, 16).equals(Buffer.from("SQLite format 3\0", "ascii"))) throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden database is invalid");
		const createdAt = Math.round(legacy.created_at * 1e3);
		if (!Number.isSafeInteger(createdAt)) throw new MindGardenPortabilityError("invalid-backup", "Original Mind Garden creation time is invalid");
		return {
			payload: await convertLegacyProfile(database, dataKey, legacy.workspace_id, createdAt, legacy.files),
			sourceFormat: "fun-garden-v1",
			scope: "legacy-private-profile"
		};
	} catch (error) {
		database.fill(0);
		dataKey?.fill(0);
		throw error;
	}
}
//#endregion
//#region lib/types/index.js
/** Passphrase-encrypted profile backup and migration service for Mind Garden. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
const DEFAULT_MAX_PLAINTEXT_BYTES = 128 * 1024 * 1024;
const DEFAULT_MAX_PACKAGE_BYTES = 160 * 1024 * 1024;
const BACKUP_MEDIA_TYPE = "application/vnd.deepseek-harness.mind-garden-backup";
function positiveSafeInteger(value) {
	if (!Number.isSafeInteger(value) || value < 1) throw new TypeError("mind-garden-portability: maxPlaintextBytes must be a positive safe integer");
	return value;
}
function rejected(code) {
	return {
		ok: false,
		error: { code }
	};
}
function rotationRejected(code) {
	return {
		ok: false,
		error: { code }
	};
}
function restoreRejected(code) {
	return {
		ok: false,
		error: { code }
	};
}
function restoreCommitRejected(code) {
	return {
		ok: false,
		error: { code }
	};
}
function backupFilename(createdAt) {
	return `mind-garden-${new Date(createdAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}.mgarden`;
}
function decodeTransportPackage(data, maxPackageBytes) {
	const maxBase64Length = Math.ceil(maxPackageBytes / 3) * 4;
	if (data.length === 0) throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup transport is empty");
	if (data.length > maxBase64Length) throw new MindGardenPortabilityError("backup-too-large", "Mind Garden backup package exceeds the configured transport bound");
	const bytes = Buffer.from(data, "base64");
	if (bytes.length > maxPackageBytes) {
		bytes.fill(0);
		throw new MindGardenPortabilityError("backup-too-large", "Mind Garden backup package exceeds the configured transport bound");
	}
	if (bytes.toString("base64") !== data) {
		bytes.fill(0);
		throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup transport is not canonical base64");
	}
	return bytes;
}
function decodeAttachmentData(value) {
	const bytes = Buffer.from(value, "base64");
	if (bytes.length === 0 || bytes.toString("base64") !== value) {
		bytes.fill(0);
		throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup attachment is not canonical base64");
	}
	return bytes;
}
function sameImageRef(left, right) {
	return left.attachmentId === right.attachmentId && left.mediaType === right.mediaType && left.bytes === right.bytes && left.width === right.width && left.height === right.height && left.name === right.name;
}
function recordCounts(payload) {
	return {
		memories: payload.collections.memories.length,
		reflections: payload.collections.reflections.length,
		media: payload.collections.media.length,
		stars: payload.collections.stars.length,
		attachments: payload.attachments.length
	};
}
function mergeCandidates(payload) {
	return {
		memories: payload.collections.memories.map((record) => MindGardenVaultRecordId(record.id)),
		reflections: payload.collections.reflections.map((record) => MindGardenVaultRecordId(record.id)),
		media: payload.collections.media.map((record) => MindGardenVaultRecordId(record.id)),
		stars: payload.collections.stars.map((record) => MindGardenVaultRecordId(record.id))
	};
}
function vaultCollections(payload) {
	return {
		memories: payload.collections.memories.map((record) => ({
			...record,
			id: MindGardenVaultRecordId(record.id)
		})),
		reflections: payload.collections.reflections.map((record) => ({
			...record,
			id: MindGardenVaultRecordId(record.id)
		})),
		media: payload.collections.media.map((record) => ({
			...record,
			id: MindGardenVaultRecordId(record.id)
		})),
		stars: payload.collections.stars.map((record) => ({
			...record,
			id: MindGardenVaultRecordId(record.id)
		}))
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
			_exportBackup_decorators = [Remote("exportBackup")];
			_inspectBackup_decorators = [Remote("inspectBackup")];
			_restoreBackup_decorators = [Remote("restoreBackup")];
			_rotateDataKey_decorators = [Remote("rotateDataKey")];
			__esDecorate(this, null, _exportBackup_decorators, {
				kind: "method",
				name: "exportBackup",
				static: false,
				private: false,
				access: {
					has: (obj) => "exportBackup" in obj,
					get: (obj) => obj.exportBackup
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _inspectBackup_decorators, {
				kind: "method",
				name: "inspectBackup",
				static: false,
				private: false,
				access: {
					has: (obj) => "inspectBackup" in obj,
					get: (obj) => obj.inspectBackup
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _restoreBackup_decorators, {
				kind: "method",
				name: "restoreBackup",
				static: false,
				private: false,
				access: {
					has: (obj) => "restoreBackup" in obj,
					get: (obj) => obj.restoreBackup
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _rotateDataKey_decorators, {
				kind: "method",
				name: "rotateDataKey",
				static: false,
				private: false,
				access: {
					has: (obj) => "rotateDataKey" in obj,
					get: (obj) => obj.rotateDataKey
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [
			"agents",
			"attachments",
			"mindGarden",
			"mindGardenVault"
		];
		/** Loader validation for the bounded in-memory export pipeline. */
		static Config = s.object({
			maxPlaintextBytes: s.number().default(DEFAULT_MAX_PLAINTEXT_BYTES),
			maxPackageBytes: s.number().default(DEFAULT_MAX_PACKAGE_BYTES)
		});
		maxPlaintextBytes = __runInitializers(this, _instanceExtraInitializers);
		maxPackageBytes;
		constructor(ctx, config) {
			super(ctx, "mindGardenPortability");
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
			const data = await encryptMindGardenBackup({
				format: "deepseek-harness.mind-garden.profile",
				version: 1,
				createdAt,
				vaultCreatedAt: snapshot.vaultCreatedAt,
				collections: snapshot.collections,
				attachments
			}, passphrase, this.maxPlaintextBytes);
			const records = {
				memories: snapshot.collections.memories.length,
				reflections: snapshot.collections.reflections.length,
				media: snapshot.collections.media.length,
				stars: snapshot.collections.stars.length,
				attachments: attachments.length
			};
			try {
				return {
					formatVersion: 1,
					filename: backupFilename(createdAt),
					mediaType: BACKUP_MEDIA_TYPE,
					data: data.toString("base64"),
					bytes: data.length,
					createdAt,
					records
				};
			} finally {
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
			if (this.ctx.agents.get(agent.id) !== agent) return rejected("agent-not-live");
			const state = this.ctx.mindGarden.current(agent.session);
			if (state === null) return rejected("mind-garden-not-active");
			if (state.privacy !== "durable") return rejected("durable-session-required");
			try {
				return {
					ok: true,
					value: await this.createBackup(request.passphrase)
				};
			} catch (error) {
				if (error instanceof MindGardenPortabilityError) return rejected(error.code === "invalid-backup" ? "backup-failed" : error.code);
				if (error instanceof MindGardenVaultError) return rejected("vault-unavailable");
				if (error instanceof AttachmentError) return rejected("attachment-unavailable");
				return rejected("backup-failed");
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
			if (denied !== void 0) return restoreRejected(denied);
			try {
				const loaded = await this.loadBackup(request);
				const plan = await this.ctx.mindGardenVault.previewMissing(mergeCandidates(loaded.payload));
				return {
					ok: true,
					value: {
						formatVersion: 1,
						sourceFormat: loaded.sourceFormat,
						scope: loaded.scope,
						archiveCreatedAt: loaded.payload.createdAt,
						bytes: loaded.bytes,
						records: recordCounts(loaded.payload),
						willAdd: plan.added,
						willKeep: plan.kept
					}
				};
			} catch (error) {
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
			if (denied !== void 0) return restoreCommitRejected(denied);
			if (!request.confirm) return restoreCommitRejected("confirmation-required");
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
						attachments: loaded.payload.attachments.length
					}
				};
			} catch (error) {
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
			if (this.ctx.agents.get(agent.id) !== agent) return rotationRejected("agent-not-live");
			const state = this.ctx.mindGarden.current(agent.session);
			if (state === null) return rotationRejected("mind-garden-not-active");
			if (state.privacy !== "durable") return rotationRejected("durable-session-required");
			if (!request.confirm) return rotationRejected("confirmation-required");
			try {
				return {
					ok: true,
					value: await this.ctx.mindGardenVault.rotateDataKey()
				};
			} catch (error) {
				if (error instanceof MindGardenVaultError) return rotationRejected(error.code === "rotation-unavailable" ? "rotation-unavailable" : "vault-unavailable");
				return rotationRejected("rotation-failed");
			}
		}
		async readAttachments(media) {
			const references = /* @__PURE__ */ new Map();
			for (const record of media) {
				const story = decodeStoredMediaRecord(record.value);
				references.set(story.attachment.attachmentId, story.attachment);
			}
			const attachments = [];
			for (const ref of [...references.values()].sort((a, b) => a.attachmentId.localeCompare(b.attachmentId))) {
				const stored = await this.ctx.attachments.readImage(ref);
				attachments.push({
					ref: stored.ref,
					data: Buffer.from(stored.data).toString("base64")
				});
			}
			return attachments;
		}
		restoreAuthority(agent) {
			if (this.ctx.agents.get(agent.id) !== agent) return "agent-not-live";
			const state = this.ctx.mindGarden.current(agent.session);
			if (state === null) return "mind-garden-not-active";
			if (state.privacy !== "durable") return "durable-session-required";
		}
		async loadBackup(request) {
			const data = decodeTransportPackage(request.data, this.maxPackageBytes);
			try {
				if (isLegacyMindGardenPackage(data)) {
					const legacy = await loadLegacyMindGardenBackup(data, request.passphrase, this.maxPlaintextBytes);
					await this.validateBackupPayload(legacy.payload);
					return {
						...legacy,
						bytes: data.length
					};
				}
				const payload = await decryptMindGardenBackup(data, request.passphrase, this.maxPlaintextBytes);
				await this.validateBackupPayload(payload);
				return {
					payload,
					bytes: data.length,
					sourceFormat: "deepseek-harness-v1",
					scope: "full-profile"
				};
			} finally {
				data.fill(0);
			}
		}
		async validateBackupPayload(payload) {
			try {
				for (const record of payload.collections.memories) if (decodeStoredRecord(record.value).id !== record.id) throw new TypeError("Mind Garden backup memory id differs from its record id");
				for (const record of payload.collections.reflections) if (decodeStoredReflection(record.value).id !== record.id) throw new TypeError("Mind Garden backup reflection id differs from its record id");
				for (const record of payload.collections.stars) if (decodeStoredStarState(record.value).id !== record.id) throw new TypeError("Mind Garden backup Star Map id differs from its record id");
				const attachments = /* @__PURE__ */ new Map();
				for (const attachment of payload.attachments) {
					if (attachments.has(attachment.ref.attachmentId)) throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup repeats one attachment");
					const data = decodeAttachmentData(attachment.data);
					try {
						const digest = `sha256:${createHash("sha256").update(data).digest("hex")}`;
						if (attachment.ref.attachmentId !== digest || attachment.ref.bytes !== data.length) throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup attachment reference does not match its bytes");
						await this.ctx.attachments.validateImage({
							data,
							mediaType: attachment.ref.mediaType,
							...attachment.ref.name === void 0 ? {} : { name: attachment.ref.name }
						});
					} finally {
						data.fill(0);
					}
					attachments.set(attachment.ref.attachmentId, attachment);
				}
				const referenced = /* @__PURE__ */ new Set();
				for (const record of payload.collections.media) {
					const story = decodeStoredMediaRecord(record.value);
					if (story.id !== record.id) throw new TypeError("Mind Garden backup media id differs from its record id");
					const attachment = attachments.get(story.attachment.attachmentId);
					if (attachment === void 0 || !sameImageRef(attachment.ref, story.attachment)) throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup photo record has no matching attachment");
					referenced.add(attachment.ref.attachmentId);
				}
				if (referenced.size !== attachments.size) throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup contains an unreferenced attachment");
			} catch (error) {
				if (error instanceof MindGardenPortabilityError || error instanceof AttachmentError) throw error;
				throw new MindGardenPortabilityError("invalid-backup", "Mind Garden backup contains an unsupported private record", { cause: error });
			}
		}
		async restoreAttachments(payload) {
			for (const attachment of payload.attachments) {
				const data = decodeAttachmentData(attachment.data);
				try {
					if (!sameImageRef(await this.ctx.attachments.saveImage({
						data,
						mediaType: attachment.ref.mediaType,
						...attachment.ref.name === void 0 ? {} : { name: attachment.ref.name }
					}), attachment.ref)) throw new MindGardenPortabilityError("invalid-backup", "Mind Garden restored attachment metadata does not match its archive");
				} finally {
					data.fill(0);
				}
			}
		}
		restoreErrorCode(error) {
			if (error instanceof MindGardenPortabilityError) return error.code;
			if (error instanceof AttachmentError) return "attachment-unavailable";
			if (error instanceof MindGardenVaultError) return error.code === "invalid-record-id" || error.code === "invalid-value" || error.code === "record-too-large" ? "invalid-backup" : "vault-unavailable";
			return "restore-failed";
		}
	};
})();
//#endregion
export { MindGardenPortabilityError, MindGardenPortabilityService, MindGardenPortabilityService as default, assertMindGardenBackupPassphrase, decryptMindGardenBackup, encryptMindGardenBackup };
