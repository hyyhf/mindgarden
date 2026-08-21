/** AES-256-GCM primitives for ciphertext-only Mind Garden records. */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import { snapshotJsonValue } from '@deepseek-ai/dsh-session'
import type { MindGardenVaultCollection, MindGardenVaultEnvelope } from './domain.ts'
import { MindGardenVaultError } from './error.ts'

const DATA_KEY_BYTES = 32
const NONCE_BYTES = 12
const AUTH_TAG_BYTES = 16
const DATA_KEY_BASE64_PATTERN = /^[A-Za-z0-9+/]{43}=$/

/**
 * Decode one canonical base64 AES-256 data key.
 * @param encoded - Credential value to decode.
 * @returns A mutable 32-byte buffer that the caller must zero after use.
 */
export function decodeMindGardenDataKey(encoded: string): Buffer {
  if (!DATA_KEY_BASE64_PATTERN.test(encoded)) {
    throw new MindGardenVaultError('invalid-key', 'Mind Garden data key must be canonical base64 for exactly 32 bytes')
  }
  const key = Buffer.from(encoded, 'base64')
  if (key.length !== DATA_KEY_BYTES || key.toString('base64') !== encoded) {
    key.fill(0)
    throw new MindGardenVaultError('invalid-key', 'Mind Garden data key must be canonical base64 for exactly 32 bytes')
  }
  return key
}

/**
 * Create a fresh base64 AES-256 data key suitable for a credential provider.
 * @returns Canonical base64 containing 32 random bytes.
 */
export function createMindGardenDataKey(): string {
  const key = randomBytes(DATA_KEY_BYTES)
  try {
    return key.toString('base64')
  } finally {
    key.fill(0)
  }
}

/**
 * Compute the non-secret fingerprint used to reject a wrong credential before decryption.
 * @param key - Decoded 32-byte data key.
 * @returns Base64url SHA-256 fingerprint.
 */
export function mindGardenDataKeyId(key: Buffer): string {
  return createHash('sha256').update(key).digest('base64url')
}

function aad(collection: MindGardenVaultCollection, id: string): Buffer {
  return Buffer.from(`mind-garden-vault:v1:${collection}:${id}`, 'utf8')
}

function decodeCanonicalBase64(value: string, label: string): Buffer {
  const decoded = Buffer.from(value, 'base64')
  if (decoded.toString('base64') !== value) {
    throw new MindGardenVaultError('corrupt-record', `Mind Garden vault record has invalid ${label}`)
  }
  return decoded
}

/**
 * Encrypt a detached lossless-JSON value and preserve creation time on overwrite.
 * @param options - Key, record identity, value, time, and plaintext bound.
 * @returns A version-one AES-256-GCM envelope.
 */
export function encryptMindGardenJson(options: {
  readonly key: Buffer
  readonly keyId: string
  readonly collection: MindGardenVaultCollection
  readonly id: string
  readonly value: JsonValue
  readonly now: number
  readonly previous?: MindGardenVaultEnvelope
  readonly maxPlaintextBytes: number
}): MindGardenVaultEnvelope {
  const snapshot = snapshotJsonValue(options.value)
  if (snapshot === undefined) {
    throw new MindGardenVaultError('invalid-value', 'Mind Garden vault values must be lossless JSON')
  }
  const plaintext = Buffer.from(JSON.stringify(snapshot), 'utf8')
  if (plaintext.length > options.maxPlaintextBytes) {
    plaintext.fill(0)
    throw new MindGardenVaultError(
      'record-too-large',
      `Mind Garden vault plaintext exceeds ${options.maxPlaintextBytes} bytes`,
    )
  }
  const nonce = randomBytes(NONCE_BYTES)
  try {
    const cipher = createCipheriv('aes-256-gcm', options.key, nonce)
    cipher.setAAD(aad(options.collection, options.id))
    const body = Buffer.concat([cipher.update(plaintext), cipher.final()])
    const ciphertext = Buffer.concat([body, cipher.getAuthTag()])
    const createdAt = options.previous?.createdAt ?? options.now
    const updatedAt = Math.max(options.now, options.previous?.updatedAt ?? options.now)
    return {
      version: 1,
      algorithm: 'A256GCM',
      keyId: options.keyId,
      nonce: nonce.toString('base64'),
      ciphertext: ciphertext.toString('base64'),
      createdAt,
      updatedAt,
    }
  } finally {
    plaintext.fill(0)
    nonce.fill(0)
  }
}

/**
 * Authenticate, decrypt, parse, and detach one lossless-JSON record.
 * @param options - Key, record identity, envelope, and plaintext bound.
 * @returns Detached lossless JSON after authentication and validation.
 */
export function decryptMindGardenJson(options: {
  readonly key: Buffer
  readonly keyId: string
  readonly collection: MindGardenVaultCollection
  readonly id: string
  readonly envelope: MindGardenVaultEnvelope
  readonly maxPlaintextBytes: number
}): JsonValue {
  if (options.envelope.keyId !== options.keyId) {
    throw new MindGardenVaultError('key-mismatch', 'Mind Garden vault record belongs to a different data key')
  }
  const nonce = decodeCanonicalBase64(options.envelope.nonce, 'nonce')
  const payload = decodeCanonicalBase64(options.envelope.ciphertext, 'ciphertext')
  if (nonce.length !== NONCE_BYTES || payload.length < AUTH_TAG_BYTES) {
    nonce.fill(0)
    payload.fill(0)
    throw new MindGardenVaultError('corrupt-record', 'Mind Garden vault record has an invalid AES-GCM envelope')
  }
  const body = payload.subarray(0, payload.length - AUTH_TAG_BYTES)
  const tag = payload.subarray(payload.length - AUTH_TAG_BYTES)
  let plaintext: Buffer
  try {
    const decipher = createDecipheriv('aes-256-gcm', options.key, nonce)
    decipher.setAAD(aad(options.collection, options.id))
    decipher.setAuthTag(tag)
    plaintext = Buffer.concat([decipher.update(body), decipher.final()])
  } catch (cause) {
    throw new MindGardenVaultError(
      'authentication-failed',
      'Mind Garden vault record authentication failed',
      { cause },
    )
  } finally {
    nonce.fill(0)
    payload.fill(0)
  }
  try {
    if (plaintext.length > options.maxPlaintextBytes) {
      throw new MindGardenVaultError(
        'record-too-large',
        `Mind Garden vault plaintext exceeds ${options.maxPlaintextBytes} bytes`,
      )
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(plaintext.toString('utf8'))
    } catch (cause) {
      throw new MindGardenVaultError('corrupt-record', 'Mind Garden vault plaintext is not JSON', { cause })
    }
    const snapshot = snapshotJsonValue(parsed)
    if (snapshot === undefined) {
      throw new MindGardenVaultError('corrupt-record', 'Mind Garden vault plaintext is not lossless JSON')
    }
    return snapshot as JsonValue
  } finally {
    plaintext.fill(0)
  }
}
