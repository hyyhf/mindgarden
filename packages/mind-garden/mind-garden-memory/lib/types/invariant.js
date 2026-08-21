/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/memory/invariant */
const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/memory';
/** Cordis companion plugin name. */
export const name = 'mind-garden-memory-invariant';
/** Services required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/**
 * The vault authenticates ciphertext and this package decodes every plaintext
 * snapshot before reads and writes. Serialized mutations and recoverable extraction
 * plans are the only record authorities.
 */
const install = Object.assign(() => {
    // No runtime invariant: authenticated decoding and recoverable write plans guard persisted boundaries.
}, { inject: ['mindGardenMemory'] });
/** Register the package's invariant ownership. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map