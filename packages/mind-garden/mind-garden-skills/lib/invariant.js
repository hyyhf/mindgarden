//#region lib/types/invariant.js
/** Package-owned invariant companion for Mind Garden skills. @module @deepseek-ai/dsh-mind-garden/skills/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/skills";
/** Cordis companion plugin name. */
const name = "mind-garden-skills-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the first-party filesystem provider owns catalog
* parsing, registration lifecycle, precedence, and loaded-body validation.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
