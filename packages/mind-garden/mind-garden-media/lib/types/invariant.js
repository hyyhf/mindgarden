/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/media/invariant */
const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/media';
/** Cordis companion plugin name. */
export const name = 'mind-garden-media-invariant';
/** Services required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/** Authenticated reads own validation of every encrypted media record and reference. */
const install = Object.assign(() => {
    // No runtime invariant: every public operation authenticates and strictly decodes the media collection.
}, { inject: ['mindGardenMedia'] });
/** Register the package's invariant ownership. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map