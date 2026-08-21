/** Package-owned ciphertext-domain invariant companion. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "mind-garden-vault-invariant";
/** Service required before the companion can reserve package ownership. */
export declare const inject: string[];
/** Register the invariant installer. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map