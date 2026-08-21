import { describe, expect, it } from 'vitest'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import {
  relevanceScore,
  retrievalTerms,
  retrieveMemories,
  userQuery,
} from '@deepseek-ai/dsh-mind-garden/memory'
import type { StoredMemory } from '../src/records.ts'

let counter = 0

function memory(overrides: Partial<StoredMemory> = {}): StoredMemory {
  counter += 1
  const id = `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`
  return {
    recordType: 'memory',
    formatVersion: 1,
    id,
    version: `10000000-0000-4000-8000-${String(counter).padStart(12, '0')}`,
    status: 'confirmed',
    kind: 'preference',
    sensitivity: 'normal',
    content: 'I prefer a short walk when work feels overwhelming.',
    reason: 'Useful support preference',
    recallPolicy: 'relevant',
    sources: [{ sessionId: 'source' }],
    createdAt: counter,
    updatedAt: counter,
    confirmedAt: counter,
    ...overrides,
  }
}

describe('Mind Garden deterministic retrieval', () => {
  it('extracts only human text and handles English and CJK overlap', () => {
    const human = createUserMessage({
      content: [{ type: 'text', text: '工作压力让我 overwhelmed' }],
      source: { kind: 'user' },
    })
    const plugin = createUserMessage({
      content: [{ type: 'text', text: 'should not enter query' }],
      source: { kind: 'plugin', plugin: 'fixture' },
    })
    expect(userQuery([human, plugin])).toBe('工作压力让我 overwhelmed')
    const cjk = retrievalTerms('工作压力')
    expect([...['工作', '作压', '压力']].every(term => cjk.has(term))).toBe(true)
    expect(relevanceScore(retrievalTerms('overwhelmed at work'), memory())).toBeGreaterThan(0)
    expect(relevanceScore(retrievalTerms(''), memory())).toBe(0)
  })

  it('orders explicit always recall before relevance and excludes unsafe lifecycle states', () => {
    const relevant = memory({ updatedAt: 10 })
    const always = memory({ content: 'Use a gentle pace.', recallPolicy: 'always', updatedAt: 1 })
    const high = memory({ content: 'private', sensitivity: 'high', recallPolicy: 'never' })
    const candidate = memory({ status: 'candidate', confirmedAt: undefined, recallPolicy: 'never' })
    const expired = memory({
      status: 'temporary',
      expiresAt: 9,
      recallPolicy: 'always',
    })
    const recall = retrieveMemories({
      memories: [relevant, always, high, candidate, expired],
      query: 'work is overwhelming',
      now: 10,
      maxMemories: 5,
      maxBytes: 4096,
    })
    expect(recall?.matches.map(match => [match.memory.id, match.reason])).toEqual([
      [always.id, 'always'],
      [relevant.id, 'relevant'],
    ])
    expect(recall?.text).toContain('potentially outdated')
    expect(recall?.text).not.toContain('private')
  })

  it('keeps complete entries inside count and UTF-8 byte bounds', () => {
    const short = memory({ content: 'Short.', recallPolicy: 'always' })
    const long = memory({ content: '很长'.repeat(200), recallPolicy: 'always' })
    const baseline = retrieveMemories({
      memories: [short], query: '', now: 1, maxMemories: 1, maxBytes: 4096,
    })
    if (baseline === null) throw new Error('expected baseline recall')
    const bounded = retrieveMemories({
      memories: [short, long],
      query: '',
      now: 1,
      maxMemories: 2,
      maxBytes: Buffer.byteLength(baseline.text, 'utf8'),
    })
    expect(bounded?.matches).toHaveLength(1)
    expect(bounded?.text).toBe(baseline.text)
    expect(retrieveMemories({
      memories: [short], query: '', now: 1, maxMemories: 1, maxBytes: 1,
    })).toBeNull()
  })

  it('uses score, recency, and identity as deterministic relevance tie-breakers', () => {
    const highScore = memory({
      content: 'Work stress work.',
      scope: 'work',
      updatedAt: 1,
    })
    const recent = memory({ content: 'Work.', updatedAt: 20 })
    const olderHighId = memory({
      content: 'Work.',
      updatedAt: 10,
      id: 'f0000000-0000-4000-8000-000000000001',
    })
    const olderLowId = memory({
      content: 'Work.',
      updatedAt: 10,
      id: '00000000-0000-4000-8000-000000000001',
    })
    const unrelated = memory({ content: 'A quiet evening.' })
    const liveTemporary = memory({ status: 'temporary', content: 'A quiet pause.', expiresAt: 100 })
    const recall = retrieveMemories({
      memories: [olderHighId, unrelated, recent, liveTemporary, highScore, olderLowId],
      query: 'work stress',
      now: 50,
      maxMemories: 4,
      maxBytes: 4096,
    })
    expect(recall?.matches.map(match => match.memory.id)).toEqual([
      highScore.id,
      recent.id,
      olderLowId.id,
      olderHighId.id,
    ])
    expect(recall?.text).toContain('(scope: work)')
    expect(retrieveMemories({
      memories: [unrelated], query: 'xyzq', now: 50, maxMemories: 1, maxBytes: 4096,
    })).toBeNull()
  })

  it('stops selection as soon as the configured count is full', () => {
    const first = memory({ recallPolicy: 'always' })
    const second = memory({ recallPolicy: 'always' })
    expect(retrieveMemories({
      memories: [first, second], query: '', now: 1, maxMemories: 0, maxBytes: 4096,
    })).toBeNull()
  })
})
