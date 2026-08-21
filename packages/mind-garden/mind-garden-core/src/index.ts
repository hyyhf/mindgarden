/**
 * Event-sourced Mind Garden session identity and dialogue preferences.
 * @module @deepseek-ai/dsh-mind-garden-core
 */

import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { Session } from '@deepseek-ai/dsh-session'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
// Resolves the projection registry Context merge without creating a runtime edge.
import type {} from '@deepseek-ai/dsh-session-projection'
import { applyMindGardenEvent } from './fold.ts'
import { mindGardenProjectionDefinition } from './projection.ts'
import { MIND_GARDEN_CONTRACT_VERSION, MIND_GARDEN_STATE_VERSION, MindGardenError } from './runtime.ts'
import type {
  ActivateMindGardenRequest,
  MindGardenOperation,
  MindGardenSessionStateEvent,
} from './domain.ts'
import type {
  MindGardenMode,
  MindGardenSessionState,
  MindGardenSupportIntent,
} from './types.ts'

export type * from './types.ts'
export type * from './domain.ts'
export { MIND_GARDEN_CONTRACT_VERSION, MIND_GARDEN_STATE_VERSION, MindGardenError } from './runtime.ts'
export { applyMindGardenChange, applyMindGardenEvent, decodeMindGardenStateEvent, foldMindGarden } from './fold.ts'
export {
  applyMindGardenProjection,
  mindGardenProjectionDefinition,
  mindGardenProjectionSchema,
  mindGardenSessionStateSchema,
} from './projection.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    mindGarden: MindGardenService
  }
}

/** Incremental strict replay cell for one live Session object. */
interface MindGardenCell {
  state: MindGardenSessionState | null
  observedSeq: number
}

/** Write-side authority for the session-level Mind Garden state machine. */
export class MindGardenService extends TypertRemoteService {
  static inject = ['agents', 'sessionProjections']

  private readonly cells = new WeakMap<Session, MindGardenCell>()

  /**
   * Install the service and its read projection.
   * @param ctx - Cordis context carrying the session-projection registry.
   */
  constructor(ctx: Context) {
    super(ctx, 'mindGarden')
    ctx.sessionProjections.register(mindGardenProjectionDefinition)
  }

  /**
   * Read a detached current state.
   * @param session - owning session.
   * @returns current whole state or null before activation.
   */
  current(session: Session): MindGardenSessionState | null {
    const state = this.sync(session).state
    return state === null ? null : { ...state }
  }

  /**
   * Activate a blank session as a Mind Garden session.
   * @param session - blank owning session.
   * @param request - immutable privacy policy and initial dialogue choices.
   * @returns revision-one state.
   */
  activate(session: Session, request: ActivateMindGardenRequest): MindGardenSessionState {
    const cell = this.sync(session)
    if (cell.state !== null) {
      throw new MindGardenError('this session is already a Mind Garden session', 'MIND_GARDEN_ALREADY_ACTIVE')
    }
    if (session.events.some(event => event.type === 'turn/start')) {
      throw new MindGardenError('Mind Garden activation requires a blank session', 'MIND_GARDEN_SESSION_NOT_BLANK')
    }
    const now = Date.now()
    return this.commit(session, cell, 'activate', {
      revision: 1,
      activatedAt: now,
      updatedAt: now,
      mode: request.mode,
      supportIntent: request.supportIntent ?? 'auto',
      privacy: request.privacy,
      contractVersion: MIND_GARDEN_CONTRACT_VERSION,
      modelDisclosureAccepted: request.modelDisclosureAccepted ?? false,
    })
  }

  /**
   * Change the durable dialogue posture with compare-and-set semantics.
   * @param session - owning session.
   * @param expectedRevision - caller's current revision.
   * @param mode - requested posture.
   * @returns current state for a no-op, otherwise the next revision.
   */
  selectMode(session: Session, expectedRevision: number, mode: MindGardenMode): MindGardenSessionState {
    const cell = this.sync(session)
    const current = this.requireCurrent(cell)
    if (current.mode === mode) return { ...current }
    this.assertRevision(current, expectedRevision)
    return this.commit(session, cell, 'select-mode', this.next(current, { mode }))
  }

  /**
   * Change the requested support style with compare-and-set semantics.
   * @param session - owning session.
   * @param expectedRevision - caller's current revision.
   * @param supportIntent - requested response style.
   * @returns current state for a no-op, otherwise the next revision.
   */
  selectSupportIntent(
    session: Session,
    expectedRevision: number,
    supportIntent: MindGardenSupportIntent,
  ): MindGardenSessionState {
    const cell = this.sync(session)
    const current = this.requireCurrent(cell)
    if (current.supportIntent === supportIntent) return { ...current }
    this.assertRevision(current, expectedRevision)
    return this.commit(session, cell, 'select-support-intent', this.next(current, { supportIntent }))
  }

