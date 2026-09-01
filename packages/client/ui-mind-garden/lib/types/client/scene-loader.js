/** Lazy boundary for GPU renderers that are unnecessary in ordinary conversation. */
var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
const HEAVY_SCENES_URL = '/plugins/@deepseek-ai/dsh-mind-garden/ui/heavy-scenes.js';
let scenesPromise;
/**
 * Download and evaluate Three.js only after a GPU-backed garden space is visible.
 * A failed import is not cached, so a later mount can retry it.
 * @returns The shared renderer-module import; rejects when download or evaluation fails.
 */
export function loadMindGardenScenes() {
    scenesPromise ??= import(__rewriteRelativeImportExtension(/* @vite-ignore */ HEAVY_SCENES_URL))
        .catch((error) => {
        scenesPromise = undefined;
        throw error;
    });
    return scenesPromise;
}
//# sourceMappingURL=scene-loader.js.map