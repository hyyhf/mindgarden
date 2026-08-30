/**
 * Encrypted reflections, governed principles, calendar projections, trends, and authorized context.
 * @module @deepseek-ai/dsh-mind-garden/reflection
 */

import { Buffer } from 'node:buffer'
import { createHash, randomUUID } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import s from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-mind-garden/core'
import {
  MindGardenVaultError,
  MindGardenVaultRecordId,
} from '@deepseek-ai/dsh-mind-garden/vault'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import {
  decodeStoredReflection,
  storedCheckinSchema,
  storedContemplationSchema,
  storedConcernSchema,
  storedExperimentSchema,
  storedJournalSchema,
  storedOpenQuestionSchema,
  storedPeriodReviewSchema,
  storedPrincipleProposalSchema,
  storedPrincipleSchema,
  type StoredCheckin,
  type StoredContemplation,
  type StoredConcern,
  type StoredExperiment,
  type StoredJournal,
  type StoredOpenQuestion,
  type StoredPeriodReview,
  type StoredPrinciple,
  type StoredPrincipleProposal,
  type StoredReflectionRecord,
} from './records.ts'
import type {
  MindGardenAcceptPrincipleProposalRequest,
  MindGardenAcceptPrincipleProposalResult,
  MindGardenAuthorizedContextRequest,
  MindGardenAuthorizedContextResult,
  MindGardenAuthorizedContextValue,
  MindGardenAuthorizedJournalExcerpt,
  MindGardenCalendarDayRequest,
  MindGardenCalendarDayResult,
  MindGardenCalendarDayValue,
  MindGardenCalendarEvent,
  MindGardenCalendarMonthDay,
  MindGardenCalendarMonthRequest,
  MindGardenCalendarMonthResult,
  MindGardenCalendarMonthValue,
  MindGardenCalendarStamp,
  MindGardenCheckin,
  MindGardenConfirmContemplationRequest,
  MindGardenConfirmContemplationResult,
  MindGardenContemplation,
  MindGardenContemplationListValue,
  MindGardenContemplationLocked,
  MindGardenContemplationVersionConflict,
  MindGardenCompleteConcernRequest,
  MindGardenCompleteConcernResult,
  MindGardenConcern,
  MindGardenConcernClosed,
  MindGardenConcernConversionValue,
  MindGardenConcernListValue,
  MindGardenConcernReminder,
  MindGardenConcernVersionConflict,
  MindGardenConvertConcernRequest,
  MindGardenConvertConcernResult,
  MindGardenCreateCheckinRequest,
  MindGardenCreateCheckinResult,
  MindGardenCreateContemplationRequest,
  MindGardenCreateContemplationResult,
  MindGardenCreateConcernRequest,
  MindGardenCreateConcernResult,
  MindGardenCreateExperimentRequest,
  MindGardenCreateExperimentResult,
  MindGardenCreateJournalRequest,
  MindGardenCreateJournalResult,
  MindGardenCreateOpenQuestionRequest,
  MindGardenCreateOpenQuestionResult,
  MindGardenCreatePeriodReviewRequest,
  MindGardenCreatePeriodReviewResult,
  MindGardenDeleteJournalRequest,
  MindGardenDeleteJournalResult,
  MindGardenDeleteJournalValue,
  MindGardenDeleteContemplationRequest,
  MindGardenDeleteContemplationResult,
  MindGardenDeleteContemplationValue,
  MindGardenEnergyBand,
  MindGardenExperiment,
  MindGardenExperimentListValue,
  MindGardenExperimentObservation,
  MindGardenExperimentObservationEvent,
  MindGardenExperimentReviewEvent,
  MindGardenExperimentStateConflict,
  MindGardenExperimentVersionConflict,
  MindGardenJournal,
  MindGardenListConcernsRequest,
  MindGardenListConcernsResult,
  MindGardenListContemplationsRequest,
  MindGardenListContemplationsResult,
  MindGardenListExperimentsRequest,
  MindGardenListExperimentsResult,
  MindGardenListOpenQuestionsRequest,
  MindGardenListOpenQuestionsResult,
  MindGardenListPrincipleProposalsRequest,
  MindGardenListPrincipleProposalsResult,
  MindGardenListPrinciplesRequest,
  MindGardenListPrinciplesResult,
  MindGardenListPeriodReviewsRequest,
  MindGardenListPeriodReviewsResult,
  MindGardenMoodBand,
  MindGardenObserveExperimentRequest,
  MindGardenObserveExperimentResult,
  MindGardenOpenQuestion,
  MindGardenOpenQuestionCalendarEvent,
  MindGardenOpenQuestionContextRequest,
  MindGardenOpenQuestionContextResult,
  MindGardenOpenQuestionContextValue,
  MindGardenOpenQuestionListValue,
  MindGardenOpenQuestionTransition,
  MindGardenOpenQuestionTransitionLimit,
  MindGardenOpenQuestionVersionConflict,
  MindGardenPeriodReview,
  MindGardenPeriodReviewListValue,
  MindGardenPeriodReviewMaterialItem,
  MindGardenPeriodReviewMaterialRequest,
  MindGardenPeriodReviewMaterialResult,
  MindGardenPeriodReviewMaterialValue,
  MindGardenPeriodReviewSource,
  MindGardenPeriodReviewSourceLimit,
  MindGardenPeriodReviewStaleSource,
  MindGardenPrinciple,
  MindGardenPrincipleCalendarEvent,
  MindGardenPrincipleContent,
  MindGardenPrincipleListValue,
  MindGardenPrincipleProposal,
  MindGardenPrincipleProposalClosed,
  MindGardenPrincipleProposalListValue,
  MindGardenPrincipleProposalVersionConflict,
  MindGardenPrincipleVersion,
  MindGardenPrincipleVersionConflict,
  MindGardenProposePrincipleRequest,
  MindGardenProposePrincipleResult,
  MindGardenRejectPrincipleProposalRequest,
  MindGardenRejectPrincipleProposalResult,
  MindGardenReflectionAccessDenied,
  MindGardenReflectionFailure,
  MindGardenReflectionId,
  MindGardenReflectionInvalidField,
  MindGardenReflectionRejected,
  MindGardenReflectionSuccess,
  MindGardenReflectionTrendRequest,
  MindGardenReflectionTrendResult,
  MindGardenReflectionTrendValue,
  MindGardenReflectionVaultUnavailable,
  MindGardenReflectionVersion,
  MindGardenUpdateJournalRequest,
  MindGardenUpdateJournalResult,
  MindGardenUpdateOpenQuestionRequest,
  MindGardenUpdateOpenQuestionResult,
  MindGardenUpdatePeriodReviewRequest,
  MindGardenUpdatePeriodReviewResult,
  MindGardenUpdateConcernRequest,
  MindGardenUpdateConcernResult,
  MindGardenUpdateContemplationRequest,
  MindGardenUpdateContemplationResult,
  MindGardenRevisePrincipleRequest,
  MindGardenRevisePrincipleResult,
  MindGardenReviseExperimentRequest,
  MindGardenReviseExperimentResult,
  MindGardenScheduleExperimentRequest,
  MindGardenScheduleExperimentResult,
  MindGardenStartExperimentRequest,
  MindGardenStartExperimentResult,
  MindGardenStopExperimentRequest,
  MindGardenStopExperimentResult,
} from './types.ts'

export type * from './types.ts'
export {
  decodeStoredReflection,
  storedCheckinSchema,
  storedContemplationSchema,
  storedConcernSchema,
  storedExperimentSchema,
  storedJournalSchema,
  storedOpenQuestionSchema,
  storedPeriodReviewSchema,
  storedPrincipleProposalSchema,
  storedPrincipleSchema,
} from './records.ts'

/** Cordis plugin name. */
export const name = 'mind-garden-reflection'

const DEFAULT_MAX_TITLE_BYTES = 512
const DEFAULT_MAX_BODY_BYTES = 64 * 1024
const DEFAULT_MAX_CONCERN_BYTES = 64 * 1024
const DEFAULT_MAX_CONTEMPLATION_BYTES = 128 * 1024
const DEFAULT_MAX_EMOTION_WORD_BYTES = 64
const DEFAULT_MAX_TIME_ZONE_BYTES = 128
const DEFAULT_MAX_QUERY_BYTES = 8 * 1024
const DEFAULT_MAX_CONTEXT_JOURNALS = 3
const DEFAULT_MAX_CONTEXT_BODY_BYTES = 1600
const DEFAULT_MAX_CONCERNS_PER_LIST = 100
const DEFAULT_MAX_CONTEMPLATIONS_PER_LIST = 100
const DEFAULT_MAX_PRINCIPLE_FIELD_BYTES = 16 * 1024
const DEFAULT_MAX_PRINCIPLE_ITEMS = 50
const DEFAULT_MAX_PRINCIPLE_VERSIONS = 100
const DEFAULT_MAX_PRINCIPLE_PROPOSALS_PER_LIST = 100
const DEFAULT_MAX_PRINCIPLES_PER_LIST = 100
const DEFAULT_MAX_EXPERIMENT_FIELD_BYTES = 16 * 1024
const DEFAULT_MAX_EXPERIMENT_OBSERVATIONS = 100
const DEFAULT_MAX_EXPERIMENTS_PER_LIST = 100
const DEFAULT_MAX_OPEN_QUESTION_BYTES = 16 * 1024
const DEFAULT_MAX_OPEN_QUESTION_TRANSITIONS = 100
const DEFAULT_MAX_OPEN_QUESTIONS_PER_LIST = 100
const DEFAULT_MAX_CONTEXT_OPEN_QUESTIONS = 3
const DEFAULT_MAX_PERIOD_REVIEW_CONTENT_BYTES = 128 * 1024
const DEFAULT_MAX_PERIOD_REVIEW_MATERIAL_ITEM_BYTES = 8 * 1024
const DEFAULT_MAX_PERIOD_REVIEW_SOURCES = 200
const DEFAULT_MAX_PERIOD_REVIEWS_PER_LIST = 100
const MAX_SOURCE_SESSION_ID_BYTES = 1024
const MAX_EMOTION_WORDS = 3

/** Cordis plugin configuration. */
export interface Config {
  /** Maximum UTF-8 bytes accepted for a journal title. */
  maxTitleBytes?: number
  /** Maximum UTF-8 bytes accepted for a journal body. */
  maxBodyBytes?: number
  /** Maximum UTF-8 bytes accepted for one concern. */
  maxConcernBytes?: number
  /** Maximum UTF-8 bytes accepted for one contemplation note. */
  maxContemplationBytes?: number
  /** Maximum UTF-8 bytes accepted for one emotion word. */
  maxEmotionWordBytes?: number
  /** Maximum UTF-8 bytes accepted for one IANA time-zone name. */
  maxTimeZoneBytes?: number
  /** Maximum UTF-8 bytes accepted for an authorized-context query. */
  maxQueryBytes?: number
  /** Maximum authorized journal excerpts returned by one query. */
  maxContextJournals?: number
  /** Maximum UTF-8 bytes returned from each authorized journal body. */
  maxContextBodyBytes?: number
  /** Maximum concerns returned by one list request. */
  maxConcernsPerList?: number
  /** Maximum contemplation notes returned by one list request. */
  maxContemplationsPerList?: number
  /** Maximum UTF-8 bytes accepted for each principle text field. */
  maxPrincipleFieldBytes?: number
  /** Maximum supporting experiences or applicability entries in one principle. */
  maxPrincipleItems?: number
  /** Maximum append-only versions retained by one principle. */
  maxPrincipleVersions?: number
  /** Maximum principle proposals returned by one list request. */
  maxPrincipleProposalsPerList?: number
  /** Maximum principles returned by one list request. */
  maxPrinciplesPerList?: number
  /** Maximum UTF-8 bytes accepted for each reality-experiment text field. */
  maxExperimentFieldBytes?: number
  /** Maximum append-only observations retained by one reality experiment. */
  maxExperimentObservations?: number
  /** Maximum reality experiments returned by one list request. */
  maxExperimentsPerList?: number
  /** Maximum UTF-8 bytes accepted for one open question or its evidence quote. */
  maxOpenQuestionBytes?: number
  /** Maximum append-only lifecycle transitions retained by one open question. */
  maxOpenQuestionTransitions?: number
  /** Maximum open questions returned by one list request. */
  maxOpenQuestionsPerList?: number
  /** Maximum unresolved questions released by the dedicated context operation. */
  maxContextOpenQuestions?: number
  /** Maximum UTF-8 bytes accepted for one period-review document. */
  maxPeriodReviewContentBytes?: number
  /** Maximum UTF-8 bytes returned for each period-review material item. */
  maxPeriodReviewMaterialItemBytes?: number
  /** Maximum authenticated source records admitted into one period-review material snapshot. */
  maxPeriodReviewSources?: number
  /** Maximum period reviews returned by one list request. */
  maxPeriodReviewsPerList?: number
}

interface ResolvedConfig {
  readonly maxTitleBytes: number
  readonly maxBodyBytes: number
  readonly maxConcernBytes: number
  readonly maxContemplationBytes: number
  readonly maxEmotionWordBytes: number
  readonly maxTimeZoneBytes: number
  readonly maxQueryBytes: number
  readonly maxContextJournals: number
  readonly maxContextBodyBytes: number
  readonly maxConcernsPerList: number
  readonly maxContemplationsPerList: number
  readonly maxPrincipleFieldBytes: number
  readonly maxPrincipleItems: number
  readonly maxPrincipleVersions: number
  readonly maxPrincipleProposalsPerList: number
  readonly maxPrinciplesPerList: number
  readonly maxExperimentFieldBytes: number
  readonly maxExperimentObservations: number
  readonly maxExperimentsPerList: number
  readonly maxOpenQuestionBytes: number
  readonly maxOpenQuestionTransitions: number
  readonly maxOpenQuestionsPerList: number
  readonly maxContextOpenQuestions: number
  readonly maxPeriodReviewContentBytes: number
  readonly maxPeriodReviewMaterialItemBytes: number
  readonly maxPeriodReviewSources: number
  readonly maxPeriodReviewsPerList: number
}

type ResultFailure<T> = T extends MindGardenReflectionRejected<infer E> ? E : never
type StoredConvertingConcern = StoredConcern & {
  readonly status: 'converting'
  readonly conversion: NonNullable<StoredConcern['conversion']>
}

class ReflectionBusinessError extends Error {
  constructor(readonly failure: MindGardenReflectionFailure) {
    super(failure.code)
  }
}

class CorruptReflectionStoreError extends Error {}

function positiveSafeInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TypeError(`mind-garden-reflection: ${field} must be a positive safe integer`)
  }
  return value
}

