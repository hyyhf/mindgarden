/** Read-only conversion of original private records into current vault collections. */

import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import type { DatabaseSync, SQLOutputValue } from 'node:sqlite'
import { decodeStoredRecord } from '@deepseek-ai/dsh-mind-garden-memory'
import { decodeStoredReflection } from '@deepseek-ai/dsh-mind-garden-reflection'
import { decodeStoredStarState } from '@deepseek-ai/dsh-mind-garden-star-map'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import { z } from 'zod'
import {
  MindGardenPortabilityError,
  type MindGardenBackupRecord,
} from './backup.ts'
import {
  decryptLegacyField,
  deterministicLegacyUuid,
  legacyBlob,
  legacyFiniteNumber,
  legacyInteger,
  legacyMilliseconds,
  legacyOptionalText,
  legacyText,
  readLegacyRows,
  type LegacyRow,
} from './legacy-values.ts'

const MAX_LEGACY_RECORDS = 2_000
const MAX_LEGACY_FIELD_BYTES = 4 * 1024 * 1024
const LEGACY_SOURCE_PREFIX = 'fun-garden-v1'
const UTF8 = new TextDecoder('utf-8', { fatal: true })

const stringArraySchema = z.array(z.string().min(1))
const emotionWordsSchema = stringArraySchema.max(3)
const moodSchema = z.union([z.literal(-2), z.literal(-1), z.literal(0), z.literal(1), z.literal(2)])
const energySchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
const nullableEnergySchema = energySchema.nullable()
const checkinPhaseSchema = z.enum(['standalone', 'before', 'after', 'journal'])
const contemplationStatusSchema = z.enum(['draft', 'confirmed'])
const experimentStatusSchema = z.enum(['proposed', 'trying', 'observed', 'revised', 'stopped'])
const openQuestionStatusSchema = z.enum(['open', 'resolved', 'dismissed'])
const periodReviewStatusSchema = z.enum(['proposed', 'saved', 'archived'])
const periodReviewTypeSchema = z.enum(['week', 'month', 'year'])
const memoryStatusSchema = z.enum(['candidate', 'confirmed', 'rejected'])
const sensitivitySchema = z.enum(['normal', 'high'])
const principleStatusSchema = z.enum(['trying', 'adopted', 'questioning', 'retired'])
const starToneSchema = z.enum(['gentle', 'direct', 'mystic'])
const starModeSchema = z.enum(['known', 'scenes', 'observe'])
const starKindSchema = z.enum(['strength', 'tension', 'pattern', 'unfolded'])
const starStatusSchema = z.enum(['pending', 'confirmed', 'uncertain', 'rejected', 'retired'])
const sceneAnswerSchema = z.enum([
  '1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b',
])
const legacyPeriodSourcesSchema = z.array(z.object({
  type: z.string().min(1).max(64),
  id: z.string().min(1).max(256),
  date: z.string().optional(),
}).strip())
const legacyPrincipleContentSchema = z.looseObject({
  expression: z.string().min(1),
  formation_context: z.string().default(''),
  user_quote: z.string().default(''),
  supporting_experiences: z.array(z.looseObject({
    summary: z.string().default(''),
    source_note_id: z.string().nullable().optional(),
  })).default([]),
  counterexample: z.string().default(''),
  applies_to: z.array(z.string()).default([]),
  not_applies_to: z.array(z.string()).default([]),
  last_challenged: z.string().default(''),
  status: principleStatusSchema.default('trying'),
})

interface LegacyFiles {
  readonly [name: string]: string
}

interface CheckinRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly local_date: SQLOutputValue
  readonly timezone: SQLOutputValue
  readonly utc_offset_minutes: SQLOutputValue
  readonly valence_enc: SQLOutputValue
  readonly energy_enc: SQLOutputValue
  readonly emotion_words_enc: SQLOutputValue
  readonly phase: SQLOutputValue
  readonly created_at: SQLOutputValue
}

interface JournalRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly local_date: SQLOutputValue
  readonly timezone: SQLOutputValue
  readonly utc_offset_minutes: SQLOutputValue
  readonly title_enc: SQLOutputValue
  readonly content_enc: SQLOutputValue
  readonly allow_retrieval: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface ConcernRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly content_enc: SQLOutputValue
  readonly status: SQLOutputValue
  readonly created_local_date: SQLOutputValue
  readonly remind_on: SQLOutputValue
  readonly timezone: SQLOutputValue
  readonly converted_journal_id: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface ContemplationRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly session_id: SQLOutputValue
  readonly markdown_enc: SQLOutputValue
  readonly status: SQLOutputValue
  readonly confirmed_at: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface NoteRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly session_id: SQLOutputValue
  readonly markdown_enc: SQLOutputValue
  readonly status: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface PrincipleRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly status: SQLOutputValue
  readonly current_version: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface PrincipleVersionRow extends LegacyRow {
  readonly principle_id: SQLOutputValue
  readonly version: SQLOutputValue
  readonly content_enc: SQLOutputValue
  readonly source_note_id: SQLOutputValue
  readonly created_at: SQLOutputValue
}

interface ExperimentObservationRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly experiment_id: SQLOutputValue
  readonly happened_enc: SQLOutputValue
  readonly action_enc: SQLOutputValue
  readonly observation_enc: SQLOutputValue
  readonly mood: SQLOutputValue
  readonly energy: SQLOutputValue
  readonly occurred_at: SQLOutputValue
  readonly created_at: SQLOutputValue
}

