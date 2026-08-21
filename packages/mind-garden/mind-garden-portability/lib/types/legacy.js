/** Read-only conversion of original Fun Garden migration packages. */
import { Buffer } from 'node:buffer';
import { createDecipheriv, createHash, pbkdf2Sync } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AttachmentId } from '@deepseek-ai/dsh-attachment';
import { decodeStoredMediaRecord } from '@deepseek-ai/dsh-mind-garden/media';
import { z } from 'zod';
import { MindGardenPortabilityError, } from "./backup.js";
import { decryptLegacyField, deterministicLegacyUuid, legacyBlob, legacyInteger, legacyMilliseconds, legacyPositiveInteger, legacyText, } from "./legacy-values.js";
import { convertLegacyPrivateCollections } from "./legacy-private.js";
const LEGACY_MAGIC = Buffer.from('MGPKG1', 'ascii');
const LEGACY_ITERATIONS = 200_000;
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
    files: z.record(z.string(), z.string()),
}).strict();
function canonicalBase64(value, label, expectedBytes) {
    const bytes = Buffer.from(value, 'base64');
    if (bytes.length === 0
        || bytes.toString('base64') !== value
        || (expectedBytes !== undefined && bytes.length !== expectedBytes)) {
        bytes.fill(0);
        throw new MindGardenPortabilityError('invalid-backup', `Original Mind Garden package has invalid ${label}`);
    }
    return bytes;
}
function assertLegacyPassphrase(passphrase) {
    const codePoints = Array.from(passphrase).length;
    if (codePoints < LEGACY_MIN_PASSPHRASE_CODE_POINTS
        || codePoints > LEGACY_MAX_PASSPHRASE_CODE_POINTS
        || passphrase.trim().length === 0) {
        throw new MindGardenPortabilityError('invalid-passphrase', `Original Mind Garden passphrase must contain ${LEGACY_MIN_PASSPHRASE_CODE_POINTS}-${LEGACY_MAX_PASSPHRASE_CODE_POINTS} characters`);
    }
}
function decryptLegacyPackage(data, passphrase, maxPlaintextBytes) {
    assertLegacyPassphrase(passphrase);
    const bytes = Buffer.from(data);
    const minimumBytes = LEGACY_MAGIC.length + LEGACY_SALT_BYTES + LEGACY_NONCE_BYTES + LEGACY_TAG_BYTES + 1;
    if (bytes.length < minimumBytes || !bytes.subarray(0, LEGACY_MAGIC.length).equals(LEGACY_MAGIC)) {
        bytes.fill(0);
        throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden package header is invalid');
    }
    const salt = Buffer.from(bytes.subarray(LEGACY_MAGIC.length, LEGACY_MAGIC.length + LEGACY_SALT_BYTES));
    const nonceStart = LEGACY_MAGIC.length + LEGACY_SALT_BYTES;
    const nonce = Buffer.from(bytes.subarray(nonceStart, nonceStart + LEGACY_NONCE_BYTES));
    const encrypted = Buffer.from(bytes.subarray(nonceStart + LEGACY_NONCE_BYTES));
    let key;
    let plaintext;
    try {
        key = pbkdf2Sync(passphrase, salt, LEGACY_ITERATIONS, LEGACY_KEY_BYTES, 'sha256');
        const decipher = createDecipheriv('aes-256-gcm', key, nonce);
        decipher.setAAD(LEGACY_MAGIC);
        decipher.setAuthTag(encrypted.subarray(encrypted.length - LEGACY_TAG_BYTES));
        plaintext = Buffer.concat([
            decipher.update(encrypted.subarray(0, encrypted.length - LEGACY_TAG_BYTES)),
            decipher.final(),
        ]);
        if (plaintext.length > maxPlaintextBytes) {
            throw new MindGardenPortabilityError('backup-too-large', 'Original Mind Garden payload exceeds the configured plaintext bound');
        }
        return legacyPayloadSchema.parse(JSON.parse(plaintext.toString('utf8')));
    }
    catch (error) {
        if (error instanceof MindGardenPortabilityError)
            throw error;
        throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden package could not be authenticated', { cause: error });
    }
    finally {
        bytes.fill(0);
        salt.fill(0);
        nonce.fill(0);
        encrypted.fill(0);
        key?.fill(0);
        plaintext?.fill(0);
    }
}
function mediaType(value) {
    const type = legacyText(value, 'photo media type', 64);
    if (type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/webp' && type !== 'image/gif') {
        throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden photo media type is unsupported');
    }
    return type;
}
function quickCheck(database) {
    const result = database.prepare('PRAGMA quick_check').get();
    if (result === undefined || result.quick_check !== 'ok') {
        throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden database failed its integrity check');
    }
}
function readLegacyPhotoRows(database) {
    const rows = database.prepare(`
    SELECT id, media_type, width, height, image_enc, particle_config_enc,
      local_date, timezone, utc_offset_minutes, created_at, updated_at
    FROM photo_stories
    ORDER BY created_at, id
    LIMIT ?
  `).all(MAX_LEGACY_PHOTO_STORIES + 1);
    if (rows.length > MAX_LEGACY_PHOTO_STORIES) {
        throw new MindGardenPortabilityError('backup-too-large', 'Original Mind Garden package contains too many photo stories');
    }
    return rows;
}
async function convertLegacyProfile(databaseBytes, dataKey, workspaceId, createdAt, files) {
    const temporaryRoot = await mkdtemp(join(tmpdir(), 'dsh-mind-garden-legacy-'));
    const databasePath = join(temporaryRoot, 'mind_garden.db');
    let database;
    try {
        await writeFile(databasePath, databaseBytes, { mode: 0o600, flag: 'wx' });
        const { DatabaseSync } = await import('node:sqlite');
        database = new DatabaseSync(databasePath, { readOnly: true });
        quickCheck(database);
        const privateCollections = convertLegacyPrivateCollections(database, dataKey, workspaceId, createdAt, files);
        const media = [];
        const attachments = new Map();
        for (const row of readLegacyPhotoRows(database)) {
            const legacyId = legacyText(row.id, 'photo id', 128);
            const image = decryptLegacyField(legacyBlob(row.image_enc, 'photo image'), dataKey, `photo_story:${legacyId}:image`);
            const configBytes = decryptLegacyField(legacyBlob(row.particle_config_enc, 'photo particle configuration'), dataKey, `photo_story:${legacyId}:particle_config`);
            try {
                const id = deterministicLegacyUuid(`fun-garden-v1:${workspaceId}:photo:${legacyId}`);
                const updatedAt = legacyMilliseconds(row.updated_at, 'photo updated time');
                const createdPhotoAt = legacyMilliseconds(row.created_at, 'photo created time');
                const type = mediaType(row.media_type);
                const attachment = {
                    attachmentId: AttachmentId(`sha256:${createHash('sha256').update(image).digest('hex')}`),
                    mediaType: type,
                    bytes: image.length,
                    width: legacyPositiveInteger(row.width, 'photo width'),
                    height: legacyPositiveInteger(row.height, 'photo height'),
                };
                const record = decodeStoredMediaRecord({
                    recordType: 'photo-story',
                    formatVersion: 1,
                    id,
                    version: deterministicLegacyUuid(`fun-garden-v1:${workspaceId}:photo-version:${legacyId}:${String(updatedAt)}`),
                    attachment,
                    title: `Photo · ${legacyText(row.local_date, 'photo local date', 32)}`,
                    note: '',
                    stamp: {
                        localDate: row.local_date,
                        timeZone: legacyText(row.timezone, 'photo time zone', 128),
                        utcOffsetMinutes: legacyInteger(row.utc_offset_minutes, 'photo UTC offset'),
                    },
                    particleConfig: JSON.parse(configBytes.toString('utf8')),
                    observation: null,
                    turns: [],
                    quickReplies: [],
                    modelRuns: [],
                    createdAt: createdPhotoAt,
                    updatedAt,
                });
                const existing = attachments.get(attachment.attachmentId);
                if (existing !== undefined
                    && (existing.ref.mediaType !== attachment.mediaType
                        || existing.ref.width !== attachment.width
                        || existing.ref.height !== attachment.height)) {
                    throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden repeats photo bytes with conflicting metadata');
                }
                attachments.set(attachment.attachmentId, {
                    ref: attachment,
                    data: image.toString('base64'),
                });
                media.push({ id, value: JSON.parse(JSON.stringify(record)) });
            }
            catch (error) {
                if (error instanceof MindGardenPortabilityError)
                    throw error;
                throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden photo record is unsupported', { cause: error });
            }
            finally {
                image.fill(0);
                configBytes.fill(0);
            }
        }
        return {
            format: 'deepseek-harness.mind-garden.profile',
            version: 1,
            createdAt,
            vaultCreatedAt: createdAt,
            collections: { ...privateCollections, media },
            attachments: [...attachments.values()],
        };
    }
    finally {
        database?.close();
        databaseBytes.fill(0);
        dataKey.fill(0);
        await rm(temporaryRoot, { recursive: true, force: true });
    }
}
/**
 * Check whether untrusted bytes carry the original Fun Garden binary marker.
 * @param data - Encrypted package bytes before any format-specific decoding.
 * @returns Whether the package begins with the exact original marker.
 */
