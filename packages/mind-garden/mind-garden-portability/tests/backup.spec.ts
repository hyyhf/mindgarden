import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { AttachmentId } from '@deepseek-ai/dsh-attachment'
import {
  decryptMindGardenBackup,
  encryptMindGardenBackup,
  MindGardenPortabilityError,
  type MindGardenBackupPayload,
} from '../src/index.ts'

const PASSPHRASE = 'paper lantern river stone'

function payload(): MindGardenBackupPayload {
  return {
    format: 'deepseek-harness.mind-garden.profile',
    version: 1,
    createdAt: 2_000,
    vaultCreatedAt: 1_000,
    collections: {
      memories: [{ id: 'memory-1', value: { content: 'private memory' } }],
      reflections: [{ id: 'journal-1', value: { body: 'private journal' } }],
      media: [],
      stars: [{ id: 'star-1', value: { trait: 'curious' } }],
    },
    attachments: [{
      ref: {
        attachmentId: AttachmentId(`sha256:${'a'.repeat(64)}`),
        mediaType: 'image/png',
        bytes: 4,
        width: 1,
        height: 1,
        name: 'warm.png',
      },
      data: Buffer.from([1, 2, 3, 4]).toString('base64'),
    }],
  }
}

describe('Mind Garden encrypted backup format', () => {
  it('round-trips a compressed logical profile without exposing plaintext or a vault key', async () => {
    const encrypted = await encryptMindGardenBackup(payload(), PASSPHRASE, 1024 * 1024)
    const serialized = encrypted.toString('utf8')
    expect(serialized).toContain('DSHMG01')
    expect(serialized).toContain('scrypt')
    expect(serialized).not.toContain('private memory')
    expect(serialized).not.toContain('private journal')
    expect(serialized).not.toContain('data_key')
    await expect(decryptMindGardenBackup(encrypted, PASSPHRASE, 1024 * 1024)).resolves.toEqual(payload())
  })

  it('rejects weak passphrases, oversized plaintext, wrong secrets, and tampering', async () => {
    await expect(encryptMindGardenBackup(payload(), 'too short', 1024 * 1024)).rejects.toMatchObject({
      code: 'invalid-passphrase',
    })
    await expect(encryptMindGardenBackup(payload(), PASSPHRASE, 8)).rejects.toMatchObject({
      code: 'backup-too-large',
    })
    const encrypted = await encryptMindGardenBackup(payload(), PASSPHRASE, 1024 * 1024)
    await expect(decryptMindGardenBackup(encrypted, 'different secret phrase', 1024 * 1024)).rejects.toMatchObject({
      code: 'invalid-backup',
    })
    const parsed = JSON.parse(encrypted.toString('utf8')) as { ciphertext: string }
    const ciphertext = Buffer.from(parsed.ciphertext, 'base64')
    ciphertext[0] = (ciphertext[0] ?? 0) ^ 1
    parsed.ciphertext = ciphertext.toString('base64')
    await expect(decryptMindGardenBackup(
      Buffer.from(JSON.stringify(parsed)),
      PASSPHRASE,
      1024 * 1024,
    )).rejects.toBeInstanceOf(MindGardenPortabilityError)
  })
})
