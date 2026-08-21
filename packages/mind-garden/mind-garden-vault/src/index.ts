/**
 * Credential-backed encrypted private-record service for Mind Garden.
 * @module @deepseek-ai/dsh-mind-garden-vault
 */

import { Buffer } from 'node:buffer'
import { Context, Service } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { Branded } from '@deepseek-ai/dsh-brand'
import { credentialRef, type CredentialRef } from '@deepseek-ai/dsh-credentials'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import type { Domain, KvTable } from '@deepseek-ai/dsh-storage-domain'
import {
  createMindGardenDataKey,
  decodeMindGardenDataKey,
  decryptMindGardenJson,
  encryptMindGardenJson,
  mindGardenDataKeyId,
} from './crypto.ts'
import {
  MIND_GARDEN_VAULT_COLLECTIONS,
  mindGardenVaultDomainSpec,
  type MindGardenVaultCollection,
  type MindGardenVaultEnvelope,
  type MindGardenVaultRotationState,
} from './domain.ts'
import { MindGardenVaultError } from './error.ts'
import { MIND_GARDEN_VAULT_ASSERT } from './private.ts'

export { MIND_GARDEN_VAULT_COLLECTIONS, mindGardenVaultDomainSpec } from './domain.ts'
export type * from './domain.ts'
export type { MindGardenVaultErrorCode } from './error.ts'
export { MindGardenVaultError } from './error.ts'
export {
  createMindGardenDataKey,
  decodeMindGardenDataKey,
  decryptMindGardenJson,
  encryptMindGardenJson,
  mindGardenDataKeyId,
} from './crypto.ts'

const DEFAULT_DATA_KEY_ENV = 'MIND_GARDEN_DATA_KEY'
const DEFAULT_ROTATION_KEY_ENV = 'MIND_GARDEN_DATA_KEY_NEXT'
const DEFAULT_MAX_ID_BYTES = 512
const DEFAULT_MAX_PLAINTEXT_BYTES = 8 * 1024 * 1024

/** Cordis plugin configuration. */
export interface Config {
  /** Credential reference containing one canonical base64 32-byte data key. */
  dataKeyEnv?: string
  /** Writable staging credential used only while a recoverable data-key rotation is in progress. */
  rotationKeyEnv?: string
  /** Generate and persist a key on first initialization when the provider is writable. */
  autoCreateKey?: boolean
  /** Maximum UTF-8 bytes accepted for an opaque record id. */
  maxIdBytes?: number
  /** Maximum lossless-JSON plaintext bytes accepted per record. */
  maxPlaintextBytes?: number
}

interface ResolvedConfig {
  readonly dataKeyRef: CredentialRef
  readonly rotationKeyRef: CredentialRef
  readonly autoCreateKey: boolean
  readonly maxIdBytes: number
  readonly maxPlaintextBytes: number
}

/** Safe state for settings and health surfaces; never includes credential values. */
export interface MindGardenVaultStatus {
  readonly state: 'uninitialized' | 'ready' | 'rotating' | 'locked' | 'invalid-key' | 'key-mismatch'
  readonly credentialRef: string
  readonly configured: boolean
  readonly source?: string
  readonly keyId?: string
  readonly records: Readonly<Record<MindGardenVaultCollection, number>>
  readonly rotation?: {
    readonly completedRecords: number
    readonly totalRecords: number
    readonly startedAt: number
  }
}

/** Non-secret completion receipt for one fully durable data-key rotation. */
export interface MindGardenVaultRotationResult {
  readonly fromKeyId: string
  readonly toKeyId: string
  readonly records: number
  readonly startedAt: number
  readonly completedAt: number
}

/** Metadata returned after one encrypted record is committed. */
export interface MindGardenVaultRecordMeta {
  readonly id: MindGardenVaultRecordId
  readonly collection: MindGardenVaultCollection
  readonly createdAt: number
  readonly updatedAt: number
}

/** One authenticated private record in a coherent profile snapshot. */
export interface MindGardenVaultSnapshotRecord {
  readonly id: MindGardenVaultRecordId
  readonly value: JsonValue
}

