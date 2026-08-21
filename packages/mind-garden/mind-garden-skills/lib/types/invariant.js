/** Package-owned invariant companion for Mind Garden skills. @module @deepseek-ai/dsh-mind-garden/skills/invariant */
const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/skills';
/** Cordis companion plugin name. */
export const name = 'mind-garden-skills-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/**
 * No runtime invariant: the first-party filesystem provider owns catalog
 * parsing, registration lifecycle, precedence, and loaded-body validation.
 */
const install = () => { };
/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
/* jscpd:ignore-end */
//# sourceMappingURL=invariant.js.map