interface ExperimentRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly title_enc: SQLOutputValue
  readonly hypothesis_enc: SQLOutputValue
  readonly action_enc: SQLOutputValue
  readonly review_on: SQLOutputValue
  readonly status: SQLOutputValue
  readonly result_enc: SQLOutputValue
  readonly judgment_enc: SQLOutputValue
  readonly source_session_id: SQLOutputValue
  readonly source_message_id: SQLOutputValue
  readonly evidence_quote_enc: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface OpenQuestionRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly question_enc: SQLOutputValue
  readonly status: SQLOutputValue
  readonly source_session_id: SQLOutputValue
  readonly source_message_id: SQLOutputValue
  readonly source_journal_id: SQLOutputValue
  readonly evidence_quote_enc: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface PeriodReviewRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly period_type: SQLOutputValue
  readonly start_date: SQLOutputValue
  readonly end_date: SQLOutputValue
  readonly status: SQLOutputValue
  readonly content_enc: SQLOutputValue
  readonly sources_json: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface MemorySourceRow extends LegacyRow {
  readonly memory_id: SQLOutputValue
  readonly session_id: SQLOutputValue
  readonly message_id: SQLOutputValue
  readonly quote_enc: SQLOutputValue
}

interface MemoryRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly kind: SQLOutputValue
  readonly content_enc: SQLOutputValue
  readonly status: SQLOutputValue
  readonly sensitivity: SQLOutputValue
  readonly reason_enc: SQLOutputValue
  readonly expires_at: SQLOutputValue
  readonly confirmed_at: SQLOutputValue
  readonly disabled_at: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface StarProfileRow extends LegacyRow {
  readonly onboarding_stage: SQLOutputValue
  readonly onboarding_completed: SQLOutputValue
  readonly display_name_enc: SQLOutputValue
  readonly birth_date_enc: SQLOutputValue
  readonly birth_time_enc: SQLOutputValue
  readonly birth_time_known: SQLOutputValue
  readonly birth_city_enc: SQLOutputValue
  readonly birth_city_known: SQLOutputValue
  readonly mbti_mode: SQLOutputValue
  readonly mbti_type_enc: SQLOutputValue
  readonly mbti_answers_enc: SQLOutputValue
  readonly self_words_enc: SQLOutputValue
  readonly observation_intent_enc: SQLOutputValue
  readonly observer_tone: SQLOutputValue
  readonly reduced_motion: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface StarTraitRow extends LegacyRow {
  readonly id: SQLOutputValue
  readonly kind: SQLOutputValue
  readonly status: SQLOutputValue
  readonly label_enc: SQLOutputValue
  readonly description_enc: SQLOutputValue
  readonly confidence: SQLOutputValue
  readonly created_at: SQLOutputValue
  readonly updated_at: SQLOutputValue
}

interface ConvertedStarTrait {
  readonly id: string
  readonly version: string
  readonly kind: 'strength' | 'tension' | 'pattern' | 'unfolded'
  readonly status: 'self-reported' | 'pending' | 'confirmed' | 'uncertain' | 'rejected' | 'retired'
  readonly label: string
  readonly description: string
  readonly confidence: number
  readonly source: 'ritual-self-report' | 'star-observer'
  readonly createdAt: number
  readonly updatedAt: number
}

/** Converted current collections that do not carry attachment bytes. */
export interface LegacyPrivateCollections {
  readonly memories: readonly MindGardenBackupRecord[]
  readonly reflections: readonly MindGardenBackupRecord[]
  readonly stars: readonly MindGardenBackupRecord[]
}

interface LegacyContext {
  readonly database: DatabaseSync
  readonly key: Buffer
  readonly workspaceId: string
  readonly sourceSessionId: string
  readonly timeZone: string
  readonly createdAt: number
  readonly files: LegacyFiles
}

function invalid(label: string, cause?: unknown): MindGardenPortabilityError {
  return new MindGardenPortabilityError(
    'invalid-backup',
    `Original Mind Garden ${label} is unsupported`,
    cause === undefined ? undefined : { cause },
  )
}

function toBackupRecord(id: string, value: unknown): MindGardenBackupRecord {
  return { id, value: JSON.parse(JSON.stringify(value)) as JsonValue }
}

function originalId(context: LegacyContext, domain: string, value: SQLOutputValue): string {
  const legacyId = legacyText(value, `${domain} id`, 256)
  return deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:${domain}:${legacyId}`)
}

function originalVersion(context: LegacyContext, domain: string, legacyId: string, updatedAt: number): string {
  return deterministicLegacyUuid(
    `${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:${domain}-version:${legacyId}:${String(updatedAt)}`,
  )
}

function bool(value: SQLOutputValue, label: string): boolean {
  const number = legacyInteger(value, label)
  if (number !== 0 && number !== 1) throw invalid(label)
  return number === 1
}

function localDate(value: SQLOutputValue, label: string): string {
  const date = legacyText(value, label, 32)
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) throw invalid(label)
  return date
}

function privateText(
  value: SQLOutputValue,
  key: Buffer,
  aad: string,
  label: string,
  allowEmpty = false,
): string {
  const plaintext = decryptLegacyField(legacyBlob(value, label), key, aad)
  try {
    if (plaintext.length > MAX_LEGACY_FIELD_BYTES) throw invalid(label)
    const result = UTF8.decode(plaintext)
    if (!allowEmpty && result.length === 0) throw invalid(label)
    return result
  } catch (error) {
    if (error instanceof MindGardenPortabilityError) throw error
    throw invalid(label, error)
  } finally {
    plaintext.fill(0)
  }
}

function optionalPrivateText(
  value: SQLOutputValue,
  key: Buffer,
  aad: string,
  label: string,
): string {
  if (value === null) return ''
  return privateText(value, key, aad, label, true)
}

function privateJson<T>(
  value: SQLOutputValue,
  key: Buffer,
  aad: string,
  label: string,
  schema: z.ZodType<T>,
): T {
  const plaintext = privateText(value, key, aad, label, true)
  try {
    return schema.parse(JSON.parse(plaintext))
  } catch (error) {
    throw invalid(label, error)
  }
}

function canonicalFile(files: LegacyFiles, name: string): Buffer | null {
  const encoded = files[name]
  if (encoded === undefined) return null
  const bytes = Buffer.from(encoded, 'base64')
  if (bytes.toString('base64') !== encoded) {
    bytes.fill(0)
    throw invalid(`${name} file`)
  }
  return bytes
}

function settingsTimeZone(files: LegacyFiles): string {
  const bytes = canonicalFile(files, 'settings.json')
  if (bytes === null) return 'Asia/Shanghai'
  try {
    const value = z.looseObject({ timezone: z.string().min(1).max(128).optional() })
      .parse(JSON.parse(UTF8.decode(bytes)))
    const timeZone = value.timezone ?? 'Asia/Shanghai'
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(0)
    return timeZone
  } catch (error) {
    throw invalid('settings file', error)
  } finally {
    bytes.fill(0)
  }
}

function stampAt(timestamp: number, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = new Map(formatter.formatToParts(timestamp).map(part => [part.type, part.value]))
  const year = Number(parts.get('year'))
  const month = Number(parts.get('month'))
  const day = Number(parts.get('day'))
  const hour = Number(parts.get('hour'))
  const minute = Number(parts.get('minute'))
  const second = Number(parts.get('second'))
  const localMillis = Date.UTC(year, month - 1, day, hour, minute, second)
  const offset = Math.round((localMillis - Math.floor(timestamp / 1_000) * 1_000) / 60_000)
  if (![year, month, day, hour, minute, second, offset].every(Number.isFinite)
    || offset < -840 || offset > 840) {
    throw invalid('time zone metadata')
  }
  return {
    localDate: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    timeZone,
    utcOffsetMinutes: offset,
  }
}

function stampForDate(date: string, timeZone: string, referenceAt: number) {
  return { ...stampAt(referenceAt, timeZone), localDate: date }
}

function reflectionRecord(record: unknown): MindGardenBackupRecord {
  const decoded = decodeStoredReflection(record)
  return toBackupRecord(decoded.id, decoded)
}

function memoryRecord(record: unknown): MindGardenBackupRecord {
  const decoded = decodeStoredRecord(record)
  return toBackupRecord(decoded.id, decoded)
}

function convertCheckins(context: LegacyContext): readonly MindGardenBackupRecord[] {
  return (readLegacyRows(context.database, 'daily_checkins', `
    SELECT id, local_date, timezone, utc_offset_minutes, valence_enc, energy_enc,
      emotion_words_enc, phase, created_at
    FROM daily_checkins ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly CheckinRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'check-in id', 256)
    const id = originalId(context, 'checkin', row.id)
    const mood = moodSchema.parse(Number(privateText(
      row.valence_enc, context.key, `checkin:${legacyId}:mood`, 'check-in mood',
    )))
    const energy = energySchema.parse(Number(privateText(
      row.energy_enc, context.key, `checkin:${legacyId}:energy`, 'check-in energy',
    )))
    return reflectionRecord({
      recordType: 'checkin',
      formatVersion: 1,
      id,
      sourceSessionId: context.sourceSessionId,
      stamp: {
        localDate: localDate(row.local_date, 'check-in local date'),
        timeZone: legacyText(row.timezone, 'check-in time zone', 128),
        utcOffsetMinutes: legacyInteger(row.utc_offset_minutes, 'check-in UTC offset'),
      },
      mood,
      energy,
      emotionWords: privateJson(
        row.emotion_words_enc,
        context.key,
        `checkin:${legacyId}:emotion_words`,
        'check-in emotion words',
        emotionWordsSchema,
      ),
      phase: checkinPhaseSchema.parse(legacyText(row.phase, 'check-in phase', 32)),
      createdAt: legacyMilliseconds(row.created_at, 'check-in creation time'),
    })
  })
}

