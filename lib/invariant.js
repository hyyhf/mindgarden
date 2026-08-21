//#region lib/types/invariant.js
/** Package-owned invariant companion for the Mind Garden bundle. @module @deepseek-ai/dsh-mind-garden/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden";
/** Cordis companion plugin name. */
const name = "mind-garden-bundle-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
const install = () => {};
/** Register the bundle's invariant seat. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
