/** Interactive Three.js reconstruction of one verified photo attachment. */

import * as THREE from 'three'
import type { MindGardenPhotoParticleConfig } from '@deepseek-ai/dsh-mind-garden/media/types'

const QUALITY_EDGE = { low: 128, medium: 208, high: 320 } as const

const vertexShader = `
attribute vec3 photoColor;
attribute float luma;
attribute float seed;
attribute float edge;
attribute vec2 photoUv;
varying vec3 vColor;
varying float vAlpha;
varying vec2 vPhotoUv;
uniform float time;
uniform float pointSize;
uniform float depthStrength;
uniform float depthRandomness;
uniform float interactionRadius;
uniform float interactionStrength;
uniform float idleStrength;
uniform float idleSpeed;
uniform float paperStrength;
uniform float paperSpeed;
uniform float burst;
uniform float mode;
uniform float preserveColors;
uniform vec2 pointer;
uniform float pointerActive;
uniform float velocityInfluence;
uniform float vortexStrength;
uniform float spring;
uniform float damping;
uniform float maxVelocity;
uniform float maxDistance;
uniform float turbulence;
uniform float gather;
uniform vec2 pointerVelocity;

void main() {
  vec3 p = position;
  float wave = sin(p.x * 0.72 + time * paperSpeed + seed * 5.0)
    + cos(p.y * 0.88 - time * paperSpeed * 0.73 + seed * 3.0);
  float breathe = sin(time * idleSpeed + seed * 18.0) * idleStrength;
  p.z += (luma - 0.48) * depthStrength * 0.095;
  p.z += (seed - 0.5) * depthRandomness * 0.055;
  p.z += wave * paperStrength * 0.34 + breathe * 0.22;
  p.xy += vec2(cos(seed * 31.0 + time * 0.16), sin(seed * 23.0 + time * 0.13)) * idleStrength * 0.025;
  vec2 turbulenceField = vec2(
    sin(seed * 47.0 + time * (0.32 + idleSpeed * 0.16)),
    cos(seed * 41.0 - time * (0.27 + idleSpeed * 0.13))
  ) * turbulence * 0.075;
  p.xy += turbulenceField;

  vec2 delta = p.xy - pointer;
  float distanceToPointer = max(length(delta), 0.035);
  float influence = (1.0 - smoothstep(0.0, interactionRadius, distanceToPointer)) * pointerActive;
  vec2 direction = delta / distanceToPointer;
  float response = interactionStrength * (0.045 + spring * 0.0035) * mix(1.12, 0.72, damping);
  response = min(response, maxDistance * 0.08);
  if (mode < 0.5) p.xy += direction * influence * response;
  else if (mode < 1.5) p.xy -= direction * influence * response * 0.82;
  else if (mode < 2.5) p.xy += vec2(-direction.y, direction.x) * influence * response * (0.62 + vortexStrength * 0.12);
  else p.z += sin(distanceToPointer * 7.0 - time * 8.0) * influence * response;
  p.xy += pointerVelocity * influence * velocityInfluence * 0.014;
  p += normalize(vec3(direction, 0.72)) * burst * influence * (0.7 + seed) * min(response, maxVelocity * 0.11);

  vec3 scattered = vec3(
    (seed - 0.5) * 24.0,
    (fract(seed * 13.73) - 0.5) * 18.0,
    (fract(seed * 31.17) - 0.5) * 10.0
  );
  float gatherCurve = 1.0 - pow(1.0 - clamp(gather, 0.0, 1.0), 3.0);
  p = mix(scattered, p, gatherCurve);

  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = pointSize * (1.0 + edge * 0.52) * clamp(62.0 / -viewPosition.z, 0.55, 2.4);
  vColor = mix(vec3(luma), photoColor, preserveColors);
  vAlpha = 0.58 + edge * 0.36;
  vPhotoUv = photoUv;
}
`

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;
varying vec2 vPhotoUv;
uniform float opacity;
uniform float saturation;
uniform float exposure;
uniform float tintMix;
uniform vec3 tint;
uniform float bloom;
uniform float vignette;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float radius = length(centered);
  if (radius > 0.5) discard;
  float soft = 1.0 - smoothstep(0.16 + bloom * 0.08, 0.5, radius);
  float gray = dot(vColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 color = mix(vec3(gray), vColor, saturation);
  color = mix(color, tint, tintMix) * exposure;
  float vignetteMask = 1.0 - smoothstep(0.34, 0.78, length(vPhotoUv - vec2(0.5))) * vignette;
  float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.025;
  gl_FragColor = vec4(color + grain, soft * opacity * vAlpha * vignetteMask);
}
`

interface PhotoParticleAttributes {
  readonly positions: Float32Array
  readonly colors: Float32Array
  readonly lumas: Float32Array
  readonly seeds: Float32Array
  readonly edges: Float32Array
  readonly uvs: Float32Array
  readonly count: number
  readonly aspect: number
}

function seeded(index: number): number {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

function photoParticleAttributes(
  image: HTMLImageElement,
  config: MindGardenPhotoParticleConfig,
): PhotoParticleAttributes {
  const longEdge = QUALITY_EDGE[config.rendering.quality]
  const aspect = image.naturalWidth / image.naturalHeight
  const width = Math.max(1, Math.round(aspect >= 1 ? longEdge : longEdge * aspect))
  const height = Math.max(1, Math.round(aspect >= 1 ? longEdge / aspect : longEdge))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (context === null) throw new Error('photo-canvas-unavailable')
  context.drawImage(image, 0, 0, width, height)
  const pixels = context.getImageData(0, 0, width, height).data
  const pixelView = new DataView(pixels.buffer, pixels.byteOffset, pixels.byteLength)
  const selected: number[] = []
  for (let index = 0; index < width * height; index++) {
    if (pixelView.getUint8(index * 4 + 3) > 20 && seeded(index) <= config.rendering.density) selected.push(index)
  }
  if (selected.length === 0) throw new Error('photo-has-no-visible-pixels')

  const positions = new Float32Array(selected.length * 3)
  const colors = new Float32Array(selected.length * 3)
  const lumas = new Float32Array(selected.length)
  const seeds = new Float32Array(selected.length)
  const edges = new Float32Array(selected.length)
  const uvs = new Float32Array(selected.length * 2)
  const planeWidth = aspect >= 1 ? 12 : 12 * aspect
  const planeHeight = aspect >= 1 ? 12 / aspect : 12
  const pixelLuma = (index: number) => {
    const offset = Math.min(index, width * height - 1) * 4
    return (
      pixelView.getUint8(offset) * 0.2126
      + pixelView.getUint8(offset + 1) * 0.7152
      + pixelView.getUint8(offset + 2) * 0.0722
    ) / 255
  }

  selected.forEach((pixelIndex, particleIndex) => {
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)
    const offset = pixelIndex * 4
    const target = particleIndex * 3
    const luma = pixelLuma(pixelIndex)
    positions[target] = (x / Math.max(1, width - 1) - 0.5) * planeWidth
    positions[target + 1] = (0.5 - y / Math.max(1, height - 1)) * planeHeight
    positions[target + 2] = 0
    colors[target] = pixelView.getUint8(offset) / 255
    colors[target + 1] = pixelView.getUint8(offset + 1) / 255
    colors[target + 2] = pixelView.getUint8(offset + 2) / 255
    lumas[particleIndex] = luma
    seeds[particleIndex] = seeded(pixelIndex + 991)
    const right = pixelLuma(y * width + Math.min(width - 1, x + 1))
    const below = pixelLuma(Math.min(height - 1, y + 1) * width + x)
    edges[particleIndex] = Math.min(1, (Math.abs(luma - right) + Math.abs(luma - below)) * 4)
    uvs[particleIndex * 2] = x / Math.max(1, width - 1)
    uvs[particleIndex * 2 + 1] = 1 - y / Math.max(1, height - 1)
  })
  return { positions, colors, lumas, seeds, edges, uvs, count: selected.length, aspect }
}

function interactionMode(mode: MindGardenPhotoParticleConfig['interaction']['mode']): number {
  if (mode === 'repel') return 0
  if (mode === 'attract') return 1
  if (mode === 'vortex') return 2
  return 3
}

function color(value: string): THREE.Color {
  return new THREE.Color(value)
}

/** Live scene controls retained by the React adapter between parameter changes. */
export interface PhotoParticleController {
  readonly count: number
  update: (config: MindGardenPhotoParticleConfig) => void
  recompose: () => void
  dispose: () => void
}

function maximumPixelRatio(): number {
  const memory = (navigator as Navigator & { readonly deviceMemory?: number }).deviceMemory ?? 8
  if (memory <= 2) return 1.25
  if (memory <= 4) return 1.5
  return 1.75
}

/** Mount a sampled, pointer-reactive photo field and return deterministic GPU teardown. */
export function mountPhotoParticleScene(
  host: HTMLDivElement,
  image: HTMLImageElement,
  initialConfig: MindGardenPhotoParticleConfig,
  reducedMotion: boolean,
): PhotoParticleController {
  const attributes = photoParticleAttributes(image, initialConfig)
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
  let pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), maximumPixelRatio())
  renderer.setPixelRatio(pixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  host.replaceChildren(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, 18)
  const group = new THREE.Group()
  scene.add(group)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(attributes.positions, 3))
  geometry.setAttribute('photoColor', new THREE.BufferAttribute(attributes.colors, 3))
  geometry.setAttribute('luma', new THREE.BufferAttribute(attributes.lumas, 1))
  geometry.setAttribute('seed', new THREE.BufferAttribute(attributes.seeds, 1))
  geometry.setAttribute('edge', new THREE.BufferAttribute(attributes.edges, 1))
  geometry.setAttribute('photoUv', new THREE.BufferAttribute(attributes.uvs, 2))

  const uniforms = {
    time: { value: 0 }, pointSize: { value: 1 }, depthStrength: { value: 1 }, depthRandomness: { value: 1 },
    interactionRadius: { value: 1 }, interactionStrength: { value: 1 }, idleStrength: { value: 1 }, idleSpeed: { value: 1 },
    paperStrength: { value: 1 }, paperSpeed: { value: 1 }, burst: { value: 0 }, mode: { value: 0 }, preserveColors: { value: 1 },
    pointer: { value: new THREE.Vector2(0, 0) }, pointerActive: { value: 0 }, opacity: { value: 1 },
    saturation: { value: 1 }, exposure: { value: 1 }, tintMix: { value: 0 }, tint: { value: new THREE.Color('#ffffff') }, bloom: { value: 0 },
    velocityInfluence: { value: 0 }, vortexStrength: { value: 0 }, spring: { value: 0 }, damping: { value: 0 },
    maxVelocity: { value: 0 }, maxDistance: { value: 0 }, turbulence: { value: 0 }, vignette: { value: 0 },
    gather: { value: reducedMotion ? 1 : 0 }, pointerVelocity: { value: new THREE.Vector2(0, 0) },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  })
  group.add(new THREE.Points(geometry, material))

  let config = initialConfig
  let frame = 0
  let dragging = false
  let pointerX = 0
  let pointerY = 0
  let pointerKnown = false
  let burst = 0
  let gatherStartedAt = performance.now()
  let visible = true
  let disposed = false
  let previousTime = 0
  let frameSamples = 0
  let frameTotal = 0
  let velocityX = 0
  let velocityY = 0
  let targetCameraZ = 18
  const canvas = renderer.domElement
  const update = (next: MindGardenPhotoParticleConfig) => {
    config = next
    renderer.setClearColor(next.rendering.background, 1)
    uniforms.pointSize.value = next.rendering.pointSize * renderer.getPixelRatio()
    uniforms.depthStrength.value = next.depth.strength
    uniforms.depthRandomness.value = next.depth.randomness
    uniforms.interactionRadius.value = next.interaction.radius
    uniforms.interactionStrength.value = next.interaction.strength
    uniforms.idleStrength.value = reducedMotion ? 0 : next.animation.idleStrength
    uniforms.idleSpeed.value = next.animation.idleSpeed
    uniforms.paperStrength.value = reducedMotion ? 0 : next.animation.paperStrength
    uniforms.paperSpeed.value = next.animation.paperSpeed
    uniforms.mode.value = interactionMode(next.interaction.mode)
    uniforms.preserveColors.value = next.rendering.preserveColors ? 1 : 0
    uniforms.opacity.value = next.rendering.opacity
    uniforms.saturation.value = next.effects.saturation
    uniforms.exposure.value = next.effects.exposure
    uniforms.tintMix.value = next.effects.tintMix
    uniforms.tint.value.copy(color(next.effects.tint))
    uniforms.bloom.value = next.effects.bloom
    uniforms.vignette.value = next.effects.vignette
    uniforms.velocityInfluence.value = next.interaction.velocityInfluence
    uniforms.vortexStrength.value = next.interaction.vortexStrength
    uniforms.spring.value = next.physics.spring
    uniforms.damping.value = next.physics.damping
    uniforms.maxVelocity.value = next.physics.maxVelocity
    uniforms.maxDistance.value = next.physics.maxDistance
    uniforms.turbulence.value = reducedMotion ? 0 : next.physics.turbulence
  }

  const renderScene = () => { renderer.render(scene, camera) }
  const resize = () => {
    const width = Math.max(1, host.clientWidth)
    const height = Math.max(1, host.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderScene()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  const intersectionObserver = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true
    if (visible && frame === 0 && !reducedMotion && !disposed) {
      previousTime = 0
      frame = requestAnimationFrame(render)
    }
  }, { rootMargin: '160px' })
  intersectionObserver?.observe(host)
  resize()

  const movePointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    uniforms.pointer.value.set(
      ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * (attributes.aspect >= 1 ? 12 : 12 * attributes.aspect),
      (0.5 - (event.clientY - rect.top) / Math.max(1, rect.height)) * (attributes.aspect >= 1 ? 12 / attributes.aspect : 12),
    )
    uniforms.pointerActive.value = 1
    const deltaX = pointerKnown ? event.clientX - pointerX : 0
    const deltaY = pointerKnown ? event.clientY - pointerY : 0
    pointerKnown = true
    uniforms.pointerVelocity.value.set(deltaX, -deltaY)
    if (dragging) {
      velocityX = deltaX * 0.006
      velocityY = deltaY * 0.004
      group.rotation.y += velocityX
      group.rotation.x = Math.max(-0.62, Math.min(0.62, group.rotation.x + velocityY))
    }
    pointerX = event.clientX
    pointerY = event.clientY
  }
  const pointerDown = (event: PointerEvent) => {
    dragging = true
    pointerX = event.clientX
    pointerY = event.clientY
    velocityX = 0
    velocityY = 0
    canvas.setPointerCapture(event.pointerId)
    if (config.interaction.clickBurst) burst = 1
  }
  const pointerUp = (event: PointerEvent) => {
    dragging = false
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }
  const pointerCancel = (event: PointerEvent) => {
    if (!dragging) return
    dragging = false
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }
  const pointerLeave = () => {
    pointerKnown = false
    uniforms.pointerActive.value = 0
  }
  const wheel = (event: WheelEvent) => {
    event.preventDefault()
    targetCameraZ = Math.max(11, Math.min(30, targetCameraZ + event.deltaY * 0.012))
  }
  if (!reducedMotion) {
    canvas.addEventListener('pointermove', movePointer)
    canvas.addEventListener('pointerdown', pointerDown)
    canvas.addEventListener('pointerup', pointerUp)
    canvas.addEventListener('pointercancel', pointerCancel)
    canvas.addEventListener('pointerleave', pointerLeave)
    canvas.addEventListener('wheel', wheel, { passive: false })
  }

  const updateAndRender = (next: MindGardenPhotoParticleConfig) => {
    update(next)
    if (reducedMotion) renderScene()
  }
  updateAndRender(initialConfig)

  const startedAt = performance.now()
  const render = (time: number) => {
    frame = 0
    if (disposed || reducedMotion || !visible || document.hidden) return
    const delta = previousTime === 0 ? 16.7 : Math.min(time - previousTime, 50)
    previousTime = time
    frameTotal += delta
    frameSamples++
    if (frameSamples >= 45) {
      if (frameTotal / frameSamples > 20.5 && pixelRatio > 1) {
        pixelRatio = Math.max(1, pixelRatio - 0.25)
        renderer.setPixelRatio(pixelRatio)
        uniforms.pointSize.value = config.rendering.pointSize * pixelRatio
        resize()
      }
      frameSamples = 0
      frameTotal = 0
    }
    uniforms.time.value = (time - startedAt) / 1_000
    uniforms.gather.value = Math.min(1, (time - gatherStartedAt) / 1_250)
    burst *= 0.91
    uniforms.burst.value = burst
    uniforms.pointerVelocity.value.multiplyScalar(0.86)
    if (!dragging) {
      group.rotation.y += 0.00035 + velocityX
      group.rotation.x = Math.max(-0.62, Math.min(0.62, group.rotation.x + velocityY))
      velocityX *= 0.92
      velocityY *= 0.9
    }
    camera.position.z += (targetCameraZ - camera.position.z) * 0.12
    renderScene()
    frame = requestAnimationFrame(render)
  }
  const visibilityChange = () => {
    if (!document.hidden && visible && frame === 0 && !reducedMotion && !disposed) {
      previousTime = 0
      frame = requestAnimationFrame(render)
    }
  }
  document.addEventListener('visibilitychange', visibilityChange)
  if (reducedMotion) renderScene()
  else frame = requestAnimationFrame(render)

  return {
    count: attributes.count,
    update: updateAndRender,
    recompose: () => {
      gatherStartedAt = performance.now()
      uniforms.gather.value = reducedMotion ? 1 : 0
      if (reducedMotion) renderScene()
    },
    dispose: () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersectionObserver?.disconnect()
      document.removeEventListener('visibilitychange', visibilityChange)
      canvas.removeEventListener('pointermove', movePointer)
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointercancel', pointerCancel)
      canvas.removeEventListener('pointerleave', pointerLeave)
      canvas.removeEventListener('wheel', wheel)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
