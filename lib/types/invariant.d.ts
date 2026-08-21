/** Package-owned invariant companion for the Mind Garden bundle. @module @deepseek-ai/dsh-mind-garden/invariant */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "mind-garden-bundle-invariant";
/** Service required before the companion can reserve package ownership. */
export declare const inject: string[];
/** Register the bundle's invariant seat. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map