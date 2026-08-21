import { describe, expect, it } from 'vitest'
import { applyPhotoParticlePreset, DEFAULT_PHOTO_PARTICLE_CONFIG } from '../src/client/photo-story/presets.ts'

describe('photo particle presets', () => {
  it('keeps complete bounded configurations for every original visual direction', () => {
    const soft = applyPhotoParticlePreset({
      ...DEFAULT_PHOTO_PARTICLE_CONFIG,
      rendering: { ...DEFAULT_PHOTO_PARTICLE_CONFIG.rendering, quality: 'low' },
    }, 'soft')
    const dust = applyPhotoParticlePreset(soft, 'dust')
    const fluid = applyPhotoParticlePreset(dust, 'fluid')
    const nebula = applyPhotoParticlePreset(fluid, 'nebula')

    expect(soft).toEqual(DEFAULT_PHOTO_PARTICLE_CONFIG)
    expect(dust).toMatchObject({ preset: 'dust', interaction: { mode: 'repel', strength: 7.5 }, effects: { tint: '#ffe7cf' } })
    expect(fluid).toMatchObject({ preset: 'fluid', interaction: { mode: 'vortex', vortexStrength: 4.2 }, animation: { paperStrength: 0.82 } })
    expect(nebula).toMatchObject({ preset: 'nebula', depth: { strength: 48, randomness: 18 }, effects: { bloom: 0.75 } })
    expect(nebula.rendering).toEqual(DEFAULT_PHOTO_PARTICLE_CONFIG.rendering)
  })
})
