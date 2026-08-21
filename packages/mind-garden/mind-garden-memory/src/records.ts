/** Authenticated plaintext record codecs behind the Mind Garden vault boundary. */

import { z } from 'zod'

const kindSchema = z.enum([
  'fact',
  'preference',
  'value',
  'support-preference',
  'decision',
  'emotion',
  'episode',
])
const sensitivitySchema = z.enum(['normal', 'high'])
const recallPolicySchema = z.enum(['never', 'relevant', 'always'])
const storedStatusSchema = z.enum(['candidate', 'confirmed', 'temporary', 'rejected', 'superseded'])
const sourceSchema = z.object({
  sessionId: z.string().min(1),
  messageId: z.string().min(1).optional(),
  evidenceQuote: z.string().min(1).optional(),
}).strict().refine(source => (source.messageId === undefined) === (source.evidenceQuote === undefined))

const relationshipSchema = z.object({
  type: z.enum(['duplicate', 'contradiction', 'refinement']),
  targetMemoryId: z.uuid(),
  targetVersion: z.uuid(),
  rationale: z.string().min(1),
  status: z.enum(['pending', 'resolved']),
  resolution: z.enum(['keep-existing', 'keep-both', 'replace-existing']).optional(),
}).strict().superRefine((relationship, context) => {
  if ((relationship.status === 'resolved') !== (relationship.resolution !== undefined)) {
    context.addIssue({ code: 'custom', message: 'relationship resolution does not match status' })
  }
})

const revisionSchema = z.object({
  id: z.uuid(),
  action: z.enum(['confirmed', 'updated', 'rejected', 'superseded', 'replaced']),
  status: storedStatusSchema,
  kind: kindSchema,
  sensitivity: sensitivitySchema,
  content: z.string().min(1),
  reason: z.string().min(1),
  scope: z.string().min(1).optional(),
  recallPolicy: recallPolicySchema,
  sources: z.array(sourceSchema).min(1),
  createdAt: z.number().int().nonnegative(),
  relatedMemoryId: z.uuid().optional(),
}).strict()

/** Version-one encrypted memory payload. */
export const storedMemorySchema = z.object({
  recordType: z.literal('memory'),
  formatVersion: z.literal(1),
  id: z.uuid(),
  version: z.uuid(),
  status: storedStatusSchema,
  kind: kindSchema,
  sensitivity: sensitivitySchema,
  content: z.string().min(1),
  reason: z.string().min(1),
  scope: z.string().min(1).optional(),
  recallPolicy: recallPolicySchema,
  sources: z.array(sourceSchema).min(1),
  proposalOrigin: z.enum(['human', 'model-extraction', 'legacy-import']).optional(),
  confidence: z.number().min(0).max(1).optional(),
  importance: z.number().min(0).max(1).optional(),
  extractionRunId: z.uuid().optional(),
  relationship: relationshipSchema.optional(),
  supersededBy: z.uuid().optional(),
  revisions: z.array(revisionSchema).optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  confirmedAt: z.number().int().nonnegative().optional(),
  expiresAt: z.number().int().nonnegative().optional(),
}).strict().superRefine((record, context) => {
  if (record.updatedAt < record.createdAt) {
    context.addIssue({ code: 'custom', message: 'updatedAt precedes createdAt' })
  }
  const accepted = record.status === 'confirmed' || record.status === 'temporary'
  if (accepted !== (record.confirmedAt !== undefined)) {
    context.addIssue({ code: 'custom', message: 'confirmation time does not match status' })
  }
  if ((record.status === 'temporary') !== (record.expiresAt !== undefined)) {
    context.addIssue({ code: 'custom', message: 'expiry does not match temporary status' })
  }
  if (!accepted && record.recallPolicy !== 'never') {
    context.addIssue({ code: 'custom', message: 'unconfirmed memory is recallable' })
  }
  if (record.sensitivity === 'high' && record.recallPolicy !== 'never') {
    context.addIssue({ code: 'custom', message: 'high-sensitivity memory is recallable' })
  }
  if ((record.status === 'superseded') !== (record.supersededBy !== undefined)) {
    context.addIssue({ code: 'custom', message: 'superseded target does not match status' })
  }
  if (record.proposalOrigin === 'model-extraction') {
    if (record.confidence === undefined || record.importance === undefined || record.extractionRunId === undefined) {
      context.addIssue({ code: 'custom', message: 'extracted memory lacks extraction metadata' })
    }
  } else if (record.confidence !== undefined || record.importance !== undefined || record.extractionRunId !== undefined) {
    context.addIssue({ code: 'custom', message: 'human memory carries extraction metadata' })
  }
  if (record.relationship?.status === 'pending' && record.status !== 'candidate') {
    context.addIssue({ code: 'custom', message: 'pending relationship belongs to a candidate' })
  }
})

/** Version-one encrypted retrieval-audit payload. */
export const storedAuditSchema = z.object({
  recordType: z.literal('retrieval-audit'),
  formatVersion: z.literal(1),
  id: z.uuid(),
  sessionId: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
  sentToModel: z.boolean(),
  matches: z.array(z.object({
    memoryId: z.uuid(),
    reason: z.enum(['always', 'relevant']),
    score: z.number().int().nonnegative(),
  }).strict()),
}).strict().superRefine((audit, context) => {
  if (audit.sentToModel !== (audit.matches.length > 0)) {
    context.addIssue({ code: 'custom', message: 'audit delivery flag does not match selected memories' })
  }
})

