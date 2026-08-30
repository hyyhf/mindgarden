/**
 * Deterministic input triage and pre-publication output guard for activated
 * Mind Garden sessions.
 * @module @deepseek-ai/dsh-mind-garden/safety
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export type * from './types.ts';
export { mindGardenSafetyResources, MIND_GARDEN_RESOURCE_FALLBACK, MIND_GARDEN_RESOURCE_FALLBACK_EN, } from './resources.ts';
export { assessMindGardenInput, detectMindGardenSafetyLocale, normalizeMindGardenSafetyText, recoverMindGardenSafetyState, } from './classifier.ts';
export { assessMindGardenOutput, renderMindGardenGuardReplacement, renderMindGardenSupportResponse, } from './output-guard.ts';
/** Cordis plugin name used by Loader diagnostics. */
export declare const name = "mind-garden-safety";
/** Services needed to resolve exact live sessions and flush safety decisions. */
export declare const inject: string[];
/** Deployment bounds for incremental model-output inspection. */
export interface Config {
    /** Optional deployment-owned output cap for each activated Mind Garden conversation request. */
    maxModelOutputTokens?: number;
    /** Maximum serialized characters inspected before fail-closed replacement. */
    maxBufferedCharacters?: number;
    /** Maximum chunks inspected before fail-closed replacement. */
    maxBufferedChunks?: number;
}
/** Schemastery validation for {@link Config}. */
export declare const Config: z<Config>;
/**
 * Install deterministic safety routing. Elevated entered-human input is
 * answered locally without constructing the downstream model stream. Ordinary
 * responses stream after a bounded private suffix passes policy checks.
 * @param ctx - plugin context carrying live Agent, Session, LLM, and Mind Garden services.
 * @param config - incremental inspection limits.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map