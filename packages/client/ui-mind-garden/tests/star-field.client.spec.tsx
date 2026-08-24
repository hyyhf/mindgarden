// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import type { GardenStarMapModel } from '../src/client/star-map/model.ts'

const rendererState = vi.hoisted(() => ({
  fail: false,
  renderers: [] as Array<{
    domElement: HTMLCanvasElement
    render: ReturnType<typeof vi.fn>
    setSize: ReturnType<typeof vi.fn>
    dispose: ReturnType<typeof vi.fn>
    forceContextLoss: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  class WebGLRenderer {
    readonly domElement = document.createElement('canvas')
    readonly render = vi.fn()
    readonly setSize = vi.fn()
    readonly dispose = vi.fn()
    readonly forceContextLoss = vi.fn()
    readonly setPixelRatio = vi.fn()
    readonly setClearColor = vi.fn()
    outputColorSpace = ''

    constructor() {
      if (rendererState.fail) throw new Error('WebGL unavailable')
      rendererState.renderers.push(this)
    }
  }
  return { ...actual, WebGLRenderer }
})

import { mountGardenStarField, StarField } from '../src/client/star-map/StarField.tsx'

const model: GardenStarMapModel = {
  nodes: [
    { id: 'center', kind: 'center', title: 'Center', detail: 'Here', status: 'serenity', x: 0, y: 0, z: 0, radius: 2 },
    { id: 'question:q', kind: 'question', title: 'Question', detail: 'Open', status: 'open', x: 10, y: 2, z: 1, radius: 1 },
    { id: 'review:r', kind: 'review', title: 'Review', detail: 'Saved', status: 'saved', x: -8, y: -2, z: 3, radius: 1 },
  ],
  links: [
    { id: 'orbit:q', source: 'center', target: 'question:q', kind: 'orbit' },
    { id: 'continuity:r', source: 'question:q', target: 'review:r', kind: 'continuity' },
    { id: 'missing', source: 'missing', target: 'center', kind: 'orbit' },
  ],
}

let resizeCallback: (() => void) | undefined
let animationCallbacks: FrameRequestCallback[]
let hasPointerCapture: ReturnType<typeof vi.fn>

beforeEach(() => {
  rendererState.fail = false
  rendererState.renderers.length = 0
  animationCallbacks = []
  resizeCallback = undefined
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
  vi.stubGlobal('getComputedStyle', vi.fn(() => ({ color: 'rgb(120, 130, 140)' })))
  Object.defineProperties(HTMLCanvasElement.prototype, {
    setPointerCapture: { configurable: true, value: vi.fn() },
    hasPointerCapture: { configurable: true, value: hasPointerCapture },
    releasePointerCapture: { configurable: true, value: vi.fn() },
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function pointer(type: string, pointerId: number, clientX = 0, clientY = 0): Event {
  const event = new MouseEvent(type, { bubbles: true, clientX, clientY })
  Object.defineProperty(event, 'pointerId', { value: pointerId })
  return event
}

describe('mountGardenStarField', () => {
  it('mounts an interactive scene and releases its browser and GPU resources', () => {
    const host = document.createElement('div')
    Object.defineProperties(host, {
      clientWidth: { configurable: true, value: 640 },
      clientHeight: { configurable: true, value: 360 },
    })
    document.body.append(host)
    const teardown = mountGardenStarField(host, model, false)
    const renderer = rendererState.renderers[0]!
    const canvas = renderer.domElement

    expect(host.firstElementChild).toBe(canvas)
    expect(renderer.setSize).toHaveBeenCalledWith(640, 360, false)
    resizeCallback?.()
    canvas.dispatchEvent(pointer('pointermove', 1, 2, 2))
    animationCallbacks.shift()?.(1)
    canvas.dispatchEvent(pointer('pointerdown', 1, 10, 10))
    canvas.dispatchEvent(pointer('pointermove', 1, 60, 600))
    animationCallbacks.shift()?.(1)
    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 4000 }))
    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -4000 }))
    hasPointerCapture.mockReturnValueOnce(true).mockReturnValueOnce(false)
    canvas.dispatchEvent(pointer('pointerup', 1))
    canvas.dispatchEvent(pointer('pointercancel', 1))
    teardown()

    expect(renderer.render).toHaveBeenCalledTimes(4)
    expect(renderer.dispose).toHaveBeenCalledOnce()
    expect(renderer.forceContextLoss).toHaveBeenCalledOnce()
    expect(host.childElementCount).toBe(0)
    host.remove()
  })

  it('honors reduced motion and renders a localized fallback after WebGL failure', async () => {
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 0 })
    const host = document.createElement('div')
    document.body.append(host)
    const teardown = mountGardenStarField(host, model, true)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    expect(rendererState.renderers[0]!.render).toHaveBeenCalled()
    teardown()
    host.remove()

    rendererState.fail = true
    const view = render(<StarField model={model} fallback="Accessible fallback" />)
    await waitFor(() => { expect(view.getByRole('status').textContent).toBe('Accessible fallback') })
    expect(view.getByRole('status').parentElement?.dataset.renderState).toBe('fallback')
  })

  it('mounts through React with the user motion preference and tears down on unmount', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    const view = render(<StarField model={model} fallback="fallback" />)
    await waitFor(() => { expect(rendererState.renderers).toHaveLength(1) })
    expect(view.container.querySelector('[data-render-state="ready"]')).toBeTruthy()
    const renderer = rendererState.renderers[0]!
    view.unmount()
    expect(renderer.dispose).toHaveBeenCalledOnce()
  })

  it('reacts to a runtime operating-system reduced-motion change', async () => {
    let changed: (() => void) | undefined
    const media = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: () => void) => { changed = listener }),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('matchMedia', vi.fn(() => media))
    const view = render(<StarField model={model} fallback="fallback" />)
    await waitFor(() => { expect(rendererState.renderers).toHaveLength(1) })
    media.matches = true
    act(() => { changed?.() })
    await waitFor(() => { expect(rendererState.renderers).toHaveLength(2) })
    expect(rendererState.renderers[0]!.dispose).toHaveBeenCalledOnce()
    view.unmount()
    expect(media.removeEventListener).toHaveBeenCalledWith('change', changed)
  })
})