/** Version-one encrypted model-assisted extraction request and commit plan. */
export const storedExtractionRunSchema = z.object({
  recordType: z.literal('extraction-run'),
  formatVersion: z.literal(1),
  id: z.uuid(),
  sessionId: z.string().min(1),
  trigger: z.enum(['manual', 'automatic']).optional(),
  status: z.enum(['running', 'committing', 'completed', 'failed']),
  provider: z.string().min(1),
  model: z.string().min(1),
  system: z.string().min(1),
  prompt: z.string().min(1),
  sourceMessageIds: z.array(z.string().min(1)),
  comparedMemoryIds: z.array(z.uuid()),
  rawOutput: z.string().optional(),
  candidates: z.array(storedMemorySchema),
  failure: z.enum(['interrupted', 'model-failed', 'invalid-output']).optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((run, context) => {
  if (run.updatedAt < run.createdAt) {
    context.addIssue({ code: 'custom', message: 'extraction updatedAt precedes createdAt' })
  }
  if ((run.status === 'failed') !== (run.failure !== undefined)) {
    context.addIssue({ code: 'custom', message: 'extraction failure does not match status' })
  }
  if (run.status === 'running' && (run.rawOutput !== undefined || run.candidates.length > 0)) {
    context.addIssue({ code: 'custom', message: 'running extraction carries an output plan' })
  }
  if ((run.status === 'committing' || run.status === 'completed') && run.rawOutput === undefined) {
    context.addIssue({ code: 'custom', message: 'settled extraction lacks raw output' })
  }
  for (const candidate of run.candidates) {
    if (candidate.status !== 'candidate'
      || candidate.proposalOrigin !== 'model-extraction'
      || candidate.extractionRunId !== run.id) {
      context.addIssue({ code: 'custom', message: 'extraction plan contains an unrelated candidate' })
    }
  }
})

/** Version-one encrypted per-Session authorization for automatic extraction. */
export const storedAutomationPolicySchema = z.object({
  recordType: z.literal('automation-policy'),
  formatVersion: z.literal(1),
  id: z.uuid(),
  sessionId: z.string().min(1),
  version: z.uuid(),
  enabled: z.boolean(),
  minimumCompletedTurns: z.union([z.literal(1), z.literal(3), z.literal(5)]),
  updatedAt: z.number().int().nonnegative(),
}).strict()

/** Version-one encrypted progress for one Session's authorized automation. */
export const storedAutomationStateSchema = z.object({
  recordType: z.literal('automation-state'),
  formatVersion: z.literal(1),
  id: z.uuid(),
  sessionId: z.string().min(1),
  lastAttemptedTurn: z.number().int().nonnegative(),
  lastAttemptAt: z.number().int().nonnegative().nullable(),
  lastOutcome: z.enum(['running', 'completed', 'failed']).nullable(),
  updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((state, context) => {
  if ((state.lastAttemptAt === null) !== (state.lastOutcome === null)) {
    context.addIssue({ code: 'custom', message: 'automation outcome does not match attempt time' })
  }
  if (state.lastAttemptAt !== null && state.updatedAt < state.lastAttemptAt) {
    context.addIssue({ code: 'custom', message: 'automation updatedAt precedes lastAttemptAt' })
  }
})

/** Authenticated plaintext for one encrypted memory record. */
export type StoredMemory = z.infer<typeof storedMemorySchema>
/** Authenticated plaintext for one encrypted retrieval audit. */
export type StoredAudit = z.infer<typeof storedAuditSchema>
/** Authenticated plaintext for one encrypted extraction run. */
export type StoredExtractionRun = z.infer<typeof storedExtractionRunSchema>
/** Authenticated plaintext for one automatic-extraction authorization. */
export type StoredAutomationPolicy = z.infer<typeof storedAutomationPolicySchema>
/** Authenticated plaintext for one automatic-extraction progress cursor. */
export type StoredAutomationState = z.infer<typeof storedAutomationStateSchema>
/** Complete version-one plaintext vocabulary accepted from the vault. */
export type StoredMindGardenMemoryRecord =
  | StoredMemory
  | StoredAudit
  | StoredExtractionRun
  | StoredAutomationPolicy
  | StoredAutomationState

/**
 * Decode one authenticated plaintext record without trusting its producer.
 * @param value - Plaintext returned after vault authentication.
 * @returns A strictly validated memory, retrieval audit, extraction run, or automation record.
 */
export function decodeStoredRecord(value: unknown): StoredMindGardenMemoryRecord {
  const discriminator = z.looseObject({ recordType: z.string() }).parse(value).recordType
  if (discriminator === 'memory') return storedMemorySchema.parse(value)
  if (discriminator === 'retrieval-audit') return storedAuditSchema.parse(value)
  if (discriminator === 'extraction-run') return storedExtractionRunSchema.parse(value)
  if (discriminator === 'automation-policy') return storedAutomationPolicySchema.parse(value)
  if (discriminator === 'automation-state') return storedAutomationStateSchema.parse(value)
  throw new TypeError(`unknown Mind Garden memory record type '${discriminator}'`)
}
