/** Package-owned durable Mind Garden stream invariants. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import { applyMindGardenEvent } from './fold.ts'
import type { MindGardenSessionState } from './types.ts'

const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden-core'

/** Cordis companion plugin name. */
export const name = 'mind-garden-core-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** Apply one event through strict replay and attribute failures. */
function applyChecked(
  state: MindGardenSessionState | null,
  event: SessionEvent,
  fail: InvariantFailure,
): MindGardenSessionState | null {
  try {
    return applyMindGardenEvent(state, event)
  } catch (error) {
    /* v8 ignore next -- strict replay throws Error instances */
    const message = error instanceof Error ? error.message : String(error)
    fail(`session event ${event.seq} violates the durable Mind Garden stream: ${message}`)
  }
}

/** Install an independent incremental fold over every attached session. */
const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {
  const states = new WeakMap<Session, MindGardenSessionState | null>()
  const staged = new WeakMap<SessionEvent, { session: Session; state: MindGardenSessionState | null }>()

  const seed = (session: Session): MindGardenSessionState | null => {
    let state: MindGardenSessionState | null = null
    for (const event of session.events) state = applyChecked(state, event, fail)
    states.set(session, state)
    return state
  }
  /* v8 ignore next -- session/event always follows list() or session/created seeding */
  const stateFor = (session: Session): MindGardenSessionState | null => states.get(session) ?? seed(session)

  for (const session of ctx.sessions.list()) seed(session)
  ctx.on('session/created', (session) => { seed(session) }, { global: true })
  ctx.on('internal/dispatch', (_mode, eventName, args) => {
    if (eventName !== 'session/event') return
    const [session, event] = args as [Session, SessionEvent]
    staged.set(event, { session, state: applyChecked(stateFor(session), event, fail) })
  }, { global: true })
  ctx.on('session/event', (session, event) => {
    const candidate = staged.get(event)
    /* v8 ignore next 2 -- internal/dispatch stages the exact callback arguments */
    if (candidate === undefined || candidate.session !== session) {
      return fail('session/event reached publication without matching Mind Garden validation')
    }
    staged.delete(event)
    states.set(session, candidate.state)
  }, { global: true })
}, { inject: ['sessions'] })

/**
 * Register the Mind Garden stream invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