function convertJournals(
  context: LegacyContext,
): { readonly records: readonly MindGardenBackupRecord[]; readonly versions: ReadonlyMap<string, string> } {
  const versions = new Map<string, string>()
  const records = (readLegacyRows(context.database, 'journal_entries', `
    SELECT id, local_date, timezone, utc_offset_minutes, title_enc, content_enc,
      allow_retrieval, created_at, updated_at
    FROM journal_entries ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly JournalRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'journal id', 256)
    const id = originalId(context, 'journal', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'journal creation time')
    const updatedAt = legacyMilliseconds(row.updated_at, 'journal update time')
    const version = originalVersion(context, 'journal', legacyId, updatedAt)
    versions.set(legacyId, version)
    return reflectionRecord({
      recordType: 'journal',
      formatVersion: 1,
      id,
      version,
      sourceSessionId: context.sourceSessionId,
      stamp: {
        localDate: localDate(row.local_date, 'journal local date'),
        timeZone: legacyText(row.timezone, 'journal time zone', 128),
        utcOffsetMinutes: legacyInteger(row.utc_offset_minutes, 'journal UTC offset'),
      },
      title: optionalPrivateText(row.title_enc, context.key, `journal:${legacyId}:title`, 'journal title'),
      body: privateText(row.content_enc, context.key, `journal:${legacyId}:body`, 'journal body'),
      allowRetrieval: bool(row.allow_retrieval, 'journal retrieval permission'),
      createdAt,
      updatedAt,
    })
  })
  return { records, versions }
}

function convertConcerns(context: LegacyContext): readonly MindGardenBackupRecord[] {
  return (readLegacyRows(context.database, 'concerns', `
    SELECT id, content_enc, status, created_local_date, remind_on, timezone,
      converted_journal_id, created_at, updated_at
    FROM concerns ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly ConcernRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'concern id', 256)
    const id = originalId(context, 'concern', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'concern creation time')
    const updatedAt = legacyMilliseconds(row.updated_at, 'concern update time')
    const timeZone = legacyOptionalText(row.timezone, 'concern time zone', 128) || context.timeZone
    const originalStatus = legacyText(row.status, 'concern status', 32)
    const convertedJournal = legacyOptionalText(row.converted_journal_id, 'converted journal id', 256)
    const status = originalStatus === 'done' ? 'completed' : originalStatus
    if (status !== 'active' && status !== 'completed' && status !== 'converted') {
      throw invalid('concern status')
    }
    if (status === 'converted' && convertedJournal === null) throw invalid('converted concern journal')
    const reminderDate = legacyOptionalText(row.remind_on, 'concern reminder date', 32)
    return reflectionRecord({
      recordType: 'concern',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'concern', legacyId, updatedAt),
      sourceSessionId: context.sourceSessionId,
      content: privateText(row.content_enc, context.key, `concern:${legacyId}:content`, 'concern content'),
      status,
      createdStamp: stampForDate(localDate(row.created_local_date, 'concern creation date'), timeZone, createdAt),
      reminder: status === 'active' && reminderDate !== null
        ? stampForDate(localDate(reminderDate, 'concern reminder date'), timeZone, updatedAt)
        : null,
      convertedJournalId: convertedJournal === null ? null : originalId(context, 'journal', convertedJournal),
      conversion: null,
      createdAt,
      updatedAt,
    })
  })
}

