/** Authenticated plaintext codecs behind the Star Map vault boundary. */
import { z } from 'zod';
const permissionsSchema = z.object({
    dailyReflections: z.boolean(),
    confirmedMemories: z.boolean(),
    openQuestions: z.boolean(),
    periodReviews: z.boolean(),
}).strict();
const sceneAnswerSchema = z.enum([
    '1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b',
]);
/** Version-one encrypted Star Map profile. */
export const storedStarProfileSchema = z.object({
    onboardingStage: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    onboardingCompleted: z.boolean(),
    displayName: z.string(),
    birthMonth: z.number().int().min(1).max(12).nullable(),
    birthDay: z.number().int().min(1).max(31).nullable(),
    birthYear: z.number().int().min(1900).max(2200).nullable(),
    birthTime: z.string(),
    birthTimeKnown: z.boolean(),
    birthCity: z.string(),
    birthCityKnown: z.boolean(),
    mbtiMode: z.enum(['known', 'scenes', 'observe']),
    mbtiType: z.string(),
    mbtiAnswers: z.array(sceneAnswerSchema).max(6),
    selfWords: z.array(z.string()).max(5),
    observationIntent: z.string(),
    observerTone: z.enum(['gentle', 'direct', 'mystic']),
    permissions: permissionsSchema,
    reducedMotion: z.boolean(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((profile, context) => {
    if (profile.updatedAt < profile.createdAt) {
        context.addIssue({ code: 'custom', message: 'profile updatedAt precedes createdAt' });
    }
    if (profile.onboardingCompleted !== (profile.onboardingStage === 3)) {
        context.addIssue({ code: 'custom', message: 'profile completion differs from onboarding stage' });
    }
    if ((profile.birthMonth === null) !== (profile.birthDay === null)) {
        context.addIssue({ code: 'custom', message: 'profile birth month and day are incomplete' });
    }
    if (profile.birthTimeKnown !== (profile.birthTime.length > 0)) {
        context.addIssue({ code: 'custom', message: 'profile birth time knowledge differs from value' });
    }
    if (profile.birthCityKnown !== (profile.birthCity.length > 0)) {
        context.addIssue({ code: 'custom', message: 'profile birth city knowledge differs from value' });
    }
    if (profile.mbtiMode === 'known' && !/^[EI][SN][TF][JP]$/.test(profile.mbtiType)) {
        context.addIssue({ code: 'custom', message: 'known MBTI mode lacks a valid type' });
    }
    if (profile.mbtiMode === 'scenes' && profile.mbtiAnswers.length !== 6) {
        context.addIssue({ code: 'custom', message: 'scene MBTI mode lacks six answers' });
    }
    if (profile.mbtiMode === 'observe' && (profile.mbtiType.length > 0 || profile.mbtiAnswers.length > 0)) {
        context.addIssue({ code: 'custom', message: 'observe MBTI mode carries an asserted result' });
    }
    if (new Set(profile.selfWords).size !== profile.selfWords.length) {
        context.addIssue({ code: 'custom', message: 'profile self words are duplicated' });
    }
    if (profile.onboardingCompleted
        && (profile.displayName.length === 0 || profile.selfWords.length === 0 || profile.observationIntent.length === 0)) {
        context.addIssue({ code: 'custom', message: 'completed profile lacks required self-authored fields' });
    }
});
/** Version-one encrypted governed constellation trait. */
export const storedStarTraitSchema = z.object({
    id: z.uuid(),
    version: z.uuid(),
    kind: z.enum(['strength', 'tension', 'pattern', 'unfolded']),
    status: z.enum(['self-reported', 'pending', 'confirmed', 'uncertain', 'rejected', 'retired']),
    label: z.string(),
    description: z.string(),
    confidence: z.number().min(0).max(1),
    source: z.enum(['ritual-self-report', 'star-observer']),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((trait, context) => {
    if (trait.updatedAt < trait.createdAt) {
        context.addIssue({ code: 'custom', message: 'trait updatedAt precedes createdAt' });
    }
    if (trait.source === 'ritual-self-report'
        && trait.status !== 'self-reported'
        && trait.status !== 'retired') {
        context.addIssue({ code: 'custom', message: 'ritual self-report trait has an inferred status' });
    }
});
/** Frozen authenticated excerpt that the model may cite by opaque key. */
export const storedStarEvidenceSchema = z.object({
    id: z.uuid(),
    sourceType: z.enum(['daily-reflection', 'confirmed-memory', 'open-question', 'period-review']),
    sourceId: z.string().min(1),
    summary: z.string().min(1),
}).strict();
const storedStarCardAnalysisSchema = z.object({
    situation: z.string().min(1),
    coreIssue: z.string().min(1),
    tradeoff: z.string().min(1),
    guidance: z.string().min(1),
}).strict();
const storedStarCardCalibrationSchema = z.object({
    verdict: z.enum(['resonates', 'uncertain', 'rejects']),
    correction: z.string(),
    createdAt: z.number().int().nonnegative(),
}).strict();
const storedStarDialogueTurnSchema = z.object({
    id: z.uuid(),
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
    quickReplyKind: z.enum(['', 'deepen', 'shift', 'correct']),
    createdAt: z.number().int().nonnegative(),
}).strict();
const storedStarQuickReplySchema = z.object({
    kind: z.enum(['deepen', 'shift', 'correct']),
    label: z.string().min(1),
}).strict();
const storedStarCardRevisionSchema = z.object({
    id: z.uuid(),
    title: z.string().min(1),
    frontText: z.string().min(1),
    analysis: storedStarCardAnalysisSchema,
    openQuestion: z.string().min(1),
    traitKind: z.enum(['strength', 'tension', 'pattern', 'unfolded']),
    symbolicBasis: z.array(z.string().min(1)).max(3),
    confidence: z.number().min(0).max(1),
    createdAt: z.number().int().nonnegative(),
}).strict();
/** Version-one encrypted Star Observer card. */
export const storedStarCardSchema = z.object({
    id: z.uuid(),
    version: z.uuid(),
    status: z.enum(['draft', 'saved', 'dissolved']),
    deck: z.enum(['current-self', 'unfolded-self', 'inner-debate']),
    observerTone: z.enum(['gentle', 'direct', 'mystic']),
    question: z.string(),
    title: z.string().min(1),
    frontText: z.string().min(1),
    analysis: storedStarCardAnalysisSchema,
    openQuestion: z.string().min(1),
    cardKind: z.enum(['observation', 'imagination']),
    traitKind: z.enum(['strength', 'tension', 'pattern', 'unfolded']),
    symbolicBasis: z.array(z.string().min(1)).max(3),
    evidence: z.array(storedStarEvidenceSchema).max(12),
    confidence: z.number().min(0).max(1),
    calibration: storedStarCardCalibrationSchema.nullable(),
    traitId: z.uuid().nullable(),
    turns: z.array(storedStarDialogueTurnSchema).max(24).default([]),
    quickReplies: z.array(storedStarQuickReplySchema).max(3).default([]),
    pendingRevision: storedStarCardRevisionSchema.nullable().default(null),
    provider: z.string().min(1),
    model: z.string().min(1),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((card, context) => {
    if (card.updatedAt < card.createdAt) {
        context.addIssue({ code: 'custom', message: 'card updatedAt precedes createdAt' });
    }
    if ((card.cardKind === 'observation') !== (card.evidence.length > 0)) {
        context.addIssue({ code: 'custom', message: 'card kind differs from frozen evidence' });
    }
    const confidenceCap = card.cardKind === 'observation' ? 0.82 : 0.45;
    if (card.confidence > confidenceCap) {
        context.addIssue({ code: 'custom', message: 'card confidence exceeds its evidence class' });
    }
});
/** Encrypted audit of one exact Star Observer dialogue request and terminal state. */
export const storedStarDialogueRunSchema = z.object({
    id: z.uuid(),
    cardId: z.uuid(),
    cardVersion: z.uuid(),
    status: z.enum(['running', 'completed', 'failed']),
    failure: z.enum(['interrupted', 'model-failed', 'invalid-output', 'card-changed']).nullable(),
    provider: z.string().min(1),
    model: z.string().min(1),
    system: z.string().min(1),
    prompt: z.string().min(1),
    rawOutput: z.string(),
    userTurnId: z.uuid().nullable(),
    assistantTurnId: z.uuid().nullable(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((run, context) => {
    if (run.updatedAt < run.createdAt) {
        context.addIssue({ code: 'custom', message: 'dialogue run updatedAt precedes createdAt' });
    }
    const validRunning = run.status === 'running'
        && run.failure === null
        && run.rawOutput.length === 0
        && run.userTurnId === null
        && run.assistantTurnId === null;
    const validCompleted = run.status === 'completed'
        && run.failure === null
        && run.rawOutput.length > 0
        && run.userTurnId !== null
        && run.assistantTurnId !== null;
    const validFailed = run.status === 'failed'
        && run.failure !== null
        && run.userTurnId === null
        && run.assistantTurnId === null;
    if (!validRunning && !validCompleted && !validFailed) {
        context.addIssue({ code: 'custom', message: 'dialogue audit terminal fields differ from status' });
    }
});
/** Encrypted audit of the exact auxiliary request and its terminal state. */
export const storedStarObservationRunSchema = z.object({
    id: z.uuid(),
    status: z.enum(['running', 'completed', 'failed']),
    failure: z.enum(['interrupted', 'model-failed', 'invalid-output', 'context-changed']).nullable(),
    profileVersion: z.uuid(),
    provider: z.string().min(1),
    model: z.string().min(1),
    system: z.string().min(1),
    prompt: z.string().min(1),
    evidence: z.array(storedStarEvidenceSchema).max(12),
    rawOutput: z.string(),
    cardId: z.uuid().nullable(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((run, context) => {
    if (run.updatedAt < run.createdAt) {
        context.addIssue({ code: 'custom', message: 'observation run updatedAt precedes createdAt' });
    }
    const validRunning = run.status === 'running'
        && run.failure === null
        && run.cardId === null
        && run.rawOutput.length === 0;
    const validCompleted = run.status === 'completed'
        && run.failure === null
        && run.cardId !== null
        && run.rawOutput.length > 0;
    const validFailed = run.status === 'failed'
        && run.failure !== null
        && run.cardId === null;
    if (!validRunning && !validCompleted && !validFailed) {
        context.addIssue({ code: 'custom', message: 'observation audit terminal fields differ from status' });
    }
});
/** Single recoverable encrypted aggregate for profile and trait updates. */
export const storedStarStateSchema = z.object({
    recordType: z.literal('star-state'),
    formatVersion: z.literal(1),
    id: z.uuid(),
    version: z.uuid(),
    profile: storedStarProfileSchema,
    traits: z.array(storedStarTraitSchema).max(64),
    cards: z.array(storedStarCardSchema).max(64).default([]),
    observationRuns: z.array(storedStarObservationRunSchema).max(32).default([]),
    dialogueRuns: z.array(storedStarDialogueRunSchema).max(32).default([]),
}).strict().superRefine((state, context) => {
    const ids = state.traits.map(trait => trait.id);
    if (new Set(ids).size !== ids.length) {
        context.addIssue({ code: 'custom', message: 'Star Map trait ids are duplicated' });
    }
    if (!state.profile.onboardingCompleted && state.traits.length > 0) {
        context.addIssue({ code: 'custom', message: 'incomplete ritual carries constellation traits' });
    }
    const cardIds = state.cards.map(card => card.id);
    if (new Set(cardIds).size !== cardIds.length) {
        context.addIssue({ code: 'custom', message: 'Star Map card ids are duplicated' });
    }
    if (state.cards.filter(card => card.status === 'draft').length > 1) {
        context.addIssue({ code: 'custom', message: 'Star Map carries more than one active card' });
    }
    const traitIds = new Set(state.traits.map(trait => trait.id));
    if (state.cards.some(card => card.traitId !== null && !traitIds.has(card.traitId))) {
        context.addIssue({ code: 'custom', message: 'Star Map card references a missing trait' });
    }
    const runIds = state.observationRuns.map(run => run.id);
    if (new Set(runIds).size !== runIds.length) {
        context.addIssue({ code: 'custom', message: 'Star Map observation run ids are duplicated' });
    }
    const knownCardIds = new Set(cardIds);
    if (state.observationRuns.some(run => run.cardId !== null && !knownCardIds.has(run.cardId))) {
        context.addIssue({ code: 'custom', message: 'Star Map observation run references a missing card' });
    }
    const dialogueRunIds = state.dialogueRuns.map(run => run.id);
    if (new Set(dialogueRunIds).size !== dialogueRunIds.length) {
        context.addIssue({ code: 'custom', message: 'Star Map dialogue run ids are duplicated' });
    }
    if (state.dialogueRuns.some(run => !knownCardIds.has(run.cardId))) {
        context.addIssue({ code: 'custom', message: 'Star Map dialogue run references a missing card' });
    }
});
/**
 * Decode authenticated Star Map plaintext without trusting its producer.
 * @param value - Plaintext read from the Star Map vault collection.
 * @returns The strictly validated Star Map aggregate.
 */
export function decodeStoredStarState(value) {
    return storedStarStateSchema.parse(value);
}
//# sourceMappingURL=records.js.map