/**
 * Deterministic input triage and pre-publication output guard for activated
 * Mind Garden sessions.
 * @module @deepseek-ai/dsh-mind-garden/safety
 */
import z from '@deepseek-ai/schemastery';
import { isAgentLoopRequest, } from '@deepseek-ai/dsh-llm';
import { assessMindGardenInput, recoverMindGardenSafetyState } from "./classifier.js";
import { assessMindGardenOutput, renderMindGardenGuardReplacement, renderMindGardenSupportResponse, } from "./output-guard.js";
export { mindGardenSafetyResources, MIND_GARDEN_RESOURCE_FALLBACK } from "./resources.js";
export { assessMindGardenInput, normalizeMindGardenSafetyText, recoverMindGardenSafetyState, } from "./classifier.js";
export { assessMindGardenOutput, renderMindGardenGuardReplacement, renderMindGardenSupportResponse, } from "./output-guard.js";
/** Cordis plugin name used by Loader diagnostics. */
export const name = 'mind-garden-safety';
/** Services needed to resolve exact live sessions and flush safety decisions. */
export const inject = ['agents', 'llm', 'mindGarden', 'sessions'];
/** Schemastery validation for {@link Config}. */
export const Config = z.object({
    maxModelOutputTokens: z.number().default(4_096),
    maxBufferedCharacters: z.number().default(524_288),
    maxBufferedChunks: z.number().default(16_384),
});
/** Resolve defaults and reject programmatic callers that bypass the schema. */
function resolveConfig(config) {
    const maxModelOutputTokens = config.maxModelOutputTokens ?? 4_096;
    const maxBufferedCharacters = config.maxBufferedCharacters ?? 524_288;
    const maxBufferedChunks = config.maxBufferedChunks ?? 16_384;
    if (!Number.isSafeInteger(maxModelOutputTokens) || maxModelOutputTokens < 1) {
        throw new Error('mind-garden-safety: maxModelOutputTokens must be a positive safe integer');
    }
    if (!Number.isSafeInteger(maxBufferedCharacters) || maxBufferedCharacters < 1) {
        throw new Error('mind-garden-safety: maxBufferedCharacters must be a positive safe integer');
    }
    if (!Number.isSafeInteger(maxBufferedChunks) || maxBufferedChunks < 1) {
        throw new Error('mind-garden-safety: maxBufferedChunks must be a positive safe integer');
    }
    return { maxModelOutputTokens, maxBufferedCharacters, maxBufferedChunks };
}
/** Find the step whose request is currently entering `llm/stream`. */
function openStep(session) {
    for (let index = session.events.length - 1; index >= 0; index -= 1) {
        const event = session.events[index];
        if (event?.type === 'step/end')
            return undefined;
        if (event?.type === 'step/start') {
            return { turn: event.data.turn, step: event.data.step, startSeq: event.seq };
        }
    }
    return undefined;
}
/** Human messages entered after the current step boundary. */
function enteredHumanMessages(session, step) {
    return session.events.slice(step.startSeq + 1).flatMap((event) => event.type === 'user/message' && event.data.source.kind === 'user' ? [event.data] : []);
}
/** Concatenate only plain-text blocks from an entered human batch. */
function humanText(messages) {
    return messages.flatMap(message => message.content.flatMap(block => block.type === 'text' ? [block.text] : []))
        .join('\n');
}
/** Last recorded assessment before the current step's idempotent append. */
function latestAssessment(events) {
    for (let index = events.length - 1; index >= 0; index -= 1) {
        const event = events[index];
        if (event?.type !== 'mind-garden/safety-assessment')
            continue;
        return event.data;
    }
    return undefined;
}
/** Existing idempotent assessment for a retried request in this step. */
function stepAssessment(events, step) {
    for (let index = events.length - 1; index >= 0; index -= 1) {
        const event = events[index];
        if (event?.type !== 'mind-garden/safety-assessment')
            continue;
        if (event.data.turn === step.turn && event.data.step === step.step)
            return event.data;
    }
    return undefined;
}
/** Create and append the assessment for a step's exact entered human batch. */
function assessStep(session, step, messages) {
    const existing = stepAssessment(session.events, step);
    if (existing !== undefined)
        return existing;
    const text = humanText(messages);
    const previous = latestAssessment(session.events)?.assessment;
    const assessment = recoverMindGardenSafetyState(assessMindGardenInput(text), previous, text);
    const data = {
        version: 1,
        turn: step.turn,
        step: step.step,
        inputMessageIds: messages.map(message => message.id),
        assessment,
        response: assessment.level > 0 ? 'local' : 'model-guarded',
    };
    session.append('mind-garden/safety-assessment', data);
    return data;
}
/** Canonical successful text stream used for local and replacement responses. */
function textStream(text, usage) {
    return [
        { type: 'block-start', index: 0, blockType: 'text' },
        { type: 'text-delta', index: 0, text },
        { type: 'block-end', index: 0, block: { type: 'text', text } },
        ...usage === undefined ? [] : [{ type: 'usage', usage }],
        { type: 'finish', reason: { kind: 'stop' } },
    ];
}
/** Extract complete text/reasoning blocks and the provider's last usage record. */
function bufferedResult(chunks) {
    const text = chunks.flatMap(chunk => chunk.type === 'block-end' && (chunk.block.type === 'text' || chunk.block.type === 'reasoning')
        ? [chunk.block.text]
        : []).join('\n');
    let usage;
    for (const chunk of chunks)
        if (chunk.type === 'usage')
            usage = chunk.usage;
    return { text, ...usage === undefined ? {} : { usage } };
}
/** Append and flush the audit event before publishing its replacement chunks. */
async function recordOutputGuard(ctx, agent, step, reason, violations) {
    agent.session.append('mind-garden/output-guarded', {
        version: 1,
        turn: step.turn,
        step: step.step,
        reason,
        violations,
    });
    await ctx.sessions.flush(agent.session);
}
/**
 * Buffer one downstream stream, then publish either the original chunks or a
 * deterministic replacement. Downstream construction stays after the caller's
 * safety-assessment flush.
 */
