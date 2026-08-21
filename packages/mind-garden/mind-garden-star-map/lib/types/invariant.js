/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/star-map/invariant */
const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/star-map';
/** Cordis companion plugin name. */
export const name = 'mind-garden-star-map-invariant';
/** Services required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/** Authenticated aggregate reads own profile, completion, and trait consistency validation. */
const install = Object.assign(() => {
    // No runtime invariant: every public operation strictly decodes the complete Star Map aggregate.
}, { inject: ['mindGardenStarMap'] });
/** Register the package's invariant ownership. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map