/** Detached point-in-time plaintext used only by trusted profile-lifecycle plugins. */
export interface MindGardenVaultSnapshot {
  readonly vaultCreatedAt: number
  readonly collections: Readonly<Record<
    MindGardenVaultCollection,
    readonly MindGardenVaultSnapshotRecord[]
  >>
}

/** Record totals from one non-overwriting profile merge. */
export interface MindGardenVaultMergeCounts {
  readonly memories: number
  readonly reflections: number
  readonly media: number
  readonly stars: number
}

/** Receipt from an idempotent merge that preserves every current record. */
export interface MindGardenVaultMergeResult {
  readonly added: MindGardenVaultMergeCounts
  readonly kept: MindGardenVaultMergeCounts
}

/** Candidate ids used to preview a non-overwriting profile merge. */
export type MindGardenVaultMergeCandidates = Readonly<Record<
  MindGardenVaultCollection,
  readonly MindGardenVaultRecordId[]
>>

/** Opaque record identity owned by a private-data consumer. */
export type MindGardenVaultRecordId = Branded<'MindGardenVaultRecordId'>

/**
 * Brand an opaque private-record id for the vault API.
 * @param id - Consumer-owned stable identifier.
 * @returns The same string with its compile-time vault-record brand.
 */
export function MindGardenVaultRecordId(id: string): MindGardenVaultRecordId {
  return id as MindGardenVaultRecordId
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    mindGardenVault: MindGardenVault
  }
}

function positiveSafeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TypeError(`mind-garden-vault: ${name} must be a positive safe integer`)
  }
  return value
}

function resolveConfig(config: Config): ResolvedConfig {
  const dataKeyRef = credentialRef(config.dataKeyEnv ?? DEFAULT_DATA_KEY_ENV)
  const rotationKeyRef = credentialRef(config.rotationKeyEnv
    ?? (config.dataKeyEnv === undefined ? DEFAULT_ROTATION_KEY_ENV : `${config.dataKeyEnv}_NEXT`))
  if (dataKeyRef === rotationKeyRef) {
    throw new TypeError('mind-garden-vault: dataKeyEnv and rotationKeyEnv must be different credential references')
  }
  return {
    dataKeyRef,
    rotationKeyRef,
    autoCreateKey: config.autoCreateKey ?? true,
    maxIdBytes: positiveSafeInteger(config.maxIdBytes ?? DEFAULT_MAX_ID_BYTES, 'maxIdBytes'),
    maxPlaintextBytes: positiveSafeInteger(
      config.maxPlaintextBytes ?? DEFAULT_MAX_PLAINTEXT_BYTES,
      'maxPlaintextBytes',
    ),
  }
}

/** Encrypted private-record service shared by memory, reflection, media, and Star Map plugins. */
export class MindGardenVault extends Service {
  static inject = ['credentials', 'storageDomain']

  /** Loader validation for credential and record bounds. */
  static Config: z<Config> = z.object({
    dataKeyEnv: z.string().default(DEFAULT_DATA_KEY_ENV),
    rotationKeyEnv: z.string().default(DEFAULT_ROTATION_KEY_ENV),
    autoCreateKey: z.boolean().default(true),
    maxIdBytes: z.number().default(DEFAULT_MAX_ID_BYTES),
    maxPlaintextBytes: z.number().default(DEFAULT_MAX_PLAINTEXT_BYTES),
  })

  private readonly options: ResolvedConfig
  private domain?: Domain<typeof mindGardenVaultDomainSpec>
  private keyResolutionTail: Promise<void> = Promise.resolve()

  constructor(ctx: Context, config: Config) {
    super(ctx, 'mindGardenVault')
    this.options = resolveConfig(config)
  }

