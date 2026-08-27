/**
 * Deterministic input triage and pre-publication output guard for activated
 * Mind Garden sessions.
 * @module @deepseek-ai/dsh-mind-garden/safety
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import {
  BlockAssembler,
  isAgentLoopRequest,
  type StreamChunk,
  type TokenUsage,
  type UserMessage,
} from '@deepseek-ai/dsh-llm'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-mind-garden/core'
import { assessMindGardenInput, recoverMindGardenSafetyState } from './classifier.ts'
import {
  assessMindGardenOutput,
  renderMindGardenGuardReplacement,
  renderMindGardenSupportResponse,
} from './output-guard.ts'
import type {
  MindGardenOutputGuardReason,
  MindGardenOutputViolation,
  MindGardenSafetyAssessment,
  MindGardenSafetyAssessmentEvent,
} from './types.ts'

export type * from './types.ts'
export {
  mindGardenSafetyResources,
  MIND_GARDEN_RESOURCE_FALLBACK,
  MIND_GARDEN_RESOURCE_FALLBACK_EN,
} from './resources.ts'
export {
  assessMindGardenInput,
  detectMindGardenSafetyLocale,
  normalizeMindGardenSafetyText,
  recoverMindGardenSafetyState,
} from './classifier.ts'
export {
  assessMindGardenOutput,
  renderMindGardenGuardReplacement,
  renderMindGardenSupportResponse,
} from './output-guard.ts'

/** Cordis plugin name used by Loader diagnostics. */
export const name = 'mind-garden-safety'

/** Services needed to resolve exact live sessions and flush safety decisions. */
export const inject = ['agents', 'llm', 'mindGarden', 'sessions']

/** Deployment bounds for incremental model-output inspection. */
export interface Config {
  /** Maximum output tokens recorded for each activated Mind Garden conversation request. */
  maxModelOutputTokens?: number
  /** Maximum serialized characters inspected before fail-closed replacement. */
  maxBufferedCharacters?: number
  /** Maximum chunks inspected before fail-closed replacement. */
  maxBufferedChunks?: number
}

/** Schemastery validation for {@link Config}. */
export const Config: z<Config> = z.object({
  maxModelOutputTokens: z.number().default(4_096),
  maxBufferedCharacters: z.number().default(524_288),
  maxBufferedChunks: z.number().default(16_384),
})

interface ResolvedConfig {
  maxModelOutputTokens: number
  maxBufferedCharacters: number
  maxBufferedChunks: number
}

/** Resolve defaults and reject programmatic callers that bypass the schema. */
function resolveConfig(config: Config): ResolvedConfig {
  const maxModelOutputTokens = config.maxModelOutputTokens ?? 4_096
  const maxBufferedCharacters = config.maxBufferedCharacters ?? 524_288
  const maxBufferedChunks = config.maxBufferedChunks ?? 16_384
  if (!Number.isSafeInteger(maxModelOutputTokens) || maxModelOutputTokens < 1) {
    throw new Error('mind-garden-safety: maxModelOutputTokens must be a positive safe integer')
  }
  if (!Number.isSafeInteger(maxBufferedCharacters) || maxBufferedCharacters < 1) {
    throw new Error('mind-garden-safety: maxBufferedCharacters must be a positive safe integer')
  }
  if (!Number.isSafeInteger(maxBufferedChunks) || maxBufferedChunks < 1) {
    throw new Error('mind-garden-safety: maxBufferedChunks must be a positive safe integer')
  }
  return { maxModelOutputTokens, maxBufferedCharacters, maxBufferedChunks }
}

interface OpenStep {
  turn: number
  step: number
  startSeq: number
}

/**
 * Retained suffix that covers every bounded output-policy expression. A match
 * completes while its first character is still private, so rejected text
 * cannot reach the Session log through an earlier delta.
 */
const OUTPUT_GUARD_LOOKBEHIND_CHARACTERS = 64

/** Find the step whose request is currently entering `llm/stream`. */
function openStep(session: Session): OpenStep | undefined {
  for (let index = session.events.length - 1; index >= 0; index -= 1) {
    const event = session.events[index]
    if (event?.type === 'step/end') return undefined
    if (event?.type === 'step/start') {
      return { turn: event.data.turn, step: event.data.step, startSeq: event.seq }
    }
  }
  return undefined
}

/** Human messages entered after the current step boundary. */
function enteredHumanMessages(session: Session, step: OpenStep): UserMessage[] {
  return session.events.slice(step.startSeq + 1).flatMap((event): UserMessage[] =>
    event.type === 'user/message' && event.data.source.kind === 'user' ? [event.data] : [])
}

/** Concatenate only plain-text blocks from an entered human batch. */
function humanText(messages: readonly UserMessage[]): string {
  return messages.flatMap(message => message.content.flatMap(block => block.type === 'text' ? [block.text] : []))
    .join('\n')
}

/** Last recorded assessment before the current step's idempotent append. */
function latestAssessment(events: readonly SessionEvent[]): MindGardenSafetyAssessmentEvent | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type !== 'mind-garden/safety-assessment') continue
    return event.data
  }
  return undefined
}

