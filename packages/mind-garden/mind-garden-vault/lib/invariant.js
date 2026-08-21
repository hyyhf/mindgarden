//#region lib/types/private.js
/** Package-private runtime token shared by the vault and its invariant companion. */
const MIND_GARDEN_VAULT_ASSERT = Symbol("mind-garden-vault.assert");
//#endregion
//#region lib/types/invariant.js
/** Package-owned ciphertext-domain invariant companion. */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/vault";
/** Cordis companion plugin name. */
const name = "mind-garden-vault-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** Recheck the complete key/envelope relationship on startup and after vault-domain writes. */
const install = Object.assign((ctx, fail) => {
	ctx.mindGardenVault[MIND_GARDEN_VAULT_ASSERT](fail);
	ctx.on("domain/changed", (change) => {
		if (change.domain === "mind_garden_vault") ctx.mindGardenVault[MIND_GARDEN_VAULT_ASSERT](fail);
	}, { global: true });
}, { inject: ["mindGardenVault"] });
/** Register the invariant installer. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