  /** Open and own the ciphertext domain before the service becomes injectable. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(mindGardenVaultDomainSpec)
    this.domain = domain
    this.ctx.effect(() => () => domain.close(), 'mind-garden-vault.domainClose')
    this[MIND_GARDEN_VAULT_ASSERT]((message) => {
      throw new MindGardenVaultError('corrupt-state', message)
    })
  }

  /**
   * Initialize the data-key binding, creating a provider-owned key when allowed.
   * @returns Safe post-initialization status; rejects without changing an initialized vault on key failure.
   */
  initialize(): Promise<MindGardenVaultStatus> {
    return this.withDataKey(async () => await this.status())
  }

  /**
   * Inspect key availability and record counts without returning secret values or record ids.
   * @returns Current credential compatibility and per-collection counts without mutating the vault.
   */
  async status(): Promise<MindGardenVaultStatus> {
    const domain = this.requireDomain()
    const state = domain.global.get()
    const records = this.recordCounts()
    const rotation = state.rotation === undefined ? undefined : this.rotationProgress(state.rotation)
    const resolved = await this.ctx.credentials.resolve(this.options.dataKeyRef)
    if (resolved === undefined) {
      return {
        state: state.initialized ? 'locked' : 'uninitialized',
        credentialRef: this.options.dataKeyRef,
        configured: false,
        ...state.initialized ? { keyId: state.keyId } : {},
        records,
        ...rotation === undefined ? {} : { rotation },
      }
    }
    let key: Buffer
    try {
      key = decodeMindGardenDataKey(resolved.value)
    } catch {
      return {
        state: 'invalid-key',
        credentialRef: this.options.dataKeyRef,
        configured: true,
        source: resolved.source,
        ...state.initialized ? { keyId: state.keyId } : {},
        records,
        ...rotation === undefined ? {} : { rotation },
      }
    }
    try {
      const candidateId = mindGardenDataKeyId(key)
      const candidateMatchesRotation = state.rotation !== undefined
        && (candidateId === state.rotation.fromKeyId || candidateId === state.rotation.toKeyId)
      return {
        state: !state.initialized
          ? 'uninitialized'
          : state.rotation !== undefined && candidateMatchesRotation
            ? 'rotating'
            : candidateId === state.keyId ? 'ready' : 'key-mismatch',
        credentialRef: this.options.dataKeyRef,
        configured: true,
        source: resolved.source,
        keyId: state.initialized ? state.keyId : candidateId,
        records,
        ...rotation === undefined ? {} : { rotation },
      }
    } finally {
      key.fill(0)
    }
  }

  /**
   * Encrypt and durably insert or replace one private JSON record.
   * @param collection - Fixed private-data family.
   * @param id - Consumer-owned opaque record id.
   * @param value - Lossless JSON to detach and encrypt.
   * @returns Committed record metadata after backend durability.
   */
  put(
    collection: MindGardenVaultCollection,
    id: MindGardenVaultRecordId,
    value: JsonValue,
  ): Promise<MindGardenVaultRecordMeta> {
    const table = this.table(collection)
    this.validateId(id)
    return this.withDataKey(async (key, keyId) => {
      const previous = table.get(id)
      const envelope = encryptMindGardenJson({
        key,
        keyId,
        collection,
        id,
        value,
        now: Date.now(),
        ...previous === undefined ? {} : { previous },
        maxPlaintextBytes: this.options.maxPlaintextBytes,
      })
      await table.put(id, envelope)
      return { id, collection, createdAt: envelope.createdAt, updatedAt: envelope.updatedAt }
    })
  }

  /**
   * Authenticate and return one detached private JSON record.
   * @param collection - Fixed private-data family.
   * @param id - Consumer-owned opaque record id.
   * @returns Detached lossless JSON, or `undefined` when the authenticated vault has no record.
   */
  get(collection: MindGardenVaultCollection, id: MindGardenVaultRecordId): Promise<JsonValue | undefined> {
    const table = this.table(collection)
    this.validateId(id)
    return this.withDataKey((key, keyId) => {
      const envelope = table.get(id)
      return Promise.resolve(envelope === undefined ? undefined : decryptMindGardenJson({
        key,
        keyId,
        collection,
        id,
        envelope,
        maxPlaintextBytes: this.options.maxPlaintextBytes,
      }))
    })
  }

