/** Lazy boundary for GPU renderers that are unnecessary in ordinary conversation. */

import type { PhotoParticleController } from './photo-story/PhotoParticleScene.tsx'
import type { GardenStarMapModel } from './star-map/model.ts'

interface HeavyScenesModule {
  readonly mountPhotoParticleScene: (
    host: HTMLElement,
    image: HTMLImageElement,
    config: Parameters<PhotoParticleController['update']>[0],
    reducedMotion: boolean,
  ) => PhotoParticleController
  readonly mountGardenStarField: (
    host: HTMLElement,
    model: GardenStarMapModel,
    reducedMotion: boolean,
    selectedId?: string,
    onSelect?: (id: string) => void,
    onHover?: (id: string | null, x: number, y: number) => void,
  ) => () => void
}

const HEAVY_SCENES_URL = '/plugins/@deepseek-ai/dsh-mind-garden/ui/heavy-scenes.js'
let scenesPromise: Promise<HeavyScenesModule> | undefined

/**
 * Download and evaluate Three.js only after a GPU-backed garden space is visible.
 * A failed import is not cached, so a later mount can retry it.
 * @returns The shared renderer-module import; rejects when download or evaluation fails.
 */
export function loadMindGardenScenes(): Promise<HeavyScenesModule> {
  scenesPromise ??= (import(/* @vite-ignore */ HEAVY_SCENES_URL) as Promise<HeavyScenesModule>)
    .catch((error: unknown) => {
      scenesPromise = undefined
      throw error
    })
  return scenesPromise
}
