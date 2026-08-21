//#region lib/types/invariant.js
/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/media/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/media";
/** Cordis companion plugin name. */
const name = "mind-garden-media-invariant";
/** Services required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** Authenticated reads own validation of every encrypted media record and reference. */
const install = Object.assign(() => {}, { inject: ["mindGardenMedia"] });
/** Register the package's invariant ownership. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