  /**
   * Authenticate and return every private JSON record in stable table order.
   * @param collection - Fixed private-data family.
   * @returns Opaque ids and detached values; one authentication failure rejects the complete read.
   */
  entries(collection: MindGardenVaultCollection): Promise<[MindGardenVaultRecordId, JsonValue][]> {
    const table = this.table(collection)
    return this.withDataKey((key, keyId) => Promise.resolve([...table.entries()].map(([id, envelope]) => [
      MindGardenVaultRecordId(id),
      decryptMindGardenJson({
        key,
        keyId,
        collection,
        id,
        envelope,
        maxPlaintextBytes: this.options.maxPlaintextBytes,
      }),
    ])))
  }

  /**
   * Authenticate and detach every private record at one vault operation boundary.
   *
   * The snapshot is intentionally profile-wide and plaintext. Only trusted
   * lifecycle plugins such as encrypted export and key rotation should call
   * it; browser and model surfaces must receive a separately protected form.
   *
   * @returns All four collections from one serialized point in time.
   */
  snapshot(): Promise<MindGardenVaultSnapshot> {
    return this.withDataKey((key, keyId) => {
      const domain = this.requireDomain()
      const snapshotCollection = (collection: MindGardenVaultCollection) =>
        [...domain.table(collection).entries()].map(([id, envelope]) => ({
          id: MindGardenVaultRecordId(id),
          value: decryptMindGardenJson({
            key,
            keyId,
            collection,
            id,
            envelope,
            maxPlaintextBytes: this.options.maxPlaintextBytes,
          }),
        }))
      const collections = {
        memories: snapshotCollection('memories'),
        reflections: snapshotCollection('reflections'),
        media: snapshotCollection('media'),
        stars: snapshotCollection('stars'),
      }
      return Promise.resolve({
        vaultCreatedAt: domain.global.get().createdAt,
        collections,
      })
    })
  }

  /**
   * Count candidate ids that a non-overwriting merge would add or preserve.
   * @param candidates - Opaque ids from a fully validated portable profile.
   * @returns Current per-collection plan; the later merge recomputes it authoritatively.
   */
  async previewMissing(
    candidates: MindGardenVaultMergeCandidates,
  ): Promise<MindGardenVaultMergeResult> {
    this.validateMergeIds(candidates)
    return await this.withDataKey(() => Promise.resolve(this.mergeCounts(candidates)))
  }

  /**
   * Encrypt and add snapshot records whose ids are absent from the current profile.
   *
   * Every id and value is validated and encrypted before the first durable write.
   * Existing ids are never compared, decrypted, or overwritten. A backend failure
   * can leave a prefix committed; repeating the same merge safely converges because
   * committed ids become `kept` on the next attempt.
   *
   * @param collections - Fully decoded records from a trusted profile-lifecycle plugin.
   * @returns Per-collection counts for added records and preserved current records.
   */
  async mergeMissing(
    collections: MindGardenVaultSnapshot['collections'],
  ): Promise<MindGardenVaultMergeResult> {
    const candidates: MindGardenVaultMergeCandidates = {
      memories: collections.memories.map(record => record.id),
      reflections: collections.reflections.map(record => record.id),
      media: collections.media.map(record => record.id),
      stars: collections.stars.map(record => record.id),
    }
    this.validateMergeIds(candidates)
    return await this.withDataKey(async (key, keyId) => {
      const plan = this.mergeCounts(candidates)
      const added = { memories: 0, reflections: 0, media: 0, stars: 0 }
      const pending: {
        readonly collection: MindGardenVaultCollection
        readonly id: MindGardenVaultRecordId
        readonly envelope: MindGardenVaultEnvelope
      }[] = []
      const now = Date.now()
      for (const collection of MIND_GARDEN_VAULT_COLLECTIONS) {
        const table = this.table(collection)
        for (const record of collections[collection]) {
          if (table.get(record.id) !== undefined) {
            continue
          }
          pending.push({
            collection,
            id: record.id,
            envelope: encryptMindGardenJson({
              key,
              keyId,
              collection,
              id: record.id,
              value: record.value,
              now,
              maxPlaintextBytes: this.options.maxPlaintextBytes,
            }),
          })
        }
      }
      for (const record of pending) {
        await this.table(record.collection).put(record.id, record.envelope)
        added[record.collection] += 1
      }
      return { added: Object.freeze(added), kept: plan.kept }
    })
  }

