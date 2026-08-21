/** Versioned passphrase encryption for portable Mind Garden profile snapshots. */
import { Buffer } from 'node:buffer';
import { createCipheriv, createDecipheriv, randomBytes, scrypt, } from 'node:crypto';
import { gzip, gunzip } from 'node:zlib';
import { AttachmentId } from '@deepseek-ai/dsh-attachment';
import { z } from 'zod';
const BACKUP_MAGIC = 'DSHMG01';
const BACKUP_FORMAT = 'deepseek-harness.mind-garden.profile';
const PAYLOAD_VERSION = 1;
const SCRYPT_COST = 65_536;
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
export class MindGardenPortabilityError extends Error {
    code;
    name = 'MindGardenPortabilityError';
    constructor(code, message, options) {
        super(message, options);
        this.code = code;
    }
}
const attachmentRefSchema = z.object({
    attachmentId: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    mediaType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
    bytes: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    name: z.string().min(1).optional(),
}).strict();
const payloadSchema = z.object({
    format: z.literal(BACKUP_FORMAT),
    version: z.literal(PAYLOAD_VERSION),
    createdAt: z.number().int().nonnegative(),
    vaultCreatedAt: z.number().int().nonnegative(),
    collections: z.object({
        memories: z.array(z.object({ id: z.string().min(1), value: z.json() }).strict()),
        reflections: z.array(z.object({ id: z.string().min(1), value: z.json() }).strict()),
        media: z.array(z.object({ id: z.string().min(1), value: z.json() }).strict()),
        stars: z.array(z.object({ id: z.string().min(1), value: z.json() }).strict()),
    }).strict(),
    attachments: z.array(z.object({
        ref: attachmentRefSchema,
        data: z.string().min(1),
    }).strict()),
}).strict();
const packageSchema = z.object({
    magic: z.literal(BACKUP_MAGIC),
    version: z.literal(PAYLOAD_VERSION),
    kdf: z.object({
        name: z.literal('scrypt'),
        salt: z.string(),
        cost: z.literal(SCRYPT_COST),
        blockSize: z.literal(SCRYPT_BLOCK_SIZE),
        parallelization: z.literal(SCRYPT_PARALLELIZATION),
        keyBytes: z.literal(KEY_BYTES),
    }).strict(),
    cipher: z.object({
        name: z.literal('A256GCM'),
        nonce: z.string(),
    }).strict(),
    compression: z.literal('gzip'),
    ciphertext: z.string(),
}).strict();
/**
 * Require a memorable multi-word passphrase rather than an eight-character legacy password.
 *
 * @param passphrase User-held secret used to derive the archive encryption key.
 */
export function assertMindGardenBackupPassphrase(passphrase) {
    const codePoints = Array.from(passphrase).length;
    if (codePoints < MIN_PASSPHRASE_CODE_POINTS
        || codePoints > MAX_PASSPHRASE_CODE_POINTS
        || passphrase.trim().length === 0) {
        throw new MindGardenPortabilityError('invalid-passphrase', `Mind Garden backup passphrase must contain ${MIN_PASSPHRASE_CODE_POINTS}-${MAX_PASSPHRASE_CODE_POINTS} characters`);
    }
}
function deriveKey(passphrase, salt) {
    return new Promise((resolve, reject) => {
        scrypt(passphrase, salt, KEY_BYTES, {
            N: SCRYPT_COST,
            r: SCRYPT_BLOCK_SIZE,
            p: SCRYPT_PARALLELIZATION,
            maxmem: SCRYPT_MAX_MEMORY,
        }, (error, key) => {
            if (error === null)
                resolve(key);
            else
                reject(error);
        });
    });
}
function gzipBuffer(input) {
    return new Promise((resolve, reject) => {
        gzip(input, { level: 6 }, (error, result) => {
            if (error === null)
                resolve(result);
            else
                reject(error);
        });
    });
}
function gunzipBuffer(input, maxOutputLength) {
    return new Promise((resolve, reject) => {
        gunzip(input, { maxOutputLength }, (error, result) => {
            if (error === null)
                resolve(result);
            else
                reject(error);
        });
    });
}
function decodeCanonicalBase64(value, label, length) {
    const decoded = Buffer.from(value, 'base64');
    if (decoded.toString('base64') !== value || (length !== undefined && decoded.length !== length)) {
        decoded.fill(0);
        throw new MindGardenPortabilityError('invalid-backup', `Mind Garden backup has invalid ${label}`);
    }
    return decoded;
}
function metadataOf(value) {
    return {
        magic: value.magic,
        version: value.version,
        kdf: value.kdf,
        cipher: value.cipher,
        compression: value.compression,
    };
}
function additionalData(metadata) {
    return Buffer.from(JSON.stringify(metadata), 'utf8');
}
/**
 * Compress and passphrase-encrypt one complete logical profile snapshot.
 * @param payload - Detached vault records and verified image bytes.
 * @param passphrase - User-held recovery secret; it is never stored in the package.
 * @param maxPlaintextBytes - Upper bound before compression and Remote encoding.
 * @returns UTF-8 JSON package bytes containing only KDF metadata and ciphertext.
 */
