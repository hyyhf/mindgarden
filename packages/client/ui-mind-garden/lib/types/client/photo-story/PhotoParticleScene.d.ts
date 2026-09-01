/** Interactive Three.js reconstruction of one verified photo attachment. */
import type { MindGardenPhotoParticleConfig } from '@deepseek-ai/dsh-mind-garden/media/types';
/** Live scene controls retained by the React adapter between parameter changes. */
export interface PhotoParticleController {
    readonly count: number;
    update: (config: MindGardenPhotoParticleConfig) => void;
    recompose: () => void;
    dispose: () => void;
}
/** Mount a sampled, pointer-reactive photo field and return deterministic GPU teardown. */
export declare function mountPhotoParticleScene(host: HTMLDivElement, image: HTMLImageElement, initialConfig: MindGardenPhotoParticleConfig, reducedMotion: boolean): PhotoParticleController;
//# sourceMappingURL=PhotoParticleScene.d.ts.map