/** Package-owned invariants for Mind Garden dialogue snapshots. @module @deepseek-ai/dsh-mind-garden/dialogue/invariant */

import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import { foldMindGarden } from '@deepseek-ai/dsh-mind-garden/core'
import type { MindGardenAuthorizedJournalExcerpt } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import {
  name as sourceName,
  renderAuthorizedJournalContext,
  renderMindGardenDialoguePolicy,
} from './index.ts'

const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/dialogue'

/** Cordis companion plugin name. */
export const name = 'mind-garden-dialogue-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

interface AuthorizedJournalWireExcerpt {
  readonly date: string
  readonly title: string
  readonly body: string
}

function isExactLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

function authorizedJournalTextIsExact(text: string): boolean {
  const lines = text.split('\n')
  if (lines.length !== 3) return false
  const payload = lines[2]
  if (payload === undefined) return false
  let value: unknown
  try {
    value = JSON.parse(payload)
  } catch {
    return false
  }
  if (!Array.isArray(value) || value.length === 0) return false
  const rows: AuthorizedJournalWireExcerpt[] = []
  for (const item of value) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return false
    const record = item as Record<string, unknown>
    if (Object.keys(record).sort().join(',') !== 'body,date,title'
      || typeof record.date !== 'string'
      || !isExactLocalDate(record.date)
      || typeof record.title !== 'string'
      || typeof record.body !== 'string') return false
    rows.push({ date: record.date, title: record.title, body: record.body })
  }
  const excerpts = rows.map((row, index): MindGardenAuthorizedJournalExcerpt => ({
    id: `invariant-${String(index)}` as MindGardenAuthorizedJournalExcerpt['id'],
    localDate: row.date,
    title: row.title,
    body: row.body,
  }))
  return renderAuthorizedJournalContext(excerpts) === text
}

/** Validate one package-owned model-context message against the preceding durable state. */
function validateMessage(
  history: readonly SessionEvent[],
  event: SessionEvent<'user/message'>,
  fail: InvariantFailure,
): void {
  const state = foldMindGarden(history)
  if (state === null) fail('Mind Garden dialogue snapshot requires an activated session')
  if (!state.modelDisclosureAccepted) fail('Mind Garden dialogue snapshot requires accepted model disclosure')
  const source = event.data.source
  const block = event.data.content[0]
  const sections: unknown = 'sections' in source ? source.sections : undefined
  const section: unknown = Array.isArray(sections) ? sections[0] : undefined
  const sharedShapeInvalid = event.data.content.length !== 1
    || block?.type !== 'text'
    || source.kind !== 'plugin'
    || source.plugin !== sourceName
    || !Array.isArray(sections)
    || sections.length !== 1
    || typeof section !== 'object'
    || section === null
    || (section as { text?: unknown }).text !== block.text
  if (sharedShapeInvalid) {
    fail('Mind Garden dialogue message must carry one exact sourced text section')
  }
  if (source.form === 'snapshot') {
    const expected = renderMindGardenDialoguePolicy(state)
    if (block.text !== expected
      || (section as { name?: unknown }).name !== sourceName) {
      fail('Mind Garden dialogue message must carry the exact sourced policy snapshot')
    }
    return
  }
  if (source.form === 'recall') {
    if (state.privacy !== 'durable'
      || (section as { name?: unknown }).name !== 'authorized-journals'
      || !authorizedJournalTextIsExact(block.text)) {
      fail('Mind Garden dialogue recall must carry exact authorized journal excerpts in a durable session')
    }
    return
  }
  fail('Mind Garden dialogue message must carry a recognized sourced context form')
}

/** Validate every existing package-owned model-context message in one session. */
function validateSession(session: Session, fail: InvariantFailure): void {
  for (const [index, event] of session.events.entries()) {
    if (event.type !== 'user/message'
      || event.data.source.kind !== 'plugin'
      || event.data.source.plugin !== sourceName) continue
    validateMessage(session.events.slice(0, index), event, fail)
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
    validateMessage(session.events, event, fail)
  }, { global: true })
}, { inject: ['sessions'] })

/** Register the invariant installer. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
