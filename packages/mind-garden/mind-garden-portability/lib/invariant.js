//#region lib/types/invariant.js
/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/portability/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/portability";
/** Cordis companion plugin name. */
const name = "mind-garden-portability-invariant";
/** Services required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** Backup verification is complete inside each bounded export operation. */
const install = Object.assign(() => {}, { inject: ["mindGardenPortability"] });
/** Register the package's invariant ownership. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
