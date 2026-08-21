/** Original photo-particle presets adapted to the Harness media contract. */
/** Complete defaults used before a freshly uploaded story is reloaded. */
export const DEFAULT_PHOTO_PARTICLE_CONFIG = {
    version: 1,
    preset: 'soft',
    rendering: {
        quality: 'high', pointSize: 2.45, density: 0.94, opacity: 0.98,
        preserveColors: true, background: '#100f14',
    },
    depth: { strength: 28, randomness: 4 },
    interaction: {
        mode: 'repel', radius: 1.25, strength: 2.8, velocityInfluence: 0.55,
        vortexStrength: 0, clickBurst: true,
    },
    physics: { spring: 5.5, damping: 0.94, maxVelocity: 7, maxDistance: 8, turbulence: 0.12 },
    animation: { idleStrength: 0.56, idleSpeed: 0.42, paperStrength: 0.55, paperSpeed: 0.28 },
    effects: { saturation: 1.02, exposure: 1.02, tint: '#ffffff', tintMix: 0, bloom: 0.34, vignette: 0.28 },
};
const PRESETS = {
    soft: DEFAULT_PHOTO_PARTICLE_CONFIG,
    dust: {
        preset: 'dust',
        depth: { strength: 28, randomness: 9 },
        interaction: { mode: 'repel', radius: 2.4, strength: 7.5, velocityInfluence: 1, vortexStrength: 0, clickBurst: true },
        physics: { spring: 2.8, damping: 0.975, maxVelocity: 8, maxDistance: 12, turbulence: 0.5 },
        animation: { idleStrength: 0.52, idleSpeed: 0.72, paperStrength: 0.22, paperSpeed: 0.46 },
        effects: { saturation: 0.92, exposure: 1.08, tint: '#ffe7cf', tintMix: 0.12, bloom: 0.4, vignette: 0.5 },
    },
    fluid: {
        preset: 'fluid',
        depth: { strength: 32, randomness: 7 },
        interaction: { mode: 'vortex', radius: 3.2, strength: 6.5, velocityInfluence: 1.4, vortexStrength: 4.2, clickBurst: true },
        physics: { spring: 1.8, damping: 0.987, maxVelocity: 10, maxDistance: 15, turbulence: 0.36 },
        animation: { idleStrength: 0.3, idleSpeed: 0.55, paperStrength: 0.82, paperSpeed: 0.52 },
        effects: { saturation: 1.1, exposure: 1.02, tint: '#d8edff', tintMix: 0.08, bloom: 0.48, vignette: 0.42 },
    },
    nebula: {
        preset: 'nebula',
        depth: { strength: 48, randomness: 18 },
        interaction: { mode: 'wave', radius: 3.8, strength: 9, velocityInfluence: 1.2, vortexStrength: 2.4, clickBurst: true },
        physics: { spring: 3.8, damping: 0.97, maxVelocity: 12, maxDistance: 18, turbulence: 0.72 },
        animation: { idleStrength: 0.62, idleSpeed: 0.32, paperStrength: 0.38, paperSpeed: 0.22 },
        effects: { saturation: 1.32, exposure: 0.92, tint: '#c6b8ff', tintMix: 0.22, bloom: 0.75, vignette: 0.7 },
    },
};
/**
 * Merge one complete preset without discarding caller-adjusted unrelated groups.
 *
 * @param current - Current particle configuration.
 * @param preset - Preset to apply.
 * @returns A new particle configuration containing the preset values.
 */
export function applyPhotoParticlePreset(current, preset) {
    const values = PRESETS[preset];
    return {
        ...current,
        ...values,
        preset,
        rendering: { ...current.rendering, ...values.rendering },
        depth: { ...current.depth, ...values.depth },
        interaction: { ...current.interaction, ...values.interaction },
        physics: { ...current.physics, ...values.physics },
        animation: { ...current.animation, ...values.animation },
        effects: { ...current.effects, ...values.effects },
    };
}
//# sourceMappingURL=presets.js.map