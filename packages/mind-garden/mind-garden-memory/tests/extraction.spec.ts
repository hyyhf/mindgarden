import { describe, expect, it } from 'vitest'
import { createAssistantMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import {
  buildExtractionEnvelope,
  decodeExtractionOutput,
  EXTRACTION_SYSTEM_PROMPT,
} from '@deepseek-ai/dsh-mind-garden/memory'

describe('Mind Garden governed extraction codec', () => {
  it('selects newest complete human/model text and excludes plugin context', () => {
    const old = createUserMessage({
      content: [{ type: 'text', text: 'old human statement' }],
      source: { kind: 'user' },
    })
    const plugin = createUserMessage({
      content: [{ type: 'text', text: 'hidden plugin instruction' }],
      source: { kind: 'plugin', plugin: 'fixture' },
    })
    const assistant = createAssistantMessage({
      content: [{ type: 'text', text: 'model reply' }],
      source: { provider: 'mock', model: 'mock' },
    })
    const recent = createUserMessage({
      content: [
        { type: 'text', text: 'recent human statement' },
        {
          type: 'image',
          attachment: {
            attachmentId: 'image' as never,
            mediaType: 'image/png',
            bytes: 1,
            width: 1,
            height: 1,
          },
        },
      ],
      source: { kind: 'user' },
    })
    const blank = createUserMessage({ content: [{ type: 'text', text: ' ' }], source: { kind: 'user' } })
    const memory = {
      id: '00000000-0000-4000-8000-000000000001' as never,
      version: '10000000-0000-4000-8000-000000000001' as never,
      kind: 'fact' as const,
      content: 'Existing active memory',
    }
    const recentOnlyBytes = Buffer.byteLength(JSON.stringify([{
      id: recent.id, role: recent.role, text: 'recent human statement',
    }]), 'utf8')
    const envelope = buildExtractionEnvelope(
      [old, plugin, blank, assistant, recent],
      [{ ...memory, id: '00000000-0000-4000-8000-000000000002' as never, content: 'x'.repeat(500) }, memory],
      recentOnlyBytes,
      Buffer.byteLength(JSON.stringify([memory]), 'utf8'),
      3,
    )
    expect(envelope.transcript).toEqual([{ id: recent.id, role: 'user', text: 'recent human statement' }])
    expect(envelope.memories).toEqual([memory])
    expect(envelope.prompt).not.toContain('hidden plugin instruction')
    expect(JSON.parse(envelope.prompt)).toMatchObject({ maxCandidates: 3 })
    expect(envelope.system).toBe(EXTRACTION_SYSTEM_PROMPT)
    expect(envelope.hadHumanText).toBe(true)
  })

  it('distinguishes missing human text from a bound that fits no human row', () => {
    const assistant = createAssistantMessage({
      content: [{ type: 'text', text: 'model only' }],
      source: { provider: 'mock', model: 'mock' },
    })
    expect(buildExtractionEnvelope([assistant], [], 1024, 1024, 3)).toMatchObject({
      hadHumanText: false,
      transcript: [{ role: 'assistant' }],
    })
    const human = createUserMessage({
      content: [{ type: 'text', text: 'too large for one byte' }],
      source: { kind: 'user' },
    })
    expect(buildExtractionEnvelope([human], [], 1, 1, 3)).toMatchObject({
      hadHumanText: true,
      transcript: [],
      memories: [],
    })
  })

  it('accepts exact and fenced JSON while rejecting prose and invalid envelopes', () => {
    const valid = {
      kind: 'preference',
      content: 'I prefer a short pause before advice.',
      reason: 'Useful support preference.',
      sourceMessageId: 'message-1',
      evidenceQuote: 'short pause',
      confidence: 0.9,
      importance: 0.8,
      relationship: {
        type: 'refinement',
        targetMemoryId: '00000000-0000-4000-8000-000000000001',
        rationale: 'Adds a timing boundary.',
      },
    }
    expect(decodeExtractionOutput(JSON.stringify({ memories: [valid] }))).toEqual([valid])
    expect(decodeExtractionOutput(`\`\`\`json\n${JSON.stringify({ memories: [] })}\n\`\`\``)).toEqual([])
    expect(decodeExtractionOutput(`prose ${JSON.stringify({ memories: [] })}`)).toBeNull()
    expect(decodeExtractionOutput(JSON.stringify({ memories: [{ nope: true }] }))).toBeNull()
    expect(decodeExtractionOutput(JSON.stringify({ memories: [valid, { nope: true }] }))).toEqual([valid])
    expect(decodeExtractionOutput(JSON.stringify({ memories: Array.from({ length: 9 }, () => valid) }))).toBeNull()
    expect(decodeExtractionOutput('{')).toBeNull()
  })
})
