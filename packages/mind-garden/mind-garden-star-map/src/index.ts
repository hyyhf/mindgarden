/**
 * Encrypted Star Map ritual, profile, and governed constellation traits.
 * @module @deepseek-ai/dsh-mind-garden-star-map
 */

import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import s from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { BlockAssembler, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { FinishReason, GenerateOptions } from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-mind-garden-core'
import type {} from '@deepseek-ai/dsh-mind-garden-memory'
import type {} from '@deepseek-ai/dsh-mind-garden-reflection'
import {
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden-vault'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import {
  decodeStoredStarState,
  storedStarStateSchema,
  storedStarCardSchema,
  storedStarDialogueRunSchema,
  storedStarObservationRunSchema,
  storedStarTraitSchema,
  type StoredStarCard,
  type StoredStarDialogueRun,
  type StoredStarObservationRun,
  type StoredStarProfile,
  type StoredStarState,
  type StoredStarTrait,
} from './records.ts'
import {
  buildStarObserverDialogueEnvelope,
  buildStarObserverEnvelope,
  decodeStarObserverDialogueOutput,
  decodeStarObserverOutput,
  type StarObserverEnvelope,
  type StarObserverSource,
} from './observer.ts'
import type {
  MindGardenApplyStarCardRevisionRequest,
  MindGardenApplyStarCardRevisionResult,
  MindGardenCalibrateStarCardRequest,
  MindGardenCalibrateStarCardResult,
  MindGardenCompleteStarRitualRequest,
  MindGardenCompleteStarRitualResult,
  MindGardenContinueStarCardRequest,
  MindGardenContinueStarCardResult,
  MindGardenDrawStarCardRequest,
  MindGardenDrawStarCardResult,
  MindGardenFinalizeStarCardRequest,
  MindGardenFinalizeStarCardResult,
  MindGardenSaveStarRitualRequest,
  MindGardenSaveStarRitualResult,
  MindGardenStarAccessDenied,
  MindGardenStarCard,
  MindGardenStarCardId,
  MindGardenStarCardRevisionId,
  MindGardenStarCardVersion,
  MindGardenStarDeck,
  MindGardenStarEvidence,
  MindGardenStarEvidenceId,
  MindGardenStarDialogueTurnId,
  MindGardenStarFailure,
  MindGardenStarInvalidField,
  MindGardenStarMapOverview,
  MindGardenStarMapOverviewResult,
  MindGardenStarProfile,
  MindGardenStarProfileInput,
  MindGardenStarRejected,
  MindGardenStarSceneAnswer,
  MindGardenStarSuccess,
  MindGardenStarTrait,
  MindGardenStarTraitId,
  MindGardenStarTraitVersion,
  MindGardenStarVaultUnavailable,
  MindGardenUpdateStarProfileRequest,
  MindGardenUpdateStarProfileResult,
  MindGardenUpdateStarTraitRequest,
  MindGardenUpdateStarTraitResult,
} from './types.ts'

export type * from './types.ts'
export {
  decodeStoredStarState,
  storedStarCardSchema,
  storedStarDialogueRunSchema,
  storedStarObservationRunSchema,
  storedStarProfileSchema,
  storedStarStateSchema,
  storedStarTraitSchema,
} from './records.ts'
export {
  buildStarObserverDialogueEnvelope,
  buildStarObserverEnvelope,
  decodeStarObserverDialogueOutput,
  decodeStarObserverOutput,
  STAR_OBSERVER_DIALOGUE_SYSTEM_PROMPT,
  STAR_OBSERVER_SYSTEM_PROMPT,
  type StarObserverEnvelope,
  type StarObserverProposal,
  type StarObserverSource,
} from './observer.ts'

/** Cordis plugin name. */
export const name = 'mind-garden-star-map'

const STATE_ID = '7f76c63c-e3d1-4fe9-b951-9f703999803b'
const DEFAULT_MAX_DISPLAY_NAME_BYTES = 256
const DEFAULT_MAX_LOCATION_BYTES = 1024
const DEFAULT_MAX_INTENT_BYTES = 4096
const DEFAULT_MAX_TRAIT_TEXT_BYTES = 2048
const DEFAULT_MAX_SELF_WORDS = 5
const DEFAULT_MAX_OBSERVER_QUESTION_BYTES = 4096
const DEFAULT_MAX_OBSERVER_MESSAGE_BYTES = 4096
const DEFAULT_MAX_OBSERVER_INPUT_BYTES = 32 * 1024
const DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS = 2048
const DEFAULT_MAX_OBSERVER_SOURCE_BYTES = 1200
const DEFAULT_MAX_OBSERVER_SOURCES = 12
const MAX_STORED_TRAITS = 64
const MAX_DIALOGUE_TURNS = 24
const STAR_DECKS: readonly MindGardenStarDeck[] = ['current-self', 'unfolded-self', 'inner-debate']

/** Cordis plugin configuration. */
export interface Config {
  /** Maximum UTF-8 bytes accepted for the private display name. */
  maxDisplayNameBytes?: number
  /** Maximum UTF-8 bytes accepted for an optional birthplace. */
  maxLocationBytes?: number
  /** Maximum UTF-8 bytes accepted for the observation intention. */
  maxIntentBytes?: number
  /** Maximum UTF-8 bytes accepted for one trait label or description. */
  maxTraitTextBytes?: number
  /** Maximum self-authored words admitted by the ritual. */
  maxSelfWords?: number
  /** Maximum UTF-8 bytes accepted for one card-draw question. */
  maxObserverQuestionBytes?: number
  /** Maximum UTF-8 bytes accepted for one card-owned dialogue message. */
  maxObserverMessageBytes?: number
  /** Maximum complete UTF-8 bytes sent in one Star Observer request. */
  maxObserverInputBytes?: number
  /** Maximum provider output tokens accepted for one Star Observer request. */
  maxObserverOutputTokens?: number
  /** Maximum UTF-8 bytes retained from each authorized evidence source. */
  maxObserverSourceBytes?: number
  /** Maximum authorized evidence sources admitted to one draw. */
  maxObserverSources?: number
  /** Optional default observer provider; configure together with `observerModel`. */
  observerProvider?: string
  /** Optional default observer model; configure together with `observerProvider`. */
  observerModel?: string
}

interface ResolvedConfig {
  readonly maxDisplayNameBytes: number
  readonly maxLocationBytes: number
  readonly maxIntentBytes: number
  readonly maxTraitTextBytes: number
  readonly maxSelfWords: number
  readonly maxObserverQuestionBytes: number
  readonly maxObserverMessageBytes: number
  readonly maxObserverInputBytes: number
  readonly maxObserverOutputTokens: number
  readonly maxObserverSourceBytes: number
  readonly maxObserverSources: number
  readonly observerProvider: string
  readonly observerModel: string
}

interface PreparedObservation {
  readonly run: StoredStarObservationRun
  readonly deck: MindGardenStarDeck
  readonly tone: MindGardenStarProfile['observerTone']
  readonly question: string
  readonly envelope: StarObserverEnvelope
  readonly contextFingerprint: string
}

interface PreparedDialogue {
  readonly run: StoredStarDialogueRun
  readonly cardKind: StoredStarCard['cardKind']
  readonly tone: StoredStarCard['observerTone']
  readonly envelope: StarObserverEnvelope
  readonly content: string
  readonly quickReplyKind: '' | 'deepen' | 'shift' | 'correct'
}

class StarBusinessError extends Error {
  constructor(readonly failure: MindGardenStarFailure) {
    super(failure.code)
    this.name = 'StarBusinessError'
  }
}

class CorruptStarStoreError extends Error {
  override name = 'CorruptStarStoreError'
}

function positiveSafeInteger(value: number | undefined, fallback: number, name: string): number {
  const resolved = value ?? fallback
  if (!Number.isSafeInteger(resolved) || resolved < 1) {
    throw new TypeError(`mind-garden-star-map: ${name} must be a positive safe integer`)
  }
  return resolved
}

function resolveConfig(config: Config): ResolvedConfig {
  const maxSelfWords = positiveSafeInteger(config.maxSelfWords, DEFAULT_MAX_SELF_WORDS, 'maxSelfWords')
  if (maxSelfWords > DEFAULT_MAX_SELF_WORDS) {
    throw new TypeError(`mind-garden-star-map: maxSelfWords cannot exceed ${DEFAULT_MAX_SELF_WORDS}`)
  }
  const observerProvider = config.observerProvider ?? ''
  const observerModel = config.observerModel ?? ''
  if ((observerProvider.length === 0) !== (observerModel.length === 0)) {
    throw new TypeError('mind-garden-star-map: observerProvider and observerModel must be configured together')
  }
  const maxObserverSources = positiveSafeInteger(
    config.maxObserverSources,
    DEFAULT_MAX_OBSERVER_SOURCES,
    'maxObserverSources',
  )
  if (maxObserverSources > DEFAULT_MAX_OBSERVER_SOURCES) {
    throw new TypeError(`mind-garden-star-map: maxObserverSources cannot exceed ${DEFAULT_MAX_OBSERVER_SOURCES}`)
  }
  return {
    maxDisplayNameBytes: positiveSafeInteger(
      config.maxDisplayNameBytes,
      DEFAULT_MAX_DISPLAY_NAME_BYTES,
      'maxDisplayNameBytes',
    ),
    maxLocationBytes: positiveSafeInteger(config.maxLocationBytes, DEFAULT_MAX_LOCATION_BYTES, 'maxLocationBytes'),
    maxIntentBytes: positiveSafeInteger(config.maxIntentBytes, DEFAULT_MAX_INTENT_BYTES, 'maxIntentBytes'),
    maxTraitTextBytes: positiveSafeInteger(
      config.maxTraitTextBytes,
      DEFAULT_MAX_TRAIT_TEXT_BYTES,
      'maxTraitTextBytes',
    ),
    maxSelfWords,
    maxObserverQuestionBytes: positiveSafeInteger(
      config.maxObserverQuestionBytes,
      DEFAULT_MAX_OBSERVER_QUESTION_BYTES,
      'maxObserverQuestionBytes',
    ),
    maxObserverMessageBytes: positiveSafeInteger(
      config.maxObserverMessageBytes,
      DEFAULT_MAX_OBSERVER_MESSAGE_BYTES,
      'maxObserverMessageBytes',
    ),
    maxObserverInputBytes: positiveSafeInteger(
      config.maxObserverInputBytes,
      DEFAULT_MAX_OBSERVER_INPUT_BYTES,
      'maxObserverInputBytes',
    ),
    maxObserverOutputTokens: positiveSafeInteger(
      config.maxObserverOutputTokens,
      DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS,
      'maxObserverOutputTokens',
    ),
    maxObserverSourceBytes: positiveSafeInteger(
      config.maxObserverSourceBytes,
      DEFAULT_MAX_OBSERVER_SOURCE_BYTES,
      'maxObserverSourceBytes',
    ),
    maxObserverSources,
    observerProvider,
    observerModel,
  }
}

function success<T>(value: T): MindGardenStarSuccess<T> {
  return { ok: true, value }
}

function rejected<E extends MindGardenStarFailure>(error: E): MindGardenStarRejected<E> {
  return { ok: false, error }
}

function profileVersion(value: string): Exclude<MindGardenStarProfile['version'], null> {
  return value as Exclude<MindGardenStarProfile['version'], null>
}

function traitId(value: string): MindGardenStarTraitId {
  return value as MindGardenStarTraitId
}

function traitVersion(value: string): MindGardenStarTraitVersion {
  return value as MindGardenStarTraitVersion
}

function cardId(value: string): MindGardenStarCardId {
  return value as MindGardenStarCardId
}

function cardVersion(value: string): MindGardenStarCardVersion {
  return value as MindGardenStarCardVersion
}

function evidenceId(value: string): MindGardenStarEvidenceId {
  return value as MindGardenStarEvidenceId
}

function dialogueTurnId(value: string): MindGardenStarDialogueTurnId {
  return value as MindGardenStarDialogueTurnId
}

function cardRevisionId(value: string): MindGardenStarCardRevisionId {
  return value as MindGardenStarCardRevisionId
}

/**
 * Return the empty, non-authorized Star Map profile.
 * @returns A frozen profile that has not begun the ritual.
 */
export function defaultStarProfile(): MindGardenStarProfile {
  return Object.freeze({
    version: null,
    onboardingStage: 0,
    onboardingCompleted: false,
    displayName: '',
    birthMonth: null,
    birthDay: null,
    birthYear: null,
    birthTime: '',
    birthTimeKnown: false,
    birthCity: '',
    birthCityKnown: false,
    mbtiMode: 'observe',
    mbtiType: '',
    mbtiAnswers: Object.freeze([]),
    selfWords: Object.freeze([]),
    observationIntent: '',
    observerTone: 'gentle',
    permissions: Object.freeze({
      dailyReflections: false,
      confirmedMemories: false,
      openQuestions: false,
      periodReviews: false,
    }),
    reducedMotion: false,
    createdAt: null,
    updatedAt: null,
  })
}

function snapshotProfile(state: StoredStarState): MindGardenStarProfile {
  return Object.freeze({
    version: profileVersion(state.version),
    ...state.profile,
    mbtiAnswers: Object.freeze([...state.profile.mbtiAnswers]),
    selfWords: Object.freeze([...state.profile.selfWords]),
    permissions: Object.freeze({ ...state.profile.permissions }),
  })
}

function snapshotTrait(trait: StoredStarTrait): MindGardenStarTrait {
  return Object.freeze({
    ...trait,
    id: traitId(trait.id),
    version: traitVersion(trait.version),
  })
}

function snapshotEvidence(evidence: StoredStarCard['evidence'][number]): MindGardenStarEvidence {
  return Object.freeze({ ...evidence, id: evidenceId(evidence.id) })
}

function snapshotCard(card: StoredStarCard): MindGardenStarCard {
  return Object.freeze({
    ...card,
    id: cardId(card.id),
    version: cardVersion(card.version),
    analysis: Object.freeze({ ...card.analysis }),
    symbolicBasis: Object.freeze([...card.symbolicBasis]),
    evidence: Object.freeze(card.evidence.map(snapshotEvidence)),
    calibration: card.calibration === null ? null : Object.freeze({ ...card.calibration }),
    traitId: card.traitId === null ? null : traitId(card.traitId),
    turns: Object.freeze(card.turns.map(turn => Object.freeze({ ...turn, id: dialogueTurnId(turn.id) }))),
    quickReplies: Object.freeze(card.quickReplies.map(reply => Object.freeze({ ...reply }))),
    pendingRevision: card.pendingRevision === null ? null : Object.freeze({
      ...card.pendingRevision,
      id: cardRevisionId(card.pendingRevision.id),
      analysis: Object.freeze({ ...card.pendingRevision.analysis }),
      symbolicBasis: Object.freeze([...card.pendingRevision.symbolicBasis]),
    }),
  })
}

function snapshotOverview(state: StoredStarState | undefined): MindGardenStarMapOverview {
  if (state === undefined) {
    return Object.freeze({
      profile: defaultStarProfile(),
      traits: Object.freeze([]),
      cards: Object.freeze([]),
      activeCard: null,
    })
  }
  const visibleCards = state.cards.filter(card => card.status !== 'dissolved').map(snapshotCard)
  return Object.freeze({
    profile: snapshotProfile(state),
    traits: Object.freeze(state.traits.filter(trait => trait.status !== 'retired').map(snapshotTrait)),
    cards: Object.freeze(visibleCards),
    activeCard: visibleCards.find(card => card.status === 'draft') ?? null,
  })
}

function sceneMbti(answers: readonly MindGardenStarSceneAnswer[]): string {
  type Letter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
  const score: Record<Letter, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  const pairs = [['E', 'I'], ['J', 'P'], ['F', 'T'], ['N', 'S'], ['I', 'E'], ['T', 'F']] as const
  answers.forEach((answer, index) => {
    const pair = pairs[index]
    if (pair === undefined) return
    score[answer.endsWith('a') ? pair[0] : pair[1]] += index < 4 ? 2 : 1
  })
  return [
    score.E >= score.I ? 'E' : 'I',
    score.S >= score.N ? 'S' : 'N',
    score.T >= score.F ? 'T' : 'F',
    score.J >= score.P ? 'J' : 'P',
  ].join('')
}

function truncateUtf8(value: string, maxBytes: number): string {
  let result = ''
  let used = 0
  for (const character of value) {
    const bytes = Buffer.byteLength(character, 'utf8')
    if (used + bytes > maxBytes) break
    result += character
    used += bytes
  }
  return result
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    mindGardenStarMap: MindGardenStarMapService
  }
}

