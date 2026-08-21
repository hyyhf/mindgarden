/**
 * Packaged Harness-native skills for Mind Garden.
 *
 * The package delegates parsing, discovery, invocation policy, precedence,
 * and resource loading to the first-party filesystem provider. Its isolated
 * bundled root is immutable at runtime and does not watch the installed npm
 * package.
 *
 * @module @deepseek-ai/dsh-mind-garden/skills
 */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis plugin name. */
export declare const name = "mind-garden-skills";
/** Service required by the bundled skill provider. */
export declare const inject: string[];
/**
 * Register the immutable Mind Garden skill root through the first-party provider.
 * @param ctx - Host context carrying the skill registry.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map