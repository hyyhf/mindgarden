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
/** React adapter that keeps a verified-image fallback visible when WebGL is unavailable. */
export declare function PhotoParticleScene({ src, alt, config, labels, onCount, recomposeToken, }: {
    readonly src: string;
    readonly alt: string;
    readonly config: MindGardenPhotoParticleConfig;
    readonly labels: {
        readonly scene: string;
        readonly loading: string;
        readonly fallback: string;
        readonly reduced: string;
    };
    readonly onCount?: (count: number) => void;
    readonly recomposeToken?: number;
}): import("react").JSX.Element;
//# sourceMappingURL=PhotoParticleScene.d.ts.map