export function isLegacyMindGardenPackage(data) {
    return data.byteLength >= LEGACY_MAGIC.length
        && Buffer.from(data).subarray(0, LEGACY_MAGIC.length).equals(LEGACY_MAGIC);
}
/**
 * Authenticate one original package and convert supported private records without mutating a provider.
 * @param data - Original binary `.mgarden` package bytes.
 * @param passphrase - User-held original migration passphrase.
 * @param maxPlaintextBytes - Bound for decrypted JSON transport and embedded database bytes.
 * @returns Current private records and attachments with explicit legacy scope metadata.
 */
export async function loadLegacyMindGardenBackup(data, passphrase, maxPlaintextBytes) {
    const legacy = decryptLegacyPackage(data, passphrase, maxPlaintextBytes);
    const database = canonicalBase64(legacy.files['mind_garden.db'] ?? '', 'database');
    let dataKey;
    try {
        dataKey = canonicalBase64(legacy.data_key, 'data key', LEGACY_KEY_BYTES);
        if (database.length > maxPlaintextBytes || !database.subarray(0, 16).equals(Buffer.from('SQLite format 3\0', 'ascii'))) {
            throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden database is invalid');
        }
        const createdAt = Math.round(legacy.created_at * 1_000);
        if (!Number.isSafeInteger(createdAt)) {
            throw new MindGardenPortabilityError('invalid-backup', 'Original Mind Garden creation time is invalid');
        }
        return {
            payload: await convertLegacyProfile(database, dataKey, legacy.workspace_id, createdAt, legacy.files),
            sourceFormat: 'fun-garden-v1',
            scope: 'legacy-private-profile',
        };
    }
    catch (error) {
        database.fill(0);
        dataKey?.fill(0);
        throw error;
    }
}
//# sourceMappingURL=legacy.js.map