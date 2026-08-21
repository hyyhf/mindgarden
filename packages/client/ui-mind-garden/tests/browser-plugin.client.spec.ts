import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import type { MindGardenPhotoStory } from '@deepseek-ai/dsh-mind-garden/media/types'
import type { MindGardenStarCard, MindGardenStarMapOverview, MindGardenStarTrait } from '@deepseek-ai/dsh-mind-garden/star-map/types'
import type {
  MindGardenMemoryAutomationPolicy,
  MindGardenMemoryExtractValue,
  MindGardenMemoryItem,
  MindGardenMemoryResolveRelationshipValue,
  MindGardenMemoryRevision,
} from '@deepseek-ai/dsh-mind-garden/memory/types'
import type {
  MindGardenCalendarDayValue,
  MindGardenCalendarMonthValue,
  MindGardenCheckin,
  MindGardenConcern,
  MindGardenConcernConversionValue,
  MindGardenContemplation,
  MindGardenExperiment,
  MindGardenJournal,
  MindGardenOpenQuestion,
  MindGardenPeriodReview,
  MindGardenPeriodReviewMaterialValue,
  MindGardenReflectionTrendValue,
  MindGardenPrinciple,
  MindGardenPrincipleProposal,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { apply, inject } from '../src/client/index.ts'
import type { MindGardenDockActions, MindGardenViewActions } from '../src/client/slots.ts'
import { apply as nodeApply } from '../src/index.ts'
import { apply as invariantApply } from '../src/invariant.ts'
import { DEFAULT_PHOTO_PARTICLE_CONFIG } from '../src/client/photo-story/presets.ts'

describe('Mind Garden browser plugin', () => {
  it('registers the dock and full view whose actions call the live Remote namespaces', async () => {
    const entries: Array<{ id?: string; order?: number; locale?: string; label?: () => string; inject?: (id: SessionId) => unknown }> = []
    const calls: Array<{ method: string; args: unknown[] }> = []
    const answer = (method: string) => (...args: unknown[]) => {
      calls.push({ method, args })
      return Promise.resolve({ ok: true as const, value: undefined })
    }
    const reflected = <T>(method: string, value: T) => (...args: unknown[]) => {
      calls.push({ method, args })
      return Promise.resolve({ ok: true as const, value: { ok: true as const, value } })
    }
    const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }
    const question = {
      id: 'question-1', version: 'qv1', question: 'What matters?', status: 'open', source: null,
      transitions: [], createdStamp: stamp, sourceSessionId: 'session-1', createdAt: 1, updatedAt: 1,
      type: 'open-question',
    } as unknown as MindGardenOpenQuestion
    const review = {
      id: 'review-1', version: 'rv1', type: 'period-review', periodType: 'week',
      startStamp: stamp, endStamp: stamp, status: 'proposed', content: 'A review', sources: [],
      sourceHash: 'hash', stale: false, staleSources: [], sourceSessionId: 'session-1', createdAt: 1, updatedAt: 1,
    } as unknown as MindGardenPeriodReview
    const concern = {
      id: 'concern-1', version: 'cv1', type: 'concern', content: 'A concern', status: 'active',
      createdStamp: stamp, reminder: null, convertedJournalId: null, sourceSessionId: 'session-1',
      createdAt: 1, updatedAt: 1,
    } as unknown as MindGardenConcern
    const conversion = { concern, journal: { id: 'journal-1' } } as unknown as MindGardenConcernConversionValue
    const monthValue = { month: '2026-08', days: [] } as MindGardenCalendarMonthValue
    const dayValue = { date: '2026-08-19', events: [] } as MindGardenCalendarDayValue
    const trendValue = {
      days: 30, startDate: '2026-07-21', endDate: '2026-08-19', canPlot: false, recordedDays: 0, points: [],
    } as MindGardenReflectionTrendValue
    const experiment = {
      type: 'experiment', id: 'experiment-1', version: 'ev1', title: 'Try a boundary', hypothesis: '',
      action: 'Say no once', reviewStamp: null, status: 'proposed', observations: [], createdStamp: stamp,
    } as unknown as MindGardenExperiment
    const contemplation = {
      type: 'contemplation', id: 'contemplation-1', version: 'tv1', markdown: 'A reflection', status: 'confirmed',
    } as unknown as MindGardenContemplation
    const principle = {
      type: 'principle', id: 'principle-1', version: 'pv1', status: 'trying',
      current: {
        expression: 'Be clear', formationContext: 'Experience', userQuote: 'My words', supportingExperiences: [],
        counterexample: 'A boundary', appliesTo: [], notAppliesTo: [], lastChallenged: '2026-08-19', status: 'trying',
      },
      versions: [],
    } as unknown as MindGardenPrinciple
    const proposal = {
      type: 'principle-proposal', id: 'proposal-1', version: 'ppv1', status: 'proposed', content: principle.current,
    } as unknown as MindGardenPrincipleProposal
    const material = {
      periodType: 'week', startStamp: stamp, endStamp: stamp,
      sources: [{ id: question.id, sourceType: 'open-question', fingerprint: 'fingerprint', localDates: ['2026-08-19'] }],
      items: [], materialHash: 'a'.repeat(64),
    } as MindGardenPeriodReviewMaterialValue
    const photo = {
      type: 'photo-story', id: 'photo-1', version: 'photo-version-1',
      attachment: {
        attachmentId: `sha256:${'a'.repeat(64)}`, mediaType: 'image/png', bytes: 3, width: 1, height: 1,
      },
      title: 'A frame', note: '', stamp, particleConfig: DEFAULT_PHOTO_PARTICLE_CONFIG, createdAt: 1, updatedAt: 1,
    } as unknown as MindGardenPhotoStory
    const checkin = {
      type: 'checkin', id: 'checkin-1', stamp, mood: 1, moodBand: 'light', energy: 4,
      energyBand: 'high', emotionWords: ['hopeful'], phase: 'standalone', sourceSessionId: 'session-1', createdAt: 1,
    } as unknown as MindGardenCheckin
    const journal = {
      type: 'journal', id: 'journal-1', version: 'jv1', stamp, title: 'Today', body: 'A page',
      allowRetrieval: false, sourceSessionId: 'session-1', createdAt: 1, updatedAt: 1,
    } as unknown as MindGardenJournal
    const memory = {
      id: 'memory-1', version: 'mv1', status: 'candidate', kind: 'support-preference', sensitivity: 'normal',
      content: 'Listen first', reason: 'Support me well', recallPolicy: 'never', sources: [],
      proposalOrigin: 'human', revisionCount: 0, createdAt: 1, updatedAt: 1,
    } as unknown as MindGardenMemoryItem
    const revision = {
      id: 'memory-revision-1', action: 'updated', status: 'confirmed', kind: 'support-preference',
      sensitivity: 'normal', content: 'Listen', reason: 'Support', recallPolicy: 'relevant', sources: [], createdAt: 1,
    } as unknown as MindGardenMemoryRevision
    const resolved = { candidate: memory, activeMemory: memory } as MindGardenMemoryResolveRelationshipValue
    const extracted = {
      run: { id: 'run-1', trigger: 'manual', status: 'completed', candidateIds: [memory.id] }, candidates: [memory],
    } as unknown as MindGardenMemoryExtractValue
    const automation = {
      enabled: false,
      minimumCompletedTurns: 3,
      version: 'automation-version-1',
      updatedAt: 1,
      lastAttemptedTurn: 0,
      lastAttemptAt: null,
      lastOutcome: null,
    } as unknown as MindGardenMemoryAutomationPolicy
    const starOverview = { profile: { displayName: 'Lin' }, traits: [] } as unknown as MindGardenStarMapOverview
    const starTrait = { id: 'trait-1', label: 'curious' } as unknown as MindGardenStarTrait
    const starCard = { id: 'card-1', title: 'A pause' } as unknown as MindGardenStarCard
    const backup = {
      formatVersion: 1 as const,
      filename: 'mind-garden-20260820T120000Z.mgarden',
      mediaType: 'application/vnd.deepseek-harness.mind-garden-backup' as const,
      data: 'AQID',
      bytes: 3,
      createdAt: 1,
      records: { memories: 1, reflections: 1, media: 1, stars: 1, attachments: 1 },
    }
    const backupInspection = {
      formatVersion: 1 as const,
      sourceFormat: 'deepseek-harness-v1' as const,
      scope: 'full-profile' as const,
      archiveCreatedAt: backup.createdAt,
      bytes: backup.bytes,
      records: backup.records,
      willAdd: { memories: 1, reflections: 0, media: 1, stars: 0 },
      willKeep: { memories: 0, reflections: 1, media: 0, stars: 1 },
    }
    const backupRestore = {
      sourceFormat: 'deepseek-harness-v1' as const,
      scope: 'full-profile' as const,
      archiveCreatedAt: backup.createdAt,
      added: backupInspection.willAdd,
      kept: backupInspection.willKeep,
      attachments: 1,
    }
    const rotation = {
      fromKeyId: 'old-key', toKeyId: 'new-key', records: 4, startedAt: 1, completedAt: 2,
    }
    const registerLocale = vi.fn(() => () => {})
    const ctx = {
      locale: { register: registerLocale, bind: () => (key: string) => key },
      remote: {
        mindGarden: {
          activate: answer('activate'),
          selectMode: answer('selectMode'),
          selectSupportIntent: answer('selectSupportIntent'),
        },
        mindGardenMemory: {
          list: reflected('listMemories', { items: [memory] }),
          propose: reflected('proposeMemory', memory),
          confirm: reflected('confirmMemory', memory),
          update: reflected('updateMemory', memory),
          reject: reflected('rejectMemory', memory),
          resolveRelationship: reflected('resolveMemoryRelationship', resolved),
          listRevisions: reflected('listMemoryRevisions', { revisions: [revision] }),
          extract: reflected('extractMemories', extracted),
          latestExtraction: reflected('latestMemoryExtraction', { run: extracted.run }),
          automationPolicy: reflected('memoryAutomationPolicy', automation),
          setAutomationPolicy: reflected('setMemoryAutomationPolicy', automation),
          delete: reflected('deleteMemory', { absent: true }),
          latestAudit: reflected('latestMemoryAudit', { audit: null }),
        },
        mindGardenMedia: {
          listPhotoStories: reflected('listPhotoStories', { stories: [photo] }),
          createPhotoStory: reflected('createPhotoStoryMedia', photo),
          readPhotoStory: reflected('readPhotoStory', { attachment: photo.attachment, data: 'AQID' }),
          observePhotoStory: reflected('observePhotoStory', photo),
          continuePhotoStory: reflected('continuePhotoStory', photo),
          updatePhotoStory: reflected('updatePhotoStory', photo),
          deletePhotoStory: reflected('deletePhotoStory', { absent: true }),
        },
        mindGardenStarMap: {
          overview: reflected('starMapOverview', starOverview),
          saveRitualProgress: reflected('saveStarRitual', starOverview),
          completeRitual: reflected('completeStarRitual', starOverview),
          updateProfile: reflected('updateStarProfile', starOverview),
          updateTrait: reflected('updateStarTrait', starTrait),
          drawCard: reflected('drawStarCard', starCard),
          calibrateCard: reflected('calibrateStarCard', starCard),
          finalizeCard: reflected('finalizeStarCard', starCard),
          continueCard: reflected('continueStarCard', starCard),
          applyCardRevision: reflected('applyStarCardRevision', starCard),
        },
        mindGardenPortability: {
          exportBackup: reflected('exportBackup', backup),
          inspectBackup: reflected('inspectBackup', backupInspection),
          restoreBackup: reflected('restoreBackup', backupRestore),
          rotateDataKey: reflected('rotateDataKey', rotation),
        },
        mindGardenReflection: {
          listConcerns: reflected('listConcerns', { concerns: [concern] }),
          createConcern: reflected('createConcern', concern),
          updateConcern: reflected('updateConcern', concern),
          completeConcern: reflected('completeConcern', concern),
          convertConcern: reflected('convertConcern', conversion),
          month: reflected('month', monthValue),
          day: reflected('day', dayValue),
          createCheckin: reflected('createCheckin', checkin),
          createJournal: reflected('createJournal', journal),
          updateJournal: reflected('updateJournal', journal),
          deleteJournal: reflected('deleteJournal', { absent: true }),
          trend: reflected('trend', trendValue),
          listExperiments: reflected('listExperiments', { experiments: [experiment] }),
          createExperiment: reflected('createExperiment', experiment),
          startExperiment: reflected('startExperiment', experiment),
          observeExperiment: reflected('observeExperiment', experiment),
          stopExperiment: reflected('stopExperiment', experiment),
          listContemplations: reflected('listContemplations', { contemplations: [contemplation] }),
          listPrincipleProposals: reflected('listPrincipleProposals', { proposals: [proposal] }),
          listPrinciples: reflected('listPrinciples', { principles: [principle] }),
          acceptPrincipleProposal: reflected('acceptPrincipleProposal', principle),
          rejectPrincipleProposal: reflected('rejectPrincipleProposal', proposal),
          revisePrinciple: reflected('revisePrinciple', principle),
          listOpenQuestions: reflected('listOpenQuestions', { questions: [question] }),
          createOpenQuestion: reflected('createOpenQuestion', question),
          updateOpenQuestion: reflected('updateOpenQuestion', question),
          periodReviewMaterial: reflected('periodReviewMaterial', material),
          createPeriodReview: reflected('createPeriodReview', review),
          listPeriodReviews: reflected('listPeriodReviews', { reviews: [review] }),
          updatePeriodReview: reflected('updatePeriodReview', review),
        },
      },
      effect: (factory: () => unknown) => { factory() },
      slots: {
        inject: (_name: string, factory: () => unknown) => { factory() },
        register: (options: typeof entries[number]) => { entries.push(options); return () => {} },
      },
    } as unknown as ClientContext
    apply(ctx)
    expect(inject).toContain('remote.mindGarden')
    expect(inject).toContain('remote.mindGardenMedia')
    expect(inject).toContain('remote.mindGardenMemory')
    expect(inject).toContain('remote.mindGardenReflection')
    expect(inject).toContain('remote.mindGardenStarMap')
    expect(inject).toContain('remote.mindGardenPortability')
    expect(registerLocale).toHaveBeenCalledTimes(1)
    expect(entries).toHaveLength(2)
    const dock = entries.find(entry => entry.order === 5)
    const view = entries.find(entry => entry.order === 20)
    expect(dock).toMatchObject({ id: 'mind-garden', locale: 'mindGarden' })
    expect(view).toMatchObject({ id: 'mind-garden', locale: 'mindGarden' })
    expect(view?.label?.()).toBe('view.garden')
    const actions = dock?.inject?.('session-1' as SessionId) as MindGardenDockActions | undefined
    if (actions === undefined) throw new Error('dock actions were not registered')
    await actions.onActivate('clarity')
    await actions.onSelectMode(2, 'serenity')
    await actions.onSelectSupportIntent(3, 'listen')
    const viewActions = view?.inject?.('session-1' as SessionId) as MindGardenViewActions | undefined
    if (viewActions === undefined) throw new Error('view actions were not registered')
    const starRequest = { marker: 'star-request' } as never
    await expect(viewActions.onExportBackup('paper lantern river stone'))
      .resolves.toEqual({ ok: true, value: backup })
    const backupFile = new File([Uint8Array.from([1, 2, 3])], 'profile.mgarden', {
      type: 'application/vnd.deepseek-harness.mind-garden-backup',
    })
    await expect(viewActions.onInspectBackup(backupFile, 'paper lantern river stone'))
      .resolves.toEqual({ ok: true, value: backupInspection })
    await expect(viewActions.onRestoreBackup(backupFile, 'paper lantern river stone'))
      .resolves.toEqual({ ok: true, value: backupRestore })
    await expect(viewActions.onRotateVaultKey()).resolves.toEqual({ ok: true, value: rotation })
    await expect(viewActions.onStarMapOverview()).resolves.toEqual({ ok: true, value: starOverview })
    await expect(viewActions.onSaveStarRitual(starRequest)).resolves.toEqual({ ok: true, value: starOverview })
    await expect(viewActions.onCompleteStarRitual(starRequest)).resolves.toEqual({ ok: true, value: starOverview })
    await expect(viewActions.onUpdateStarProfile(starRequest)).resolves.toEqual({ ok: true, value: starOverview })
    await expect(viewActions.onUpdateStarTrait(starRequest)).resolves.toEqual({ ok: true, value: starTrait })
    await expect(viewActions.onDrawStarCard(starRequest)).resolves.toEqual({ ok: true, value: starCard })
    await expect(viewActions.onCalibrateStarCard(starRequest)).resolves.toEqual({ ok: true, value: starCard })
    await expect(viewActions.onFinalizeStarCard(starRequest)).resolves.toEqual({ ok: true, value: starCard })
    const proposalRequest = {
      kind: 'support-preference' as const,
      content: 'Listen first',
      reason: 'Support me well',
    }
    await expect(viewActions.onListMemories()).resolves.toEqual({ ok: true, value: [memory] })
    await expect(viewActions.onProposeMemory(proposalRequest)).resolves.toEqual({ ok: true, value: memory })
    await expect(viewActions.onConfirmMemory(memory, { recallPolicy: 'relevant' }))
      .resolves.toEqual({ ok: true, value: memory })
    await expect(viewActions.onUpdateMemory(memory, { content: 'Listen carefully' }))
      .resolves.toEqual({ ok: true, value: memory })
    await expect(viewActions.onRejectMemory(memory)).resolves.toEqual({ ok: true, value: memory })
    await expect(viewActions.onResolveMemoryRelationship(memory, { resolution: 'keep-existing' }))
      .resolves.toEqual({ ok: true, value: resolved })
    await expect(viewActions.onListMemoryRevisions(memory)).resolves.toEqual({ ok: true, value: [revision] })
    await expect(viewActions.onExtractMemories()).resolves.toEqual({ ok: true, value: extracted })
    await expect(viewActions.onLatestMemoryExtraction()).resolves.toEqual({ ok: true, value: extracted.run })
    await expect(viewActions.onMemoryAutomationPolicy()).resolves.toEqual({ ok: true, value: automation })
    await expect(viewActions.onSetMemoryAutomationPolicy(automation, true, 5))
      .resolves.toEqual({ ok: true, value: automation })
    await expect(viewActions.onDeleteMemory(memory)).resolves.toEqual({ ok: true, value: true })
    await expect(viewActions.onLatestMemoryAudit()).resolves.toEqual({ ok: true, value: null })
    await expect(viewActions.onListPhotoStories()).resolves.toEqual({ ok: true, value: [photo] })
    const unsupportedRead = vi.fn()
    const unsupported = {
      type: 'text/plain', name: 'not-an-image.txt', arrayBuffer: unsupportedRead,
    } as unknown as File
    await expect(viewActions.onCreatePhotoStory(unsupported, stamp))
      .resolves.toEqual({ ok: false, code: 'attachment-rejected' })
    expect(unsupportedRead).not.toHaveBeenCalled()
    const file = {
      type: 'image/png', name: 'a-frame.png', arrayBuffer: () => Promise.resolve(Uint8Array.from([1, 2, 3]).buffer),
    } as File
    await expect(viewActions.onCreatePhotoStory(file, stamp)).resolves.toEqual({ ok: true, value: photo })
    await expect(viewActions.onReadPhotoStory(photo)).resolves.toEqual({ ok: true, value: 'data:image/png;base64,AQID' })
    await expect(viewActions.onObservePhotoStory(photo)).resolves.toEqual({ ok: true, value: photo })
    await expect(viewActions.onContinuePhotoStory(photo, 'I remember this', 'remember'))
      .resolves.toEqual({ ok: true, value: photo })
    await expect(viewActions.onUpdatePhotoStory(photo, 'A frame', 'A note', photo.particleConfig))
      .resolves.toEqual({ ok: true, value: photo })
    await expect(viewActions.onDeletePhotoStory(photo)).resolves.toEqual({ ok: true, value: true })
    await expect(viewActions.onListConcerns()).resolves.toEqual({ ok: true, value: [concern] })
    await expect(viewActions.onCreateConcern('A concern', stamp)).resolves.toEqual({ ok: true, value: concern })
    await expect(viewActions.onCreateConcern('A concern', stamp, stamp)).resolves.toEqual({ ok: true, value: concern })
    await expect(viewActions.onUpdateConcern(concern, 'A revised concern', '2026-08-19', stamp))
      .resolves.toEqual({ ok: true, value: concern })
    await expect(viewActions.onCompleteConcern(concern)).resolves.toEqual({ ok: true, value: concern })
    await expect(viewActions.onConvertConcern(concern, stamp, true)).resolves.toEqual({ ok: true, value: conversion })
    await expect(viewActions.onCalendarMonth('2026-08')).resolves.toEqual({ ok: true, value: monthValue })
    await expect(viewActions.onCalendarDay('2026-08-19')).resolves.toEqual({ ok: true, value: dayValue })
    await expect(viewActions.onCreateCheckin(1, 4, ['hopeful'], stamp)).resolves.toEqual({ ok: true, value: checkin })
    await expect(viewActions.onCreateJournal('', 'A page', false, stamp)).resolves.toEqual({ ok: true, value: journal })
    await expect(viewActions.onCreateJournal('Today', 'A page', true, stamp)).resolves.toEqual({ ok: true, value: journal })
    await expect(viewActions.onUpdateJournal(journal, '', 'Revised', false)).resolves.toEqual({ ok: true, value: journal })
    await expect(viewActions.onUpdateJournal(journal, 'Today', 'Revised', true)).resolves.toEqual({ ok: true, value: journal })
    await expect(viewActions.onDeleteJournal(journal)).resolves.toEqual({ ok: true, value: true })
    await expect(viewActions.onReflectionTrend(30, '2026-08-19')).resolves.toEqual({ ok: true, value: trendValue })
    await expect(viewActions.onListExperiments()).resolves.toEqual({ ok: true, value: [experiment] })
    await expect(viewActions.onCreateExperiment('Try', '', 'Act', stamp)).resolves.toEqual({ ok: true, value: experiment })
    await expect(viewActions.onCreateExperiment('Try', 'Maybe', 'Act', stamp, stamp))
      .resolves.toEqual({ ok: true, value: experiment })
    await expect(viewActions.onStartExperiment(experiment, '2026-08-19')).resolves.toEqual({ ok: true, value: experiment })
    await expect(viewActions.onObserveExperiment(experiment, 'Observed', stamp)).resolves.toEqual({ ok: true, value: experiment })
    await expect(viewActions.onStopExperiment(experiment)).resolves.toEqual({ ok: true, value: experiment })
    await expect(viewActions.onListContemplations()).resolves.toEqual({ ok: true, value: [contemplation] })
    await expect(viewActions.onListPrincipleProposals()).resolves.toEqual({ ok: true, value: [proposal] })
    await expect(viewActions.onListPrinciples()).resolves.toEqual({ ok: true, value: [principle] })
    await expect(viewActions.onAcceptPrincipleProposal(proposal, stamp)).resolves.toEqual({ ok: true, value: principle })
    await expect(viewActions.onRejectPrincipleProposal(proposal)).resolves.toEqual({ ok: true, value: proposal })
    await expect(viewActions.onRevisePrincipleStatus(principle, 'adopted', stamp))
      .resolves.toEqual({ ok: true, value: principle })
    await expect(viewActions.onListOpenQuestions()).resolves.toEqual({ ok: true, value: [question] })
    await expect(viewActions.onCreateOpenQuestion('What matters?', stamp)).resolves.toEqual({ ok: true, value: question })
    await expect(viewActions.onUpdateOpenQuestion(question, 'What matters now?', 'resolved', stamp)).resolves.toEqual({ ok: true, value: question })
    await expect(viewActions.onPeriodReviewMaterial({ periodType: 'week', startStamp: stamp, endStamp: stamp })).resolves.toEqual({ ok: true, value: material })
    await expect(viewActions.onCreatePeriodReview(material, 'A review')).resolves.toEqual({ ok: true, value: review })
    await expect(viewActions.onListPeriodReviews()).resolves.toEqual({ ok: true, value: [review] })
    await expect(viewActions.onUpdatePeriodReview(review, 'Saved review', 'saved')).resolves.toEqual({ ok: true, value: review })
    expect(calls).toEqual([
      {
        method: 'activate',
        args: ['session-1', {
          mode: 'clarity', supportIntent: 'auto', privacy: 'durable', modelDisclosureAccepted: true,
        }],
      },
      { method: 'selectMode', args: ['session-1', 2, 'serenity'] },
      { method: 'selectSupportIntent', args: ['session-1', 3, 'listen'] },
      { method: 'exportBackup', args: ['session-1', { passphrase: 'paper lantern river stone' }] },
      {
        method: 'inspectBackup',
        args: ['session-1', { data: 'AQID', passphrase: 'paper lantern river stone' }],
      },
      {
        method: 'restoreBackup',
        args: ['session-1', { data: 'AQID', passphrase: 'paper lantern river stone', confirm: true }],
      },
      { method: 'rotateDataKey', args: ['session-1', { confirm: true }] },
      { method: 'starMapOverview', args: ['session-1'] },
      { method: 'saveStarRitual', args: ['session-1', starRequest] },
      { method: 'completeStarRitual', args: ['session-1', starRequest] },
      { method: 'updateStarProfile', args: ['session-1', starRequest] },
      { method: 'updateStarTrait', args: ['session-1', starRequest] },
      { method: 'drawStarCard', args: ['session-1', starRequest] },
      { method: 'calibrateStarCard', args: ['session-1', starRequest] },
      { method: 'finalizeStarCard', args: ['session-1', starRequest] },
      { method: 'listMemories', args: ['session-1'] },
      { method: 'proposeMemory', args: ['session-1', proposalRequest] },
      { method: 'confirmMemory', args: ['session-1', { id: memory.id, ifVersion: memory.version, recallPolicy: 'relevant' }] },
      { method: 'updateMemory', args: ['session-1', { id: memory.id, ifVersion: memory.version, content: 'Listen carefully' }] },
      { method: 'rejectMemory', args: ['session-1', { id: memory.id, ifVersion: memory.version }] },
      { method: 'resolveMemoryRelationship', args: ['session-1', { id: memory.id, ifVersion: memory.version, resolution: 'keep-existing' }] },
      { method: 'listMemoryRevisions', args: ['session-1', { id: memory.id }] },
      { method: 'extractMemories', args: ['session-1', {}] },
      { method: 'latestMemoryExtraction', args: ['session-1'] },
      { method: 'memoryAutomationPolicy', args: ['session-1'] },
      {
        method: 'setMemoryAutomationPolicy',
        args: ['session-1', { enabled: true, minimumCompletedTurns: 5, ifVersion: automation.version }],
      },
      { method: 'deleteMemory', args: ['session-1', { id: memory.id, ifVersion: memory.version }] },
      { method: 'latestMemoryAudit', args: ['session-1'] },
      { method: 'listPhotoStories', args: ['session-1', { limit: 60 }] },
      {
        method: 'createPhotoStoryMedia',
        args: ['session-1', { data: 'AQID', mediaType: 'image/png', name: 'a-frame.png', title: 'a-frame', stamp }],
      },
      { method: 'readPhotoStory', args: ['session-1', { id: photo.id }] },
      { method: 'observePhotoStory', args: ['session-1', { id: photo.id, ifVersion: photo.version }] },
      {
        method: 'continuePhotoStory',
        args: ['session-1', {
          id: photo.id, ifVersion: photo.version, content: 'I remember this', quickReplyKind: 'remember',
        }],
      },
      {
        method: 'updatePhotoStory',
        args: ['session-1', {
          id: photo.id, ifVersion: photo.version, title: 'A frame', note: 'A note', particleConfig: photo.particleConfig,
        }],
      },
      { method: 'deletePhotoStory', args: ['session-1', { id: photo.id, ifVersion: photo.version }] },
      { method: 'listConcerns', args: ['session-1', { includeClosed: true }] },
      { method: 'createConcern', args: ['session-1', { content: 'A concern', stamp }] },
      { method: 'createConcern', args: ['session-1', { content: 'A concern', stamp, reminder: stamp }] },
      {
        method: 'updateConcern',
        args: ['session-1', {
          id: concern.id,
          ifVersion: concern.version,
          content: 'A revised concern',
          observedLocalDate: '2026-08-19',
          reminder: stamp,
        }],
      },
      { method: 'completeConcern', args: ['session-1', { id: concern.id, ifVersion: concern.version }] },
      {
        method: 'convertConcern',
        args: ['session-1', { id: concern.id, ifVersion: concern.version, stamp, allowRetrieval: true }],
      },
      { method: 'month', args: ['session-1', { month: '2026-08' }] },
      { method: 'day', args: ['session-1', { localDate: '2026-08-19' }] },
      {
        method: 'createCheckin',
        args: ['session-1', { stamp, mood: 1, energy: 4, emotionWords: ['hopeful'], phase: 'standalone' }],
      },
      { method: 'createJournal', args: ['session-1', { stamp, body: 'A page', allowRetrieval: false }] },
      { method: 'createJournal', args: ['session-1', { stamp, body: 'A page', allowRetrieval: true, title: 'Today' }] },
      {
        method: 'updateJournal',
        args: ['session-1', { id: journal.id, ifVersion: journal.version, body: 'Revised', allowRetrieval: false }],
      },
      {
        method: 'updateJournal',
        args: ['session-1', {
          id: journal.id, ifVersion: journal.version, body: 'Revised', allowRetrieval: true, title: 'Today',
        }],
      },
      { method: 'deleteJournal', args: ['session-1', { id: journal.id, ifVersion: journal.version }] },
      { method: 'trend', args: ['session-1', { days: 30, endDate: '2026-08-19' }] },
      { method: 'listExperiments', args: ['session-1', { includeStopped: true }] },
      { method: 'createExperiment', args: ['session-1', { title: 'Try', action: 'Act', stamp }] },
      {
        method: 'createExperiment',
        args: ['session-1', { title: 'Try', action: 'Act', stamp, hypothesis: 'Maybe', reviewStamp: stamp }],
      },
      {
        method: 'startExperiment',
        args: ['session-1', { id: experiment.id, ifVersion: experiment.version, observedLocalDate: '2026-08-19' }],
      },
      {
        method: 'observeExperiment',
        args: ['session-1', { id: experiment.id, ifVersion: experiment.version, stamp, observation: 'Observed' }],
      },
      { method: 'stopExperiment', args: ['session-1', { id: experiment.id, ifVersion: experiment.version }] },
      { method: 'listContemplations', args: ['session-1', {}] },
      { method: 'listPrincipleProposals', args: ['session-1', { includeClosed: true }] },
      { method: 'listPrinciples', args: ['session-1', { includeRetired: true }] },
      {
        method: 'acceptPrincipleProposal',
        args: ['session-1', { id: proposal.id, ifVersion: proposal.version, stamp }],
      },
      {
        method: 'rejectPrincipleProposal',
        args: ['session-1', { id: proposal.id, ifVersion: proposal.version }],
      },
      {
        method: 'revisePrinciple',
        args: ['session-1', {
          id: principle.id,
          ifVersion: principle.version,
          stamp,
          content: { ...principle.current, status: 'adopted' },
        }],
      },
      { method: 'listOpenQuestions', args: ['session-1', { includeClosed: true }] },
      { method: 'createOpenQuestion', args: ['session-1', { question: 'What matters?', stamp }] },
      { method: 'updateOpenQuestion', args: ['session-1', { id: question.id, ifVersion: question.version, question: 'What matters now?', status: 'resolved', stamp }] },
      { method: 'periodReviewMaterial', args: ['session-1', { periodType: 'week', startStamp: stamp, endStamp: stamp }] },
      { method: 'createPeriodReview', args: ['session-1', { periodType: 'week', startStamp: stamp, endStamp: stamp, materialHash: material.materialHash, sourceIds: [question.id], content: 'A review' }] },
      { method: 'listPeriodReviews', args: ['session-1', { includeArchived: true }] },
      { method: 'updatePeriodReview', args: ['session-1', { id: review.id, ifVersion: review.version, content: 'Saved review', status: 'saved' }] },
    ])
  })

  it('flattens transport, business, and rejected reflection failures', async () => {
    const entries: Array<{ order?: number; inject?: (id: SessionId) => unknown }> = []
    const ctx = {
      locale: { register: () => () => {}, bind: () => () => '' },
      remote: {
        mindGarden: { activate: vi.fn(), selectMode: vi.fn(), selectSupportIntent: vi.fn() },
        mindGardenMemory: {
          list: () => Promise.resolve({
            ok: true as const,
            value: { ok: false as const, error: { code: 'vault-unavailable' } },
          }),
        },
        mindGardenMedia: {
          listPhotoStories: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'vault-locked' } } }),
          readPhotoStory: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'attachment-unavailable' } } }),
          deletePhotoStory: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'photo-story-version-conflict' } } }),
        },
        mindGardenPortability: {
          exportBackup: () => Promise.resolve({
            ok: true as const,
            value: { ok: false as const, error: { code: 'vault-unavailable' } },
          }),
          inspectBackup: () => Promise.resolve({
            ok: true as const,
            value: { ok: false as const, error: { code: 'invalid-backup' } },
          }),
          restoreBackup: () => Promise.resolve({
            ok: true as const,
            value: { ok: false as const, error: { code: 'attachment-unavailable' } },
          }),
          rotateDataKey: () => Promise.resolve({
            ok: true as const,
            value: { ok: false as const, error: { code: 'rotation-unavailable' } },
          }),
        },
        mindGardenReflection: {
          listConcerns: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'vault-locked' } } }),
          listExperiments: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'vault-locked' } } }),
          listContemplations: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'vault-locked' } } }),
          listPrincipleProposals: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'vault-locked' } } }),
          listPrinciples: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'vault-locked' } } }),
          listOpenQuestions: () => Promise.resolve({ ok: false as const, error: { code: 'offline', message: '', details: {} } }),
          listPeriodReviews: () => Promise.resolve({ ok: true as const, value: { ok: false as const, error: { code: 'vault-locked' } } }),
          periodReviewMaterial: () => Promise.reject(new Error('unmounted')),
        },
      },
      effect: (factory: () => unknown) => { factory() },
      slots: {
        inject: (_name: string, factory: () => unknown) => { factory() },
        register: (options: typeof entries[number]) => { entries.push(options); return () => {} },
      },
    } as unknown as ClientContext
    apply(ctx)
    const actions = entries.find(entry => entry.order === 20)?.inject?.('session-1' as SessionId) as MindGardenViewActions
    const photo = { id: 'photo-1', version: 'photo-version-1' } as unknown as MindGardenPhotoStory
    await expect(actions.onExportBackup('paper lantern river stone')).resolves.toEqual({ ok: false, code: 'vault-unavailable' })
    const file = new File([Uint8Array.from([1, 2, 3])], 'profile.mgarden')
    await expect(actions.onInspectBackup(file, 'paper lantern river stone')).resolves.toEqual({ ok: false, code: 'invalid-backup' })
    await expect(actions.onRestoreBackup(file, 'paper lantern river stone')).resolves.toEqual({ ok: false, code: 'attachment-unavailable' })
    await expect(actions.onRotateVaultKey()).resolves.toEqual({ ok: false, code: 'rotation-unavailable' })
    await expect(actions.onListMemories()).resolves.toEqual({ ok: false, code: 'vault-unavailable' })
    await expect(actions.onListPhotoStories()).resolves.toEqual({ ok: false, code: 'vault-locked' })
    await expect(actions.onReadPhotoStory(photo)).resolves.toEqual({ ok: false, code: 'attachment-unavailable' })
    await expect(actions.onDeletePhotoStory(photo)).resolves.toEqual({ ok: false, code: 'photo-story-version-conflict' })
    await expect(actions.onListConcerns()).resolves.toEqual({ ok: false, code: 'vault-locked' })
    await expect(actions.onListExperiments()).resolves.toEqual({ ok: false, code: 'vault-locked' })
    await expect(actions.onListContemplations()).resolves.toEqual({ ok: false, code: 'vault-locked' })
    await expect(actions.onListPrincipleProposals()).resolves.toEqual({ ok: false, code: 'vault-locked' })
    await expect(actions.onListPrinciples()).resolves.toEqual({ ok: false, code: 'vault-locked' })
    await expect(actions.onListOpenQuestions()).resolves.toEqual({ ok: false, code: 'offline' })
    await expect(actions.onListPeriodReviews()).resolves.toEqual({ ok: false, code: 'vault-locked' })
    const stamp = { localDate: '2026-08-19', timeZone: 'UTC', utcOffsetMinutes: 0 }
    await expect(actions.onPeriodReviewMaterial({ periodType: 'week', startStamp: stamp, endStamp: stamp }))
      .resolves.toEqual({ ok: false, code: 'unavailable' })
  })

  it('keeps the Node half inert and registers the invariant companion', async () => {
    expect(() => { nodeApply() }).not.toThrow()
    const disposer = () => {}
    let installed: InvariantInstaller | undefined
    const register = vi.fn((_packageName: string, installer: InvariantInstaller) => {
      installed = installer
      return disposer
    })
    const ctx = { invariants: { register } } as never
    await expect(invariantApply(ctx)).resolves.toBe(disposer)
    expect(register).toHaveBeenCalledWith('@deepseek-ai/dsh-mind-garden/ui', expect.any(Function))
    const installer = installed
    if (installer === undefined) throw new Error('invariant installer was not registered')
    await installer(new Context(), () => { throw new Error('unused') })
  })
})
