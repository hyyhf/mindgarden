import { Buffer } from "node:buffer";
import { createHash, randomUUID } from "node:crypto";
import s from "@deepseek-ai/schemastery";
import { MindGardenVaultError, MindGardenVaultRecordId } from "@deepseek-ai/dsh-mind-garden/vault";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { z } from "zod";
//#region lib/types/records.js
/** Strict authenticated plaintext codecs behind the Mind Garden reflection vault collection. */
const stampSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
	timeZone: z.string().min(1),
	utcOffsetMinutes: z.number().int().min(-840).max(840)
}).strict();
const commonSchema = z.object({
	formatVersion: z.literal(1),
	id: z.uuid(),
	sourceSessionId: z.string().min(1),
	createdAt: z.number().int().nonnegative()
});
/** Version-one encrypted check-in payload. */
const storedCheckinSchema = commonSchema.extend({
	recordType: z.literal("checkin"),
	stamp: stampSchema,
	mood: z.union([
		z.literal(-2),
		z.literal(-1),
		z.literal(0),
		z.literal(1),
		z.literal(2)
	]),
	energy: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(5)
	]),
	emotionWords: z.array(z.string().min(1)).max(3),
	phase: z.enum([
		"standalone",
		"before",
		"after",
		"journal"
	])
}).strict();
/** Version-one encrypted journal payload. */
const storedJournalSchema = commonSchema.extend({
	recordType: z.literal("journal"),
	version: z.uuid(),
	stamp: stampSchema,
	title: z.string(),
	body: z.string().min(1),
	allowRetrieval: z.boolean(),
	updatedAt: z.number().int().nonnegative()
}).strict().refine((record) => record.updatedAt >= record.createdAt, { message: "journal updatedAt precedes createdAt" });
const concernConversionSchema = z.object({
	journalId: z.uuid(),
	journalVersion: z.uuid(),
	finalConcernVersion: z.uuid(),
	stamp: stampSchema,
	allowRetrieval: z.boolean(),
	createdAt: z.number().int().nonnegative()
}).strict();
/** Version-one encrypted concern payload, including its recoverable conversion intent. */
const storedConcernSchema = commonSchema.extend({
	recordType: z.literal("concern"),
	version: z.uuid(),
	content: z.string().min(1),
	status: z.enum([
		"active",
		"completed",
		"converting",
		"converted"
	]),
	createdStamp: stampSchema,
	reminder: stampSchema.nullable(),
	convertedJournalId: z.uuid().nullable(),
	conversion: concernConversionSchema.nullable(),
	updatedAt: z.number().int().nonnegative()
}).strict().superRefine((record, context) => {
	if (record.updatedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "concern updatedAt precedes createdAt"
	});
	if ((record.status === "active" || record.status === "completed") && (record.convertedJournalId !== null || record.conversion !== null)) context.addIssue({
		code: "custom",
		message: "unconverted concern carries conversion state"
	});
	if (record.status === "active" && record.reminder !== null && record.reminder.localDate < record.createdStamp.localDate) context.addIssue({
		code: "custom",
		message: "concern reminder precedes creation date"
	});
	if (record.status === "completed" && record.reminder !== null) context.addIssue({
		code: "custom",
		message: "completed concern carries a reminder"
	});
	if (record.status === "converting") {
		if (record.reminder !== null || record.convertedJournalId !== null || record.conversion === null) context.addIssue({
			code: "custom",
			message: "converting concern has an invalid recovery plan"
		});
		else if (record.conversion.createdAt < record.createdAt || record.updatedAt !== record.conversion.createdAt) context.addIssue({
			code: "custom",
			message: "converting concern timestamps differ from its recovery plan"
		});
		else if (record.conversion.stamp.localDate < record.createdStamp.localDate) context.addIssue({
			code: "custom",
			message: "concern conversion precedes its creation date"
		});
	}
	if (record.status === "converted" && (record.reminder !== null || record.convertedJournalId === null || record.conversion !== null)) context.addIssue({
		code: "custom",
		message: "converted concern has an invalid journal link"
	});
});
/** Version-one encrypted contemplation payload. */
const storedContemplationSchema = commonSchema.extend({
	recordType: z.literal("contemplation"),
	version: z.uuid(),
	markdown: z.string().min(1),
	status: z.enum(["draft", "confirmed"]),
	updatedAt: z.number().int().nonnegative(),
	confirmedAt: z.number().int().nonnegative().nullable()
}).strict().superRefine((record, context) => {
	if (record.updatedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "contemplation updatedAt precedes createdAt"
	});
	if (record.status === "draft" && record.confirmedAt !== null) context.addIssue({
		code: "custom",
		message: "draft contemplation carries confirmation time"
	});
	if (record.status === "confirmed" && (record.confirmedAt === null || record.confirmedAt < record.createdAt || record.updatedAt !== record.confirmedAt)) context.addIssue({
		code: "custom",
		message: "confirmed contemplation has invalid confirmation time"
	});
});
const principleContentSchema = z.object({
	expression: z.string().min(1),
	formationContext: z.string(),
	userQuote: z.string().min(1),
	supportingExperiences: z.array(z.object({
		summary: z.string().min(1),
		sourceContemplationId: z.uuid().nullable()
	}).strict()),
	counterexample: z.string(),
	appliesTo: z.array(z.string().min(1)),
	notAppliesTo: z.array(z.string().min(1)),
	lastChallenged: z.string(),
	status: z.enum([
		"trying",
		"adopted",
		"questioning",
		"retired"
	])
}).strict();
const principleVersionSchema = z.object({
	number: z.number().int().positive(),
	content: principleContentSchema,
	sourceProposalId: z.uuid().nullable(),
	sourceContemplationId: z.uuid().nullable(),
	stamp: stampSchema,
	createdAt: z.number().int().nonnegative()
}).strict();
/** Version-one encrypted principle payload with append-only history. */
const storedPrincipleSchema = commonSchema.omit({ sourceSessionId: true }).extend({
	recordType: z.literal("principle"),
	version: z.uuid(),
	status: z.enum([
		"trying",
		"adopted",
		"questioning",
		"retired"
	]),
	current: principleContentSchema,
	versions: z.array(principleVersionSchema).min(1),
	updatedAt: z.number().int().nonnegative()
}).strict().superRefine((record, context) => {
	if (record.updatedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "principle updatedAt precedes createdAt"
	});
	for (const [index, version] of record.versions.entries()) {
		const previous = record.versions[index - 1];
		if (version.number !== index + 1) context.addIssue({
			code: "custom",
			message: "principle versions are not contiguous"
		});
		if (version.createdAt < record.createdAt || previous !== void 0 && version.createdAt < previous.createdAt) context.addIssue({
			code: "custom",
			message: "principle version timestamps are not monotonic"
		});
	}
	const current = record.versions.at(-1);
	if (current !== void 0 && (JSON.stringify(record.current) !== JSON.stringify(current.content) || record.status !== current.content.status || record.updatedAt !== current.createdAt)) context.addIssue({
		code: "custom",
		message: "principle current state differs from its latest version"
	});
});
/** Version-one encrypted principle proposal payload. Accepted state is derived from principle history. */
const storedPrincipleProposalSchema = commonSchema.extend({
	recordType: z.literal("principle-proposal"),
	version: z.uuid(),
	status: z.enum(["proposed", "rejected"]),
	targetPrincipleId: z.uuid().nullable(),
	targetVersion: z.uuid().nullable(),
	content: principleContentSchema,
	sourceContemplationId: z.uuid(),
	updatedAt: z.number().int().nonnegative(),
	rejectedAt: z.number().int().nonnegative().nullable()
}).strict().superRefine((record, context) => {
	if (record.updatedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "principle proposal updatedAt precedes createdAt"
	});
	if (record.targetPrincipleId === null !== (record.targetVersion === null)) context.addIssue({
		code: "custom",
		message: "principle proposal target is incomplete"
	});
	if (record.status === "proposed" && record.rejectedAt !== null) context.addIssue({
		code: "custom",
		message: "open principle proposal carries rejection time"
	});
	if (record.status === "rejected" && (record.rejectedAt === null || record.rejectedAt < record.createdAt || record.updatedAt !== record.rejectedAt)) context.addIssue({
		code: "custom",
		message: "rejected principle proposal has invalid rejection time"
	});
});
const experimentObservationSchema = z.object({
	id: z.uuid(),
	happened: z.string(),
	action: z.string(),
	observation: z.string().min(1),
	mood: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(5),
		z.null()
	]),
	energy: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(5),
		z.null()
	]),
	stamp: stampSchema,
	createdAt: z.number().int().nonnegative()
}).strict();
/** Version-one encrypted reality experiment with append-only observations. */
const storedExperimentSchema = commonSchema.extend({
	recordType: z.literal("experiment"),
	version: z.uuid(),
	title: z.string().min(1),
	hypothesis: z.string(),
	action: z.string().min(1),
	reviewStamp: stampSchema.nullable(),
	status: z.enum([
		"proposed",
		"trying",
		"observed",
		"revised",
		"stopped"
	]),
	result: z.string(),
	judgment: z.string(),
	sourceMessageId: z.string().min(1).nullable(),
	evidenceQuote: z.string(),
	observations: z.array(experimentObservationSchema),
	createdStamp: stampSchema,
	startedAt: z.number().int().nonnegative().nullable(),
	stoppedAt: z.number().int().nonnegative().nullable(),
	updatedAt: z.number().int().nonnegative()
}).strict().superRefine((record, context) => {
	if (record.updatedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "experiment updatedAt precedes createdAt"
	});
	if (record.sourceMessageId === null !== (record.evidenceQuote.length === 0)) context.addIssue({
		code: "custom",
		message: "experiment evidence source is incomplete"
	});
	if (record.startedAt !== null && record.startedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "experiment start precedes creation"
	});
	const observationIds = /* @__PURE__ */ new Set();
	let previousCreatedAt = record.createdAt;
	for (const observation of record.observations) {
		if (observationIds.has(observation.id)) context.addIssue({
			code: "custom",
			message: "experiment observation ids are duplicated"
		});
		if (observation.createdAt < previousCreatedAt || observation.createdAt > record.updatedAt) context.addIssue({
			code: "custom",
			message: "experiment observation timestamps are invalid"
		});
		observationIds.add(observation.id);
		previousCreatedAt = observation.createdAt;
	}
	if (record.status === "proposed" && (record.startedAt !== null || record.observations.length > 0 || record.result.length > 0 || record.judgment.length > 0 || record.stoppedAt !== null)) context.addIssue({
		code: "custom",
		message: "proposed experiment carries progress state"
	});
	if (record.status === "trying" && (record.startedAt === null || record.stoppedAt !== null)) context.addIssue({
		code: "custom",
		message: "trying experiment has invalid lifecycle state"
	});
	const latest = record.observations.at(-1);
	if (record.status === "observed" && (record.startedAt === null || latest === void 0 || record.result !== latest.observation || record.reviewStamp !== null || record.stoppedAt !== null)) context.addIssue({
		code: "custom",
		message: "observed experiment has invalid observation state"
	});
	if (record.status === "revised" && (record.startedAt === null || latest === void 0 || record.judgment.trim().length === 0 || record.stoppedAt !== null)) context.addIssue({
		code: "custom",
		message: "revised experiment has invalid judgment state"
	});
	if (record.status === "stopped") {
		if (record.reviewStamp !== null || record.stoppedAt === null || record.stoppedAt < record.createdAt || record.updatedAt !== record.stoppedAt) context.addIssue({
			code: "custom",
			message: "stopped experiment has invalid stop time"
		});
	} else if (record.stoppedAt !== null) context.addIssue({
		code: "custom",
		message: "active experiment carries stop time"
	});
});
const openQuestionSourceSchema = z.discriminatedUnion("kind", [z.object({
	kind: z.literal("message"),
	messageId: z.string().min(1),
	evidenceQuote: z.string().min(1)
}).strict(), z.object({
	kind: z.literal("journal"),
	journalId: z.uuid(),
	journalVersion: z.uuid(),
	evidenceQuote: z.string().min(1)
}).strict()]);
const openQuestionTransitionSchema = z.object({
	id: z.uuid(),
	status: z.enum([
		"open",
		"resolved",
		"dismissed"
	]),
	stamp: stampSchema,
	createdAt: z.number().int().nonnegative()
}).strict();
/** Version-one encrypted open question with append-only lifecycle transitions. */
const storedOpenQuestionSchema = commonSchema.extend({
	recordType: z.literal("open-question"),
	version: z.uuid(),
	question: z.string().min(1),
	status: z.enum([
		"open",
		"resolved",
		"dismissed"
	]),
	source: openQuestionSourceSchema.nullable(),
	transitions: z.array(openQuestionTransitionSchema).min(1),
	createdStamp: stampSchema,
	updatedAt: z.number().int().nonnegative()
}).strict().superRefine((record, context) => {
	if (record.updatedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "open question updatedAt precedes createdAt"
	});
	const first = record.transitions[0];
	if (first?.status !== "open" || first.createdAt !== record.createdAt || JSON.stringify(first.stamp) !== JSON.stringify(record.createdStamp)) context.addIssue({
		code: "custom",
		message: "open question has invalid creation transition"
	});
	const transitionIds = /* @__PURE__ */ new Set();
	let previousStatus;
	let previousCreatedAt = record.createdAt;
	for (const transition of record.transitions) {
		if (transitionIds.has(transition.id)) context.addIssue({
			code: "custom",
			message: "open question transition ids are duplicated"
		});
		transitionIds.add(transition.id);
		if (transition.createdAt < previousCreatedAt || transition.createdAt > record.updatedAt) context.addIssue({
			code: "custom",
			message: "open question transition timestamps are not monotonic"
		});
		if (transition.status === previousStatus) context.addIssue({
			code: "custom",
			message: "open question repeats a lifecycle transition"
		});
		previousStatus = transition.status;
		previousCreatedAt = transition.createdAt;
	}
	if (record.transitions.at(-1)?.status !== record.status) context.addIssue({
		code: "custom",
		message: "open question status differs from its latest transition"
	});
});
const currentPeriodReviewSourceSchema = z.object({
	id: z.uuid(),
	sourceType: z.enum([
		"checkin",
		"journal",
		"concern",
		"contemplation",
		"principle",
		"experiment",
		"open-question"
	]),
	fingerprint: z.string().regex(/^[0-9a-f]{64}$/u),
	localDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/u)).min(1)
}).strict();
const legacyPeriodReviewSourceSchema = z.object({
	id: z.uuid(),
	sourceType: z.literal("legacy-original"),
	legacyType: z.string().min(1).max(64),
	fingerprint: z.string().regex(/^[0-9a-f]{64}$/u),
	localDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/u)).min(1)
}).strict();
const periodReviewSourceSchema = z.discriminatedUnion("sourceType", [currentPeriodReviewSourceSchema, legacyPeriodReviewSourceSchema]).superRefine((source, context) => {
	if (new Set(source.localDates).size !== source.localDates.length) context.addIssue({
		code: "custom",
		message: "period review source dates are duplicated"
	});
	if ([...source.localDates].sort().some((value, index) => value !== source.localDates[index])) context.addIssue({
		code: "custom",
		message: "period review source dates are not ordered"
	});
});
/** Version-one encrypted period review with authenticated source snapshots. */
const storedPeriodReviewSchema = commonSchema.extend({
	recordType: z.literal("period-review"),
	version: z.uuid(),
	periodType: z.enum([
		"week",
		"month",
		"year"
	]),
	startStamp: stampSchema,
	endStamp: stampSchema,
	status: z.enum([
		"proposed",
		"saved",
		"archived"
	]),
	content: z.string().min(1),
	sources: z.array(periodReviewSourceSchema).min(1),
	sourceHash: z.string().regex(/^[0-9a-f]{64}$/u),
	updatedAt: z.number().int().nonnegative()
}).strict().superRefine((record, context) => {
	if (record.updatedAt < record.createdAt) context.addIssue({
		code: "custom",
		message: "period review updatedAt precedes createdAt"
	});
	if (record.startStamp.localDate > record.endStamp.localDate) context.addIssue({
		code: "custom",
		message: "period review date range is reversed"
	});
	if (record.startStamp.timeZone !== record.endStamp.timeZone) context.addIssue({
		code: "custom",
		message: "period review range mixes time zones"
	});
	const sourceKeys = record.sources.map((source) => `${source.sourceType}:${source.id}`);
	if (new Set(sourceKeys).size !== sourceKeys.length) context.addIssue({
		code: "custom",
		message: "period review sources are duplicated"
	});
	if ([...sourceKeys].sort().some((value, index) => value !== sourceKeys[index])) context.addIssue({
		code: "custom",
		message: "period review sources are not ordered"
	});
	for (const source of record.sources) if (source.localDates.some((date) => date < record.startStamp.localDate || date > record.endStamp.localDate)) context.addIssue({
		code: "custom",
		message: "period review source date is outside its range"
	});
});
/**
* Decode one authenticated plaintext record without trusting its producer.
* @param value - Plaintext returned after vault authentication.
* @returns A strictly validated record from the complete reflection vocabulary.
*/
function decodeStoredReflection(value) {
	const discriminator = z.looseObject({ recordType: z.string() }).parse(value).recordType;
	if (discriminator === "checkin") return storedCheckinSchema.parse(value);
	if (discriminator === "journal") return storedJournalSchema.parse(value);
	if (discriminator === "concern") return storedConcernSchema.parse(value);
	if (discriminator === "contemplation") return storedContemplationSchema.parse(value);
	if (discriminator === "principle") return storedPrincipleSchema.parse(value);
	if (discriminator === "principle-proposal") return storedPrincipleProposalSchema.parse(value);
	if (discriminator === "experiment") return storedExperimentSchema.parse(value);
	if (discriminator === "open-question") return storedOpenQuestionSchema.parse(value);
	if (discriminator === "period-review") return storedPeriodReviewSchema.parse(value);
	throw new TypeError(`unknown Mind Garden reflection record type '${discriminator}'`);
}
//#endregion
//#region lib/types/index.js
/**
* Encrypted reflections, governed principles, calendar projections, trends, and authorized context.
* @module @deepseek-ai/dsh-mind-garden/reflection
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Cordis plugin name. */
const name = "mind-garden-reflection";
const DEFAULT_MAX_TITLE_BYTES = 512;
const DEFAULT_MAX_BODY_BYTES = 64 * 1024;
const DEFAULT_MAX_CONCERN_BYTES = 64 * 1024;
const DEFAULT_MAX_CONTEMPLATION_BYTES = 128 * 1024;
const DEFAULT_MAX_EMOTION_WORD_BYTES = 64;
const DEFAULT_MAX_TIME_ZONE_BYTES = 128;
const DEFAULT_MAX_QUERY_BYTES = 8 * 1024;
const DEFAULT_MAX_CONTEXT_JOURNALS = 3;
const DEFAULT_MAX_CONTEXT_BODY_BYTES = 1600;
const DEFAULT_MAX_CONCERNS_PER_LIST = 100;
const DEFAULT_MAX_CONTEMPLATIONS_PER_LIST = 100;
const DEFAULT_MAX_PRINCIPLE_FIELD_BYTES = 16 * 1024;
const DEFAULT_MAX_PRINCIPLE_ITEMS = 50;
const DEFAULT_MAX_PRINCIPLE_VERSIONS = 100;
const DEFAULT_MAX_PRINCIPLE_PROPOSALS_PER_LIST = 100;
const DEFAULT_MAX_PRINCIPLES_PER_LIST = 100;
const DEFAULT_MAX_EXPERIMENT_FIELD_BYTES = 16 * 1024;
const DEFAULT_MAX_EXPERIMENT_OBSERVATIONS = 100;
const DEFAULT_MAX_EXPERIMENTS_PER_LIST = 100;
const DEFAULT_MAX_OPEN_QUESTION_BYTES = 16 * 1024;
const DEFAULT_MAX_OPEN_QUESTION_TRANSITIONS = 100;
const DEFAULT_MAX_OPEN_QUESTIONS_PER_LIST = 100;
const DEFAULT_MAX_CONTEXT_OPEN_QUESTIONS = 3;
const DEFAULT_MAX_PERIOD_REVIEW_CONTENT_BYTES = 128 * 1024;
const DEFAULT_MAX_PERIOD_REVIEW_MATERIAL_ITEM_BYTES = 8 * 1024;
const DEFAULT_MAX_PERIOD_REVIEW_SOURCES = 200;
const DEFAULT_MAX_PERIOD_REVIEWS_PER_LIST = 100;
const MAX_SOURCE_SESSION_ID_BYTES = 1024;
const MAX_EMOTION_WORDS = 3;
var ReflectionBusinessError = class extends Error {
	failure;
	constructor(failure) {
		super(failure.code);
		this.failure = failure;
	}
};
var CorruptReflectionStoreError = class extends Error {};
function positiveSafeInteger(value, field) {
	if (!Number.isSafeInteger(value) || value < 1) throw new TypeError(`mind-garden-reflection: ${field} must be a positive safe integer`);
	return value;
}
function resolveConfig(config) {
	return {
		maxTitleBytes: positiveSafeInteger(config.maxTitleBytes ?? DEFAULT_MAX_TITLE_BYTES, "maxTitleBytes"),
		maxBodyBytes: positiveSafeInteger(config.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES, "maxBodyBytes"),
		maxConcernBytes: positiveSafeInteger(config.maxConcernBytes ?? DEFAULT_MAX_CONCERN_BYTES, "maxConcernBytes"),
		maxContemplationBytes: positiveSafeInteger(config.maxContemplationBytes ?? DEFAULT_MAX_CONTEMPLATION_BYTES, "maxContemplationBytes"),
		maxEmotionWordBytes: positiveSafeInteger(config.maxEmotionWordBytes ?? DEFAULT_MAX_EMOTION_WORD_BYTES, "maxEmotionWordBytes"),
		maxTimeZoneBytes: positiveSafeInteger(config.maxTimeZoneBytes ?? DEFAULT_MAX_TIME_ZONE_BYTES, "maxTimeZoneBytes"),
		maxQueryBytes: positiveSafeInteger(config.maxQueryBytes ?? DEFAULT_MAX_QUERY_BYTES, "maxQueryBytes"),
		maxContextJournals: positiveSafeInteger(config.maxContextJournals ?? DEFAULT_MAX_CONTEXT_JOURNALS, "maxContextJournals"),
		maxContextBodyBytes: positiveSafeInteger(config.maxContextBodyBytes ?? DEFAULT_MAX_CONTEXT_BODY_BYTES, "maxContextBodyBytes"),
		maxConcernsPerList: positiveSafeInteger(config.maxConcernsPerList ?? DEFAULT_MAX_CONCERNS_PER_LIST, "maxConcernsPerList"),
		maxContemplationsPerList: positiveSafeInteger(config.maxContemplationsPerList ?? DEFAULT_MAX_CONTEMPLATIONS_PER_LIST, "maxContemplationsPerList"),
		maxPrincipleFieldBytes: positiveSafeInteger(config.maxPrincipleFieldBytes ?? DEFAULT_MAX_PRINCIPLE_FIELD_BYTES, "maxPrincipleFieldBytes"),
		maxPrincipleItems: positiveSafeInteger(config.maxPrincipleItems ?? DEFAULT_MAX_PRINCIPLE_ITEMS, "maxPrincipleItems"),
		maxPrincipleVersions: positiveSafeInteger(config.maxPrincipleVersions ?? DEFAULT_MAX_PRINCIPLE_VERSIONS, "maxPrincipleVersions"),
		maxPrincipleProposalsPerList: positiveSafeInteger(config.maxPrincipleProposalsPerList ?? DEFAULT_MAX_PRINCIPLE_PROPOSALS_PER_LIST, "maxPrincipleProposalsPerList"),
		maxPrinciplesPerList: positiveSafeInteger(config.maxPrinciplesPerList ?? DEFAULT_MAX_PRINCIPLES_PER_LIST, "maxPrinciplesPerList"),
		maxExperimentFieldBytes: positiveSafeInteger(config.maxExperimentFieldBytes ?? DEFAULT_MAX_EXPERIMENT_FIELD_BYTES, "maxExperimentFieldBytes"),
		maxExperimentObservations: positiveSafeInteger(config.maxExperimentObservations ?? DEFAULT_MAX_EXPERIMENT_OBSERVATIONS, "maxExperimentObservations"),
		maxExperimentsPerList: positiveSafeInteger(config.maxExperimentsPerList ?? DEFAULT_MAX_EXPERIMENTS_PER_LIST, "maxExperimentsPerList"),
		maxOpenQuestionBytes: positiveSafeInteger(config.maxOpenQuestionBytes ?? DEFAULT_MAX_OPEN_QUESTION_BYTES, "maxOpenQuestionBytes"),
		maxOpenQuestionTransitions: positiveSafeInteger(config.maxOpenQuestionTransitions ?? DEFAULT_MAX_OPEN_QUESTION_TRANSITIONS, "maxOpenQuestionTransitions"),
		maxOpenQuestionsPerList: positiveSafeInteger(config.maxOpenQuestionsPerList ?? DEFAULT_MAX_OPEN_QUESTIONS_PER_LIST, "maxOpenQuestionsPerList"),
		maxContextOpenQuestions: positiveSafeInteger(config.maxContextOpenQuestions ?? DEFAULT_MAX_CONTEXT_OPEN_QUESTIONS, "maxContextOpenQuestions"),
		maxPeriodReviewContentBytes: positiveSafeInteger(config.maxPeriodReviewContentBytes ?? DEFAULT_MAX_PERIOD_REVIEW_CONTENT_BYTES, "maxPeriodReviewContentBytes"),
		maxPeriodReviewMaterialItemBytes: positiveSafeInteger(config.maxPeriodReviewMaterialItemBytes ?? DEFAULT_MAX_PERIOD_REVIEW_MATERIAL_ITEM_BYTES, "maxPeriodReviewMaterialItemBytes"),
		maxPeriodReviewSources: positiveSafeInteger(config.maxPeriodReviewSources ?? DEFAULT_MAX_PERIOD_REVIEW_SOURCES, "maxPeriodReviewSources"),
		maxPeriodReviewsPerList: positiveSafeInteger(config.maxPeriodReviewsPerList ?? DEFAULT_MAX_PERIOD_REVIEWS_PER_LIST, "maxPeriodReviewsPerList")
	};
}
function success(value) {
	return {
		ok: true,
		value
	};
}
function rejected(error) {
	return {
		ok: false,
		error
	};
}
function reflectionId(value) {
	return value;
}
function reflectionVersion(value) {
	return value;
}
function moodBand(value) {
	return [
		"heavy",
		"low",
		"steady",
		"light",
		"bright"
	][value + 2];
}
function energyBand(value) {
	return [
		"very-low",
		"low",
		"steady",
		"high",
		"very-high"
	][value - 1];
}
function snapshotStamp(stamp) {
	return Object.freeze({ ...stamp });
}
function snapshotCheckin(record) {
	return Object.freeze({
		type: "checkin",
		id: reflectionId(record.id),
		stamp: snapshotStamp(record.stamp),
		mood: record.mood,
		moodBand: moodBand(record.mood),
		energy: record.energy,
		energyBand: energyBand(record.energy),
		emotionWords: Object.freeze([...record.emotionWords]),
		phase: record.phase,
		sourceSessionId: record.sourceSessionId,
		createdAt: record.createdAt
	});
}
function snapshotJournal(record) {
	return Object.freeze({
		type: "journal",
		id: reflectionId(record.id),
		version: reflectionVersion(record.version),
		stamp: snapshotStamp(record.stamp),
		title: record.title,
		body: record.body,
		allowRetrieval: record.allowRetrieval,
		sourceSessionId: record.sourceSessionId,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	});
}
function snapshotConcern(record) {
	return Object.freeze({
		type: "concern",
		id: reflectionId(record.id),
		version: reflectionVersion(record.version),
		content: record.content,
		status: record.status,
		createdStamp: snapshotStamp(record.createdStamp),
		reminder: record.reminder === null ? null : snapshotStamp(record.reminder),
		convertedJournalId: record.convertedJournalId === null ? null : reflectionId(record.convertedJournalId),
		sourceSessionId: record.sourceSessionId,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	});
}
function snapshotContemplation(record) {
	return Object.freeze({
		type: "contemplation",
		id: reflectionId(record.id),
		version: reflectionVersion(record.version),
		markdown: record.markdown,
		status: record.status,
		sourceSessionId: record.sourceSessionId,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
		confirmedAt: record.confirmedAt
	});
}
function snapshotPrincipleContent(content) {
	return Object.freeze({
		...content,
		supportingExperiences: Object.freeze(content.supportingExperiences.map((item) => Object.freeze({
			summary: item.summary,
			...item.sourceContemplationId === null ? {} : { sourceContemplationId: reflectionId(item.sourceContemplationId) }
		}))),
		appliesTo: Object.freeze([...content.appliesTo]),
		notAppliesTo: Object.freeze([...content.notAppliesTo])
	});
}
function snapshotPrincipleVersion(version) {
	return Object.freeze({
		number: version.number,
		content: snapshotPrincipleContent(version.content),
		sourceProposalId: version.sourceProposalId === null ? null : reflectionId(version.sourceProposalId),
		sourceContemplationId: version.sourceContemplationId === null ? null : reflectionId(version.sourceContemplationId),
		stamp: snapshotStamp(version.stamp),
		createdAt: version.createdAt
	});
}
function snapshotPrinciple(record) {
	return Object.freeze({
		type: "principle",
		id: reflectionId(record.id),
		version: reflectionVersion(record.version),
		status: record.status,
		current: snapshotPrincipleContent(record.current),
		versions: Object.freeze(record.versions.map(snapshotPrincipleVersion)),
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	});
}
function acceptedPrincipleProposal(records, proposalId) {
	for (const record of records) {
		if (record.recordType !== "principle") continue;
		const version = record.versions.find((item) => item.sourceProposalId === proposalId);
		if (version !== void 0) return {
			principle: record,
			version
		};
	}
	return null;
}
function snapshotPrincipleProposal(record, accepted) {
	return Object.freeze({
		type: "principle-proposal",
		id: reflectionId(record.id),
		version: reflectionVersion(record.version),
		status: accepted === null ? record.status : "accepted",
		targetPrincipleId: record.targetPrincipleId === null ? null : reflectionId(record.targetPrincipleId),
		targetVersion: record.targetVersion === null ? null : reflectionVersion(record.targetVersion),
		content: snapshotPrincipleContent(record.content),
		sourceContemplationId: reflectionId(record.sourceContemplationId),
		sourceSessionId: record.sourceSessionId,
		resultingPrincipleId: accepted === null ? null : reflectionId(accepted.principle.id),
		createdAt: record.createdAt,
		updatedAt: accepted?.version.createdAt ?? record.updatedAt,
		rejectedAt: record.rejectedAt
	});
}
function snapshotExperimentObservation(observation) {
	return Object.freeze({
		id: reflectionId(observation.id),
		happened: observation.happened,
		action: observation.action,
		observation: observation.observation,
		mood: observation.mood,
		energy: observation.energy,
		stamp: snapshotStamp(observation.stamp),
		createdAt: observation.createdAt
	});
}
function snapshotExperiment(record) {
	return Object.freeze({
		type: "experiment",
		id: reflectionId(record.id),
		version: reflectionVersion(record.version),
		title: record.title,
		hypothesis: record.hypothesis,
		action: record.action,
		reviewStamp: record.reviewStamp === null ? null : snapshotStamp(record.reviewStamp),
		status: record.status,
		result: record.result,
		judgment: record.judgment,
		sourceSessionId: record.sourceSessionId,
		sourceMessageId: record.sourceMessageId,
		evidenceQuote: record.evidenceQuote,
		observations: Object.freeze(record.observations.map(snapshotExperimentObservation)),
		createdStamp: snapshotStamp(record.createdStamp),
		startedAt: record.startedAt,
		stoppedAt: record.stoppedAt,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	});
}
function snapshotOpenQuestionTransition(transition) {
	return Object.freeze({
		id: reflectionId(transition.id),
		status: transition.status,
		stamp: snapshotStamp(transition.stamp),
		createdAt: transition.createdAt
	});
}
function snapshotOpenQuestion(record, records) {
	let source = null;
	if (record.source?.kind === "message") source = Object.freeze({
		kind: "message",
		messageId: record.source.messageId,
		evidenceQuote: record.source.evidenceQuote
	});
	else if (record.source?.kind === "journal") {
		const journalSource = record.source;
		const journal = records.find((item) => item.recordType === "journal" && item.id === journalSource.journalId);
		source = Object.freeze({
			kind: "journal",
			journalId: reflectionId(journalSource.journalId),
			journalVersion: reflectionVersion(journalSource.journalVersion),
			evidenceQuote: journalSource.evidenceQuote,
			state: journal === void 0 ? "missing" : journal.version === journalSource.journalVersion ? "current" : "changed"
		});
	}
	return Object.freeze({
		type: "open-question",
		id: reflectionId(record.id),
		version: reflectionVersion(record.version),
		question: record.question,
		status: record.status,
		source,
		transitions: Object.freeze(record.transitions.map(snapshotOpenQuestionTransition)),
		createdStamp: snapshotStamp(record.createdStamp),
		sourceSessionId: record.sourceSessionId,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	});
}
function periodReviewFingerprint(record) {
	return createHash("sha256").update(JSON.stringify(record)).digest("hex");
}
function periodReviewSourceHash(sources) {
	return createHash("sha256").update(JSON.stringify(sources)).digest("hex");
}
function snapshotPeriodReviewSource(source) {
	return Object.freeze({
		id: reflectionId(source.id),
		sourceType: source.sourceType,
		..."legacyType" in source ? { legacyType: source.legacyType } : {},
		fingerprint: source.fingerprint,
		localDates: Object.freeze([...source.localDates])
	});
}
function periodReviewStaleSources(review, records) {
	const current = new Map(records.flatMap((record) => {
		if (record.recordType === "principle-proposal" || record.recordType === "period-review") return [];
		return [[record.id, record]];
	}));
	return review.sources.flatMap((source) => {
		if (source.sourceType === "legacy-original") return [];
		const record = current.get(source.id);
		if (record === void 0 || record.recordType !== source.sourceType) return [{
			id: reflectionId(source.id),
			reason: "missing"
		}];
		if (periodReviewFingerprint(record) !== source.fingerprint) return [{
			id: reflectionId(source.id),
			reason: "changed"
		}];
		return [];
	});
}
function snapshotPeriodReview(record, records) {
	const staleSources = periodReviewStaleSources(record, records);
	return Object.freeze({
		type: "period-review",
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
		staleSources: Object.freeze(staleSources.map((source) => Object.freeze(source))),
		sourceSessionId: record.sourceSessionId,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	});
}
function localDateAt(timestamp, timeZone) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(timestamp));
	const values = new Map(parts.map((part) => [part.type, part.value]));
	return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}