function guardedModelStream(ctx, agent, step, assessment, next, config, signal) {
    return (async function* () {
        const chunks = [];
        let characters = 0;
        let limitExceeded = false;
        for await (const chunk of next()) {
            signal?.throwIfAborted();
            chunks.push(chunk);
            characters += JSON.stringify(chunk).length;
            if (chunks.length > config.maxBufferedChunks || characters > config.maxBufferedCharacters) {
                limitExceeded = true;
                break;
            }
        }
        signal?.throwIfAborted();
        const buffered = bufferedResult(chunks);
        const violations = limitExceeded ? [] : assessMindGardenOutput(buffered.text, assessment);
        if (limitExceeded || violations.length > 0) {
            const reason = limitExceeded ? 'buffer-limit' : 'policy-violation';
            await recordOutputGuard(ctx, agent, step, reason, violations);
            signal?.throwIfAborted();
            yield* textStream(renderMindGardenGuardReplacement(reason, violations), buffered.usage);
            return;
        }
        yield* chunks;
    })();
}
/**
 * Install deterministic safety routing. Elevated entered-human input is
 * answered locally without constructing the downstream model stream. Ordinary
 * responses remain buffered until the complete output passes policy checks.
 * @param ctx - plugin context carrying live Agent, Session, LLM, and Mind Garden services.
 * @param config - pre-publication buffering limits.
 */
export function apply(ctx, config) {
    const resolved = resolveConfig(config);
    ctx.on('agent/request', async ({ agent }, next) => {
        const request = await next();
        if (ctx.mindGarden.current(agent.session) === null)
            return request;
        const maxTokens = request.maxTokens === undefined
            ? resolved.maxModelOutputTokens
            : Math.min(request.maxTokens, resolved.maxModelOutputTokens);
        return request.maxTokens === maxTokens ? request : { ...request, maxTokens };
    });
    ctx.on('llm/stream', (options, next) => {
        if (!isAgentLoopRequest(options) || options.sessionId === undefined)
            return next();
        const agent = ctx.agents.get(options.sessionId);
        if (agent === undefined || ctx.mindGarden.current(agent.session) === null)
            return next();
        const step = openStep(agent.session);
        if (step === undefined)
            return next();
        return (async function* () {
            const messages = enteredHumanMessages(agent.session, step);
            const assessmentEvent = messages.length === 0
                ? stepAssessment(agent.session.events, step)
                : assessStep(agent.session, step, messages);
            if (assessmentEvent !== undefined)
                await ctx.sessions.flush(agent.session);
            options.signal?.throwIfAborted();
            if (assessmentEvent !== undefined && assessmentEvent.assessment.level > 0) {
                yield* textStream(renderMindGardenSupportResponse(assessmentEvent.assessment));
                return;
            }
            yield* guardedModelStream(ctx, agent, step, assessmentEvent?.assessment, next, resolved, options.signal);
        })();
    });
}
//# sourceMappingURL=index.js.map