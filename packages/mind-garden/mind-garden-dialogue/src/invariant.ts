/** Package-owned invariants for Mind Garden dialogue snapshots. @module @deepseek-ai/dsh-mind-garden/dialogue/invariant */

import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import { foldMindGarden } from '@deepseek-ai/dsh-mind-garden/core'
import { name as sourceName, renderMindGardenDialoguePolicy } from './index.ts'

const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/dialogue'

/** Cordis companion plugin name. */
export const name = 'mind-garden-dialogue-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** Validate one package-owned snapshot against the preceding durable state. */
function validateSnapshot(
  history: readonly SessionEvent[],
  event: SessionEvent<'user/message'>,
  fail: InvariantFailure,
): void {
  const state = foldMindGarden(history)
  if (state === null) fail('Mind Garden dialogue snapshot requires an activated session')
  if (!state.modelDisclosureAccepted) fail('Mind Garden dialogue snapshot requires accepted model disclosure')
  const expected = renderMindGardenDialoguePolicy(state)
  const source = event.data.source
  const block = event.data.content[0]
  const sections: unknown = 'sections' in source ? source.sections : undefined
  const section: unknown = Array.isArray(sections) ? sections[0] : undefined
  if (event.data.content.length !== 1
    || block?.type !== 'text'
    || block.text !== expected
    || source.kind !== 'plugin'
    || source.plugin !== sourceName
    || source.form !== 'snapshot'
    || !Array.isArray(sections)
    || sections.length !== 1
    || typeof section !== 'object'
    || section === null
    || (section as { name?: unknown }).name !== sourceName
    || (section as { text?: unknown }).text !== expected) {
    fail('Mind Garden dialogue message must carry the exact sourced policy snapshot')
  }
}

/** Validate every existing package-owned snapshot in one session. */
function validateSession(session: Session, fail: InvariantFailure): void {
  for (const [index, event] of session.events.entries()) {
    if (event.type !== 'user/message'
      || event.data.source.kind !== 'plugin'
      || event.data.source.plugin !== sourceName) continue
    validateSnapshot(session.events.slice(0, index), event, fail)
  }
}

/** Install loaded-session and precommit validation. */
const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {
  for (const session of ctx.sessions.list()) validateSession(session, fail)
  ctx.on('session/created', (session) => { validateSession(session, fail) }, { global: true })
  ctx.on('internal/dispatch', (_mode, eventName, args) => {
    if (eventName !== 'session/event') return
    const [session, event] = args as [Session, SessionEvent]
    if (event.type !== 'user/message'
      || event.data.source.kind !== 'plugin'
      || event.data.source.plugin !== sourceName) return
    validateSnapshot(session.events, event, fail)
  }, { global: true })
}, { inject: ['sessions'] })

/** Register the invariant installer. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
