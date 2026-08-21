/** Fail-soft read projection for the latest complete Mind Garden state. */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
import { z } from 'zod';
import type { MindGardenSessionProjection, MindGardenSessionState } from './types.ts';
/** Runtime schema shared with Host-to-browser projection validation. */
export declare const mindGardenSessionStateSchema: z.ZodType<MindGardenSessionState>;
/** Wire schema for the current Mind Garden projection. */
export declare const mindGardenProjectionSchema: z.ZodType<MindGardenSessionProjection | null>;
/**
 * Fold one committed event into the lightweight read projection.
 * @param state - prior complete state projection.
 * @param event - next committed session event.
 * @returns latest complete state, preserving reference identity for unrelated or malformed events.
 */
export declare function applyMindGardenProjection(state: MindGardenSessionProjection | null, event: SessionEvent): MindGardenSessionProjection | null;
/** Projection unit registered with DeepSeek Harness. */
export declare const mindGardenProjectionDefinition: ProjectionDefinition<'mind-garden', MindGardenSessionProjection | null>;
//# sourceMappingURL=projection.d.ts.map