/** Encrypted Star Map profile, ritual progress, and user-governed constellation traits. */
export class MindGardenStarMapService extends TypertRemoteService {
  static inject = [
    'agents',
    'llm',
    'mindGarden',
    'mindGardenMemory',
    'mindGardenReflection',
    'mindGardenVault',
  ]

  /** Loader validation for private copy and bounded ritual inputs. */
  static Config: s<Config> = s.object({
    maxDisplayNameBytes: s.number().default(DEFAULT_MAX_DISPLAY_NAME_BYTES),
    maxLocationBytes: s.number().default(DEFAULT_MAX_LOCATION_BYTES),
    maxIntentBytes: s.number().default(DEFAULT_MAX_INTENT_BYTES),
    maxTraitTextBytes: s.number().default(DEFAULT_MAX_TRAIT_TEXT_BYTES),
    maxSelfWords: s.number().default(DEFAULT_MAX_SELF_WORDS),
    maxObserverQuestionBytes: s.number().default(DEFAULT_MAX_OBSERVER_QUESTION_BYTES),
    maxObserverMessageBytes: s.number().default(DEFAULT_MAX_OBSERVER_MESSAGE_BYTES),
    maxObserverInputBytes: s.number().default(DEFAULT_MAX_OBSERVER_INPUT_BYTES),
    maxObserverOutputTokens: s.number().default(DEFAULT_MAX_OBSERVER_OUTPUT_TOKENS),
    maxObserverSourceBytes: s.number().default(DEFAULT_MAX_OBSERVER_SOURCE_BYTES),
    maxObserverSources: s.number().default(DEFAULT_MAX_OBSERVER_SOURCES),
    observerProvider: s.string(),
    observerModel: s.string(),
  })

