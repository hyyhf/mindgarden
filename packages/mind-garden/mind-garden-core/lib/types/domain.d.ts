/** Host-side durable vocabulary and mutation requests for Mind Garden. */
import type { MindGardenMode, MindGardenPrivacy, MindGardenSessionState, MindGardenSupportIntent } from './types.ts';
/** State-changing verbs recorded in the session log. */
export type MindGardenOperation = 'activate' | 'select-mode' | 'select-support-intent' | 'accept-disclosure';
/** Full-snapshot event payload; the latest valid state wins in the read projection. */
export interface MindGardenSessionStateEvent {
    readonly version: 1;
    readonly operation: MindGardenOperation;
    readonly state: MindGardenSessionState;
}
/** Required facts for activating a blank session. */
export interface ActivateMindGardenRequest {
    readonly mode: MindGardenMode;
    readonly supportIntent?: MindGardenSupportIntent;
    readonly privacy: MindGardenPrivacy;
    readonly modelDisclosureAccepted?: boolean;
}
/** Stable machine-readable mutation failures. */
export type MindGardenErrorCode = 'MIND_GARDEN_ALREADY_ACTIVE' | 'MIND_GARDEN_AGENT_NOT_LIVE' | 'MIND_GARDEN_NOT_ACTIVE' | 'MIND_GARDEN_SESSION_NOT_BLANK' | 'MIND_GARDEN_STALE_REVISION';
declare module '@deepseek-ai/dsh-session/types' {
    interface SessionEventMap {
        /** Complete post-mutation Mind Garden session state. */
        'mind-garden/session-state': MindGardenSessionStateEvent;
    }
}
//# sourceMappingURL=domain.d.ts.map