export async function encryptMindGardenBackup(payload, passphrase, maxPlaintextBytes) {
    assertMindGardenBackupPassphrase(passphrase);
    const plaintext = Buffer.from(JSON.stringify(payloadSchema.parse(payload)), 'utf8');
    if (plaintext.length > maxPlaintextBytes) {
        plaintext.fill(0);
        throw new MindGardenPortabilityError('backup-too-large', 'Mind Garden backup exceeds the configured plaintext bound');
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
                name: 'scrypt',
                salt: salt.toString('base64'),
                cost: SCRYPT_COST,
                blockSize: SCRYPT_BLOCK_SIZE,
                parallelization: SCRYPT_PARALLELIZATION,
                keyBytes: KEY_BYTES,
            },
            cipher: { name: 'A256GCM', nonce: nonce.toString('base64') },
            compression: 'gzip',
        };
        const cipher = createCipheriv('aes-256-gcm', key, nonce);
        cipher.setAAD(additionalData(metadata));
        const body = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]);
        const packaged = { ...metadata, ciphertext: body.toString('base64') };
        body.fill(0);
        return Buffer.from(JSON.stringify(packaged), 'utf8');
    }
    finally {
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
export async function decryptMindGardenBackup(data, passphrase, maxPlaintextBytes) {
    assertMindGardenBackupPassphrase(passphrase);
    let parsed;
    try {
        parsed = packageSchema.parse(JSON.parse(Buffer.from(data).toString('utf8')));
    }
    catch (error) {
        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup package is malformed', { cause: error });
    }
    const salt = decodeCanonicalBase64(parsed.kdf.salt, 'salt', SALT_BYTES);
    const nonce = decodeCanonicalBase64(parsed.cipher.nonce, 'nonce', NONCE_BYTES);
    const encrypted = decodeCanonicalBase64(parsed.ciphertext, 'ciphertext');
    if (encrypted.length <= TAG_BYTES) {
        salt.fill(0);
        nonce.fill(0);
        encrypted.fill(0);
        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup ciphertext is truncated');
    }
    let key;
    let compressed;
    let plaintext;
    try {
        key = await deriveKey(passphrase, salt);
        const decipher = createDecipheriv('aes-256-gcm', key, nonce);
        decipher.setAAD(additionalData(metadataOf(parsed)));
        decipher.setAuthTag(encrypted.subarray(encrypted.length - TAG_BYTES));
        compressed = Buffer.concat([
            decipher.update(encrypted.subarray(0, encrypted.length - TAG_BYTES)),
            decipher.final(),
        ]);
        plaintext = await gunzipBuffer(compressed, maxPlaintextBytes);
        const payload = payloadSchema.parse(JSON.parse(plaintext.toString('utf8')));
        return {
            ...payload,
            attachments: payload.attachments.map(attachment => ({
                ...attachment,
                ref: {
                    attachmentId: AttachmentId(attachment.ref.attachmentId),
                    mediaType: attachment.ref.mediaType,
                    bytes: attachment.ref.bytes,
                    width: attachment.ref.width,
                    height: attachment.ref.height,
                    ...attachment.ref.name === undefined ? {} : { name: attachment.ref.name },
                },
            })),
        };
    }
    catch (error) {
        if (error instanceof MindGardenPortabilityError)
            throw error;
        throw new MindGardenPortabilityError('invalid-backup', 'Mind Garden backup could not be authenticated', { cause: error });
    }
    finally {
        salt.fill(0);
        nonce.fill(0);
        encrypted.fill(0);
        key?.fill(0);
        compressed?.fill(0);
        plaintext?.fill(0);
    }
}
//# sourceMappingURL=backup.js.map