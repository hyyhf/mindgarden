/** Lazy boundary for GPU renderers that are unnecessary in ordinary conversation. */
import type { PhotoParticleController } from './photo-story/PhotoParticleScene.tsx';
import type { GardenStarMapModel } from './star-map/model.ts';
interface HeavyScenesModule {
    readonly mountPhotoParticleScene: (host: HTMLElement, image: HTMLImageElement, config: Parameters<PhotoParticleController['update']>[0], reducedMotion: boolean) => PhotoParticleController;
    readonly mountGardenStarField: (host: HTMLElement, model: GardenStarMapModel, reducedMotion: boolean, selectedId?: string, onSelect?: (id: string) => void, onHover?: (id: string | null, x: number, y: number) => void) => () => void;
}
/**
 * Download and evaluate Three.js only after a GPU-backed garden space is visible.
 * A failed import is not cached, so a later mount can retry it.
 * @returns The shared renderer-module import; rejects when download or evaluation fails.
 */
export declare function loadMindGardenScenes(): Promise<HeavyScenesModule>;
export {};
//# sourceMappingURL=scene-loader.d.ts.map