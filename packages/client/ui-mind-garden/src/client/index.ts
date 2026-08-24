/** Mind Garden browser plugin: dock registration, locale, projection, and Remote actions. */

import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { MindGardenMode, MindGardenSupportIntent } from '@deepseek-ai/dsh-mind-garden/core/client'
import type {
  MindGardenPhotoStory,
  MindGardenPhotoStoryImageValue,
} from '@deepseek-ai/dsh-mind-garden/media/types'
import type {
  MindGardenMemoryAutomationPolicy,
  MindGardenMemoryExtractValue,
  MindGardenMemoryExtractionRun,
  MindGardenMemoryItem,
  MindGardenMemoryLatestAuditValue,
  MindGardenMemoryResolveRelationshipValue,
  MindGardenMemoryRevision,
} from '@deepseek-ai/dsh-mind-garden/memory/types'
import type {
  MindGardenCalendarDayValue,
  MindGardenCalendarMonthValue,
  MindGardenCheckin,
  MindGardenConcern,
  MindGardenConcernConversionValue,
  MindGardenExperiment,
  MindGardenJournal,
  MindGardenOpenQuestion,
  MindGardenPeriodReview,
  MindGardenPeriodReviewMaterialValue,
  MindGardenPrinciple,
  MindGardenPrincipleProposal,
  MindGardenReflectionTrendValue,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import type {
  MindGardenStarCard,
  MindGardenStarMapOverview,
  MindGardenStarTrait,
} from '@deepseek-ai/dsh-mind-garden/star-map/types'
import type {
  MindGardenBackupExportValue,
  MindGardenBackupInspectValue,
  MindGardenBackupRestoreValue,
  MindGardenKeyRotationValue,
} from '@deepseek-ai/dsh-mind-garden/portability/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { MindGardenDataResult, MindGardenDockActions, MindGardenViewActions } from './slots.ts'
import { MindGardenDock } from './MindGardenDock.tsx'
import { MindGardenView } from './MindGardenView.tsx'
import { createMindGardenViewStore } from './garden-store.ts'
import { en, zh, type MindGardenKey } from './locales.ts'

export { MindGardenDock, MindGardenPanel } from './MindGardenDock.tsx'
export type { MindGardenActionResult, MindGardenDockActions } from './slots.ts'
export type { MindGardenKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Mind Garden entry and preference copy. */
    mindGarden: MindGardenKey
  }
}

const NS = 'mindGarden'

/** Required browser services. */
export const inject = [
  'slots',
  'remote',
  'remote.mindGarden',
  'remote.mindGardenMedia',
  'remote.mindGardenMemory',
  'remote.mindGardenReflection',
  'remote.mindGardenStarMap',
  'remote.mindGardenPortability',
  'locale',
]

type ReflectionResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: { readonly code: string } }

async function settle<T>(
  request: Promise<RemoteResult<ReflectionResult<T>>>,
): Promise<MindGardenDataResult<T>> {
  try {
    const transport = await request
    if (!transport.ok) return { ok: false, code: transport.error.code }
    return transport.value.ok
      ? { ok: true, value: transport.value.value }
      : { ok: false, code: transport.value.error.code }
  } catch {
    return { ok: false, code: 'unavailable' }
  }
}

function dockActions(ctx: ClientContext, sessionId: SessionId): MindGardenDockActions {
  return {
    onActivate: async (mode: MindGardenMode) => await ctx.remote.mindGarden.activate(sessionId, {
      mode,
      supportIntent: 'auto',
      privacy: 'durable',
      modelDisclosureAccepted: true,
      disclosureLocale: ctx.locale.getLocale().active === 'en' ? 'en' : 'zh-CN',
    }),
    onSelectMode: async (expectedRevision: number, mode: MindGardenMode) =>
      await ctx.remote.mindGarden.selectMode(sessionId, expectedRevision, mode),
    onSelectSupportIntent: async (
      expectedRevision: number,
      supportIntent: MindGardenSupportIntent,
    ) => await ctx.remote.mindGarden.selectSupportIntent(sessionId, expectedRevision, supportIntent),
  }
}

function bytesToBase64(data: Uint8Array): string {
  let binary = ''
  const stride = 0x8000
  for (let offset = 0; offset < data.length; offset += stride) {
    binary += String.fromCharCode(...data.subarray(offset, offset + stride))
  }
  return btoa(binary)
}

