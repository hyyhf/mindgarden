/** Authenticated plaintext codecs behind the Mind Garden media vault boundary. */

import { z } from 'zod'

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const range = (minimum: number, maximum: number) => z.number().min(minimum).max(maximum)

/** Strict particle-configuration codec shared by stored story validation and requests. */
export const mindGardenPhotoParticleConfigSchema = z.object({
  version: z.literal(1),
  preset: z.enum(['soft', 'dust', 'fluid', 'nebula']),
  rendering: z.object({
    quality: z.enum(['low', 'medium', 'high']),
    pointSize: range(0.7, 6),
    density: range(0.25, 1),
    opacity: range(0.1, 1),
    preserveColors: z.boolean(),
    background: hexColor,
  }).strict(),
  depth: z.object({ strength: range(0, 60), randomness: range(0, 24) }).strict(),
  interaction: z.object({
    mode: z.enum(['repel', 'attract', 'vortex', 'wave']),
    radius: range(0.2, 6),
    strength: range(0, 16),
    velocityInfluence: range(0, 2),
    vortexStrength: range(-8, 8),
    clickBurst: z.boolean(),
  }).strict(),
  physics: z.object({
    spring: range(0.2, 16),
    damping: range(0.86, 0.997),
    maxVelocity: range(0.5, 16),
    maxDistance: range(0.5, 20),
    turbulence: range(0, 1.2),
  }).strict(),
  animation: z.object({
    idleStrength: range(0, 1.5),
    idleSpeed: range(0, 2),
    paperStrength: range(0, 3),
    paperSpeed: range(0, 4),
  }).strict(),
  effects: z.object({
    saturation: range(0, 1.8),
    exposure: range(0.5, 1.8),
    tint: hexColor,
    tintMix: range(0, 1),
    bloom: range(0, 1.2),
    vignette: range(0, 1),
  }).strict(),
}).strict()

const attachmentSchema = z.object({
  attachmentId: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  mediaType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  bytes: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  name: z.string().min(1).optional(),
}).strict()

const stampSchema = z.object({
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeZone: z.string().min(1),
  utcOffsetMinutes: z.number().int().min(-840).max(840),
}).strict()

const storedPhotoObservationSchema = z.object({
  id: z.uuid(),
  grounding: z.object({
    visualSummary: z.string().min(1).max(1200),
    visibleElements: z.array(z.string().min(1).max(240)).max(8),
    textInImage: z.array(z.string().min(1).max(240)).max(8),
    uncertainDetails: z.array(z.string().min(1).max(360)).max(8),
    source: z.literal('model-observation-unconfirmed'),
  }).strict(),
  opening: z.string().min(1).max(2400),
  provider: z.string().min(1),
  model: z.string().min(1),
  promptVersion: z.literal('mind-garden-photo-observe-v1'),
  createdAt: z.number().int().nonnegative(),
}).strict()

const storedPhotoDialogueTurnSchema = z.object({
  id: z.uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
  quickReplyKind: z.enum(['', 'remember', 'detail', 'correct']),
  createdAt: z.number().int().nonnegative(),
}).strict()

const storedPhotoQuickReplySchema = z.object({
  kind: z.enum(['remember', 'detail', 'correct']),
  label: z.string().min(1).max(400),
}).strict()

/** Strict encrypted audit codec for one photo observation or dialogue call. */
export const storedPhotoModelRunSchema = z.object({
  id: z.uuid(),
  kind: z.enum(['observation', 'dialogue']),
  storyVersion: z.uuid(),
  status: z.enum(['running', 'completed', 'failed']),
  failure: z.enum(['interrupted', 'model-failed', 'invalid-output', 'story-changed']).nullable(),
  provider: z.string().min(1),
  model: z.string().min(1),
  system: z.string().min(1),
  prompt: z.string().min(1),
  rawOutput: z.string(),
  turnIds: z.array(z.uuid()).max(2),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((run, context) => {
  if (run.updatedAt < run.createdAt) {
    context.addIssue({ code: 'custom', message: 'photo model run updatedAt precedes createdAt' })
  }
  const validRunning = run.status === 'running'
    && run.failure === null
    && run.rawOutput.length === 0
    && run.turnIds.length === 0
  const validFailed = run.status === 'failed'
    && run.failure !== null
    && run.turnIds.length === 0
  const completedTurnCount = run.kind === 'observation' ? 1 : 2
  const validCompleted = run.status === 'completed'
    && run.failure === null
    && run.rawOutput.length > 0
    && run.turnIds.length === completedTurnCount
  if (!validRunning && !validFailed && !validCompleted) {
    context.addIssue({ code: 'custom', message: 'photo model run terminal fields differ from status' })
  }
})

/** Version-one encrypted photo-story metadata. */
export const storedPhotoStorySchema = z.object({
  recordType: z.literal('photo-story'),
  formatVersion: z.literal(1),
  id: z.uuid(),
  version: z.uuid(),
  attachment: attachmentSchema,
  title: z.string(),
  note: z.string(),
  stamp: stampSchema,
  particleConfig: mindGardenPhotoParticleConfigSchema,
  observation: storedPhotoObservationSchema.nullable().default(null),
  turns: z.array(storedPhotoDialogueTurnSchema).max(25).default([]),
  quickReplies: z.array(storedPhotoQuickReplySchema).max(3).default([]),
  modelRuns: z.array(storedPhotoModelRunSchema).max(24).default([]),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((record, context) => {
  if (record.updatedAt < record.createdAt) {
    context.addIssue({ code: 'custom', message: 'updatedAt precedes createdAt' })
  }
  if (record.observation === null && record.turns.length > 0) {
    context.addIssue({ code: 'custom', message: 'photo dialogue exists without an observation' })
  }
  if (record.observation !== null) {
    const first = record.turns[0]
    if (first?.role !== 'assistant' || first.content !== record.observation.opening) {
      context.addIssue({ code: 'custom', message: 'photo observation opening differs from the first turn' })
    }
  }
  if (record.turns.some((turn, index) => turn.role !== (index % 2 === 0 ? 'assistant' : 'user'))) {
    context.addIssue({ code: 'custom', message: 'photo dialogue roles do not alternate from the opening' })
  }
  const turnIds = new Set(record.turns.map(turn => turn.id))
  if (turnIds.size !== record.turns.length) {
    context.addIssue({ code: 'custom', message: 'photo dialogue turn ids are duplicated' })
  }
  if (record.modelRuns.some(run => run.status === 'completed' && run.turnIds.some(id => !turnIds.has(id)))) {
    context.addIssue({ code: 'custom', message: 'photo model run references a missing turn' })
  }
})

/** Authenticated plaintext for one encrypted photo-story record. */
export type StoredPhotoStory = z.infer<typeof storedPhotoStorySchema>

/** Authenticated model-call audit embedded in one encrypted photo record. */
export type StoredPhotoModelRun = z.infer<typeof storedPhotoModelRunSchema>

/**
 * Decode one authenticated media record without trusting its producer.
 *
 * @param value - Authenticated plaintext read from the media collection.
 * @returns The validated stored photo story.
 */
export function decodeStoredMediaRecord(value: unknown): StoredPhotoStory {
  return storedPhotoStorySchema.parse(value)
}