  /**
   * Replace the profile data key through a crash-recoverable, idempotent journal.
   *
   * The primary and staging credential references must both be writable. A
   * failed attempt deliberately leaves its non-secret journal and staged key
   * in place; the next vault operation or explicit retry resumes from the
   * first envelope still protected by the previous key.
   *
   * @returns Non-secret key fingerprints, record count, and durable timing.
   */
  rotateDataKey(): Promise<MindGardenVaultRotationResult> {
    return this.serialize(async () => {
      const domain = this.requireDomain()
      if (domain.global.get().rotation === undefined) await this.startDataKeyRotation()
      return await this.resumeDataKeyRotation()
    })
  }

  /**
   * Delete one private record only after proving the configured key still matches the vault.
   * @param collection - Fixed private-data family.
   * @param id - Consumer-owned opaque record id.
   * @returns Whether an authenticated record existed and was durably removed.
   */
  delete(collection: MindGardenVaultCollection, id: MindGardenVaultRecordId): Promise<boolean> {
    const table = this.table(collection)
    this.validateId(id)
    return this.withDataKey(async () => await table.delete(id))
  }

  /** Validate the non-secret state/envelope relationship for startup and the package companion. */
  [MIND_GARDEN_VAULT_ASSERT](fail: (message: string) => never): void {
    const domain = this.requireDomain()
    const state = domain.global.get()
    const tables = MIND_GARDEN_VAULT_COLLECTIONS.map(collection => domain.table(collection))
    const total = tables.reduce((sum, table) => sum + table.size, 0)
    if (!state.initialized) {
      if (state.keyId !== '' || state.createdAt !== 0 || total !== 0 || state.rotation !== undefined) {
        fail('Mind Garden vault has records or key metadata before initialization')
      }
      return
    }
    if (state.keyId.length === 0 || state.createdAt === 0) {
      fail('Mind Garden vault initialized state must bind a key id and creation time')
    }
    const rotation = state.rotation
    if (rotation !== undefined) {
      if (rotation.fromKeyId.length === 0
        || rotation.toKeyId.length === 0
        || rotation.fromKeyId === rotation.toKeyId
        || rotation.startedAt === 0
        || (state.keyId !== rotation.fromKeyId && state.keyId !== rotation.toKeyId)) {
        fail('Mind Garden vault rotation journal must bind two distinct keys and the active state')
      }
    }
    for (const table of tables) {
      for (const envelope of table.entries()) {
        const allowedKey = rotation === undefined
          ? envelope[1].keyId === state.keyId
          : envelope[1].keyId === rotation.fromKeyId || envelope[1].keyId === rotation.toKeyId
        const oldEnvelopeAfterSwitch = rotation !== undefined
          && state.keyId === rotation.toKeyId
          && envelope[1].keyId === rotation.fromKeyId
        if (!allowedKey || oldEnvelopeAfterSwitch || envelope[1].updatedAt < envelope[1].createdAt) {
          fail('Mind Garden vault envelope must match the initialized key and timestamp order')
        }
      }
    }
  }

  private table(collection: MindGardenVaultCollection): KvTable<string, MindGardenVaultEnvelope> {
    return this.requireDomain().table(collection)
  }

  private validateId(id: string): void {
    if (id.length === 0 || Buffer.byteLength(id, 'utf8') > this.options.maxIdBytes) {
      throw new MindGardenVaultError(
        'invalid-record-id',
        `Mind Garden vault record id must contain 1-${this.options.maxIdBytes} UTF-8 bytes`,
      )
    }
  }