function compareRecords(left, right) {
	return left.createdAt - right.createdAt || left.id.localeCompare(right.id);
}
function calendarProjections(record) {
	if (record.recordType === "contemplation" || record.recordType === "principle-proposal" || record.recordType === "period-review") return [];
	if (record.recordType === "principle") return record.versions.map((version) => ({
		kind: "principle",
		date: version.stamp.localDate,
		createdAt: version.createdAt,
		id: `${record.id}:v${version.number}`,
		principleId: record.id,
		version
	}));
	if (record.recordType === "experiment") {
		const observations = record.observations.map((observation) => ({
			kind: "experiment-observation",
			date: observation.stamp.localDate,
			createdAt: observation.createdAt,
			id: observation.id,
			experimentId: record.id,
			observation
		}));
		if (record.status === "stopped") return observations;
		const stamp = record.reviewStamp ?? record.createdStamp;
		return [{
			kind: "experiment-review",
			date: stamp.localDate,
			createdAt: record.updatedAt,
			id: `${record.id}:review`,
			stamp,
			experiment: record
		}, ...observations];
	}
	if (record.recordType === "open-question") return record.transitions.map((transition) => ({
		kind: "open-question",
		date: transition.stamp.localDate,
		createdAt: transition.createdAt,
		id: transition.id,
		openQuestionId: record.id,
		question: record.question,
		transition
	}));
	if (record.recordType === "concern") {
		if (record.status !== "active" || record.reminder === null) return [];
		return [{
			kind: "reflection",
			date: record.reminder.localDate,
			stamp: record.reminder,
			createdAt: record.updatedAt,
			id: record.id,
			record
		}];
	}
	return [{
		kind: "reflection",
		date: record.stamp.localDate,
		stamp: record.stamp,
		createdAt: record.createdAt,
		id: record.id,
		record
	}];
}
function snapshotCalendarEvent(projection) {
	if (projection.kind === "principle") {
		const event = {
			type: "principle",
			principleId: reflectionId(projection.principleId),
			version: snapshotPrincipleVersion(projection.version)
		};
		return Object.freeze(event);
	}
	if (projection.kind === "experiment-review") {
		const event = {
			type: "experiment-review",
			stamp: snapshotStamp(projection.stamp),
			experiment: snapshotExperiment(projection.experiment)
		};
		return Object.freeze(event);
	}
	if (projection.kind === "experiment-observation") {
		const event = {
			type: "experiment-observation",
			experimentId: reflectionId(projection.experimentId),
			observation: snapshotExperimentObservation(projection.observation)
		};
		return Object.freeze(event);
	}
	if (projection.kind === "open-question") {
		const event = {
			type: "open-question",
			openQuestionId: reflectionId(projection.openQuestionId),
			question: projection.question,
			transition: snapshotOpenQuestionTransition(projection.transition)
		};
		return Object.freeze(event);
	}
	if (projection.record.recordType === "checkin") return snapshotCheckin(projection.record);
	if (projection.record.recordType === "journal") return snapshotJournal(projection.record);
	const reminder = {
		type: "concern-reminder",
		stamp: snapshotStamp(projection.stamp),
		concern: snapshotConcern(projection.record)
	};
	return Object.freeze(reminder);
}
function compareCalendarProjections(left, right) {
	return left.createdAt - right.createdAt || left.id.localeCompare(right.id);
}
function compareConcerns(left, right) {
	if (left.reminder === null && right.reminder !== null) return 1;
	if (left.reminder !== null && right.reminder === null) return -1;
	return (left.reminder?.localDate ?? "").localeCompare(right.reminder?.localDate ?? "") || right.updatedAt - left.updatedAt || left.id.localeCompare(right.id);
}
function compareOpenQuestions(left, right) {
	if (left.status === "open" && right.status !== "open") return -1;
	if (left.status !== "open" && right.status === "open") return 1;
	if (left.status === "open") return left.createdAt - right.createdAt || left.id.localeCompare(right.id);
	return right.updatedAt - left.updatedAt || left.id.localeCompare(right.id);
}
function normalizedBigrams(value) {
	const normalized = value.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
	if (normalized.length < 2) return new Set(normalized.length === 0 ? [] : [normalized]);
	return new Set(Array.from({ length: normalized.length - 1 }, (_, index) => normalized.slice(index, index + 2)));
}
function truncateUtf8(value, maxBytes) {
	if (Buffer.byteLength(value, "utf8") <= maxBytes) return value;
	let result = "";
	for (const character of value) {
		if (Buffer.byteLength(result + character, "utf8") > maxBytes) break;
		result += character;
	}
	return result;
}
function subtractDays(value, days) {
	const date = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() - days);
	return date.toISOString().slice(0, 10);
}
function isMindGardenVaultError(error) {
	const codes = new Set([
		"authentication-failed",
		"corrupt-record",
		"corrupt-state",
		"invalid-key",
		"invalid-record-id",
		"invalid-value",
		"key-mismatch",
		"locked",
		"record-too-large",
		"rotation-unavailable"
	]);
	return error instanceof MindGardenVaultError || typeof error === "object" && error !== null && typeof error.code === "string" && codes.has(error.code);
}
/** Encrypted reflection records and deterministic calendar projections for Mind Garden. */
let MindGardenReflectionService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _createCheckin_decorators;
	let _createJournal_decorators;
	let _updateJournal_decorators;
	let _deleteJournal_decorators;
	let _createConcern_decorators;
	let _listConcerns_decorators;
	let _updateConcern_decorators;
	let _completeConcern_decorators;
	let _convertConcern_decorators;
	let _createContemplation_decorators;
	let _listContemplations_decorators;
	let _updateContemplation_decorators;
	let _confirmContemplation_decorators;
	let _deleteContemplation_decorators;
	let _proposePrinciple_decorators;
	let _listPrincipleProposals_decorators;
	let _acceptPrincipleProposal_decorators;
	let _rejectPrincipleProposal_decorators;
	let _listPrinciples_decorators;
	let _revisePrinciple_decorators;
	let _createExperiment_decorators;
	let _listExperiments_decorators;
	let _startExperiment_decorators;
	let _observeExperiment_decorators;
	let _reviseExperiment_decorators;
	let _scheduleExperiment_decorators;
	let _stopExperiment_decorators;
	let _createOpenQuestion_decorators;
	let _listOpenQuestions_decorators;
	let _updateOpenQuestion_decorators;
	let _openQuestionContext_decorators;
	let _periodReviewMaterial_decorators;
	let _createPeriodReview_decorators;
	let _listPeriodReviews_decorators;
	let _updatePeriodReview_decorators;
	let _month_decorators;
	let _day_decorators;
	let _trend_decorators;
	let _authorizedContext_decorators;
	return class MindGardenReflectionService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_createCheckin_decorators = [Remote("createCheckin")];
			_createJournal_decorators = [Remote("createJournal")];
			_updateJournal_decorators = [Remote("updateJournal")];
			_deleteJournal_decorators = [Remote("deleteJournal")];
			_createConcern_decorators = [Remote("createConcern")];
			_listConcerns_decorators = [Remote("listConcerns")];
			_updateConcern_decorators = [Remote("updateConcern")];
			_completeConcern_decorators = [Remote("completeConcern")];
			_convertConcern_decorators = [Remote("convertConcern")];
			_createContemplation_decorators = [Remote("createContemplation")];
			_listContemplations_decorators = [Remote("listContemplations")];
			_updateContemplation_decorators = [Remote("updateContemplation")];
			_confirmContemplation_decorators = [Remote("confirmContemplation")];
			_deleteContemplation_decorators = [Remote("deleteContemplation")];
			_proposePrinciple_decorators = [Remote("proposePrinciple")];
			_listPrincipleProposals_decorators = [Remote("listPrincipleProposals")];
			_acceptPrincipleProposal_decorators = [Remote("acceptPrincipleProposal")];
			_rejectPrincipleProposal_decorators = [Remote("rejectPrincipleProposal")];
			_listPrinciples_decorators = [Remote("listPrinciples")];
			_revisePrinciple_decorators = [Remote("revisePrinciple")];
			_createExperiment_decorators = [Remote("createExperiment")];
			_listExperiments_decorators = [Remote("listExperiments")];
			_startExperiment_decorators = [Remote("startExperiment")];
			_observeExperiment_decorators = [Remote("observeExperiment")];
			_reviseExperiment_decorators = [Remote("reviseExperiment")];
			_scheduleExperiment_decorators = [Remote("scheduleExperiment")];
			_stopExperiment_decorators = [Remote("stopExperiment")];
			_createOpenQuestion_decorators = [Remote("createOpenQuestion")];
			_listOpenQuestions_decorators = [Remote("listOpenQuestions")];
			_updateOpenQuestion_decorators = [Remote("updateOpenQuestion")];
			_openQuestionContext_decorators = [Remote("openQuestionContext")];
			_periodReviewMaterial_decorators = [Remote("periodReviewMaterial")];
			_createPeriodReview_decorators = [Remote("createPeriodReview")];
			_listPeriodReviews_decorators = [Remote("listPeriodReviews")];
			_updatePeriodReview_decorators = [Remote("updatePeriodReview")];
			_month_decorators = [Remote("month")];
			_day_decorators = [Remote("day")];
			_trend_decorators = [Remote("trend")];
			_authorizedContext_decorators = [Remote("authorizedContext")];
			__esDecorate(this, null, _createCheckin_decorators, {
				kind: "method",
				name: "createCheckin",
				static: false,
				private: false,
				access: {
					has: (obj) => "createCheckin" in obj,
					get: (obj) => obj.createCheckin
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _createJournal_decorators, {
				kind: "method",
				name: "createJournal",
				static: false,
				private: false,
				access: {
					has: (obj) => "createJournal" in obj,
					get: (obj) => obj.createJournal
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updateJournal_decorators, {
				kind: "method",
				name: "updateJournal",
				static: false,
				private: false,
				access: {
					has: (obj) => "updateJournal" in obj,
					get: (obj) => obj.updateJournal
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _deleteJournal_decorators, {
				kind: "method",
				name: "deleteJournal",
				static: false,
				private: false,
				access: {
					has: (obj) => "deleteJournal" in obj,
					get: (obj) => obj.deleteJournal
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _createConcern_decorators, {
				kind: "method",
				name: "createConcern",
				static: false,
				private: false,
				access: {
					has: (obj) => "createConcern" in obj,
					get: (obj) => obj.createConcern
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listConcerns_decorators, {
				kind: "method",
				name: "listConcerns",
				static: false,
				private: false,
				access: {
					has: (obj) => "listConcerns" in obj,
					get: (obj) => obj.listConcerns
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updateConcern_decorators, {
				kind: "method",
				name: "updateConcern",
				static: false,
				private: false,
				access: {
					has: (obj) => "updateConcern" in obj,
					get: (obj) => obj.updateConcern
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _completeConcern_decorators, {
				kind: "method",
				name: "completeConcern",
				static: false,
				private: false,
				access: {
					has: (obj) => "completeConcern" in obj,
					get: (obj) => obj.completeConcern
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _convertConcern_decorators, {
				kind: "method",
				name: "convertConcern",
				static: false,
				private: false,
				access: {
					has: (obj) => "convertConcern" in obj,
					get: (obj) => obj.convertConcern
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _createContemplation_decorators, {
				kind: "method",
				name: "createContemplation",
				static: false,
				private: false,
				access: {
					has: (obj) => "createContemplation" in obj,
					get: (obj) => obj.createContemplation
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listContemplations_decorators, {
				kind: "method",
				name: "listContemplations",
				static: false,
				private: false,
				access: {
					has: (obj) => "listContemplations" in obj,
					get: (obj) => obj.listContemplations
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updateContemplation_decorators, {
				kind: "method",
				name: "updateContemplation",
				static: false,
				private: false,
				access: {
					has: (obj) => "updateContemplation" in obj,
					get: (obj) => obj.updateContemplation
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _confirmContemplation_decorators, {
				kind: "method",
				name: "confirmContemplation",
				static: false,
				private: false,
				access: {
					has: (obj) => "confirmContemplation" in obj,
					get: (obj) => obj.confirmContemplation
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _deleteContemplation_decorators, {
				kind: "method",
				name: "deleteContemplation",
				static: false,
				private: false,
				access: {
					has: (obj) => "deleteContemplation" in obj,
					get: (obj) => obj.deleteContemplation
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _proposePrinciple_decorators, {
				kind: "method",
				name: "proposePrinciple",
				static: false,
				private: false,
				access: {
					has: (obj) => "proposePrinciple" in obj,
					get: (obj) => obj.proposePrinciple
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listPrincipleProposals_decorators, {
				kind: "method",
				name: "listPrincipleProposals",
				static: false,
				private: false,
				access: {
					has: (obj) => "listPrincipleProposals" in obj,
					get: (obj) => obj.listPrincipleProposals
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _acceptPrincipleProposal_decorators, {
				kind: "method",
				name: "acceptPrincipleProposal",
				static: false,
				private: false,
				access: {
					has: (obj) => "acceptPrincipleProposal" in obj,
					get: (obj) => obj.acceptPrincipleProposal
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _rejectPrincipleProposal_decorators, {
				kind: "method",
				name: "rejectPrincipleProposal",
				static: false,
				private: false,
				access: {
					has: (obj) => "rejectPrincipleProposal" in obj,
					get: (obj) => obj.rejectPrincipleProposal
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listPrinciples_decorators, {
				kind: "method",
				name: "listPrinciples",
				static: false,
				private: false,
				access: {
					has: (obj) => "listPrinciples" in obj,
					get: (obj) => obj.listPrinciples
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _revisePrinciple_decorators, {
				kind: "method",
				name: "revisePrinciple",
				static: false,
				private: false,
				access: {
					has: (obj) => "revisePrinciple" in obj,
					get: (obj) => obj.revisePrinciple
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _createExperiment_decorators, {
				kind: "method",
				name: "createExperiment",
				static: false,
				private: false,
				access: {
					has: (obj) => "createExperiment" in obj,
					get: (obj) => obj.createExperiment
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listExperiments_decorators, {
				kind: "method",
				name: "listExperiments",
				static: false,
				private: false,
				access: {
					has: (obj) => "listExperiments" in obj,
					get: (obj) => obj.listExperiments
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _startExperiment_decorators, {
				kind: "method",
				name: "startExperiment",
				static: false,
				private: false,
				access: {
					has: (obj) => "startExperiment" in obj,
					get: (obj) => obj.startExperiment
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _observeExperiment_decorators, {
				kind: "method",
				name: "observeExperiment",
				static: false,
				private: false,
				access: {
					has: (obj) => "observeExperiment" in obj,
					get: (obj) => obj.observeExperiment
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _reviseExperiment_decorators, {
				kind: "method",
				name: "reviseExperiment",
				static: false,
				private: false,
				access: {
					has: (obj) => "reviseExperiment" in obj,
					get: (obj) => obj.reviseExperiment
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _scheduleExperiment_decorators, {
				kind: "method",
				name: "scheduleExperiment",
				static: false,
				private: false,
				access: {
					has: (obj) => "scheduleExperiment" in obj,
					get: (obj) => obj.scheduleExperiment
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _stopExperiment_decorators, {
				kind: "method",
				name: "stopExperiment",
				static: false,
				private: false,
				access: {
					has: (obj) => "stopExperiment" in obj,
					get: (obj) => obj.stopExperiment
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _createOpenQuestion_decorators, {
				kind: "method",
				name: "createOpenQuestion",
				static: false,
				private: false,
				access: {
					has: (obj) => "createOpenQuestion" in obj,
					get: (obj) => obj.createOpenQuestion
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listOpenQuestions_decorators, {
				kind: "method",
				name: "listOpenQuestions",
				static: false,
				private: false,
				access: {
					has: (obj) => "listOpenQuestions" in obj,
					get: (obj) => obj.listOpenQuestions
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updateOpenQuestion_decorators, {
				kind: "method",
				name: "updateOpenQuestion",
				static: false,
				private: false,
				access: {
					has: (obj) => "updateOpenQuestion" in obj,
					get: (obj) => obj.updateOpenQuestion
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _openQuestionContext_decorators, {
				kind: "method",
				name: "openQuestionContext",
				static: false,
				private: false,
				access: {
					has: (obj) => "openQuestionContext" in obj,
					get: (obj) => obj.openQuestionContext
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _periodReviewMaterial_decorators, {
				kind: "method",
				name: "periodReviewMaterial",
				static: false,
				private: false,
				access: {
					has: (obj) => "periodReviewMaterial" in obj,
					get: (obj) => obj.periodReviewMaterial
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _createPeriodReview_decorators, {
				kind: "method",
				name: "createPeriodReview",
				static: false,
				private: false,
				access: {
					has: (obj) => "createPeriodReview" in obj,
					get: (obj) => obj.createPeriodReview
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listPeriodReviews_decorators, {
				kind: "method",
				name: "listPeriodReviews",
				static: false,
				private: false,
				access: {
					has: (obj) => "listPeriodReviews" in obj,
					get: (obj) => obj.listPeriodReviews
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updatePeriodReview_decorators, {
				kind: "method",
				name: "updatePeriodReview",
				static: false,
				private: false,
				access: {
					has: (obj) => "updatePeriodReview" in obj,
					get: (obj) => obj.updatePeriodReview
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _month_decorators, {
				kind: "method",
				name: "month",
				static: false,
				private: false,
				access: {
					has: (obj) => "month" in obj,
					get: (obj) => obj.month
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _day_decorators, {
				kind: "method",
				name: "day",
				static: false,
				private: false,
				access: {
					has: (obj) => "day" in obj,
					get: (obj) => obj.day
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _trend_decorators, {
				kind: "method",
				name: "trend",
				static: false,
				private: false,
				access: {
					has: (obj) => "trend" in obj,
					get: (obj) => obj.trend
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _authorizedContext_decorators, {
				kind: "method",
				name: "authorizedContext",
				static: false,
				private: false,
				access: {
					has: (obj) => "authorizedContext" in obj,
					get: (obj) => obj.authorizedContext
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [
			"agents",
			"mindGarden",
			"mindGardenVault"
		];
		/** Loader validation for complete UTF-8 and authorized-context bounds. */
		static Config = s.object({
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
			maxPeriodReviewsPerList: s.number().default(DEFAULT_MAX_PERIOD_REVIEWS_PER_LIST)
		});
		options = __runInitializers(this, _instanceExtraInitializers);
		operationTail = Promise.resolve();
		admissionOpen = true;
		/**
		* Install the Remote service and disposal drain.
		* @param ctx - Host context carrying live Agents, Mind Garden state, and the encrypted vault.
		* @param config - Complete text and authorized-context limits.
		*/
		constructor(ctx, config) {
			super(ctx, "mindGardenReflection");
			this.options = resolveConfig(config);
			ctx.effect(() => async () => {
				this.admissionOpen = false;
				await this.operationTail;
			}, "mind-garden-reflection.drain");
		}
		/**
		* Create one encrypted check-in tied to an explicit civil-date snapshot.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Mood, energy, emotion words, phase, and browser date metadata.
		* @returns The committed check-in or a stable access, validation, or vault failure.
		*/
		createCheckin(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const stamp = this.validateStamp(request.stamp);
					const emotionWords = this.validateEmotionWords(request.emotionWords);
					const now = Date.now();
					const record = storedCheckinSchema.parse({
						recordType: "checkin",
						formatVersion: 1,
						id: randomUUID(),
						stamp,
						mood: request.mood,
						energy: request.energy,
						emotionWords,
						phase: request.phase,
						sourceSessionId: agent.session.id,
						createdAt: now
					});
					await this.writeRecord(record);
					return success(snapshotCheckin(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Create one encrypted journal with retrieval disabled unless explicitly granted.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Civil date, text, and explicit future-retrieval permission.
		* @returns The committed journal or a stable access, validation, or vault failure.
		*/
		createJournal(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const stamp = this.validateStamp(request.stamp);
					const title = this.text(request.title ?? "", "title", this.options.maxTitleBytes, false);
					const body = this.text(request.body, "body", this.options.maxBodyBytes, true);
					const now = Date.now();
					const record = storedJournalSchema.parse({
						recordType: "journal",
						formatVersion: 1,
						id: randomUUID(),
						version: randomUUID(),
						stamp,
						title,
						body,
						allowRetrieval: request.allowRetrieval,
						sourceSessionId: agent.session.id,
						createdAt: now,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotJournal(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Replace a journal's editable fields using equality-only optimistic concurrency.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Journal id, observed version, replacement text, and retrieval permission.
		* @returns The updated journal or a stable access, validation, version, or vault failure.
		*/
		updateJournal(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireJournal(await this.readRecords(), request.id);
					this.assertVersion(current, request.ifVersion);
					const title = this.text(request.title ?? "", "title", this.options.maxTitleBytes, false);
					const body = this.text(request.body, "body", this.options.maxBodyBytes, true);
					const record = storedJournalSchema.parse({
						...current,
						version: randomUUID(),
						title,
						body,
						allowRetrieval: request.allowRetrieval,
						updatedAt: Math.max(Date.now(), current.updatedAt)
					});
					await this.writeRecord(record);
					return success(snapshotJournal(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Delete one journal after observing its version; retries after absence remain successful.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Journal id and last observed version.
		* @returns A stable absent postcondition or access, version, or vault failure.
		*/
		deleteJournal(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = (await this.readRecords()).find((record) => record.recordType === "journal" && record.id === request.id);
					if (current !== void 0) {
						this.assertVersion(current, request.ifVersion);
						await this.ctx.mindGardenVault.delete("reflections", MindGardenVaultRecordId(current.id));
					}
					return success(Object.freeze({ absent: true }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Create one encrypted concern outside the conversation transcript.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Concern text, current browser-local stamp, and optional reminder stamp.
		* @returns The committed concern or a stable access, validation, or vault failure.
		*/
		createConcern(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const createdStamp = this.validateStamp(request.stamp);
					const reminder = this.validateReminder(request.reminder, createdStamp.localDate);
					const content = this.text(request.content, "content", this.options.maxConcernBytes, true);
					const now = Date.now();
					const record = storedConcernSchema.parse({
						recordType: "concern",
						formatVersion: 1,
						id: randomUUID(),
						version: randomUUID(),
						content,
						status: "active",
						createdStamp,
						reminder,
						convertedJournalId: null,
						conversion: null,
						sourceSessionId: agent.session.id,
						createdAt: now,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotConcern(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* List concerns in reminder-first order, hiding closed records by default.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Closed-record visibility and optional bounded result limit.
		* @returns Detached concerns or a stable access, validation, or vault failure.
		*/
		listConcerns(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const limit = this.validateConcernLimit(request.limit);
					const concerns = (await this.readRecords()).filter((record) => record.recordType === "concern").filter((record) => request.includeClosed === true || record.status === "active").sort(compareConcerns).slice(0, limit).map(snapshotConcern);
					return success(Object.freeze({ concerns: Object.freeze(concerns) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Replace one active concern and its reminder using equality-only concurrency.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Concern id, observed version, replacement text, current date, and reminder.
		* @returns The updated concern or a stable access, lifecycle, version, validation, or vault failure.
		*/
		updateConcern(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireConcern(await this.readRecords(), request.id);
					this.assertConcernActive(current);
					this.assertConcernVersion(current, request.ifVersion);
					const observedLocalDate = this.validateLocalDate(request.observedLocalDate);
					if (observedLocalDate < current.createdStamp.localDate) this.invalid("localDate", "past");
					const reminder = this.validateReminder(request.reminder, observedLocalDate);
					const content = this.text(request.content, "content", this.options.maxConcernBytes, true);
					const record = storedConcernSchema.parse({
						...current,
						version: randomUUID(),
						content,
						reminder,
						updatedAt: Math.max(Date.now(), current.updatedAt)
					});
					await this.writeRecord(record);
					return success(snapshotConcern(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Complete one concern, removing its reminder; retries after closure return the same postcondition.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Concern id and last observed active version.
		* @returns The closed concern or a stable access, not-found, version, or vault failure.
		*/
		completeConcern(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireConcern(await this.readRecords(), request.id);
					if (current.status !== "active") return success(snapshotConcern(current));
					this.assertConcernVersion(current, request.ifVersion);
					const record = storedConcernSchema.parse({
						...current,
						version: randomUUID(),
						status: "completed",
						reminder: null,
						updatedAt: Math.max(Date.now(), current.updatedAt)
					});
					await this.writeRecord(record);
					return success(snapshotConcern(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Convert one concern into a journal through a recoverable encrypted two-record commit.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Concern id, observed version, journal stamp, and retrieval permission.
		* @returns The linked concern and journal, including on safe retry after conversion.
		*/
		convertConcern(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const records = await this.readRecords();
					const current = this.requireConcern(records, request.id);
					if (current.status === "converted") {
						const journalId = current.convertedJournalId;
						const journal = records.find((record) => record.recordType === "journal" && record.id === journalId);
						if (journal === void 0) throw new ReflectionBusinessError({
							code: "journal-not-found",
							id: reflectionId(journalId)
						});
						return success(Object.freeze({
							concern: snapshotConcern(current),
							journal: snapshotJournal(journal)
						}));
					}
					this.assertConcernActive(current);
					this.assertConcernVersion(current, request.ifVersion);
					const stamp = this.validateStamp(request.stamp);
					if (stamp.localDate < current.createdStamp.localDate) this.invalid("localDate", "past");
					this.text(current.content, "body", this.options.maxBodyBytes, true);
					const now = Math.max(Date.now(), current.updatedAt);
					const planned = storedConcernSchema.parse({
						...current,
						version: randomUUID(),
						status: "converting",
						reminder: null,
						convertedJournalId: null,
						conversion: {
							journalId: randomUUID(),
							journalVersion: randomUUID(),
							finalConcernVersion: randomUUID(),
							stamp,
							allowRetrieval: request.allowRetrieval,
							createdAt: now
						},
						updatedAt: now
					});
					await this.writeRecord(planned);
					const settled = await this.settleConcernConversion([...records.filter((record) => record.id !== current.id), planned], planned);
					return success(Object.freeze({
						concern: snapshotConcern(settled.concern),
						journal: snapshotJournal(settled.journal)
					}));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Propose one encrypted contemplation draft for the current completed serenity Session.
		* @param agent - Exact idle Agent whose Session supplies the completed source turn.
		* @param request - User-visible Markdown proposal; the service never derives or sends model context.
		* @returns The existing per-Session note, a new draft, or a stable readiness, validation, access, or vault failure.
		*/
		createContemplation(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					this.assertContemplationSource(agent);
					const markdown = this.text(request.markdown, "markdown", this.options.maxContemplationBytes, true);
					const existing = (await this.readRecords()).find((record) => record.recordType === "contemplation" && record.sourceSessionId === agent.session.id);
					if (existing !== void 0) return success(snapshotContemplation(existing));
					const now = Date.now();
					const record = storedContemplationSchema.parse({
						recordType: "contemplation",
						formatVersion: 1,
						id: randomUUID(),
						version: randomUUID(),
						markdown,
						status: "draft",
						sourceSessionId: agent.session.id,
						createdAt: now,
						updatedAt: now,
						confirmedAt: null
					});
					await this.writeRecord(record);
					return success(snapshotContemplation(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* List encrypted contemplation notes newest first.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Optional source Session filter and bounded result limit.
		* @returns Detached notes or a stable access, validation, or vault failure.
		*/
		listContemplations(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const limit = this.validateListLimit(request.limit, this.options.maxContemplationsPerList);
					const sourceSessionId = request.sourceSessionId === void 0 ? void 0 : this.text(request.sourceSessionId, "sourceSessionId", MAX_SOURCE_SESSION_ID_BYTES, true);
					const contemplations = (await this.readRecords()).filter((record) => record.recordType === "contemplation").filter((record) => sourceSessionId === void 0 || record.sourceSessionId === sourceSessionId).sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id)).slice(0, limit).map(snapshotContemplation);
					return success(Object.freeze({ contemplations: Object.freeze(contemplations) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Replace an unconfirmed contemplation draft using equality-only concurrency.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Note id, observed version, and replacement Markdown.
		* @returns The updated draft or a stable lifecycle, version, validation, access, or vault failure.
		*/
		updateContemplation(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireContemplation(await this.readRecords(), request.id);
					this.assertContemplationDraft(current);
					this.assertContemplationVersion(current, request.ifVersion);
					const markdown = this.text(request.markdown, "markdown", this.options.maxContemplationBytes, true);
					const record = storedContemplationSchema.parse({
						...current,
						version: randomUUID(),
						markdown,
						updatedAt: Math.max(Date.now(), current.updatedAt)
					});
					await this.writeRecord(record);
					return success(snapshotContemplation(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Confirm one contemplation draft without projecting it into model-visible context.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Note id and observed draft version.
		* @returns The confirmed note or a stable lifecycle, version, access, or vault failure.
		*/
		confirmContemplation(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireContemplation(await this.readRecords(), request.id);
					this.assertContemplationDraft(current);
					this.assertContemplationVersion(current, request.ifVersion);
					const now = Math.max(Date.now(), current.updatedAt);
					const record = storedContemplationSchema.parse({
						...current,
						version: randomUUID(),
						status: "confirmed",
						updatedAt: now,
						confirmedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotContemplation(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Physically remove one contemplation after observing its version.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Note id and last observed version.
		* @returns A stable absent postcondition or an access, version, or vault failure.
		*/
		deleteContemplation(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = (await this.readRecords()).find((record) => record.recordType === "contemplation" && record.id === request.id);
					if (current !== void 0) {
						this.assertContemplationVersion(current, request.ifVersion);
						await this.ctx.mindGardenVault.delete("reflections", MindGardenVaultRecordId(current.id));
					}
					return success(Object.freeze({ absent: true }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Create an encrypted principle proposal from confirmed contemplation evidence.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Confirmed source note, optional observed target, and complete proposed meaning.
		* @returns An inactive proposal or a stable evidence, target, validation, access, or vault failure.
		*/
		proposePrinciple(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const records = await this.readRecords();
					const source = this.requireConfirmedContemplation(records, request.sourceContemplationId);
					const content = this.validatePrincipleContent(records, request.content);
					if (!source.markdown.includes(content.userQuote)) throw new ReflectionBusinessError({
						code: "principle-source-invalid",
						reason: "quote-not-found"
					});
					const targetRequest = request.target;
					const target = targetRequest === void 0 ? null : this.requirePrinciple(records, targetRequest.id);
					if (target !== null && targetRequest !== void 0) this.assertPrincipleVersion(target, targetRequest.ifVersion);
					const now = Date.now();
					const record = storedPrincipleProposalSchema.parse({
						recordType: "principle-proposal",
						formatVersion: 1,
						id: randomUUID(),
						version: randomUUID(),
						status: "proposed",
						targetPrincipleId: target?.id ?? null,
						targetVersion: target?.version ?? null,
						content,
						sourceContemplationId: source.id,
						sourceSessionId: source.sourceSessionId,
						createdAt: now,
						updatedAt: now,
						rejectedAt: null
					});
					await this.writeRecord(record);
					return success(snapshotPrincipleProposal(record, null));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* List encrypted principle proposals newest first.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Closed-state visibility and bounded result limit.
		* @returns Detached proposals with accepted state recovered from principle history.
		*/
		listPrincipleProposals(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const limit = this.validateListLimit(request.limit, this.options.maxPrincipleProposalsPerList);
					const records = await this.readRecords();
					const proposals = records.filter((record) => record.recordType === "principle-proposal").map((record) => snapshotPrincipleProposal(record, acceptedPrincipleProposal(records, record.id))).filter((proposal) => request.includeClosed === true || proposal.status === "proposed").sort((left, right) => right.updatedAt - left.updatedAt || right.id.localeCompare(left.id)).slice(0, limit);
					return success(Object.freeze({ proposals: Object.freeze(proposals) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Accept one proposal by creating or appending a single recoverable principle record.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed proposal version and explicit browser-local adoption date.
		* @returns The resulting principle, including on a safe retry after acceptance.
		*/
		acceptPrincipleProposal(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const records = await this.readRecords();
					const proposal = this.requirePrincipleProposal(records, request.id);
					const accepted = acceptedPrincipleProposal(records, proposal.id);
					if (accepted !== null) return success(snapshotPrinciple(accepted.principle));
					if (proposal.status === "rejected") this.principleProposalClosed(records, proposal);
					this.assertPrincipleProposalVersion(records, proposal, request.ifVersion);
					const stamp = this.validateStamp(request.stamp);
					const target = proposal.targetPrincipleId === null ? null : this.requirePrinciple(records, reflectionId(proposal.targetPrincipleId));
					if (target !== null) {
						this.assertPrincipleVersion(target, reflectionVersion(proposal.targetVersion));
						this.assertPrincipleVersionCapacity(target);
					}
					const now = Math.max(Date.now(), proposal.updatedAt, target?.updatedAt ?? 0);
					const principleId = target?.id ?? randomUUID();
					const version = {
						number: (target?.versions.length ?? 0) + 1,
						content: proposal.content,
						sourceProposalId: proposal.id,
						sourceContemplationId: proposal.sourceContemplationId,
						stamp,
						createdAt: now
					};
					const principle = storedPrincipleSchema.parse({
						recordType: "principle",
						formatVersion: 1,
						id: principleId,
						version: randomUUID(),
						status: proposal.content.status,
						current: proposal.content,
						versions: [...target?.versions ?? [], version],
						createdAt: target?.createdAt ?? now,
						updatedAt: now
					});
					await this.writeRecord(principle);
					return success(snapshotPrinciple(principle));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Reject one open proposal without deleting its encrypted review evidence.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Proposal id and equality-only observed version.
		* @returns The rejected proposal, including on a safe repeated rejection.
		*/
		rejectPrincipleProposal(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const records = await this.readRecords();
					const proposal = this.requirePrincipleProposal(records, request.id);
					if (acceptedPrincipleProposal(records, proposal.id) !== null) this.principleProposalClosed(records, proposal);
					if (proposal.status === "rejected") return success(snapshotPrincipleProposal(proposal, null));
					this.assertPrincipleProposalVersion(records, proposal, request.ifVersion);
					const now = Math.max(Date.now(), proposal.updatedAt);
					const rejectedProposal = storedPrincipleProposalSchema.parse({
						...proposal,
						version: randomUUID(),
						status: "rejected",
						updatedAt: now,
						rejectedAt: now
					});
					await this.writeRecord(rejectedProposal);
					return success(snapshotPrincipleProposal(rejectedProposal, null));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* List principles newest first with their complete bounded histories.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Retired-state visibility and bounded result limit.
		* @returns Detached principles or a stable access, validation, or vault failure.
		*/
		listPrinciples(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const limit = this.validateListLimit(request.limit, this.options.maxPrinciplesPerList);
					const principles = (await this.readRecords()).filter((record) => record.recordType === "principle").filter((record) => request.includeRetired === true || record.status !== "retired").sort((left, right) => right.updatedAt - left.updatedAt || right.id.localeCompare(left.id)).slice(0, limit).map(snapshotPrinciple);
					return success(Object.freeze({ principles: Object.freeze(principles) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Append one directly user-authored principle version without erasing its history.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed principle, explicit date, and complete replacement meaning.
		* @returns The revised principle or a stable version, limit, validation, access, or vault failure.
		*/
		revisePrinciple(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const records = await this.readRecords();
					const current = this.requirePrinciple(records, request.id);
					this.assertPrincipleVersion(current, request.ifVersion);
					this.assertPrincipleVersionCapacity(current);
					const content = this.validatePrincipleContent(records, request.content);
					const stamp = this.validateStamp(request.stamp);
					const now = Math.max(Date.now(), current.updatedAt);
					const version = {
						number: current.versions.length + 1,
						content,
						sourceProposalId: null,
						sourceContemplationId: null,
						stamp,
						createdAt: now
					};
					const principle = storedPrincipleSchema.parse({
						...current,
						version: randomUUID(),
						status: content.status,
						current: content,
						versions: [...current.versions, version],
						updatedAt: now
					});
					await this.writeRecord(principle);
					return success(snapshotPrinciple(principle));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Create one inactive, encrypted, non-scored reality experiment.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Small action, optional hypothesis and review date, and optional exact user evidence.
		* @returns A proposed experiment or the existing proposal for the same evidenced Session.
		*/
		createExperiment(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const createdStamp = this.validateStamp(request.stamp);
					const title = this.text(request.title, "experimentTitle", this.options.maxExperimentFieldBytes, true);
					const hypothesis = this.text(request.hypothesis ?? "", "hypothesis", this.options.maxExperimentFieldBytes, false);
					const action = this.text(request.action, "action", this.options.maxExperimentFieldBytes, true);
					const reviewStamp = this.validateExperimentReviewStamp(request.reviewStamp ?? null, createdStamp.localDate);
					const source = this.resolveExperimentSource(agent, request.source);
					const records = await this.readRecords();
					if (source !== null) {
						const existing = records.find((record) => record.recordType === "experiment" && record.sourceSessionId === agent.session.id && record.sourceMessageId !== null);
						if (existing !== void 0) return success(snapshotExperiment(existing));
					}
					const now = Date.now();
					const record = storedExperimentSchema.parse({
						recordType: "experiment",
						formatVersion: 1,
						id: randomUUID(),
						version: randomUUID(),
						title,
						hypothesis,
						action,
						reviewStamp,
						status: "proposed",
						result: "",
						judgment: "",
						sourceSessionId: agent.session.id,
						sourceMessageId: source?.messageId ?? null,
						evidenceQuote: source?.evidenceQuote ?? "",
						observations: [],
						createdStamp,
						startedAt: null,
						stoppedAt: null,
						createdAt: now,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotExperiment(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* List encrypted reality experiments in actionable-state order.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Stopped-state visibility and bounded result limit.
		* @returns Detached experiments with complete bounded observation histories.
		*/
		listExperiments(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const limit = this.validateListLimit(request.limit, this.options.maxExperimentsPerList);
					const rank = {
						trying: 0,
						proposed: 1,
						revised: 2,
						observed: 3,
						stopped: 4
					};
					const experiments = (await this.readRecords()).filter((record) => record.recordType === "experiment").filter((record) => request.includeStopped === true || record.status !== "stopped").sort((left, right) => rank[left.status] - rank[right.status] || right.updatedAt - left.updatedAt || right.id.localeCompare(left.id)).slice(0, limit).map(snapshotExperiment);
					return success(Object.freeze({ experiments: Object.freeze(experiments) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Explicitly start a proposed or revised experiment.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed version, current civil date, and optional review-date replacement.
		* @returns The trying experiment, including on a safe repeated start.
		*/
		startExperiment(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireExperiment(await this.readRecords(), request.id);
					if (current.status === "trying") return success(snapshotExperiment(current));
					if (current.status !== "proposed" && current.status !== "revised") this.experimentStateConflict(current);
					this.assertExperimentVersion(current, request.ifVersion);
					const observedLocalDate = this.validateLocalDate(request.observedLocalDate);
					const reviewStamp = request.reviewStamp === void 0 ? current.reviewStamp : this.validateExperimentReviewStamp(request.reviewStamp, observedLocalDate);
					const now = Math.max(Date.now(), current.updatedAt);
					const record = storedExperimentSchema.parse({
						...current,
						version: randomUUID(),
						reviewStamp,
						status: "trying",
						startedAt: current.startedAt ?? now,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotExperiment(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Append one observation without assigning success or failure.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed experiment, occurrence stamp, optional context, and required observation.
		* @returns The observed experiment with its new immutable observation.
		*/
		observeExperiment(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireExperiment(await this.readRecords(), request.id);
					if (current.status !== "trying" && current.status !== "observed") this.experimentStateConflict(current);
					this.assertExperimentVersion(current, request.ifVersion);
					if (current.observations.length >= this.options.maxExperimentObservations) throw new ReflectionBusinessError({
						code: "experiment-observation-limit",
						id: reflectionId(current.id),
						maxObservations: this.options.maxExperimentObservations
					});
					const observationText = this.text(request.observation, "observation", this.options.maxExperimentFieldBytes, true);
					if ([
						"已有新的观察，待在对话中展开。",
						"待补充",
						"暂无",
						"无"
					].includes(observationText)) this.invalid("observation", "placeholder");
					const now = Math.max(Date.now(), current.updatedAt);
					const observation = {
						id: randomUUID(),
						happened: this.text(request.happened ?? "", "happened", this.options.maxExperimentFieldBytes, false),
						action: this.text(request.action ?? "", "action", this.options.maxExperimentFieldBytes, false),
						observation: observationText,
						mood: request.mood ?? null,
						energy: request.energy ?? null,
						stamp: this.validateStamp(request.stamp),
						createdAt: now
					};
					const record = storedExperimentSchema.parse({
						...current,
						version: randomUUID(),
						reviewStamp: null,
						status: "observed",
						result: observationText,
						observations: [...current.observations, observation],
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotExperiment(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Record a post-observation judgment and optional next review date.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed version, non-empty judgment, result, and optional review-date replacement.
		* @returns The revised experiment without changing its observation history.
		*/
		reviseExperiment(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireExperiment(await this.readRecords(), request.id);
					if (current.status !== "observed") this.experimentStateConflict(current);
					this.assertExperimentVersion(current, request.ifVersion);
					const observedLocalDate = this.validateLocalDate(request.observedLocalDate);
					const reviewStamp = request.reviewStamp === void 0 ? current.reviewStamp : this.validateExperimentReviewStamp(request.reviewStamp, observedLocalDate);
					const result = request.result === void 0 ? current.result : this.text(request.result, "result", this.options.maxExperimentFieldBytes, false);
					const judgment = this.text(request.judgment, "judgment", this.options.maxExperimentFieldBytes, true);
					const record = storedExperimentSchema.parse({
						...current,
						version: randomUUID(),
						reviewStamp,
						status: "revised",
						result,
						judgment,
						updatedAt: Math.max(Date.now(), current.updatedAt)
					});
					await this.writeRecord(record);
					return success(snapshotExperiment(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Move or clear the next review date without changing experiment meaning or state.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed version, current civil date, and replacement review stamp.
		* @returns The rescheduled experiment or a stable state, version, validation, access, or vault failure.
		*/
		scheduleExperiment(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireExperiment(await this.readRecords(), request.id);
					if (current.status === "stopped") this.experimentStateConflict(current);
					this.assertExperimentVersion(current, request.ifVersion);
					const observedLocalDate = this.validateLocalDate(request.observedLocalDate);
					const reviewStamp = this.validateExperimentReviewStamp(request.reviewStamp, observedLocalDate);
					const record = storedExperimentSchema.parse({
						...current,
						version: randomUUID(),
						reviewStamp,
						updatedAt: Math.max(Date.now(), current.updatedAt)
					});
					await this.writeRecord(record);
					return success(snapshotExperiment(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Stop one experiment without deleting its observations.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Experiment id and last observed equality-only version.
		* @returns The stopped experiment, including on a safe repeated stop.
		*/
		stopExperiment(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const current = this.requireExperiment(await this.readRecords(), request.id);
					if (current.status === "stopped") return success(snapshotExperiment(current));
					this.assertExperimentVersion(current, request.ifVersion);
					const now = Math.max(Date.now(), current.updatedAt);
					const record = storedExperimentSchema.parse({
						...current,
						version: randomUUID(),
						reviewStamp: null,
						status: "stopped",
						stoppedAt: now,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotExperiment(record));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Create one encrypted question that still needs real-world observation.
		* @param agent - Exact live Agent authorizing durable profile access and optional message evidence.
		* @param request - Browser-local creation stamp, question, and optional exact evidence source.
		* @returns The open question or a stable source, validation, access, or vault failure.
		*/
		createOpenQuestion(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const question = this.text(request.question, "openQuestion", this.options.maxOpenQuestionBytes, true);
					const stamp = this.validateStamp(request.stamp);
					const records = await this.readRecords();
					const source = this.resolveOpenQuestionSource(agent, records, request.source);
					const existing = source === null ? void 0 : records.find((record) => {
						if (record.recordType !== "open-question") return false;
						return source.kind === "message" ? record.source?.kind === "message" && record.source.messageId === source.messageId : record.source?.kind === "journal" && record.source.journalId === source.journalId;
					});
					if (existing !== void 0) return success(snapshotOpenQuestion(existing, records));
					const now = Date.now();
					const record = storedOpenQuestionSchema.parse({
						recordType: "open-question",
						formatVersion: 1,
						id: randomUUID(),
						version: randomUUID(),
						question,
						status: "open",
						source,
						transitions: [{
							id: randomUUID(),
							status: "open",
							stamp,
							createdAt: now
						}],
						createdStamp: stamp,
						sourceSessionId: agent.session.id,
						createdAt: now,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotOpenQuestion(record, [...records, record]));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* List encrypted questions in open-first creation order.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Closed-record visibility and bounded result limit.
		* @returns Detached questions with derived journal-source freshness.
		*/
		listOpenQuestions(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const limit = this.validateListLimit(request.limit, this.options.maxOpenQuestionsPerList);
					const records = await this.readRecords();
					const questions = records.filter((record) => record.recordType === "open-question").filter((record) => request.includeClosed === true || record.status === "open").sort(compareOpenQuestions).slice(0, limit).map((record) => snapshotOpenQuestion(record, records));
					return success(Object.freeze({ questions: Object.freeze(questions) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Edit or transition one open question while retaining append-only lifecycle history.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed version, replacement meaning, target state, and transition stamp.
		* @returns The updated question, including when a safe retry already reached the same postcondition.
		*/
		updateOpenQuestion(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const question = this.text(request.question, "openQuestion", this.options.maxOpenQuestionBytes, true);
					if (![
						"open",
						"resolved",
						"dismissed"
					].includes(request.status)) this.invalid("openQuestionStatus", "invalid");
					const stamp = this.validateStamp(request.stamp);
					const records = await this.readRecords();
					const current = this.requireOpenQuestion(records, request.id);
					if (current.question === question && current.status === request.status) return success(snapshotOpenQuestion(current, records));
					this.assertOpenQuestionVersion(current, request.ifVersion, records);
					const statusChanged = current.status !== request.status;
					if (statusChanged && current.transitions.length >= this.options.maxOpenQuestionTransitions) throw new ReflectionBusinessError({
						code: "open-question-transition-limit",
						id: reflectionId(current.id),
						maxTransitions: this.options.maxOpenQuestionTransitions
					});
					const now = Math.max(Date.now(), current.updatedAt);
					const record = storedOpenQuestionSchema.parse({
						...current,
						version: randomUUID(),
						question,
						status: request.status,
						transitions: statusChanged ? [...current.transitions, {
							id: randomUUID(),
							status: request.status,
							stamp,
							createdAt: now
						}] : current.transitions,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotOpenQuestion(record, [...records.filter((item) => item.id !== record.id), record]));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Release a minimal bounded set of unresolved questions through an explicit context seam.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Optional limit within the configured context bound.
		* @returns Oldest unresolved questions without making or mutating a model request.
		*/
		openQuestionContext(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const limit = this.validateListLimit(request.limit, this.options.maxContextOpenQuestions);
					const openQuestions = (await this.readRecords()).filter((record) => record.recordType === "open-question" && record.status === "open").sort(compareOpenQuestions).slice(0, limit).map((record) => Object.freeze({
						id: reflectionId(record.id),
						question: record.question,
						createdLocalDate: record.createdStamp.localDate,
						evidenceQuote: record.source?.evidenceQuote ?? ""
					}));
					return success(Object.freeze({ openQuestions: Object.freeze(openQuestions) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Derive bounded plaintext evidence for one explicit period without contacting a model.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Calendar scale and browser-observed inclusive date range.
		* @returns Authenticated source snapshots, reviewable items, and one equality hash.
		*/
		periodReviewMaterial(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const range = this.validatePeriodReviewRange(request);
					return success(this.buildPeriodReviewMaterial(await this.readRecords(), range));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Commit a proposed review against an exact authenticated material snapshot.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Observed material hash, cited source ids, and editable review Markdown.
		* @returns The encrypted proposed review or a stable material, validation, access, or vault failure.
		*/
		createPeriodReview(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const range = this.validatePeriodReviewRange(request);
					const observedHash = request.materialHash.trim();
					if (!/^[0-9a-f]{64}$/u.test(observedHash)) this.invalid("materialHash", "invalid");
					const content = this.text(request.content, "periodReviewContent", this.options.maxPeriodReviewContentBytes, true);
					if (request.sourceIds.length === 0) throw new ReflectionBusinessError({ code: "period-review-source-required" });
					if (request.sourceIds.length > this.options.maxPeriodReviewSources) this.invalid("sourceIds", "too-many");
					const sourceIds = request.sourceIds.map(String);
					if (new Set(sourceIds).size !== sourceIds.length) this.invalid("sourceIds", "duplicate");
					const records = await this.readRecords();
					const material = this.buildPeriodReviewMaterial(records, range);
					if (material.sources.length === 0) throw new ReflectionBusinessError({ code: "period-review-source-required" });
					if (material.materialHash !== observedHash) throw new ReflectionBusinessError({
						code: "period-review-material-conflict",
						currentHash: material.materialHash
					});
					const sourcesById = new Map(material.sources.map((source) => [source.id, source]));
					const selected = sourceIds.map((id) => {
						const source = sourcesById.get(id);
						if (source === void 0) throw new ReflectionBusinessError({
							code: "period-review-source-invalid",
							reason: "unknown"
						});
						if (source.sourceType === "legacy-original") throw new ReflectionBusinessError({
							code: "period-review-source-invalid",
							reason: "unknown"
						});
						return {
							id: source.id,
							sourceType: source.sourceType,
							fingerprint: source.fingerprint,
							localDates: [...source.localDates]
						};
					}).sort((left, right) => `${left.sourceType}:${left.id}`.localeCompare(`${right.sourceType}:${right.id}`));
					if (material.sources.some((source) => content.includes(source.id))) this.invalid("periodReviewContent", "source-visible");
					const now = Date.now();
					const record = storedPeriodReviewSchema.parse({
						recordType: "period-review",
						formatVersion: 1,
						id: randomUUID(),
						version: randomUUID(),
						periodType: range.periodType,
						startStamp: range.startStamp,
						endStamp: range.endStamp,
						status: "proposed",
						content,
						sources: selected,
						sourceHash: periodReviewSourceHash(selected),
						sourceSessionId: agent.session.id,
						createdAt: now,
						updatedAt: now
					});
					await this.writeRecord(record);
					return success(snapshotPeriodReview(record, [...records, record]));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* List encrypted period reviews with freshness derived from current authenticated sources.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Optional scale and archive filters plus a bounded result limit.
		* @returns Newest-first reviews whose source changes are reported without rewriting history.
		*/
		listPeriodReviews(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					if (request.periodType !== void 0) this.validatePeriodType(request.periodType);
					const limit = this.validateListLimit(request.limit, this.options.maxPeriodReviewsPerList);
					const records = await this.readRecords();
					const reviews = records.filter((record) => record.recordType === "period-review").filter((record) => request.periodType === void 0 || record.periodType === request.periodType).filter((record) => request.includeArchived === true || record.status !== "archived").sort((left, right) => right.endStamp.localDate.localeCompare(left.endStamp.localDate) || right.createdAt - left.createdAt || right.id.localeCompare(left.id)).slice(0, limit).map((record) => snapshotPeriodReview(record, records));
					return success(Object.freeze({ reviews: Object.freeze(reviews) }));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Replace review content and lifecycle after observing its equality-only version.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Review identity, observed version, replacement Markdown, and status.
		* @returns The updated review while retaining its immutable source snapshot.
		*/
		updatePeriodReview(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const records = await this.readRecords();
					const current = this.requirePeriodReview(records, request.id);
					this.assertPeriodReviewVersion(current, request.ifVersion, records);
					if (![
						"proposed",
						"saved",
						"archived"
					].includes(request.status)) this.invalid("periodReviewStatus", "invalid");
					const content = this.text(request.content, "periodReviewContent", this.options.maxPeriodReviewContentBytes, true);
					if (current.sources.some((source) => content.includes(source.id))) this.invalid("periodReviewContent", "source-visible");
					const record = storedPeriodReviewSchema.parse({
						...current,
						version: randomUUID(),
						status: request.status,
						content,
						updatedAt: Math.max(Date.now(), current.updatedAt)
					});
					await this.writeRecord(record);
					return success(snapshotPeriodReview(record, [...records.filter((existing) => existing.id !== record.id), record]));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Derive one sparse month projection from authenticated encrypted records.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Strict Gregorian month.
		* @returns Non-empty days with counts and each date's latest check-in summary.
		*/
		month(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const month = this.validateMonth(request.month);
					const projections = (await this.readRecords()).flatMap((record) => calendarProjections(record).filter((projection) => projection.date.startsWith(`${month}-`)));
					const groups = /* @__PURE__ */ new Map();
					for (const projection of projections) {
						const group = groups.get(projection.date) ?? [];
						group.push(projection);
						groups.set(projection.date, group);
					}
					const days = [...groups].sort(([left], [right]) => left.localeCompare(right)).map(([date, group]) => {
						const checkins = group.flatMap((projection) => projection.kind === "reflection" && projection.record.recordType === "checkin" ? [projection.record] : []).sort(compareRecords);
						const latest = checkins.at(-1);
						const day = {
							date,
							eventCount: group.length,
							checkinCount: checkins.length,
							journalCount: group.filter((projection) => projection.kind === "reflection" && projection.record.recordType === "journal").length,
							concernCount: group.filter((projection) => projection.kind === "reflection" && projection.record.recordType === "concern").length,
							principleCount: group.filter((projection) => projection.kind === "principle").length,
							experimentCount: group.filter((projection) => projection.kind === "experiment-review" || projection.kind === "experiment-observation").length,
							openQuestionCount: group.filter((projection) => projection.kind === "open-question").length,
							...latest === void 0 ? {} : {
								mood: latest.mood,
								moodBand: moodBand(latest.mood),
								energy: latest.energy,
								energyBand: energyBand(latest.energy)
							}
						};
						return Object.freeze(day);
					});
					return success(Object.freeze({
						month,
						days: Object.freeze(days)
					}));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Read every reflection event for one explicit civil date.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Strict Gregorian date.
		* @returns Creation-ordered detached check-ins and journals.
		*/
		day(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const localDate = this.validateLocalDate(request.localDate);
					const events = (await this.readRecords()).flatMap((record) => calendarProjections(record).filter((projection) => projection.date === localDate)).sort(compareCalendarProjections).map(snapshotCalendarEvent);
					return success(Object.freeze({
						date: localDate,
						events: Object.freeze(events)
					}));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Derive a seven- or thirty-day check-in trend from an explicit end date.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Supported interval length and browser-local end date.
		* @returns Ordered points and whether at least three distinct dates can be plotted.
		*/
		trend(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const endDate = this.validateLocalDate(request.endDate);
					const startDate = subtractDays(endDate, request.days - 1);
					const points = (await this.readRecords()).filter((record) => record.recordType === "checkin" && record.stamp.localDate >= startDate && record.stamp.localDate <= endDate).sort(compareRecords).map(snapshotCheckin);
					const recordedDays = new Set(points.map((point) => point.stamp.localDate)).size;
					return success(Object.freeze({
						days: request.days,
						startDate,
						endDate,
						canPlot: recordedDays >= 3,
						recordedDays,
						points: Object.freeze(points)
					}));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		/**
		* Select bounded reflection context without sending it to a model.
		* @param agent - Exact live Agent authorizing durable profile access.
		* @param request - Current conversation query and optional browser-local date.
		* @returns The latest same-day check-in when requested and only explicitly retrievable journal excerpts.
		*/
		authorizedContext(agent, request) {
			return this.enqueue(async () => {
				const access = this.accessFailure(agent);
				if (access !== null) return rejected(access);
				try {
					const localDate = request.localDate === void 0 ? null : this.validateLocalDate(request.localDate);
					const query = this.text(request.query, "query", this.options.maxQueryBytes, false);
					const records = await this.readRecords();
					const todayCheckin = records.filter((record) => localDate !== null && record.recordType === "checkin" && record.stamp.localDate === localDate).sort(compareRecords).at(-1);
					const queryTerms = normalizedBigrams(query);
					const retrievableJournals = records.flatMap((record) => {
						if (record.recordType !== "journal" || !record.allowRetrieval) return [];
						const overlap = [...normalizedBigrams(`${record.title}\n${record.body}`)].filter((term) => queryTerms.has(term)).length;
						const sameDay = localDate !== null && record.stamp.localDate === localDate;
						return overlap === 0 && !sameDay ? [] : [{
							score: overlap * 10 + (sameDay ? 5 : 0),
							record
						}];
					}).sort((left, right) => right.score - left.score || right.record.createdAt - left.record.createdAt || right.record.id.localeCompare(left.record.id)).slice(0, this.options.maxContextJournals).map(({ record }) => Object.freeze({
						id: reflectionId(record.id),
						localDate: record.stamp.localDate,
						title: record.title,
						body: truncateUtf8(record.body, this.options.maxContextBodyBytes)
					}));
					return success(Object.freeze({
						todayCheckin: todayCheckin === void 0 ? null : snapshotCheckin(todayCheckin),
						retrievableJournals: Object.freeze(retrievableJournals)
					}));
				} catch (error) {
					return this.convertFailure(error);
				}
			});
		}
		accessFailure(agent) {
			if (this.ctx.agents.get(agent.id) !== agent) throw new Error(`mind-garden-reflection: agent '${agent.id}' is not live in this registry`);
			const state = this.ctx.mindGarden.current(agent.session);
			if (state === null) return { code: "mind-garden-not-active" };
			if (state.privacy !== "durable") return { code: "durable-session-required" };
			return null;
		}
		assertContemplationSource(agent) {
			if (this.ctx.mindGarden.current(agent.session)?.mode !== "serenity") throw new ReflectionBusinessError({
				code: "contemplation-source-unavailable",
				reason: "mode-unavailable"
			});
			if (agent.status !== "idle") throw new ReflectionBusinessError({
				code: "contemplation-source-unavailable",
				reason: "agent-running"
			});
			if (!agent.session.events.some((event) => event.type === "turn/end" && event.data.reason.kind === "completed")) throw new ReflectionBusinessError({
				code: "contemplation-source-unavailable",
				reason: "no-completed-turn"
			});
		}
		validateStamp(stamp) {
			const localDate = this.validateLocalDate(stamp.localDate);
			const timeZone = stamp.timeZone.trim();
			if (timeZone.length === 0) this.invalid("timeZone", "blank");
			if (Buffer.byteLength(timeZone, "utf8") > this.options.maxTimeZoneBytes) this.invalid("timeZone", "too-large", this.options.maxTimeZoneBytes);
			let canonical;
			try {
				canonical = new Intl.DateTimeFormat("en-US", { timeZone }).resolvedOptions().timeZone;
			} catch {
				return this.invalid("timeZone", "invalid");
			}
			if (!Number.isInteger(stamp.utcOffsetMinutes) || stamp.utcOffsetMinutes < -840 || stamp.utcOffsetMinutes > 840) return this.invalid("utcOffsetMinutes", "invalid");
			return {
				localDate,
				timeZone: canonical,
				utcOffsetMinutes: stamp.utcOffsetMinutes
			};
		}
		validateLocalDate(value) {
			if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return this.invalid("localDate", "invalid");
			const date = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
			if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) return this.invalid("localDate", "invalid");
			return value;
		}
		validateMonth(value) {
			if (!/^\d{4}-\d{2}$/u.test(value)) return this.invalid("month", "invalid");
			const month = Number(value.slice(5));
			if (month < 1 || month > 12) return this.invalid("month", "invalid");
			return value;
		}
		validateEmotionWords(values) {
			if (values.length > MAX_EMOTION_WORDS) this.invalid("emotionWords", "too-many");
			const result = [];
			for (const value of values) {
				const word = value.trim();
				if (word.length === 0) this.invalid("emotionWords", "blank");
				if (Buffer.byteLength(word, "utf8") > this.options.maxEmotionWordBytes) this.invalid("emotionWords", "too-large", this.options.maxEmotionWordBytes);
				if (result.includes(word)) this.invalid("emotionWords", "duplicate");
				result.push(word);
			}
			return result;
		}
		validateReminder(reminder, observedLocalDate) {
			if (reminder === void 0) return null;
			const stamp = this.validateStamp(reminder);
			if (stamp.localDate < observedLocalDate) this.invalid("reminderDate", "past");
			return stamp;
		}
		validateExperimentReviewStamp(reviewStamp, observedLocalDate) {
			if (reviewStamp === null) return null;
			const stamp = this.validateStamp(reviewStamp);
			if (stamp.localDate < observedLocalDate) this.invalid("reviewDate", "past");
			return stamp;
		}
		validatePeriodType(value) {
			if (![
				"week",
				"month",
				"year"
			].includes(value)) this.invalid("periodType", "invalid");
		}
		validatePeriodReviewRange(request) {
			this.validatePeriodType(request.periodType);
			const startStamp = this.validateStamp(request.startStamp);
			const endStamp = this.validateStamp(request.endStamp);
			if (endStamp.localDate < startStamp.localDate) this.invalid("periodEnd", "invalid");
			if (endStamp.timeZone !== startStamp.timeZone) this.invalid("timeZone", "invalid");
			return {
				periodType: request.periodType,
				startStamp,
				endStamp
			};
		}
		buildPeriodReviewMaterial(records, range) {
			const items = [];
			const sources = /* @__PURE__ */ new Map();
			const inRange = (localDate) => localDate >= range.startStamp.localDate && localDate <= range.endStamp.localDate;
			const add = (record, category, localDate, titleValue, textValue) => {
				if (!inRange(localDate)) return;
				const title = truncateUtf8(titleValue.trim(), this.options.maxPeriodReviewMaterialItemBytes);
				const text = truncateUtf8(textValue.trim(), this.options.maxPeriodReviewMaterialItemBytes);
				if (title.length === 0 && text.length === 0) return;
				const existing = sources.get(record.id) ?? {
					record,
					localDates: /* @__PURE__ */ new Set()
				};
				existing.localDates.add(localDate);
				sources.set(record.id, existing);
				items.push(Object.freeze({
					category,
					sourceId: reflectionId(record.id),
					localDate,
					title,
					text
				}));
			};
			for (const record of records) {
				if (record.recordType === "checkin") {
					add(record, "events", record.stamp.localDate, "", record.emotionWords.join(" · "));
					continue;
				}
				if (record.recordType === "journal") {
					add(record, "events", record.stamp.localDate, record.title, record.body);
					continue;
				}
				if (record.recordType === "concern") {
					if (record.status === "active") {
						add(record, "ongoing", record.createdStamp.localDate, "", record.content);
						add(record, "focus", record.createdStamp.localDate, "", record.content);
					}
					continue;
				}
				if (record.recordType === "open-question") {
					for (const transition of record.transitions) add(record, transition.status === "open" ? "focus" : "changes", transition.stamp.localDate, record.question, transition.status);
					continue;
				}
				if (record.recordType === "contemplation") {
					if (record.status === "confirmed") add(record, "events", localDateAt(record.createdAt, range.startStamp.timeZone), "", record.markdown);
					continue;
				}
				if (record.recordType === "principle") {
					for (const version of record.versions) {
						const details = [
							version.content.formationContext,
							...version.content.supportingExperiences.map((experience) => experience.summary),
							version.content.counterexample,
							...version.content.appliesTo,
							...version.content.notAppliesTo,
							version.content.lastChallenged
						].filter((value) => value.length > 0).join("\n");
						add(record, "changes", version.stamp.localDate, version.content.expression, details);
					}
					continue;
				}
				if (record.recordType === "experiment") {
					for (const observation of record.observations) add(record, "experiments", observation.stamp.localDate, record.title, [
						observation.happened,
						observation.action,
						observation.observation
					].filter((value) => value.length > 0).join("\n"));
					if (record.status === "revised") add(record, "changes", localDateAt(record.updatedAt, range.startStamp.timeZone), record.title, [record.result, record.judgment].filter((value) => value.length > 0).join("\n"));
				}
			}
			const sourceRecords = [...sources.values()].map(({ record, localDates }) => ({
				id: record.id,
				sourceType: record.recordType,
				fingerprint: periodReviewFingerprint(record),
				localDates: [...localDates].sort()
			})).sort((left, right) => `${left.sourceType}:${left.id}`.localeCompare(`${right.sourceType}:${right.id}`));
			if (sourceRecords.length > this.options.maxPeriodReviewSources) throw new ReflectionBusinessError({
				code: "period-review-source-limit",
				sourceCount: sourceRecords.length,
				maxSources: this.options.maxPeriodReviewSources
			});
			const sortedItems = items.sort((left, right) => left.localDate.localeCompare(right.localDate) || left.category.localeCompare(right.category) || left.sourceId.localeCompare(right.sourceId));
			return Object.freeze({
				periodType: range.periodType,
				startStamp: snapshotStamp(range.startStamp),
				endStamp: snapshotStamp(range.endStamp),
				sources: Object.freeze(sourceRecords.map(snapshotPeriodReviewSource)),
				items: Object.freeze(sortedItems),
				materialHash: periodReviewSourceHash(sourceRecords)
			});
		}
		resolveExperimentSource(agent, source) {
			if (source === void 0) return null;
			const evidenceQuote = this.text(source.evidenceQuote, "evidenceQuote", this.options.maxExperimentFieldBytes, true);
			const message = agent.session.events.flatMap((event) => event.type === "user/message" && event.data.id === source.messageId ? [event.data] : [])[0];
			if (message === void 0 || message.source.kind !== "user") throw new ReflectionBusinessError({
				code: "experiment-source-invalid",
				reason: "message-not-found"
			});
			if (!message.content.flatMap((block) => block.type === "text" ? [block.text] : []).join("\n").includes(evidenceQuote)) throw new ReflectionBusinessError({
				code: "experiment-source-invalid",
				reason: "quote-not-found"
			});
			return {
				messageId: source.messageId,
				evidenceQuote
			};
		}
		resolveOpenQuestionSource(agent, records, source) {
			if (source === void 0) return null;
			const evidenceQuote = this.text(source.evidenceQuote, "evidenceQuote", this.options.maxOpenQuestionBytes, true);
			if (source.kind === "message") {
				const message = agent.session.events.flatMap((event) => event.type === "user/message" && event.data.id === source.messageId ? [event.data] : [])[0];
				if (message === void 0 || message.source.kind !== "user") throw new ReflectionBusinessError({
					code: "open-question-source-invalid",
					reason: "message-not-found"
				});
				if (!message.content.flatMap((block) => block.type === "text" ? [block.text] : []).join("\n").includes(evidenceQuote)) throw new ReflectionBusinessError({
					code: "open-question-source-invalid",
					reason: "quote-not-found"
				});
				return {
					kind: "message",
					messageId: source.messageId,
					evidenceQuote
				};
			}
			const journal = records.find((record) => record.recordType === "journal" && record.id === source.journalId);
			if (journal === void 0) throw new ReflectionBusinessError({
				code: "open-question-source-invalid",
				reason: "journal-not-found"
			});
			if (journal.version !== source.ifVersion) throw new ReflectionBusinessError({
				code: "open-question-source-invalid",
				reason: "journal-version-conflict"
			});
			if (!`${journal.title}\n${journal.body}`.includes(evidenceQuote)) throw new ReflectionBusinessError({
				code: "open-question-source-invalid",
				reason: "quote-not-found"
			});
			return {
				kind: "journal",
				journalId: journal.id,
				journalVersion: journal.version,
				evidenceQuote
			};
		}
		validateConcernLimit(value) {
			return this.validateListLimit(value, this.options.maxConcernsPerList);
		}
		validateListLimit(value, maximum) {
			const limit = value ?? maximum;
			if (!Number.isSafeInteger(limit) || limit < 1 || limit > maximum) return this.invalid("limit", "invalid");
			return limit;
		}
		validatePrincipleContent(records, value) {
			const supportingExperiences = value.supportingExperiences.map((experience) => {
				const summary = this.text(experience.summary, "supportingExperiences", this.options.maxPrincipleFieldBytes, true);
				if (experience.sourceContemplationId !== void 0) this.requireConfirmedContemplation(records, experience.sourceContemplationId);
				return {
					summary,
					sourceContemplationId: experience.sourceContemplationId ?? null
				};
			});
			if (supportingExperiences.length > this.options.maxPrincipleItems) this.invalid("supportingExperiences", "too-many");
			if (new Set(supportingExperiences.map((experience) => experience.summary)).size !== supportingExperiences.length) this.invalid("supportingExperiences", "duplicate");
			const appliesTo = this.validatePrincipleItems(value.appliesTo, "appliesTo");
			const notAppliesTo = this.validatePrincipleItems(value.notAppliesTo, "notAppliesTo");
			return {
				expression: this.text(value.expression, "expression", this.options.maxPrincipleFieldBytes, true),
				formationContext: this.text(value.formationContext, "formationContext", this.options.maxPrincipleFieldBytes, false),
				userQuote: this.text(value.userQuote, "userQuote", this.options.maxPrincipleFieldBytes, true),
				supportingExperiences,
				counterexample: this.text(value.counterexample, "counterexample", this.options.maxPrincipleFieldBytes, false),
				appliesTo,
				notAppliesTo,
				lastChallenged: this.text(value.lastChallenged, "lastChallenged", this.options.maxPrincipleFieldBytes, false),
				status: value.status
			};
		}
		validatePrincipleItems(values, field) {
			if (values.length > this.options.maxPrincipleItems) this.invalid(field, "too-many");
			const items = values.map((value) => this.text(value, field, this.options.maxPrincipleFieldBytes, true));
			if (new Set(items).size !== items.length) this.invalid(field, "duplicate");
			return items;
		}
		text(value, field, maxBytes, required) {
			const text = value.trim();
			if (required && text.length === 0) this.invalid(field, "blank");
			if (Buffer.byteLength(text, "utf8") > maxBytes) this.invalid(field, "too-large", maxBytes);
			return text;
		}
		invalid(field, reason, maxBytes) {
			throw new ReflectionBusinessError({
				code: "invalid-field",
				field,
				reason,
				...maxBytes === void 0 ? {} : { maxBytes }
			});
		}
		async readRecords() {
			const entries = await this.ctx.mindGardenVault.entries("reflections");
			let records;
			try {
				records = entries.map(([id, value]) => {
					const record = decodeStoredReflection(value);
					if (record.id !== id) throw new TypeError("vault id differs from authenticated reflection id");
					return record;
				});
			} catch (error) {
				throw new CorruptReflectionStoreError("Mind Garden reflection plaintext record is invalid", { cause: error });
			}
			const contemplationSessions = /* @__PURE__ */ new Set();
			const evidencedExperimentSessions = /* @__PURE__ */ new Set();
			const openQuestionSources = /* @__PURE__ */ new Set();
			for (const record of records) {
				if (record.recordType === "contemplation") {
					if (contemplationSessions.has(record.sourceSessionId)) throw new CorruptReflectionStoreError("multiple contemplation notes share one source Session");
					contemplationSessions.add(record.sourceSessionId);
				}
				if (record.recordType === "experiment" && record.sourceMessageId !== null) {
					if (evidencedExperimentSessions.has(record.sourceSessionId)) throw new CorruptReflectionStoreError("multiple evidenced experiments share one source Session");
					evidencedExperimentSessions.add(record.sourceSessionId);
				}
				if (record.recordType === "period-review" && periodReviewSourceHash(record.sources) !== record.sourceHash) throw new CorruptReflectionStoreError("period review source hash differs from its source snapshot");
				if (record.recordType === "open-question" && record.source !== null) {
					const sourceKey = record.source.kind === "message" ? `message:${record.source.messageId}` : `journal:${record.source.journalId}`;
					if (openQuestionSources.has(sourceKey)) throw new CorruptReflectionStoreError("multiple open questions share one exact evidence source");
					openQuestionSources.add(sourceKey);
				}
			}
			this.assertPrincipleRecordIntegrity(records);
			for (const concern of records.filter((record) => record.recordType === "concern" && record.status === "converting" && record.conversion !== null)) {
				const settled = await this.settleConcernConversion(records, concern);
				records = [
					...records.filter((record) => record.id !== settled.concern.id && record.id !== settled.journal.id),
					settled.concern,
					settled.journal
				];
			}
			return records;
		}
		async writeRecord(record) {
			const validated = decodeStoredReflection(record);
			await this.ctx.mindGardenVault.put("reflections", MindGardenVaultRecordId(validated.id), validated);
		}
		requireJournal(records, id) {
			const journal = records.find((record) => record.recordType === "journal" && record.id === id);
			if (journal === void 0) throw new ReflectionBusinessError({
				code: "journal-not-found",
				id
			});
			return journal;
		}
		requireConcern(records, id) {
			const concern = records.find((record) => record.recordType === "concern" && record.id === id);
			if (concern === void 0) throw new ReflectionBusinessError({
				code: "concern-not-found",
				id
			});
			return concern;
		}
		requireContemplation(records, id) {
			const contemplation = records.find((record) => record.recordType === "contemplation" && record.id === id);
			if (contemplation === void 0) throw new ReflectionBusinessError({
				code: "contemplation-not-found",
				id
			});
			return contemplation;
		}
		requireConfirmedContemplation(records, id) {
			const contemplation = records.find((record) => record.recordType === "contemplation" && record.id === id);
			if (contemplation === void 0) throw new ReflectionBusinessError({
				code: "principle-source-invalid",
				reason: "contemplation-not-found"
			});
			if (contemplation.status !== "confirmed") throw new ReflectionBusinessError({
				code: "principle-source-invalid",
				reason: "not-confirmed"
			});
			return contemplation;
		}
		requirePrinciple(records, id) {
			const principle = records.find((record) => record.recordType === "principle" && record.id === id);
			if (principle === void 0) throw new ReflectionBusinessError({
				code: "principle-not-found",
				id
			});
			return principle;
		}
		requirePrincipleProposal(records, id) {
			const proposal = records.find((record) => record.recordType === "principle-proposal" && record.id === id);
			if (proposal === void 0) throw new ReflectionBusinessError({
				code: "principle-proposal-not-found",
				id
			});
			return proposal;
		}
		requireExperiment(records, id) {
			const experiment = records.find((record) => record.recordType === "experiment" && record.id === id);
			if (experiment === void 0) throw new ReflectionBusinessError({
				code: "experiment-not-found",
				id
			});
			return experiment;
		}
		requireOpenQuestion(records, id) {
			const question = records.find((record) => record.recordType === "open-question" && record.id === id);
			if (question === void 0) throw new ReflectionBusinessError({
				code: "open-question-not-found",
				id
			});
			return question;
		}
		requirePeriodReview(records, id) {
			const review = records.find((record) => record.recordType === "period-review" && record.id === id);
			if (review === void 0) throw new ReflectionBusinessError({
				code: "period-review-not-found",
				id
			});
			return review;
		}
		assertVersion(record, expected) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "version-conflict",
				current: snapshotJournal(record)
			});
		}
		assertConcernActive(record) {
			if (record.status !== "active") throw new ReflectionBusinessError({
				code: "concern-closed",
				current: snapshotConcern(record)
			});
		}
		assertConcernVersion(record, expected) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "concern-version-conflict",
				current: snapshotConcern(record)
			});
		}
		assertContemplationDraft(record) {
			if (record.status !== "draft") throw new ReflectionBusinessError({
				code: "contemplation-locked",
				current: snapshotContemplation(record)
			});
		}
		assertContemplationVersion(record, expected) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "contemplation-version-conflict",
				current: snapshotContemplation(record)
			});
		}
		assertPrincipleVersion(record, expected) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "principle-version-conflict",
				current: snapshotPrinciple(record)
			});
		}
		assertPrincipleProposalVersion(records, record, expected) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "principle-proposal-version-conflict",
				current: snapshotPrincipleProposal(record, acceptedPrincipleProposal(records, record.id))
			});
		}
		principleProposalClosed(records, record) {
			throw new ReflectionBusinessError({
				code: "principle-proposal-closed",
				current: snapshotPrincipleProposal(record, acceptedPrincipleProposal(records, record.id))
			});
		}
		assertPrincipleVersionCapacity(record) {
			if (record.versions.length >= this.options.maxPrincipleVersions) throw new ReflectionBusinessError({
				code: "principle-version-limit",
				id: reflectionId(record.id),
				maxVersions: this.options.maxPrincipleVersions
			});
		}
		assertExperimentVersion(record, expected) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "experiment-version-conflict",
				current: snapshotExperiment(record)
			});
		}
		assertOpenQuestionVersion(record, expected, records) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "open-question-version-conflict",
				current: snapshotOpenQuestion(record, records)
			});
		}
		assertPeriodReviewVersion(record, expected, records) {
			if (record.version !== expected) throw new ReflectionBusinessError({
				code: "period-review-version-conflict",
				current: snapshotPeriodReview(record, records)
			});
		}
		experimentStateConflict(record) {
			throw new ReflectionBusinessError({
				code: "experiment-state-conflict",
				current: snapshotExperiment(record)
			});
		}
		assertPrincipleRecordIntegrity(records) {
			const proposals = new Map(records.flatMap((record) => record.recordType === "principle-proposal" ? [[record.id, record]] : []));
			const accepted = /* @__PURE__ */ new Set();
			for (const principle of records.filter((record) => record.recordType === "principle")) for (const version of principle.versions) {
				if (version.sourceProposalId === null) continue;
				const proposal = proposals.get(version.sourceProposalId);
				if (proposal === void 0 || proposal.status !== "proposed" || accepted.has(proposal.id) || version.sourceContemplationId !== proposal.sourceContemplationId || JSON.stringify(version.content) !== JSON.stringify(proposal.content) || (proposal.targetPrincipleId === null ? version.number !== 1 : proposal.targetPrincipleId !== principle.id || version.number === 1)) throw new CorruptReflectionStoreError("principle history carries an invalid proposal acceptance");
				accepted.add(proposal.id);
			}
		}
		async settleConcernConversion(records, concern) {
			const plan = concern.conversion;
			const intended = storedJournalSchema.parse({
				recordType: "journal",
				formatVersion: 1,
				id: plan.journalId,
				version: plan.journalVersion,
				stamp: plan.stamp,
				title: "",
				body: concern.content,
				allowRetrieval: plan.allowRetrieval,
				sourceSessionId: concern.sourceSessionId,
				createdAt: plan.createdAt,
				updatedAt: plan.createdAt
			});
			const existing = records.find((record) => record.id === plan.journalId);
			let journal;
			if (existing === void 0) {
				journal = intended;
				await this.writeRecord(journal);
			} else {
				if (existing.recordType !== "journal" || JSON.stringify(existing) !== JSON.stringify(intended)) throw new CorruptReflectionStoreError("concern conversion journal differs from its recovery plan");
				journal = existing;
			}
			const completed = storedConcernSchema.parse({
				...concern,
				version: plan.finalConcernVersion,
				status: "converted",
				convertedJournalId: plan.journalId,
				conversion: null,
				updatedAt: plan.createdAt
			});
			await this.writeRecord(completed);
			return {
				concern: completed,
				journal
			};
		}
		convertFailure(error) {
			if (error instanceof ReflectionBusinessError) return rejected(error.failure);
			if (error instanceof CorruptReflectionStoreError) return rejected({
				code: "vault-unavailable",
				state: "corrupt-state"
			});
			if (isMindGardenVaultError(error)) return rejected({
				code: "vault-unavailable",
				state: error.code === "locked" ? "locked" : error.code === "invalid-key" ? "invalid-key" : error.code === "key-mismatch" ? "key-mismatch" : "corrupt-state"
			});
			throw error;
		}
		enqueue(operation) {
			if (!this.admissionOpen) return Promise.reject(/* @__PURE__ */ new Error("mind-garden-reflection: service is disposing"));
			const result = this.operationTail.then(operation).catch((error) => {
				if (!isMindGardenVaultError(error)) throw error;
				return rejected({
					code: "vault-unavailable",
					state: error.code === "locked" ? "locked" : error.code === "invalid-key" ? "invalid-key" : error.code === "key-mismatch" ? "key-mismatch" : "corrupt-state"
				});
			});
			this.operationTail = result.then(() => void 0, () => void 0);
			return result;
		}
	};
})();
//#endregion
export { MindGardenReflectionService, MindGardenReflectionService as default, decodeStoredReflection, name, storedCheckinSchema, storedConcernSchema, storedContemplationSchema, storedExperimentSchema, storedJournalSchema, storedOpenQuestionSchema, storedPeriodReviewSchema, storedPrincipleProposalSchema, storedPrincipleSchema };