const PHOTO_MEDIA_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

function viewActions(ctx: ClientContext, sessionId: SessionId): MindGardenViewActions {
  return {
    ...dockActions(ctx, sessionId),
    onExportBackup: async passphrase => await settle<MindGardenBackupExportValue>(
      ctx.remote.mindGardenPortability.exportBackup(sessionId, { passphrase }),
    ),
    onInspectBackup: async (file, passphrase) => {
      let data: string
      try {
        data = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
      } catch {
        return { ok: false, code: 'file-unavailable' }
      }
      try {
        return await settle<MindGardenBackupInspectValue>(
          ctx.remote.mindGardenPortability.inspectBackup(sessionId, { data, passphrase }),
        )
      } catch {
        return { ok: false, code: 'unavailable' }
      }
    },
    onRestoreBackup: async (file, passphrase) => {
      let data: string
      try {
        data = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
      } catch {
        return { ok: false, code: 'file-unavailable' }
      }
      try {
        return await settle<MindGardenBackupRestoreValue>(
          ctx.remote.mindGardenPortability.restoreBackup(sessionId, { data, passphrase, confirm: true }),
        )
      } catch {
        return { ok: false, code: 'unavailable' }
      }
    },
    onRotateVaultKey: async () => await settle<MindGardenKeyRotationValue>(
      ctx.remote.mindGardenPortability.rotateDataKey(sessionId, { confirm: true }),
    ),
    onStarMapOverview: async () => await settle<MindGardenStarMapOverview>(
      ctx.remote.mindGardenStarMap.overview(sessionId),
    ),
    onSaveStarRitual: async request => await settle<MindGardenStarMapOverview>(
      ctx.remote.mindGardenStarMap.saveRitualProgress(sessionId, request),
    ),
    onCompleteStarRitual: async request => await settle<MindGardenStarMapOverview>(
      ctx.remote.mindGardenStarMap.completeRitual(sessionId, request),
    ),
    onUpdateStarProfile: async request => await settle<MindGardenStarMapOverview>(
      ctx.remote.mindGardenStarMap.updateProfile(sessionId, request),
    ),
    onUpdateStarTrait: async request => await settle<MindGardenStarTrait>(
      ctx.remote.mindGardenStarMap.updateTrait(sessionId, request),
    ),
    onDrawStarCard: async request => await settle<MindGardenStarCard>(
      ctx.remote.mindGardenStarMap.drawCard(sessionId, request),
    ),
    onCalibrateStarCard: async request => await settle<MindGardenStarCard>(
      ctx.remote.mindGardenStarMap.calibrateCard(sessionId, request),
    ),
    onFinalizeStarCard: async request => await settle<MindGardenStarCard>(
      ctx.remote.mindGardenStarMap.finalizeCard(sessionId, request),
    ),
    onContinueStarCard: async request => await settle<MindGardenStarCard>(
      ctx.remote.mindGardenStarMap.continueCard(sessionId, request),
    ),
    onApplyStarCardRevision: async request => await settle<MindGardenStarCard>(
      ctx.remote.mindGardenStarMap.applyCardRevision(sessionId, request),
    ),
    onListMemories: async () => {
      const result = await settle<{ items: readonly MindGardenMemoryItem[] }>(
        ctx.remote.mindGardenMemory.list(sessionId),
      )
      return result.ok ? { ok: true, value: result.value.items } : result
    },
    onProposeMemory: async request => await settle<MindGardenMemoryItem>(
      ctx.remote.mindGardenMemory.propose(sessionId, request),
    ),
    onConfirmMemory: async (item, request) => await settle<MindGardenMemoryItem>(
      ctx.remote.mindGardenMemory.confirm(sessionId, {
        id: item.id,
        ifVersion: item.version,
        ...request,
      }),
    ),
    onUpdateMemory: async (item, request) => await settle<MindGardenMemoryItem>(
      ctx.remote.mindGardenMemory.update(sessionId, {
        id: item.id,
        ifVersion: item.version,
        ...request,
      }),
    ),
    onRejectMemory: async item => await settle<MindGardenMemoryItem>(
      ctx.remote.mindGardenMemory.reject(sessionId, { id: item.id, ifVersion: item.version }),
    ),
    onResolveMemoryRelationship: async (item, request) =>
      await settle<MindGardenMemoryResolveRelationshipValue>(
        ctx.remote.mindGardenMemory.resolveRelationship(sessionId, {
          id: item.id,
          ifVersion: item.version,
          ...request,
        }),
      ),
    onListMemoryRevisions: async (item) => {
      const result = await settle<{ revisions: readonly MindGardenMemoryRevision[] }>(
        ctx.remote.mindGardenMemory.listRevisions(sessionId, { id: item.id }),
      )
      return result.ok ? { ok: true, value: result.value.revisions } : result
    },
    onExtractMemories: async () => await settle<MindGardenMemoryExtractValue>(
      ctx.remote.mindGardenMemory.extract(sessionId, {}),
    ),
    onLatestMemoryExtraction: async () => {
      const result = await settle<{ run: MindGardenMemoryExtractionRun | null }>(
        ctx.remote.mindGardenMemory.latestExtraction(sessionId),
      )
      return result.ok ? { ok: true, value: result.value.run } : result
    },
    onMemoryAutomationPolicy: async () => await settle<MindGardenMemoryAutomationPolicy>(
      ctx.remote.mindGardenMemory.automationPolicy(sessionId),
    ),
    onSetMemoryAutomationPolicy: async (policy, enabled, minimumCompletedTurns) =>
      await settle<MindGardenMemoryAutomationPolicy>(
        ctx.remote.mindGardenMemory.setAutomationPolicy(sessionId, {
          enabled,
          minimumCompletedTurns,
          ifVersion: policy.version,
        }),
      ),
    onDeleteMemory: async (item) => {
      const result = await settle(ctx.remote.mindGardenMemory.delete(sessionId, {
        id: item.id,
        ifVersion: item.version,
      }))
      return result.ok ? { ok: true, value: true } : result
    },
    onLatestMemoryAudit: async () => {
      const result = await settle<MindGardenMemoryLatestAuditValue>(
        ctx.remote.mindGardenMemory.latestAudit(sessionId),
      )
      return result.ok ? { ok: true, value: result.value.audit } : result
    },
    onListPhotoStories: async () => {
      const result = await settle(ctx.remote.mindGardenMedia.listPhotoStories(sessionId, { limit: 60 }))
      return result.ok
        ? { ok: true, value: result.value.stories }
        : result
    },
    onCreatePhotoStory: async (file, stamp) => {
      if (!PHOTO_MEDIA_TYPES.has(file.type)) return { ok: false, code: 'attachment-rejected' }
      const data = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
      return await settle<MindGardenPhotoStory>(ctx.remote.mindGardenMedia.createPhotoStory(sessionId, {
        data,
        mediaType: file.type as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
        name: file.name,
        title: file.name.replace(/\.[^.]+$/, ''),
        stamp,
      }))
    },
    onReadPhotoStory: async (story) => {
      const result = await settle<MindGardenPhotoStoryImageValue>(
        ctx.remote.mindGardenMedia.readPhotoStory(sessionId, { id: story.id }),
      )
      return result.ok
        ? { ok: true, value: `data:${result.value.attachment.mediaType};base64,${result.value.data}` }
        : result
    },
    onObservePhotoStory: async story => await settle<MindGardenPhotoStory>(
      ctx.remote.mindGardenMedia.observePhotoStory(sessionId, {
        id: story.id,
        ifVersion: story.version,
        locale: ctx.locale.getLocale().active === 'en' ? 'en' : 'zh-CN',
      }),
    ),
    onContinuePhotoStory: async (story, content, quickReplyKind = '') => await settle<MindGardenPhotoStory>(
      ctx.remote.mindGardenMedia.continuePhotoStory(sessionId, {
        id: story.id,
        ifVersion: story.version,
        content,
        quickReplyKind,
        locale: ctx.locale.getLocale().active === 'en' ? 'en' : 'zh-CN',
      }),
    ),
    onUpdatePhotoStory: async (story, title, note, particleConfig) => await settle<MindGardenPhotoStory>(
      ctx.remote.mindGardenMedia.updatePhotoStory(sessionId, {
        id: story.id,
        ifVersion: story.version,
        title,
        note,
        particleConfig,
      }),
    ),
    onDeletePhotoStory: async (story) => {
      const result = await settle(ctx.remote.mindGardenMedia.deletePhotoStory(sessionId, {
        id: story.id,
        ifVersion: story.version,
      }))
      return result.ok ? { ok: true, value: true } : result
    },
    onListConcerns: async () => {
      const result = await settle(ctx.remote.mindGardenReflection.listConcerns(sessionId, {
        includeClosed: true,
      }))
      return result.ok
        ? { ok: true, value: result.value.concerns }
        : result
    },
    onCreateConcern: async (content, stamp, reminder) => await settle<MindGardenConcern>(
      ctx.remote.mindGardenReflection.createConcern(sessionId, {
        content,
        stamp,
        ...(reminder === undefined ? {} : { reminder }),
      }),
    ),
    onUpdateConcern: async (concern, content, observedLocalDate, reminder) => await settle<MindGardenConcern>(
      ctx.remote.mindGardenReflection.updateConcern(sessionId, {
        id: concern.id,
        ifVersion: concern.version,
        content,
        observedLocalDate,
        ...(reminder === undefined ? {} : { reminder }),
      }),
    ),
    onCompleteConcern: async concern => await settle<MindGardenConcern>(
      ctx.remote.mindGardenReflection.completeConcern(sessionId, {
        id: concern.id,
        ifVersion: concern.version,
      }),
    ),
    onConvertConcern: async (concern, stamp, allowRetrieval) => await settle<MindGardenConcernConversionValue>(
      ctx.remote.mindGardenReflection.convertConcern(sessionId, {
        id: concern.id,
        ifVersion: concern.version,
        stamp,
        allowRetrieval,
      }),
    ),
    onCalendarMonth: async month => await settle<MindGardenCalendarMonthValue>(
      ctx.remote.mindGardenReflection.month(sessionId, { month }),
    ),
    onCalendarDay: async localDate => await settle<MindGardenCalendarDayValue>(
      ctx.remote.mindGardenReflection.day(sessionId, { localDate }),
    ),
    onCreateCheckin: async (mood, energy, emotionWords, stamp) => await settle<MindGardenCheckin>(
      ctx.remote.mindGardenReflection.createCheckin(sessionId, {
        stamp,
        mood,
        energy,
        emotionWords,
        phase: 'standalone',
      }),
    ),
    onCreateJournal: async (title, body, allowRetrieval, stamp) => await settle<MindGardenJournal>(
      ctx.remote.mindGardenReflection.createJournal(sessionId, {
        stamp,
        body,
        allowRetrieval,
        ...(title === '' ? {} : { title }),
      }),
    ),
    onUpdateJournal: async (journal, title, body, allowRetrieval) => await settle<MindGardenJournal>(
      ctx.remote.mindGardenReflection.updateJournal(sessionId, {
        id: journal.id,
        ifVersion: journal.version,
        body,
        allowRetrieval,
        ...(title === '' ? {} : { title }),
      }),
    ),
    onDeleteJournal: async (journal) => {
      const result = await settle(ctx.remote.mindGardenReflection.deleteJournal(sessionId, {
        id: journal.id,
        ifVersion: journal.version,
      }))
      return result.ok ? { ok: true, value: true } : result
    },
    onReflectionTrend: async (days, endDate) => await settle<MindGardenReflectionTrendValue>(
      ctx.remote.mindGardenReflection.trend(sessionId, { days, endDate }),
    ),
    onListExperiments: async () => {
      const result = await settle(ctx.remote.mindGardenReflection.listExperiments(sessionId, {
        includeStopped: true,
      }))
      return result.ok
        ? { ok: true, value: result.value.experiments }
        : result
    },
    onCreateExperiment: async (title, hypothesis, action, stamp, reviewStamp) =>
      await settle<MindGardenExperiment>(ctx.remote.mindGardenReflection.createExperiment(sessionId, {
        title,
        action,
        stamp,
        ...(hypothesis === '' ? {} : { hypothesis }),
        ...(reviewStamp === undefined ? {} : { reviewStamp }),
      })),
    onStartExperiment: async (experiment, observedLocalDate) => await settle<MindGardenExperiment>(
      ctx.remote.mindGardenReflection.startExperiment(sessionId, {
        id: experiment.id,
        ifVersion: experiment.version,
        observedLocalDate,
      }),
    ),
    onObserveExperiment: async (experiment, observation, stamp) => await settle<MindGardenExperiment>(
      ctx.remote.mindGardenReflection.observeExperiment(sessionId, {
        id: experiment.id,
        ifVersion: experiment.version,
        stamp,
        observation,
      }),
    ),
    onStopExperiment: async experiment => await settle<MindGardenExperiment>(
      ctx.remote.mindGardenReflection.stopExperiment(sessionId, {
        id: experiment.id,
        ifVersion: experiment.version,
      }),
    ),
    onListContemplations: async () => {
      const result = await settle(ctx.remote.mindGardenReflection.listContemplations(sessionId, {}))
      return result.ok
        ? { ok: true, value: result.value.contemplations }
        : result
    },
    onListPrincipleProposals: async () => {
      const result = await settle(ctx.remote.mindGardenReflection.listPrincipleProposals(sessionId, {
        includeClosed: true,
      }))
      return result.ok
        ? { ok: true, value: result.value.proposals }
        : result
    },
    onListPrinciples: async () => {
      const result = await settle(ctx.remote.mindGardenReflection.listPrinciples(sessionId, {
        includeRetired: true,
      }))
      return result.ok
        ? { ok: true, value: result.value.principles }
        : result
    },
    onAcceptPrincipleProposal: async (proposal, stamp) => await settle<MindGardenPrinciple>(
      ctx.remote.mindGardenReflection.acceptPrincipleProposal(sessionId, {
        id: proposal.id,
        ifVersion: proposal.version,
        stamp,
      }),
    ),
    onRejectPrincipleProposal: async proposal => await settle<MindGardenPrincipleProposal>(
      ctx.remote.mindGardenReflection.rejectPrincipleProposal(sessionId, {
        id: proposal.id,
        ifVersion: proposal.version,
      }),
    ),
    onRevisePrincipleStatus: async (principle, status, stamp) => await settle<MindGardenPrinciple>(
      ctx.remote.mindGardenReflection.revisePrinciple(sessionId, {
        id: principle.id,
        ifVersion: principle.version,
        stamp,
        content: { ...principle.current, status },
      }),
    ),
    onListOpenQuestions: async () => {
      const result = await settle(ctx.remote.mindGardenReflection.listOpenQuestions(sessionId, {
        includeClosed: true,
      }))
      return result.ok
        ? { ok: true, value: result.value.questions }
        : result
    },
    onCreateOpenQuestion: async (question, stamp) => await settle<MindGardenOpenQuestion>(
      ctx.remote.mindGardenReflection.createOpenQuestion(sessionId, { question, stamp }),
    ),
    onUpdateOpenQuestion: async (question, nextQuestion, status, stamp) =>
      await settle<MindGardenOpenQuestion>(ctx.remote.mindGardenReflection.updateOpenQuestion(sessionId, {
        id: question.id,
        ifVersion: question.version,
        question: nextQuestion,
        status,
        stamp,
      })),
    onPeriodReviewMaterial: async request => await settle<MindGardenPeriodReviewMaterialValue>(
      ctx.remote.mindGardenReflection.periodReviewMaterial(sessionId, request),
    ),
    onCreatePeriodReview: async (material, content) => await settle<MindGardenPeriodReview>(
      ctx.remote.mindGardenReflection.createPeriodReview(sessionId, {
        periodType: material.periodType,
        startStamp: material.startStamp,
        endStamp: material.endStamp,
        materialHash: material.materialHash,
        sourceIds: material.sources.map(source => source.id),
        content,
      }),
    ),
    onListPeriodReviews: async () => {
      const result = await settle(ctx.remote.mindGardenReflection.listPeriodReviews(sessionId, {
        includeArchived: true,
      }))
      return result.ok
        ? { ok: true, value: result.value.reviews }
        : result
    },
    onUpdatePeriodReview: async (review, content, status) => await settle<MindGardenPeriodReview>(
      ctx.remote.mindGardenReflection.updatePeriodReview(sessionId, {
        id: review.id,
        ifVersion: review.version,
        content,
        status,
      }),
    ),
  }
}

/** Register the session-scoped Mind Garden dock. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-mind-garden: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'mind-garden',
    order: 5,
    locale: NS,
    inject: (sessionId: SessionId): MindGardenDockActions => dockActions(ctx, sessionId),
  }, MindGardenDock))
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'mind-garden',
    order: 20,
    locale: NS,
    label: () => t('view.garden'),
    store: createMindGardenViewStore(),
    inject: (sessionId: SessionId): MindGardenViewActions => viewActions(ctx, sessionId),
  }, MindGardenView))
}
