// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { DEFAULT_PHOTO_PARTICLE_CONFIG } from '../src/client/photo-story/presets.ts'

const rendererState = vi.hoisted(() => ({
  fail: false,
  renderers: [] as Array<{
    options: { readonly alpha?: boolean }
    domElement: HTMLCanvasElement
    render: ReturnType<typeof vi.fn>
    setSize: ReturnType<typeof vi.fn>
    setClearColor: ReturnType<typeof vi.fn>
    dispose: ReturnType<typeof vi.fn>
    forceContextLoss: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  class WebGLRenderer {
    readonly options: { readonly alpha?: boolean }
    readonly domElement = document.createElement('canvas')
    readonly render = vi.fn()
    readonly setSize = vi.fn()
    readonly setClearColor = vi.fn()
    readonly setPixelRatio = vi.fn()
    readonly getPixelRatio = vi.fn(() => 2)
    readonly dispose = vi.fn()
    readonly forceContextLoss = vi.fn()
    outputColorSpace = ''

    constructor(options: { readonly alpha?: boolean } = {}) {
      if (rendererState.fail) throw new Error('WebGL unavailable')
      this.options = options
      rendererState.renderers.push(this)
    }
  }
  class Clock { getElapsedTime = vi.fn(() => 2.5) }
  return { ...actual, Clock, WebGLRenderer }
})

import {
  mountPhotoParticleScene,
  PhotoParticleScene,
} from '../src/client/photo-story/PhotoParticleScene.tsx'

let animationCallbacks: FrameRequestCallback[]
let resizeCallback: (() => void) | undefined
let hasPointerCapture: ReturnType<typeof vi.fn>
let alpha = 255
let delayedImage = false
let failImage = false
let missingCanvas = false
let resolveDelayedImage: (() => void) | undefined
let rejectDelayedImage: (() => void) | undefined

function pixels(width: number, height: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let index = 0; index < width * height; index++) {
    data[index * 4] = index % 255
    data[index * 4 + 1] = 120
    data[index * 4 + 2] = 220
    data[index * 4 + 3] = alpha
  }
  return data
}

beforeEach(() => {
  rendererState.fail = false
  rendererState.renderers.length = 0
  animationCallbacks = []
  resizeCallback = undefined
  alpha = 255
  delayedImage = false
  failImage = false
  missingCanvas = false
  resolveDelayedImage = undefined
  rejectDelayedImage = undefined
  hasPointerCapture = vi.fn(() => true)
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resizeCallback = callback }
    observe = vi.fn()
    disconnect = vi.fn()
  })
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationCallbacks.push(callback)
    return animationCallbacks.length
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type: string) => {
    if (type !== '2d' || missingCanvas) return null
    return {
      drawImage: vi.fn(),
      getImageData: (_x: number, _y: number, width: number, height: number) => ({ data: pixels(width, height) }),
    } as unknown as CanvasRenderingContext2D
  })
  Object.defineProperties(HTMLCanvasElement.prototype, {
    setPointerCapture: { configurable: true, value: vi.fn() },
    hasPointerCapture: { configurable: true, value: hasPointerCapture },
    releasePointerCapture: { configurable: true, value: vi.fn() },
    getBoundingClientRect: { configurable: true, value: () => ({ left: 0, top: 0, width: 640, height: 360 }) },
  })
  vi.stubGlobal('Image', class {
    decoding = ''
    naturalWidth = 8
    naturalHeight = 4
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) {
      if (delayedImage) {
        resolveDelayedImage = () => { this.onload?.() }
        rejectDelayedImage = () => { this.onerror?.() }
        return
      }
      queueMicrotask(() => {
        if (failImage) this.onerror?.()
        else this.onload?.()
      })
    }
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function image(width = 8, height = 4): HTMLImageElement {
  const value = document.createElement('img')
  Object.defineProperties(value, {
    naturalWidth: { configurable: true, value: width },
    naturalHeight: { configurable: true, value: height },
  })
  return value
}

function pointer(type: string, pointerId: number, clientX = 0, clientY = 0): Event {
  const event = new MouseEvent(type, { bubbles: true, clientX, clientY })
  Object.defineProperty(event, 'pointerId', { value: pointerId })
  return event
}

describe('photo particle scene', () => {
  it('samples a verified landscape, responds to every force mode, and tears down GPU state', () => {
    const host = document.createElement('div')
    Object.defineProperties(host, {
      clientWidth: { configurable: true, value: 640 },
      clientHeight: { configurable: true, value: 360 },
    })
    document.body.append(host)
    const config = {
      ...DEFAULT_PHOTO_PARTICLE_CONFIG,
      rendering: { ...DEFAULT_PHOTO_PARTICLE_CONFIG.rendering, quality: 'low' as const, density: 1 },
    }
    const controller = mountPhotoParticleScene(host, image(), config, false)
    expect(controller.count).toBeGreaterThan(100)
    const renderer = rendererState.renderers[0]!
    const canvas = renderer.domElement
    expect(renderer.options.alpha).toBe(false)
    expect(renderer.setClearColor).toHaveBeenCalledWith(config.rendering.background, 1)
    expect(renderer.setSize).toHaveBeenCalledWith(640, 360, false)
    resizeCallback?.()
    canvas.dispatchEvent(pointer('pointermove', 1, 100, 120))
    canvas.dispatchEvent(pointer('pointerdown', 1, 100, 120))
    canvas.dispatchEvent(pointer('pointermove', 1, 180, 900))
    animationCallbacks.shift()?.(1)
    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 8_000 }))
    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -8_000 }))
    canvas.dispatchEvent(new Event('pointerleave'))
    hasPointerCapture.mockReturnValueOnce(true).mockReturnValueOnce(false)
    canvas.dispatchEvent(pointer('pointerup', 1))
    canvas.dispatchEvent(pointer('pointercancel', 1))
    animationCallbacks.shift()?.(2)
    controller.update({ ...config, interaction: { ...config.interaction, mode: 'attract', clickBurst: false } })
    canvas.dispatchEvent(pointer('pointerdown', 1, 100, 120))
    controller.update({ ...config, interaction: { ...config.interaction, mode: 'vortex' } })
    controller.update({ ...config, interaction: { ...config.interaction, mode: 'wave' }, rendering: { ...config.rendering, preserveColors: false } })
    animationCallbacks.shift()?.(3)
    controller.dispose()
    expect(renderer.render).toHaveBeenCalledTimes(5)
    expect(renderer.dispose).toHaveBeenCalledOnce()
    expect(renderer.forceContextLoss).toHaveBeenCalledOnce()
    expect(host.childElementCount).toBe(0)
    host.remove()
  })

  it('supports portrait sampling and rejects missing canvas or invisible pixels', () => {
    const host = document.createElement('div')
    const config = {
      ...DEFAULT_PHOTO_PARTICLE_CONFIG,
      rendering: { ...DEFAULT_PHOTO_PARTICLE_CONFIG.rendering, quality: 'medium' as const, density: 0.5 },
    }
    const portrait = mountPhotoParticleScene(host, image(2, 8), config, true)
    rendererState.renderers[0]!.domElement.dispatchEvent(pointer('pointermove', 1, 20, 40))
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    portrait.dispose()

    missingCanvas = true
    expect(() => mountPhotoParticleScene(host, image(1, 1), config, true)).toThrow('photo-canvas-unavailable')
    missingCanvas = false
    alpha = 0
    expect(() => mountPhotoParticleScene(host, image(), config, true)).toThrow('photo-has-no-visible-pixels')
  })

  it('mounts through React, updates live parameters, falls back after decode failure, and cancels delayed work', async () => {
    const onCount = vi.fn()
    const view = render(
      <PhotoParticleScene
        src="data:image/png;base64,AQID"
        alt="frame"
        config={{ ...DEFAULT_PHOTO_PARTICLE_CONFIG, rendering: { ...DEFAULT_PHOTO_PARTICLE_CONFIG.rendering, quality: 'low' } }}
        labels={{ scene: 'scene', loading: 'loading', fallback: 'fallback', reduced: 'reduced' }}
        onCount={onCount}
      />,
    )
    expect(view.getByRole('status').textContent).toBe('loading')
    await waitFor(() => { expect(view.container.querySelector('[data-render-state="ready"]')).toBeTruthy() })
    expect(view.container.querySelector('[data-render-state="ready"] img')).toBeNull()
    expect(onCount).toHaveBeenCalledWith(expect.any(Number))
    view.rerender(
      <PhotoParticleScene
        src="data:image/png;base64,AQID"
        alt="frame"
        config={{ ...DEFAULT_PHOTO_PARTICLE_CONFIG, effects: { ...DEFAULT_PHOTO_PARTICLE_CONFIG.effects, tint: '#00ffaa' } }}
        labels={{ scene: 'scene', loading: 'loading', fallback: 'fallback', reduced: 'reduced' }}
      />,
    )
    await waitFor(() => { expect(rendererState.renderers).toHaveLength(2) })
    view.unmount()
    expect(rendererState.renderers[0]!.dispose).toHaveBeenCalledOnce()
    expect(rendererState.renderers[1]!.dispose).toHaveBeenCalledOnce()

    failImage = true
    const failed = render(
      <PhotoParticleScene
        src="broken"
        alt="fallback frame"
        config={DEFAULT_PHOTO_PARTICLE_CONFIG}
        labels={{ scene: 'scene', loading: 'loading', fallback: 'fallback', reduced: 'reduced' }}
      />,
    )
    await waitFor(() => { expect(failed.getByRole('status').textContent).toBe('fallback') })
    expect(failed.getByAltText('fallback frame')).toBeTruthy()
    failed.unmount()

    delayedImage = true
    const delayed = render(
      <PhotoParticleScene
        src="delayed"
        alt="delayed"
        config={DEFAULT_PHOTO_PARTICLE_CONFIG}
        labels={{ scene: 'scene', loading: 'loading', fallback: 'fallback', reduced: 'reduced' }}
      />,
    )
    delayed.unmount()
    resolveDelayedImage?.()
    await Promise.resolve()

    const delayedFailure = render(
      <PhotoParticleScene
        src="delayed-failure"
        alt="delayed failure"
        config={DEFAULT_PHOTO_PARTICLE_CONFIG}
        labels={{ scene: 'scene', loading: 'loading', fallback: 'fallback', reduced: 'reduced' }}
      />,
    )
    delayedFailure.unmount()
    rejectDelayedImage?.()
    await Promise.resolve()
  })

  it('falls back when WebGL construction fails after a successful decode', async () => {
    rendererState.fail = true
    const view = render(
      <PhotoParticleScene
        src="decoded"
        alt="verified original"
        config={DEFAULT_PHOTO_PARTICLE_CONFIG}
        labels={{ scene: 'scene', loading: 'loading', fallback: 'fallback', reduced: 'reduced' }}
      />,
    )
    await waitFor(() => { expect(view.getByRole('status').textContent).toBe('fallback') })
    expect(view.getByAltText('verified original')).toBeTruthy()
  })

  it('shows the verified image without constructing WebGL when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    const view = render(
      <PhotoParticleScene
        src="verified"
        alt="verified still"
        config={DEFAULT_PHOTO_PARTICLE_CONFIG}
        labels={{ scene: 'scene', loading: 'loading', fallback: 'fallback', reduced: 'motion reduced' }}
      />,
    )
    await waitFor(() => { expect(view.getByRole('status').textContent).toBe('motion reduced') })
    expect(view.getByAltText('verified still')).toBeTruthy()
    expect(rendererState.renderers).toHaveLength(0)
  })
})