function convertContemplations(context: LegacyContext): MindGardenBackupRecord[] {
  const records = (readLegacyRows(context.database, 'contemplation_notes', `
    SELECT id, session_id, markdown_enc, status, confirmed_at, created_at, updated_at
    FROM contemplation_notes WHERE status != 'deleted' ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly ContemplationRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'contemplation id', 256)
    const id = originalId(context, 'contemplation', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'contemplation creation time')
    const originalUpdatedAt = legacyMilliseconds(row.updated_at, 'contemplation update time')
    const status = contemplationStatusSchema.parse(legacyText(row.status, 'contemplation status', 32))
    const confirmedAt = status === 'confirmed'
      ? Math.max(
        createdAt,
        row.confirmed_at === null
          ? originalUpdatedAt
          : legacyMilliseconds(row.confirmed_at, 'contemplation confirmation time'),
      )
      : null
    const updatedAt = confirmedAt ?? originalUpdatedAt
    return reflectionRecord({
      recordType: 'contemplation',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'contemplation', legacyId, updatedAt),
      sourceSessionId: legacyOptionalText(row.session_id, 'contemplation session id', 256)
        ?? context.sourceSessionId,
      markdown: privateText(
        row.markdown_enc,
        context.key,
        `contemplation_note:${legacyId}:markdown`,
        'contemplation markdown',
      ),
      status,
      createdAt,
      updatedAt,
      confirmedAt,
    })
  })

  for (const name of ['philosophy-notebook.md', 'personal-philosophy.md'] as const) {
    const bytes = canonicalFile(context.files, name)
    if (bytes === null) continue
    try {
      if (bytes.length > MAX_LEGACY_FIELD_BYTES) throw invalid(`${name} file`)
      const markdown = UTF8.decode(bytes).trim()
      if (markdown.length === 0) continue
      const id = deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:markdown:${name}`)
      records.push(reflectionRecord({
        recordType: 'contemplation',
        formatVersion: 1,
        id,
        version: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:markdown-version:${name}`),
        sourceSessionId: context.sourceSessionId,
        markdown,
        status: 'confirmed',
        createdAt: context.createdAt,
        updatedAt: context.createdAt,
        confirmedAt: context.createdAt,
      }))
    } catch (error) {
      if (error instanceof MindGardenPortabilityError) throw error
      throw invalid(`${name} file`, error)
    } finally {
      bytes.fill(0)
    }
  }
  return records
}

function convertNotes(context: LegacyContext): readonly MindGardenBackupRecord[] {
  return (readLegacyRows(context.database, 'notes', `
    SELECT id, session_id, markdown_enc, status, created_at, updated_at
    FROM notes WHERE status != 'deleted' ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly NoteRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'note id', 256)
    const id = originalId(context, 'note', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'note creation time')
    const confirmedAt = Math.max(createdAt, legacyMilliseconds(row.updated_at, 'note update time'))
    return reflectionRecord({
      recordType: 'contemplation',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'note', legacyId, confirmedAt),
      sourceSessionId: legacyOptionalText(row.session_id, 'note session id', 256)
        ?? context.sourceSessionId,
      markdown: privateText(row.markdown_enc, context.key, `note:${legacyId}:markdown`, 'note markdown'),
      status: 'confirmed',
      createdAt,
      updatedAt: confirmedAt,
      confirmedAt,
    })
  })
}