function resolveConfig(config: Config): ResolvedConfig {
  return {
    maxTitleBytes: positiveSafeInteger(config.maxTitleBytes ?? DEFAULT_MAX_TITLE_BYTES, 'maxTitleBytes'),
    maxBodyBytes: positiveSafeInteger(config.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES, 'maxBodyBytes'),
    maxConcernBytes: positiveSafeInteger(
      config.maxConcernBytes ?? DEFAULT_MAX_CONCERN_BYTES,
      'maxConcernBytes',
    ),
    maxContemplationBytes: positiveSafeInteger(
      config.maxContemplationBytes ?? DEFAULT_MAX_CONTEMPLATION_BYTES,
      'maxContemplationBytes',
    ),
    maxEmotionWordBytes: positiveSafeInteger(
      config.maxEmotionWordBytes ?? DEFAULT_MAX_EMOTION_WORD_BYTES,
      'maxEmotionWordBytes',
    ),
    maxTimeZoneBytes: positiveSafeInteger(
      config.maxTimeZoneBytes ?? DEFAULT_MAX_TIME_ZONE_BYTES,
      'maxTimeZoneBytes',
    ),
    maxQueryBytes: positiveSafeInteger(config.maxQueryBytes ?? DEFAULT_MAX_QUERY_BYTES, 'maxQueryBytes'),
    maxContextJournals: positiveSafeInteger(
      config.maxContextJournals ?? DEFAULT_MAX_CONTEXT_JOURNALS,
      'maxContextJournals',
    ),
    maxContextBodyBytes: positiveSafeInteger(
      config.maxContextBodyBytes ?? DEFAULT_MAX_CONTEXT_BODY_BYTES,
      'maxContextBodyBytes',
    ),
    maxConcernsPerList: positiveSafeInteger(
      config.maxConcernsPerList ?? DEFAULT_MAX_CONCERNS_PER_LIST,
      'maxConcernsPerList',
    ),
    maxContemplationsPerList: positiveSafeInteger(
      config.maxContemplationsPerList ?? DEFAULT_MAX_CONTEMPLATIONS_PER_LIST,
      'maxContemplationsPerList',
    ),
    maxPrincipleFieldBytes: positiveSafeInteger(
      config.maxPrincipleFieldBytes ?? DEFAULT_MAX_PRINCIPLE_FIELD_BYTES,
      'maxPrincipleFieldBytes',
    ),
    maxPrincipleItems: positiveSafeInteger(
      config.maxPrincipleItems ?? DEFAULT_MAX_PRINCIPLE_ITEMS,
      'maxPrincipleItems',
    ),
    maxPrincipleVersions: positiveSafeInteger(
      config.maxPrincipleVersions ?? DEFAULT_MAX_PRINCIPLE_VERSIONS,
      'maxPrincipleVersions',
    ),
    maxPrincipleProposalsPerList: positiveSafeInteger(
      config.maxPrincipleProposalsPerList ?? DEFAULT_MAX_PRINCIPLE_PROPOSALS_PER_LIST,
      'maxPrincipleProposalsPerList',
    ),
    maxPrinciplesPerList: positiveSafeInteger(
      config.maxPrinciplesPerList ?? DEFAULT_MAX_PRINCIPLES_PER_LIST,
      'maxPrinciplesPerList',
    ),
    maxExperimentFieldBytes: positiveSafeInteger(
      config.maxExperimentFieldBytes ?? DEFAULT_MAX_EXPERIMENT_FIELD_BYTES,
      'maxExperimentFieldBytes',
    ),
    maxExperimentObservations: positiveSafeInteger(
      config.maxExperimentObservations ?? DEFAULT_MAX_EXPERIMENT_OBSERVATIONS,
      'maxExperimentObservations',
    ),
    maxExperimentsPerList: positiveSafeInteger(
      config.maxExperimentsPerList ?? DEFAULT_MAX_EXPERIMENTS_PER_LIST,
      'maxExperimentsPerList',
    ),
    maxOpenQuestionBytes: positiveSafeInteger(
      config.maxOpenQuestionBytes ?? DEFAULT_MAX_OPEN_QUESTION_BYTES,
      'maxOpenQuestionBytes',
    ),
    maxOpenQuestionTransitions: positiveSafeInteger(
      config.maxOpenQuestionTransitions ?? DEFAULT_MAX_OPEN_QUESTION_TRANSITIONS,
      'maxOpenQuestionTransitions',
    ),
    maxOpenQuestionsPerList: positiveSafeInteger(
      config.maxOpenQuestionsPerList ?? DEFAULT_MAX_OPEN_QUESTIONS_PER_LIST,
      'maxOpenQuestionsPerList',
    ),
    maxContextOpenQuestions: positiveSafeInteger(
      config.maxContextOpenQuestions ?? DEFAULT_MAX_CONTEXT_OPEN_QUESTIONS,
      'maxContextOpenQuestions',
    ),
    maxPeriodReviewContentBytes: positiveSafeInteger(
      config.maxPeriodReviewContentBytes ?? DEFAULT_MAX_PERIOD_REVIEW_CONTENT_BYTES,
      'maxPeriodReviewContentBytes',
    ),
    maxPeriodReviewMaterialItemBytes: positiveSafeInteger(
      config.maxPeriodReviewMaterialItemBytes ?? DEFAULT_MAX_PERIOD_REVIEW_MATERIAL_ITEM_BYTES,
      'maxPeriodReviewMaterialItemBytes',
    ),
    maxPeriodReviewSources: positiveSafeInteger(
      config.maxPeriodReviewSources ?? DEFAULT_MAX_PERIOD_REVIEW_SOURCES,
      'maxPeriodReviewSources',
    ),
    maxPeriodReviewsPerList: positiveSafeInteger(
      config.maxPeriodReviewsPerList ?? DEFAULT_MAX_PERIOD_REVIEWS_PER_LIST,
      'maxPeriodReviewsPerList',
    ),
  }
}

function success<T>(value: T): MindGardenReflectionSuccess<T> {
  return { ok: true, value }
}

function rejected<E extends MindGardenReflectionFailure>(error: E): MindGardenReflectionRejected<E> {
  return { ok: false, error }
}

function reflectionId(value: string): MindGardenReflectionId {
  return value as MindGardenReflectionId
}

function reflectionVersion(value: string): MindGardenReflectionVersion {
  return value as MindGardenReflectionVersion
}

function moodBand(value: StoredCheckin['mood']): MindGardenMoodBand {
  return ['heavy', 'low', 'steady', 'light', 'bright'][value + 2] as MindGardenMoodBand
}

function energyBand(value: StoredCheckin['energy']): MindGardenEnergyBand {
  return ['very-low', 'low', 'steady', 'high', 'very-high'][value - 1] as MindGardenEnergyBand
}

function snapshotStamp(stamp: StoredCheckin['stamp']): MindGardenCalendarStamp {
  return Object.freeze({ ...stamp })
}

function snapshotCheckin(record: StoredCheckin): MindGardenCheckin {
  return Object.freeze({
    type: 'checkin',
    id: reflectionId(record.id),
    stamp: snapshotStamp(record.stamp),
    mood: record.mood,
    moodBand: moodBand(record.mood),
    energy: record.energy,
    energyBand: energyBand(record.energy),
    emotionWords: Object.freeze([...record.emotionWords]),
    phase: record.phase,
    sourceSessionId: record.sourceSessionId as never,
    createdAt: record.createdAt,
  })
}

