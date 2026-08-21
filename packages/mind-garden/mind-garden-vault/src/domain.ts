/** Durable ciphertext-only layout for the Mind Garden vault. */

import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'

/** Fixed private-data families. Table names are intentionally non-sensitive. */
export const MIND_GARDEN_VAULT_COLLECTIONS = ['memories', 'reflections', 'media', 'stars'] as const

/** A private-data family stored behind the shared encrypted-record boundary. */
export type MindGardenVaultCollection = typeof MIND_GARDEN_VAULT_COLLECTIONS[number]

/** Version-one AES-256-GCM envelope. Values contain ciphertext, never plaintext payloads. */
export interface MindGardenVaultEnvelope {
  readonly version: 1
  readonly algorithm: 'A256GCM'
  readonly keyId: string
  readonly nonce: string
  readonly ciphertext: string
  readonly createdAt: number
  readonly updatedAt: number
}

/** Durable non-secret intent that makes a multi-record data-key rotation replayable. */
export interface MindGardenVaultRotationState {
  readonly version: 1
  readonly fromKeyId: string
  readonly toKeyId: string
  readonly startedAt: number
}

/** Non-secret domain metadata binding every envelope to one data key. */
export interface MindGardenVaultState {
  readonly version: 1
  readonly initialized: boolean
  readonly keyId: string
  readonly createdAt: number
  readonly rotation?: MindGardenVaultRotationState | undefined
}

const envelopeSchema: z.ZodType<MindGardenVaultEnvelope> = z.object({
  version: z.literal(1),
  algorithm: z.literal('A256GCM'),
  keyId: z.string(),
  nonce: z.string(),
  ciphertext: z.string(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
}).strict()

const rotationSchema: z.ZodType<MindGardenVaultRotationState> = z.object({
  version: z.literal(1),
  fromKeyId: z.string(),
  toKeyId: z.string(),
  startedAt: z.number().int().nonnegative(),
}).strict()

const stateSchema: z.ZodType<MindGardenVaultState> = z.object({
  version: z.literal(1),
  initialized: z.boolean(),
  keyId: z.string(),
  createdAt: z.number().int().nonnegative(),
  rotation: rotationSchema.optional(),
}).strict()

const initialState: MindGardenVaultState = {
  version: 1,
  initialized: false,
  keyId: '',
  createdAt: 0,
}

/** Storage-domain declaration shared by runtime and persistence validation. */
export const mindGardenVaultDomainSpec = defineDomain({
  name: 'mind_garden_vault',
  version: 2,
  global: {
    schema: stateSchema,
    initial: initialState,
  },
  tables: {
    memories: domainTable<string, MindGardenVaultEnvelope>(envelopeSchema),
    reflections: domainTable<string, MindGardenVaultEnvelope>(envelopeSchema),
    media: domainTable<string, MindGardenVaultEnvelope>(envelopeSchema),
    stars: domainTable<string, MindGardenVaultEnvelope>(envelopeSchema),
  },
})