function convertPrinciples(context: LegacyContext): readonly MindGardenBackupRecord[] {
  const versionRows = readLegacyRows(context.database, 'principle_versions', `
    SELECT principle_id, version, content_enc, source_note_id, created_at
    FROM principle_versions ORDER BY principle_id, version LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly PrincipleVersionRow[]
  const versionsByPrinciple = new Map<string, PrincipleVersionRow[]>()
  for (const row of versionRows) {
    const principleId = legacyText(row.principle_id, 'principle version owner id', 256)
    const versions = versionsByPrinciple.get(principleId) ?? []
    versions.push(row)
    versionsByPrinciple.set(principleId, versions)
  }

  return (readLegacyRows(context.database, 'principles', `
    SELECT id, status, current_version, created_at, updated_at
    FROM principles ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly PrincipleRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'principle id', 256)
    const id = originalId(context, 'principle', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'principle creation time')
    const currentVersion = legacyInteger(row.current_version, 'principle current version')
    const sourceRows = versionsByPrinciple.get(legacyId) ?? []
    if (currentVersion < 1 || sourceRows.length !== currentVersion) throw invalid('principle version history')
    const versions = sourceRows.map((versionRow, index) => {
      const number = legacyInteger(versionRow.version, 'principle version number')
      if (number !== index + 1) throw invalid('principle version sequence')
      const content = privateJson(
        versionRow.content_enc,
        context.key,
        `principle_version:${legacyId}:${String(number)}`,
        'principle version content',
        legacyPrincipleContentSchema,
      )
      const sourceNoteId = legacyOptionalText(versionRow.source_note_id, 'principle source note id', 256)
      const created = legacyMilliseconds(versionRow.created_at, 'principle version creation time')
      const supportingExperiences = content.supporting_experiences
        .map(experience => ({
          summary: experience.summary.trim(),
          sourceContemplationId: experience.source_note_id === null
            || experience.source_note_id === undefined
            ? null
            : originalId(context, 'note', experience.source_note_id),
        }))
        .filter(experience => experience.summary.length > 0)
      const currentContent = {
        expression: content.expression,
        formationContext: content.formation_context,
        userQuote: content.user_quote || content.expression,
        supportingExperiences,
        counterexample: content.counterexample,
        appliesTo: content.applies_to.filter(Boolean),
        notAppliesTo: content.not_applies_to.filter(Boolean),
        lastChallenged: content.last_challenged,
        status: content.status,
      }
      return {
        number,
        content: currentContent,
        sourceProposalId: null,
        sourceContemplationId: sourceNoteId === null ? null : originalId(context, 'note', sourceNoteId),
        stamp: stampAt(created, context.timeZone),
        createdAt: created,
      }
    })
    const latest = versions.at(-1)
    if (latest === undefined) throw invalid('principle version history')
    const status = principleStatusSchema.parse(legacyText(row.status, 'principle status', 32))
    if (status !== latest.content.status) throw invalid('principle current status')
    return reflectionRecord({
      recordType: 'principle',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'principle', legacyId, latest.createdAt),
      status,
      current: latest.content,
      versions,
      createdAt,
      updatedAt: latest.createdAt,
    })
  })
}

function convertExperiments(context: LegacyContext): readonly MindGardenBackupRecord[] {
  const observations = readLegacyRows(context.database, 'experiment_observations', `
    SELECT id, experiment_id, happened_enc, action_enc, observation_enc, mood, energy,
      occurred_at, created_at
    FROM experiment_observations ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly ExperimentObservationRow[]
  const byExperiment = new Map<string, ExperimentObservationRow[]>()
  for (const row of observations) {
    const experimentId = legacyText(row.experiment_id, 'experiment observation owner id', 256)
    const group = byExperiment.get(experimentId) ?? []
    group.push(row)
    byExperiment.set(experimentId, group)
  }

  return (readLegacyRows(context.database, 'reality_experiments', `
    SELECT id, title_enc, hypothesis_enc, action_enc, review_on, status, result_enc,
      judgment_enc, source_session_id, source_message_id, evidence_quote_enc,
      created_at, updated_at
    FROM reality_experiments ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly ExperimentRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'experiment id', 256)
    const id = originalId(context, 'experiment', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'experiment creation time')
    const updatedAt = legacyMilliseconds(row.updated_at, 'experiment update time')
    const status = experimentStatusSchema.parse(legacyText(row.status, 'experiment status', 32))
    const sourceMessageId = legacyOptionalText(row.source_message_id, 'experiment source message id', 256)
    const evidenceQuote = optionalPrivateText(
      row.evidence_quote_enc,
      context.key,
      `experiment:${legacyId}:evidence`,
      'experiment evidence',
    )
    const convertedObservations = (byExperiment.get(legacyId) ?? []).map((observation) => {
      const observationId = legacyText(observation.id, 'experiment observation id', 256)
      const occurredAt = legacyMilliseconds(observation.occurred_at, 'experiment observation time')
      return {
        id: originalId(context, 'experiment-observation', observation.id),
        happened: optionalPrivateText(
          observation.happened_enc,
          context.key,
          `experiment_observation:${observationId}:happened`,
          'experiment observation event',
        ),
        action: optionalPrivateText(
          observation.action_enc,
          context.key,
          `experiment_observation:${observationId}:action`,
          'experiment observation action',
        ),
        observation: privateText(
          observation.observation_enc,
          context.key,
          `experiment_observation:${observationId}:observation`,
          'experiment observation',
        ),
        mood: observation.mood === null ? null : nullableEnergySchema.parse(legacyInteger(observation.mood, 'experiment mood')),
        energy: observation.energy === null
          ? null
          : nullableEnergySchema.parse(legacyInteger(observation.energy, 'experiment energy')),
        stamp: stampAt(occurredAt, context.timeZone),
        createdAt: legacyMilliseconds(observation.created_at, 'experiment observation creation time'),
      }
    })
    const reviewOn = legacyOptionalText(row.review_on, 'experiment review date', 32)
    return reflectionRecord({
      recordType: 'experiment',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'experiment', legacyId, updatedAt),
      sourceSessionId: legacyOptionalText(row.source_session_id, 'experiment source session id', 256)
        ?? context.sourceSessionId,
      title: privateText(row.title_enc, context.key, `experiment:${legacyId}:title`, 'experiment title'),
      hypothesis: privateText(
        row.hypothesis_enc, context.key, `experiment:${legacyId}:hypothesis`, 'experiment hypothesis', true,
      ),
      action: privateText(row.action_enc, context.key, `experiment:${legacyId}:action`, 'experiment action'),
      reviewStamp: reviewOn !== null && status !== 'observed' && status !== 'stopped'
        ? stampForDate(localDate(reviewOn, 'experiment review date'), context.timeZone, updatedAt)
        : null,
      status,
      result: optionalPrivateText(row.result_enc, context.key, `experiment:${legacyId}:result`, 'experiment result'),
      judgment: optionalPrivateText(
        row.judgment_enc, context.key, `experiment:${legacyId}:judgment`, 'experiment judgment',
      ),
      sourceMessageId,
      evidenceQuote: sourceMessageId === null ? '' : evidenceQuote,
      observations: convertedObservations,
      createdStamp: stampAt(createdAt, context.timeZone),
      startedAt: status === 'proposed' ? null : createdAt,
      stoppedAt: status === 'stopped' ? updatedAt : null,
      createdAt,
      updatedAt,
    })
  })
}

