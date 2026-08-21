/** Fail-soft read projection for the latest complete Mind Garden state. */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { z } from 'zod'
import { decodeMindGardenStateEvent } from './fold.ts'
import type { MindGardenSessionProjection, MindGardenSessionState } from './types.ts'

/** Runtime schema shared with Host-to-browser projection validation. */
export const mindGardenSessionStateSchema: z.ZodType<MindGardenSessionState> = z.object({
  revision: z.number().int().positive(),
  activatedAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  mode: z.enum(['serenity', 'clarity']),
  supportIntent: z.enum(['auto', 'listen', 'settle', 'clarify', 'next-step']),
  privacy: z.enum(['durable', 'ephemeral']),
  contractVersion: z.number().int().positive(),
  modelDisclosureAccepted: z.boolean(),
}).strict().refine(value => value.updatedAt >= value.activatedAt, {
  message: 'updatedAt must not precede activatedAt',
  path: ['updatedAt'],
})

/** Wire schema for the current Mind Garden projection. */
export const mindGardenProjectionSchema: z.ZodType<MindGardenSessionProjection | null> = z.union([
  z.object({ state: mindGardenSessionStateSchema }).strict(),
  z.null(),
])

/**
 * Fold one committed event into the lightweight read projection.
 * @param state - prior complete state projection.
 * @param event - next committed session event.
 * @returns latest complete state, preserving reference identity for unrelated or malformed events.
 */
export function applyMindGardenProjection(
  state: MindGardenSessionProjection | null,
  event: SessionEvent,
): MindGardenSessionProjection | null {
  if (event.type !== 'mind-garden/session-state') return state
  try {
    return { state: decodeMindGardenStateEvent(event.data).state }
  } catch (_invalidMindGardenState) {
    return state
  }
}

/** Projection unit registered with DeepSeek Harness. */
export const mindGardenProjectionDefinition = {
  key: 'mind-garden',
  stateSchema: mindGardenProjectionSchema,
  init: () => null,
  apply: applyMindGardenProjection,
  wire: {
    viewSchema: mindGardenProjectionSchema,
    view: state => state,
  },
  stateVersion: 1,
} satisfies ProjectionDefinition<'mind-garden', MindGardenSessionProjection | null>
