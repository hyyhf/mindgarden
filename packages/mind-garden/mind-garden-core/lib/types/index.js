/**
 * Event-sourced Mind Garden session identity and dialogue preferences.
 * @module @deepseek-ai/dsh-mind-garden/core
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { applyMindGardenEvent } from "./fold.js";
import { mindGardenProjectionDefinition } from "./projection.js";
import { MIND_GARDEN_CONTRACT_VERSION, MIND_GARDEN_STATE_VERSION, MindGardenError } from "./runtime.js";
export { MIND_GARDEN_CONTRACT_VERSION, MIND_GARDEN_STATE_VERSION, MindGardenError } from "./runtime.js";
export { applyMindGardenChange, applyMindGardenEvent, decodeMindGardenStateEvent, foldMindGarden } from "./fold.js";
export { applyMindGardenProjection, mindGardenProjectionDefinition, mindGardenProjectionSchema, mindGardenSessionStateSchema, } from "./projection.js";
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
            _remoteExportActivate_decorators = [Remote('activate')];
            _remoteExportSelectMode_decorators = [Remote('selectMode')];
            _remoteExportSelectSupportIntent_decorators = [Remote('selectSupportIntent')];
            _remoteExportAcceptModelDisclosure_decorators = [Remote('acceptModelDisclosure')];
            __esDecorate(this, null, _remoteExportActivate_decorators, { kind: "method", name: "remoteExportActivate", static: false, private: false, access: { has: obj => "remoteExportActivate" in obj, get: obj => obj.remoteExportActivate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remoteExportSelectMode_decorators, { kind: "method", name: "remoteExportSelectMode", static: false, private: false, access: { has: obj => "remoteExportSelectMode" in obj, get: obj => obj.remoteExportSelectMode }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remoteExportSelectSupportIntent_decorators, { kind: "method", name: "remoteExportSelectSupportIntent", static: false, private: false, access: { has: obj => "remoteExportSelectSupportIntent" in obj, get: obj => obj.remoteExportSelectSupportIntent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remoteExportAcceptModelDisclosure_decorators, { kind: "method", name: "remoteExportAcceptModelDisclosure", static: false, private: false, access: { has: obj => "remoteExportAcceptModelDisclosure" in obj, get: obj => obj.remoteExportAcceptModelDisclosure }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['agents', 'sessionProjections'];
        cells = (__runInitializers(this, _instanceExtraInitializers), new WeakMap());
        /**
         * Install the service and its read projection.
         * @param ctx - Cordis context carrying the session-projection registry.
         */
        constructor(ctx) {
            super(ctx, 'mindGarden');
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
            if (cell.state !== null) {
                throw new MindGardenError('this session is already a Mind Garden session', 'MIND_GARDEN_ALREADY_ACTIVE');
            }
            if (session.events.some(event => event.type === 'turn/start')) {
                throw new MindGardenError('Mind Garden activation requires a blank session', 'MIND_GARDEN_SESSION_NOT_BLANK');
            }
            const now = Date.now();
            const accepted = request.modelDisclosureAccepted ?? false;
            return this.commit(session, cell, 'activate', {
                revision: 1,
                activatedAt: now,
                updatedAt: now,
                mode: request.mode,
                supportIntent: request.supportIntent ?? 'auto',
                privacy: request.privacy,
                contractVersion: MIND_GARDEN_CONTRACT_VERSION,
                modelDisclosureAccepted: accepted,
            }, accepted ? {
                acceptedAt: now,
                locale: request.disclosureLocale ?? 'zh-CN',
                contractVersion: MIND_GARDEN_CONTRACT_VERSION,
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
            if (current.mode === mode)
                return { ...current };
            this.assertRevision(current, expectedRevision);
            return this.commit(session, cell, 'select-mode', this.next(current, { mode }));
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
            if (current.supportIntent === supportIntent)
                return { ...current };
            this.assertRevision(current, expectedRevision);
            return this.commit(session, cell, 'select-support-intent', this.next(current, { supportIntent }));
        }
        /**
         * Record model/provider disclosure acceptance.
         * @param session - owning session.
         * @param expectedRevision - caller's current revision.
         * @param locale - locale shown when the disclosure was accepted.
         * @returns current state when already accepted, otherwise the next revision.
         */
        acceptModelDisclosure(session, expectedRevision, locale = 'zh-CN') {
            const cell = this.sync(session);
            const current = this.requireCurrent(cell);
            if (current.modelDisclosureAccepted)
                return { ...current };
            this.assertRevision(current, expectedRevision);
            const next = this.next(current, { modelDisclosureAccepted: true });
            return this.commit(session, cell, 'accept-disclosure', next, {
                acceptedAt: next.updatedAt,
                locale,
                contractVersion: next.contractVersion,
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
         * @param locale - locale shown when the disclosure was accepted.
         * @returns the resulting state.
         */
        remoteExportAcceptModelDisclosure(agent, expectedRevision, locale) {
            this.assertLive(agent);
            return this.acceptModelDisclosure(agent.session, expectedRevision, locale);
        }
        /** Enforce exact live-Agent identity before accepting a Remote mutation. */
        assertLive(agent) {
            if (this.ctx.agents.get(agent.id) !== agent) {
                throw new MindGardenError(`agent "${agent.id}" is not live in this registry`, 'MIND_GARDEN_AGENT_NOT_LIVE');
            }
        }
        /** Bring a cache cell up to the session's current sequence. */
        sync(session) {
            let cell = this.cells.get(session);
            if (cell === undefined) {
                cell = { state: null, observedSeq: -1 };
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
            if (cell.state === null) {
                throw new MindGardenError('this session is not a Mind Garden session', 'MIND_GARDEN_NOT_ACTIVE');
            }
            return cell.state;
        }
        /** Enforce optimistic concurrency for a real state change. */
        assertRevision(current, expectedRevision) {
            if (current.revision !== expectedRevision) {
                throw new MindGardenError(`stale Mind Garden revision ${String(expectedRevision)}; current revision is ${String(current.revision)}`, 'MIND_GARDEN_STALE_REVISION');
            }
        }
        /** Build the next whole state. */
        next(current, patch) {
            return {
                ...current,
                ...patch,
                revision: current.revision + 1,
                updatedAt: Math.max(Date.now(), current.updatedAt),
            };
        }
        /** Append one whole-state event and advance the strict cell. */
        commit(session, cell, operation, state, disclosureAcceptance = null) {
            const data = {
                version: MIND_GARDEN_STATE_VERSION,
                operation,
                state,
                disclosureAcceptance,
            };
            const event = session.append('mind-garden/session-state', data);
            cell.state = applyMindGardenEvent(cell.state, event);
            cell.observedSeq = event.seq;
            return { ...state };
        }
    };
})();
export { MindGardenService };
export default MindGardenService;
//# sourceMappingURL=index.js.map