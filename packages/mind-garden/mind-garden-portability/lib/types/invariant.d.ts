/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/portability/invariant */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "mind-garden-portability-invariant";
/** Services required before the companion can reserve package ownership. */
export declare const inject: string[];
/** Register the package's invariant ownership. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map