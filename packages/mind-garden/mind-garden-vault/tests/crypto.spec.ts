import { createCipheriv, randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  createMindGardenDataKey,
  decodeMindGardenDataKey,
  decryptMindGardenJson,
  encryptMindGardenJson,
  mindGardenDataKeyId,
  MindGardenVaultError,
} from '../src/index.ts'
import type { MindGardenVaultEnvelope } from '../src/index.ts'

const encodedKey = Buffer.alloc(32, 7).toString('base64')

function key(): Buffer {
  return decodeMindGardenDataKey(encodedKey)
}

function encryptedPlaintext(plaintext: Buffer, id = 'custom'): MindGardenVaultEnvelope {
  const dataKey = key()
  const nonce = randomBytes(12)
  try {
    const cipher = createCipheriv('aes-256-gcm', dataKey, nonce)
    cipher.setAAD(Buffer.from(`mind-garden-vault:v1:memories:${id}`))
    const body = Buffer.concat([cipher.update(plaintext), cipher.final()])
    return {
      version: 1,
      algorithm: 'A256GCM',
      keyId: mindGardenDataKeyId(dataKey),
      nonce: nonce.toString('base64'),
      ciphertext: Buffer.concat([body, cipher.getAuthTag()]).toString('base64'),
      createdAt: 1,
      updatedAt: 1,
    }
  } finally {
    dataKey.fill(0)
    nonce.fill(0)
  }
}

function decrypt(envelope: MindGardenVaultEnvelope, id = 'custom', maxPlaintextBytes = 1_024) {
  const dataKey = key()
  try {
    return decryptMindGardenJson({
      key: dataKey,
      keyId: mindGardenDataKeyId(dataKey),
      collection: 'memories',
      id,
      envelope,
      maxPlaintextBytes,
    })
  } finally {
    dataKey.fill(0)
  }
}

describe('Mind Garden vault crypto', () => {
  it('creates, decodes, and fingerprints canonical 32-byte keys', () => {
    const created = createMindGardenDataKey()
    const decoded = decodeMindGardenDataKey(created)
    expect(decoded).toHaveLength(32)
    expect(decoded.toString('base64')).toBe(created)
    expect(mindGardenDataKeyId(decoded)).toMatch(/^[A-Za-z0-9_-]{43}$/)
    decoded.fill(0)
  })

  it.each(['', 'abc', `${'A'.repeat(43)}!`, Buffer.alloc(31).toString('base64'), `${'A'.repeat(42)}B=`])(
    'rejects a non-canonical key: %s',
    (candidate) => {
      expect(() => decodeMindGardenDataKey(candidate)).toThrow(
        expect.objectContaining({ code: 'invalid-key' }),
      )
    },
  )

  it('round-trips detached JSON with AAD binding and monotonic metadata', () => {
    const dataKey = key()
    const keyId = mindGardenDataKeyId(dataKey)
    try {
      const value = { nested: ['private', 3, true, null] }
      const first = encryptMindGardenJson({
        key: dataKey,
        keyId,
        collection: 'memories',
        id: 'one',
        value,
        now: 20,
        maxPlaintextBytes: 1_024,
      })
      value.nested[0] = 'changed'
      expect(decryptMindGardenJson({
        key: dataKey,
        keyId,
        collection: 'memories',
        id: 'one',
        envelope: first,
        maxPlaintextBytes: 1_024,
      })).toEqual({ nested: ['private', 3, true, null] })
      const second = encryptMindGardenJson({
        key: dataKey,
        keyId,
        collection: 'memories',
        id: 'one',
        value: 'next',
        now: 10,
        previous: first,
        maxPlaintextBytes: 1_024,
      })
      expect(second.createdAt).toBe(20)
      expect(second.updatedAt).toBe(20)
      expect(second.nonce).not.toBe(first.nonce)
    } finally {
      dataKey.fill(0)
    }
  })

  it('rejects invalid or oversized plaintext before encryption', () => {
    const dataKey = key()
    try {
      const base = {
        key: dataKey,
        keyId: mindGardenDataKeyId(dataKey),
        collection: 'memories' as const,
        id: 'one',
        now: 1,
      }
      expect(() => encryptMindGardenJson({
        ...base,
        value: Number.NaN,
        maxPlaintextBytes: 10,
      })).toThrow(expect.objectContaining({ code: 'invalid-value' }))
      expect(() => encryptMindGardenJson({
        ...base,
        value: 'too long',
        maxPlaintextBytes: 2,
      })).toThrow(expect.objectContaining({ code: 'record-too-large' }))
    } finally {
      dataKey.fill(0)
    }
  })

  it('fails closed for a wrong key id, AAD, tag, and malformed base64 envelope', () => {
    const envelope = encryptedPlaintext(Buffer.from('"secret"'))
    expect(() => decrypt({ ...envelope, keyId: 'wrong' })).toThrow(
      expect.objectContaining({ code: 'key-mismatch' }),
    )
    expect(() => decrypt(envelope, 'different-id')).toThrow(
      expect.objectContaining({ code: 'authentication-failed' }),
    )
    const tampered = Buffer.from(envelope.ciphertext, 'base64')
    tampered.writeUInt8(tampered.readUInt8(0) ^ 1, 0)
    expect(() => decrypt({ ...envelope, ciphertext: tampered.toString('base64') })).toThrow(
      expect.objectContaining({ code: 'authentication-failed' }),
    )
    expect(() => decrypt({ ...envelope, nonce: '***' })).toThrow(
      expect.objectContaining({ code: 'corrupt-record' }),
    )
    expect(() => decrypt({ ...envelope, ciphertext: '***' })).toThrow(
      expect.objectContaining({ code: 'corrupt-record' }),
    )
    expect(() => decrypt({ ...envelope, nonce: Buffer.alloc(11).toString('base64') })).toThrow(
      expect.objectContaining({ code: 'corrupt-record' }),
    )
    expect(() => decrypt({ ...envelope, ciphertext: Buffer.alloc(15).toString('base64') })).toThrow(
      expect.objectContaining({ code: 'corrupt-record' }),
    )
  })

  it('rejects authenticated plaintext that violates the JSON contract or read bound', () => {
    expect(() => decrypt(encryptedPlaintext(Buffer.from('not-json')))).toThrow(
      expect.objectContaining({ code: 'corrupt-record' }),
    )
    expect(() => decrypt(encryptedPlaintext(Buffer.from('-0')))).toThrow(
      expect.objectContaining({ code: 'corrupt-record' }),
    )
    expect(() => decrypt(encryptedPlaintext(Buffer.from('"larger"')), 'custom', 2)).toThrow(
      expect.objectContaining({ code: 'record-too-large' }),
    )
  })

  it('exposes stable coded errors without secret material', () => {
    const cause = new Error('cause')
    const error = new MindGardenVaultError('locked', 'safe message', { cause })
    expect(error).toMatchObject({ name: 'MindGardenVaultError', code: 'locked', message: 'safe message', cause })
  })
})
