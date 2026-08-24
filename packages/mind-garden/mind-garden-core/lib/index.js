import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { HarnessError } from "@deepseek-ai/dsh-llm";
import { z } from "zod";
//#region lib/types/runtime.js
/** Runtime constants and errors for the Mind Garden state boundary. */
/** Boundary contract shipped by this plugin version. */
const MIND_GARDEN_CONTRACT_VERSION = 1;
/** Durable session-state event version. */
const MIND_GARDEN_STATE_VERSION = 2;
/** Error returned by the Mind Garden domain boundary. */
var MindGardenError = class extends HarnessError {
	/**
	* @param message - human-readable rejection reason.
	* @param code - stable machine-routable classification.
	*/
	constructor(message, code) {
		super(message, code);
	}
};
//#endregion
//#region lib/types/fold.js
/** Strict decoder and pure replay fold for durable Mind Garden state. */
const OPERATIONS = new Set([
	"activate",
	"select-mode",
	"select-support-intent",
	"accept-disclosure"
]);
const MODES = new Set(["serenity", "clarity"]);
const SUPPORT_INTENTS = new Set([
	"auto",
	"listen",
	"settle",
	"clarify",
	"next-step"
]);
const PRIVACY_POLICIES = new Set(["durable", "ephemeral"]);
/** Whether a value is a JSON record rather than an array. */
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Require one non-negative safe integer. */
function nonNegativeInteger(value, field) {
	if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error(`Mind Garden state ${field} must be a non-negative safe integer`);
	return value;
}
/** Require one positive safe integer. */
function positiveInteger(value, field) {
	const parsed = nonNegativeInteger(value, field);
	if (parsed < 1) throw new Error(`Mind Garden state ${field} must be positive`);
	return parsed;
}
function decodeDisclosureAcceptance(value) {
	if (value === null) return null;
	if (!isRecord(value) || Object.keys(value).sort().join(",") !== "acceptedAt,contractVersion,locale") throw new Error("Mind Garden disclosure acceptance must be null or an exact receipt");
	if (value["locale"] !== "zh-CN" && value["locale"] !== "en") throw new Error("Mind Garden disclosure acceptance locale is invalid");
	return {
		acceptedAt: nonNegativeInteger(value["acceptedAt"], "disclosure acceptedAt"),
		locale: value["locale"],
		contractVersion: positiveInteger(value["contractVersion"], "disclosure contractVersion")
	};
}
/** Decode one exact whole state. */
function decodeState(value) {
	if (!isRecord(value)) throw new Error("Mind Garden state must be a record");
	const keys = [
		"activatedAt",
		"contractVersion",
		"mode",
		"modelDisclosureAccepted",
		"privacy",
		"revision",
		"supportIntent",
		"updatedAt"
	];
	if (Object.keys(value).sort().join(",") !== keys.join(",")) throw new Error(`Mind Garden state must have exactly ${keys.join(",")} fields`);
	if (typeof value["mode"] !== "string" || !MODES.has(value["mode"])) throw new Error("Mind Garden state mode is invalid");
	if (typeof value["supportIntent"] !== "string" || !SUPPORT_INTENTS.has(value["supportIntent"])) throw new Error("Mind Garden state supportIntent is invalid");
	if (typeof value["privacy"] !== "string" || !PRIVACY_POLICIES.has(value["privacy"])) throw new Error("Mind Garden state privacy is invalid");
	if (typeof value["modelDisclosureAccepted"] !== "boolean") throw new Error("Mind Garden state modelDisclosureAccepted must be boolean");
	const activatedAt = nonNegativeInteger(value["activatedAt"], "activatedAt");
	const updatedAt = nonNegativeInteger(value["updatedAt"], "updatedAt");
	if (updatedAt < activatedAt) throw new Error("Mind Garden state updatedAt cannot precede activatedAt");
	return {
		revision: positiveInteger(value["revision"], "revision"),
		activatedAt,
		updatedAt,
		mode: value["mode"],
		supportIntent: value["supportIntent"],
		privacy: value["privacy"],
		contractVersion: positiveInteger(value["contractVersion"], "contractVersion"),
		modelDisclosureAccepted: value["modelDisclosureAccepted"]
	};
}
/**
* Decode one declared Mind Garden event payload.
* @param value - candidate session-event data.
* @returns validated whole-state change.
*/
function decodeMindGardenStateEvent(value) {
	if (!isRecord(value)) throw new Error("Mind Garden session-state event must be a record");
	if (value["version"] !== 1 && value["version"] !== 2) throw new Error(`unsupported Mind Garden session-state version ${String(value["version"])}`);
	const version = value["version"];
	const expectedKeys = version === 1 ? "operation,state,version" : "disclosureAcceptance,operation,state,version";
	if (Object.keys(value).sort().join(",") !== expectedKeys) throw new Error(`Mind Garden session-state event version ${String(version)} has invalid fields`);
	if (typeof value["operation"] !== "string" || !OPERATIONS.has(value["operation"])) throw new Error("Mind Garden session-state operation is invalid");
	const event = {
		version,
		operation: value["operation"],
		state: decodeState(value["state"])
	};
	return version === 1 ? event : {
		...event,
		disclosureAcceptance: decodeDisclosureAcceptance(value["disclosureAcceptance"])
	};
}
function requireDisclosureReceipt(change) {
	if (change.version === 1) return;
	const receipt = change.disclosureAcceptance ?? null;
	if ((change.operation === "accept-disclosure" || change.operation === "activate" && change.state.modelDisclosureAccepted) !== (receipt !== null)) throw new Error("Mind Garden disclosure acceptance receipt does not match the state transition");
	if (receipt !== null && (receipt.acceptedAt !== change.state.updatedAt || receipt.contractVersion !== change.state.contractVersion)) throw new Error("Mind Garden disclosure acceptance receipt does not match the accepted contract");
}
/** Require fields that no post-activation operation may change. */
function requireIdentity(current, next) {
	if (next.revision !== current.revision + 1) throw new Error("Mind Garden mutation must advance revision by one");
	if (next.activatedAt !== current.activatedAt || next.privacy !== current.privacy || next.contractVersion !== current.contractVersion) throw new Error("Mind Garden mutation cannot change activation, privacy, or contract identity");
	if (next.updatedAt < current.updatedAt) throw new Error("Mind Garden mutation timestamp cannot move backward");
}
/**
* Validate and apply one decoded whole-state change.
* @param current - prior durable state or null before activation.
* @param change - decoded state event.
* @returns the event's whole post-change state.
*/
function applyMindGardenChange(current, change) {
	requireDisclosureReceipt(change);
	const next = change.state;
	if (change.operation === "activate") {
		if (current !== null) throw new Error("Mind Garden activate requires an inactive session");
		if (next.revision !== 1 || next.updatedAt !== next.activatedAt) throw new Error("Mind Garden activate requires revision one with equal activation timestamps");
		return next;
	}
	if (current === null) throw new Error(`Mind Garden ${change.operation} requires an active session`);
	requireIdentity(current, next);
	switch (change.operation) {
		case "select-mode":
			if (next.mode === current.mode || next.supportIntent !== current.supportIntent || next.modelDisclosureAccepted !== current.modelDisclosureAccepted) throw new Error("Mind Garden select-mode must replace only mode");
			break;
		case "select-support-intent":
			if (next.supportIntent === current.supportIntent || next.mode !== current.mode || next.modelDisclosureAccepted !== current.modelDisclosureAccepted) throw new Error("Mind Garden select-support-intent must replace only supportIntent");
			break;
		case "accept-disclosure":
			if (current.modelDisclosureAccepted || !next.modelDisclosureAccepted || next.mode !== current.mode || next.supportIntent !== current.supportIntent) throw new Error("Mind Garden accept-disclosure must only accept a pending disclosure");
			break;
		/* v8 ignore next 3 -- activate returned above and MindGardenOperation is closed */
		default:
			change.operation;
			throw new Error("unknown Mind Garden operation");
	}
	return next;
}
/**
* Strictly apply one session event.
* @param current - prior durable state.
* @param event - next event in sequence order.
* @returns next durable state, or the same reference for an unrelated event.
*/
function applyMindGardenEvent(current, event) {
	if (event.type !== "mind-garden/session-state") return current;
	return applyMindGardenChange(current, decodeMindGardenStateEvent(event.data));
}
/**
* Fold current Mind Garden state from a contiguous session log.
* @param events - session events in sequence order.
* @returns detached current state or null before activation.
*/
function foldMindGarden(events) {
	let state = null;
	for (const event of events) state = applyMindGardenEvent(state, event);
	return state === null ? null : { ...state };
}
//#endregion
//#region lib/types/projection.js
/** Fail-soft read projection for the latest complete Mind Garden state. */
/** Runtime schema shared with Host-to-browser projection validation. */
const mindGardenSessionStateSchema = z.object({
	revision: z.number().int().positive(),
	activatedAt: z.number().int().nonnegative(),
	updatedAt: z.number().int().nonnegative(),
	mode: z.enum(["serenity", "clarity"]),
	supportIntent: z.enum([
		"auto",
		"listen",
		"settle",
		"clarify",
		"next-step"
	]),
	privacy: z.enum(["durable", "ephemeral"]),
	contractVersion: z.number().int().positive(),
	modelDisclosureAccepted: z.boolean()
}).strict().refine((value) => value.updatedAt >= value.activatedAt, {
	message: "updatedAt must not precede activatedAt",
	path: ["updatedAt"]
});
/** Wire schema for the current Mind Garden projection. */
const mindGardenProjectionSchema = z.union([z.object({ state: mindGardenSessionStateSchema }).strict(), z.null()]);
/**
* Fold one committed event into the lightweight read projection.
* @param state - prior complete state projection.
* @param event - next committed session event.
* @returns latest complete state, preserving reference identity for unrelated or malformed events.
*/
function applyMindGardenProjection(state, event) {
	if (event.type !== "mind-garden/session-state") return state;
	try {
		return { state: decodeMindGardenStateEvent(event.data).state };
	} catch (_invalidMindGardenState) {
		return state;
	}
}
/** Projection unit registered with DeepSeek Harness. */
const mindGardenProjectionDefinition = {
	key: "mind-garden",
	stateSchema: mindGardenProjectionSchema,
	init: () => null,
	apply: applyMindGardenProjection,
	wire: {
		viewSchema: mindGardenProjectionSchema,
		view: (state) => state
	},
	stateVersion: 1
};
//#endregion
//#region lib/types/index.js
/**
* Event-sourced Mind Garden session identity and dialogue preferences.
* @module @deepseek-ai/dsh-mind-garden/core
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
/** Write-side authority for the session-level Mind Garden state machine. */
let MindGardenService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _remoteExportActivate_decorators;
	let _remoteExportSelectMode_decorators;
	let _remoteExportSelectSupportIntent_decorators;
	let _remoteExportAcceptModelDisclosure_decorators;
	return class MindGardenService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_remoteExportActivate_decorators = [Remote("activate")];
			_remoteExportSelectMode_decorators = [Remote("selectMode")];
			_remoteExportSelectSupportIntent_decorators = [Remote("selectSupportIntent")];
			_remoteExportAcceptModelDisclosure_decorators = [Remote("acceptModelDisclosure")];
			__esDecorate(this, null, _remoteExportActivate_decorators, {
				kind: "method",
				name: "remoteExportActivate",
				static: false,
				private: false,
				access: {
					has: (obj) => "remoteExportActivate" in obj,
					get: (obj) => obj.remoteExportActivate
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _remoteExportSelectMode_decorators, {
				kind: "method",
				name: "remoteExportSelectMode",
				static: false,
				private: false,
				access: {
					has: (obj) => "remoteExportSelectMode" in obj,
					get: (obj) => obj.remoteExportSelectMode
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _remoteExportSelectSupportIntent_decorators, {
				kind: "method",
				name: "remoteExportSelectSupportIntent",
				static: false,
				private: false,
				access: {
					has: (obj) => "remoteExportSelectSupportIntent" in obj,
					get: (obj) => obj.remoteExportSelectSupportIntent
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _remoteExportAcceptModelDisclosure_decorators, {
				kind: "method",
				name: "remoteExportAcceptModelDisclosure",
				static: false,
				private: false,
				access: {
					has: (obj) => "remoteExportAcceptModelDisclosure" in obj,
					get: (obj) => obj.remoteExportAcceptModelDisclosure
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
		static inject = ["agents", "sessionProjections"];
		cells = (__runInitializers(this, _instanceExtraInitializers), /* @__PURE__ */ new WeakMap());
		/**
		* Install the service and its read projection.
		* @param ctx - Cordis context carrying the session-projection registry.
		*/
		constructor(ctx) {
			super(ctx, "mindGarden");
			ctx.sessionProjections.register(mindGardenProjectionDefinition);
		}
		/**
		* Read a detached current state.
		* @param session - owning session.
		* @returns current whole state or null before activation.
		*/
		current(session) {
			const state = this.sync(session).state;
			return state === null ? null : { ...state };
		}
		/**
		* Activate a blank session as a Mind Garden session.
		* @param session - blank owning session.
		* @param request - immutable privacy policy and initial dialogue choices.
		* @returns revision-one state.
		*/
		activate(session, request) {
			const cell = this.sync(session);
			if (cell.state !== null) throw new MindGardenError("this session is already a Mind Garden session", "MIND_GARDEN_ALREADY_ACTIVE");
			if (session.events.some((event) => event.type === "turn/start")) throw new MindGardenError("Mind Garden activation requires a blank session", "MIND_GARDEN_SESSION_NOT_BLANK");
			const now = Date.now();
			const accepted = request.modelDisclosureAccepted ?? false;
			return this.commit(session, cell, "activate", {
				revision: 1,
				activatedAt: now,
				updatedAt: now,
				mode: request.mode,
				supportIntent: request.supportIntent ?? "auto",
				privacy: request.privacy,
				contractVersion: 1,
				modelDisclosureAccepted: accepted
			}, accepted ? {
				acceptedAt: now,
				locale: request.disclosureLocale ?? "zh-CN",
				contractVersion: 1
			} : null);
		}
		/**
		* Change the durable dialogue posture with compare-and-set semantics.
		* @param session - owning session.
		* @param expectedRevision - caller's current revision.
		* @param mode - requested posture.
		* @returns current state for a no-op, otherwise the next revision.
		*/
		selectMode(session, expectedRevision, mode) {
			const cell = this.sync(session);
			const current = this.requireCurrent(cell);
			if (current.mode === mode) return { ...current };
			this.assertRevision(current, expectedRevision);
			return this.commit(session, cell, "select-mode", this.next(current, { mode }));
		}
		/**
		* Change the requested support style with compare-and-set semantics.
		* @param session - owning session.
		* @param expectedRevision - caller's current revision.
		* @param supportIntent - requested response style.
		* @returns current state for a no-op, otherwise the next revision.
		*/
		selectSupportIntent(session, expectedRevision, supportIntent) {
			const cell = this.sync(session);
			const current = this.requireCurrent(cell);
			if (current.supportIntent === supportIntent) return { ...current };
			this.assertRevision(current, expectedRevision);
			return this.commit(session, cell, "select-support-intent", this.next(current, { supportIntent }));
		}
		/**
		* Record model/provider disclosure acceptance.
		* @param session - owning session.
		* @param expectedRevision - caller's current revision.
		* @returns current state when already accepted, otherwise the next revision.
		*/
		acceptModelDisclosure(session, expectedRevision, locale = "zh-CN") {
			const cell = this.sync(session);
			const current = this.requireCurrent(cell);
			if (current.modelDisclosureAccepted) return { ...current };
			this.assertRevision(current, expectedRevision);
			const next = this.next(current, { modelDisclosureAccepted: true });
			return this.commit(session, cell, "accept-disclosure", next, {
				acceptedAt: next.updatedAt,
				locale,
				contractVersion: next.contractVersion
			});
		}
		/**
		* Activate Mind Garden through the generated Remote boundary.
		* @param agent - exact live Agent resolved from the wire session identity.
		* @param request - immutable privacy policy and initial dialogue choices.
		* @returns revision-one state.
		*/
		remoteExportActivate(agent, request) {
			this.assertLive(agent);
			return this.activate(agent.session, request);
		}
		/**
		* Change dialogue posture through the generated Remote boundary.
		* @param agent - exact live Agent resolved from the wire session identity.
		* @param expectedRevision - caller's current projected revision.
		* @param mode - requested posture.
		* @returns the resulting state.
		*/
		remoteExportSelectMode(agent, expectedRevision, mode) {
			this.assertLive(agent);
			return this.selectMode(agent.session, expectedRevision, mode);
		}
		/**
		* Change support style through the generated Remote boundary.
		* @param agent - exact live Agent resolved from the wire session identity.
		* @param expectedRevision - caller's current projected revision.
		* @param supportIntent - requested response style.
		* @returns the resulting state.
		*/
		remoteExportSelectSupportIntent(agent, expectedRevision, supportIntent) {
			this.assertLive(agent);
			return this.selectSupportIntent(agent.session, expectedRevision, supportIntent);
		}
		/**
		* Accept the model/provider disclosure through the generated Remote boundary.
		* @param agent - exact live Agent resolved from the wire session identity.
		* @param expectedRevision - caller's current projected revision.
		* @returns the resulting state.
		*/
		remoteExportAcceptModelDisclosure(agent, expectedRevision, locale = "zh-CN") {
			this.assertLive(agent);
			return this.acceptModelDisclosure(agent.session, expectedRevision, locale);
		}
		/** Enforce exact live-Agent identity before accepting a Remote mutation. */
		assertLive(agent) {
			if (this.ctx.agents.get(agent.id) !== agent) throw new MindGardenError(`agent "${agent.id}" is not live in this registry`, "MIND_GARDEN_AGENT_NOT_LIVE");
		}
		/** Bring a cache cell up to the session's current sequence. */
		sync(session) {
			let cell = this.cells.get(session);
			if (cell === void 0) {
				cell = {
					state: null,
					observedSeq: -1
				};
				this.cells.set(session, cell);
			}
			for (const event of session.events.slice(cell.observedSeq + 1)) {
				cell.state = applyMindGardenEvent(cell.state, event);
				cell.observedSeq = event.seq;
			}
			return cell;
		}
		/** Require an activated session. */
		requireCurrent(cell) {
			if (cell.state === null) throw new MindGardenError("this session is not a Mind Garden session", "MIND_GARDEN_NOT_ACTIVE");
			return cell.state;
		}
		/** Enforce optimistic concurrency for a real state change. */
		assertRevision(current, expectedRevision) {
			if (current.revision !== expectedRevision) throw new MindGardenError(`stale Mind Garden revision ${String(expectedRevision)}; current revision is ${String(current.revision)}`, "MIND_GARDEN_STALE_REVISION");
		}
		/** Build the next whole state. */
		next(current, patch) {
			return {
				...current,
				...patch,
				revision: current.revision + 1,
				updatedAt: Math.max(Date.now(), current.updatedAt)
			};
		}
		/** Append one whole-state event and advance the strict cell. */
		commit(session, cell, operation, state, disclosureAcceptance = null) {
			const data = {
				version: 2,
				operation,
				state,
				disclosureAcceptance
			};
			const event = session.append("mind-garden/session-state", data);
			cell.state = applyMindGardenEvent(cell.state, event);
			cell.observedSeq = event.seq;
			return { ...state };
		}
	};
})();
//#endregion
export { MIND_GARDEN_CONTRACT_VERSION, MIND_GARDEN_STATE_VERSION, MindGardenError, MindGardenService, MindGardenService as default, applyMindGardenChange, applyMindGardenEvent, applyMindGardenProjection, decodeMindGardenStateEvent, foldMindGarden, mindGardenProjectionDefinition, mindGardenProjectionSchema, mindGardenSessionStateSchema };
