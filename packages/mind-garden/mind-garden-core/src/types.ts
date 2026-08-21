/** Pure client-safe data contracts for Mind Garden session state. */

/** User-selected dialogue posture. Safety policy may override one response, never this durable choice. */
export type MindGardenMode = 'serenity' | 'clarity'

/** What kind of support the user wants from the current dialogue. */
export type MindGardenSupportIntent = 'auto' | 'listen' | 'settle' | 'clarify' | 'next-step'

/** Persistence policy fixed before the first user message. */
export type MindGardenPrivacy = 'durable' | 'ephemeral'

/** Whole current state of one Mind Garden session. */
export interface MindGardenSessionState {
  /** Monotonic compare-and-set revision. */
  readonly revision: number
  /** Epoch milliseconds when the session became a Mind Garden session. */
  readonly activatedAt: number
  /** Epoch milliseconds of the latest accepted state mutation. */
  readonly updatedAt: number
  /** Dialogue posture selected by the user. */
  readonly mode: MindGardenMode
  /** Requested support style. */
  readonly supportIntent: MindGardenSupportIntent
  /** Storage policy fixed for this session. */
  readonly privacy: MindGardenPrivacy
  /** Accepted boundary-contract version. */
  readonly contractVersion: number
  /** Whether the user accepted the model/provider disclosure for this session. */
  readonly modelDisclosureAccepted: boolean
}

/** Session-projection value exposed to Host and browser consumers. */
export interface MindGardenSessionProjection {
  /** Latest complete state. */
  readonly state: MindGardenSessionState
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    /** Host fold state for the Mind Garden client projection. */
    'mind-garden': MindGardenSessionProjection | null
  }

  interface SessionProjectionMap {
    /** Null before activation; otherwise the latest complete session state. */
    'mind-garden': MindGardenSessionProjection | null
  }
}