  private validateMergeIds(candidates: MindGardenVaultMergeCandidates): void {
    for (const collection of MIND_GARDEN_VAULT_COLLECTIONS) {
      const seen = new Set<string>()
      for (const id of candidates[collection]) {
        this.validateId(id)
        if (seen.has(id)) {
          throw new MindGardenVaultError(
            'invalid-record-id',
            `Mind Garden vault merge contains duplicate id '${id}' in '${collection}'`,
          )
        }
        seen.add(id)
      }
    }
  }

  private mergeCounts(candidates: MindGardenVaultMergeCandidates): MindGardenVaultMergeResult {
    const added: Record<MindGardenVaultCollection, number> = {
      memories: 0,
      reflections: 0,
      media: 0,
      stars: 0,
    }
    const kept: Record<MindGardenVaultCollection, number> = {
      memories: 0,
      reflections: 0,
      media: 0,
      stars: 0,
    }
    for (const collection of MIND_GARDEN_VAULT_COLLECTIONS) {
      const table = this.table(collection)
      for (const id of candidates[collection]) {
        if (table.get(id) === undefined) added[collection] += 1
        else kept[collection] += 1
      }
    }
    return { added: Object.freeze(added), kept: Object.freeze(kept) }
  }

  private recordCounts(): Readonly<Record<MindGardenVaultCollection, number>> {
    const domain = this.requireDomain()
    return Object.freeze({
      memories: domain.table('memories').size,
      reflections: domain.table('reflections').size,
      media: domain.table('media').size,
      stars: domain.table('stars').size,
    })
  }

