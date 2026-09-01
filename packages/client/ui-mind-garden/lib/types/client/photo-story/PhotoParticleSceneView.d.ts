/** Lightweight React adapter for the lazily loaded photo particle renderer. */
import type { MindGardenPhotoParticleConfig } from '@deepseek-ai/dsh-mind-garden/media/types';
/** Keep a verified-image fallback visible while the optional WebGL renderer loads. */
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
//# sourceMappingURL=PhotoParticleSceneView.d.ts.map