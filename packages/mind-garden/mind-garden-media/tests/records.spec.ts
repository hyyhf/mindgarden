import { describe, expect, it } from 'vitest'
import {
  decodeStoredMediaRecord,
  defaultPhotoParticleConfig,
  mindGardenPhotoParticleConfigSchema,
  storedPhotoStorySchema,
} from '../src/index.ts'

const record = {
  recordType: 'photo-story' as const,
  formatVersion: 1 as const,
  id: '10000000-0000-4000-8000-000000000001',
  version: '20000000-0000-4000-8000-000000000002',
  attachment: {
    attachmentId: `sha256:${'a'.repeat(64)}`,
    mediaType: 'image/png' as const,
    bytes: 3,
    width: 2,
    height: 1,
    name: 'frame.png',
  },
  title: 'A frame',
  note: 'A private story',
  stamp: { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 },
  particleConfig: defaultPhotoParticleConfig(),
  createdAt: 100,
  updatedAt: 100,
}

describe('Mind Garden media codecs', () => {
  it('strictly decodes a complete encrypted photo-story record', () => {
    const decoded = decodeStoredMediaRecord(record)
    expect(decoded).toEqual({
      ...record,
      observation: null,
      turns: [],
      quickReplies: [],
      modelRuns: [],
    })
    expect(mindGardenPhotoParticleConfigSchema.parse(defaultPhotoParticleConfig())).toEqual(defaultPhotoParticleConfig())
    expect(Object.isFrozen(defaultPhotoParticleConfig().rendering)).toBe(true)
  })

  it('rejects malformed references, particle bounds, timestamps, and extra fields', () => {
    expect(() => decodeStoredMediaRecord({ ...record, unexpected: true })).toThrow()
    expect(() => decodeStoredMediaRecord({ ...record, attachment: { ...record.attachment, attachmentId: 'file' } })).toThrow()
    expect(() => decodeStoredMediaRecord({ ...record, updatedAt: 99 })).toThrow('updatedAt precedes createdAt')
    expect(() => storedPhotoStorySchema.parse({
      ...record,
      particleConfig: {
        ...record.particleConfig,
        rendering: { ...record.particleConfig.rendering, pointSize: 9 },
      },
    })).toThrow()
  })

  it('enforces observation, alternating-turn, and completed-audit relationships', () => {
    const observation = {
      id: '30000000-0000-4000-8000-000000000003',
      grounding: {
        visualSummary: 'A white cup is visible on a wooden table.',
        visibleElements: ['white cup', 'wooden table'],
        textInImage: [],
        uncertainDetails: ['the cup contents are not visible'],
        source: 'model-observation-unconfirmed' as const,
      },
      opening: 'A warm patch of light falls beside the white cup. What do you remember about it?',
      provider: 'vision',
      model: 'garden-eye',
      promptVersion: 'mind-garden-photo-observe-v1' as const,
      createdAt: 101,
    }
    const opening = {
      id: '40000000-0000-4000-8000-000000000004',
      role: 'assistant' as const,
      content: observation.opening,
      quickReplyKind: '' as const,
      createdAt: 101,
    }
    const completedRun = {
      id: '50000000-0000-4000-8000-000000000005',
      kind: 'observation' as const,
      storyVersion: record.version,
      status: 'completed' as const,
      failure: null,
      provider: 'vision',
      model: 'garden-eye',
      system: 'system',
      prompt: 'prompt',
      rawOutput: '{}',
      turnIds: [opening.id],
      createdAt: 101,
      updatedAt: 101,
    }
    const complete = { ...record, observation, turns: [opening], quickReplies: [], modelRuns: [completedRun] }
    expect(storedPhotoStorySchema.parse(complete)).toMatchObject(complete)
    expect(() => storedPhotoStorySchema.parse({ ...record, turns: [opening] }))
      .toThrow('photo dialogue exists without an observation')
    expect(() => storedPhotoStorySchema.parse({
      ...complete, turns: [{ ...opening, content: 'different opening' }],
    })).toThrow('photo observation opening differs from the first turn')
    expect(() => storedPhotoStorySchema.parse({
      ...complete, modelRuns: [{ ...completedRun, turnIds: ['60000000-0000-4000-8000-000000000006'] }],
    })).toThrow('photo model run references a missing turn')
  })
})
