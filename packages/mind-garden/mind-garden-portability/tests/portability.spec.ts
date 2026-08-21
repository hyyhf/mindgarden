import { Buffer } from 'node:buffer'
import { createCipheriv, createHash, pbkdf2Sync, randomBytes } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import type { Agent } from '@deepseek-ai/dsh-agent'
import {
  AttachmentError,
  AttachmentId,
  type ImageAttachmentRef,
  type SaveImageAttachment,
} from '@deepseek-ai/dsh-attachment'
import type {
  MindGardenVaultMergeCandidates,
  MindGardenVaultSnapshot,
} from '@deepseek-ai/dsh-mind-garden-vault'
import { decodeStoredReflection } from '@deepseek-ai/dsh-mind-garden-reflection'
import { decodeStoredStarState } from '@deepseek-ai/dsh-mind-garden-star-map'
import { decryptMindGardenBackup, encryptMindGardenBackup } from '../src/backup.ts'
import MindGardenPortabilityService from '../src/index.ts'
import { loadLegacyMindGardenBackup } from '../src/legacy.ts'

const PASSPHRASE = 'warm observatory window'
const LEGACY_PASSPHRASE = 'old garden key'
const PNG = Uint8Array.from(Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
))
const REF: ImageAttachmentRef = {
  attachmentId: AttachmentId(`sha256:${createHash('sha256').update(PNG).digest('hex')}`),
  mediaType: 'image/png',
  bytes: PNG.length,
  width: 1,
  height: 1,
  name: 'memory.png',
}

function memoryRecord() {
  return {
    recordType: 'memory',
    formatVersion: 1,
    id: '10000000-0000-4000-8000-000000000001',
    version: '20000000-0000-4000-8000-000000000002',
    status: 'candidate',
    kind: 'fact',
    sensitivity: 'normal',
    content: 'remember me',
    reason: 'Scheduling context',
    recallPolicy: 'never',
    sources: [{ sessionId: 'source' }],
    createdAt: 1,
    updatedAt: 1,
  }
}

const PARTICLES = {
  version: 1,
  preset: 'soft',
  rendering: {
    quality: 'medium', pointSize: 2, density: 0.6, opacity: 0.9,
    preserveColors: true, background: '#091715',
  },
  depth: { strength: 20, randomness: 4 },
  interaction: {
    mode: 'repel', radius: 1, strength: 2, velocityInfluence: 0.5,
    vortexStrength: 0, clickBurst: true,
  },
  physics: { spring: 4, damping: 0.94, maxVelocity: 4, maxDistance: 5, turbulence: 0.2 },
  animation: { idleStrength: 0.2, idleSpeed: 0.4, paperStrength: 0.4, paperSpeed: 0.6 },
  effects: { saturation: 1, exposure: 1, tint: '#ffffff', tintMix: 0, bloom: 0.2, vignette: 0.3 },
} as const

function mediaRecord() {
  return {
    recordType: 'photo-story',
    formatVersion: 1,
    id: '00000000-0000-4000-8000-000000000001',
    version: '00000000-0000-4000-8000-000000000002',
    attachment: REF,
    title: 'Warm afternoon',
    note: '',
    stamp: { localDate: '2026-08-20', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 },
    particleConfig: PARTICLES,
    observation: null,
    turns: [],
    quickReplies: [],
    modelRuns: [],
    createdAt: 1_000,
    updatedAt: 1_000,
  }
}

function encryptLegacyValue(value: Uint8Array, key: Buffer, aad: string): Buffer {
  const nonce = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, nonce)
  cipher.setAAD(Buffer.from(aad, 'utf8'))
  return Buffer.concat([Buffer.from('MG1', 'ascii'), nonce, cipher.update(value), cipher.final(), cipher.getAuthTag()])
}

function encryptLegacyText(value: string, key: Buffer, aad: string): Buffer {
  return encryptLegacyValue(Buffer.from(value, 'utf8'), key, aad)
}

function encryptLegacyJson(value: unknown, key: Buffer, aad: string): Buffer {
  return encryptLegacyText(JSON.stringify(value), key, aad)
}

