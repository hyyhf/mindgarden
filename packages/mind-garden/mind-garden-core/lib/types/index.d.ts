/**
 * Event-sourced Mind Garden session identity and dialogue preferences.
 * @module @deepseek-ai/dsh-mind-garden/core
 */
import { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Session } from '@deepseek-ai/dsh-session';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { ActivateMindGardenRequest } from './domain.ts';
import type { MindGardenMode, MindGardenSessionState, MindGardenSupportIntent } from './types.ts';
export type * from './types.ts';
export type * from './domain.ts';
export { MIND_GARDEN_CONTRACT_VERSION, MIND_GARDEN_STATE_VERSION, MindGardenError } from './runtime.ts';
export { applyMindGardenChange, applyMindGardenEvent, decodeMindGardenStateEvent, foldMindGarden } from './fold.ts';
export { applyMindGardenProjection, mindGardenProjectionDefinition, mindGardenProjectionSchema, mindGardenSessionStateSchema, } from './projection.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        mindGarden: MindGardenService;
    }
}
/** Write-side authority for the session-level Mind Garden state machine. */
export declare class MindGardenService extends TypertRemoteService {
    static inject: string[];
    private readonly cells;
    /**
     * Install the service and its read projection.
     * @param ctx - Cordis context carrying the session-projection registry.
     */
    constructor(ctx: Context);
    /**
     * Read a detached current state.
     * @param session - owning session.
     * @returns current whole state or null before activation.
     */
    current(session: Session): MindGardenSessionState | null;
    /**
     * Activate a blank session as a Mind Garden session.
     * @param session - blank owning session.
     * @param request - immutable privacy policy and initial dialogue choices.
     * @returns revision-one state.
     */
    activate(session: Session, request: ActivateMindGardenRequest): MindGardenSessionState;
    /**
     * Change the durable dialogue posture with compare-and-set semantics.
     * @param session - owning session.
     * @param expectedRevision - caller's current revision.
     * @param mode - requested posture.
     * @returns current state for a no-op, otherwise the next revision.
     */
    selectMode(session: Session, expectedRevision: number, mode: MindGardenMode): MindGardenSessionState;
    /**
     * Change the requested support style with compare-and-set semantics.
     * @param session - owning session.
     * @param expectedRevision - caller's current revision.
     * @param supportIntent - requested response style.
     * @returns current state for a no-op, otherwise the next revision.
     */
    selectSupportIntent(session: Session, expectedRevision: number, supportIntent: MindGardenSupportIntent): MindGardenSessionState;
    /**
     * Record model/provider disclosure acceptance.
     * @param session - owning session.
     * @param expectedRevision - caller's current revision.
     * @returns current state when already accepted, otherwise the next revision.
     */
    acceptModelDisclosure(session: Session, expectedRevision: number): MindGardenSessionState;
    /**
     * Activate Mind Garden through the generated Remote boundary.
     * @param agent - exact live Agent resolved from the wire session identity.
     * @param request - immutable privacy policy and initial dialogue choices.
     * @returns revision-one state.
     */
    remoteExportActivate(agent: Agent, request: ActivateMindGardenRequest): MindGardenSessionState;
    /**
     * Change dialogue posture through the generated Remote boundary.
     * @param agent - exact live Agent resolved from the wire session identity.
     * @param expectedRevision - caller's current projected revision.
     * @param mode - requested posture.
     * @returns the resulting state.
     */
    remoteExportSelectMode(agent: Agent, expectedRevision: number, mode: MindGardenMode): MindGardenSessionState;
    /**
     * Change support style through the generated Remote boundary.
     * @param agent - exact live Agent resolved from the wire session identity.
     * @param expectedRevision - caller's current projected revision.
     * @param supportIntent - requested response style.
     * @returns the resulting state.
     */
    remoteExportSelectSupportIntent(agent: Agent, expectedRevision: number, supportIntent: MindGardenSupportIntent): MindGardenSessionState;
    /**
     * Accept the model/provider disclosure through the generated Remote boundary.
     * @param agent - exact live Agent resolved from the wire session identity.
     * @param expectedRevision - caller's current projected revision.
     * @returns the resulting state.
     */
    remoteExportAcceptModelDisclosure(agent: Agent, expectedRevision: number): MindGardenSessionState;
    /** Enforce exact live-Agent identity before accepting a Remote mutation. */
    private assertLive;
    /** Bring a cache cell up to the session's current sequence. */
    private sync;
    /** Require an activated session. */
    private requireCurrent;
    /** Enforce optimistic concurrency for a real state change. */
    private assertRevision;
    /** Build the next whole state. */
    private next;
    /** Append one whole-state event and advance the strict cell. */
    private commit;
}
export default MindGardenService;
//# sourceMappingURL=index.d.ts.map