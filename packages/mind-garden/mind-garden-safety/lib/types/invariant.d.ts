/** Package-owned safety-event invariants. @module @deepseek-ai/dsh-mind-garden/safety/invariant */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "mind-garden-safety-invariant";
/** Service required before the companion can reserve package ownership. */
export declare const inject: string[];
/** Register the invariant installer. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map