import { fileURLToPath } from "node:url";
import * as SkillFileSystem from "@deepseek-ai/dsh-skill-filesystem";
//#region lib/types/index.js
/**
* Packaged Harness-native skills for Mind Garden.
*
* The package delegates parsing, discovery, invocation policy, precedence,
* and resource loading to the first-party filesystem provider. Its isolated
* bundled root is immutable at runtime and does not watch the installed npm
* package.
*
* @module @deepseek-ai/dsh-mind-garden/skills
*/
const SKILLS_ROOT = fileURLToPath(new URL("../skills/", import.meta.url));
/** Cordis plugin name. */
const name = "mind-garden-skills";
/** Service required by the bundled skill provider. */
const inject = ["skills"];
/**
* Register the immutable Mind Garden skill root through the first-party provider.
* @param ctx - Host context carrying the skill registry.
*/
function apply(ctx) {
	SkillFileSystem.apply(ctx, {
		providerName: "mind-garden",
		includeDefaultRoots: false,
		bundledSkillDir: SKILLS_ROOT,
		watch: false
	});
}
//#endregion
export { apply, inject, name };
