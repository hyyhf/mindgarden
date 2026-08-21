import { describe, expect, it } from 'vitest'
import {
  decodeStoredRecord,
  storedAuditSchema,
  storedAutomationPolicySchema,
  storedAutomationStateSchema,
  storedExtractionRunSchema,
  storedMemorySchema,
} from '@deepseek-ai/dsh-mind-garden/memory'

const base = {
  recordType: 'memory' as const,
  formatVersion: 1 as const,
  id: '00000000-0000-4000-8000-000000000001',
  version: '10000000-0000-4000-8000-000000000001',
  status: 'candidate' as const,
  kind: 'fact' as const,
  sensitivity: 'normal' as const,
  content: 'The user starts work at nine.',
  reason: 'Scheduling context',
  recallPolicy: 'never' as const,
  sources: [{ sessionId: 'source' }],
  createdAt: 1,
  updatedAt: 1,
}

describe('Mind Garden memory plaintext codecs', () => {
  it('accepts valid memory and audit records through the discriminator', () => {
    expect(decodeStoredRecord(base)).toEqual(base)
    const audit = {
      recordType: 'retrieval-audit' as const,
      formatVersion: 1 as const,
      id: '20000000-0000-4000-8000-000000000001',
      sessionId: 'source',
      createdAt: 2,
      sentToModel: true,
      matches: [{ memoryId: base.id, reason: 'relevant' as const, score: 2 }],
    }
    expect(decodeStoredRecord(audit)).toEqual(audit)
  })

  it('rejects recallable candidates, high-sensitivity recall, and incoherent temporary records', () => {
    expect(storedMemorySchema.safeParse({ ...base, updatedAt: 0 }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      status: 'confirmed',
      recallPolicy: 'never',
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      relationship: {
        type: 'duplicate',
        targetMemoryId: '20000000-0000-4000-8000-000000000001',
        targetVersion: '30000000-0000-4000-8000-000000000001',
        rationale: 'same',
        status: 'resolved',
      },
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({ ...base, recallPolicy: 'always' }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      status: 'confirmed',
      sensitivity: 'high',
      recallPolicy: 'relevant',
      confirmedAt: 2,
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      status: 'temporary',
      confirmedAt: 2,
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      status: 'confirmed',
      confirmedAt: 2,
      expiresAt: 3,
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      sources: [{ sessionId: 'source', messageId: 'message-only' }],
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({ ...base, status: 'superseded' }).success).toBe(false)
    expect(storedMemorySchema.safeParse({ ...base, proposalOrigin: 'legacy-import' }).success).toBe(true)
    expect(storedMemorySchema.safeParse({
      ...base,
      supersededBy: '20000000-0000-4000-8000-000000000001',
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      proposalOrigin: 'model-extraction',
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      confidence: 0.8,
      importance: 0.9,
      extractionRunId: '30000000-0000-4000-8000-000000000001',
    }).success).toBe(false)
    expect(storedMemorySchema.safeParse({
      ...base,
      status: 'confirmed',
      confirmedAt: 2,
      relationship: {
        type: 'duplicate',
        targetMemoryId: '20000000-0000-4000-8000-000000000001',
        targetVersion: '30000000-0000-4000-8000-000000000001',
        rationale: 'same',
        status: 'pending',
      },
    }).success).toBe(false)
  })

  it('rejects unknown records and dishonest delivery audits', () => {
    expect(() => decodeStoredRecord({ recordType: 'unknown' })).toThrow('unknown Mind Garden memory record')
    expect(storedAuditSchema.safeParse({
      recordType: 'retrieval-audit',
      formatVersion: 1,
      id: '20000000-0000-4000-8000-000000000001',
      sessionId: 'source',
      createdAt: 2,
      sentToModel: false,
      matches: [{ memoryId: base.id, reason: 'always', score: 0 }],
    }).success).toBe(false)
  })

  it('validates recoverable extraction plans and their candidate ownership', () => {
    const extracted = {
      ...base,
      id: '40000000-0000-4000-8000-000000000001',
      proposalOrigin: 'model-extraction' as const,
      confidence: 0.8,
      importance: 0.9,
      extractionRunId: '30000000-0000-4000-8000-000000000001',
    }
    const run = {
      recordType: 'extraction-run' as const,
      formatVersion: 1 as const,
      id: extracted.extractionRunId,
      sessionId: 'source',
      status: 'committing' as const,
      provider: 'mock',
      model: 'mock',
      system: 'system',
      prompt: 'prompt',
      sourceMessageIds: ['message'],
      comparedMemoryIds: [],
      rawOutput: '{"memories":[]}',
      candidates: [extracted],
      createdAt: 1,
      updatedAt: 2,
    }
    expect(decodeStoredRecord(run)).toEqual(run)
    expect(storedExtractionRunSchema.safeParse({ ...run, status: 'running' }).success).toBe(false)
    expect(storedExtractionRunSchema.safeParse({ ...run, status: 'failed' }).success).toBe(false)
    expect(storedExtractionRunSchema.safeParse({
      ...run,
      candidates: [{ ...extracted, extractionRunId: '50000000-0000-4000-8000-000000000001' }],
    }).success).toBe(false)
    expect(storedExtractionRunSchema.safeParse({ ...run, updatedAt: 0 }).success).toBe(false)
    expect(storedExtractionRunSchema.safeParse({
      ...run,
      trigger: 'automatic',
    }).success).toBe(true)
    expect(storedExtractionRunSchema.safeParse({
      ...run,
      trigger: 'ambient',
    }).success).toBe(false)
    expect(storedExtractionRunSchema.safeParse({
      ...run,
      rawOutput: undefined,
    }).success).toBe(false)
    expect(storedExtractionRunSchema.safeParse({
      ...run,
      status: 'failed',
      failure: 'invalid-output',
      candidates: [],
    }).success).toBe(true)
  })

  it('validates independent automatic-extraction authorization and progress records', () => {
    const policy = {
      recordType: 'automation-policy' as const,
      formatVersion: 1 as const,
      id: '60000000-0000-4000-8000-000000000001',
      sessionId: 'source',
      version: '70000000-0000-4000-8000-000000000001',
      enabled: true,
      minimumCompletedTurns: 3 as const,
      updatedAt: 2,
    }
    const state = {
      recordType: 'automation-state' as const,
      formatVersion: 1 as const,
      id: '80000000-0000-4000-8000-000000000001',
      sessionId: 'source',
      lastAttemptedTurn: 4,
      lastAttemptAt: 2,
      lastOutcome: 'completed' as const,
      updatedAt: 3,
    }
    expect(decodeStoredRecord(policy)).toEqual(policy)
    expect(decodeStoredRecord(state)).toEqual(state)
    expect(storedAutomationPolicySchema.safeParse({ ...policy, minimumCompletedTurns: 2 }).success).toBe(false)
    expect(storedAutomationStateSchema.safeParse({
      ...state, lastAttemptAt: null,
    }).success).toBe(false)
    expect(storedAutomationStateSchema.safeParse({
      ...state, lastOutcome: null, lastAttemptAt: null,
    }).success).toBe(true)
    expect(storedAutomationStateSchema.safeParse({ ...state, updatedAt: 1 }).success).toBe(false)
  })
})
