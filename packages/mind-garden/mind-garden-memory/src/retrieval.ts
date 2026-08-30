/** Deterministic bounded retrieval for confirmed Mind Garden memories. */

import { Buffer } from 'node:buffer'
import type { UserMessage } from '@deepseek-ai/dsh-llm'
import type { StoredMemory } from './records.ts'

/** One selected record and the explanation persisted in its audit. */
export interface RetrievedMemory {
  readonly memory: StoredMemory
  readonly reason: 'always' | 'relevant'
  readonly score: number
}

/** Complete model-facing recall result. */
export interface MemoryRecall {
  readonly text: string
  readonly matches: readonly RetrievedMemory[]
}

const HEADER = [
  'Mind Garden recalled memories (explicitly confirmed by the user).',
  'Treat every memory as scoped, potentially outdated, and easy for the user to correct. The current user message and any explicit correction outrank these memories.',
  'A [support-preference] entry guides response style only. Follow a more recent turn-local request instead, and do not present any memory as a diagnosis or fixed personality trait.',
].join('\n')

/**
 * Extract only human-authored text from the entering batch.
 * @param messages - Proposed user-role messages entering the Agent step.
 * @returns Human-source text joined in message and block order.
 */
export function userQuery(messages: readonly UserMessage[]): string {
  return messages
    .filter(message => message.source.kind === 'user')
    .flatMap(message => message.content)
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
}

/**
 * Build normalized words and Unicode grapheme bigrams for multilingual matching.
 * @param value - Free text to normalize and segment.
 * @returns Unique normalized tokens and adjacent-grapheme terms.
 */
export function retrievalTerms(value: string): ReadonlySet<string> {
  const terms = new Set<string>()
  for (const match of value.normalize('NFKC').toLocaleLowerCase('en-US').matchAll(/[\p{L}\p{N}]+/gu)) {
    const token = match[0]
    terms.add(token)
    const points = Array.from(
      new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(token),
      segment => segment.segment,
    )
    for (let index = 0; index + 1 < points.length; index += 1) {
      terms.add(`${points[index]}${points[index + 1]}`)
    }
  }
  return terms
}

/**
 * Count unique query terms present in the memory's model-relevant fields.
 * @param queryTerms - Normalized terms extracted from human input.
 * @param memory - Confirmed plaintext memory considered for recall.
 * @returns The number of distinct query terms shared by the memory.
 */
export function relevanceScore(queryTerms: ReadonlySet<string>, memory: StoredMemory): number {
  if (queryTerms.size === 0) return 0
  const memoryTerms = retrievalTerms([
    memory.kind,
    memory.content,
    memory.scope ?? '',
  ].join('\n'))
  let score = 0
  for (const term of queryTerms) if (memoryTerms.has(term)) score += 1
  return score
}

function lineFor(memory: StoredMemory): string {
  return `- [memory-id:${memory.id}] [${memory.kind}] ${memory.content}${memory.scope === undefined ? '' : ` (scope: ${memory.scope})`}`
}

/**
 * Select eligible records in stable relevance order and fit complete entries
 * within both configured count and UTF-8 bounds.
 * @param options - Validated memories, query, clock, and complete-output bounds.
 * @returns A complete bounded recall, or null when no eligible entry fits.
 */
export function retrieveMemories(options: {
  readonly memories: readonly StoredMemory[]
  readonly query: string
  readonly now: number
  readonly maxMemories: number
  readonly maxBytes: number
}): MemoryRecall | null {
  const terms = retrievalTerms(options.query)
  const candidates = options.memories.flatMap((memory): RetrievedMemory[] => {
    if (memory.status !== 'confirmed' && memory.status !== 'temporary') return []
    const expiresAt = memory.expiresAt as number
    if (memory.status === 'temporary' && expiresAt <= options.now) return []
    if (memory.recallPolicy === 'never' || memory.sensitivity === 'high') return []
    if (memory.recallPolicy === 'always') return [{ memory, reason: 'always', score: 0 }]
    const score = relevanceScore(terms, memory)
    if (score === 0 && memory.kind === 'support-preference' && memory.scope === undefined) {
      return [{ memory, reason: 'relevant', score: 1 }]
    }
    return score === 0 ? [] : [{ memory, reason: 'relevant', score }]
  }).sort((left, right) => {
    const policy = Number(right.reason === 'always') - Number(left.reason === 'always')
    if (policy !== 0) return policy
    const supportPreference = Number(right.memory.kind === 'support-preference')
      - Number(left.memory.kind === 'support-preference')
    if (supportPreference !== 0) return supportPreference
    if (right.score !== left.score) return right.score - left.score
    if (right.memory.updatedAt !== left.memory.updatedAt) return right.memory.updatedAt - left.memory.updatedAt
    return left.memory.id.localeCompare(right.memory.id)
  })

  const selected: RetrievedMemory[] = []
  let text = HEADER
  for (const candidate of candidates) {
    if (selected.length >= options.maxMemories) break
    const next = `${text}\n${lineFor(candidate.memory)}`
    if (Buffer.byteLength(next, 'utf8') > options.maxBytes) continue
    selected.push(candidate)
    text = next
  }
  return selected.length === 0 ? null : { text, matches: selected }
}