function convertOpenQuestions(
  context: LegacyContext,
  journalVersions: ReadonlyMap<string, string>,
): readonly MindGardenBackupRecord[] {
  return (readLegacyRows(context.database, 'open_loops', `
    SELECT id, question_enc, status, source_session_id, source_message_id,
      source_journal_id, evidence_quote_enc, created_at, updated_at
    FROM open_loops ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly OpenQuestionRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'open question id', 256)
    const id = originalId(context, 'open-question', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'open question creation time')
    const updatedAt = legacyMilliseconds(row.updated_at, 'open question update time')
    const status = openQuestionStatusSchema.parse(legacyText(row.status, 'open question status', 32))
    const sourceMessageId = legacyOptionalText(row.source_message_id, 'open question source message id', 256)
    const sourceJournalId = legacyOptionalText(row.source_journal_id, 'open question source journal id', 256)
    const evidenceQuote = optionalPrivateText(
      row.evidence_quote_enc,
      context.key,
      `open_loop:${legacyId}:evidence`,
      'open question evidence',
    )
    const createdStamp = stampAt(createdAt, context.timeZone)
    const source = evidenceQuote.length === 0
      ? null
      : sourceMessageId !== null
        ? { kind: 'message', messageId: sourceMessageId, evidenceQuote }
        : sourceJournalId !== null && journalVersions.has(sourceJournalId)
          ? {
            kind: 'journal',
            journalId: originalId(context, 'journal', sourceJournalId),
            journalVersion: journalVersions.get(sourceJournalId),
            evidenceQuote,
          }
          : null
    const transitions = [{
      id: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:open-question-transition:${legacyId}:open`),
      status: 'open',
      stamp: createdStamp,
      createdAt,
    }]
    if (status !== 'open') {
      transitions.push({
        id: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:open-question-transition:${legacyId}:${status}`),
        status,
        stamp: stampAt(updatedAt, context.timeZone),
        createdAt: updatedAt,
      })
    }
    return reflectionRecord({
      recordType: 'open-question',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'open-question', legacyId, updatedAt),
      sourceSessionId: legacyOptionalText(row.source_session_id, 'open question source session id', 256)
        ?? context.sourceSessionId,
      question: privateText(row.question_enc, context.key, `open_loop:${legacyId}:question`, 'open question'),
      status,
      source,
      transitions,
      createdStamp,
      createdAt,
      updatedAt,
    })
  })
}

function convertPeriodReviews(context: LegacyContext): readonly MindGardenBackupRecord[] {
  return (readLegacyRows(context.database, 'period_reviews', `
    SELECT id, period_type, start_date, end_date, status, content_enc, sources_json,
      created_at, updated_at
    FROM period_reviews ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly PeriodReviewRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'period review id', 256)
    const id = originalId(context, 'period-review', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'period review creation time')
    const updatedAt = legacyMilliseconds(row.updated_at, 'period review update time')
    const startDate = localDate(row.start_date, 'period review start date')
    const endDate = localDate(row.end_date, 'period review end date')
    let sourceValues: z.infer<typeof legacyPeriodSourcesSchema>
    try {
      sourceValues = legacyPeriodSourcesSchema.parse(JSON.parse(legacyText(
        row.sources_json,
        'period review source manifest',
        MAX_LEGACY_FIELD_BYTES,
      )))
    } catch (error) {
      throw invalid('period review source manifest', error)
    }
    if (sourceValues.length === 0) {
      sourceValues = [{ type: 'empty-manifest', id: legacyId, date: endDate }]
    }
    const sources = sourceValues.map((source) => {
      const date = source.date !== undefined
        && /^\d{4}-\d{2}-\d{2}$/u.test(source.date)
        && source.date >= startDate
        && source.date <= endDate
        ? source.date
        : endDate
      return {
        id: deterministicLegacyUuid(
          `${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:period-source:${source.type}:${source.id}`,
        ),
        sourceType: 'legacy-original' as const,
        legacyType: source.type,
        fingerprint: createHash('sha256').update(JSON.stringify(source)).digest('hex'),
        localDates: [date],
      }
    }).sort((left, right) =>
      `${left.sourceType}:${left.id}`.localeCompare(`${right.sourceType}:${right.id}`),
    )
    return reflectionRecord({
      recordType: 'period-review',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'period-review', legacyId, updatedAt),
      sourceSessionId: context.sourceSessionId,
      periodType: periodReviewTypeSchema.parse(legacyText(row.period_type, 'period review type', 16)),
      startStamp: stampForDate(startDate, context.timeZone, createdAt),
      endStamp: stampForDate(endDate, context.timeZone, updatedAt),
      status: periodReviewStatusSchema.parse(legacyText(row.status, 'period review status', 32)),
      content: privateText(
        row.content_enc, context.key, `period_review:${legacyId}:content`, 'period review content',
      ),
      sources,
      sourceHash: createHash('sha256').update(JSON.stringify(sources)).digest('hex'),
      createdAt,
      updatedAt,
    })
  })
}

function currentMemoryKind(value: string) {
  if (value === 'fact') return 'episode' as const
  if (value === 'preference' || value === 'support_preference') return 'support-preference' as const
  if (value === 'identity' || value === 'value' || value === 'decision'
    || value === 'emotion' || value === 'episode') return value
  throw invalid('memory kind')
}

