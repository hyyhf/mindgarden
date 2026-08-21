/** Package-owned invariant companion for the Mind Garden UI. @module @deepseek-ai/dsh-mind-garden/ui/invariant */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "client-ui-mind-garden-invariant";
/** Service required before the companion can reserve package ownership. */
export declare const inject: string[];
/** Register the package-owned invariant seat. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map