  private rotationProgress(rotation: MindGardenVaultRotationState): {
    readonly completedRecords: number
    readonly totalRecords: number
    readonly startedAt: number
  } {
    const domain = this.requireDomain()
    let completedRecords = 0
    let totalRecords = 0
    for (const collection of MIND_GARDEN_VAULT_COLLECTIONS) {
      for (const envelope of domain.table(collection).entries()) {
        totalRecords += 1
        if (envelope[1].keyId === rotation.toKeyId) completedRecords += 1
      }
    }
    return { completedRecords, totalRecords, startedAt: rotation.startedAt }
  }

  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.keyResolutionTail.then(operation)
    this.keyResolutionTail = result.then(() => {}, () => {})
    return result
  }

  private withDataKey<T>(operation: (key: Buffer, keyId: string) => Promise<T>): Promise<T> {
    return this.serialize(async () => {
      if (this.requireDomain().global.get().rotation !== undefined) {
        await this.resumeDataKeyRotation()
      }
      const resolved = await this.resolveDataKey()
      try {
        return await operation(resolved.key, resolved.keyId)
      } finally {
        resolved.key.fill(0)
      }
    })
  }

  private async startDataKeyRotation(): Promise<void> {
    const domain = this.requireDomain()
    const current = await this.resolveDataKey()
    try {
      const [primaryInfo, stagingInfo] = await Promise.all([
        this.ctx.credentials.describe(this.options.dataKeyRef),
        this.ctx.credentials.describe(this.options.rotationKeyRef),
      ])
      if (!primaryInfo.writable || !stagingInfo.writable) {
        throw new MindGardenVaultError(
          'rotation-unavailable',
          'Mind Garden data-key rotation requires writable primary and staging credential references',
        )
      }
      const encodedNext = createMindGardenDataKey()
      const next = decodeMindGardenDataKey(encodedNext)
      try {
        const toKeyId = mindGardenDataKeyId(next)
        if (toKeyId === current.keyId) {
          throw new MindGardenVaultError('rotation-unavailable', 'Mind Garden generated a duplicate data key')
        }
        await this.ctx.credentials.set(this.options.rotationKeyRef, encodedNext)
        const staged = await this.resolveCredentialKey(this.options.rotationKeyRef)
        try {
          if (staged === undefined || staged.keyId !== toKeyId) {
            throw new MindGardenVaultError(
              'rotation-unavailable',
              'Mind Garden staging credential did not retain the generated data key',
            )
          }
        } finally {
          staged?.key.fill(0)
        }
        const state = domain.global.get()
        if (!state.initialized || state.keyId !== current.keyId || state.rotation !== undefined) {
          throw new MindGardenVaultError('corrupt-state', 'Mind Garden vault changed while rotation was starting')
        }
        await domain.global.set({
          ...state,
          rotation: {
            version: 1,
            fromKeyId: current.keyId,
            toKeyId,
            startedAt: Date.now(),
          },
        })
      } finally {
        next.fill(0)
      }
    } finally {
      current.key.fill(0)
    }
  }

  private async resumeDataKeyRotation(): Promise<MindGardenVaultRotationResult> {
    const domain = this.requireDomain()
    const state = domain.global.get()
    const rotation = state.rotation
    if (rotation === undefined) {
      throw new MindGardenVaultError('corrupt-state', 'Mind Garden vault has no data-key rotation to resume')
    }
    const envelopes = MIND_GARDEN_VAULT_COLLECTIONS.flatMap(collection =>
      [...domain.table(collection).entries()].map(([id, envelope]) => ({ collection, id, envelope })))
    const unknown = envelopes.find(({ envelope }) =>
      envelope.keyId !== rotation.fromKeyId && envelope.keyId !== rotation.toKeyId)
    if (unknown !== undefined) {
      throw new MindGardenVaultError('corrupt-state', 'Mind Garden vault rotation found an envelope from an unknown key')
    }
    const oldEnvelopeCount = envelopes.filter(({ envelope }) => envelope.keyId === rotation.fromKeyId).length
    let primary = await this.resolveCredentialKey(this.options.dataKeyRef)
    let staging: { key: Buffer; keyId: string } | undefined
    try {
      if (oldEnvelopeCount > 0 && primary?.keyId !== rotation.fromKeyId) {
        throw new MindGardenVaultError(
          'locked',
          'Mind Garden vault rotation cannot recover records without the previous primary key',
        )
      }
      if (primary?.keyId !== rotation.toKeyId) {
        staging = await this.resolveCredentialKey(this.options.rotationKeyRef)
        if (staging?.keyId !== rotation.toKeyId) {
          throw new MindGardenVaultError(
            'rotation-unavailable',
            'Mind Garden vault rotation staging key is unavailable or does not match its journal',
          )
        }
      }
      const next = primary?.keyId === rotation.toKeyId ? primary : staging
      if (next === undefined) {
        throw new MindGardenVaultError('rotation-unavailable', 'Mind Garden vault rotation has no recoverable next key')
      }
      for (const { collection, id, envelope } of envelopes) {
        if (envelope.keyId === rotation.toKeyId) {
          decryptMindGardenJson({
            key: next.key,
            keyId: rotation.toKeyId,
            collection,
            id,
            envelope,
            maxPlaintextBytes: this.options.maxPlaintextBytes,
          })
          continue
        }
        const previous = primary
        if (previous === undefined || previous.keyId !== rotation.fromKeyId) {
          throw new MindGardenVaultError('locked', 'Mind Garden vault rotation lost its previous key')
        }
        const value = decryptMindGardenJson({
          key: previous.key,
          keyId: rotation.fromKeyId,
          collection,
          id,
          envelope,
          maxPlaintextBytes: this.options.maxPlaintextBytes,
        })
        const reencrypted = encryptMindGardenJson({
          key: next.key,
          keyId: rotation.toKeyId,
          collection,
          id,
          value,
          now: envelope.updatedAt,
          previous: envelope,
          maxPlaintextBytes: this.options.maxPlaintextBytes,
        })
        await domain.table(collection).put(id, reencrypted)
      }
      if (primary?.keyId !== rotation.toKeyId) {
        const info = await this.ctx.credentials.describe(this.options.dataKeyRef)
        if (!info.writable) {
          throw new MindGardenVaultError('rotation-unavailable', 'Mind Garden primary data-key credential is not writable')
        }
        await this.ctx.credentials.set(this.options.dataKeyRef, next.key.toString('base64'))
        primary?.key.fill(0)
        primary = await this.resolveCredentialKey(this.options.dataKeyRef)
        if (primary?.keyId !== rotation.toKeyId) {
          throw new MindGardenVaultError(
            'rotation-unavailable',
            'Mind Garden primary credential did not retain the rotated data key',
          )
        }
      }
      const beforeSwitch = domain.global.get()
      if (beforeSwitch.rotation?.fromKeyId !== rotation.fromKeyId
        || beforeSwitch.rotation.toKeyId !== rotation.toKeyId) {
        throw new MindGardenVaultError('corrupt-state', 'Mind Garden vault rotation journal changed during recovery')
      }
      if (beforeSwitch.keyId !== rotation.toKeyId) {
        await domain.global.set({ ...beforeSwitch, keyId: rotation.toKeyId })
      }
      const stagingInfo = await this.ctx.credentials.describe(this.options.rotationKeyRef)
      if (!stagingInfo.writable) {
        throw new MindGardenVaultError('rotation-unavailable', 'Mind Garden staging credential cannot be cleaned up')
      }
      await this.ctx.credentials.unset(this.options.rotationKeyRef)
      const withRotation = domain.global.get()
      const { rotation: _completedRotation, ...completedState } = withRotation
      await domain.global.set(completedState)
      return {
        fromKeyId: rotation.fromKeyId,
        toKeyId: rotation.toKeyId,
        records: envelopes.length,
        startedAt: rotation.startedAt,
        completedAt: Date.now(),
      }
    } finally {
      primary?.key.fill(0)
      staging?.key.fill(0)
    }
  }

  private async resolveCredentialKey(
    ref: CredentialRef,
  ): Promise<{ key: Buffer; keyId: string } | undefined> {
    const resolved = await this.ctx.credentials.resolve(ref)
    if (resolved === undefined) return undefined
    const key = decodeMindGardenDataKey(resolved.value)
    return { key, keyId: mindGardenDataKeyId(key) }
  }

  private async resolveDataKey(): Promise<{ key: Buffer; keyId: string }> {
    const domain = this.requireDomain()
    let resolved = await this.ctx.credentials.resolve(this.options.dataKeyRef)
    if (resolved === undefined) {
      if (domain.global.get().initialized || !this.options.autoCreateKey) {
        throw new MindGardenVaultError('locked', `Mind Garden vault credential '${this.options.dataKeyRef}' is unavailable`)
      }
      const info = await this.ctx.credentials.describe(this.options.dataKeyRef)
      if (!info.writable) {
        throw new MindGardenVaultError('locked', `Mind Garden vault credential '${this.options.dataKeyRef}' is not writable`)
      }
      await this.ctx.credentials.set(this.options.dataKeyRef, createMindGardenDataKey())
      resolved = await this.ctx.credentials.resolve(this.options.dataKeyRef)
      if (resolved === undefined) {
        throw new MindGardenVaultError('locked', `Mind Garden vault credential '${this.options.dataKeyRef}' was not persisted`)
      }
    }
    const key = decodeMindGardenDataKey(resolved.value)
    const keyId = mindGardenDataKeyId(key)
    const state = domain.global.get()
    if (!state.initialized) {
      const records = this.recordCounts()
      if (records.memories + records.reflections + records.media + records.stars !== 0) {
        key.fill(0)
        throw new MindGardenVaultError('corrupt-state', 'Mind Garden vault contains records before key initialization')
      }
      await domain.global.set({
        version: 1,
        initialized: true,
        keyId,
        createdAt: Date.now(),
      })
    } else if (state.keyId !== keyId) {
      key.fill(0)
      throw new MindGardenVaultError('key-mismatch', 'Configured Mind Garden data key does not match this vault')
    }
    return { key, keyId }
  }

  private requireDomain(): Domain<typeof mindGardenVaultDomainSpec> {
    if (this.domain === undefined) throw new Error('Mind Garden vault is not initialized')
    return this.domain
  }
}

export default MindGardenVault