function convertMemories(context: LegacyContext): readonly MindGardenBackupRecord[] {
  const sourceRows = readLegacyRows(context.database, 'memory_sources', `
    SELECT memory_id, session_id, message_id, quote_enc
    FROM memory_sources ORDER BY memory_id, session_id, message_id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly MemorySourceRow[]
  const sources = new Map<string, MemorySourceRow[]>()
  for (const row of sourceRows) {
    const memoryId = legacyText(row.memory_id, 'memory source owner id', 256)
    const group = sources.get(memoryId) ?? []
    group.push(row)
    sources.set(memoryId, group)
  }
  return (readLegacyRows(context.database, 'memories', `
    SELECT id, kind, content_enc, status, sensitivity, reason_enc, expires_at,
      confirmed_at, disabled_at, created_at, updated_at
    FROM memories ORDER BY created_at, id LIMIT ?
  `, MAX_LEGACY_RECORDS) as readonly MemoryRow[]).map((row) => {
    const legacyId = legacyText(row.id, 'memory id', 256)
    const id = originalId(context, 'memory', row.id)
    const createdAt = legacyMilliseconds(row.created_at, 'memory creation time')
    const updatedAt = legacyMilliseconds(row.updated_at, 'memory update time')
    const expiresAt = row.expires_at === null ? undefined : legacyMilliseconds(row.expires_at, 'memory expiry')
    const originalStatus = memoryStatusSchema.parse(legacyText(row.status, 'memory status', 32))
    const status = originalStatus === 'confirmed' && expiresAt !== undefined ? 'temporary' : originalStatus
    const sensitivity = sensitivitySchema.parse(legacyText(row.sensitivity, 'memory sensitivity', 32))
    const disabled = row.disabled_at !== null
    const accepted = status === 'confirmed' || status === 'temporary'
    const convertedSources = (sources.get(legacyId) ?? []).map((source) => {
      const sessionId = legacyOptionalText(source.session_id, 'memory source session id', 256)
        ?? context.sourceSessionId
      const messageId = legacyOptionalText(source.message_id, 'memory source message id', 256)
      const quote = messageId === null
        ? ''
        : optionalPrivateText(
          source.quote_enc,
          context.key,
          `memory_source:${legacyId}:${messageId}`,
          'memory source quote',
        )
      return quote.length > 0 && messageId !== null
        ? { sessionId, messageId, evidenceQuote: quote }
        : { sessionId }
    })
    if (convertedSources.length === 0) convertedSources.push({ sessionId: context.sourceSessionId })
    const reason = optionalPrivateText(
      row.reason_enc, context.key, `memory:${legacyId}:reason`, 'memory reason',
    ) || '原版记录未保存形成理由。'
    const confirmedAt = accepted
      ? row.confirmed_at === null
        ? updatedAt
        : Math.max(createdAt, legacyMilliseconds(row.confirmed_at, 'memory confirmation time'))
      : undefined
    return memoryRecord({
      recordType: 'memory',
      formatVersion: 1,
      id,
      version: originalVersion(context, 'memory', legacyId, updatedAt),
      status,
      kind: currentMemoryKind(legacyText(row.kind, 'memory kind', 64)),
      sensitivity,
      content: privateText(row.content_enc, context.key, `memory:${legacyId}:content`, 'memory content'),
      reason,
      recallPolicy: accepted && sensitivity === 'normal' && !disabled ? 'relevant' : 'never',
      sources: convertedSources,
      proposalOrigin: 'legacy-import',
      createdAt,
      updatedAt,
      ...(confirmedAt === undefined ? {} : { confirmedAt }),
      ...(status === 'temporary' ? { expiresAt } : {}),
    })
  })
}

function convertStarState(context: LegacyContext): readonly MindGardenBackupRecord[] {
  const profiles = readLegacyRows(context.database, 'star_profiles', `
    SELECT id, onboarding_stage, onboarding_completed, display_name_enc, birth_date_enc,
      birth_time_enc, birth_time_known, birth_city_enc, birth_city_known, mbti_mode,
      mbti_type_enc, mbti_answers_enc, self_words_enc, observation_intent_enc,
      observer_tone, reduced_motion, created_at, updated_at
    FROM star_profiles WHERE id = 'profile' ORDER BY id LIMIT ?
  `, 1) as readonly StarProfileRow[]
  const row = profiles[0]
  if (row === undefined) return []
  const prefix = 'star_profile:profile'
  const createdAt = legacyMilliseconds(row.created_at, 'star profile creation time')
  const updatedAt = legacyMilliseconds(row.updated_at, 'star profile update time')
  const displayName = privateText(row.display_name_enc, context.key, `${prefix}:display_name`, 'star display name', true)
  const birthDate = privateJson(
    row.birth_date_enc,
    context.key,
    `${prefix}:birth_date`,
    'star birth date',
    z.looseObject({
      year: z.number().int().min(1900).max(2200).optional(),
      month: z.number().int().min(1).max(12).optional(),
      day: z.number().int().min(1).max(31).optional(),
    }),
  )
  const birthTime = privateText(row.birth_time_enc, context.key, `${prefix}:birth_time`, 'star birth time', true)
  const birthCity = privateText(row.birth_city_enc, context.key, `${prefix}:birth_city`, 'star birth city', true)
  const rawMode = starModeSchema.parse(legacyText(row.mbti_mode, 'star MBTI mode', 32))
  const rawType = privateText(row.mbti_type_enc, context.key, `${prefix}:mbti_type`, 'star MBTI type', true)
  const rawAnswers = privateJson(
    row.mbti_answers_enc,
    context.key,
    `${prefix}:mbti_answers`,
    'star MBTI answers',
    z.array(z.string()),
  )
  const knownMode = rawMode === 'known' && /^[EI][SN][TF][JP]$/u.test(rawType)
  const sceneAnswers = z.array(sceneAnswerSchema).safeParse(rawAnswers)
  const scenesMode = rawMode === 'scenes' && sceneAnswers.success && sceneAnswers.data.length === 6
  const mbtiMode = knownMode ? 'known' : scenesMode ? 'scenes' : 'observe'
  const selfWords = privateJson(
    row.self_words_enc,
    context.key,
    `${prefix}:self_words`,
    'star self words',
    stringArraySchema.max(5),
  )
  const observationIntent = privateText(
    row.observation_intent_enc,
    context.key,
    `${prefix}:observation_intent`,
    'star observation intent',
    true,
  )
  const requestedComplete = bool(row.onboarding_completed, 'star ritual completion')
  const complete = requestedComplete && displayName.length > 0 && selfWords.length > 0 && observationIntent.length > 0
  const profile = {
    onboardingStage: complete
      ? 3
      : Math.min(2, Math.max(0, legacyInteger(row.onboarding_stage, 'star onboarding stage'))),
    onboardingCompleted: complete,
    displayName,
    birthMonth: birthDate.month ?? null,
    birthDay: birthDate.day ?? null,
    birthYear: birthDate.year ?? null,
    birthTime: bool(row.birth_time_known, 'star birth time knowledge') && birthTime.length > 0 ? birthTime : '',
    birthTimeKnown: bool(row.birth_time_known, 'star birth time knowledge') && birthTime.length > 0,
    birthCity: bool(row.birth_city_known, 'star birth city knowledge') && birthCity.length > 0 ? birthCity : '',
    birthCityKnown: bool(row.birth_city_known, 'star birth city knowledge') && birthCity.length > 0,
    mbtiMode,
    mbtiType: mbtiMode === 'known' ? rawType : '',
    mbtiAnswers: mbtiMode === 'scenes' && sceneAnswers.success ? sceneAnswers.data : [],
    selfWords,
    observationIntent,
    observerTone: starToneSchema.parse(legacyText(row.observer_tone, 'star observer tone', 32)),
    permissions: {
      dailyReflections: false,
      confirmedMemories: false,
      openQuestions: false,
      periodReviews: false,
    },
    reducedMotion: bool(row.reduced_motion, 'star reduced motion preference'),
    createdAt,
    updatedAt,
  }
  const traits: ConvertedStarTrait[] = complete
    ? selfWords.map((word, index) => ({
      id: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-self-word:${word}`),
      version: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-self-word-version:${word}`),
      kind: index === 0 ? 'strength' as const : 'pattern' as const,
      status: 'self-reported' as const,
      label: word,
      description: '由原版观星礼中的自述词迁入。',
      confidence: 1,
      source: 'ritual-self-report' as const,
      createdAt,
      updatedAt,
    }))
    : []
  if (complete) {
    const seenLabels = new Set(selfWords)
    for (const traitRow of readLegacyRows(context.database, 'star_traits', `
      SELECT id, kind, status, label_enc, description_enc, confidence, source_mode,
        created_at, updated_at
      FROM star_traits WHERE source_mode != 'ritual' ORDER BY created_at, id LIMIT ?
    `, MAX_LEGACY_RECORDS) as readonly StarTraitRow[]) {
      const legacyId = legacyText(traitRow.id, 'star trait id', 256)
      const label = privateText(
        traitRow.label_enc, context.key, `star_trait:${legacyId}:label`, 'star trait label', true,
      )
      if (label.length === 0 || seenLabels.has(label)) continue
      seenLabels.add(label)
      const status = starStatusSchema.parse(legacyText(traitRow.status, 'star trait status', 32))
      traits.push({
        id: originalId(context, 'star-trait', traitRow.id),
        version: originalVersion(
          context,
          'star-trait',
          legacyId,
          legacyMilliseconds(traitRow.updated_at, 'star trait update time'),
        ),
        kind: starKindSchema.parse(legacyText(traitRow.kind, 'star trait kind', 32)),
        status,
        label,
        description: privateText(
          traitRow.description_enc,
          context.key,
          `star_trait:${legacyId}:description`,
          'star trait description',
          true,
        ),
        confidence: z.number().min(0).max(1).parse(legacyFiniteNumber(traitRow.confidence, 'star trait confidence')),
        source: 'star-observer',
        createdAt: legacyMilliseconds(traitRow.created_at, 'star trait creation time'),
        updatedAt: legacyMilliseconds(traitRow.updated_at, 'star trait update time'),
      })
    }
  }
  const id = deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-state`)
  const state = decodeStoredStarState({
    recordType: 'star-state',
    formatVersion: 1,
    id,
    version: deterministicLegacyUuid(`${LEGACY_SOURCE_PREFIX}:${context.workspaceId}:star-state-version:${String(updatedAt)}`),
    profile,
    traits,
    cards: [],
    observationRuns: [],
    dialogueRuns: [],
  })
  return [toBackupRecord(id, state)]
}

