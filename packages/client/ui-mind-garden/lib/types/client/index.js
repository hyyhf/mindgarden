/** Mind Garden browser plugin: dock registration, locale, projection, and Remote actions. */
import { MindGardenDock } from "./MindGardenDock.js";
import { MindGardenView } from "./MindGardenView.js";
import { createMindGardenViewStore } from "./garden-store.js";
import { en, zh } from "./locales.js";
export { MindGardenDock, MindGardenPanel } from "./MindGardenDock.js";
const NS = 'mindGarden';
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
];
async function settle(request) {
    try {
        const transport = await request;
        if (!transport.ok)
            return { ok: false, code: transport.error.code };
        return transport.value.ok
            ? { ok: true, value: transport.value.value }
            : { ok: false, code: transport.value.error.code };
    }
    catch {
        return { ok: false, code: 'unavailable' };
    }
}
function dockActions(ctx, sessionId) {
    return {
        onActivate: async (mode) => await ctx.remote.mindGarden.activate(sessionId, {
            mode,
            supportIntent: 'auto',
            privacy: 'durable',
            modelDisclosureAccepted: true,
        }),
        onSelectMode: async (expectedRevision, mode) => await ctx.remote.mindGarden.selectMode(sessionId, expectedRevision, mode),
        onSelectSupportIntent: async (expectedRevision, supportIntent) => await ctx.remote.mindGarden.selectSupportIntent(sessionId, expectedRevision, supportIntent),
    };
}
function bytesToBase64(data) {
    let binary = '';
    const stride = 0x8000;
    for (let offset = 0; offset < data.length; offset += stride) {
        binary += String.fromCharCode(...data.subarray(offset, offset + stride));
    }
    return btoa(binary);
}
const PHOTO_MEDIA_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
function viewActions(ctx, sessionId) {
    return {
        ...dockActions(ctx, sessionId),
        onExportBackup: async (passphrase) => await settle(ctx.remote.mindGardenPortability.exportBackup(sessionId, { passphrase })),
        onInspectBackup: async (file, passphrase) => {
            let data;
            try {
                data = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
            }
            catch {
                return { ok: false, code: 'file-unavailable' };
            }
            try {
                return await settle(ctx.remote.mindGardenPortability.inspectBackup(sessionId, { data, passphrase }));
            }
            catch {
                return { ok: false, code: 'unavailable' };
            }
        },
        onRestoreBackup: async (file, passphrase) => {
            let data;
            try {
                data = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
            }
            catch {
                return { ok: false, code: 'file-unavailable' };
            }
            try {
                return await settle(ctx.remote.mindGardenPortability.restoreBackup(sessionId, { data, passphrase, confirm: true }));
            }
            catch {
                return { ok: false, code: 'unavailable' };
            }
        },
        onRotateVaultKey: async () => await settle(ctx.remote.mindGardenPortability.rotateDataKey(sessionId, { confirm: true })),
        onStarMapOverview: async () => await settle(ctx.remote.mindGardenStarMap.overview(sessionId)),
        onSaveStarRitual: async (request) => await settle(ctx.remote.mindGardenStarMap.saveRitualProgress(sessionId, request)),
        onCompleteStarRitual: async (request) => await settle(ctx.remote.mindGardenStarMap.completeRitual(sessionId, request)),
        onUpdateStarProfile: async (request) => await settle(ctx.remote.mindGardenStarMap.updateProfile(sessionId, request)),
        onUpdateStarTrait: async (request) => await settle(ctx.remote.mindGardenStarMap.updateTrait(sessionId, request)),
        onDrawStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.drawCard(sessionId, request)),
        onCalibrateStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.calibrateCard(sessionId, request)),
        onFinalizeStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.finalizeCard(sessionId, request)),
        onContinueStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.continueCard(sessionId, request)),
        onApplyStarCardRevision: async (request) => await settle(ctx.remote.mindGardenStarMap.applyCardRevision(sessionId, request)),
        onListMemories: async () => {
            const result = await settle(ctx.remote.mindGardenMemory.list(sessionId));
            return result.ok ? { ok: true, value: result.value.items } : result;
        },
        onProposeMemory: async (request) => await settle(ctx.remote.mindGardenMemory.propose(sessionId, request)),
        onConfirmMemory: async (item, request) => await settle(ctx.remote.mindGardenMemory.confirm(sessionId, {
            id: item.id,
            ifVersion: item.version,
            ...request,
        })),
        onUpdateMemory: async (item, request) => await settle(ctx.remote.mindGardenMemory.update(sessionId, {
            id: item.id,
            ifVersion: item.version,
            ...request,
        })),
        onRejectMemory: async (item) => await settle(ctx.remote.mindGardenMemory.reject(sessionId, { id: item.id, ifVersion: item.version })),
        onResolveMemoryRelationship: async (item, request) => await settle(ctx.remote.mindGardenMemory.resolveRelationship(sessionId, {
            id: item.id,
            ifVersion: item.version,
            ...request,
        })),
        onListMemoryRevisions: async (item) => {
            const result = await settle(ctx.remote.mindGardenMemory.listRevisions(sessionId, { id: item.id }));
            return result.ok ? { ok: true, value: result.value.revisions } : result;
        },
        onExtractMemories: async () => await settle(ctx.remote.mindGardenMemory.extract(sessionId, {})),
        onLatestMemoryExtraction: async () => {
            const result = await settle(ctx.remote.mindGardenMemory.latestExtraction(sessionId));
            return result.ok ? { ok: true, value: result.value.run } : result;
        },
        onMemoryAutomationPolicy: async () => await settle(ctx.remote.mindGardenMemory.automationPolicy(sessionId)),
        onSetMemoryAutomationPolicy: async (policy, enabled, minimumCompletedTurns) => await settle(ctx.remote.mindGardenMemory.setAutomationPolicy(sessionId, {
            enabled,
            minimumCompletedTurns,
            ifVersion: policy.version,
        })),
        onDeleteMemory: async (item) => {
            const result = await settle(ctx.remote.mindGardenMemory.delete(sessionId, {
                id: item.id,
                ifVersion: item.version,
            }));
            return result.ok ? { ok: true, value: true } : result;
        },
        onLatestMemoryAudit: async () => {
            const result = await settle(ctx.remote.mindGardenMemory.latestAudit(sessionId));
            return result.ok ? { ok: true, value: result.value.audit } : result;
        },
        onListPhotoStories: async () => {
            const result = await settle(ctx.remote.mindGardenMedia.listPhotoStories(sessionId, { limit: 60 }));
            return result.ok
                ? { ok: true, value: result.value.stories }
                : result;
        },
        onCreatePhotoStory: async (file, stamp) => {
            if (!PHOTO_MEDIA_TYPES.has(file.type))
                return { ok: false, code: 'attachment-rejected' };
            const data = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
            return await settle(ctx.remote.mindGardenMedia.createPhotoStory(sessionId, {
                data,
                mediaType: file.type,
                name: file.name,
                title: file.name.replace(/\.[^.]+$/, ''),
                stamp,
            }));
        },
        onReadPhotoStory: async (story) => {
            const result = await settle(ctx.remote.mindGardenMedia.readPhotoStory(sessionId, { id: story.id }));
            return result.ok
                ? { ok: true, value: `data:${result.value.attachment.mediaType};base64,${result.value.data}` }
                : result;
        },
        onObservePhotoStory: async (story) => await settle(ctx.remote.mindGardenMedia.observePhotoStory(sessionId, {
            id: story.id,
            ifVersion: story.version,
        })),
        onContinuePhotoStory: async (story, content, quickReplyKind = '') => await settle(ctx.remote.mindGardenMedia.continuePhotoStory(sessionId, {
            id: story.id,
            ifVersion: story.version,
            content,
            quickReplyKind,
        })),
        onUpdatePhotoStory: async (story, title, note, particleConfig) => await settle(ctx.remote.mindGardenMedia.updatePhotoStory(sessionId, {
            id: story.id,
            ifVersion: story.version,
            title,
            note,
            particleConfig,
        })),
        onDeletePhotoStory: async (story) => {
            const result = await settle(ctx.remote.mindGardenMedia.deletePhotoStory(sessionId, {
                id: story.id,
                ifVersion: story.version,
            }));
            return result.ok ? { ok: true, value: true } : result;
        },
        onListConcerns: async () => {
            const result = await settle(ctx.remote.mindGardenReflection.listConcerns(sessionId, {
                includeClosed: true,
            }));
            return result.ok
                ? { ok: true, value: result.value.concerns }
                : result;
        },
        onCreateConcern: async (content, stamp, reminder) => await settle(ctx.remote.mindGardenReflection.createConcern(sessionId, {
            content,
            stamp,
            ...(reminder === undefined ? {} : { reminder }),
        })),
        onUpdateConcern: async (concern, content, observedLocalDate, reminder) => await settle(ctx.remote.mindGardenReflection.updateConcern(sessionId, {
            id: concern.id,
            ifVersion: concern.version,
            content,
            observedLocalDate,
            ...(reminder === undefined ? {} : { reminder }),
        })),
        onCompleteConcern: async (concern) => await settle(ctx.remote.mindGardenReflection.completeConcern(sessionId, {
            id: concern.id,
            ifVersion: concern.version,
        })),
        onConvertConcern: async (concern, stamp, allowRetrieval) => await settle(ctx.remote.mindGardenReflection.convertConcern(sessionId, {
            id: concern.id,
            ifVersion: concern.version,
            stamp,
            allowRetrieval,
        })),
        onCalendarMonth: async (month) => await settle(ctx.remote.mindGardenReflection.month(sessionId, { month })),
        onCalendarDay: async (localDate) => await settle(ctx.remote.mindGardenReflection.day(sessionId, { localDate })),
        onCreateCheckin: async (mood, energy, emotionWords, stamp) => await settle(ctx.remote.mindGardenReflection.createCheckin(sessionId, {
            stamp,
            mood,
            energy,
            emotionWords,
            phase: 'standalone',
        })),
        onCreateJournal: async (title, body, allowRetrieval, stamp) => await settle(ctx.remote.mindGardenReflection.createJournal(sessionId, {
            stamp,
            body,
            allowRetrieval,
            ...(title === '' ? {} : { title }),
        })),
        onUpdateJournal: async (journal, title, body, allowRetrieval) => await settle(ctx.remote.mindGardenReflection.updateJournal(sessionId, {
            id: journal.id,
            ifVersion: journal.version,
            body,
            allowRetrieval,
            ...(title === '' ? {} : { title }),
        })),
        onDeleteJournal: async (journal) => {
            const result = await settle(ctx.remote.mindGardenReflection.deleteJournal(sessionId, {
                id: journal.id,
                ifVersion: journal.version,
            }));
            return result.ok ? { ok: true, value: true } : result;
        },
        onReflectionTrend: async (days, endDate) => await settle(ctx.remote.mindGardenReflection.trend(sessionId, { days, endDate })),
        onListExperiments: async () => {
            const result = await settle(ctx.remote.mindGardenReflection.listExperiments(sessionId, {
                includeStopped: true,
            }));
            return result.ok
                ? { ok: true, value: result.value.experiments }
                : result;
        },
        onCreateExperiment: async (title, hypothesis, action, stamp, reviewStamp) => await settle(ctx.remote.mindGardenReflection.createExperiment(sessionId, {
            title,
            action,
            stamp,
            ...(hypothesis === '' ? {} : { hypothesis }),
            ...(reviewStamp === undefined ? {} : { reviewStamp }),
        })),
        onStartExperiment: async (experiment, observedLocalDate) => await settle(ctx.remote.mindGardenReflection.startExperiment(sessionId, {
            id: experiment.id,
            ifVersion: experiment.version,
            observedLocalDate,
        })),
        onObserveExperiment: async (experiment, observation, stamp) => await settle(ctx.remote.mindGardenReflection.observeExperiment(sessionId, {
            id: experiment.id,
            ifVersion: experiment.version,
            stamp,
            observation,
        })),
        onStopExperiment: async (experiment) => await settle(ctx.remote.mindGardenReflection.stopExperiment(sessionId, {
            id: experiment.id,
            ifVersion: experiment.version,
        })),
        onListContemplations: async () => {
            const result = await settle(ctx.remote.mindGardenReflection.listContemplations(sessionId, {}));
            return result.ok
                ? { ok: true, value: result.value.contemplations }
                : result;
        },
        onListPrincipleProposals: async () => {
            const result = await settle(ctx.remote.mindGardenReflection.listPrincipleProposals(sessionId, {
                includeClosed: true,
            }));
            return result.ok
                ? { ok: true, value: result.value.proposals }
                : result;
        },
        onListPrinciples: async () => {
            const result = await settle(ctx.remote.mindGardenReflection.listPrinciples(sessionId, {
                includeRetired: true,
            }));
            return result.ok
                ? { ok: true, value: result.value.principles }
                : result;
        },
        onAcceptPrincipleProposal: async (proposal, stamp) => await settle(ctx.remote.mindGardenReflection.acceptPrincipleProposal(sessionId, {
            id: proposal.id,
            ifVersion: proposal.version,
            stamp,
        })),
        onRejectPrincipleProposal: async (proposal) => await settle(ctx.remote.mindGardenReflection.rejectPrincipleProposal(sessionId, {
            id: proposal.id,
            ifVersion: proposal.version,
        })),
        onRevisePrincipleStatus: async (principle, status, stamp) => await settle(ctx.remote.mindGardenReflection.revisePrinciple(sessionId, {
            id: principle.id,
            ifVersion: principle.version,
            stamp,
            content: { ...principle.current, status },
        })),
        onListOpenQuestions: async () => {
            const result = await settle(ctx.remote.mindGardenReflection.listOpenQuestions(sessionId, {
                includeClosed: true,
            }));
            return result.ok
                ? { ok: true, value: result.value.questions }
                : result;
        },
        onCreateOpenQuestion: async (question, stamp) => await settle(ctx.remote.mindGardenReflection.createOpenQuestion(sessionId, { question, stamp })),
        onUpdateOpenQuestion: async (question, nextQuestion, status, stamp) => await settle(ctx.remote.mindGardenReflection.updateOpenQuestion(sessionId, {
            id: question.id,
            ifVersion: question.version,
            question: nextQuestion,
            status,
            stamp,
        })),
        onPeriodReviewMaterial: async (request) => await settle(ctx.remote.mindGardenReflection.periodReviewMaterial(sessionId, request)),
        onCreatePeriodReview: async (material, content) => await settle(ctx.remote.mindGardenReflection.createPeriodReview(sessionId, {
            periodType: material.periodType,
            startStamp: material.startStamp,
            endStamp: material.endStamp,
            materialHash: material.materialHash,
            sourceIds: material.sources.map(source => source.id),
            content,
        })),
        onListPeriodReviews: async () => {
            const result = await settle(ctx.remote.mindGardenReflection.listPeriodReviews(sessionId, {
                includeArchived: true,
            }));
            return result.ok
                ? { ok: true, value: result.value.reviews }
                : result;
        },
        onUpdatePeriodReview: async (review, content, status) => await settle(ctx.remote.mindGardenReflection.updatePeriodReview(sessionId, {
            id: review.id,
            ifVersion: review.version,
            content,
            status,
        })),
    };
}
/** Register the session-scoped Mind Garden dock. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-mind-garden: dictionaries');
    const t = ctx.locale.bind(NS);
    ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'mind-garden',
        order: 5,
        locale: NS,
        inject: (sessionId) => dockActions(ctx, sessionId),
    }, MindGardenDock));
    ctx.slots.inject('conversation.view', () => ctx.slots.register({
        name: 'conversation.view',
        id: 'mind-garden',
        order: 20,
        locale: NS,
        label: () => t('view.garden'),
        store: createMindGardenViewStore(),
        inject: (sessionId) => viewActions(ctx, sessionId),
    }, MindGardenView));
}
//# sourceMappingURL=index.js.map