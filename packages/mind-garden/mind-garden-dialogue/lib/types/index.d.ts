/**
 * Model-visible dialogue policy for activated Mind Garden sessions.
 *
 * @module @deepseek-ai/dsh-mind-garden/dialogue
 */
import type { Context } from '@deepseek-ai/cordis';
import type { MindGardenSessionState } from '@deepseek-ai/dsh-mind-garden/core';
/** Cordis plugin and durable model-message source name. */
export declare const name = "mind-garden-dialogue";
/** Required host services. */
export declare const inject: string[];
/**
 * Render the exact sourced snapshot appended to the next model-visible turn.
 * @param state - current activated Mind Garden state.
 * @returns stable English policy text for the model.
 */
export declare function renderMindGardenDialoguePolicy(state: MindGardenSessionState): string;
/**
 * Add the current policy snapshot to the first model step of each entered turn.
 * An activated session whose disclosure is still pending is rejected before a
 * model request, so provider processing cannot precede recorded acceptance.
 * @param ctx - host context carrying the Agent registry and Mind Garden core.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map