/**
 * Convert supported original private records without mutating any current provider.
 * @param database - Authenticated read-only original SQLite snapshot.
 * @param key - Original data key retained only for this conversion.
 * @param workspaceId - Original workspace identity used for deterministic record ids.
 * @param createdAt - Authenticated package creation time in milliseconds.
 * @param files - Authenticated original package files used for settings and Markdown projections.
 * @returns Strictly decoded current vault records for a later non-overwriting merge.
 */
export function convertLegacyPrivateCollections(
  database: DatabaseSync,
  key: Buffer,
  workspaceId: string,
  createdAt: number,
  files: LegacyFiles,
): LegacyPrivateCollections {
  const context: LegacyContext = {
    database,
    key,
    workspaceId,
    sourceSessionId: `${LEGACY_SOURCE_PREFIX}:${workspaceId}`,
    timeZone: settingsTimeZone(files),
    createdAt,
    files,
  }
  try {
    const journals = convertJournals(context)
    return {
      memories: convertMemories(context),
      reflections: [
        ...convertCheckins(context),
        ...journals.records,
        ...convertConcerns(context),
        ...convertContemplations(context),
        ...convertNotes(context),
        ...convertPrinciples(context),
        ...convertExperiments(context),
        ...convertOpenQuestions(context, journals.versions),
        ...convertPeriodReviews(context),
      ],
      stars: convertStarState(context),
    }
  } catch (error) {
    if (error instanceof MindGardenPortabilityError) throw error
    throw invalid('private record', error)
  }
}
