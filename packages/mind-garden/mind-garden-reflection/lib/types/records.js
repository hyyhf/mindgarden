/** Strict authenticated plaintext codecs behind the Mind Garden reflection vault collection. */
import { z } from 'zod';
const stampSchema = z.object({
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    timeZone: z.string().min(1),
    utcOffsetMinutes: z.number().int().min(-840).max(840),
}).strict();
const commonSchema = z.object({
    formatVersion: z.literal(1),
    id: z.uuid(),
    sourceSessionId: z.string().min(1),
    createdAt: z.number().int().nonnegative(),
});
/** Version-one encrypted check-in payload. */
export const storedCheckinSchema = commonSchema.extend({
    recordType: z.literal('checkin'),
    stamp: stampSchema,
    mood: z.union([z.literal(-2), z.literal(-1), z.literal(0), z.literal(1), z.literal(2)]),
    energy: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    emotionWords: z.array(z.string().min(1)).max(3),
    phase: z.enum(['standalone', 'before', 'after', 'journal']),
}).strict();
/** Version-one encrypted journal payload. */
export const storedJournalSchema = commonSchema.extend({
    recordType: z.literal('journal'),
    version: z.uuid(),
    stamp: stampSchema,
    title: z.string(),
    body: z.string().min(1),
    allowRetrieval: z.boolean(),
    updatedAt: z.number().int().nonnegative(),
}).strict().refine(record => record.updatedAt >= record.createdAt, {
    message: 'journal updatedAt precedes createdAt',
});
const concernConversionSchema = z.object({
    journalId: z.uuid(),
    journalVersion: z.uuid(),
    finalConcernVersion: z.uuid(),
    stamp: stampSchema,
    allowRetrieval: z.boolean(),
    createdAt: z.number().int().nonnegative(),
}).strict();
/** Version-one encrypted concern payload, including its recoverable conversion intent. */
export const storedConcernSchema = commonSchema.extend({
    recordType: z.literal('concern'),
    version: z.uuid(),
    content: z.string().min(1),
    status: z.enum(['active', 'completed', 'converting', 'converted']),
    createdStamp: stampSchema,
    reminder: stampSchema.nullable(),
    convertedJournalId: z.uuid().nullable(),
    conversion: concernConversionSchema.nullable(),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((record, context) => {
    if (record.updatedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'concern updatedAt precedes createdAt' });
    }
    const stable = record.status === 'active' || record.status === 'completed';
    if (stable && (record.convertedJournalId !== null || record.conversion !== null)) {
        context.addIssue({ code: 'custom', message: 'unconverted concern carries conversion state' });
    }
    if (record.status === 'active'
        && record.reminder !== null
        && record.reminder.localDate < record.createdStamp.localDate) {
        context.addIssue({ code: 'custom', message: 'concern reminder precedes creation date' });
    }
    if (record.status === 'completed' && record.reminder !== null) {
        context.addIssue({ code: 'custom', message: 'completed concern carries a reminder' });
    }
    if (record.status === 'converting') {
        if (record.reminder !== null || record.convertedJournalId !== null || record.conversion === null) {
            context.addIssue({ code: 'custom', message: 'converting concern has an invalid recovery plan' });
        }
        else if (record.conversion.createdAt < record.createdAt || record.updatedAt !== record.conversion.createdAt) {
            context.addIssue({ code: 'custom', message: 'converting concern timestamps differ from its recovery plan' });
        }
        else if (record.conversion.stamp.localDate < record.createdStamp.localDate) {
            context.addIssue({ code: 'custom', message: 'concern conversion precedes its creation date' });
        }
    }
    if (record.status === 'converted'
        && (record.reminder !== null || record.convertedJournalId === null || record.conversion !== null)) {
        context.addIssue({ code: 'custom', message: 'converted concern has an invalid journal link' });
    }
});
/** Version-one encrypted contemplation payload. */
export const storedContemplationSchema = commonSchema.extend({
    recordType: z.literal('contemplation'),
    version: z.uuid(),
    markdown: z.string().min(1),
    status: z.enum(['draft', 'confirmed']),
    updatedAt: z.number().int().nonnegative(),
    confirmedAt: z.number().int().nonnegative().nullable(),
}).strict().superRefine((record, context) => {
    if (record.updatedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'contemplation updatedAt precedes createdAt' });
    }
    if (record.status === 'draft' && record.confirmedAt !== null) {
        context.addIssue({ code: 'custom', message: 'draft contemplation carries confirmation time' });
    }
    if (record.status === 'confirmed'
        && (record.confirmedAt === null || record.confirmedAt < record.createdAt || record.updatedAt !== record.confirmedAt)) {
        context.addIssue({ code: 'custom', message: 'confirmed contemplation has invalid confirmation time' });
    }
});
const principleContentSchema = z.object({
    expression: z.string().min(1),
    formationContext: z.string(),
    userQuote: z.string().min(1),
    supportingExperiences: z.array(z.object({
        summary: z.string().min(1),
        sourceContemplationId: z.uuid().nullable(),
    }).strict()),
    counterexample: z.string(),
    appliesTo: z.array(z.string().min(1)),
    notAppliesTo: z.array(z.string().min(1)),
    lastChallenged: z.string(),
    status: z.enum(['trying', 'adopted', 'questioning', 'retired']),
}).strict();
const principleVersionSchema = z.object({
    number: z.number().int().positive(),
    content: principleContentSchema,
    sourceProposalId: z.uuid().nullable(),
    sourceContemplationId: z.uuid().nullable(),
    stamp: stampSchema,
    createdAt: z.number().int().nonnegative(),
}).strict();
/** Version-one encrypted principle payload with append-only history. */
export const storedPrincipleSchema = commonSchema.omit({ sourceSessionId: true }).extend({
    recordType: z.literal('principle'),
    version: z.uuid(),
    status: z.enum(['trying', 'adopted', 'questioning', 'retired']),
    current: principleContentSchema,
    versions: z.array(principleVersionSchema).min(1),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((record, context) => {
    if (record.updatedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'principle updatedAt precedes createdAt' });
    }
    for (const [index, version] of record.versions.entries()) {
        const previous = record.versions[index - 1];
        if (version.number !== index + 1) {
            context.addIssue({ code: 'custom', message: 'principle versions are not contiguous' });
        }
        if (version.createdAt < record.createdAt
            || (previous !== undefined && version.createdAt < previous.createdAt)) {
            context.addIssue({ code: 'custom', message: 'principle version timestamps are not monotonic' });
        }
    }
    const current = record.versions.at(-1);
    if (current !== undefined
        && (JSON.stringify(record.current) !== JSON.stringify(current.content)
            || record.status !== current.content.status
            || record.updatedAt !== current.createdAt)) {
        context.addIssue({ code: 'custom', message: 'principle current state differs from its latest version' });
    }
});
/** Version-one encrypted principle proposal payload. Accepted state is derived from principle history. */
export const storedPrincipleProposalSchema = commonSchema.extend({
    recordType: z.literal('principle-proposal'),
    version: z.uuid(),
    status: z.enum(['proposed', 'rejected']),
    targetPrincipleId: z.uuid().nullable(),
    targetVersion: z.uuid().nullable(),
    content: principleContentSchema,
    sourceContemplationId: z.uuid(),
    updatedAt: z.number().int().nonnegative(),
    rejectedAt: z.number().int().nonnegative().nullable(),
}).strict().superRefine((record, context) => {
    if (record.updatedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'principle proposal updatedAt precedes createdAt' });
    }
    if ((record.targetPrincipleId === null) !== (record.targetVersion === null)) {
        context.addIssue({ code: 'custom', message: 'principle proposal target is incomplete' });
    }
    if (record.status === 'proposed' && record.rejectedAt !== null) {
        context.addIssue({ code: 'custom', message: 'open principle proposal carries rejection time' });
    }
    if (record.status === 'rejected'
        && (record.rejectedAt === null || record.rejectedAt < record.createdAt || record.updatedAt !== record.rejectedAt)) {
        context.addIssue({ code: 'custom', message: 'rejected principle proposal has invalid rejection time' });
    }
});
const experimentObservationSchema = z.object({
    id: z.uuid(),
    happened: z.string(),
    action: z.string(),
    observation: z.string().min(1),
    mood: z.union([
        z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null(),
    ]),
    energy: z.union([
        z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null(),
    ]),
    stamp: stampSchema,
    createdAt: z.number().int().nonnegative(),
}).strict();
/** Version-one encrypted reality experiment with append-only observations. */
export const storedExperimentSchema = commonSchema.extend({
    recordType: z.literal('experiment'),
    version: z.uuid(),
    title: z.string().min(1),
    hypothesis: z.string(),
    action: z.string().min(1),
    reviewStamp: stampSchema.nullable(),
    status: z.enum(['proposed', 'trying', 'observed', 'revised', 'stopped']),
    result: z.string(),
    judgment: z.string(),
    sourceMessageId: z.string().min(1).nullable(),
    evidenceQuote: z.string(),
    observations: z.array(experimentObservationSchema),
    createdStamp: stampSchema,
    startedAt: z.number().int().nonnegative().nullable(),
    stoppedAt: z.number().int().nonnegative().nullable(),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((record, context) => {
    if (record.updatedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'experiment updatedAt precedes createdAt' });
    }
    if ((record.sourceMessageId === null) !== (record.evidenceQuote.length === 0)) {
        context.addIssue({ code: 'custom', message: 'experiment evidence source is incomplete' });
    }
    if (record.startedAt !== null && record.startedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'experiment start precedes creation' });
    }
    const observationIds = new Set();
    let previousCreatedAt = record.createdAt;
    for (const observation of record.observations) {
        if (observationIds.has(observation.id)) {
            context.addIssue({ code: 'custom', message: 'experiment observation ids are duplicated' });
        }
        if (observation.createdAt < previousCreatedAt || observation.createdAt > record.updatedAt) {
            context.addIssue({ code: 'custom', message: 'experiment observation timestamps are invalid' });
        }
        observationIds.add(observation.id);
        previousCreatedAt = observation.createdAt;
    }
    if (record.status === 'proposed'
        && (record.startedAt !== null || record.observations.length > 0 || record.result.length > 0
            || record.judgment.length > 0 || record.stoppedAt !== null)) {
        context.addIssue({ code: 'custom', message: 'proposed experiment carries progress state' });
    }
    if (record.status === 'trying' && (record.startedAt === null || record.stoppedAt !== null)) {
        context.addIssue({ code: 'custom', message: 'trying experiment has invalid lifecycle state' });
    }
    const latest = record.observations.at(-1);
    if (record.status === 'observed'
        && (record.startedAt === null || latest === undefined || record.result !== latest.observation
            || record.reviewStamp !== null || record.stoppedAt !== null)) {
        context.addIssue({ code: 'custom', message: 'observed experiment has invalid observation state' });
    }
    if (record.status === 'revised'
        && (record.startedAt === null || latest === undefined || record.judgment.trim().length === 0
            || record.stoppedAt !== null)) {
        context.addIssue({ code: 'custom', message: 'revised experiment has invalid judgment state' });
    }
    if (record.status === 'stopped') {
        if (record.reviewStamp !== null || record.stoppedAt === null
            || record.stoppedAt < record.createdAt || record.updatedAt !== record.stoppedAt) {
            context.addIssue({ code: 'custom', message: 'stopped experiment has invalid stop time' });
        }
    }
    else if (record.stoppedAt !== null) {
        context.addIssue({ code: 'custom', message: 'active experiment carries stop time' });
    }
});
const openQuestionSourceSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('message'),
        messageId: z.string().min(1),
        evidenceQuote: z.string().min(1),
    }).strict(),
    z.object({
        kind: z.literal('journal'),
        journalId: z.uuid(),
        journalVersion: z.uuid(),
        evidenceQuote: z.string().min(1),
    }).strict(),
]);
const openQuestionTransitionSchema = z.object({
    id: z.uuid(),
    status: z.enum(['open', 'resolved', 'dismissed']),
    stamp: stampSchema,
    createdAt: z.number().int().nonnegative(),
}).strict();
/** Version-one encrypted open question with append-only lifecycle transitions. */
export const storedOpenQuestionSchema = commonSchema.extend({
    recordType: z.literal('open-question'),
    version: z.uuid(),
    question: z.string().min(1),
    status: z.enum(['open', 'resolved', 'dismissed']),
    source: openQuestionSourceSchema.nullable(),
    transitions: z.array(openQuestionTransitionSchema).min(1),
    createdStamp: stampSchema,
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((record, context) => {
    if (record.updatedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'open question updatedAt precedes createdAt' });
    }
    const first = record.transitions[0];
    if (first?.status !== 'open'
        || first.createdAt !== record.createdAt
        || JSON.stringify(first.stamp) !== JSON.stringify(record.createdStamp)) {
        context.addIssue({ code: 'custom', message: 'open question has invalid creation transition' });
    }
    const transitionIds = new Set();
    let previousStatus;
    let previousCreatedAt = record.createdAt;
    for (const transition of record.transitions) {
        if (transitionIds.has(transition.id)) {
            context.addIssue({ code: 'custom', message: 'open question transition ids are duplicated' });
        }
        transitionIds.add(transition.id);
        if (transition.createdAt < previousCreatedAt || transition.createdAt > record.updatedAt) {
            context.addIssue({ code: 'custom', message: 'open question transition timestamps are not monotonic' });
        }
        if (transition.status === previousStatus) {
            context.addIssue({ code: 'custom', message: 'open question repeats a lifecycle transition' });
        }
        previousStatus = transition.status;
        previousCreatedAt = transition.createdAt;
    }
    if (record.transitions.at(-1)?.status !== record.status) {
        context.addIssue({ code: 'custom', message: 'open question status differs from its latest transition' });
    }
});
const currentPeriodReviewSourceSchema = z.object({
    id: z.uuid(),
    sourceType: z.enum([
        'checkin', 'journal', 'concern', 'contemplation', 'principle', 'experiment', 'open-question',
    ]),
    fingerprint: z.string().regex(/^[0-9a-f]{64}$/u),
    localDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/u)).min(1),
}).strict();
const legacyPeriodReviewSourceSchema = z.object({
    id: z.uuid(),
    sourceType: z.literal('legacy-original'),
    legacyType: z.string().min(1).max(64),
    fingerprint: z.string().regex(/^[0-9a-f]{64}$/u),
    localDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/u)).min(1),
}).strict();
const periodReviewSourceSchema = z.discriminatedUnion('sourceType', [
    currentPeriodReviewSourceSchema,
    legacyPeriodReviewSourceSchema,
]).superRefine((source, context) => {
    if (new Set(source.localDates).size !== source.localDates.length) {
        context.addIssue({ code: 'custom', message: 'period review source dates are duplicated' });
    }
    if ([...source.localDates].sort().some((value, index) => value !== source.localDates[index])) {
        context.addIssue({ code: 'custom', message: 'period review source dates are not ordered' });
    }
});
/** Version-one encrypted period review with authenticated source snapshots. */
export const storedPeriodReviewSchema = commonSchema.extend({
    recordType: z.literal('period-review'),
    version: z.uuid(),
    periodType: z.enum(['week', 'month', 'year']),
    startStamp: stampSchema,
    endStamp: stampSchema,
    status: z.enum(['proposed', 'saved', 'archived']),
    content: z.string().min(1),
    sources: z.array(periodReviewSourceSchema).min(1),
    sourceHash: z.string().regex(/^[0-9a-f]{64}$/u),
    updatedAt: z.number().int().nonnegative(),
}).strict().superRefine((record, context) => {
    if (record.updatedAt < record.createdAt) {
        context.addIssue({ code: 'custom', message: 'period review updatedAt precedes createdAt' });
    }
    if (record.startStamp.localDate > record.endStamp.localDate) {
        context.addIssue({ code: 'custom', message: 'period review date range is reversed' });
    }
    if (record.startStamp.timeZone !== record.endStamp.timeZone) {
        context.addIssue({ code: 'custom', message: 'period review range mixes time zones' });
    }
    const sourceKeys = record.sources.map(source => `${source.sourceType}:${source.id}`);
    if (new Set(sourceKeys).size !== sourceKeys.length) {
        context.addIssue({ code: 'custom', message: 'period review sources are duplicated' });
    }
    if ([...sourceKeys].sort().some((value, index) => value !== sourceKeys[index])) {
        context.addIssue({ code: 'custom', message: 'period review sources are not ordered' });
    }
    for (const source of record.sources) {
        if (source.localDates.some(date => date < record.startStamp.localDate || date > record.endStamp.localDate)) {
            context.addIssue({ code: 'custom', message: 'period review source date is outside its range' });
        }
    }
});
/**
 * Decode one authenticated plaintext record without trusting its producer.
 * @param value - Plaintext returned after vault authentication.
 * @returns A strictly validated record from the complete reflection vocabulary.
 */
export function decodeStoredReflection(value) {
    const discriminator = z.looseObject({ recordType: z.string() }).parse(value).recordType;
    if (discriminator === 'checkin')
        return storedCheckinSchema.parse(value);
    if (discriminator === 'journal')
        return storedJournalSchema.parse(value);
    if (discriminator === 'concern')
        return storedConcernSchema.parse(value);
    if (discriminator === 'contemplation')
        return storedContemplationSchema.parse(value);
    if (discriminator === 'principle')
        return storedPrincipleSchema.parse(value);
    if (discriminator === 'principle-proposal')
        return storedPrincipleProposalSchema.parse(value);
    if (discriminator === 'experiment')
        return storedExperimentSchema.parse(value);
    if (discriminator === 'open-question')
        return storedOpenQuestionSchema.parse(value);
    if (discriminator === 'period-review')
        return storedPeriodReviewSchema.parse(value);
    throw new TypeError(`unknown Mind Garden reflection record type '${discriminator}'`);
}
//# sourceMappingURL=records.js.map