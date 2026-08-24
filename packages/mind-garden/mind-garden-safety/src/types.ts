/** Durable and client-safe Mind Garden safety vocabulary. */

import type { MessageId } from '@deepseek-ai/dsh-llm'

/** Ordered response intervention level. */
export type MindGardenSafetyLevel = 0 | 1 | 2 | 3

/** Language used by deterministic local safety copy. */
export type MindGardenSafetyLocale = 'zh-CN' | 'en'

/** Deterministic assessment state shown in audit and projection consumers. */
export type MindGardenSafetyState =
  | 'ordinary'
  | 'vulnerable'
  | 'high-risk'
  | 'urgent'
  | 'abuse-danger'
  | 'reality-or-sleep-danger'
  | 'substance-emergency'
  | 'support-follow-up'

/** Stable classification explaining why an intervention level was selected. */
export type MindGardenSafetyCategory =
  | 'severe-distress'
  | 'self-or-other-harm'
  | 'immediate-danger'
  | 'abuse-or-child-safety'
  | 'mania-or-psychosis-danger'
  | 'overdose-or-withdrawal'
  | 'safety-follow-up'
  | 'urgent-follow-up'
  | 'immediate-danger-reduced'
  | 'safety-confirmed'

/** Region-verified support or emergency contact. */
export interface MindGardenSafetyResource {
  /** Stable registry identity. */
  readonly id: string
  /** User-facing service name. */
  readonly label: string
  /** Telephone number or equivalent contact value. */
  readonly value: string
  /** Whether this is supportive or emergency routing. */
  readonly kind: 'support' | 'emergency'
  /** Official source used to verify the contact. */
  readonly sourceUrl: string
  /** ISO date on which the source was checked. */
  readonly verifiedAt: string
  /** ISO date by which maintainers must check the source again. */
  readonly reviewAfter: string
}

/** Complete deterministic result for one entered human message batch. */
export interface MindGardenSafetyAssessment {
  /** Locale inferred from the entered human message. */
  readonly locale: MindGardenSafetyLocale
  /** Ordered intervention level. */
  readonly level: MindGardenSafetyLevel
  /** Stable state used by response policy. */
  readonly state: MindGardenSafetyState
  /** Reasons for the selected state. */
  readonly categories: readonly MindGardenSafetyCategory[]
  /** Region-verified resources appropriate to the level. */
  readonly resources: readonly MindGardenSafetyResource[]
  /** Consecutive ordinary turns retained while a level-one follow-up settles. */
  readonly normalTurns: number
}

/** Assessment record appended before model dispatch or local response publication. */
export interface MindGardenSafetyAssessmentEvent {
  /** Event payload version. */
  readonly version: 1
  /** Turn containing the classified input. */
  readonly turn: number
  /** Step containing the classified input. */
  readonly step: number
  /** Exact entered human messages used by the classifier. */
  readonly inputMessageIds: readonly MessageId[]
  /** Complete post-classification result. */
  readonly assessment: MindGardenSafetyAssessment
  /** Whether the model stream is bypassed for this step. */
  readonly response: 'model-guarded' | 'local'
}

/** Why a buffered model response was replaced before publication. */
export type MindGardenOutputGuardReason = 'policy-violation' | 'buffer-limit'

/** Stable output rule whose violation caused replacement. */
export type MindGardenOutputViolation =
  | 'exclusive-dependence'
  | 'diagnosis'
  | 'medication-direction'
  | 'forced-life-decision'
  | 'trauma-exposure'
  | 'delusion-confirmation'
  | 'user-blame'
  | 'risk-deflection'

/** Audit event written before a replacement response is published. */
export interface MindGardenOutputGuardedEvent {
  /** Event payload version. */
  readonly version: 1
  /** Turn whose response was replaced. */
  readonly turn: number
  /** Step whose response was replaced. */
  readonly step: number
  /** Stable replacement cause. */
  readonly reason: MindGardenOutputGuardReason
  /** Matched rules; empty only when the configured buffer limit caused replacement. */
  readonly violations: readonly MindGardenOutputViolation[]
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /** Deterministic safety result for one entered human message batch. */
    'mind-garden/safety-assessment': MindGardenSafetyAssessmentEvent
    /** Records that unsafe or unbounded model output was replaced before publication. */
    'mind-garden/output-guarded': MindGardenOutputGuardedEvent
  }
}
