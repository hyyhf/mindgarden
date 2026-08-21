/** Strict decoder and pure replay fold for durable Mind Garden state. */
import { MIND_GARDEN_STATE_VERSION } from "./runtime.js";
const OPERATIONS = new Set([
    'activate',
    'select-mode',
    'select-support-intent',
    'accept-disclosure',
]);
const MODES = new Set(['serenity', 'clarity']);
const SUPPORT_INTENTS = new Set([
    'auto', 'listen', 'settle', 'clarify', 'next-step',
]);
const PRIVACY_POLICIES = new Set(['durable', 'ephemeral']);
/** Whether a value is a JSON record rather than an array. */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** Require one non-negative safe integer. */
function nonNegativeInteger(value, field) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
        throw new Error(`Mind Garden state ${field} must be a non-negative safe integer`);
    }
    return value;
}
/** Require one positive safe integer. */
function positiveInteger(value, field) {
    const parsed = nonNegativeInteger(value, field);
    if (parsed < 1)
        throw new Error(`Mind Garden state ${field} must be positive`);
    return parsed;
}
/** Decode one exact whole state. */
function decodeState(value) {
    if (!isRecord(value))
        throw new Error('Mind Garden state must be a record');
    const keys = [
        'activatedAt', 'contractVersion', 'mode', 'modelDisclosureAccepted', 'privacy',
        'revision', 'supportIntent', 'updatedAt',
    ];
    if (Object.keys(value).sort().join(',') !== keys.join(',')) {
        throw new Error(`Mind Garden state must have exactly ${keys.join(',')} fields`);
    }
    if (typeof value['mode'] !== 'string' || !MODES.has(value['mode'])) {
        throw new Error('Mind Garden state mode is invalid');
    }
    if (typeof value['supportIntent'] !== 'string'
        || !SUPPORT_INTENTS.has(value['supportIntent'])) {
        throw new Error('Mind Garden state supportIntent is invalid');
    }
    if (typeof value['privacy'] !== 'string'
        || !PRIVACY_POLICIES.has(value['privacy'])) {
        throw new Error('Mind Garden state privacy is invalid');
    }
    if (typeof value['modelDisclosureAccepted'] !== 'boolean') {
        throw new Error('Mind Garden state modelDisclosureAccepted must be boolean');
    }
    const activatedAt = nonNegativeInteger(value['activatedAt'], 'activatedAt');
    const updatedAt = nonNegativeInteger(value['updatedAt'], 'updatedAt');
    if (updatedAt < activatedAt)
        throw new Error('Mind Garden state updatedAt cannot precede activatedAt');
    return {
        revision: positiveInteger(value['revision'], 'revision'),
        activatedAt,
        updatedAt,
        mode: value['mode'],
        supportIntent: value['supportIntent'],
        privacy: value['privacy'],
        contractVersion: positiveInteger(value['contractVersion'], 'contractVersion'),
        modelDisclosureAccepted: value['modelDisclosureAccepted'],
    };
}
/**
 * Decode one declared Mind Garden event payload.
 * @param value - candidate session-event data.
 * @returns validated whole-state change.
 */
export function decodeMindGardenStateEvent(value) {
    if (!isRecord(value))
        throw new Error('Mind Garden session-state event must be a record');
    if (Object.keys(value).sort().join(',') !== 'operation,state,version') {
        throw new Error('Mind Garden session-state event must have exactly operation,state,version fields');
    }
    if (value['version'] !== MIND_GARDEN_STATE_VERSION) {
        throw new Error(`unsupported Mind Garden session-state version ${String(value['version'])}`);
    }
    if (typeof value['operation'] !== 'string'
        || !OPERATIONS.has(value['operation'])) {
        throw new Error('Mind Garden session-state operation is invalid');
    }
    return {
        version: MIND_GARDEN_STATE_VERSION,
        operation: value['operation'],
        state: decodeState(value['state']),
    };
}
/** Require fields that no post-activation operation may change. */
function requireIdentity(current, next) {
    if (next.revision !== current.revision + 1) {
        throw new Error('Mind Garden mutation must advance revision by one');
    }
    if (next.activatedAt !== current.activatedAt
        || next.privacy !== current.privacy
        || next.contractVersion !== current.contractVersion) {
        throw new Error('Mind Garden mutation cannot change activation, privacy, or contract identity');
    }
    if (next.updatedAt < current.updatedAt) {
        throw new Error('Mind Garden mutation timestamp cannot move backward');
    }
}
/**
 * Validate and apply one decoded whole-state change.
 * @param current - prior durable state or null before activation.
 * @param change - decoded state event.
 * @returns the event's whole post-change state.
 */
export function applyMindGardenChange(current, change) {
    const next = change.state;
    if (change.operation === 'activate') {
        if (current !== null)
            throw new Error('Mind Garden activate requires an inactive session');
        if (next.revision !== 1 || next.updatedAt !== next.activatedAt) {
            throw new Error('Mind Garden activate requires revision one with equal activation timestamps');
        }
        return next;
    }
    if (current === null)
        throw new Error(`Mind Garden ${change.operation} requires an active session`);
    requireIdentity(current, next);
    switch (change.operation) {
        case 'select-mode':
            if (next.mode === current.mode
                || next.supportIntent !== current.supportIntent
                || next.modelDisclosureAccepted !== current.modelDisclosureAccepted) {
                throw new Error('Mind Garden select-mode must replace only mode');
            }
            break;
        case 'select-support-intent':
            if (next.supportIntent === current.supportIntent
                || next.mode !== current.mode
                || next.modelDisclosureAccepted !== current.modelDisclosureAccepted) {
                throw new Error('Mind Garden select-support-intent must replace only supportIntent');
            }
            break;
        case 'accept-disclosure':
            if (current.modelDisclosureAccepted
                || !next.modelDisclosureAccepted
                || next.mode !== current.mode
                || next.supportIntent !== current.supportIntent) {
                throw new Error('Mind Garden accept-disclosure must only accept a pending disclosure');
            }
            break;
        /* v8 ignore next 3 -- activate returned above and MindGardenOperation is closed */
        default:
            change.operation;
            throw new Error('unknown Mind Garden operation');
    }
    return next;
}
/**
 * Strictly apply one session event.
 * @param current - prior durable state.
 * @param event - next event in sequence order.
 * @returns next durable state, or the same reference for an unrelated event.
 */
export function applyMindGardenEvent(current, event) {
    if (event.type !== 'mind-garden/session-state')
        return current;
    return applyMindGardenChange(current, decodeMindGardenStateEvent(event.data));
}
/**
 * Fold current Mind Garden state from a contiguous session log.
 * @param events - session events in sequence order.
 * @returns detached current state or null before activation.
 */
export function foldMindGarden(events) {
    let state = null;
    for (const event of events)
        state = applyMindGardenEvent(state, event);
    return state === null ? null : { ...state };
}
//# sourceMappingURL=fold.js.map