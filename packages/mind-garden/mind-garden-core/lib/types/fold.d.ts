/** Strict decoder and pure replay fold for durable Mind Garden state. */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { MindGardenSessionStateEvent } from './domain.ts';
import type { MindGardenSessionState } from './types.ts';
/**
 * Decode one declared Mind Garden event payload.
 * @param value - candidate session-event data.
 * @returns validated whole-state change.
 */
export declare function decodeMindGardenStateEvent(value: unknown): MindGardenSessionStateEvent;
/**
 * Validate and apply one decoded whole-state change.
 * @param current - prior durable state or null before activation.
 * @param change - decoded state event.
 * @returns the event's whole post-change state.
 */
export declare function applyMindGardenChange(current: MindGardenSessionState | null, change: MindGardenSessionStateEvent): MindGardenSessionState;
/**
 * Strictly apply one session event.
 * @param current - prior durable state.
 * @param event - next event in sequence order.
 * @returns next durable state, or the same reference for an unrelated event.
 */
export declare function applyMindGardenEvent(current: MindGardenSessionState | null, event: SessionEvent): MindGardenSessionState | null;
/**
 * Fold current Mind Garden state from a contiguous session log.
 * @param events - session events in sequence order.
 * @returns detached current state or null before activation.
 */
export declare function foldMindGarden(events: readonly SessionEvent[]): MindGardenSessionState | null;
//# sourceMappingURL=fold.d.ts.map