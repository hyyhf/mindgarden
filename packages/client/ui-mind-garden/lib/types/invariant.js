/** Package-owned invariant companion for the Mind Garden UI. @module @deepseek-ai/dsh-mind-garden/ui/invariant */
const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/ui';
/** Cordis companion plugin name. */
export const name = 'client-ui-mind-garden-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
// No runtime invariant: the surface owns one effect-scoped slot entry and no mutable cross-plugin state.
const install = () => { };
/** Register the package-owned invariant seat. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map