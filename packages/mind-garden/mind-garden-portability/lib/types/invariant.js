/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/portability/invariant */
const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/portability';
/** Cordis companion plugin name. */
export const name = 'mind-garden-portability-invariant';
/** Services required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/** Backup verification is complete inside each bounded export operation. */
const install = Object.assign(() => {
    // No runtime invariant: the plugin retains no state after each bounded export operation settles.
}, { inject: ['mindGardenPortability'] });
/** Register the package's invariant ownership. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map