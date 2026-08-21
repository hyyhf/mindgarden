/** Original photo-particle presets adapted to the Harness media contract. */
import type { MindGardenPhotoParticleConfig, MindGardenPhotoParticlePreset } from '@deepseek-ai/dsh-mind-garden/media/types';
/** Complete defaults used before a freshly uploaded story is reloaded. */
export declare const DEFAULT_PHOTO_PARTICLE_CONFIG: MindGardenPhotoParticleConfig;
/**
 * Merge one complete preset without discarding caller-adjusted unrelated groups.
 *
 * @param current - Current particle configuration.
 * @param preset - Preset to apply.
 * @returns A new particle configuration containing the preset values.
 */
export declare function applyPhotoParticlePreset(current: MindGardenPhotoParticleConfig, preset: MindGardenPhotoParticlePreset): MindGardenPhotoParticleConfig;
//# sourceMappingURL=presets.d.ts.map