  /**
   * Record model/provider disclosure acceptance.
   * @param session - owning session.
   * @param expectedRevision - caller's current revision.
   * @returns current state when already accepted, otherwise the next revision.
   */
  acceptModelDisclosure(session: Session, expectedRevision: number): MindGardenSessionState {
    const cell = this.sync(session)
    const current = this.requireCurrent(cell)
    if (current.modelDisclosureAccepted) return { ...current }
    this.assertRevision(current, expectedRevision)
    return this.commit(session, cell, 'accept-disclosure', this.next(current, { modelDisclosureAccepted: true }))
  }

  /**
   * Activate Mind Garden through the generated Remote boundary.
   * @param agent - exact live Agent resolved from the wire session identity.
   * @param request - immutable privacy policy and initial dialogue choices.
   * @returns revision-one state.
   */
  @Remote('activate')
  remoteExportActivate(agent: Agent, request: ActivateMindGardenRequest): MindGardenSessionState {
    this.assertLive(agent)
    return this.activate(agent.session, request)
  }

  /**
   * Change dialogue posture through the generated Remote boundary.
   * @param agent - exact live Agent resolved from the wire session identity.
   * @param expectedRevision - caller's current projected revision.
   * @param mode - requested posture.
   * @returns the resulting state.
   */
  @Remote('selectMode')
  remoteExportSelectMode(
    agent: Agent,
    expectedRevision: number,
    mode: MindGardenMode,
  ): MindGardenSessionState {
    this.assertLive(agent)
    return this.selectMode(agent.session, expectedRevision, mode)
  }

  /**
   * Change support style through the generated Remote boundary.
   * @param agent - exact live Agent resolved from the wire session identity.
   * @param expectedRevision - caller's current projected revision.
   * @param supportIntent - requested response style.
   * @returns the resulting state.
   */
  @Remote('selectSupportIntent')
  remoteExportSelectSupportIntent(
    agent: Agent,
    expectedRevision: number,
    supportIntent: MindGardenSupportIntent,
  ): MindGardenSessionState {
    this.assertLive(agent)
    return this.selectSupportIntent(agent.session, expectedRevision, supportIntent)
  }

  /**
   * Accept the model/provider disclosure through the generated Remote boundary.
   * @param agent - exact live Agent resolved from the wire session identity.
   * @param expectedRevision - caller's current projected revision.
   * @returns the resulting state.
   */
  @Remote('acceptModelDisclosure')
  remoteExportAcceptModelDisclosure(agent: Agent, expectedRevision: number): MindGardenSessionState {
    this.assertLive(agent)
    return this.acceptModelDisclosure(agent.session, expectedRevision)
  }

  /** Enforce exact live-Agent identity before accepting a Remote mutation. */
  private assertLive(agent: Agent): void {
    if (this.ctx.agents.get(agent.id) !== agent) {
      throw new MindGardenError(
        `agent "${agent.id}" is not live in this registry`,
        'MIND_GARDEN_AGENT_NOT_LIVE',
      )
    }
  }

  /** Bring a cache cell up to the session's current sequence. */
  private sync(session: Session): MindGardenCell {
    let cell = this.cells.get(session)
    if (cell === undefined) {
      cell = { state: null, observedSeq: -1 }
      this.cells.set(session, cell)
    }
    for (const event of session.events.slice(cell.observedSeq + 1)) {
      cell.state = applyMindGardenEvent(cell.state, event)
      cell.observedSeq = event.seq
    }
    return cell
  }

  /** Require an activated session. */
  private requireCurrent(cell: MindGardenCell): MindGardenSessionState {
    if (cell.state === null) {
      throw new MindGardenError('this session is not a Mind Garden session', 'MIND_GARDEN_NOT_ACTIVE')
    }
    return cell.state
  }

  /** Enforce optimistic concurrency for a real state change. */
  private assertRevision(current: MindGardenSessionState, expectedRevision: number): void {
    if (current.revision !== expectedRevision) {
      throw new MindGardenError(
        `stale Mind Garden revision ${String(expectedRevision)}; current revision is ${String(current.revision)}`,
        'MIND_GARDEN_STALE_REVISION',
      )
    }
  }

  /** Build the next whole state. */
  private next(
    current: MindGardenSessionState,
    patch: Partial<Pick<MindGardenSessionState, 'mode' | 'supportIntent' | 'modelDisclosureAccepted'>>,
  ): MindGardenSessionState {
    return {
      ...current,
      ...patch,
      revision: current.revision + 1,
      updatedAt: Math.max(Date.now(), current.updatedAt),
    }
  }

  /** Append one whole-state event and advance the strict cell. */
  private commit(
    session: Session,
    cell: MindGardenCell,
    operation: MindGardenOperation,
    state: MindGardenSessionState,
  ): MindGardenSessionState {
    const data: MindGardenSessionStateEvent = {
      version: MIND_GARDEN_STATE_VERSION,
      operation,
      state,
    }
    const event = session.append('mind-garden/session-state', data)
    cell.state = applyMindGardenEvent(cell.state, event)
    cell.observedSeq = event.seq
    return { ...state }
  }
}

export default MindGardenService