function snapshotJournal(record: StoredJournal): MindGardenJournal {
  return Object.freeze({
    type: 'journal',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    stamp: snapshotStamp(record.stamp),
    title: record.title,
    body: record.body,
    allowRetrieval: record.allowRetrieval,
    sourceSessionId: record.sourceSessionId as never,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function snapshotConcern(record: StoredConcern): MindGardenConcern {
  return Object.freeze({
    type: 'concern',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    content: record.content,
    status: record.status as MindGardenConcern['status'],
    createdStamp: snapshotStamp(record.createdStamp),
    reminder: record.reminder === null ? null : snapshotStamp(record.reminder),
    convertedJournalId: record.convertedJournalId === null ? null : reflectionId(record.convertedJournalId),
    sourceSessionId: record.sourceSessionId as never,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function snapshotContemplation(record: StoredContemplation): MindGardenContemplation {
  return Object.freeze({
    type: 'contemplation',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    markdown: record.markdown,
    status: record.status,
    sourceSessionId: record.sourceSessionId as never,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    confirmedAt: record.confirmedAt,
  })
}

function snapshotPrincipleContent(content: StoredPrinciple['current']): MindGardenPrincipleContent {
  return Object.freeze({
    ...content,
    supportingExperiences: Object.freeze(content.supportingExperiences.map(item => Object.freeze({
      summary: item.summary,
      ...(item.sourceContemplationId === null
        ? {}
        : { sourceContemplationId: reflectionId(item.sourceContemplationId) }),
    }))),
    appliesTo: Object.freeze([...content.appliesTo]),
    notAppliesTo: Object.freeze([...content.notAppliesTo]),
  })
}

function snapshotPrincipleVersion(version: StoredPrinciple['versions'][number]): MindGardenPrincipleVersion {
  return Object.freeze({
    number: version.number,
    content: snapshotPrincipleContent(version.content),
    sourceProposalId: version.sourceProposalId === null ? null : reflectionId(version.sourceProposalId),
    sourceContemplationId: version.sourceContemplationId === null
      ? null
      : reflectionId(version.sourceContemplationId),
    stamp: snapshotStamp(version.stamp),
    createdAt: version.createdAt,
  })
}

function snapshotPrinciple(record: StoredPrinciple): MindGardenPrinciple {
  return Object.freeze({
    type: 'principle',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    status: record.status,
    current: snapshotPrincipleContent(record.current),
    versions: Object.freeze(record.versions.map(snapshotPrincipleVersion)),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

interface AcceptedPrincipleProposal {
  readonly principle: StoredPrinciple
  readonly version: StoredPrinciple['versions'][number]
}

function acceptedPrincipleProposal(
  records: readonly StoredReflectionRecord[],
  proposalId: string,
): AcceptedPrincipleProposal | null {
  for (const record of records) {
    if (record.recordType !== 'principle') continue
    const version = record.versions.find(item => item.sourceProposalId === proposalId)
    if (version !== undefined) return { principle: record, version }
  }
  return null
}

function snapshotPrincipleProposal(
  record: StoredPrincipleProposal,
  accepted: AcceptedPrincipleProposal | null,
): MindGardenPrincipleProposal {
  return Object.freeze({
    type: 'principle-proposal',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    status: accepted === null ? record.status : 'accepted',
    targetPrincipleId: record.targetPrincipleId === null ? null : reflectionId(record.targetPrincipleId),
    targetVersion: record.targetVersion === null ? null : reflectionVersion(record.targetVersion),
    content: snapshotPrincipleContent(record.content),
    sourceContemplationId: reflectionId(record.sourceContemplationId),
    sourceSessionId: record.sourceSessionId as never,
    resultingPrincipleId: accepted === null ? null : reflectionId(accepted.principle.id),
    createdAt: record.createdAt,
    updatedAt: accepted?.version.createdAt ?? record.updatedAt,
    rejectedAt: record.rejectedAt,
  })
}

function snapshotExperimentObservation(
  observation: StoredExperiment['observations'][number],
): MindGardenExperimentObservation {
  return Object.freeze({
    id: reflectionId(observation.id),
    happened: observation.happened,
    action: observation.action,
    observation: observation.observation,
    mood: observation.mood,
    energy: observation.energy,
    stamp: snapshotStamp(observation.stamp),
    createdAt: observation.createdAt,
  })
}

function snapshotExperiment(record: StoredExperiment): MindGardenExperiment {
  return Object.freeze({
    type: 'experiment',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    title: record.title,
    hypothesis: record.hypothesis,
    action: record.action,
    reviewStamp: record.reviewStamp === null ? null : snapshotStamp(record.reviewStamp),
    status: record.status,
    result: record.result,
    judgment: record.judgment,
    sourceSessionId: record.sourceSessionId as never,
    sourceMessageId: record.sourceMessageId as never,
    evidenceQuote: record.evidenceQuote,
    observations: Object.freeze(record.observations.map(snapshotExperimentObservation)),
    createdStamp: snapshotStamp(record.createdStamp),
    startedAt: record.startedAt,
    stoppedAt: record.stoppedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function snapshotOpenQuestionTransition(
  transition: StoredOpenQuestion['transitions'][number],
): MindGardenOpenQuestionTransition {
  return Object.freeze({
    id: reflectionId(transition.id),
    status: transition.status,
    stamp: snapshotStamp(transition.stamp),
    createdAt: transition.createdAt,
  })
}

function snapshotOpenQuestion(
  record: StoredOpenQuestion,
  records: readonly StoredReflectionRecord[],
): MindGardenOpenQuestion {
  let source: MindGardenOpenQuestion['source'] = null
  if (record.source?.kind === 'message') {
    source = Object.freeze({
      kind: 'message',
      messageId: record.source.messageId as never,
      evidenceQuote: record.source.evidenceQuote,
    })
  } else if (record.source?.kind === 'journal') {
    const journalSource = record.source
    const journal = records.find((item): item is StoredJournal =>
      item.recordType === 'journal' && item.id === journalSource.journalId,
    )
    source = Object.freeze({
      kind: 'journal',
      journalId: reflectionId(journalSource.journalId),
      journalVersion: reflectionVersion(journalSource.journalVersion),
      evidenceQuote: journalSource.evidenceQuote,
      state: journal === undefined
        ? 'missing'
        : journal.version === journalSource.journalVersion ? 'current' : 'changed',
    })
  }
  return Object.freeze({
    type: 'open-question',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    question: record.question,
    status: record.status,
    source,
    transitions: Object.freeze(record.transitions.map(snapshotOpenQuestionTransition)),
    createdStamp: snapshotStamp(record.createdStamp),
    sourceSessionId: record.sourceSessionId as never,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

type PeriodReviewSourceRecord =
  | StoredCheckin
  | StoredJournal
  | StoredConcern
  | StoredContemplation
  | StoredPrinciple
  | StoredExperiment
  | StoredOpenQuestion

function periodReviewFingerprint(record: PeriodReviewSourceRecord): string {
  return createHash('sha256').update(JSON.stringify(record)).digest('hex')
}

function periodReviewSourceHash(sources: readonly StoredPeriodReview['sources'][number][]): string {
  return createHash('sha256').update(JSON.stringify(sources)).digest('hex')
}

function snapshotPeriodReviewSource(
  source: StoredPeriodReview['sources'][number],
): MindGardenPeriodReviewSource {
  return Object.freeze({
    id: reflectionId(source.id),
    sourceType: source.sourceType,
    ...('legacyType' in source ? { legacyType: source.legacyType } : {}),
    fingerprint: source.fingerprint,
    localDates: Object.freeze([...source.localDates]),
  })
}

function periodReviewStaleSources(
  review: StoredPeriodReview,
  records: readonly StoredReflectionRecord[],
): MindGardenPeriodReviewStaleSource[] {
  const current = new Map(records.flatMap((record): readonly [string, PeriodReviewSourceRecord][] => {
    if (record.recordType === 'principle-proposal' || record.recordType === 'period-review') return []
    return [[record.id, record]]
  }))
  return review.sources.flatMap((source): MindGardenPeriodReviewStaleSource[] => {
    if (source.sourceType === 'legacy-original') return []
    const record = current.get(source.id)
    if (record === undefined || record.recordType !== source.sourceType) {
      return [{ id: reflectionId(source.id), reason: 'missing' }]
    }
    if (periodReviewFingerprint(record) !== source.fingerprint) {
      return [{ id: reflectionId(source.id), reason: 'changed' }]
    }
    return []
  })
}

function snapshotPeriodReview(
  record: StoredPeriodReview,
  records: readonly StoredReflectionRecord[],
): MindGardenPeriodReview {
  const staleSources = periodReviewStaleSources(record, records)
  return Object.freeze({
    type: 'period-review',
    id: reflectionId(record.id),
    version: reflectionVersion(record.version),
    periodType: record.periodType,
    startStamp: snapshotStamp(record.startStamp),
    endStamp: snapshotStamp(record.endStamp),
    status: record.status,
    content: record.content,
    sources: Object.freeze(record.sources.map(snapshotPeriodReviewSource)),
    sourceHash: record.sourceHash,
    stale: staleSources.length > 0,
    staleSources: Object.freeze(staleSources.map(source => Object.freeze(source))),
    sourceSessionId: record.sourceSessionId as never,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function localDateAt(timestamp: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp))
  const values = new Map(parts.map(part => [part.type, part.value]))
  return `${values.get('year')}-${values.get('month')}-${values.get('day')}`
}

function compareRecords(left: StoredReflectionRecord, right: StoredReflectionRecord): number {
  return left.createdAt - right.createdAt || left.id.localeCompare(right.id)
}

type CalendarProjection = {
  readonly kind: 'reflection'
  readonly date: string
  readonly stamp: StoredCheckin['stamp']
  readonly createdAt: number
  readonly id: string
  readonly record: StoredCheckin | StoredJournal | StoredConcern
} | {
  readonly kind: 'principle'
  readonly date: string
  readonly createdAt: number
  readonly id: string
  readonly principleId: string
  readonly version: StoredPrinciple['versions'][number]
} | {
  readonly kind: 'experiment-review'
  readonly date: string
  readonly createdAt: number
  readonly id: string
  readonly stamp: StoredExperiment['createdStamp']
  readonly experiment: StoredExperiment
} | {
  readonly kind: 'experiment-observation'
  readonly date: string
  readonly createdAt: number
  readonly id: string
  readonly experimentId: string
  readonly observation: StoredExperiment['observations'][number]
} | {
  readonly kind: 'open-question'
  readonly date: string
  readonly createdAt: number
  readonly id: string
  readonly openQuestionId: string
  readonly question: string
  readonly transition: StoredOpenQuestion['transitions'][number]
}

function calendarProjections(record: StoredReflectionRecord): CalendarProjection[] {
  if (record.recordType === 'contemplation'
    || record.recordType === 'principle-proposal'
    || record.recordType === 'period-review') return []
  if (record.recordType === 'principle') {
    return record.versions.map(version => ({
      kind: 'principle',
      date: version.stamp.localDate,
      createdAt: version.createdAt,
      id: `${record.id}:v${version.number}`,
      principleId: record.id,
      version,
    }))
  }
  if (record.recordType === 'experiment') {
    const observations: CalendarProjection[] = record.observations.map(observation => ({
      kind: 'experiment-observation',
      date: observation.stamp.localDate,
      createdAt: observation.createdAt,
      id: observation.id,
      experimentId: record.id,
      observation,
    }))
    if (record.status === 'stopped') return observations
    const stamp = record.reviewStamp ?? record.createdStamp
    return [{
      kind: 'experiment-review',
      date: stamp.localDate,
      createdAt: record.updatedAt,
      id: `${record.id}:review`,
      stamp,
      experiment: record,
    }, ...observations]
  }
  if (record.recordType === 'open-question') {
    return record.transitions.map(transition => ({
      kind: 'open-question',
      date: transition.stamp.localDate,
      createdAt: transition.createdAt,
      id: transition.id,
      openQuestionId: record.id,
      question: record.question,
      transition,
    }))
  }
  if (record.recordType === 'concern') {
    if (record.status !== 'active' || record.reminder === null) return []
    return [{
      kind: 'reflection',
      date: record.reminder.localDate,
      stamp: record.reminder,
      createdAt: record.updatedAt,
      id: record.id,
      record,
    }]
  }
  return [{
    kind: 'reflection',
    date: record.stamp.localDate,
    stamp: record.stamp,
    createdAt: record.createdAt,
    id: record.id,
    record,
  }]
}

function snapshotCalendarEvent(projection: CalendarProjection): MindGardenCalendarEvent {
  if (projection.kind === 'principle') {
    const event: MindGardenPrincipleCalendarEvent = {
      type: 'principle',
      principleId: reflectionId(projection.principleId),
      version: snapshotPrincipleVersion(projection.version),
    }
    return Object.freeze(event)
  }
  if (projection.kind === 'experiment-review') {
    const event: MindGardenExperimentReviewEvent = {
      type: 'experiment-review',
      stamp: snapshotStamp(projection.stamp),
      experiment: snapshotExperiment(projection.experiment),
    }
    return Object.freeze(event)
  }
  if (projection.kind === 'experiment-observation') {
    const event: MindGardenExperimentObservationEvent = {
      type: 'experiment-observation',
      experimentId: reflectionId(projection.experimentId),
      observation: snapshotExperimentObservation(projection.observation),
    }
    return Object.freeze(event)
  }
  if (projection.kind === 'open-question') {
    const event: MindGardenOpenQuestionCalendarEvent = {
      type: 'open-question',
      openQuestionId: reflectionId(projection.openQuestionId),
      question: projection.question,
      transition: snapshotOpenQuestionTransition(projection.transition),
    }
    return Object.freeze(event)
  }
  if (projection.record.recordType === 'checkin') return snapshotCheckin(projection.record)
  if (projection.record.recordType === 'journal') return snapshotJournal(projection.record)
  const reminder: MindGardenConcernReminder = {
    type: 'concern-reminder',
    stamp: snapshotStamp(projection.stamp),
    concern: snapshotConcern(projection.record),
  }
  return Object.freeze(reminder)
}

function compareCalendarProjections(left: CalendarProjection, right: CalendarProjection): number {
  return left.createdAt - right.createdAt || left.id.localeCompare(right.id)
}

function compareConcerns(left: StoredConcern, right: StoredConcern): number {
  if (left.reminder === null && right.reminder !== null) return 1
  if (left.reminder !== null && right.reminder === null) return -1
  const reminderOrder = (left.reminder?.localDate ?? '').localeCompare(right.reminder?.localDate ?? '')
  return reminderOrder || right.updatedAt - left.updatedAt || left.id.localeCompare(right.id)
}

function compareOpenQuestions(left: StoredOpenQuestion, right: StoredOpenQuestion): number {
  if (left.status === 'open' && right.status !== 'open') return -1
  if (left.status !== 'open' && right.status === 'open') return 1
  if (left.status === 'open') return left.createdAt - right.createdAt || left.id.localeCompare(right.id)
  return right.updatedAt - left.updatedAt || left.id.localeCompare(right.id)
}

function normalizedBigrams(value: string): Set<string> {
  const normalized = value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  if (normalized.length < 2) return new Set(normalized.length === 0 ? [] : [normalized])
  return new Set(Array.from({ length: normalized.length - 1 }, (_, index) => normalized.slice(index, index + 2)))
}

function truncateUtf8(value: string, maxBytes: number): string {
  if (Buffer.byteLength(value, 'utf8') <= maxBytes) return value
  let result = ''
  for (const character of value) {
    if (Buffer.byteLength(result + character, 'utf8') > maxBytes) break
    result += character
  }
  return result
}

function subtractDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function isMindGardenVaultError(error: unknown): error is MindGardenVaultError {
  const codes = new Set([
    'authentication-failed',
    'corrupt-record',
    'corrupt-state',
    'invalid-key',
    'invalid-record-id',
    'invalid-value',
    'key-mismatch',
    'locked',
    'record-too-large',
    'rotation-unavailable',
  ])
  return error instanceof MindGardenVaultError
    || (typeof error === 'object'
      && error !== null
      && typeof (error as { readonly code?: unknown }).code === 'string'
      && codes.has((error as { readonly code: string }).code))
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    mindGardenReflection: MindGardenReflectionService
  }
}

/** Encrypted reflection records and deterministic calendar projections for Mind Garden. */
export class MindGardenReflectionService extends TypertRemoteService {
  static inject = ['agents', 'mindGarden', 'mindGardenVault']

  /** Loader validation for complete UTF-8 and authorized-context bounds. */
  static Config: s<Config> = s.object({
    maxTitleBytes: s.number().default(DEFAULT_MAX_TITLE_BYTES),
    maxBodyBytes: s.number().default(DEFAULT_MAX_BODY_BYTES),
    maxConcernBytes: s.number().default(DEFAULT_MAX_CONCERN_BYTES),
    maxContemplationBytes: s.number().default(DEFAULT_MAX_CONTEMPLATION_BYTES),
    maxEmotionWordBytes: s.number().default(DEFAULT_MAX_EMOTION_WORD_BYTES),
    maxTimeZoneBytes: s.number().default(DEFAULT_MAX_TIME_ZONE_BYTES),
    maxQueryBytes: s.number().default(DEFAULT_MAX_QUERY_BYTES),
    maxContextJournals: s.number().default(DEFAULT_MAX_CONTEXT_JOURNALS),
    maxContextBodyBytes: s.number().default(DEFAULT_MAX_CONTEXT_BODY_BYTES),
    maxConcernsPerList: s.number().default(DEFAULT_MAX_CONCERNS_PER_LIST),
    maxContemplationsPerList: s.number().default(DEFAULT_MAX_CONTEMPLATIONS_PER_LIST),
    maxPrincipleFieldBytes: s.number().default(DEFAULT_MAX_PRINCIPLE_FIELD_BYTES),
    maxPrincipleItems: s.number().default(DEFAULT_MAX_PRINCIPLE_ITEMS),
    maxPrincipleVersions: s.number().default(DEFAULT_MAX_PRINCIPLE_VERSIONS),
    maxPrincipleProposalsPerList: s.number().default(DEFAULT_MAX_PRINCIPLE_PROPOSALS_PER_LIST),
    maxPrinciplesPerList: s.number().default(DEFAULT_MAX_PRINCIPLES_PER_LIST),
    maxExperimentFieldBytes: s.number().default(DEFAULT_MAX_EXPERIMENT_FIELD_BYTES),
    maxExperimentObservations: s.number().default(DEFAULT_MAX_EXPERIMENT_OBSERVATIONS),
    maxExperimentsPerList: s.number().default(DEFAULT_MAX_EXPERIMENTS_PER_LIST),
    maxOpenQuestionBytes: s.number().default(DEFAULT_MAX_OPEN_QUESTION_BYTES),
    maxOpenQuestionTransitions: s.number().default(DEFAULT_MAX_OPEN_QUESTION_TRANSITIONS),
    maxOpenQuestionsPerList: s.number().default(DEFAULT_MAX_OPEN_QUESTIONS_PER_LIST),
    maxContextOpenQuestions: s.number().default(DEFAULT_MAX_CONTEXT_OPEN_QUESTIONS),
    maxPeriodReviewContentBytes: s.number().default(DEFAULT_MAX_PERIOD_REVIEW_CONTENT_BYTES),
    maxPeriodReviewMaterialItemBytes: s.number().default(DEFAULT_MAX_PERIOD_REVIEW_MATERIAL_ITEM_BYTES),
    maxPeriodReviewSources: s.number().default(DEFAULT_MAX_PERIOD_REVIEW_SOURCES),
    maxPeriodReviewsPerList: s.number().default(DEFAULT_MAX_PERIOD_REVIEWS_PER_LIST),
  })

  private readonly options: ResolvedConfig
  private operationTail: Promise<void> = Promise.resolve()
  private admissionOpen = true

  /**
   * Install the Remote service and disposal drain.
   * @param ctx - Host context carrying live Agents, Mind Garden state, and the encrypted vault.
   * @param config - Complete text and authorized-context limits.
   */
  constructor(ctx: Context, config: Config) {
    super(ctx, 'mindGardenReflection')
    this.options = resolveConfig(config)
    ctx.effect(() => async () => {
      this.admissionOpen = false
      await this.operationTail
    }, 'mind-garden-reflection.drain')
  }

  /**
   * Create one encrypted check-in tied to an explicit civil-date snapshot.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Mood, energy, emotion words, phase, and browser date metadata.
   * @returns The committed check-in or a stable access, validation, or vault failure.
   */
  @Remote('createCheckin')
  createCheckin(agent: Agent, request: MindGardenCreateCheckinRequest): Promise<MindGardenCreateCheckinResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const stamp = this.validateStamp(request.stamp)
        const emotionWords = this.validateEmotionWords(request.emotionWords)
        const now = Date.now()
        const record = storedCheckinSchema.parse({
          recordType: 'checkin',
          formatVersion: 1,
          id: randomUUID(),
          stamp,
          mood: request.mood,
          energy: request.energy,
          emotionWords,
          phase: request.phase,
          sourceSessionId: agent.session.id,
          createdAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotCheckin(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreateCheckinResult>>(error)
      }
    })
  }

  /**
   * Create one encrypted journal with retrieval disabled unless explicitly granted.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Civil date, text, and explicit future-retrieval permission.
   * @returns The committed journal or a stable access, validation, or vault failure.
   */
  @Remote('createJournal')
  createJournal(agent: Agent, request: MindGardenCreateJournalRequest): Promise<MindGardenCreateJournalResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const stamp = this.validateStamp(request.stamp)
        const title = this.text(request.title ?? '', 'title', this.options.maxTitleBytes, false)
        const body = this.text(request.body, 'body', this.options.maxBodyBytes, true)
        const now = Date.now()
        const record = storedJournalSchema.parse({
          recordType: 'journal',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          stamp,
          title,
          body,
          allowRetrieval: request.allowRetrieval,
          sourceSessionId: agent.session.id,
          createdAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotJournal(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreateJournalResult>>(error)
      }
    })
  }

  /**
   * Replace a journal's editable fields using equality-only optimistic concurrency.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Journal id, observed version, replacement text, and retrieval permission.
   * @returns The updated journal or a stable access, validation, version, or vault failure.
   */
  @Remote('updateJournal')
  updateJournal(agent: Agent, request: MindGardenUpdateJournalRequest): Promise<MindGardenUpdateJournalResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireJournal(await this.readRecords(), request.id)
        this.assertVersion(current, request.ifVersion)
        const title = this.text(request.title ?? '', 'title', this.options.maxTitleBytes, false)
        const body = this.text(request.body, 'body', this.options.maxBodyBytes, true)
        const record = storedJournalSchema.parse({
          ...current,
          version: randomUUID(),
          title,
          body,
          allowRetrieval: request.allowRetrieval,
          updatedAt: Math.max(Date.now(), current.updatedAt),
        })
        await this.writeRecord(record)
        return success(snapshotJournal(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdateJournalResult>>(error)
      }
    })
  }

  /**
   * Delete one journal after observing its version; retries after absence remain successful.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Journal id and last observed version.
   * @returns A stable absent postcondition or access, version, or vault failure.
   */
  @Remote('deleteJournal')
  deleteJournal(agent: Agent, request: MindGardenDeleteJournalRequest): Promise<MindGardenDeleteJournalResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = (await this.readRecords()).find((record): record is StoredJournal =>
          record.recordType === 'journal' && record.id === request.id,
        )
        if (current !== undefined) {
          this.assertVersion(current, request.ifVersion)
          await this.ctx.mindGardenVault.delete('reflections', MindGardenVaultRecordId(current.id))
        }
        return success<MindGardenDeleteJournalValue>(Object.freeze({ absent: true }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenDeleteJournalResult>>(error)
      }
    })
  }

  /**
   * Create one encrypted concern outside the conversation transcript.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Concern text, current browser-local stamp, and optional reminder stamp.
   * @returns The committed concern or a stable access, validation, or vault failure.
   */
  @Remote('createConcern')
  createConcern(agent: Agent, request: MindGardenCreateConcernRequest): Promise<MindGardenCreateConcernResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const createdStamp = this.validateStamp(request.stamp)
        const reminder = this.validateReminder(request.reminder, createdStamp.localDate)
        const content = this.text(request.content, 'content', this.options.maxConcernBytes, true)
        const now = Date.now()
        const record = storedConcernSchema.parse({
          recordType: 'concern',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          content,
          status: 'active',
          createdStamp,
          reminder,
          convertedJournalId: null,
          conversion: null,
          sourceSessionId: agent.session.id,
          createdAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotConcern(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreateConcernResult>>(error)
      }
    })
  }

  /**
   * List concerns in reminder-first order, hiding closed records by default.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Closed-record visibility and optional bounded result limit.
   * @returns Detached concerns or a stable access, validation, or vault failure.
   */
  @Remote('listConcerns')
  listConcerns(agent: Agent, request: MindGardenListConcernsRequest): Promise<MindGardenListConcernsResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.validateConcernLimit(request.limit)
        const concerns = (await this.readRecords())
          .filter((record): record is StoredConcern => record.recordType === 'concern')
          .filter(record => request.includeClosed === true || record.status === 'active')
          .sort(compareConcerns)
          .slice(0, limit)
          .map(snapshotConcern)
        return success<MindGardenConcernListValue>(Object.freeze({ concerns: Object.freeze(concerns) }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListConcernsResult>>(error)
      }
    })
  }

  /**
   * Replace one active concern and its reminder using equality-only concurrency.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Concern id, observed version, replacement text, current date, and reminder.
   * @returns The updated concern or a stable access, lifecycle, version, validation, or vault failure.
   */
  @Remote('updateConcern')
  updateConcern(agent: Agent, request: MindGardenUpdateConcernRequest): Promise<MindGardenUpdateConcernResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireConcern(await this.readRecords(), request.id)
        this.assertConcernActive(current)
        this.assertConcernVersion(current, request.ifVersion)
        const observedLocalDate = this.validateLocalDate(request.observedLocalDate)
        if (observedLocalDate < current.createdStamp.localDate) this.invalid('localDate', 'past')
        const reminder = this.validateReminder(request.reminder, observedLocalDate)
        const content = this.text(request.content, 'content', this.options.maxConcernBytes, true)
        const record = storedConcernSchema.parse({
          ...current,
          version: randomUUID(),
          content,
          reminder,
          updatedAt: Math.max(Date.now(), current.updatedAt),
        })
        await this.writeRecord(record)
        return success(snapshotConcern(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdateConcernResult>>(error)
      }
    })
  }

  /**
   * Complete one concern, removing its reminder; retries after closure return the same postcondition.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Concern id and last observed active version.
   * @returns The closed concern or a stable access, not-found, version, or vault failure.
   */
  @Remote('completeConcern')
  completeConcern(
    agent: Agent,
    request: MindGardenCompleteConcernRequest,
  ): Promise<MindGardenCompleteConcernResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireConcern(await this.readRecords(), request.id)
        if (current.status !== 'active') return success(snapshotConcern(current))
        this.assertConcernVersion(current, request.ifVersion)
        const record = storedConcernSchema.parse({
          ...current,
          version: randomUUID(),
          status: 'completed',
          reminder: null,
          updatedAt: Math.max(Date.now(), current.updatedAt),
        })
        await this.writeRecord(record)
        return success(snapshotConcern(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCompleteConcernResult>>(error)
      }
    })
  }

  /**
   * Convert one concern into a journal through a recoverable encrypted two-record commit.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Concern id, observed version, journal stamp, and retrieval permission.
   * @returns The linked concern and journal, including on safe retry after conversion.
   */
  @Remote('convertConcern')
  convertConcern(agent: Agent, request: MindGardenConvertConcernRequest): Promise<MindGardenConvertConcernResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = this.requireConcern(records, request.id)
        if (current.status === 'converted') {
          const journalId = current.convertedJournalId as string
          const journal = records.find((record): record is StoredJournal =>
            record.recordType === 'journal' && record.id === journalId,
          )
          if (journal === undefined) {
            throw new ReflectionBusinessError({
              code: 'journal-not-found',
              id: reflectionId(journalId),
            })
          }
          return success<MindGardenConcernConversionValue>(Object.freeze({
            concern: snapshotConcern(current),
            journal: snapshotJournal(journal),
          }))
        }
        this.assertConcernActive(current)
        this.assertConcernVersion(current, request.ifVersion)
        const stamp = this.validateStamp(request.stamp)
        if (stamp.localDate < current.createdStamp.localDate) this.invalid('localDate', 'past')
        this.text(current.content, 'body', this.options.maxBodyBytes, true)
        const now = Math.max(Date.now(), current.updatedAt)
        const planned = storedConcernSchema.parse({
          ...current,
          version: randomUUID(),
          status: 'converting',
          reminder: null,
          convertedJournalId: null,
          conversion: {
            journalId: randomUUID(),
            journalVersion: randomUUID(),
            finalConcernVersion: randomUUID(),
            stamp,
            allowRetrieval: request.allowRetrieval,
            createdAt: now,
          },
          updatedAt: now,
        }) as StoredConvertingConcern
        await this.writeRecord(planned)
        const settled = await this.settleConcernConversion([...records.filter(record => record.id !== current.id), planned], planned)
        return success<MindGardenConcernConversionValue>(Object.freeze({
          concern: snapshotConcern(settled.concern),
          journal: snapshotJournal(settled.journal),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenConvertConcernResult>>(error)
      }
    })
  }

  /**
   * Propose one encrypted contemplation draft for the current completed serenity Session.
   * @param agent - Exact idle Agent whose Session supplies the completed source turn.
   * @param request - User-visible Markdown proposal; the service never derives or sends model context.
   * @returns The existing per-Session note, a new draft, or a stable readiness, validation, access, or vault failure.
   */
  @Remote('createContemplation')
  createContemplation(
    agent: Agent,
    request: MindGardenCreateContemplationRequest,
  ): Promise<MindGardenCreateContemplationResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        this.assertContemplationSource(agent)
        const markdown = this.text(request.markdown, 'markdown', this.options.maxContemplationBytes, true)
        const records = await this.readRecords()
        const existing = records.find((record): record is StoredContemplation =>
          record.recordType === 'contemplation' && record.sourceSessionId === agent.session.id,
        )
        if (existing !== undefined) return success(snapshotContemplation(existing))
        const now = Date.now()
        const record = storedContemplationSchema.parse({
          recordType: 'contemplation',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          markdown,
          status: 'draft',
          sourceSessionId: agent.session.id,
          createdAt: now,
          updatedAt: now,
          confirmedAt: null,
        })
        await this.writeRecord(record)
        return success(snapshotContemplation(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreateContemplationResult>>(error)
      }
    })
  }

  /**
   * List encrypted contemplation notes newest first.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Optional source Session filter and bounded result limit.
   * @returns Detached notes or a stable access, validation, or vault failure.
   */
  @Remote('listContemplations')
  listContemplations(
    agent: Agent,
    request: MindGardenListContemplationsRequest,
  ): Promise<MindGardenListContemplationsResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.validateListLimit(request.limit, this.options.maxContemplationsPerList)
        const sourceSessionId = request.sourceSessionId === undefined
          ? undefined
          : this.text(request.sourceSessionId, 'sourceSessionId', MAX_SOURCE_SESSION_ID_BYTES, true)
        const contemplations = (await this.readRecords())
          .filter((record): record is StoredContemplation => record.recordType === 'contemplation')
          .filter(record => sourceSessionId === undefined || record.sourceSessionId === sourceSessionId)
          .sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id))
          .slice(0, limit)
          .map(snapshotContemplation)
        return success<MindGardenContemplationListValue>(Object.freeze({
          contemplations: Object.freeze(contemplations),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListContemplationsResult>>(error)
      }
    })
  }

  /**
   * Replace an unconfirmed contemplation draft using equality-only concurrency.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Note id, observed version, and replacement Markdown.
   * @returns The updated draft or a stable lifecycle, version, validation, access, or vault failure.
   */
  @Remote('updateContemplation')
  updateContemplation(
    agent: Agent,
    request: MindGardenUpdateContemplationRequest,
  ): Promise<MindGardenUpdateContemplationResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireContemplation(await this.readRecords(), request.id)
        this.assertContemplationDraft(current)
        this.assertContemplationVersion(current, request.ifVersion)
        const markdown = this.text(request.markdown, 'markdown', this.options.maxContemplationBytes, true)
        const record = storedContemplationSchema.parse({
          ...current,
          version: randomUUID(),
          markdown,
          updatedAt: Math.max(Date.now(), current.updatedAt),
        })
        await this.writeRecord(record)
        return success(snapshotContemplation(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdateContemplationResult>>(error)
      }
    })
  }

  /**
   * Confirm one contemplation draft without projecting it into model-visible context.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Note id and observed draft version.
   * @returns The confirmed note or a stable lifecycle, version, access, or vault failure.
   */
  @Remote('confirmContemplation')
  confirmContemplation(
    agent: Agent,
    request: MindGardenConfirmContemplationRequest,
  ): Promise<MindGardenConfirmContemplationResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireContemplation(await this.readRecords(), request.id)
        this.assertContemplationDraft(current)
        this.assertContemplationVersion(current, request.ifVersion)
        const now = Math.max(Date.now(), current.updatedAt)
        const record = storedContemplationSchema.parse({
          ...current,
          version: randomUUID(),
          status: 'confirmed',
          updatedAt: now,
          confirmedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotContemplation(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenConfirmContemplationResult>>(error)
      }
    })
  }

  /**
   * Physically remove one contemplation after observing its version.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Note id and last observed version.
   * @returns A stable absent postcondition or an access, version, or vault failure.
   */
  @Remote('deleteContemplation')
  deleteContemplation(
    agent: Agent,
    request: MindGardenDeleteContemplationRequest,
  ): Promise<MindGardenDeleteContemplationResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = (await this.readRecords()).find((record): record is StoredContemplation =>
          record.recordType === 'contemplation' && record.id === request.id,
        )
        if (current !== undefined) {
          this.assertContemplationVersion(current, request.ifVersion)
          await this.ctx.mindGardenVault.delete('reflections', MindGardenVaultRecordId(current.id))
        }
        return success<MindGardenDeleteContemplationValue>(Object.freeze({ absent: true }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenDeleteContemplationResult>>(error)
      }
    })
  }

  /**
   * Create an encrypted principle proposal from confirmed contemplation evidence.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Confirmed source note, optional observed target, and complete proposed meaning.
   * @returns An inactive proposal or a stable evidence, target, validation, access, or vault failure.
   */
  @Remote('proposePrinciple')
  proposePrinciple(
    agent: Agent,
    request: MindGardenProposePrincipleRequest,
  ): Promise<MindGardenProposePrincipleResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const source = this.requireConfirmedContemplation(records, request.sourceContemplationId)
        const content = this.validatePrincipleContent(records, request.content)
        if (!source.markdown.includes(content.userQuote)) {
          throw new ReflectionBusinessError({
            code: 'principle-source-invalid',
            reason: 'quote-not-found',
          })
        }
        const targetRequest = request.target
        const target = targetRequest === undefined
          ? null
          : this.requirePrinciple(records, targetRequest.id)
        if (target !== null && targetRequest !== undefined) {
          this.assertPrincipleVersion(target, targetRequest.ifVersion)
        }
        const now = Date.now()
        const record = storedPrincipleProposalSchema.parse({
          recordType: 'principle-proposal',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          status: 'proposed',
          targetPrincipleId: target?.id ?? null,
          targetVersion: target?.version ?? null,
          content,
          sourceContemplationId: source.id,
          sourceSessionId: source.sourceSessionId,
          createdAt: now,
          updatedAt: now,
          rejectedAt: null,
        })
        await this.writeRecord(record)
        return success(snapshotPrincipleProposal(record, null))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenProposePrincipleResult>>(error)
      }
    })
  }

  /**
   * List encrypted principle proposals newest first.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Closed-state visibility and bounded result limit.
   * @returns Detached proposals with accepted state recovered from principle history.
   */
  @Remote('listPrincipleProposals')
  listPrincipleProposals(
    agent: Agent,
    request: MindGardenListPrincipleProposalsRequest,
  ): Promise<MindGardenListPrincipleProposalsResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.validateListLimit(request.limit, this.options.maxPrincipleProposalsPerList)
        const records = await this.readRecords()
        const proposals = records
          .filter((record): record is StoredPrincipleProposal => record.recordType === 'principle-proposal')
          .map(record => snapshotPrincipleProposal(record, acceptedPrincipleProposal(records, record.id)))
          .filter(proposal => request.includeClosed === true || proposal.status === 'proposed')
          .sort((left, right) => right.updatedAt - left.updatedAt || right.id.localeCompare(left.id))
          .slice(0, limit)
        return success<MindGardenPrincipleProposalListValue>(Object.freeze({
          proposals: Object.freeze(proposals),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListPrincipleProposalsResult>>(error)
      }
    })
  }

  /**
   * Accept one proposal by creating or appending a single recoverable principle record.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed proposal version and explicit browser-local adoption date.
   * @returns The resulting principle, including on a safe retry after acceptance.
   */
  @Remote('acceptPrincipleProposal')
  acceptPrincipleProposal(
    agent: Agent,
    request: MindGardenAcceptPrincipleProposalRequest,
  ): Promise<MindGardenAcceptPrincipleProposalResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const proposal = this.requirePrincipleProposal(records, request.id)
        const accepted = acceptedPrincipleProposal(records, proposal.id)
        if (accepted !== null) return success(snapshotPrinciple(accepted.principle))
        if (proposal.status === 'rejected') this.principleProposalClosed(records, proposal)
        this.assertPrincipleProposalVersion(records, proposal, request.ifVersion)
        const stamp = this.validateStamp(request.stamp)
        const target = proposal.targetPrincipleId === null
          ? null
          : this.requirePrinciple(records, reflectionId(proposal.targetPrincipleId))
        if (target !== null) {
          this.assertPrincipleVersion(target, reflectionVersion(proposal.targetVersion as string))
          this.assertPrincipleVersionCapacity(target)
        }
        const now = Math.max(Date.now(), proposal.updatedAt, target?.updatedAt ?? 0)
        const principleId = target?.id ?? randomUUID()
        const version: StoredPrinciple['versions'][number] = {
          number: (target?.versions.length ?? 0) + 1,
          content: proposal.content,
          sourceProposalId: proposal.id,
          sourceContemplationId: proposal.sourceContemplationId,
          stamp,
          createdAt: now,
        }
        const principle = storedPrincipleSchema.parse({
          recordType: 'principle',
          formatVersion: 1,
          id: principleId,
          version: randomUUID(),
          status: proposal.content.status,
          current: proposal.content,
          versions: [...(target?.versions ?? []), version],
          createdAt: target?.createdAt ?? now,
          updatedAt: now,
        })
        await this.writeRecord(principle)
        return success(snapshotPrinciple(principle))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenAcceptPrincipleProposalResult>>(error)
      }
    })
  }

  /**
   * Reject one open proposal without deleting its encrypted review evidence.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Proposal id and equality-only observed version.
   * @returns The rejected proposal, including on a safe repeated rejection.
   */
  @Remote('rejectPrincipleProposal')
  rejectPrincipleProposal(
    agent: Agent,
    request: MindGardenRejectPrincipleProposalRequest,
  ): Promise<MindGardenRejectPrincipleProposalResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const proposal = this.requirePrincipleProposal(records, request.id)
        if (acceptedPrincipleProposal(records, proposal.id) !== null) {
          this.principleProposalClosed(records, proposal)
        }
        if (proposal.status === 'rejected') return success(snapshotPrincipleProposal(proposal, null))
        this.assertPrincipleProposalVersion(records, proposal, request.ifVersion)
        const now = Math.max(Date.now(), proposal.updatedAt)
        const rejectedProposal = storedPrincipleProposalSchema.parse({
          ...proposal,
          version: randomUUID(),
          status: 'rejected',
          updatedAt: now,
          rejectedAt: now,
        })
        await this.writeRecord(rejectedProposal)
        return success(snapshotPrincipleProposal(rejectedProposal, null))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenRejectPrincipleProposalResult>>(error)
      }
    })
  }

  /**
   * List principles newest first with their complete bounded histories.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Retired-state visibility and bounded result limit.
   * @returns Detached principles or a stable access, validation, or vault failure.
   */
  @Remote('listPrinciples')
  listPrinciples(
    agent: Agent,
    request: MindGardenListPrinciplesRequest,
  ): Promise<MindGardenListPrinciplesResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.validateListLimit(request.limit, this.options.maxPrinciplesPerList)
        const principles = (await this.readRecords())
          .filter((record): record is StoredPrinciple => record.recordType === 'principle')
          .filter(record => request.includeRetired === true || record.status !== 'retired')
          .sort((left, right) => right.updatedAt - left.updatedAt || right.id.localeCompare(left.id))
          .slice(0, limit)
          .map(snapshotPrinciple)
        return success<MindGardenPrincipleListValue>(Object.freeze({
          principles: Object.freeze(principles),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListPrinciplesResult>>(error)
      }
    })
  }

  /**
   * Append one directly user-authored principle version without erasing its history.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed principle, explicit date, and complete replacement meaning.
   * @returns The revised principle or a stable version, limit, validation, access, or vault failure.
   */
  @Remote('revisePrinciple')
  revisePrinciple(
    agent: Agent,
    request: MindGardenRevisePrincipleRequest,
  ): Promise<MindGardenRevisePrincipleResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = this.requirePrinciple(records, request.id)
        this.assertPrincipleVersion(current, request.ifVersion)
        this.assertPrincipleVersionCapacity(current)
        const content = this.validatePrincipleContent(records, request.content)
        const stamp = this.validateStamp(request.stamp)
        const now = Math.max(Date.now(), current.updatedAt)
        const version: StoredPrinciple['versions'][number] = {
          number: current.versions.length + 1,
          content,
          sourceProposalId: null,
          sourceContemplationId: null,
          stamp,
          createdAt: now,
        }
        const principle = storedPrincipleSchema.parse({
          ...current,
          version: randomUUID(),
          status: content.status,
          current: content,
          versions: [...current.versions, version],
          updatedAt: now,
        })
        await this.writeRecord(principle)
        return success(snapshotPrinciple(principle))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenRevisePrincipleResult>>(error)
      }
    })
  }

  /**
   * Create one inactive, encrypted, non-scored reality experiment.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Small action, optional hypothesis and review date, and optional exact user evidence.
   * @returns A proposed experiment or the existing proposal for the same evidenced Session.
   */
  @Remote('createExperiment')
  createExperiment(
    agent: Agent,
    request: MindGardenCreateExperimentRequest,
  ): Promise<MindGardenCreateExperimentResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const createdStamp = this.validateStamp(request.stamp)
        const title = this.text(
          request.title,
          'experimentTitle',
          this.options.maxExperimentFieldBytes,
          true,
        )
        const hypothesis = this.text(
          request.hypothesis ?? '',
          'hypothesis',
          this.options.maxExperimentFieldBytes,
          false,
        )
        const action = this.text(request.action, 'action', this.options.maxExperimentFieldBytes, true)
        const reviewStamp = this.validateExperimentReviewStamp(
          request.reviewStamp ?? null,
          createdStamp.localDate,
        )
        const source = this.resolveExperimentSource(agent, request.source)
        const records = await this.readRecords()
        if (source !== null) {
          const existing = records.find((record): record is StoredExperiment =>
            record.recordType === 'experiment'
            && record.sourceSessionId === agent.session.id
            && record.sourceMessageId !== null,
          )
          if (existing !== undefined) return success(snapshotExperiment(existing))
        }
        const now = Date.now()
        const record = storedExperimentSchema.parse({
          recordType: 'experiment',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          title,
          hypothesis,
          action,
          reviewStamp,
          status: 'proposed',
          result: '',
          judgment: '',
          sourceSessionId: agent.session.id,
          sourceMessageId: source?.messageId ?? null,
          evidenceQuote: source?.evidenceQuote ?? '',
          observations: [],
          createdStamp,
          startedAt: null,
          stoppedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotExperiment(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreateExperimentResult>>(error)
      }
    })
  }

  /**
   * List encrypted reality experiments in actionable-state order.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Stopped-state visibility and bounded result limit.
   * @returns Detached experiments with complete bounded observation histories.
   */
  @Remote('listExperiments')
  listExperiments(
    agent: Agent,
    request: MindGardenListExperimentsRequest,
  ): Promise<MindGardenListExperimentsResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.validateListLimit(request.limit, this.options.maxExperimentsPerList)
        const rank: Record<StoredExperiment['status'], number> = {
          trying: 0,
          proposed: 1,
          revised: 2,
          observed: 3,
          stopped: 4,
        }
        const experiments = (await this.readRecords())
          .filter((record): record is StoredExperiment => record.recordType === 'experiment')
          .filter(record => request.includeStopped === true || record.status !== 'stopped')
          .sort((left, right) =>
            rank[left.status] - rank[right.status]
            || right.updatedAt - left.updatedAt
            || right.id.localeCompare(left.id),
          )
          .slice(0, limit)
          .map(snapshotExperiment)
        return success<MindGardenExperimentListValue>(Object.freeze({
          experiments: Object.freeze(experiments),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListExperimentsResult>>(error)
      }
    })
  }

  /**
   * Explicitly start a proposed or revised experiment.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed version, current civil date, and optional review-date replacement.
   * @returns The trying experiment, including on a safe repeated start.
   */
  @Remote('startExperiment')
  startExperiment(
    agent: Agent,
    request: MindGardenStartExperimentRequest,
  ): Promise<MindGardenStartExperimentResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireExperiment(await this.readRecords(), request.id)
        if (current.status === 'trying') return success(snapshotExperiment(current))
        if (current.status !== 'proposed' && current.status !== 'revised') {
          this.experimentStateConflict(current)
        }
        this.assertExperimentVersion(current, request.ifVersion)
        const observedLocalDate = this.validateLocalDate(request.observedLocalDate)
        const reviewStamp = request.reviewStamp === undefined
          ? current.reviewStamp
          : this.validateExperimentReviewStamp(request.reviewStamp, observedLocalDate)
        const now = Math.max(Date.now(), current.updatedAt)
        const record = storedExperimentSchema.parse({
          ...current,
          version: randomUUID(),
          reviewStamp,
          status: 'trying',
          startedAt: current.startedAt ?? now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotExperiment(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenStartExperimentResult>>(error)
      }
    })
  }

  /**
   * Append one observation without assigning success or failure.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed experiment, occurrence stamp, optional context, and required observation.
   * @returns The observed experiment with its new immutable observation.
   */
  @Remote('observeExperiment')
  observeExperiment(
    agent: Agent,
    request: MindGardenObserveExperimentRequest,
  ): Promise<MindGardenObserveExperimentResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireExperiment(await this.readRecords(), request.id)
        if (current.status !== 'trying' && current.status !== 'observed') {
          this.experimentStateConflict(current)
        }
        this.assertExperimentVersion(current, request.ifVersion)
        if (current.observations.length >= this.options.maxExperimentObservations) {
          throw new ReflectionBusinessError({
            code: 'experiment-observation-limit',
            id: reflectionId(current.id),
            maxObservations: this.options.maxExperimentObservations,
          })
        }
        const observationText = this.text(
          request.observation,
          'observation',
          this.options.maxExperimentFieldBytes,
          true,
        )
        if (['已有新的观察，待在对话中展开。', '待补充', '暂无', '无'].includes(observationText)) {
          this.invalid('observation', 'placeholder')
        }
        const now = Math.max(Date.now(), current.updatedAt)
        const observation: StoredExperiment['observations'][number] = {
          id: randomUUID(),
          happened: this.text(
            request.happened ?? '',
            'happened',
            this.options.maxExperimentFieldBytes,
            false,
          ),
          action: this.text(
            request.action ?? '',
            'action',
            this.options.maxExperimentFieldBytes,
            false,
          ),
          observation: observationText,
          mood: request.mood ?? null,
          energy: request.energy ?? null,
          stamp: this.validateStamp(request.stamp),
          createdAt: now,
        }
        const record = storedExperimentSchema.parse({
          ...current,
          version: randomUUID(),
          reviewStamp: null,
          status: 'observed',
          result: observationText,
          observations: [...current.observations, observation],
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotExperiment(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenObserveExperimentResult>>(error)
      }
    })
  }

  /**
   * Record a post-observation judgment and optional next review date.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed version, non-empty judgment, result, and optional review-date replacement.
   * @returns The revised experiment without changing its observation history.
   */
  @Remote('reviseExperiment')
  reviseExperiment(
    agent: Agent,
    request: MindGardenReviseExperimentRequest,
  ): Promise<MindGardenReviseExperimentResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireExperiment(await this.readRecords(), request.id)
        if (current.status !== 'observed') this.experimentStateConflict(current)
        this.assertExperimentVersion(current, request.ifVersion)
        const observedLocalDate = this.validateLocalDate(request.observedLocalDate)
        const reviewStamp = request.reviewStamp === undefined
          ? current.reviewStamp
          : this.validateExperimentReviewStamp(request.reviewStamp, observedLocalDate)
        const result = request.result === undefined
          ? current.result
          : this.text(request.result, 'result', this.options.maxExperimentFieldBytes, false)
        const judgment = this.text(
          request.judgment,
          'judgment',
          this.options.maxExperimentFieldBytes,
          true,
        )
        const record = storedExperimentSchema.parse({
          ...current,
          version: randomUUID(),
          reviewStamp,
          status: 'revised',
          result,
          judgment,
          updatedAt: Math.max(Date.now(), current.updatedAt),
        })
        await this.writeRecord(record)
        return success(snapshotExperiment(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenReviseExperimentResult>>(error)
      }
    })
  }

  /**
   * Move or clear the next review date without changing experiment meaning or state.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed version, current civil date, and replacement review stamp.
   * @returns The rescheduled experiment or a stable state, version, validation, access, or vault failure.
   */
  @Remote('scheduleExperiment')
  scheduleExperiment(
    agent: Agent,
    request: MindGardenScheduleExperimentRequest,
  ): Promise<MindGardenScheduleExperimentResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireExperiment(await this.readRecords(), request.id)
        if (current.status === 'stopped') this.experimentStateConflict(current)
        this.assertExperimentVersion(current, request.ifVersion)
        const observedLocalDate = this.validateLocalDate(request.observedLocalDate)
        const reviewStamp = this.validateExperimentReviewStamp(request.reviewStamp, observedLocalDate)
        const record = storedExperimentSchema.parse({
          ...current,
          version: randomUUID(),
          reviewStamp,
          updatedAt: Math.max(Date.now(), current.updatedAt),
        })
        await this.writeRecord(record)
        return success(snapshotExperiment(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenScheduleExperimentResult>>(error)
      }
    })
  }

  /**
   * Stop one experiment without deleting its observations.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Experiment id and last observed equality-only version.
   * @returns The stopped experiment, including on a safe repeated stop.
   */
  @Remote('stopExperiment')
  stopExperiment(
    agent: Agent,
    request: MindGardenStopExperimentRequest,
  ): Promise<MindGardenStopExperimentResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const current = this.requireExperiment(await this.readRecords(), request.id)
        if (current.status === 'stopped') return success(snapshotExperiment(current))
        this.assertExperimentVersion(current, request.ifVersion)
        const now = Math.max(Date.now(), current.updatedAt)
        const record = storedExperimentSchema.parse({
          ...current,
          version: randomUUID(),
          reviewStamp: null,
          status: 'stopped',
          stoppedAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotExperiment(record))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenStopExperimentResult>>(error)
      }
    })
  }

  /**
   * Create one encrypted question that still needs real-world observation.
   * @param agent - Exact live Agent authorizing durable profile access and optional message evidence.
   * @param request - Browser-local creation stamp, question, and optional exact evidence source.
   * @returns The open question or a stable source, validation, access, or vault failure.
   */
  @Remote('createOpenQuestion')
  createOpenQuestion(
    agent: Agent,
    request: MindGardenCreateOpenQuestionRequest,
  ): Promise<MindGardenCreateOpenQuestionResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const question = this.text(
          request.question,
          'openQuestion',
          this.options.maxOpenQuestionBytes,
          true,
        )
        const stamp = this.validateStamp(request.stamp)
        const records = await this.readRecords()
        const source = this.resolveOpenQuestionSource(agent, records, request.source)
        const existing = source === null ? undefined : records.find((record): record is StoredOpenQuestion => {
          if (record.recordType !== 'open-question') return false
          return source.kind === 'message'
            ? record.source?.kind === 'message' && record.source.messageId === source.messageId
            : record.source?.kind === 'journal' && record.source.journalId === source.journalId
        })
        if (existing !== undefined) return success(snapshotOpenQuestion(existing, records))
        const now = Date.now()
        const record = storedOpenQuestionSchema.parse({
          recordType: 'open-question',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          question,
          status: 'open',
          source,
          transitions: [{ id: randomUUID(), status: 'open', stamp, createdAt: now }],
          createdStamp: stamp,
          sourceSessionId: agent.session.id,
          createdAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotOpenQuestion(record, [...records, record]))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreateOpenQuestionResult>>(error)
      }
    })
  }

  /**
   * List encrypted questions in open-first creation order.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Closed-record visibility and bounded result limit.
   * @returns Detached questions with derived journal-source freshness.
   */
  @Remote('listOpenQuestions')
  listOpenQuestions(
    agent: Agent,
    request: MindGardenListOpenQuestionsRequest,
  ): Promise<MindGardenListOpenQuestionsResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.validateListLimit(request.limit, this.options.maxOpenQuestionsPerList)
        const records = await this.readRecords()
        const questions = records
          .filter((record): record is StoredOpenQuestion => record.recordType === 'open-question')
          .filter(record => request.includeClosed === true || record.status === 'open')
          .sort(compareOpenQuestions)
          .slice(0, limit)
          .map(record => snapshotOpenQuestion(record, records))
        return success<MindGardenOpenQuestionListValue>(Object.freeze({
          questions: Object.freeze(questions),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListOpenQuestionsResult>>(error)
      }
    })
  }

  /**
   * Edit or transition one open question while retaining append-only lifecycle history.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed version, replacement meaning, target state, and transition stamp.
   * @returns The updated question, including when a safe retry already reached the same postcondition.
   */
  @Remote('updateOpenQuestion')
  updateOpenQuestion(
    agent: Agent,
    request: MindGardenUpdateOpenQuestionRequest,
  ): Promise<MindGardenUpdateOpenQuestionResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const question = this.text(
          request.question,
          'openQuestion',
          this.options.maxOpenQuestionBytes,
          true,
        )
        if (!['open', 'resolved', 'dismissed'].includes(request.status)) {
          this.invalid('openQuestionStatus', 'invalid')
        }
        const stamp = this.validateStamp(request.stamp)
        const records = await this.readRecords()
        const current = this.requireOpenQuestion(records, request.id)
        if (current.question === question && current.status === request.status) {
          return success(snapshotOpenQuestion(current, records))
        }
        this.assertOpenQuestionVersion(current, request.ifVersion, records)
        const statusChanged = current.status !== request.status
        if (statusChanged && current.transitions.length >= this.options.maxOpenQuestionTransitions) {
          const failure: MindGardenOpenQuestionTransitionLimit = {
            code: 'open-question-transition-limit',
            id: reflectionId(current.id),
            maxTransitions: this.options.maxOpenQuestionTransitions,
          }
          throw new ReflectionBusinessError(failure)
        }
        const now = Math.max(Date.now(), current.updatedAt)
        const record = storedOpenQuestionSchema.parse({
          ...current,
          version: randomUUID(),
          question,
          status: request.status,
          transitions: statusChanged
            ? [...current.transitions, { id: randomUUID(), status: request.status, stamp, createdAt: now }]
            : current.transitions,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotOpenQuestion(record, [
          ...records.filter(item => item.id !== record.id),
          record,
        ]))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdateOpenQuestionResult>>(error)
      }
    })
  }

  /**
   * Release a minimal bounded set of unresolved questions through an explicit context seam.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Optional limit within the configured context bound.
   * @returns Oldest unresolved questions without making or mutating a model request.
   */
  @Remote('openQuestionContext')
  openQuestionContext(
    agent: Agent,
    request: MindGardenOpenQuestionContextRequest,
  ): Promise<MindGardenOpenQuestionContextResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const limit = this.validateListLimit(request.limit, this.options.maxContextOpenQuestions)
        const openQuestions = (await this.readRecords())
          .filter((record): record is StoredOpenQuestion =>
            record.recordType === 'open-question' && record.status === 'open',
          )
          .sort(compareOpenQuestions)
          .slice(0, limit)
          .map(record => Object.freeze({
            id: reflectionId(record.id),
            question: record.question,
            createdLocalDate: record.createdStamp.localDate,
            evidenceQuote: record.source?.evidenceQuote ?? '',
          }))
        return success<MindGardenOpenQuestionContextValue>(Object.freeze({
          openQuestions: Object.freeze(openQuestions),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenOpenQuestionContextResult>>(error)
      }
    })
  }

  /**
   * Derive bounded plaintext evidence for one explicit period without contacting a model.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Calendar scale and browser-observed inclusive date range.
   * @returns Authenticated source snapshots, reviewable items, and one equality hash.
   */
  @Remote('periodReviewMaterial')
  periodReviewMaterial(
    agent: Agent,
    request: MindGardenPeriodReviewMaterialRequest,
  ): Promise<MindGardenPeriodReviewMaterialResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const range = this.validatePeriodReviewRange(request)
        const material = this.buildPeriodReviewMaterial(await this.readRecords(), range)
        return success(material)
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenPeriodReviewMaterialResult>>(error)
      }
    })
  }

  /**
   * Commit a proposed review against an exact authenticated material snapshot.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Observed material hash, cited source ids, and editable review Markdown.
   * @returns The encrypted proposed review or a stable material, validation, access, or vault failure.
   */
  @Remote('createPeriodReview')
  createPeriodReview(
    agent: Agent,
    request: MindGardenCreatePeriodReviewRequest,
  ): Promise<MindGardenCreatePeriodReviewResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const range = this.validatePeriodReviewRange(request)
        const observedHash = request.materialHash.trim()
        if (!/^[0-9a-f]{64}$/u.test(observedHash)) this.invalid('materialHash', 'invalid')
        const content = this.text(
          request.content,
          'periodReviewContent',
          this.options.maxPeriodReviewContentBytes,
          true,
        )
        if (request.sourceIds.length === 0) {
          throw new ReflectionBusinessError({ code: 'period-review-source-required' })
        }
        if (request.sourceIds.length > this.options.maxPeriodReviewSources) {
          this.invalid('sourceIds', 'too-many')
        }
        const sourceIds = request.sourceIds.map(String)
        if (new Set(sourceIds).size !== sourceIds.length) this.invalid('sourceIds', 'duplicate')
        const records = await this.readRecords()
        const material = this.buildPeriodReviewMaterial(records, range)
        if (material.sources.length === 0) {
          throw new ReflectionBusinessError({ code: 'period-review-source-required' })
        }
        if (material.materialHash !== observedHash) {
          throw new ReflectionBusinessError({
            code: 'period-review-material-conflict',
            currentHash: material.materialHash,
          })
        }
        const sourcesById = new Map<string, MindGardenPeriodReviewSource>(
          material.sources.map(source => [source.id, source]),
        )
        const selected = sourceIds.map((id) => {
          const source = sourcesById.get(id)
          if (source === undefined) {
            throw new ReflectionBusinessError({ code: 'period-review-source-invalid', reason: 'unknown' })
          }
          if (source.sourceType === 'legacy-original') {
            throw new ReflectionBusinessError({ code: 'period-review-source-invalid', reason: 'unknown' })
          }
          return {
            id: source.id,
            sourceType: source.sourceType,
            fingerprint: source.fingerprint,
            localDates: [...source.localDates],
          }
        }).sort((left, right) =>
          `${left.sourceType}:${left.id}`.localeCompare(`${right.sourceType}:${right.id}`),
        )
        if (material.sources.some(source => content.includes(source.id))) {
          this.invalid('periodReviewContent', 'source-visible')
        }
        const now = Date.now()
        const record = storedPeriodReviewSchema.parse({
          recordType: 'period-review',
          formatVersion: 1,
          id: randomUUID(),
          version: randomUUID(),
          periodType: range.periodType,
          startStamp: range.startStamp,
          endStamp: range.endStamp,
          status: 'proposed',
          content,
          sources: selected,
          sourceHash: periodReviewSourceHash(selected),
          sourceSessionId: agent.session.id,
          createdAt: now,
          updatedAt: now,
        })
        await this.writeRecord(record)
        return success(snapshotPeriodReview(record, [...records, record]))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCreatePeriodReviewResult>>(error)
      }
    })
  }

  /**
   * List encrypted period reviews with freshness derived from current authenticated sources.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Optional scale and archive filters plus a bounded result limit.
   * @returns Newest-first reviews whose source changes are reported without rewriting history.
   */
  @Remote('listPeriodReviews')
  listPeriodReviews(
    agent: Agent,
    request: MindGardenListPeriodReviewsRequest,
  ): Promise<MindGardenListPeriodReviewsResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        if (request.periodType !== undefined) this.validatePeriodType(request.periodType)
        const limit = this.validateListLimit(request.limit, this.options.maxPeriodReviewsPerList)
        const records = await this.readRecords()
        const reviews = records
          .filter((record): record is StoredPeriodReview => record.recordType === 'period-review')
          .filter(record => request.periodType === undefined || record.periodType === request.periodType)
          .filter(record => request.includeArchived === true || record.status !== 'archived')
          .sort((left, right) =>
            right.endStamp.localDate.localeCompare(left.endStamp.localDate)
            || right.createdAt - left.createdAt
            || right.id.localeCompare(left.id),
          )
          .slice(0, limit)
          .map(record => snapshotPeriodReview(record, records))
        return success<MindGardenPeriodReviewListValue>(Object.freeze({
          reviews: Object.freeze(reviews),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenListPeriodReviewsResult>>(error)
      }
    })
  }

  /**
   * Replace review content and lifecycle after observing its equality-only version.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Review identity, observed version, replacement Markdown, and status.
   * @returns The updated review while retaining its immutable source snapshot.
   */
  @Remote('updatePeriodReview')
  updatePeriodReview(
    agent: Agent,
    request: MindGardenUpdatePeriodReviewRequest,
  ): Promise<MindGardenUpdatePeriodReviewResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const records = await this.readRecords()
        const current = this.requirePeriodReview(records, request.id)
        this.assertPeriodReviewVersion(current, request.ifVersion, records)
        if (!['proposed', 'saved', 'archived'].includes(request.status)) {
          this.invalid('periodReviewStatus', 'invalid')
        }
        const content = this.text(
          request.content,
          'periodReviewContent',
          this.options.maxPeriodReviewContentBytes,
          true,
        )
        if (current.sources.some(source => content.includes(source.id))) {
          this.invalid('periodReviewContent', 'source-visible')
        }
        const record = storedPeriodReviewSchema.parse({
          ...current,
          version: randomUUID(),
          status: request.status,
          content,
          updatedAt: Math.max(Date.now(), current.updatedAt),
        })
        await this.writeRecord(record)
        return success(snapshotPeriodReview(record, [
          ...records.filter(existing => existing.id !== record.id),
          record,
        ]))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenUpdatePeriodReviewResult>>(error)
      }
    })
  }

  /**
   * Derive one sparse month projection from authenticated encrypted records.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Strict Gregorian month.
   * @returns Non-empty days with counts and each date's latest check-in summary.
   */
  @Remote('month')
  month(agent: Agent, request: MindGardenCalendarMonthRequest): Promise<MindGardenCalendarMonthResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const month = this.validateMonth(request.month)
        const projections = (await this.readRecords()).flatMap(record =>
          calendarProjections(record).filter(projection => projection.date.startsWith(`${month}-`)),
        )
        const groups = new Map<string, CalendarProjection[]>()
        for (const projection of projections) {
          const group = groups.get(projection.date) ?? []
          group.push(projection)
          groups.set(projection.date, group)
        }
        const days = [...groups].sort(([left], [right]) => left.localeCompare(right)).map(([date, group]) => {
          const checkins = group.flatMap((projection): StoredCheckin[] =>
            projection.kind === 'reflection' && projection.record.recordType === 'checkin'
              ? [projection.record]
              : [],
          )
            .sort(compareRecords)
          const latest = checkins.at(-1)
          const day: MindGardenCalendarMonthDay = {
            date,
            eventCount: group.length,
            checkinCount: checkins.length,
            journalCount: group.filter(projection =>
              projection.kind === 'reflection' && projection.record.recordType === 'journal',
            ).length,
            concernCount: group.filter(projection =>
              projection.kind === 'reflection' && projection.record.recordType === 'concern',
            ).length,
            principleCount: group.filter(projection => projection.kind === 'principle').length,
            experimentCount: group.filter(projection =>
              projection.kind === 'experiment-review' || projection.kind === 'experiment-observation',
            ).length,
            openQuestionCount: group.filter(projection => projection.kind === 'open-question').length,
            ...(latest === undefined ? {} : {
              mood: latest.mood,
              moodBand: moodBand(latest.mood),
              energy: latest.energy,
              energyBand: energyBand(latest.energy),
            }),
          }
          return Object.freeze(day)
        })
        return success<MindGardenCalendarMonthValue>(Object.freeze({
          month,
          days: Object.freeze(days),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCalendarMonthResult>>(error)
      }
    })
  }

  /**
   * Read every reflection event for one explicit civil date.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Strict Gregorian date.
   * @returns Creation-ordered detached check-ins and journals.
   */
  @Remote('day')
  day(agent: Agent, request: MindGardenCalendarDayRequest): Promise<MindGardenCalendarDayResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const localDate = this.validateLocalDate(request.localDate)
        const events = (await this.readRecords())
          .flatMap(record => calendarProjections(record).filter(projection => projection.date === localDate))
          .sort(compareCalendarProjections)
          .map(snapshotCalendarEvent)
        return success<MindGardenCalendarDayValue>(Object.freeze({
          date: localDate,
          events: Object.freeze(events),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenCalendarDayResult>>(error)
      }
    })
  }

  /**
   * Derive a seven- or thirty-day check-in trend from an explicit end date.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Supported interval length and browser-local end date.
   * @returns Ordered points and whether at least three distinct dates can be plotted.
   */
  @Remote('trend')
  trend(agent: Agent, request: MindGardenReflectionTrendRequest): Promise<MindGardenReflectionTrendResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const endDate = this.validateLocalDate(request.endDate)
        const startDate = subtractDays(endDate, request.days - 1)
        const points = (await this.readRecords()).filter((record): record is StoredCheckin =>
          record.recordType === 'checkin'
          && record.stamp.localDate >= startDate
          && record.stamp.localDate <= endDate,
        ).sort(compareRecords).map(snapshotCheckin)
        const recordedDays = new Set(points.map(point => point.stamp.localDate)).size
        return success<MindGardenReflectionTrendValue>(Object.freeze({
          days: request.days,
          startDate,
          endDate,
          canPlot: recordedDays >= 3,
          recordedDays,
          points: Object.freeze(points),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenReflectionTrendResult>>(error)
      }
    })
  }

  /**
   * Select bounded reflection context without sending it to a model.
   * @param agent - Exact live Agent authorizing durable profile access.
   * @param request - Current conversation query and optional browser-local date.
   * @returns The latest same-day check-in when requested and only explicitly retrievable journal excerpts.
   */
  @Remote('authorizedContext')
  authorizedContext(
    agent: Agent,
    request: MindGardenAuthorizedContextRequest,
  ): Promise<MindGardenAuthorizedContextResult> {
    return this.enqueue(async () => {
      const access = this.accessFailure(agent)
      if (access !== null) return rejected(access)
      try {
        const localDate = request.localDate === undefined
          ? null
          : this.validateLocalDate(request.localDate)
        const query = this.text(request.query, 'query', this.options.maxQueryBytes, false)
        const records = await this.readRecords()
        const todayCheckin = records.filter((record): record is StoredCheckin =>
          localDate !== null && record.recordType === 'checkin' && record.stamp.localDate === localDate,
        ).sort(compareRecords).at(-1)
        const queryTerms = normalizedBigrams(query)
        const ranked = records.flatMap((record): Array<{
          score: number
          record: StoredJournal
        }> => {
          if (record.recordType !== 'journal' || !record.allowRetrieval) return []
          const overlap = [...normalizedBigrams(`${record.title}\n${record.body}`)]
            .filter(term => queryTerms.has(term)).length
          const sameDay = localDate !== null && record.stamp.localDate === localDate
          return overlap === 0 && !sameDay ? [] : [{ score: overlap * 10 + (sameDay ? 5 : 0), record }]
        }).sort((left, right) =>
          right.score - left.score
          || right.record.createdAt - left.record.createdAt
          || right.record.id.localeCompare(left.record.id),
        ).slice(0, this.options.maxContextJournals)
        const retrievableJournals = ranked.map(({ record }): MindGardenAuthorizedJournalExcerpt => Object.freeze({
          id: reflectionId(record.id),
          localDate: record.stamp.localDate,
          title: record.title,
          body: truncateUtf8(record.body, this.options.maxContextBodyBytes),
        }))
        return success<MindGardenAuthorizedContextValue>(Object.freeze({
          todayCheckin: todayCheckin === undefined ? null : snapshotCheckin(todayCheckin),
          retrievableJournals: Object.freeze(retrievableJournals),
        }))
      } catch (error) {
        return this.convertFailure<ResultFailure<MindGardenAuthorizedContextResult>>(error)
      }
    })
  }

  private accessFailure(agent: Agent): MindGardenReflectionAccessDenied | null {
    if (this.ctx.agents.get(agent.id) !== agent) {
      throw new Error(`mind-garden-reflection: agent '${agent.id}' is not live in this registry`)
    }
    const state = this.ctx.mindGarden.current(agent.session)
    if (state === null) return { code: 'mind-garden-not-active' }
    if (state.privacy !== 'durable') return { code: 'durable-session-required' }
    return null
  }

  private assertContemplationSource(agent: Agent): void {
    const state = this.ctx.mindGarden.current(agent.session)
    if (state?.mode !== 'serenity') {
      throw new ReflectionBusinessError({
        code: 'contemplation-source-unavailable',
        reason: 'mode-unavailable',
      })
    }
    if (agent.status !== 'idle') {
      throw new ReflectionBusinessError({
        code: 'contemplation-source-unavailable',
        reason: 'agent-running',
      })
    }
    const completed = agent.session.events.some(event =>
      event.type === 'turn/end' && event.data.reason.kind === 'completed',
    )
    if (!completed) {
      throw new ReflectionBusinessError({
        code: 'contemplation-source-unavailable',
        reason: 'no-completed-turn',
      })
    }
  }

  private validateStamp(stamp: MindGardenCalendarStamp): StoredCheckin['stamp'] {
    const localDate = this.validateLocalDate(stamp.localDate)
    const timeZone = stamp.timeZone.trim()
    if (timeZone.length === 0) this.invalid('timeZone', 'blank')
    if (Buffer.byteLength(timeZone, 'utf8') > this.options.maxTimeZoneBytes) {
      this.invalid('timeZone', 'too-large', this.options.maxTimeZoneBytes)
    }
    let canonical: string
    try {
      canonical = new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone
    } catch {
      return this.invalid('timeZone', 'invalid')
    }
    if (!Number.isInteger(stamp.utcOffsetMinutes)
      || stamp.utcOffsetMinutes < -840
      || stamp.utcOffsetMinutes > 840) {
      return this.invalid('utcOffsetMinutes', 'invalid')
    }
    return { localDate, timeZone: canonical, utcOffsetMinutes: stamp.utcOffsetMinutes }
  }

  private validateLocalDate(value: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return this.invalid('localDate', 'invalid')
    const date = new Date(`${value}T00:00:00.000Z`)
    if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
      return this.invalid('localDate', 'invalid')
    }
    return value
  }

  private validateMonth(value: string): string {
    if (!/^\d{4}-\d{2}$/u.test(value)) return this.invalid('month', 'invalid')
    const month = Number(value.slice(5))
    if (month < 1 || month > 12) return this.invalid('month', 'invalid')
    return value
  }

  private validateEmotionWords(values: readonly string[]): string[] {
    if (values.length > MAX_EMOTION_WORDS) this.invalid('emotionWords', 'too-many')
    const result: string[] = []
    for (const value of values) {
      const word = value.trim()
      if (word.length === 0) this.invalid('emotionWords', 'blank')
      if (Buffer.byteLength(word, 'utf8') > this.options.maxEmotionWordBytes) {
        this.invalid('emotionWords', 'too-large', this.options.maxEmotionWordBytes)
      }
      if (result.includes(word)) this.invalid('emotionWords', 'duplicate')
      result.push(word)
    }
    return result
  }

  private validateReminder(
    reminder: MindGardenCalendarStamp | undefined,
    observedLocalDate: string,
  ): StoredConcern['reminder'] {
    if (reminder === undefined) return null
    const stamp = this.validateStamp(reminder)
    if (stamp.localDate < observedLocalDate) this.invalid('reminderDate', 'past')
    return stamp
  }

  private validateExperimentReviewStamp(
    reviewStamp: MindGardenCalendarStamp | null,
    observedLocalDate: string,
  ): StoredExperiment['reviewStamp'] {
    if (reviewStamp === null) return null
    const stamp = this.validateStamp(reviewStamp)
    if (stamp.localDate < observedLocalDate) this.invalid('reviewDate', 'past')
    return stamp
  }

  private validatePeriodType(value: MindGardenPeriodReviewMaterialRequest['periodType']): void {
    if (!['week', 'month', 'year'].includes(value)) this.invalid('periodType', 'invalid')
  }

  private validatePeriodReviewRange(
    request: MindGardenPeriodReviewMaterialRequest,
  ): {
    readonly periodType: MindGardenPeriodReviewMaterialRequest['periodType']
    readonly startStamp: StoredCheckin['stamp']
    readonly endStamp: StoredCheckin['stamp']
  } {
    this.validatePeriodType(request.periodType)
    const startStamp = this.validateStamp(request.startStamp)
    const endStamp = this.validateStamp(request.endStamp)
    if (endStamp.localDate < startStamp.localDate) this.invalid('periodEnd', 'invalid')
    if (endStamp.timeZone !== startStamp.timeZone) this.invalid('timeZone', 'invalid')
    return { periodType: request.periodType, startStamp, endStamp }
  }

  private buildPeriodReviewMaterial(
    records: readonly StoredReflectionRecord[],
    range: {
      readonly periodType: MindGardenPeriodReviewMaterialRequest['periodType']
      readonly startStamp: StoredCheckin['stamp']
      readonly endStamp: StoredCheckin['stamp']
    },
  ): MindGardenPeriodReviewMaterialValue {
    const items: MindGardenPeriodReviewMaterialItem[] = []
    const sources = new Map<string, { record: PeriodReviewSourceRecord; localDates: Set<string> }>()
    const inRange = (localDate: string): boolean =>
      localDate >= range.startStamp.localDate && localDate <= range.endStamp.localDate
    const add = (
      record: PeriodReviewSourceRecord,
      category: MindGardenPeriodReviewMaterialItem['category'],
      localDate: string,
      titleValue: string,
      textValue: string,
    ): void => {
      if (!inRange(localDate)) return
      const title = truncateUtf8(titleValue.trim(), this.options.maxPeriodReviewMaterialItemBytes)
      const text = truncateUtf8(textValue.trim(), this.options.maxPeriodReviewMaterialItemBytes)
      if (title.length === 0 && text.length === 0) return
      const existing = sources.get(record.id) ?? { record, localDates: new Set<string>() }
      existing.localDates.add(localDate)
      sources.set(record.id, existing)
      items.push(Object.freeze({
        category,
        sourceId: reflectionId(record.id),
        localDate,
        title,
        text,
      }))
    }

    for (const record of records) {
      if (record.recordType === 'checkin') {
        add(record, 'events', record.stamp.localDate, '', record.emotionWords.join(' · '))
        continue
      }
      if (record.recordType === 'journal') {
        add(record, 'events', record.stamp.localDate, record.title, record.body)
        continue
      }
      if (record.recordType === 'concern') {
        if (record.status === 'active') {
          add(record, 'ongoing', record.createdStamp.localDate, '', record.content)
          add(record, 'focus', record.createdStamp.localDate, '', record.content)
        }
        continue
      }
      if (record.recordType === 'open-question') {
        for (const transition of record.transitions) {
          add(
            record,
            transition.status === 'open' ? 'focus' : 'changes',
            transition.stamp.localDate,
            record.question,
            transition.status,
          )
        }
        continue
      }
      if (record.recordType === 'contemplation') {
        if (record.status === 'confirmed') {
          add(
            record,
            'events',
            localDateAt(record.createdAt, range.startStamp.timeZone),
            '',
            record.markdown,
          )
        }
        continue
      }
      if (record.recordType === 'principle') {
        for (const version of record.versions) {
          const details = [
            version.content.formationContext,
            ...version.content.supportingExperiences.map(experience => experience.summary),
            version.content.counterexample,
            ...version.content.appliesTo,
            ...version.content.notAppliesTo,
            version.content.lastChallenged,
          ].filter(value => value.length > 0).join('\n')
          add(
            record,
            'changes',
            version.stamp.localDate,
            version.content.expression,
            details,
          )
        }
        continue
      }
      if (record.recordType === 'experiment') {
        for (const observation of record.observations) {
          add(
            record,
            'experiments',
            observation.stamp.localDate,
            record.title,
            [observation.happened, observation.action, observation.observation]
              .filter(value => value.length > 0)
              .join('\n'),
          )
        }
        if (record.status === 'revised') {
          add(
            record,
            'changes',
            localDateAt(record.updatedAt, range.startStamp.timeZone),
            record.title,
            [record.result, record.judgment].filter(value => value.length > 0).join('\n'),
          )
        }
      }
    }

    const sourceRecords = [...sources.values()].map(({ record, localDates }) => ({
      id: record.id,
      sourceType: record.recordType,
      fingerprint: periodReviewFingerprint(record),
      localDates: [...localDates].sort(),
    })).sort((left, right) =>
      `${left.sourceType}:${left.id}`.localeCompare(`${right.sourceType}:${right.id}`),
    )
    if (sourceRecords.length > this.options.maxPeriodReviewSources) {
      const failure: MindGardenPeriodReviewSourceLimit = {
        code: 'period-review-source-limit',
        sourceCount: sourceRecords.length,
        maxSources: this.options.maxPeriodReviewSources,
      }
      throw new ReflectionBusinessError(failure)
    }
    const sortedItems = items.sort((left, right) =>
      left.localDate.localeCompare(right.localDate)
      || left.category.localeCompare(right.category)
      || left.sourceId.localeCompare(right.sourceId),
    )
    return Object.freeze({
      periodType: range.periodType,
      startStamp: snapshotStamp(range.startStamp),
      endStamp: snapshotStamp(range.endStamp),
      sources: Object.freeze(sourceRecords.map(snapshotPeriodReviewSource)),
      items: Object.freeze(sortedItems),
      materialHash: periodReviewSourceHash(sourceRecords),
    })
  }

  private resolveExperimentSource(
    agent: Agent,
    source: MindGardenCreateExperimentRequest['source'],
  ): { readonly messageId: string; readonly evidenceQuote: string } | null {
    if (source === undefined) return null
    const evidenceQuote = this.text(
      source.evidenceQuote,
      'evidenceQuote',
      this.options.maxExperimentFieldBytes,
      true,
    )
    const message = agent.session.events.flatMap(event =>
      event.type === 'user/message' && event.data.id === source.messageId ? [event.data] : [],
    )[0]
    if (message === undefined || message.source.kind !== 'user') {
      throw new ReflectionBusinessError({
        code: 'experiment-source-invalid',
        reason: 'message-not-found',
      })
    }
    const text = message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('\n')
    if (!text.includes(evidenceQuote)) {
      throw new ReflectionBusinessError({ code: 'experiment-source-invalid', reason: 'quote-not-found' })
    }
    return { messageId: source.messageId, evidenceQuote }
  }

  private resolveOpenQuestionSource(
    agent: Agent,
    records: readonly StoredReflectionRecord[],
    source: MindGardenCreateOpenQuestionRequest['source'],
  ): StoredOpenQuestion['source'] {
    if (source === undefined) return null
    const evidenceQuote = this.text(
      source.evidenceQuote,
      'evidenceQuote',
      this.options.maxOpenQuestionBytes,
      true,
    )
    if (source.kind === 'message') {
      const message = agent.session.events.flatMap(event =>
        event.type === 'user/message' && event.data.id === source.messageId ? [event.data] : [],
      )[0]
      if (message === undefined || message.source.kind !== 'user') {
        throw new ReflectionBusinessError({
          code: 'open-question-source-invalid',
          reason: 'message-not-found',
        })
      }
      const messageText = message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('\n')
      if (!messageText.includes(evidenceQuote)) {
        throw new ReflectionBusinessError({
          code: 'open-question-source-invalid',
          reason: 'quote-not-found',
        })
      }
      return { kind: 'message', messageId: source.messageId, evidenceQuote }
    }
    const journal = records.find((record): record is StoredJournal =>
      record.recordType === 'journal' && record.id === source.journalId,
    )
    if (journal === undefined) {
      throw new ReflectionBusinessError({
        code: 'open-question-source-invalid',
        reason: 'journal-not-found',
      })
    }
    if (journal.version !== source.ifVersion) {
      throw new ReflectionBusinessError({
        code: 'open-question-source-invalid',
        reason: 'journal-version-conflict',
      })
    }
    if (!`${journal.title}\n${journal.body}`.includes(evidenceQuote)) {
      throw new ReflectionBusinessError({
        code: 'open-question-source-invalid',
        reason: 'quote-not-found',
      })
    }
    return {
      kind: 'journal',
      journalId: journal.id,
      journalVersion: journal.version,
      evidenceQuote,
    }
  }

  private validateConcernLimit(value: number | undefined): number {
    return this.validateListLimit(value, this.options.maxConcernsPerList)
  }

  private validateListLimit(value: number | undefined, maximum: number): number {
    const limit = value ?? maximum
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > maximum) {
      return this.invalid('limit', 'invalid')
    }
    return limit
  }

  private validatePrincipleContent(
    records: readonly StoredReflectionRecord[],
    value: MindGardenPrincipleContent,
  ): StoredPrinciple['current'] {
    const supportingExperiences = value.supportingExperiences.map((experience) => {
      const summary = this.text(
        experience.summary,
        'supportingExperiences',
        this.options.maxPrincipleFieldBytes,
        true,
      )
      if (experience.sourceContemplationId !== undefined) {
        this.requireConfirmedContemplation(records, experience.sourceContemplationId)
      }
      return {
        summary,
        sourceContemplationId: experience.sourceContemplationId ?? null,
      }
    })
    if (supportingExperiences.length > this.options.maxPrincipleItems) {
      this.invalid('supportingExperiences', 'too-many')
    }
    if (new Set(supportingExperiences.map(experience => experience.summary)).size !== supportingExperiences.length) {
      this.invalid('supportingExperiences', 'duplicate')
    }
    const appliesTo = this.validatePrincipleItems(value.appliesTo, 'appliesTo')
    const notAppliesTo = this.validatePrincipleItems(value.notAppliesTo, 'notAppliesTo')
    return {
      expression: this.text(value.expression, 'expression', this.options.maxPrincipleFieldBytes, true),
      formationContext: this.text(
        value.formationContext,
        'formationContext',
        this.options.maxPrincipleFieldBytes,
        false,
      ),
      userQuote: this.text(value.userQuote, 'userQuote', this.options.maxPrincipleFieldBytes, true),
      supportingExperiences,
      counterexample: this.text(
        value.counterexample,
        'counterexample',
        this.options.maxPrincipleFieldBytes,
        false,
      ),
      appliesTo,
      notAppliesTo,
      lastChallenged: this.text(
        value.lastChallenged,
        'lastChallenged',
        this.options.maxPrincipleFieldBytes,
        false,
      ),
      status: value.status,
    }
  }

  private validatePrincipleItems(
    values: readonly string[],
    field: 'appliesTo' | 'notAppliesTo',
  ): string[] {
    if (values.length > this.options.maxPrincipleItems) this.invalid(field, 'too-many')
    const items = values.map(value => this.text(value, field, this.options.maxPrincipleFieldBytes, true))
    if (new Set(items).size !== items.length) this.invalid(field, 'duplicate')
    return items
  }

  private text(
    value: string,
    field: MindGardenReflectionInvalidField['field'],
    maxBytes: number,
    required: boolean,
  ): string {
    const text = value.trim()
    if (required && text.length === 0) this.invalid(field, 'blank')
    if (Buffer.byteLength(text, 'utf8') > maxBytes) this.invalid(field, 'too-large', maxBytes)
    return text
  }

  private invalid(
    field: MindGardenReflectionInvalidField['field'],
    reason: MindGardenReflectionInvalidField['reason'],
    maxBytes?: number,
  ): never {
    throw new ReflectionBusinessError({
      code: 'invalid-field',
      field,
      reason,
      ...(maxBytes === undefined ? {} : { maxBytes }),
    })
  }

  private async readRecords(): Promise<StoredReflectionRecord[]> {
    const entries = await this.ctx.mindGardenVault.entries('reflections')
    let records: StoredReflectionRecord[]
    try {
      records = entries.map(([id, value]) => {
        const record = decodeStoredReflection(value)
        if (record.id !== id) throw new TypeError('vault id differs from authenticated reflection id')
        return record
      })
    } catch (error) {
      throw new CorruptReflectionStoreError('Mind Garden reflection plaintext record is invalid', { cause: error })
    }
    const contemplationSessions = new Set<string>()
    const evidencedExperimentSessions = new Set<string>()
    const openQuestionSources = new Set<string>()
    for (const record of records) {
      if (record.recordType === 'contemplation') {
        if (contemplationSessions.has(record.sourceSessionId)) {
          throw new CorruptReflectionStoreError('multiple contemplation notes share one source Session')
        }
        contemplationSessions.add(record.sourceSessionId)
      }
      if (record.recordType === 'experiment' && record.sourceMessageId !== null) {
        if (evidencedExperimentSessions.has(record.sourceSessionId)) {
          throw new CorruptReflectionStoreError('multiple evidenced experiments share one source Session')
        }
        evidencedExperimentSessions.add(record.sourceSessionId)
      }
      if (record.recordType === 'period-review'
        && periodReviewSourceHash(record.sources) !== record.sourceHash) {
        throw new CorruptReflectionStoreError('period review source hash differs from its source snapshot')
      }
      if (record.recordType === 'open-question' && record.source !== null) {
        const sourceKey = record.source.kind === 'message'
          ? `message:${record.source.messageId}`
          : `journal:${record.source.journalId}`
        if (openQuestionSources.has(sourceKey)) {
          throw new CorruptReflectionStoreError('multiple open questions share one exact evidence source')
        }
        openQuestionSources.add(sourceKey)
      }
    }
    this.assertPrincipleRecordIntegrity(records)
    for (const concern of records.filter((record): record is StoredConvertingConcern =>
      record.recordType === 'concern' && record.status === 'converting' && record.conversion !== null,
    )) {
      const settled = await this.settleConcernConversion(records, concern)
      records = [
        ...records.filter(record => record.id !== settled.concern.id && record.id !== settled.journal.id),
        settled.concern,
        settled.journal,
      ]
    }
    return records
  }

  private async writeRecord(record: StoredReflectionRecord): Promise<void> {
    const validated = decodeStoredReflection(record)
    await this.ctx.mindGardenVault.put(
      'reflections',
      MindGardenVaultRecordId(validated.id),
      validated,
    )
  }

  private requireJournal(records: readonly StoredReflectionRecord[], id: MindGardenReflectionId): StoredJournal {
    const journal = records.find((record): record is StoredJournal =>
      record.recordType === 'journal' && record.id === id,
    )
    if (journal === undefined) throw new ReflectionBusinessError({ code: 'journal-not-found', id })
    return journal
  }

  private requireConcern(records: readonly StoredReflectionRecord[], id: MindGardenReflectionId): StoredConcern {
    const concern = records.find((record): record is StoredConcern =>
      record.recordType === 'concern' && record.id === id,
    )
    if (concern === undefined) throw new ReflectionBusinessError({ code: 'concern-not-found', id })
    return concern
  }

  private requireContemplation(
    records: readonly StoredReflectionRecord[],
    id: MindGardenReflectionId,
  ): StoredContemplation {
    const contemplation = records.find((record): record is StoredContemplation =>
      record.recordType === 'contemplation' && record.id === id,
    )
    if (contemplation === undefined) {
      throw new ReflectionBusinessError({ code: 'contemplation-not-found', id })
    }
    return contemplation
  }

  private requireConfirmedContemplation(
    records: readonly StoredReflectionRecord[],
    id: MindGardenReflectionId,
  ): StoredContemplation {
    const contemplation = records.find((record): record is StoredContemplation =>
      record.recordType === 'contemplation' && record.id === id,
    )
    if (contemplation === undefined) {
      throw new ReflectionBusinessError({
        code: 'principle-source-invalid',
        reason: 'contemplation-not-found',
      })
    }
    if (contemplation.status !== 'confirmed') {
      throw new ReflectionBusinessError({ code: 'principle-source-invalid', reason: 'not-confirmed' })
    }
    return contemplation
  }

  private requirePrinciple(
    records: readonly StoredReflectionRecord[],
    id: MindGardenReflectionId,
  ): StoredPrinciple {
    const principle = records.find((record): record is StoredPrinciple =>
      record.recordType === 'principle' && record.id === id,
    )
    if (principle === undefined) throw new ReflectionBusinessError({ code: 'principle-not-found', id })
    return principle
  }

  private requirePrincipleProposal(
    records: readonly StoredReflectionRecord[],
    id: MindGardenReflectionId,
  ): StoredPrincipleProposal {
    const proposal = records.find((record): record is StoredPrincipleProposal =>
      record.recordType === 'principle-proposal' && record.id === id,
    )
    if (proposal === undefined) {
      throw new ReflectionBusinessError({ code: 'principle-proposal-not-found', id })
    }
    return proposal
  }

  private requireExperiment(
    records: readonly StoredReflectionRecord[],
    id: MindGardenReflectionId,
  ): StoredExperiment {
    const experiment = records.find((record): record is StoredExperiment =>
      record.recordType === 'experiment' && record.id === id,
    )
    if (experiment === undefined) throw new ReflectionBusinessError({ code: 'experiment-not-found', id })
    return experiment
  }

  private requireOpenQuestion(
    records: readonly StoredReflectionRecord[],
    id: MindGardenReflectionId,
  ): StoredOpenQuestion {
    const question = records.find((record): record is StoredOpenQuestion =>
      record.recordType === 'open-question' && record.id === id,
    )
    if (question === undefined) {
      throw new ReflectionBusinessError({ code: 'open-question-not-found', id })
    }
    return question
  }

  private requirePeriodReview(
    records: readonly StoredReflectionRecord[],
    id: MindGardenReflectionId,
  ): StoredPeriodReview {
    const review = records.find((record): record is StoredPeriodReview =>
      record.recordType === 'period-review' && record.id === id,
    )
    if (review === undefined) {
      throw new ReflectionBusinessError({ code: 'period-review-not-found', id })
    }
    return review
  }

  private assertVersion(record: StoredJournal, expected: MindGardenReflectionVersion): void {
    if (record.version !== expected) {
      throw new ReflectionBusinessError({ code: 'version-conflict', current: snapshotJournal(record) })
    }
  }

  private assertConcernActive(record: StoredConcern): void {
    if (record.status !== 'active') {
      const failure: MindGardenConcernClosed = { code: 'concern-closed', current: snapshotConcern(record) }
      throw new ReflectionBusinessError(failure)
    }
  }

  private assertConcernVersion(record: StoredConcern, expected: MindGardenReflectionVersion): void {
    if (record.version !== expected) {
      const failure: MindGardenConcernVersionConflict = {
        code: 'concern-version-conflict',
        current: snapshotConcern(record),
      }
      throw new ReflectionBusinessError(failure)
    }
  }

  private assertContemplationDraft(record: StoredContemplation): void {
    if (record.status !== 'draft') {
      const failure: MindGardenContemplationLocked = {
        code: 'contemplation-locked',
        current: snapshotContemplation(record),
      }
      throw new ReflectionBusinessError(failure)
    }
  }

  private assertContemplationVersion(record: StoredContemplation, expected: MindGardenReflectionVersion): void {
    if (record.version !== expected) {
      const failure: MindGardenContemplationVersionConflict = {
        code: 'contemplation-version-conflict',
        current: snapshotContemplation(record),
      }
      throw new ReflectionBusinessError(failure)
    }
  }

  private assertPrincipleVersion(record: StoredPrinciple, expected: MindGardenReflectionVersion): void {
    if (record.version !== expected) {
      const failure: MindGardenPrincipleVersionConflict = {
        code: 'principle-version-conflict',
        current: snapshotPrinciple(record),
      }
      throw new ReflectionBusinessError(failure)
    }
  }

  private assertPrincipleProposalVersion(
    records: readonly StoredReflectionRecord[],
    record: StoredPrincipleProposal,
    expected: MindGardenReflectionVersion,
  ): void {
    if (record.version !== expected) {
      const failure: MindGardenPrincipleProposalVersionConflict = {
        code: 'principle-proposal-version-conflict',
        current: snapshotPrincipleProposal(record, acceptedPrincipleProposal(records, record.id)),
      }
      throw new ReflectionBusinessError(failure)
    }
  }

  private principleProposalClosed(
    records: readonly StoredReflectionRecord[],
    record: StoredPrincipleProposal,
  ): never {
    const failure: MindGardenPrincipleProposalClosed = {
      code: 'principle-proposal-closed',
      current: snapshotPrincipleProposal(record, acceptedPrincipleProposal(records, record.id)),
    }
    throw new ReflectionBusinessError(failure)
  }

  private assertPrincipleVersionCapacity(record: StoredPrinciple): void {
    if (record.versions.length >= this.options.maxPrincipleVersions) {
      throw new ReflectionBusinessError({
        code: 'principle-version-limit',
        id: reflectionId(record.id),
        maxVersions: this.options.maxPrincipleVersions,
      })
    }
  }

  private assertExperimentVersion(record: StoredExperiment, expected: MindGardenReflectionVersion): void {
    if (record.version !== expected) {
      const failure: MindGardenExperimentVersionConflict = {
        code: 'experiment-version-conflict',
        current: snapshotExperiment(record),
      }
      throw new ReflectionBusinessError(failure)
    }
  }

  private assertOpenQuestionVersion(
    record: StoredOpenQuestion,
    expected: MindGardenReflectionVersion,
    records: readonly StoredReflectionRecord[],
  ): void {
    if (record.version !== expected) {
      const failure: MindGardenOpenQuestionVersionConflict = {
        code: 'open-question-version-conflict',
        current: snapshotOpenQuestion(record, records),
      }
      throw new ReflectionBusinessError(failure)
    }
  }

  private assertPeriodReviewVersion(
    record: StoredPeriodReview,
    expected: MindGardenReflectionVersion,
    records: readonly StoredReflectionRecord[],
  ): void {
    if (record.version !== expected) {
      throw new ReflectionBusinessError({
        code: 'period-review-version-conflict',
        current: snapshotPeriodReview(record, records),
      })
    }
  }

  private experimentStateConflict(record: StoredExperiment): never {
    const failure: MindGardenExperimentStateConflict = {
      code: 'experiment-state-conflict',
      current: snapshotExperiment(record),
    }
    throw new ReflectionBusinessError(failure)
  }

  private assertPrincipleRecordIntegrity(records: readonly StoredReflectionRecord[]): void {
    const proposals = new Map(records.flatMap(record =>
      record.recordType === 'principle-proposal' ? [[record.id, record] as const] : [],
    ))
    const accepted = new Set<string>()
    for (const principle of records.filter((record): record is StoredPrinciple =>
      record.recordType === 'principle',
    )) {
      for (const version of principle.versions) {
        if (version.sourceProposalId === null) continue
        const proposal = proposals.get(version.sourceProposalId)
        if (proposal === undefined
          || proposal.status !== 'proposed'
          || accepted.has(proposal.id)
          || version.sourceContemplationId !== proposal.sourceContemplationId
          || JSON.stringify(version.content) !== JSON.stringify(proposal.content)
          || (proposal.targetPrincipleId === null
            ? version.number !== 1
            : proposal.targetPrincipleId !== principle.id || version.number === 1)) {
          throw new CorruptReflectionStoreError('principle history carries an invalid proposal acceptance')
        }
        accepted.add(proposal.id)
      }
    }
  }

  private async settleConcernConversion(
    records: readonly StoredReflectionRecord[],
    concern: StoredConvertingConcern,
  ): Promise<{ concern: StoredConcern; journal: StoredJournal }> {
    const plan = concern.conversion
    const intended = storedJournalSchema.parse({
      recordType: 'journal',
      formatVersion: 1,
      id: plan.journalId,
      version: plan.journalVersion,
      stamp: plan.stamp,
      title: '',
      body: concern.content,
      allowRetrieval: plan.allowRetrieval,
      sourceSessionId: concern.sourceSessionId,
      createdAt: plan.createdAt,
      updatedAt: plan.createdAt,
    })
    const existing = records.find(record => record.id === plan.journalId)
    let journal: StoredJournal
    if (existing === undefined) {
      journal = intended
      await this.writeRecord(journal)
    } else {
      if (existing.recordType !== 'journal' || JSON.stringify(existing) !== JSON.stringify(intended)) {
        throw new CorruptReflectionStoreError('concern conversion journal differs from its recovery plan')
      }
      journal = existing
    }
    const completed = storedConcernSchema.parse({
      ...concern,
      version: plan.finalConcernVersion,
      status: 'converted',
      convertedJournalId: plan.journalId,
      conversion: null,
      updatedAt: plan.createdAt,
    })
    await this.writeRecord(completed)
    return { concern: completed, journal }
  }

  private convertFailure<E extends MindGardenReflectionFailure>(error: unknown): MindGardenReflectionRejected<E> {
    if (error instanceof ReflectionBusinessError) return rejected(error.failure as E)
    if (error instanceof CorruptReflectionStoreError) {
      return rejected({ code: 'vault-unavailable', state: 'corrupt-state' } as E)
    }
    if (isMindGardenVaultError(error)) {
      const state: MindGardenReflectionVaultUnavailable['state'] =
        error.code === 'locked' ? 'locked'
          : error.code === 'invalid-key' ? 'invalid-key'
            : error.code === 'key-mismatch' ? 'key-mismatch'
              : 'corrupt-state'
      return rejected({ code: 'vault-unavailable', state } as E)
    }
    throw error
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.admissionOpen) return Promise.reject(new Error('mind-garden-reflection: service is disposing'))
    const result = this.operationTail.then(operation).catch((error: unknown): T => {
      if (!isMindGardenVaultError(error)) throw error
      const state: MindGardenReflectionVaultUnavailable['state'] =
        error.code === 'locked' ? 'locked'
          : error.code === 'invalid-key' ? 'invalid-key'
            : error.code === 'key-mismatch' ? 'key-mismatch'
              : 'corrupt-state'
      return rejected({ code: 'vault-unavailable', state }) as T
    })
    this.operationTail = result.then(() => undefined, () => undefined)
    return result
  }
}

export default MindGardenReflectionService
