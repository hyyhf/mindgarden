/** Package-owned safety-event invariants. @module @deepseek-ai/dsh-mind-garden-safety/invariant */

import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent, UserMessage } from '@deepseek-ai/dsh-session'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import { foldMindGarden } from '@deepseek-ai/dsh-mind-garden-core'
import { assessMindGardenInput, recoverMindGardenSafetyState } from './classifier.ts'
import type {
  MindGardenOutputViolation,
  MindGardenSafetyAssessmentEvent,
} from './types.ts'

const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden-safety'
const OUTPUT_VIOLATIONS: ReadonlySet<string> = new Set<MindGardenOutputViolation>([
  'exclusive-dependence',
  'diagnosis',
  'medication-direction',
  'forced-life-decision',
  'trauma-exposure',
  'delusion-confirmation',
  'user-blame',
  'risk-deflection',
])

/** Cordis companion plugin name. */
export const name = 'mind-garden-safety-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

interface OpenStep {
  turn: number
  step: number
  startSeq: number
}

/** Resolve the open step at one precommit history boundary. */
function openStep(history: readonly SessionEvent[]): OpenStep | undefined {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const event = history[index]
    if (event?.type === 'step/end') return undefined
    if (event?.type === 'step/start') {
      return { turn: event.data.turn, step: event.data.step, startSeq: event.seq }
    }
  }
  return undefined
}

/** Extract the human messages owned by one open step. */
function enteredHumanMessages(history: readonly SessionEvent[], step: OpenStep): UserMessage[] {
  return history.slice(step.startSeq + 1).flatMap((event): UserMessage[] =>
    event.type === 'user/message' && event.data.source.kind === 'user' ? [event.data] : [])
}

/** Join the same text blocks the runtime classifier consumes. */
function humanText(messages: readonly UserMessage[]): string {
  return messages.flatMap(message => message.content.flatMap(block => block.type === 'text' ? [block.text] : []))
    .join('\n')
}

/** Find the prior assessment record at one history boundary. */
function previousAssessment(history: readonly SessionEvent[]): MindGardenSafetyAssessmentEvent | undefined {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const event = history[index]
    if (event?.type === 'mind-garden/safety-assessment') return event.data
  }
  return undefined
}

/** Compare lossless JSON values whose creation order is fixed by this package. */
function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

/** Validate an assessment against exact entered messages and prior state. */
function validateAssessment(
  history: readonly SessionEvent[],
  data: MindGardenSafetyAssessmentEvent,
  fail: InvariantFailure,
): void {
  if (foldMindGarden(history) === null) fail('Mind Garden safety assessment requires an activated session')
  const step = openStep(history)
  if (step === undefined || step.turn !== data.turn || step.step !== data.step) {
    fail('Mind Garden safety assessment must belong to the open step')
  }
  const messages = enteredHumanMessages(history, step)
  if (messages.length === 0 || !sameJson(messages.map(message => message.id), data.inputMessageIds)) {
    fail('Mind Garden safety assessment must cite the exact entered human messages')
  }
  const text = humanText(messages)
  const expected = recoverMindGardenSafetyState(
    assessMindGardenInput(text), previousAssessment(history)?.assessment, text,
  )
  const version: unknown = data.version
  if (version !== 1 || !sameJson(data.assessment, expected)) {
    fail('Mind Garden safety assessment must equal the deterministic classifier result')
  }
  const response = data.assessment.level > 0 ? 'local' : 'model-guarded'
  if (data.response !== response) fail('Mind Garden safety response route must match its intervention level')
}

/** Validate structural ownership of one output-guard record. */
function validateOutputGuard(
  history: readonly SessionEvent[],
  event: SessionEvent<'mind-garden/output-guarded'>,
  fail: InvariantFailure,
): void {
  if (foldMindGarden(history) === null) fail('Mind Garden output guard requires an activated session')
  const step = openStep(history)
  if (step === undefined || step.turn !== event.data.turn || step.step !== event.data.step) {
    fail('Mind Garden output guard must belong to the open step')
  }
  const assessment = previousAssessment(history)
  if (assessment === undefined || assessment.turn !== step.turn || assessment.response !== 'model-guarded') {
    fail('Mind Garden output guard requires the current turn to have a model-guarded assessment')
  }
  const version: unknown = event.data.version
  const reason: unknown = event.data.reason
  const violations: readonly unknown[] = event.data.violations
  if (version !== 1
    || (reason !== 'policy-violation' && reason !== 'buffer-limit')
    || (reason === 'policy-violation' && violations.length === 0)
    || (reason === 'buffer-limit' && violations.length !== 0)
    || new Set(violations).size !== violations.length
    || violations.some(violation => typeof violation !== 'string' || !OUTPUT_VIOLATIONS.has(violation))) {
    fail('Mind Garden output guard must carry a valid reason and violation set')
  }
}

/** Validate all package-owned records in one session. */
function validateSession(session: Session, fail: InvariantFailure): void {
  for (const [index, event] of session.events.entries()) {
    const history = session.events.slice(0, index)
    if (event.type === 'mind-garden/safety-assessment') validateAssessment(history, event.data, fail)
    if (event.type === 'mind-garden/output-guarded') validateOutputGuard(history, event, fail)
  }
}

/** Install loaded-session and precommit validation. */
const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {
  for (const session of ctx.sessions.list()) validateSession(session, fail)
  ctx.on('session/created', (session) => { validateSession(session, fail) }, { global: true })
  ctx.on('internal/dispatch', (_mode, eventName, args) => {
    if (eventName !== 'session/event') return
    const [session, event] = args as [Session, SessionEvent]
    if (event.type === 'mind-garden/safety-assessment') validateAssessment(session.events, event.data, fail)
    if (event.type === 'mind-garden/output-guarded') validateOutputGuard(session.events, event, fail)
  }, { global: true })
}, { inject: ['sessions'] })

/** Register the invariant installer. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
