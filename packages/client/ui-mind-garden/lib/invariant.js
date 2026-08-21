//#region lib/types/invariant.js
/** Package-owned invariant companion for the Mind Garden UI. @module @deepseek-ai/dsh-mind-garden/ui/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/ui";
/** Cordis companion plugin name. */
const name = "client-ui-mind-garden-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
const install = () => {};
/** Register the package-owned invariant seat. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
