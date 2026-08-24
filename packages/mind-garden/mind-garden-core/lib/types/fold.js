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
function decodeDisclosureAcceptance(value) {
    if (value === null)
        return null;
    if (!isRecord(value)
        || Object.keys(value).sort().join(',') !== 'acceptedAt,contractVersion,locale') {
        throw new Error('Mind Garden disclosure acceptance must be null or an exact receipt');
    }
    if (value['locale'] !== 'zh-CN' && value['locale'] !== 'en') {
        throw new Error('Mind Garden disclosure acceptance locale is invalid');
    }
    return {
        acceptedAt: nonNegativeInteger(value['acceptedAt'], 'disclosure acceptedAt'),
        locale: value['locale'],
        contractVersion: positiveInteger(value['contractVersion'], 'disclosure contractVersion'),
    };
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
    if (value['version'] !== 1 && value['version'] !== MIND_GARDEN_STATE_VERSION) {
        throw new Error(`unsupported Mind Garden session-state version ${String(value['version'])}`);
    }
    const version = value['version'];
    const expectedKeys = version === 1
        ? 'operation,state,version'
        : 'disclosureAcceptance,operation,state,version';
    if (Object.keys(value).sort().join(',') !== expectedKeys) {
        throw new Error(`Mind Garden session-state event version ${String(version)} has invalid fields`);
    }
    if (typeof value['operation'] !== 'string'
        || !OPERATIONS.has(value['operation'])) {
        throw new Error('Mind Garden session-state operation is invalid');
    }
    const event = {
        version,
        operation: value['operation'],
        state: decodeState(value['state']),
    };
    return version === 1
        ? event
        : { ...event, disclosureAcceptance: decodeDisclosureAcceptance(value['disclosureAcceptance']) };
}
function requireDisclosureReceipt(change) {
    if (change.version === 1)
        return;
    const receipt = change.disclosureAcceptance ?? null;
    const recordsAcceptance = change.operation === 'accept-disclosure'
        || (change.operation === 'activate' && change.state.modelDisclosureAccepted);
    if (recordsAcceptance !== (receipt !== null)) {
        throw new Error('Mind Garden disclosure acceptance receipt does not match the state transition');
    }
    if (receipt !== null
        && (receipt.acceptedAt !== change.state.updatedAt
            || receipt.contractVersion !== change.state.contractVersion)) {
        throw new Error('Mind Garden disclosure acceptance receipt does not match the accepted contract');
    }
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
    requireDisclosureReceipt(change);
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