  private readonly options: ResolvedConfig
  private operationTail: Promise<void> = Promise.resolve()
  private observerOperation: Promise<unknown> | null = null
  private readonly observationControllers = new Set<AbortController>()
  private admissionOpen = true

  /** Install the Star Map Remote and drain admitted operations during disposal. */
  constructor(ctx: Context, config: Config) {
    super(ctx, 'mindGardenStarMap')
    this.options = resolveConfig(config)
    ctx.effect(() => async () => {
      this.admissionOpen = false
      for (const controller of this.observationControllers) controller.abort()
      await this.observerOperation?.catch(() => undefined)
      await this.operationTail
    }, 'mind-garden-star-map.drain')
  }

  /**
   * Read the current profile and visible traits.
   * @param agent - Exact live Agent whose durable garden owns the Star Map.
   * @returns The immutable current projection or a stable access or vault rejection.
   */
  @Remote('overview')
  overview(agent: Agent): Promise<MindGardenStarMapOverviewResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        return success(snapshotOverview(await this.readState()))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenStarMapOverviewResult>>(error)
      }
    })
  }

  /**
   * Save one recoverable ritual checkpoint without creating inferred traits.
   * @param agent - Exact live Agent whose durable garden owns the Star Map.
   * @param request - Complete checkpoint and observed profile version.
   * @returns The committed profile projection or a stable rejection.
   */
  @Remote('saveRitualProgress')
  saveRitualProgress(agent: Agent, request: MindGardenSaveStarRitualRequest): Promise<MindGardenSaveStarRitualResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = await this.readState()
        if (current?.profile.onboardingCompleted === true) {
          throw new StarBusinessError({ code: 'star-ritual-completed' })
        }
        this.assertProfileVersion(current, request.ifVersion)
        if (!Number.isInteger(request.onboardingStage)
          || request.onboardingStage < 0
          || request.onboardingStage > 2) {
          this.invalid('onboardingStage', 'invalid')
        }
        const now = Date.now()
        const onboardingStage = Math.max(current?.profile.onboardingStage ?? 0, request.onboardingStage) as 0 | 1 | 2
        const state = storedStarStateSchema.parse({
          recordType: 'star-state',
          formatVersion: 1,
          id: STATE_ID,
          version: randomUUID(),
          profile: this.resolveProfile(request, onboardingStage, false, current?.profile.createdAt ?? now, now),
          traits: [],
        })
        await this.writeState(state)
        return success(snapshotOverview(state))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenSaveStarRitualResult>>(error)
      }
    })
  }

  /**
   * Complete the ritual atomically and create only self-authored profile stars.
   * @param agent - Exact live Agent whose durable garden owns the Star Map.
   * @param request - Complete ritual input and observed profile version.
   * @returns The initialized profile and its self-report stars or a stable rejection.
   */
  @Remote('completeRitual')
  completeRitual(agent: Agent, request: MindGardenCompleteStarRitualRequest): Promise<MindGardenCompleteStarRitualResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = await this.readState()
        if (current?.profile.onboardingCompleted === true) return success(snapshotOverview(current))
        this.assertProfileVersion(current, request.ifVersion)
        const now = Date.now()
        const profile = this.resolveProfile(request, 3, true, current?.profile.createdAt ?? now, now)
        const traits = profile.selfWords.map((word): StoredStarTrait => ({
          id: randomUUID(),
          version: randomUUID(),
          kind: 'strength',
          status: 'self-reported',
          label: word,
          description: '',
          confidence: 1,
          source: 'ritual-self-report',
          createdAt: now,
          updatedAt: now,
        }))
        const state = storedStarStateSchema.parse({
          recordType: 'star-state',
          formatVersion: 1,
          id: STATE_ID,
          version: randomUUID(),
          profile,
          traits,
        })
        await this.writeState(state)
        return success(snapshotOverview(state))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCompleteStarRitualResult>>(error)
      }
    })
  }

  /**
   * Replace the completed profile without changing its governed trait history.
   * @param agent - Exact live Agent whose durable garden owns the Star Map.
   * @param request - Complete profile replacement and observed version.
   * @returns The updated projection or a stable rejection.
   */
  @Remote('updateProfile')
  updateProfile(agent: Agent, request: MindGardenUpdateStarProfileRequest): Promise<MindGardenUpdateStarProfileResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = await this.readState()
        if (current === undefined || !current.profile.onboardingCompleted) {
          throw new StarBusinessError({ code: 'star-ritual-required' })
        }
        this.assertProfileVersion(current, request.ifVersion)
        const now = Date.now()
        const state = storedStarStateSchema.parse({
          ...current,
          version: randomUUID(),
          profile: this.resolveProfile(request, 3, true, current.profile.createdAt, now),
        })
        await this.writeState(state)
        return success(snapshotOverview(state))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdateStarProfileResult>>(error)
      }
    })
  }

  /**
   * Decide or correct one trait without changing any other constellation record.
   * @param agent - Exact live Agent whose durable garden owns the Star Map.
   * @param request - Trait identity, observed version, and complete decision fields.
   * @returns The updated trait or a stable rejection.
   */
  @Remote('updateTrait')
  updateTrait(agent: Agent, request: MindGardenUpdateStarTraitRequest): Promise<MindGardenUpdateStarTraitResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = await this.readState()
        if (current === undefined || !current.profile.onboardingCompleted) {
          throw new StarBusinessError({ code: 'star-ritual-required' })
        }
        const index = current.traits.findIndex(trait => trait.id === request.id)
        const trait = current.traits[index]
        if (trait === undefined) throw new StarBusinessError({ code: 'star-trait-not-found', id: request.id })
        if (trait.version !== request.ifVersion) {
          throw new StarBusinessError({ code: 'star-trait-version-conflict', current: snapshotTrait(trait) })
        }
        if (trait.source === 'ritual-self-report'
          && request.status !== 'self-reported'
          && request.status !== 'retired') {
          this.invalid('trait', 'invalid')
        }
        const updated = storedStarTraitSchema.parse({
          ...trait,
          version: randomUUID(),
          status: request.status,
          label: request.label === undefined
            ? trait.label
            : this.text(request.label, 'trait', this.options.maxTraitTextBytes, true),
          description: request.description === undefined
            ? trait.description
            : this.text(request.description, 'trait', this.options.maxTraitTextBytes),
          updatedAt: Date.now(),
        })
        const traits = [...current.traits]
        traits[index] = updated
        const state = storedStarStateSchema.parse({ ...current, traits })
        await this.writeState(state)
        return success(snapshotTrait(updated))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdateStarTraitResult>>(error)
      }
    })
  }

  /**
   * Draw one provisional card from an exact permission-bounded evidence snapshot.
   * @param agent - Exact live Agent whose durable garden authorizes the draw.
   * @param request - Deck, optional question, civil date, tone, and optional route override.
   * @returns One encrypted draft card or a stable access, source, model, or lifecycle rejection.
   */
  @Remote('drawCard')
  drawCard(agent: Agent, request: MindGardenDrawStarCardRequest): Promise<MindGardenDrawStarCardResult> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-star-map: service is disposing'))
    const access = this.accessFailure(agent)
    if (access !== null) return Promise.resolve(rejected(access))
    if (this.observerOperation !== null) {
      return Promise.resolve(rejected({ code: 'star-observation-in-progress' }))
    }
    const controller = new AbortController()
    this.observationControllers.add(controller)
    const operation = this.runObservation(agent, request, controller.signal).finally(() => {
      this.observationControllers.delete(controller)
      this.observerOperation = null
    })
    this.observerOperation = operation
    return operation
  }

  /**
   * Continue one recoverable, card-owned conversation through the shared Observer lane.
   * @param agent - Exact live Agent whose durable garden owns the card.
   * @param request - Card CAS, user message, optional quick-reply kind, and route override.
   * @returns The card with one atomic user/assistant exchange and an inert revision proposal.
   */
  @Remote('continueCard')
  continueCard(agent: Agent, request: MindGardenContinueStarCardRequest): Promise<MindGardenContinueStarCardResult> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-star-map: service is disposing'))
    const access = this.accessFailure(agent)
    if (access !== null) return Promise.resolve(rejected(access))
    if (this.observerOperation !== null) {
      return Promise.resolve(rejected({ code: 'star-observation-in-progress' }))
    }
    const controller = new AbortController()
    this.observationControllers.add(controller)
    const operation = this.runDialogue(agent, request, controller.signal).finally(() => {
      this.observationControllers.delete(controller)
      this.observerOperation = null
    })
    this.observerOperation = operation
    return operation
  }

  /**
   * Accept the latest model-proposed revision without treating it as a fresh calibration.
   * @param agent - Exact live Agent whose durable garden owns the card.
   * @param request - Card CAS and exact pending revision identity rendered to the user.
   * @returns The explicitly revised card or a stable stale-revision rejection.
   */
  @Remote('applyCardRevision')
  applyCardRevision(
    agent: Agent,
    request: MindGardenApplyStarCardRevisionRequest,
  ): Promise<MindGardenApplyStarCardRevisionResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = await this.requireCompletedState()
        const index = current.cards.findIndex(card => card.id === request.id)
        const card = current.cards[index]
        if (card === undefined) throw new StarBusinessError({ code: 'star-card-not-found', id: request.id })
        if (card.version !== request.ifVersion) {
          throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) })
        }
        if (card.status === 'dissolved') {
          throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status })
        }
        const revision = card.pendingRevision
        if (revision === null || revision.id !== request.revisionId) {
          throw new StarBusinessError({ code: 'star-card-revision-conflict', current: snapshotCard(card) })
        }
        const now = Date.now()
        const traits = [...current.traits]
        if (card.traitId !== null) {
          const traitIndex = traits.findIndex(trait => trait.id === card.traitId)
          const linked = traits[traitIndex]
          if (linked === undefined) throw new CorruptStarStoreError('Star Observer card references a missing trait')
          traits[traitIndex] = storedStarTraitSchema.parse({
            ...linked,
            version: randomUUID(),
            kind: revision.traitKind,
            status: 'pending',
            label: revision.title,
            description: truncateUtf8(revision.frontText, this.options.maxTraitTextBytes),
            confidence: Math.min(revision.confidence, 0.55),
            updatedAt: now,
          })
        }
        const updated = storedStarCardSchema.parse({
          ...card,
          version: randomUUID(),
          title: revision.title,
          frontText: revision.frontText,
          analysis: revision.analysis,
          openQuestion: revision.openQuestion,
          traitKind: revision.traitKind,
          symbolicBasis: revision.symbolicBasis,
          confidence: revision.confidence,
          calibration: null,
          pendingRevision: null,
          updatedAt: now,
        })
        const cards = [...current.cards]
        cards[index] = updated
        await this.writeState(storedStarStateSchema.parse({ ...current, cards, traits }))
        return success(snapshotCard(updated))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenApplyStarCardRevisionResult>>(error)
      }
    })
  }

  /**
   * Record the user's verdict and create or revise only this card's governed trait.
   * @param agent - Exact live Agent whose durable garden owns the card.
   * @param request - Card identity, observed version, verdict, and optional correction.
   * @returns The revised draft card or a stable validation and concurrency rejection.
   */
  @Remote('calibrateCard')
  calibrateCard(
    agent: Agent,
    request: MindGardenCalibrateStarCardRequest,
  ): Promise<MindGardenCalibrateStarCardResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = await this.requireCompletedState()
        const index = current.cards.findIndex(card => card.id === request.id)
        const card = current.cards[index]
        if (card === undefined) throw new StarBusinessError({ code: 'star-card-not-found', id: request.id })
        if (card.version !== request.ifVersion) {
          throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) })
        }
        if (card.status === 'dissolved') {
          throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status })
        }
        if (!['resonates', 'uncertain', 'rejects'].includes(request.verdict)) {
          this.invalid('correction', 'invalid')
        }
        const correction = this.text(
          request.correction ?? '',
          'correction',
          this.options.maxTraitTextBytes,
          request.verdict === 'rejects',
        )
        const now = Date.now()
        const traitStatus = request.verdict === 'resonates' ? 'confirmed'
          : request.verdict === 'uncertain' ? 'uncertain'
            : 'rejected'
        const description = truncateUtf8(
          [card.frontText, correction].filter(Boolean).join('\n\nUser correction: '),
          this.options.maxTraitTextBytes,
        )
        const traits = [...current.traits]
        let linkedTraitId = card.traitId
        if (linkedTraitId === null) {
          this.assertTraitCapacity(traits)
          linkedTraitId = randomUUID()
          traits.push(storedStarTraitSchema.parse({
            id: linkedTraitId,
            version: randomUUID(),
            kind: card.traitKind,
            status: traitStatus,
            label: card.title,
            description,
            confidence: request.verdict === 'resonates'
              ? Math.min(card.confidence, 0.75)
              : request.verdict === 'uncertain' ? Math.min(card.confidence, 0.45) : 0,
            source: 'star-observer',
            createdAt: now,
            updatedAt: now,
          }))
        } else {
          const traitIndex = traits.findIndex(trait => trait.id === linkedTraitId)
          const linked = traits[traitIndex]
          if (linked === undefined) throw new CorruptStarStoreError('Star Observer card references a missing trait')
          traits[traitIndex] = storedStarTraitSchema.parse({
            ...linked,
            version: randomUUID(),
            kind: card.traitKind,
            status: traitStatus,
            label: card.title,
            description,
            confidence: request.verdict === 'resonates'
              ? Math.min(card.confidence, 0.75)
              : request.verdict === 'uncertain' ? Math.min(card.confidence, 0.45) : 0,
            updatedAt: now,
          })
        }
        const updated = storedStarCardSchema.parse({
          ...card,
          version: randomUUID(),
          calibration: { verdict: request.verdict, correction, createdAt: now },
          traitId: linkedTraitId,
          updatedAt: now,
        })
        const cards = [...current.cards]
        cards[index] = updated
        await this.writeState(storedStarStateSchema.parse({ ...current, traits, cards }))
        return success(snapshotCard(updated))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCalibrateStarCardResult>>(error)
      }
    })
  }

  /**
   * Save or dissolve one reviewed draft without silently upgrading an inference.
   * @param agent - Exact live Agent whose durable garden owns the card.
   * @param request - Card identity, observed version, and terminal action.
   * @returns The terminal card or a stable concurrency and lifecycle rejection.
   */
  @Remote('finalizeCard')
  finalizeCard(agent: Agent, request: MindGardenFinalizeStarCardRequest): Promise<MindGardenFinalizeStarCardResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = await this.requireCompletedState()
        const index = current.cards.findIndex(card => card.id === request.id)
        const card = current.cards[index]
        if (card === undefined) throw new StarBusinessError({ code: 'star-card-not-found', id: request.id })
        if (card.version !== request.ifVersion) {
          throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) })
        }
        if (card.status !== 'draft') {
          throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status })
        }
        const now = Date.now()
        const traits = [...current.traits]
        let linkedTraitId = card.traitId
        if (request.action === 'save' && card.cardKind === 'observation' && linkedTraitId === null) {
          this.assertTraitCapacity(traits)
          linkedTraitId = randomUUID()
          traits.push(storedStarTraitSchema.parse({
            id: linkedTraitId,
            version: randomUUID(),
            kind: card.traitKind,
            status: 'pending',
            label: card.title,
            description: truncateUtf8(card.frontText, this.options.maxTraitTextBytes),
            confidence: Math.min(card.confidence, 0.55),
            source: 'star-observer',
            createdAt: now,
            updatedAt: now,
          }))
        }
        if (request.action === 'dissolve' && linkedTraitId !== null) {
          const traitIndex = traits.findIndex(trait => trait.id === linkedTraitId)
          const linked = traits[traitIndex]
          if (linked === undefined) throw new CorruptStarStoreError('Star Observer card references a missing trait')
          traits[traitIndex] = storedStarTraitSchema.parse({
            ...linked,
            version: randomUUID(),
            status: 'retired',
            updatedAt: now,
          })
        }
        const updated = storedStarCardSchema.parse({
          ...card,
          version: randomUUID(),
          status: request.action === 'save' ? 'saved' : 'dissolved',
          traitId: linkedTraitId,
          updatedAt: now,
        })
        const cards = [...current.cards]
        cards[index] = updated
        await this.writeState(storedStarStateSchema.parse({ ...current, traits, cards }))
        return success(snapshotCard(updated))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenFinalizeStarCardResult>>(error)
      }
    })
  }

  private async runDialogue(
    agent: Agent,
    request: MindGardenContinueStarCardRequest,
    signal: AbortSignal,
  ): Promise<MindGardenContinueStarCardResult> {
    let prepared: PreparedDialogue
    try {
      prepared = await this.serialize(() => this.prepareDialogue(agent, request))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenContinueStarCardResult>>(error)
    }
    let rawOutput: string
    try {
      rawOutput = await this.callDialogueModel(agent, prepared, signal)
    } catch {
      await this.serialize(() => this.failDialogue(prepared.run.id, 'model-failed', ''))
      return rejected({ code: 'star-observer-model-failed' })
    }
    const proposal = decodeStarObserverDialogueOutput(
      rawOutput,
      prepared.envelope.evidence,
      prepared.cardKind,
    )
    if (proposal === null) {
      await this.serialize(() => this.failDialogue(prepared.run.id, 'invalid-output', rawOutput))
      return rejected({ code: 'star-observer-output-invalid' })
    }
    try {
      return success(await this.serialize(async () => {
        const current = await this.requireCompletedState()
        const cardIndex = current.cards.findIndex(card => card.id === prepared.run.cardId)
        const card = current.cards[cardIndex]
        if (card === undefined) throw new StarBusinessError({
          code: 'star-card-not-found',
          id: cardId(prepared.run.cardId),
        })
        if (card.version !== prepared.run.cardVersion) {
          await this.failDialogueInState(current, prepared.run.id, 'card-changed', rawOutput)
          throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) })
        }
        if (card.status === 'dissolved') {
          await this.failDialogueInState(current, prepared.run.id, 'card-changed', rawOutput)
          throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status })
        }
        if (card.turns.length + 2 > MAX_DIALOGUE_TURNS) {
          await this.failDialogueInState(current, prepared.run.id, 'card-changed', rawOutput)
          throw new StarBusinessError({ code: 'star-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS })
        }
        const now = Date.now()
        const userTurnId = randomUUID()
        const assistantTurnId = randomUUID()
        const updated = storedStarCardSchema.parse({
          ...card,
          version: randomUUID(),
          turns: [
            ...card.turns,
            {
              id: userTurnId,
              role: 'user',
              content: prepared.content,
              quickReplyKind: prepared.quickReplyKind,
              createdAt: now,
            },
            {
              id: assistantTurnId,
              role: 'assistant',
              content: proposal.reply,
              quickReplyKind: '',
              createdAt: now,
            },
          ],
          quickReplies: proposal.quickReplies,
          pendingRevision: proposal.revision === null ? null : {
            id: randomUUID(),
            ...proposal.revision,
            createdAt: now,
          },
          updatedAt: now,
        })
        const cards = [...current.cards]
        cards[cardIndex] = updated
        const runIndex = current.dialogueRuns.findIndex(run => run.id === prepared.run.id)
        if (runIndex < 0) throw new CorruptStarStoreError('Star Observer dialogue audit is missing')
        const dialogueRuns = [...current.dialogueRuns]
        dialogueRuns[runIndex] = storedStarDialogueRunSchema.parse({
          ...prepared.run,
          status: 'completed',
          failure: null,
          rawOutput,
          userTurnId,
          assistantTurnId,
          updatedAt: now,
        })
        await this.writeState(storedStarStateSchema.parse({ ...current, cards, dialogueRuns }))
        return snapshotCard(updated)
      }))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenContinueStarCardResult>>(error)
    }
  }

  private async prepareDialogue(
    agent: Agent,
    request: MindGardenContinueStarCardRequest,
  ): Promise<PreparedDialogue> {
    let current = await this.requireCompletedState()
    if (current.dialogueRuns.some(run => run.status === 'running')) {
      const now = Date.now()
      current = storedStarStateSchema.parse({
        ...current,
        dialogueRuns: current.dialogueRuns.map(run => run.status === 'running'
          ? { ...run, status: 'failed', failure: 'interrupted', updatedAt: now }
          : run),
      })
      await this.writeState(current)
    }
    const card = current.cards.find(item => item.id === request.id)
    if (card === undefined) throw new StarBusinessError({ code: 'star-card-not-found', id: request.id })
    if (card.version !== request.ifVersion) {
      throw new StarBusinessError({ code: 'star-card-version-conflict', current: snapshotCard(card) })
    }
    if (card.status === 'dissolved') {
      throw new StarBusinessError({ code: 'star-card-state-conflict', status: card.status })
    }
    if (card.turns.length + 2 > MAX_DIALOGUE_TURNS) {
      throw new StarBusinessError({ code: 'star-dialogue-limit-reached', maxTurns: MAX_DIALOGUE_TURNS })
    }
    const content = this.text(request.content, 'message', this.options.maxObserverMessageBytes, true)
    const quickReplyKind = request.quickReplyKind ?? ''
    if (!['', 'deepen', 'shift', 'correct'].includes(quickReplyKind)) this.invalid('message', 'invalid')
    const target = this.observationTarget(agent, request)
    if (target === null) throw new StarBusinessError({ code: 'star-observer-model-unavailable' })
    const envelope = buildStarObserverDialogueEnvelope(
      snapshotCard(card),
      content,
      quickReplyKind,
      this.options.maxObserverInputBytes,
    )
    if (envelope === null) {
      throw new StarBusinessError({
        code: 'star-observer-input-too-large',
        maxBytes: this.options.maxObserverInputBytes,
      })
    }
    const now = Date.now()
    const run = storedStarDialogueRunSchema.parse({
      id: randomUUID(),
      cardId: card.id,
      cardVersion: card.version,
      status: 'running',
      failure: null,
      provider: target.provider,
      model: target.model,
      system: envelope.system,
      prompt: envelope.prompt,
      rawOutput: '',
      userTurnId: null,
      assistantTurnId: null,
      createdAt: now,
      updatedAt: now,
    })
    await this.writeState(storedStarStateSchema.parse({
      ...current,
      dialogueRuns: [...current.dialogueRuns.slice(-31), run],
    }))
    return { run, cardKind: card.cardKind, tone: card.observerTone, envelope, content, quickReplyKind }
  }

  private async runObservation(
    agent: Agent,
    request: MindGardenDrawStarCardRequest,
    signal: AbortSignal,
  ): Promise<MindGardenDrawStarCardResult> {
    let prepared: PreparedObservation
    try {
      prepared = await this.serialize(() => this.prepareObservation(agent, request))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenDrawStarCardResult>>(error)
    }
    let rawOutput: string
    try {
      rawOutput = await this.callObservationModel(agent, prepared, signal)
    } catch {
      await this.serialize(() => this.failObservation(prepared.run.id, 'model-failed', ''))
      return rejected({ code: 'star-observer-model-failed' })
    }
    const proposal = decodeStarObserverOutput(rawOutput, prepared.envelope.evidence)
    if (proposal === null) {
      await this.serialize(() => this.failObservation(prepared.run.id, 'invalid-output', rawOutput))
      return rejected({ code: 'star-observer-output-invalid' })
    }
    try {
      return success(await this.serialize(async () => {
        const current = await this.requireCompletedState()
        if (current.version !== prepared.run.profileVersion
          || this.observerContextFingerprint(current) !== prepared.contextFingerprint) {
          await this.failObservationInState(current, prepared.run.id, 'context-changed', rawOutput)
          throw new StarBusinessError({ code: 'star-observer-context-changed' })
        }
        if (current.cards.some(card => card.status === 'draft')) {
          await this.failObservationInState(current, prepared.run.id, 'context-changed', rawOutput)
          throw new StarBusinessError({ code: 'star-observer-context-changed' })
        }
        const evidenceByKey = new Map(prepared.envelope.evidence.map((source, index) => [
          source.key,
          prepared.run.evidence[index],
        ]))
        const cited = proposal.evidenceKeys.map(key => evidenceByKey.get(key))
        if (cited.some(item => item === undefined)) {
          await this.failObservationInState(current, prepared.run.id, 'invalid-output', rawOutput)
          throw new StarBusinessError({ code: 'star-observer-output-invalid' })
        }
        const now = Date.now()
        const id = randomUUID()
        const card = storedStarCardSchema.parse({
          id,
          version: randomUUID(),
          status: 'draft',
          deck: prepared.deck,
          observerTone: prepared.tone,
          question: prepared.question,
          title: proposal.title,
          frontText: proposal.frontText,
          analysis: proposal.analysis,
          openQuestion: proposal.openQuestion,
          cardKind: cited.length > 0 ? 'observation' : 'imagination',
          traitKind: proposal.traitKind,
          symbolicBasis: proposal.symbolicBasis,
          evidence: cited,
          confidence: proposal.confidence,
          calibration: null,
          traitId: null,
          provider: prepared.run.provider,
          model: prepared.run.model,
          createdAt: now,
          updatedAt: now,
        })
        const cards = [...current.cards.slice(-63), card]
        const knownCardIds = new Set(cards.map(item => item.id))
        const completedRun = storedStarObservationRunSchema.parse({
          ...prepared.run,
          status: 'completed',
          failure: null,
          rawOutput,
          cardId: id,
          updatedAt: now,
        })
        const observationRuns = current.observationRuns
          .filter(run => run.id !== completedRun.id)
          .filter(run => run.cardId === null || knownCardIds.has(run.cardId))
          .concat(completedRun)
          .slice(-32)
        const dialogueRuns = current.dialogueRuns.filter(run => knownCardIds.has(run.cardId))
        await this.writeState(storedStarStateSchema.parse({
          ...current,
          cards,
          observationRuns,
          dialogueRuns,
        }))
        return snapshotCard(card)
      }))
    } catch (error) {
      return this.convertFailure<ResultFailure<MindGardenDrawStarCardResult>>(error)
    }
  }

  private async prepareObservation(
    agent: Agent,
    request: MindGardenDrawStarCardRequest,
  ): Promise<PreparedObservation> {
    let current = await this.requireCompletedState()
    const interrupted = current.observationRuns.some(run => run.status === 'running')
    if (interrupted) {
      const now = Date.now()
      current = storedStarStateSchema.parse({
        ...current,
        observationRuns: current.observationRuns.map(run => run.status === 'running'
          ? { ...run, status: 'failed', failure: 'interrupted', updatedAt: now }
          : run),
      })
      await this.writeState(current)
    }
    const activeCard = current.cards.find(card => card.status === 'draft')
    if (activeCard !== undefined) {
      throw new StarBusinessError({ code: 'star-active-card-exists', current: snapshotCard(activeCard) })
    }
    const target = this.observationTarget(agent, request)
    if (target === null) throw new StarBusinessError({ code: 'star-observer-model-unavailable' })
    const deck = request.deck === 'random'
      ? STAR_DECKS[Number.parseInt(randomUUID().slice(0, 2), 16) % STAR_DECKS.length] ?? 'current-self'
      : request.deck
    if (!STAR_DECKS.includes(deck)) this.invalid('question', 'invalid')
    const tone = request.observerTone ?? current.profile.observerTone
    if (!['gentle', 'direct', 'mystic'].includes(tone)) this.invalid('question', 'invalid')
    const question = this.text(request.question, 'question', this.options.maxObserverQuestionBytes)
    this.validateLocalDate(request.observedLocalDate)
    const sources = await this.observationSources(agent, current, request.observedLocalDate, question)
    const envelope = buildStarObserverEnvelope(
      snapshotProfile(current),
      current.traits.map(snapshotTrait),
      deck,
      question,
      tone,
      sources,
      this.options.maxObserverInputBytes,
    )
    if (envelope === null) {
      throw new StarBusinessError({
        code: 'star-observer-input-too-large',
        maxBytes: this.options.maxObserverInputBytes,
      })
    }
    const now = Date.now()
    const evidence = sources.map(source => ({
      id: randomUUID(),
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      summary: source.summary,
    }))
    const run = storedStarObservationRunSchema.parse({
      id: randomUUID(),
      status: 'running',
      failure: null,
      profileVersion: current.version,
      provider: target.provider,
      model: target.model,
      system: envelope.system,
      prompt: envelope.prompt,
      evidence,
      rawOutput: '',
      cardId: null,
      createdAt: now,
      updatedAt: now,
    })
    await this.writeState(storedStarStateSchema.parse({
      ...current,
      observationRuns: [...current.observationRuns.slice(-31), run],
    }))
    return {
      run,
      deck,
      tone,
      question,
      envelope,
      contextFingerprint: this.observerContextFingerprint(current),
    }
  }

  private observationTarget(
    agent: Agent,
    request: Pick<MindGardenDrawStarCardRequest, 'provider' | 'model'>,
  ): { readonly provider: string; readonly model: string } | null {
    const hasOverride = request.provider !== undefined || request.model !== undefined
    if (hasOverride) {
      if (request.provider === undefined
        || request.provider.trim().length === 0
        || request.model === undefined
        || request.model.trim().length === 0) return null
      return { provider: request.provider.trim(), model: request.model.trim() }
    }
    if (this.options.observerProvider.length > 0) {
      return { provider: this.options.observerProvider, model: this.options.observerModel }
    }
    const latest = agent.session.requestHeader()?.config
    if (latest !== undefined) return { provider: latest.provider, model: latest.model }
    if (agent.options.provider !== undefined
      && agent.options.provider.length > 0
      && agent.options.model !== undefined
      && agent.options.model.length > 0) {
      return { provider: agent.options.provider, model: agent.options.model }
    }
    return null
  }

  private async observationSources(
    agent: Agent,
    state: StoredStarState,
    localDate: string,
    question: string,
  ): Promise<readonly StarObserverSource[]> {
    const candidates: Array<Omit<StarObserverSource, 'key'>> = []
    const add = (sourceType: StarObserverSource['sourceType'], sourceId: string, summary: string): void => {
      const bounded = truncateUtf8(summary.trim(), this.options.maxObserverSourceBytes)
      if (bounded.length > 0) candidates.push({ sourceType, sourceId, summary: bounded })
    }
    const permissions = state.profile.permissions
    if (permissions.dailyReflections) {
      const result = await this.ctx.mindGardenReflection.authorizedContext(agent, {
        localDate,
        query: question || state.profile.observationIntent,
      })
      if (!result.ok) throw new StarBusinessError({ code: 'star-source-unavailable', source: 'daily-reflection' })
      const checkin = result.value.todayCheckin
      if (checkin !== null) {
        add(
          'daily-reflection',
          String(checkin.id),
          `Check-in ${checkin.stamp.localDate}: mood ${checkin.moodBand}; energy ${checkin.energyBand}; emotions ${checkin.emotionWords.join(', ') || 'not recorded'}.`,
        )
      }
      for (const journal of result.value.retrievableJournals) {
        add('daily-reflection', String(journal.id), `${journal.localDate} — ${journal.title}\n${journal.body}`)
      }
    }
    if (permissions.confirmedMemories) {
      const result = await this.ctx.mindGardenMemory.list(agent)
      if (!result.ok) throw new StarBusinessError({ code: 'star-source-unavailable', source: 'confirmed-memory' })
      for (const memory of result.value.items) {
        if ((memory.status === 'confirmed' || memory.status === 'temporary')
          && memory.sensitivity === 'normal'
          && memory.recallPolicy !== 'never') {
          add(
            'confirmed-memory',
            String(memory.id),
            `${memory.kind}: ${memory.content}${memory.scope === undefined ? '' : `\nScope: ${memory.scope}`}`,
          )
        }
      }
    }
    if (permissions.openQuestions) {
      const result = await this.ctx.mindGardenReflection.openQuestionContext(agent, {})
      if (!result.ok) throw new StarBusinessError({ code: 'star-source-unavailable', source: 'open-question' })
      for (const openQuestion of result.value.openQuestions) {
        add(
          'open-question',
          String(openQuestion.id),
          `${openQuestion.createdLocalDate}: ${openQuestion.question}${openQuestion.evidenceQuote.length === 0 ? '' : `\nEvidence: ${openQuestion.evidenceQuote}`}`,
        )
      }
    }
    if (permissions.periodReviews) {
      const result = await this.ctx.mindGardenReflection.listPeriodReviews(agent, {})
      if (!result.ok) throw new StarBusinessError({ code: 'star-source-unavailable', source: 'period-review' })
      for (const review of result.value.reviews) {
        if (review.status === 'saved') {
          add(
            'period-review',
            String(review.id),
            `${review.periodType} ${review.startStamp.localDate}–${review.endStamp.localDate}\n${review.content}`,
          )
        }
      }
    }
    return Object.freeze(candidates.slice(0, this.options.maxObserverSources).map((source, index) => Object.freeze({
      ...source,
      key: `e${index + 1}`,
    })))
  }

  private async callObservationModel(
    agent: Agent,
    prepared: PreparedObservation,
    signal: AbortSignal,
  ): Promise<string> {
    const assembler = new BlockAssembler()
    const options: GenerateOptions = {
      provider: prepared.run.provider,
      model: prepared.run.model,
      system: prepared.envelope.system,
      messages: [createUserMessage({
        content: [{ type: 'text', text: prepared.envelope.prompt }],
        source: { kind: 'plugin', plugin: name },
      })],
      temperature: prepared.tone === 'direct' ? 0.25 : prepared.tone === 'mystic' ? 0.55 : 0.4,
      maxTokens: this.options.maxObserverOutputTokens,
      sessionId: agent.session.id,
      purpose: 'mind-garden-star-observer-draw',
      signal,
    }
    for await (const chunk of this.ctx.llm.stream(options)) assembler.push(chunk)
    if (this.observationFinishFailed(assembler.finish)) {
      throw new Error('Star Observer model did not finish completely')
    }
    const blocks = assembler.blocks()
    if (blocks.some(block => block.type !== 'text' && block.type !== 'reasoning')) {
      throw new Error('Star Observer model returned executable content')
    }
    const output = blocks.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
    if (output.trim().length === 0) throw new Error('Star Observer model returned empty content')
    return output
  }

  private async callDialogueModel(
    agent: Agent,
    prepared: PreparedDialogue,
    signal: AbortSignal,
  ): Promise<string> {
    const assembler = new BlockAssembler()
    const options: GenerateOptions = {
      provider: prepared.run.provider,
      model: prepared.run.model,
      system: prepared.envelope.system,
      messages: [createUserMessage({
        content: [{ type: 'text', text: prepared.envelope.prompt }],
        source: { kind: 'plugin', plugin: name },
      })],
      temperature: prepared.tone === 'direct' ? 0.25 : prepared.tone === 'mystic' ? 0.55 : 0.4,
      maxTokens: this.options.maxObserverOutputTokens,
      sessionId: agent.session.id,
      purpose: 'mind-garden-star-observer-dialogue',
      signal,
    }
    for await (const chunk of this.ctx.llm.stream(options)) assembler.push(chunk)
    if (this.observationFinishFailed(assembler.finish)) {
      throw new Error('Star Observer dialogue model did not finish completely')
    }
    const blocks = assembler.blocks()
    if (blocks.some(block => block.type !== 'text' && block.type !== 'reasoning')) {
      throw new Error('Star Observer dialogue model returned executable content')
    }
    const output = blocks.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
    if (output.trim().length === 0) throw new Error('Star Observer dialogue model returned empty content')
    return output
  }

  private observationFinishFailed(finish: FinishReason): boolean {
    return finish.kind !== 'stop'
  }

  private observerContextFingerprint(state: StoredStarState): string {
    return JSON.stringify({
      profileVersion: state.version,
      traits: state.traits
        .filter(trait => trait.status === 'self-reported' || trait.status === 'confirmed')
        .map(trait => [trait.id, trait.version, trait.kind, trait.status, trait.label, trait.description]),
    })
  }

  private async failObservation(
    runId: string,
    failure: StoredStarObservationRun['failure'],
    rawOutput: string,
  ): Promise<void> {
    const current = await this.requireCompletedState()
    await this.failObservationInState(current, runId, failure, rawOutput)
  }

  private async failDialogue(
    runId: string,
    failure: StoredStarDialogueRun['failure'],
    rawOutput: string,
  ): Promise<void> {
    const current = await this.requireCompletedState()
    await this.failDialogueInState(current, runId, failure, rawOutput)
  }

  private async failDialogueInState(
    current: StoredStarState,
    runId: string,
    failure: StoredStarDialogueRun['failure'],
    rawOutput: string,
  ): Promise<void> {
    const index = current.dialogueRuns.findIndex(run => run.id === runId)
    const run = current.dialogueRuns[index]
    if (run === undefined || run.status !== 'running' || failure === null) return
    const dialogueRuns = [...current.dialogueRuns]
    dialogueRuns[index] = storedStarDialogueRunSchema.parse({
      ...run,
      status: 'failed',
      failure,
      rawOutput,
      updatedAt: Date.now(),
    })
    await this.writeState(storedStarStateSchema.parse({ ...current, dialogueRuns }))
  }

  private async failObservationInState(
    current: StoredStarState,
    runId: string,
    failure: StoredStarObservationRun['failure'],
    rawOutput: string,
  ): Promise<void> {
    const index = current.observationRuns.findIndex(run => run.id === runId)
    const run = current.observationRuns[index]
    if (run === undefined || run.status !== 'running' || failure === null) return
    const observationRuns = [...current.observationRuns]
    observationRuns[index] = storedStarObservationRunSchema.parse({
      ...run,
      status: 'failed',
      failure,
      rawOutput,
      updatedAt: Date.now(),
    })
    await this.writeState(storedStarStateSchema.parse({ ...current, observationRuns }))
  }

  private async requireCompletedState(): Promise<StoredStarState> {
    const current = await this.readState()
    if (current === undefined || !current.profile.onboardingCompleted) {
      throw new StarBusinessError({ code: 'star-ritual-required' })
    }
    return current
  }

  private validateLocalDate(value: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) this.invalid('observedLocalDate', 'invalid')
    const parts = value.split('-').map(Number)
    const year = parts[0] ?? Number.NaN
    const month = parts[1] ?? Number.NaN
    const day = parts[2] ?? Number.NaN
    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      this.invalid('observedLocalDate', 'invalid')
    }
  }

  private assertTraitCapacity(traits: readonly StoredStarTrait[]): void {
    if (traits.length >= MAX_STORED_TRAITS) {
      throw new StarBusinessError({ code: 'star-trait-limit-reached', max: MAX_STORED_TRAITS })
    }
  }

  private accessFailure(agent: Agent): MindGardenStarAccessDenied | null {
    if (this.ctx.agents.get(agent.id) !== agent) {
      throw new Error(`mind-garden-star-map: agent '${agent.id}' is not live in this registry`)
    }
    const state = this.ctx.mindGarden.current(agent.session)
    if (state === null) return { code: 'mind-garden-not-active' }
    if (state.privacy !== 'durable') return { code: 'durable-session-required' }
    return null
  }

  private resolveProfile(
    input: MindGardenStarProfileInput,
    onboardingStage: 0 | 1 | 2 | 3,
    onboardingCompleted: boolean,
    createdAt: number,
    updatedAt: number,
  ): StoredStarProfile {
    const displayName = this.text(input.displayName, 'displayName', this.options.maxDisplayNameBytes, onboardingCompleted)
    this.validateBirthDate(input.birthMonth, input.birthDay, input.birthYear)
    const birthTime = input.birthTimeKnown
      ? this.text(input.birthTime, 'birthTime', 5, true)
      : ''
    if (input.birthTimeKnown && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) this.invalid('birthTime', 'invalid')
    const birthCity = input.birthCityKnown
      ? this.text(input.birthCity, 'birthCity', this.options.maxLocationBytes, true)
      : ''
    const mbti = this.resolveMbti(input)
    const selfWords = this.resolveSelfWords(input.selfWords, onboardingCompleted)
    const observationIntent = this.text(
      input.observationIntent,
      'observationIntent',
      this.options.maxIntentBytes,
      onboardingCompleted,
    )
    return {
      onboardingStage,
      onboardingCompleted,
      displayName,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      birthYear: input.birthYear,
      birthTime,
      birthTimeKnown: input.birthTimeKnown,
      birthCity,
      birthCityKnown: input.birthCityKnown,
      mbtiMode: input.mbtiMode,
      mbtiType: mbti.type,
      mbtiAnswers: [...mbti.answers],
      selfWords,
      observationIntent,
      observerTone: input.observerTone,
      permissions: { ...input.permissions },
      reducedMotion: input.reducedMotion,
      createdAt,
      updatedAt,
    }
  }

  private resolveMbti(input: MindGardenStarProfileInput): {
    readonly type: string
    readonly answers: readonly MindGardenStarSceneAnswer[]
  } {
    if (input.mbtiMode === 'observe') return { type: '', answers: [] }
    if (input.mbtiMode === 'known') {
      const type = input.mbtiType.trim().toUpperCase()
      if (!/^[EI][SN][TF][JP]$/.test(type)) this.invalid('mbti', 'invalid')
      return { type, answers: [] }
    }
    if (input.mbtiAnswers.length !== 6
      || input.mbtiAnswers.some((answer, index) => !answer.startsWith(String(index + 1)))) {
      return this.invalid('mbti', 'invalid')
    }
    return { type: sceneMbti(input.mbtiAnswers), answers: [...input.mbtiAnswers] }
  }

  private resolveSelfWords(values: readonly string[], required: boolean): string[] {
    if (values.length > this.options.maxSelfWords || (required && values.length === 0)) {
      this.invalid('selfWords', values.length === 0 ? 'blank' : 'invalid')
    }
    const words = values.map(value => this.text(value, 'selfWords', this.options.maxTraitTextBytes, true))
    if (new Set(words).size !== words.length) this.invalid('selfWords', 'duplicate')
    return words
  }

  private validateBirthDate(month: number | null, day: number | null, year: number | null): void {
    if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
      this.invalid('birthDate', 'invalid')
    }
    if ((month === null) !== (day === null)) this.invalid('birthDate', 'invalid')
    if (month === null || day === null) return
    if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      this.invalid('birthDate', 'invalid')
    }
    const validationYear = year ?? 2000
    const date = new Date(Date.UTC(validationYear, month - 1, day))
    if (date.getUTCFullYear() !== validationYear || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      this.invalid('birthDate', 'invalid')
    }
  }

  private assertProfileVersion(
    state: StoredStarState | undefined,
    ifVersion: MindGardenStarProfile['version'],
  ): void {
    if ((state === undefined && ifVersion !== null)
      || (state !== undefined && state.version !== ifVersion)) {
      throw new StarBusinessError({
        code: 'star-profile-version-conflict',
        current: state === undefined ? defaultStarProfile() : snapshotProfile(state),
      })
    }
  }

  private text(
    value: string,
    field: MindGardenStarInvalidField['field'],
    maxBytes: number,
    requireValue = false,
  ): string {
    const text = value.trim()
    if (requireValue && text.length === 0) this.invalid(field, 'blank')
    if (Buffer.byteLength(text, 'utf8') > maxBytes) this.invalid(field, 'too-large', maxBytes)
    return text
  }

  private invalid(
    field: MindGardenStarInvalidField['field'],
    reason: MindGardenStarInvalidField['reason'],
    maxBytes?: number,
  ): never {
    throw new StarBusinessError({
      code: 'invalid-field',
      field,
      reason,
      ...(maxBytes === undefined ? {} : { maxBytes }),
    })
  }

  private async readState(): Promise<StoredStarState | undefined> {
    const entries = await this.ctx.mindGardenVault.entries('stars')
    try {
      if (entries.length === 0) return undefined
      if (entries.length !== 1) throw new TypeError('Star Map vault contains more than one aggregate')
      const [id, value] = entries[0] ?? []
      const state = decodeStoredStarState(value)
      if (state.id !== id || state.id !== STATE_ID) {
        throw new TypeError('vault id differs from authenticated Star Map id')
      }
      return state
    } catch (error) {
      throw new CorruptStarStoreError('Mind Garden Star Map plaintext record is invalid', { cause: error })
    }
  }

  private async writeState(state: StoredStarState): Promise<void> {
    const validated = decodeStoredStarState(state)
    await this.ctx.mindGardenVault.put(
      'stars',
      MindGardenVaultRecordId(validated.id),
      validated,
    )
  }

  private convertFailure<E extends MindGardenStarFailure>(error: unknown): MindGardenStarRejected<E> {
    if (error instanceof StarBusinessError) return rejected(error.failure as E)
    if (error instanceof CorruptStarStoreError) {
      return rejected({ code: 'vault-unavailable', state: 'corrupt-state' } as E)
    }
    if (error instanceof MindGardenVaultError) {
      const state: MindGardenStarVaultUnavailable['state'] =
        error.code === 'locked' ? 'locked'
          : error.code === 'invalid-key' ? 'invalid-key'
            : error.code === 'key-mismatch' ? 'key-mismatch'
              : 'corrupt-state'
      return rejected({ code: 'vault-unavailable', state } as E)
    }
    throw error
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-star-map: service is disposing'))
    return this.serialize(operation)
  }

  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationTail.then(operation)
    this.operationTail = result.then(() => undefined, () => undefined)
    return result
  }
}

type ResultFailure<T> = T extends MindGardenStarRejected<infer E> ? E : never

export default MindGardenStarMapService