async function originalArchive(): Promise<Buffer> {
  const root = await mkdtemp(join(tmpdir(), 'mind-garden-original-fixture-'))
  const path = join(root, 'mind_garden.db')
  const dataKey = randomBytes(32)
  const legacyId = '0123456789abcdef0123456789abcdef'
  try {
    const database = new DatabaseSync(path)
    try {
      database.exec(`
        CREATE TABLE photo_stories (
          id TEXT PRIMARY KEY,
          media_type TEXT NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          image_enc BLOB NOT NULL,
          particle_config_enc BLOB NOT NULL,
          local_date TEXT NOT NULL,
          timezone TEXT NOT NULL,
          utc_offset_minutes INTEGER NOT NULL,
          created_at REAL NOT NULL,
          updated_at REAL NOT NULL
        );

        CREATE TABLE daily_checkins (
          id TEXT PRIMARY KEY, local_date TEXT NOT NULL, timezone TEXT NOT NULL,
          utc_offset_minutes INTEGER NOT NULL, valence_enc BLOB NOT NULL,
          energy_enc BLOB NOT NULL, emotion_words_enc BLOB NOT NULL,
          phase TEXT NOT NULL, created_at REAL NOT NULL
        );
        CREATE TABLE journal_entries (
          id TEXT PRIMARY KEY, local_date TEXT NOT NULL, timezone TEXT NOT NULL,
          utc_offset_minutes INTEGER NOT NULL, title_enc BLOB, content_enc BLOB NOT NULL,
          allow_retrieval INTEGER NOT NULL, created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE concerns (
          id TEXT PRIMARY KEY, content_enc BLOB NOT NULL, status TEXT NOT NULL,
          created_local_date TEXT NOT NULL, remind_on TEXT, timezone TEXT NOT NULL,
          converted_journal_id TEXT, created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE contemplation_notes (
          id TEXT PRIMARY KEY, session_id TEXT NOT NULL, markdown_enc BLOB NOT NULL,
          status TEXT NOT NULL, confirmed_at REAL, created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE notes (
          id TEXT PRIMARY KEY, session_id TEXT, local_date TEXT NOT NULL,
          markdown_enc BLOB NOT NULL, status TEXT NOT NULL,
          created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE principles (
          id TEXT PRIMARY KEY, status TEXT NOT NULL, current_version INTEGER NOT NULL,
          created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE principle_versions (
          principle_id TEXT NOT NULL, version INTEGER NOT NULL, content_enc BLOB NOT NULL,
          source_note_id TEXT, created_at REAL NOT NULL
        );
        CREATE TABLE reality_experiments (
          id TEXT PRIMARY KEY, title_enc BLOB NOT NULL, hypothesis_enc BLOB NOT NULL,
          action_enc BLOB NOT NULL, review_on TEXT, status TEXT NOT NULL, result_enc BLOB,
          judgment_enc BLOB, source_session_id TEXT, source_message_id TEXT,
          evidence_quote_enc BLOB, created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE experiment_observations (
          id TEXT PRIMARY KEY, experiment_id TEXT NOT NULL, happened_enc BLOB,
          action_enc BLOB, observation_enc BLOB NOT NULL, mood INTEGER, energy INTEGER,
          occurred_at REAL NOT NULL, created_at REAL NOT NULL
        );
        CREATE TABLE open_loops (
          id TEXT PRIMARY KEY, question_enc BLOB NOT NULL, status TEXT NOT NULL,
          source_session_id TEXT, source_message_id TEXT, source_journal_id TEXT,
          evidence_quote_enc BLOB, created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE period_reviews (
          id TEXT PRIMARY KEY, period_type TEXT NOT NULL, start_date TEXT NOT NULL,
          end_date TEXT NOT NULL, status TEXT NOT NULL, content_enc BLOB NOT NULL,
          sources_json TEXT NOT NULL, created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE memories (
          id TEXT PRIMARY KEY, kind TEXT NOT NULL, content_enc BLOB NOT NULL,
          status TEXT NOT NULL, sensitivity TEXT NOT NULL, reason_enc BLOB,
          expires_at REAL, confirmed_at REAL, disabled_at REAL,
          created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE memory_sources (
          memory_id TEXT NOT NULL, session_id TEXT, message_id TEXT, quote_enc BLOB
        );
        CREATE TABLE star_profiles (
          id TEXT PRIMARY KEY, onboarding_stage INTEGER NOT NULL,
          onboarding_completed INTEGER NOT NULL, display_name_enc BLOB NOT NULL,
          birth_date_enc BLOB NOT NULL, birth_time_enc BLOB NOT NULL,
          birth_time_known INTEGER NOT NULL, birth_city_enc BLOB NOT NULL,
          birth_city_known INTEGER NOT NULL, mbti_mode TEXT NOT NULL,
          mbti_type_enc BLOB NOT NULL, mbti_answers_enc BLOB NOT NULL,
          self_words_enc BLOB NOT NULL, observation_intent_enc BLOB NOT NULL,
          observer_tone TEXT NOT NULL, reduced_motion INTEGER NOT NULL,
          created_at REAL NOT NULL, updated_at REAL NOT NULL
        );
        CREATE TABLE star_traits (
          id TEXT PRIMARY KEY, kind TEXT NOT NULL, status TEXT NOT NULL,
          label_enc BLOB NOT NULL, description_enc BLOB NOT NULL,
          confidence REAL NOT NULL, source_mode TEXT NOT NULL,
          created_at REAL NOT NULL, updated_at REAL NOT NULL
        )
      `)
      database.prepare(`
        INSERT INTO photo_stories (
          id, media_type, width, height, image_enc, particle_config_enc,
          local_date, timezone, utc_offset_minutes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        legacyId,
        'image/png',
        1,
        1,
        encryptLegacyValue(PNG, dataKey, `photo_story:${legacyId}:image`),
        encryptLegacyValue(
          Buffer.from(JSON.stringify(PARTICLES), 'utf8'),
          dataKey,
          `photo_story:${legacyId}:particle_config`,
        ),
        '2026-08-20',
        'Asia/Shanghai',
        480,
        1_000,
        1_001,
      )

      const checkinId = 'legacy-checkin'
      database.prepare('INSERT INTO daily_checkins VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        checkinId,
        '2026-08-20',
        'Asia/Shanghai',
        480,
        encryptLegacyText('1', dataKey, `checkin:${checkinId}:mood`),
        encryptLegacyText('4', dataKey, `checkin:${checkinId}:energy`),
        encryptLegacyJson(['平静', '期待'], dataKey, `checkin:${checkinId}:emotion_words`),
        'standalone',
        1_000,
      )

      const journalId = 'legacy-journal'
      database.prepare('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        journalId,
        '2026-08-20',
        'Asia/Shanghai',
        480,
        encryptLegacyText('夜晚的回望', dataKey, `journal:${journalId}:title`),
        encryptLegacyText('我开始给自己的精力留出边界。', dataKey, `journal:${journalId}:body`),
        1,
        1_000,
        1_001,
      )

      const concernId = 'legacy-concern'
      database.prepare('INSERT INTO concerns VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        concernId,
        encryptLegacyText('怎样关心别人，也不把自己耗尽？', dataKey, `concern:${concernId}:content`),
        'active',
        '2026-08-20',
        '2026-08-21',
        'Asia/Shanghai',
        null,
        1_000,
        1_001,
      )

      const contemplationId = 'legacy-contemplation'
      database.prepare('INSERT INTO contemplation_notes VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        contemplationId,
        'legacy-session',
        encryptLegacyText('# 温柔也需要边界', dataKey, `contemplation_note:${contemplationId}:markdown`),
        'confirmed',
        1_001,
        1_000,
        1_001,
      )

      const noteId = 'legacy-note'
      database.prepare('INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        noteId,
        'legacy-session',
        '2026-08-20',
        encryptLegacyText('# 先停一下\n\n我愿意在答应之前留一点时间。', dataKey, `note:${noteId}:markdown`),
        'active',
        1_000,
        1_002,
      )
      const principleId = 'legacy-principle'
      database.prepare('INSERT INTO principles VALUES (?, ?, ?, ?, ?)').run(
        principleId,
        'questioning',
        2,
        1_000,
        1_002,
      )
      for (const [version, expression, status, createdAt] of [
        [1, '我愿意在答应之前留一点时间。', 'trying', 1_001],
        [2, '先回应事实，再决定是否需要证明自己。', 'questioning', 1_002],
      ] as const) {
        database.prepare('INSERT INTO principle_versions VALUES (?, ?, ?, ?, ?)').run(
          principleId,
          version,
          encryptLegacyJson({
            expression,
            formation_context: '一次关于边界的沉淀',
            user_quote: '这次我没有立刻答应。',
            supporting_experiences: [{ summary: '我给自己留出了停顿。', source_note_id: noteId }],
            counterexample: '',
            applies_to: ['仍可观察现实反馈的处境'],
            not_applies_to: [],
            last_challenged: '',
            status,
          }, dataKey, `principle_version:${principleId}:${String(version)}`),
          noteId,
          createdAt,
        )
      }

      const experimentId = 'legacy-experiment'
      const observationId = 'legacy-observation'
      database.prepare('INSERT INTO reality_experiments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        experimentId,
        encryptLegacyText('先确认精力', dataKey, `experiment:${experimentId}:title`),
        encryptLegacyText('先停一下会让我更诚实地回应。', dataKey, `experiment:${experimentId}:hypothesis`),
        encryptLegacyText('答应前先停十分钟。', dataKey, `experiment:${experimentId}:action`),
        null,
        'observed',
        encryptLegacyText('我更清楚自己能承担多少。', dataKey, `experiment:${experimentId}:result`),
        null,
        'legacy-session',
        null,
        null,
        1_000,
        1_002,
      )
      database.prepare('INSERT INTO experiment_observations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        observationId,
        experimentId,
        encryptLegacyText('收到新的请求', dataKey, `experiment_observation:${observationId}:happened`),
        encryptLegacyText('先停十分钟', dataKey, `experiment_observation:${observationId}:action`),
        encryptLegacyText('我更清楚自己能承担多少。', dataKey, `experiment_observation:${observationId}:observation`),
        4,
        3,
        1_001,
        1_001,
      )

      const loopId = 'legacy-open-loop'
      database.prepare('INSERT INTO open_loops VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        loopId,
        encryptLegacyText('什么样的边界既诚实又温柔？', dataKey, `open_loop:${loopId}:question`),
        'open',
        'legacy-session',
        null,
        journalId,
        encryptLegacyText('我开始给自己的精力留出边界。', dataKey, `open_loop:${loopId}:evidence`),
        1_000,
        1_001,
      )

      const reviewId = 'legacy-review'
      database.prepare('INSERT INTO period_reviews VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        reviewId,
        'week',
        '2026-08-18',
        '2026-08-24',
        'saved',
        encryptLegacyText('这一周，我开始把边界理解为诚实。', dataKey, `period_review:${reviewId}:content`),
        JSON.stringify([{ type: 'journal', id: journalId, date: '2026-08-20' }]),
        1_000,
        1_001,
      )

      const memoryId = 'legacy-memory'
      database.prepare('INSERT INTO memories VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        memoryId,
        'support_preference',
        encryptLegacyText('在给建议前，先问我此刻还有多少精力。', dataKey, `memory:${memoryId}:content`),
        'confirmed',
        'normal',
        encryptLegacyText('这是我明确表达的支持偏好。', dataKey, `memory:${memoryId}:reason`),
        null,
        1_001,
        null,
        1_000,
        1_001,
      )
      database.prepare('INSERT INTO memory_sources VALUES (?, ?, ?, ?)').run(
        memoryId,
        'legacy-session',
        'legacy-message',
        encryptLegacyText('先问我此刻还有多少精力。', dataKey, `memory_source:${memoryId}:legacy-message`),
      )

      const profilePrefix = 'star_profile:profile'
      database.prepare('INSERT INTO star_profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        'profile',
        3,
        1,
        encryptLegacyText('循光者', dataKey, `${profilePrefix}:display_name`),
        encryptLegacyJson({ year: 1990, month: 5, day: 20 }, dataKey, `${profilePrefix}:birth_date`),
        encryptLegacyText('', dataKey, `${profilePrefix}:birth_time`),
        0,
        encryptLegacyText('', dataKey, `${profilePrefix}:birth_city`),
        0,
        'observe',
        encryptLegacyText('', dataKey, `${profilePrefix}:mbti_type`),
        encryptLegacyJson([], dataKey, `${profilePrefix}:mbti_answers`),
        encryptLegacyJson(['好奇', '愿意修正'], dataKey, `${profilePrefix}:self_words`),
        encryptLegacyText('我在什么时候最像真正的自己？', dataKey, `${profilePrefix}:observation_intent`),
        'gentle',
        1,
        1_000,
        1_001,
      )
      const traitId = 'legacy-observer-trait'
      database.prepare('INSERT INTO star_traits VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        traitId,
        'tension',
        'confirmed',
        encryptLegacyText('靠近与保留之间', dataKey, `star_trait:${traitId}:label`),
        encryptLegacyText('我正在练习不以耗尽自己来证明关心。', dataKey, `star_trait:${traitId}:description`),
        0.7,
        'card_calibration',
        1_000,
        1_001,
      )
    } finally {
      database.close()
    }
    const databaseBytes = await readFile(path)
    const payload = Buffer.from(JSON.stringify({
      v: 1,
      workspace_id: 'original-workspace',
      created_at: 1_700_000_000,
      data_key: dataKey.toString('base64'),
      files: {
        'mind_garden.db': databaseBytes.toString('base64'),
        'settings.json': Buffer.from(JSON.stringify({ v: 1, timezone: 'Asia/Shanghai' })).toString('base64'),
        'philosophy-notebook.md': Buffer.from('# 原版哲思手记\n\n温柔需要能够持续。').toString('base64'),
        'personal-philosophy.md': Buffer.from('# 我的生活哲学\n\n真实比讨好更可靠。').toString('base64'),
      },
    }), 'utf8')
    const salt = randomBytes(16)
    const nonce = randomBytes(12)
    const key = pbkdf2Sync(LEGACY_PASSPHRASE, salt, 200_000, 32, 'sha256')
    try {
      const cipher = createCipheriv('aes-256-gcm', key, nonce)
      cipher.setAAD(Buffer.from('MGPKG1', 'ascii'))
      return Buffer.concat([
        Buffer.from('MGPKG1', 'ascii'),
        salt,
        nonce,
        cipher.update(payload),
        cipher.final(),
        cipher.getAuthTag(),
      ])
    } finally {
      databaseBytes.fill(0)
      payload.fill(0)
      salt.fill(0)
      nonce.fill(0)
      key.fill(0)
    }
  } finally {
    dataKey.fill(0)
    await rm(root, { recursive: true, force: true })
  }
}

function harness(
  privacy: 'durable' | 'ephemeral' = 'durable',
  maxPackageBytes?: number,
) {
  const ctx = new Context()
  const agent = { id: 'agent-1', session: {} } as Agent
  const snapshot = vi.fn(async () => ({
    vaultCreatedAt: 500,
    collections: {
      memories: [{ id: memoryRecord().id, value: memoryRecord() }],
      reflections: [],
      media: [{ id: '00000000-0000-4000-8000-000000000001', value: mediaRecord() }],
      stars: [],
    },
  }))
  const readImage = vi.fn(async () => ({ ref: REF, data: PNG }))
  const validateImage = vi.fn(async () => {})
  const saveImage = vi.fn(async (_input: SaveImageAttachment): Promise<ImageAttachmentRef> => REF)
  const previewMissing = vi.fn(async (_candidates: MindGardenVaultMergeCandidates) => ({
    added: { memories: 1, reflections: 0, media: 1, stars: 0 },
    kept: { memories: 0, reflections: 0, media: 0, stars: 0 },
  }))
  const mergeMissing = vi.fn(async (_collections: MindGardenVaultSnapshot['collections']) => ({
    added: { memories: 1, reflections: 0, media: 1, stars: 0 },
    kept: { memories: 0, reflections: 0, media: 0, stars: 0 },
  }))
  const rotateDataKey = vi.fn(async () => ({
    fromKeyId: 'old-key',
    toKeyId: 'new-key',
    records: 2,
    startedAt: 1_000,
    completedAt: 1_100,
  }))
  ctx.provide('agents', { get: (id: unknown) => id === agent.id ? agent : undefined } as never)
  ctx.provide('attachments', { readImage, saveImage, validateImage } as never)
  ctx.provide('mindGarden', { current: () => ({ privacy }) } as never)
  ctx.provide('mindGardenVault', { mergeMissing, previewMissing, snapshot, rotateDataKey } as never)
  const service = new MindGardenPortabilityService(ctx, {
    maxPlaintextBytes: 1024 * 1024,
    ...(maxPackageBytes === undefined ? {} : { maxPackageBytes }),
  })
  return {
    agent,
    mergeMissing,
    previewMissing,
    readImage,
    rotateDataKey,
    saveImage,
    service,
    snapshot,
    validateImage,
  }
}

describe('Mind Garden portability service', () => {
  it('embeds each verified photo object and returns only encrypted Remote bytes', async () => {
    const { agent, readImage, service, snapshot } = harness()
    const result = await service.exportBackup(agent, { passphrase: PASSPHRASE })
    expect(result).toMatchObject({
      ok: true,
      value: {
        formatVersion: 1,
        mediaType: 'application/vnd.deepseek-harness.mind-garden-backup',
        records: { memories: 1, reflections: 0, media: 1, stars: 0, attachments: 1 },
      },
    })
    if (!result.ok) throw new Error('expected backup')
    expect(result.value.filename).toMatch(/^mind-garden-\d{8}T\d{6}Z\.mgarden$/)
    const wireBytes = Buffer.from(result.value.data, 'base64')
    expect(wireBytes.toString('utf8')).not.toContain('remember me')
    const restored = await decryptMindGardenBackup(wireBytes, PASSPHRASE, 1024 * 1024)
    expect(restored.collections.memories[0]?.value).toMatchObject({ content: 'remember me' })
    expect(restored.attachments).toEqual([{ ref: REF, data: Buffer.from(PNG).toString('base64') }])
    expect(snapshot).toHaveBeenCalledOnce()
    expect(readImage).toHaveBeenCalledWith(REF)
  })

  it('previews and confirms an authenticated non-overwriting restore without retaining server plaintext', async () => {
    const current = harness()
    const exported = await current.service.exportBackup(current.agent, { passphrase: PASSPHRASE })
    if (!exported.ok) throw new Error('expected backup')
    await expect(current.service.inspectBackup(current.agent, {
      data: exported.value.data,
      passphrase: PASSPHRASE,
    })).resolves.toEqual({
      ok: true,
      value: {
        formatVersion: 1,
        sourceFormat: 'deepseek-harness-v1',
        scope: 'full-profile',
        archiveCreatedAt: exported.value.createdAt,
        bytes: exported.value.bytes,
        records: { memories: 1, reflections: 0, media: 1, stars: 0, attachments: 1 },
        willAdd: { memories: 1, reflections: 0, media: 1, stars: 0 },
        willKeep: { memories: 0, reflections: 0, media: 0, stars: 0 },
      },
    })
    expect(current.previewMissing).toHaveBeenCalledOnce()
    await expect(current.service.restoreBackup(current.agent, {
      data: exported.value.data,
      passphrase: PASSPHRASE,
      confirm: false,
    })).resolves.toEqual({ ok: false, error: { code: 'confirmation-required' } })
    const restored = await current.service.restoreBackup(current.agent, {
      data: exported.value.data,
      passphrase: PASSPHRASE,
      confirm: true,
    })
    expect(restored).toMatchObject({
      ok: true,
      value: {
        sourceFormat: 'deepseek-harness-v1',
        scope: 'full-profile',
        archiveCreatedAt: exported.value.createdAt,
        added: { memories: 1, reflections: 0, media: 1, stars: 0 },
        kept: { memories: 0, reflections: 0, media: 0, stars: 0 },
        attachments: 1,
      },
    })
    expect(current.validateImage).toHaveBeenCalledTimes(2)
    expect(current.saveImage).toHaveBeenCalledOnce()
    expect(current.mergeMissing).toHaveBeenCalledOnce()
  })

  it('authenticates an original archive and converts compatible private records through the same merge ceremony', async () => {
    const current = harness()
    const archive = await originalArchive()
    const transport = archive.toString('base64')
    archive.fill(0)
    const converted = await loadLegacyMindGardenBackup(
      Buffer.from(transport, 'base64'),
      LEGACY_PASSPHRASE,
      1024 * 1024,
    )
    expect(converted.payload.collections.memories).toHaveLength(1)
    expect(converted.payload.collections.reflections).toHaveLength(11)
    expect(converted.payload.collections.media).toHaveLength(1)
    expect(converted.payload.collections.stars).toHaveLength(1)
    current.previewMissing.mockResolvedValue({
      added: { memories: 1, reflections: 11, media: 1, stars: 1 },
      kept: { memories: 0, reflections: 0, media: 0, stars: 0 },
    })
    current.mergeMissing.mockResolvedValue({
      added: { memories: 1, reflections: 11, media: 1, stars: 1 },
      kept: { memories: 0, reflections: 0, media: 0, stars: 0 },
    })
    const legacyRef = { ...REF }
    Reflect.deleteProperty(legacyRef, 'name')
    let savedLegacy: Buffer | undefined
    current.saveImage.mockImplementation(async (input) => {
      savedLegacy = Buffer.from(input.data)
      return legacyRef
    })

    await expect(current.service.inspectBackup(current.agent, {
      data: transport,
      passphrase: 'wrong old garden key',
    })).resolves.toEqual({ ok: false, error: { code: 'invalid-backup' } })
    expect(current.previewMissing).not.toHaveBeenCalled()

    const inspected = await current.service.inspectBackup(current.agent, {
      data: transport,
      passphrase: LEGACY_PASSPHRASE,
    })
    expect(inspected).toMatchObject({
      ok: true,
      value: {
        formatVersion: 1,
        sourceFormat: 'fun-garden-v1',
        scope: 'legacy-private-profile',
        archiveCreatedAt: 1_700_000_000_000,
        records: { memories: 1, reflections: 11, media: 1, stars: 1, attachments: 1 },
        willAdd: { memories: 1, reflections: 11, media: 1, stars: 1 },
      },
    })
    const firstCandidates = current.previewMissing.mock.calls[0]?.[0]
    expect(firstCandidates?.media[0]).toMatch(/^[0-9a-f-]{36}$/)
    expect(current.validateImage).toHaveBeenCalledOnce()

    const restored = await current.service.restoreBackup(current.agent, {
      data: transport,
      passphrase: LEGACY_PASSPHRASE,
      confirm: true,
    })
    expect(restored).toMatchObject({
      ok: true,
      value: {
        sourceFormat: 'fun-garden-v1',
        scope: 'legacy-private-profile',
        added: { memories: 1, reflections: 11, media: 1, stars: 1 },
        attachments: 1,
      },
    })
    const mergedRecord = current.mergeMissing.mock.calls[0]?.[0].media[0]
    expect(mergedRecord?.id).toBe(firstCandidates?.media[0])
    expect(mergedRecord?.value).toMatchObject({
      recordType: 'photo-story',
      title: 'Photo · 2026-08-20',
      particleConfig: PARTICLES,
    })
    const merged = current.mergeMissing.mock.calls[0]?.[0]
    expect(merged?.memories[0]?.value).toMatchObject({
      recordType: 'memory',
      kind: 'support-preference',
      content: '在给建议前，先问我此刻还有多少精力。',
      proposalOrigin: 'legacy-import',
    })
    const decodedReflections = merged?.reflections.map(record => decodeStoredReflection(record.value)) ?? []
    expect(decodedReflections.map(record => record.recordType))
      .toEqual(expect.arrayContaining([
        'checkin', 'journal', 'concern', 'contemplation', 'principle', 'experiment', 'open-question', 'period-review',
      ]))
    const principle = decodedReflections.find(record => record.recordType === 'principle')
    expect(principle).toMatchObject({
      status: 'questioning',
      current: { expression: '先回应事实，再决定是否需要证明自己。' },
      versions: [
        { number: 1 },
        { number: 2 },
      ],
    })
    if (principle?.recordType !== 'principle') throw new Error('expected imported principle')
    expect(principle.versions.every(version => typeof version.sourceContemplationId === 'string')).toBe(true)
    const periodReview = decodedReflections.find(record => record.recordType === 'period-review')
    expect(periodReview).toMatchObject({
      status: 'saved',
      sources: [{ sourceType: 'legacy-original', legacyType: 'journal' }],
    })
    const starState = decodeStoredStarState(merged?.stars[0]?.value)
    expect(starState).toMatchObject({
      recordType: 'star-state',
      profile: {
        displayName: '循光者',
        permissions: {
          dailyReflections: false,
          confirmedMemories: false,
          openQuestions: false,
          periodReviews: false,
        },
      },
      cards: [],
    })
    expect(starState.traits.some(trait =>
      trait.label === '好奇' && trait.source === 'ritual-self-report',
    )).toBe(true)
    expect(starState.traits.some(trait =>
      trait.label === '靠近与保留之间' && trait.source === 'star-observer',
    )).toBe(true)
    expect(savedLegacy).toEqual(Buffer.from(PNG))
    expect(current.saveImage).toHaveBeenCalledWith(expect.objectContaining({ mediaType: 'image/png' }))
  })

  it('rejects wrong secrets, malformed transport, and invalid private records before a merge', async () => {
    const current = harness()
    const exported = await current.service.exportBackup(current.agent, { passphrase: PASSPHRASE })
    if (!exported.ok) throw new Error('expected backup')
    await expect(current.service.inspectBackup(current.agent, {
      data: exported.value.data,
      passphrase: 'different secret phrase',
    })).resolves.toEqual({ ok: false, error: { code: 'invalid-backup' } })
    await expect(current.service.inspectBackup(current.agent, {
      data: 'not canonical base64',
      passphrase: PASSPHRASE,
    })).resolves.toEqual({ ok: false, error: { code: 'invalid-backup' } })
    const validPayload = await decryptMindGardenBackup(
      Buffer.from(exported.value.data, 'base64'),
      PASSPHRASE,
      1024 * 1024,
    )
    const forgedPayload = {
      ...validPayload,
      collections: {
        ...validPayload.collections,
        memories: [{
          id: 'memory-1',
          value: { ...memoryRecord(), status: 'invented-status' },
        }],
      },
    }
    const forged = await encryptMindGardenBackup(forgedPayload, PASSPHRASE, 1024 * 1024)
    await expect(current.service.inspectBackup(current.agent, {
      data: Buffer.from(forged).toString('base64'),
      passphrase: PASSPHRASE,
    })).resolves.toEqual({ ok: false, error: { code: 'invalid-backup' } })
    const mismatchedPayload = {
      ...validPayload,
      collections: {
        ...validPayload.collections,
        memories: [{
          id: '30000000-0000-4000-8000-000000000003',
          value: memoryRecord(),
        }],
      },
    }
    const mismatched = await encryptMindGardenBackup(mismatchedPayload, PASSPHRASE, 1024 * 1024)
    await expect(current.service.inspectBackup(current.agent, {
      data: Buffer.from(mismatched).toString('base64'),
      passphrase: PASSPHRASE,
    })).resolves.toEqual({ ok: false, error: { code: 'invalid-backup' } })
    expect(current.previewMissing).not.toHaveBeenCalled()
    expect(current.mergeMissing).not.toHaveBeenCalled()
  })

  it('rejects oversized encrypted transport before decrypting or previewing it', async () => {
    const source = harness()
    const exported = await source.service.exportBackup(source.agent, { passphrase: PASSPHRASE })
    if (!exported.ok) throw new Error('expected backup')
    const bounded = harness('durable', 1)
    await expect(bounded.service.inspectBackup(bounded.agent, {
      data: exported.value.data,
      passphrase: PASSPHRASE,
    })).resolves.toEqual({ ok: false, error: { code: 'backup-too-large' } })
    expect(bounded.previewMissing).not.toHaveBeenCalled()
    expect(bounded.validateImage).not.toHaveBeenCalled()
  })

  it('rejects a stale Agent, inactive or ephemeral garden, and weak passphrase without partial success', async () => {
    const durable = harness()
    await expect(durable.service.exportBackup({ id: 'stale' } as Agent, { passphrase: PASSPHRASE }))
      .resolves.toEqual({ ok: false, error: { code: 'agent-not-live' } })

    const ephemeral = harness('ephemeral')
    await expect(ephemeral.service.exportBackup(ephemeral.agent, { passphrase: PASSPHRASE }))
      .resolves.toEqual({ ok: false, error: { code: 'durable-session-required' } })

    await expect(durable.service.exportBackup(durable.agent, { passphrase: 'short' }))
      .resolves.toEqual({ ok: false, error: { code: 'invalid-passphrase' } })

    durable.readImage.mockRejectedValueOnce(new AttachmentError('missing', 'ATTACHMENT_NOT_FOUND'))
    await expect(durable.service.exportBackup(durable.agent, { passphrase: PASSPHRASE }))
      .resolves.toEqual({ ok: false, error: { code: 'attachment-unavailable' } })
  })

  it('rotates the vault only for an explicitly confirmed live durable garden', async () => {
    const durable = harness()
    await expect(durable.service.rotateDataKey(durable.agent, { confirm: true })).resolves.toEqual({
      ok: true,
      value: {
        fromKeyId: 'old-key',
        toKeyId: 'new-key',
        records: 2,
        startedAt: 1_000,
        completedAt: 1_100,
      },
    })
    expect(durable.rotateDataKey).toHaveBeenCalledOnce()
    await expect(durable.service.rotateDataKey(durable.agent, { confirm: false }))
      .resolves.toEqual({ ok: false, error: { code: 'confirmation-required' } })
    await expect(durable.service.rotateDataKey({ id: 'stale' } as Agent, { confirm: true }))
      .resolves.toEqual({ ok: false, error: { code: 'agent-not-live' } })
    const ephemeral = harness('ephemeral')
    await expect(ephemeral.service.rotateDataKey(ephemeral.agent, { confirm: true }))
      .resolves.toEqual({ ok: false, error: { code: 'durable-session-required' } })
  })
})