/** Existing idempotent assessment for a retried request in this step. */
function stepAssessment(
  events: readonly SessionEvent[],
  step: Pick<OpenStep, 'turn' | 'step'>,
): MindGardenSafetyAssessmentEvent | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type !== 'mind-garden/safety-assessment') continue
    if (event.data.turn === step.turn && event.data.step === step.step) return event.data
  }
  return undefined
}

/** Create and append the assessment for a step's exact entered human batch. */
function assessStep(
  session: Session,
  step: OpenStep,
  messages: readonly UserMessage[],
): MindGardenSafetyAssessmentEvent {
  const existing = stepAssessment(session.events, step)
  if (existing !== undefined) return existing
  const text = humanText(messages)
  const previous = latestAssessment(session.events)?.assessment
  const assessment = recoverMindGardenSafetyState(assessMindGardenInput(text), previous, text)
  const data: MindGardenSafetyAssessmentEvent = {
    version: 1,
    turn: step.turn,
    step: step.step,
    inputMessageIds: messages.map(message => message.id),
    assessment,
    response: assessment.level > 0 ? 'local' : 'model-guarded',
  }
  session.append('mind-garden/safety-assessment', data)
  return data
}

/** Canonical successful text stream used for local and replacement responses. */
function textStream(text: string, usage?: TokenUsage, index = 0): StreamChunk[] {
  return [
    { type: 'block-start', index, blockType: 'text' },
    { type: 'text-delta', index, text },
    { type: 'block-end', index, block: { type: 'text', text } },
    ...usage === undefined ? [] : [{ type: 'usage' as const, usage }],
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

function guardedDeltaText(chunk: StreamChunk): string | undefined {
  return chunk.type === 'text-delta' || chunk.type === 'reasoning-delta' ? chunk.text : undefined
}

function replaceDeltaText(chunk: StreamChunk, text: string): StreamChunk {
  if (chunk.type === 'text-delta') return { ...chunk, text }
  if (chunk.type === 'reasoning-delta') return { ...chunk, text }
  throw new TypeError('mind-garden-safety: only text and reasoning deltas can be split')
}

function inspectedText(assembler: BlockAssembler): string {
  return assembler.interruptedBlocks().flatMap(block =>
    block.type === 'text' || block.type === 'reasoning' ? [block.text] : []).join('\n')
}

interface PublishedBlock {
  readonly type: 'text' | 'reasoning'
  text: string
  closed: boolean
}

function recordPublishedChunk(blocks: Map<number, PublishedBlock>, chunk: StreamChunk): void {
  if (chunk.type === 'block-start' && (chunk.blockType === 'text' || chunk.blockType === 'reasoning')) {
    if (!blocks.has(chunk.index)) blocks.set(chunk.index, { type: chunk.blockType, text: '', closed: false })
    return
  }
  if (chunk.type === 'text-delta' || chunk.type === 'reasoning-delta') {
    const type = chunk.type === 'text-delta' ? 'text' : 'reasoning'
    const block = blocks.get(chunk.index) ?? { type, text: '', closed: false }
    block.text += chunk.text
    blocks.set(chunk.index, block)
    return
  }
  if (chunk.type === 'block-end' && (chunk.block.type === 'text' || chunk.block.type === 'reasoning')) {
    blocks.set(chunk.index, { type: chunk.block.type, text: chunk.block.text, closed: true })
  }
}

function publishablePrefix(
  pending: StreamChunk[],
  pendingGuardedCharacters: number,
): { readonly chunks: StreamChunk[]; readonly pendingGuardedCharacters: number } {
  const chunks: StreamChunk[] = []
  let guardedCharacters = pendingGuardedCharacters
  let releasable = Math.max(0, guardedCharacters - OUTPUT_GUARD_LOOKBEHIND_CHARACTERS)
  while (pending.length > 0) {
    const chunk = pending[0]
    if (chunk === undefined) break
    const text = guardedDeltaText(chunk)
    if (text !== undefined) {
      if (releasable === 0) break
      const count = Math.min(text.length, releasable)
      const released = text.slice(0, count)
      const retained = text.slice(count)
      chunks.push(replaceDeltaText(chunk, released))
      guardedCharacters -= count
      releasable -= count
      if (retained.length === 0) pending.shift()
      else pending[0] = replaceDeltaText(chunk, retained)
      continue
    }
    if (chunk.type === 'tool-call-delta'
      || (chunk.type === 'block-start' && chunk.blockType === 'tool-call')) break
    if (chunk.type === 'block-start' && releasable === 0) break
    chunks.push(chunk)
    pending.shift()
  }
  return { chunks, pendingGuardedCharacters: guardedCharacters }
}

/** Append and flush the audit event before publishing its replacement chunks. */
async function recordOutputGuard(
  ctx: Context,
  agent: Agent,
  step: OpenStep,
  reason: MindGardenOutputGuardReason,
  violations: readonly MindGardenOutputViolation[],
): Promise<void> {
  agent.session.append('mind-garden/output-guarded', {
    version: 1,
    turn: step.turn,
    step: step.step,
    reason,
    violations,
  })
  await ctx.sessions.flush(agent.session)
}

/**
 * Inspect one downstream stream while retaining a policy-sized suffix. Safe
 * prefixes preserve provider chunk timing; a violation discards the private
 * suffix, closes published blocks, and appends a deterministic replacement.
 */
function guardedModelStream(
  ctx: Context,
  agent: Agent,
  step: OpenStep,
  assessment: MindGardenSafetyAssessment | undefined,
  next: () => AsyncIterable<StreamChunk>,
  config: ResolvedConfig,
  signal: AbortSignal | undefined,
): AsyncIterable<StreamChunk> {
  return (async function* (): AsyncIterable<StreamChunk> {
    const pending: StreamChunk[] = []
    const assembler = new BlockAssembler()
    const publishedBlocks = new Map<number, PublishedBlock>()
    let pendingGuardedCharacters = 0
    let characters = 0
    let chunkCount = 0
    let maxIndex = -1
    let usage: TokenUsage | undefined
    let guardReason: MindGardenOutputGuardReason | undefined
    let guardViolations: readonly MindGardenOutputViolation[] = []
    for await (const chunk of next()) {
      signal?.throwIfAborted()
      assembler.push(chunk)
      pending.push(chunk)
      const deltaText = guardedDeltaText(chunk)
      if (deltaText !== undefined) pendingGuardedCharacters += deltaText.length
      if ('index' in chunk) maxIndex = Math.max(maxIndex, chunk.index)
      if (chunk.type === 'usage') usage = chunk.usage
      chunkCount += 1
      characters += JSON.stringify(chunk).length
      if (chunkCount > config.maxBufferedChunks || characters > config.maxBufferedCharacters) {
        guardReason = 'buffer-limit'
        break
      }
      const violations = assessMindGardenOutput(inspectedText(assembler), assessment)
      if (violations.length > 0) {
        guardReason = 'policy-violation'
        guardViolations = violations
        break
      }
      const publishable = publishablePrefix(pending, pendingGuardedCharacters)
      pendingGuardedCharacters = publishable.pendingGuardedCharacters
      for (const released of publishable.chunks) {
        recordPublishedChunk(publishedBlocks, released)
        yield released
      }
    }
    signal?.throwIfAborted()
    if (guardReason !== undefined) {
      await recordOutputGuard(ctx, agent, step, guardReason, guardViolations)
      signal?.throwIfAborted()
      for (const [index, block] of publishedBlocks) {
        if (block.closed) continue
        yield { type: 'block-end', index, block: { type: block.type, text: block.text } }
      }
      yield* textStream(
        renderMindGardenGuardReplacement(guardReason, guardViolations, assessment?.locale),
        usage,
        maxIndex + 1,
      )
      return
    }
    for (const chunk of pending) {
      recordPublishedChunk(publishedBlocks, chunk)
      yield chunk
    }
  })()
}

/**
 * Install deterministic safety routing. Elevated entered-human input is
 * answered locally without constructing the downstream model stream. Ordinary
 * responses stream after a bounded private suffix passes policy checks.
 * @param ctx - plugin context carrying live Agent, Session, LLM, and Mind Garden services.
 * @param config - incremental inspection limits.
 */
export function apply(ctx: Context, config: Config): void {
  const resolved = resolveConfig(config)
  ctx.on('agent/request', async ({ agent }, next) => {
    const request = await next()
    if (ctx.mindGarden.current(agent.session) === null) return request
    const maxTokens = request.maxTokens === undefined
      ? resolved.maxModelOutputTokens
      : Math.min(request.maxTokens, resolved.maxModelOutputTokens)
    return request.maxTokens === maxTokens ? request : { ...request, maxTokens }
  })
  ctx.on('llm/stream', (options, next): AsyncIterable<StreamChunk> => {
    if (!isAgentLoopRequest(options) || options.sessionId === undefined) return next()
    const agent = ctx.agents.get(options.sessionId)
    if (agent === undefined || ctx.mindGarden.current(agent.session) === null) return next()
    const step = openStep(agent.session)
    if (step === undefined) return next()
    return (async function* (): AsyncIterable<StreamChunk> {
      const messages = enteredHumanMessages(agent.session, step)
      const assessmentEvent = messages.length === 0
        ? stepAssessment(agent.session.events, step)
        : assessStep(agent.session, step, messages)
      if (assessmentEvent !== undefined) await ctx.sessions.flush(agent.session)
      options.signal?.throwIfAborted()
      if (assessmentEvent !== undefined && assessmentEvent.assessment.level > 0) {
        yield* textStream(renderMindGardenSupportResponse(assessmentEvent.assessment))
        return
      }
      yield* guardedModelStream(
        ctx, agent, step, assessmentEvent?.assessment, next, resolved, options.signal,
      )
    })()
  })
}
