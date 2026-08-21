import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import type { CredentialInfo, CredentialRef, ResolvedCredential } from '@deepseek-ai/dsh-credentials'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import {
  MemoryMediaPool,
  MemoryStorageBackend,
} from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import MindGardenVault, {
  createMindGardenDataKey,
  mindGardenVaultDomainSpec,
  MindGardenVaultRecordId,
  MindGardenVaultError,
} from '../src/index.ts'
import type { Config } from '../src/index.ts'
import { MIND_GARDEN_VAULT_ASSERT } from '../src/private.ts'

interface CredentialDouble {
  resolve(ref: CredentialRef): Promise<ResolvedCredential | undefined>
  describe(ref: CredentialRef): Promise<CredentialInfo>
  set(ref: CredentialRef, value: string): Promise<void>
  unset(ref: CredentialRef): Promise<void>
}

async function harness(options: {
  seed?: Record<string, string>
  config?: Config
  pool?: MemoryMediaPool
  credentials?: CredentialDouble
} = {}) {
  const ctx = new Context()
  const pool = options.pool ?? new MemoryMediaPool()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  if (options.credentials === undefined) {
    await ctx.plugin(MemoryCredentials, options.seed ?? {})
  } else {
    ctx.provide('credentials', options.credentials as never)
  }
  const fiber = await ctx.plugin(MindGardenVault, options.config ?? {})
  return { ctx, pool, fiber, vault: ctx.mindGardenVault }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Mind Garden vault service', () => {
  it('lazily creates a provider-owned key and stores only ciphertext envelopes', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const { pool, vault } = await harness()
    await expect(vault.status()).resolves.toEqual({
      state: 'uninitialized',
      credentialRef: 'MIND_GARDEN_DATA_KEY',
      configured: false,
      records: { memories: 0, reflections: 0, media: 0, stars: 0 },
    })

    const source = { text: 'only I can read this', scores: [1, 2] }
    await expect(vault.put('memories', MindGardenVaultRecordId('memory-1'), source)).resolves.toEqual({
      id: 'memory-1',
      collection: 'memories',
      createdAt: 1_000,
      updatedAt: 1_000,
    })
    source.text = 'mutated'
    await expect(vault.get('memories', MindGardenVaultRecordId('memory-1'))).resolves.toEqual({
      text: 'only I can read this',
      scores: [1, 2],
    })
    await expect(vault.entries('memories')).resolves.toEqual([[
      'memory-1',
      { text: 'only I can read this', scores: [1, 2] },
    ]])
    await expect(vault.snapshot()).resolves.toEqual({
      vaultCreatedAt: 1_000,
      collections: {
        memories: [{ id: 'memory-1', value: { text: 'only I can read this', scores: [1, 2] } }],
        reflections: [],
        media: [],
        stars: [],
      },
    })
    await expect(vault.get('memories', MindGardenVaultRecordId('absent'))).resolves.toBeUndefined()
    await expect(vault.status()).resolves.toMatchObject({
      state: 'ready',
      configured: true,
      source: 'memory',
      records: { memories: 1, reflections: 0, media: 0, stars: 0 },
    })

    const medium = pool.media.get('mind_garden_vault')
    const serialized = JSON.stringify({
      global: medium?.global,
      records: [...(medium?.tables.get('memories')?.values() ?? [])],
    })
    expect(serialized).not.toContain('only I can read this')
  })

  it('preserves creation time, serializes concurrent writes, and deletes only with the matching key', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(2_000)
    const { vault } = await harness({ seed: { MIND_GARDEN_DATA_KEY: createMindGardenDataKey() } })
    await Promise.all([
      vault.put('reflections', MindGardenVaultRecordId('a'), { value: 1 }),
      vault.put('reflections', MindGardenVaultRecordId('b'), { value: 2 }),
    ])
    vi.setSystemTime(1_500)
    await expect(vault.put('reflections', MindGardenVaultRecordId('a'), { value: 3 })).resolves.toMatchObject({
      createdAt: 2_000,
      updatedAt: 2_000,
    })
    await expect(vault.delete('reflections', MindGardenVaultRecordId('missing'))).resolves.toBe(false)
    await expect(vault.delete('reflections', MindGardenVaultRecordId('b'))).resolves.toBe(true)
    await expect(vault.entries('reflections')).resolves.toEqual([['a', { value: 3 }]])
  })

  it('merges a validated snapshot without overwriting current ids and converges on retry', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(2_500)
    const { vault } = await harness()
    await vault.put('memories', MindGardenVaultRecordId('current'), { value: 'keep me' })
    const collections = {
      memories: [
        { id: MindGardenVaultRecordId('current'), value: { value: 'archive copy' } },
        { id: MindGardenVaultRecordId('missing'), value: { value: 'restore me' } },
      ],
      reflections: [{ id: MindGardenVaultRecordId('journal'), value: { body: 'hello' } }],
      media: [],
      stars: [],
    }
    await expect(vault.previewMissing({
      memories: [MindGardenVaultRecordId('current'), MindGardenVaultRecordId('missing')],
      reflections: [MindGardenVaultRecordId('journal')],
      media: [],
      stars: [],
    })).resolves.toEqual({
      added: { memories: 1, reflections: 1, media: 0, stars: 0 },
      kept: { memories: 1, reflections: 0, media: 0, stars: 0 },
    })
    await expect(vault.mergeMissing(collections)).resolves.toEqual({
      added: { memories: 1, reflections: 1, media: 0, stars: 0 },
      kept: { memories: 1, reflections: 0, media: 0, stars: 0 },
    })
    await expect(vault.get('memories', MindGardenVaultRecordId('current')))
      .resolves.toEqual({ value: 'keep me' })
    await expect(vault.get('memories', MindGardenVaultRecordId('missing')))
      .resolves.toEqual({ value: 'restore me' })
    await expect(vault.mergeMissing(collections)).resolves.toEqual({
      added: { memories: 0, reflections: 0, media: 0, stars: 0 },
      kept: { memories: 2, reflections: 1, media: 0, stars: 0 },
    })
  })

  it('rejects duplicate or invalid merge input before writing any record', async () => {
    const { vault } = await harness({ config: { maxPlaintextBytes: 8 } })
    await expect(vault.mergeMissing({
      memories: [
        { id: MindGardenVaultRecordId('same'), value: 1 },
        { id: MindGardenVaultRecordId('same'), value: 2 },
      ],
      reflections: [],
      media: [],
      stars: [],
    })).rejects.toMatchObject({ code: 'invalid-record-id' })
    await expect(vault.mergeMissing({
      memories: [{ id: MindGardenVaultRecordId('valid'), value: 1 }],
      reflections: [{ id: MindGardenVaultRecordId('too-large'), value: 'long value' }],
      media: [],
      stars: [],
    })).rejects.toMatchObject({ code: 'record-too-large' })
    await expect(vault.entries('memories')).resolves.toEqual([])
  })

  it('rotates every envelope without changing private values or record timestamps', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(3_000)
    const original = createMindGardenDataKey()
    const { ctx, pool, vault } = await harness({ seed: { MIND_GARDEN_DATA_KEY: original } })
    await vault.put('memories', MindGardenVaultRecordId('one'), { text: 'kept' })
    await vault.put('stars', MindGardenVaultRecordId('two'), ['also kept'])
    const before = pool.media.get('mind_garden_vault')
    const firstBefore = before?.tables.get('memories')?.get('one') as { keyId: string; createdAt: number; updatedAt: number }

    vi.setSystemTime(4_000)
    const result = await vault.rotateDataKey()
    expect(result).toMatchObject({
      fromKeyId: firstBefore.keyId,
      records: 2,
      startedAt: 4_000,
      completedAt: 4_000,
    })
    expect(result.toKeyId).not.toBe(result.fromKeyId)
    await expect(vault.entries('memories')).resolves.toEqual([['one', { text: 'kept' }]])
    await expect(vault.entries('stars')).resolves.toEqual([['two', ['also kept']]])
    await expect(vault.status()).resolves.toMatchObject({ state: 'ready', keyId: result.toKeyId })
    await expect(ctx.credentials.resolve('MIND_GARDEN_DATA_KEY_NEXT' as CredentialRef)).resolves.toBeUndefined()
    const primary = await ctx.credentials.resolve('MIND_GARDEN_DATA_KEY' as CredentialRef)
    expect(primary?.value).not.toBe(original)
    const firstAfter = before?.tables.get('memories')?.get('one') as { keyId: string; createdAt: number; updatedAt: number }
    expect(firstAfter).toMatchObject({ keyId: result.toKeyId, createdAt: 3_000, updatedAt: 3_000 })
    expect(JSON.stringify(before)).not.toContain('kept')
  })

  it('resumes a journaled rotation after a durable record write fails and the process restarts', async () => {
    const original = createMindGardenDataKey()
    const first = await harness({ seed: { MIND_GARDEN_DATA_KEY: original } })
    await first.vault.put('memories', MindGardenVaultRecordId('one'), 'first secret')
    await first.vault.put('reflections', MindGardenVaultRecordId('two'), 'second secret')
    let journaled = false
    let armed = true
    first.ctx.on('domain/changed', (change) => {
      const state = change.value as { rotation?: unknown } | undefined
      if (change.domain !== 'mind_garden_vault') return
      if (change.table === '' && state?.rotation !== undefined) {
        journaled = true
      } else if (journaled && armed && change.table === 'memories') {
        armed = false
        first.pool.failNextWrites = 1
      }
    })

    await expect(first.vault.rotateDataKey()).rejects.toThrow('injected write failure')
    await expect(first.vault.status()).resolves.toMatchObject({
      state: 'rotating',
      rotation: { completedRecords: 1, totalRecords: 2 },
    })
    const primary = await first.ctx.credentials.resolve('MIND_GARDEN_DATA_KEY' as CredentialRef)
    const staged = await first.ctx.credentials.resolve('MIND_GARDEN_DATA_KEY_NEXT' as CredentialRef)
    expect(primary?.value).toBe(original)
    expect(staged?.value).toBeDefined()
    await first.fiber.dispose()

    const restarted = await harness({
      pool: first.pool,
      seed: {
        MIND_GARDEN_DATA_KEY: primary?.value ?? '',
        MIND_GARDEN_DATA_KEY_NEXT: staged?.value ?? '',
      },
    })
    await expect(restarted.vault.initialize()).resolves.toMatchObject({ state: 'ready' })
    await expect(restarted.vault.get('memories', MindGardenVaultRecordId('one'))).resolves.toBe('first secret')
    await expect(restarted.vault.get('reflections', MindGardenVaultRecordId('two'))).resolves.toBe('second secret')
    await expect(restarted.ctx.credentials.resolve('MIND_GARDEN_DATA_KEY_NEXT' as CredentialRef)).resolves.toBeUndefined()
    expect(JSON.stringify(restarted.pool.media.get('mind_garden_vault'))).not.toContain('secret')
  })

  it('reports and rejects missing, invalid, and mismatched credentials without replacing them', async () => {
    const neverInitialized = await harness({ seed: { MIND_GARDEN_DATA_KEY: 'invalid' } })
    await expect(neverInitialized.vault.status()).resolves.toEqual({
      state: 'invalid-key',
      credentialRef: 'MIND_GARDEN_DATA_KEY',
      configured: true,
      source: 'memory',
      records: { memories: 0, reflections: 0, media: 0, stars: 0 },
    })

    const original = createMindGardenDataKey()
    const { ctx, vault } = await harness({ seed: { MIND_GARDEN_DATA_KEY: original } })
    await vault.put('memories', MindGardenVaultRecordId('one'), 'private')

    await ctx.credentials.unset('MIND_GARDEN_DATA_KEY' as CredentialRef)
    await expect(vault.status()).resolves.toMatchObject({ state: 'locked', configured: false })
    await expect(vault.get('memories', MindGardenVaultRecordId('one'))).rejects.toMatchObject({ code: 'locked' })

    await ctx.credentials.set('MIND_GARDEN_DATA_KEY' as CredentialRef, 'invalid')
    await expect(vault.status()).resolves.toMatchObject({ state: 'invalid-key', configured: true })
    await expect(vault.get('memories', MindGardenVaultRecordId('one'))).rejects.toMatchObject({ code: 'invalid-key' })

    await ctx.credentials.set('MIND_GARDEN_DATA_KEY' as CredentialRef, createMindGardenDataKey())
    await expect(vault.status()).resolves.toMatchObject({ state: 'key-mismatch' })
    await expect(vault.delete('memories', MindGardenVaultRecordId('one'))).rejects.toMatchObject({ code: 'key-mismatch' })

    await ctx.credentials.set('MIND_GARDEN_DATA_KEY' as CredentialRef, original)
    await expect(vault.get('memories', MindGardenVaultRecordId('one'))).resolves.toBe('private')
  })

  it('can explicitly initialize a configured or auto-created empty vault', async () => {
    const configured = await harness({ seed: { CUSTOM_GARDEN_KEY: createMindGardenDataKey() }, config: {
      dataKeyEnv: 'CUSTOM_GARDEN_KEY',
    } })
    await expect(configured.vault.status()).resolves.toMatchObject({ state: 'uninitialized', configured: true })
    await expect(configured.vault.initialize()).resolves.toMatchObject({ state: 'ready', configured: true })

    const generated = await harness()
    await expect(generated.vault.initialize()).resolves.toMatchObject({ state: 'ready', configured: true })
  })

  it('fails closed when creation is disabled, unwritable, or not observable after set', async () => {
    const disabled = await harness({ config: { autoCreateKey: false } })
    await expect(disabled.vault.put('memories', MindGardenVaultRecordId('one'), 1)).rejects.toMatchObject({ code: 'locked' })

    const unwritable: CredentialDouble = {
      resolve: async () => undefined,
      describe: async () => ({ configured: false, writable: false }),
      set: async () => { throw new Error('must not set') },
      unset: async () => {},
    }
    const locked = await harness({ credentials: unwritable })
    await expect(locked.vault.put('memories', MindGardenVaultRecordId('one'), 1)).rejects.toMatchObject({ code: 'locked' })

    const disappearing: CredentialDouble = {
      resolve: async () => undefined,
      describe: async () => ({ configured: false, writable: true }),
      set: async () => {},
      unset: async () => {},
    }
    const missing = await harness({ credentials: disappearing })
    await expect(missing.vault.put('memories', MindGardenVaultRecordId('one'), 1)).rejects.toMatchObject({ code: 'locked' })
  })

  it('rejects invalid ids, values, record bounds, and programmatic config', async () => {
    const { vault } = await harness({
      seed: { MIND_GARDEN_DATA_KEY: createMindGardenDataKey() },
      config: { maxIdBytes: 3, maxPlaintextBytes: 4 },
    })
    expect(() => vault.put('memories', MindGardenVaultRecordId(''), 1)).toThrow(expect.objectContaining({ code: 'invalid-record-id' }))
    expect(() => vault.put('memories', MindGardenVaultRecordId('四a'), 1)).toThrow(expect.objectContaining({ code: 'invalid-record-id' }))
    await expect(vault.put('memories', MindGardenVaultRecordId('ok'), Number.NaN as never)).rejects.toMatchObject({ code: 'invalid-value' })
    await expect(vault.put('memories', MindGardenVaultRecordId('ok'), 'long')).rejects.toMatchObject({ code: 'record-too-large' })

    expect(() => new MindGardenVault(new Context(), { maxIdBytes: 0 })).toThrow(TypeError)
    expect(() => new MindGardenVault(new Context(), { maxPlaintextBytes: Number.NaN })).toThrow(TypeError)
    expect(() => new MindGardenVault(new Context(), { dataKeyEnv: 'not-valid!' })).toThrow(TypeError)
    expect(() => new MindGardenVault(new Context(), {
      dataKeyEnv: 'SAME_KEY', rotationKeyEnv: 'SAME_KEY',
    })).toThrow(TypeError)
  })

  it('rejects inconsistent stored state at startup and exposes startup guards', async () => {
    const pool = new MemoryMediaPool()
    pool.versions.set('mind_garden_vault', 2)
    pool.media.set('mind_garden_vault', {
      global: { version: 1, initialized: false, keyId: 'unexpected', createdAt: 1 },
      tables: new Map(),
    })
    await expect(harness({ pool })).rejects.toMatchObject({ code: 'corrupt-state' })

    const orphanPool = new MemoryMediaPool()
    orphanPool.versions.set('mind_garden_vault', 2)
    orphanPool.media.set('mind_garden_vault', {
      global: { version: 1, initialized: false, keyId: '', createdAt: 0 },
      tables: new Map([['memories', new Map([['one', {
        version: 1,
        algorithm: 'A256GCM',
        keyId: 'orphan',
        nonce: Buffer.alloc(12).toString('base64'),
        ciphertext: Buffer.alloc(16).toString('base64'),
        createdAt: 1,
        updatedAt: 1,
      }]])]]),
    })
    await expect(harness({ pool: orphanPool })).rejects.toMatchObject({ code: 'corrupt-state' })

    const malformedInitializedPool = new MemoryMediaPool()
    malformedInitializedPool.versions.set('mind_garden_vault', 2)
    malformedInitializedPool.media.set('mind_garden_vault', {
      global: { version: 1, initialized: true, keyId: '', createdAt: 0 },
      tables: new Map(),
    })
    await expect(harness({ pool: malformedInitializedPool })).rejects.toMatchObject({ code: 'corrupt-state' })

    const wrongEnvelopePool = new MemoryMediaPool()
    wrongEnvelopePool.versions.set('mind_garden_vault', 2)
    wrongEnvelopePool.media.set('mind_garden_vault', {
      global: { version: 1, initialized: true, keyId: 'expected', createdAt: 1 },
      tables: new Map([['memories', new Map([['one', {
        version: 1,
        algorithm: 'A256GCM',
        keyId: 'wrong',
        nonce: Buffer.alloc(12).toString('base64'),
        ciphertext: Buffer.alloc(16).toString('base64'),
        createdAt: 1,
        updatedAt: 1,
      }]])]]),
    })
    await expect(harness({ pool: wrongEnvelopePool })).rejects.toMatchObject({ code: 'corrupt-state' })

    const reversedTimestampPool = new MemoryMediaPool()
    reversedTimestampPool.versions.set('mind_garden_vault', 2)
    reversedTimestampPool.media.set('mind_garden_vault', {
      global: { version: 1, initialized: true, keyId: 'expected', createdAt: 1 },
      tables: new Map([['memories', new Map([['one', {
        version: 1,
        algorithm: 'A256GCM',
        keyId: 'expected',
        nonce: Buffer.alloc(12).toString('base64'),
        ciphertext: Buffer.alloc(16).toString('base64'),
        createdAt: 2,
        updatedAt: 1,
      }]])]]),
    })
    await expect(harness({ pool: reversedTimestampPool })).rejects.toMatchObject({ code: 'corrupt-state' })

    const lateOrphan = await harness({ seed: { MIND_GARDEN_DATA_KEY: createMindGardenDataKey() } })
    const domain = (lateOrphan.vault as unknown as {
      domain: Domain<typeof mindGardenVaultDomainSpec>
    }).domain
    await domain.table('memories').put('late', {
      version: 1,
      algorithm: 'A256GCM',
      keyId: 'orphan',
      nonce: Buffer.alloc(12).toString('base64'),
      ciphertext: Buffer.alloc(16).toString('base64'),
      createdAt: 1,
      updatedAt: 1,
    })
    await expect(lateOrphan.vault.initialize()).rejects.toMatchObject({ code: 'corrupt-state' })

    const service = new MindGardenVault(new Context(), {})
    expect(() => {
      service[MIND_GARDEN_VAULT_ASSERT](() => { throw new Error('unused') })
    }).toThrow(/not initialized/)
    expect(new MindGardenVaultError('locked', 'message')).toBeInstanceOf(Error)
    expect(mindGardenVaultDomainSpec.name).toBe('mind_garden_vault')
    expect(mindGardenVaultDomainSpec.version).toBe(2)
  })
})
