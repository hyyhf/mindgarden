//#region lib/types/invariant.js
/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden/memory/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/memory";
/** Cordis companion plugin name. */
const name = "mind-garden-memory-invariant";
/** Services required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* The vault authenticates ciphertext and this package decodes every plaintext
* snapshot before reads and writes. Serialized mutations and recoverable extraction
* plans are the only record authorities.
*/
const install = Object.assign(() => {}, { inject: ["mindGardenMemory"] });
/** Register the package's invariant ownership. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
