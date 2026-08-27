/** Three.js constellation renderer with adaptive detail and deterministic teardown. */

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { GardenStarKind, GardenStarMapModel, GardenStarNode } from './model.ts'
import css from './StarField.module.css'

interface StarFieldPalette {
  readonly background: string
  readonly center: string
  readonly trait: string
  readonly question: string
  readonly review: string
  readonly orbit: string
  readonly continuity: string
}

interface AnimatedNode {
  readonly mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
  readonly coreGlow: THREE.Sprite
  readonly auraGlow: THREE.Sprite
  readonly coreScale: number
  readonly auraScale: number
  readonly seed: number
  readonly selected: boolean
}

const linkVertexShader = `
attribute vec3 linkColor;
attribute float linkProgress;
attribute float linkPhase;
varying vec3 vLinkColor;
varying float vLinkProgress;
varying float vLinkPhase;

void main() {
  vLinkColor = linkColor;
  vLinkProgress = linkProgress;
  vLinkPhase = linkPhase;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const linkFragmentShader = `
uniform float time;
varying vec3 vLinkColor;
varying float vLinkProgress;
varying float vLinkPhase;

void main() {
  float travelling = 0.5 + 0.5 * sin((vLinkProgress * 1.45 - time * 0.13 + vLinkPhase) * 6.2831853);
  travelling = pow(travelling, 16.0);
  float endpointFade = smoothstep(0.0, 0.1, vLinkProgress) * (1.0 - smoothstep(0.9, 1.0, vLinkProgress));
  float strength = 0.7 + travelling * 1.8;
  float alpha = (0.14 + travelling * 0.58) * endpointFade;
  gl_FragColor = vec4(vLinkColor * strength, alpha);
}
`

const starVertexShader = `
attribute float seed;
uniform float time;
uniform float pixelRatio;
uniform float pointSize;
varying float vAlpha;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  float twinkle = 0.72 + sin(time * (0.32 + seed * 0.38) + seed * 37.0) * 0.22;
  gl_PointSize = pointSize * pixelRatio * (0.76 + seed * 0.56);
  vAlpha = twinkle;
}
`

const starFragmentShader = `
uniform vec3 color;
uniform float opacity;
varying float vAlpha;

void main() {
  float distanceToCenter = length(gl_PointCoord - vec2(0.5));
  if (distanceToCenter > 0.5) discard;
  float core = 1.0 - smoothstep(0.05, 0.25, distanceToCenter);
  float halo = 1.0 - smoothstep(0.12, 0.5, distanceToCenter);
  gl_FragColor = vec4(color * (0.78 + core * 0.92), (core * 0.72 + halo * 0.28) * opacity * vAlpha);
}
`

function resolvedColor(host: HTMLElement, variable: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${variable})`
  probe.hidden = true
  host.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function palette(host: HTMLElement): StarFieldPalette {
  return {
    background: resolvedColor(host, '--mg-star-bg'),
    center: resolvedColor(host, '--mg-star-center'),
    trait: resolvedColor(host, '--mg-star-trait'),
    question: resolvedColor(host, '--mg-star-question'),
    review: resolvedColor(host, '--mg-star-review'),
    orbit: resolvedColor(host, '--mg-star-orbit'),
    continuity: resolvedColor(host, '--mg-star-continuity'),
  }
}

function nodeColor(colors: StarFieldPalette, kind: GardenStarKind): string {
  if (kind === 'center') return colors.center
  if (kind === 'trait') return colors.trait
  if (kind === 'question') return colors.question
  return colors.review
}

function starPositions(count: number, minimumRadius: number, radiusRange: number, initialSeed: number) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  let seed = initialSeed
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let index = 0; index < count; index++) {
    const radius = minimumRadius + random() * radiusRange
    const azimuth = random() * Math.PI * 2
    const inclination = Math.acos(2 * random() - 1)
    positions[index * 3] = radius * Math.sin(inclination) * Math.cos(azimuth)
    positions[index * 3 + 1] = radius * Math.cos(inclination)
    positions[index * 3 + 2] = radius * Math.sin(inclination) * Math.sin(azimuth)
    seeds[index] = random()
  }
  return { positions, seeds }
}

function stablePhase(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index++) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return ((hash >>> 0) % 10_000) / 10_000
}

/** A tiny procedural texture gives every node a smooth photographic halo without a post-processing pass. */
function makeRadialGlowTexture(): THREE.DataTexture {
  const size = 96
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size * 2 - 1
      const dy = (y + 0.5) / size * 2 - 1
      const distance = Math.min(1, Math.hypot(dx, dy))
      const core = Math.exp(-distance * distance * 38)
      const bloom = Math.exp(-distance * distance * 7.5)
      const mist = Math.max(0, 1 - distance) ** 3
      const alpha = Math.min(1, core * 0.92 + bloom * 0.48 + mist * 0.16)
      const offset = (y * size + x) * 4
      data[offset] = 255
      data[offset + 1] = 250
      data[offset + 2] = 238
      data[offset + 3] = Math.round(alpha * 255)
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function maximumPixelRatio(): number {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const memoryLimit = memory <= 4 ? 1.25 : memory <= 8 ? 1.5 : 1.75
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), Math.min(memoryLimit, 1.5))
}

function makeStarField(
  scene: THREE.Scene,
  colors: StarFieldPalette,
  pixelRatio: number,
  materials: THREE.Material[],
  geometries: THREE.BufferGeometry[],
): readonly THREE.ShaderMaterial[] {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const compact = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 720px)').matches
  const density = memory <= 4 ? 0.52 : compact ? 0.68 : 1
  const fields: Array<[number, number, number, number, number, number, string]> = [
    [Math.round(1_320 * density), 42, 142, 1.65, 0.82, 31, colors.orbit],
    [Math.round(420 * density), 24, 96, 2.3, 0.68, 79, colors.question],
    [Math.round(120 * density), 18, 74, 3.6, 0.3, 131, colors.review],
  ]
  return fields.map(([count, minimumRadius, radiusRange, pointSize, opacity, seed, fieldColor]) => {
    const field = starPositions(count, minimumRadius, radiusRange, seed)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(field.positions, 3))
    geometry.setAttribute('seed', new THREE.BufferAttribute(field.seeds, 1))
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }, pixelRatio: { value: pixelRatio }, pointSize: { value: pointSize },
        color: { value: new THREE.Color(fieldColor) }, opacity: { value: opacity },
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
    scene.add(new THREE.Points(geometry, material))
    geometries.push(geometry)
    materials.push(material)
    return material
  })
}

function makeLinkField(
  model: GardenStarMapModel,
  positions: ReadonlyMap<string, THREE.Vector3>,
  colors: StarFieldPalette,
): { readonly mesh: THREE.Mesh; readonly geometry: THREE.BufferGeometry; readonly material: THREE.ShaderMaterial } | null {
  const tubularSegments = 42
  const radialSegments = 5
  const linkGeometries: THREE.BufferGeometry[] = []
  for (const link of model.links) {
    const source = positions.get(link.source)
    const target = positions.get(link.target)
    if (source === undefined || target === undefined) continue
    const delta = target.clone().sub(source)
    const control = source.clone().lerp(target, 0.5)
    const bend = new THREE.Vector3(-delta.y, delta.x, Math.max(4, Math.abs(delta.z) * 0.35))
      .normalize()
      .multiplyScalar(link.kind === 'continuity' ? 4.8 : 2.6)
    control.add(bend)
    const curve = new THREE.QuadraticBezierCurve3(source, control, target)
    const geometry = new THREE.TubeGeometry(
      curve, tubularSegments, link.kind === 'continuity' ? 0.055 : 0.036, radialSegments, false,
    )
    const count = geometry.getAttribute('position').count
    const linkColor = new Float32Array(count * 3)
    const linkProgress = new Float32Array(count)
    const linkPhase = new Float32Array(count)
    const rgb = new THREE.Color(link.kind === 'continuity' ? colors.continuity : colors.orbit)
    const phase = stablePhase(link.id)
    for (let index = 0; index < count; index++) {
      rgb.toArray(linkColor, index * 3)
      linkProgress[index] = Math.min(1, Math.floor(index / (radialSegments + 1)) / tubularSegments)
      linkPhase[index] = phase
    }
    geometry.setAttribute('linkColor', new THREE.BufferAttribute(linkColor, 3))
    geometry.setAttribute('linkProgress', new THREE.BufferAttribute(linkProgress, 1))
    geometry.setAttribute('linkPhase', new THREE.BufferAttribute(linkPhase, 1))
    linkGeometries.push(geometry)
  }
  if (linkGeometries.length === 0) return null
  const merged = mergeGeometries(linkGeometries, false)
  linkGeometries.forEach((geometry) => { geometry.dispose() })
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: linkVertexShader,
    fragmentShader: linkFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  return { mesh: new THREE.Mesh(merged, material), geometry: merged, material }
}

/**
 * Mount one interactive Three.js scene into a measured host.
 * @param host - Empty scene host owned by the React component.
 * @param model - Deterministic constellation data.
 * @param reducedMotion - Whether ambient animation should be disabled.
 * @param selectedId - Node emphasized by the semantic selector.
 * @param onSelect - Optional pointer selection handoff to the semantic owner.
 * @param onHover - Optional hover detail handoff for a DOM tooltip.
 * @returns Teardown that releases listeners, GPU resources, observers, and the canvas.
 */
export function mountGardenStarField(
  host: HTMLDivElement,
  model: GardenStarMapModel,
  reducedMotion: boolean,
  selectedId = 'center',
  onSelect?: (id: string) => void,
  onHover?: (id: string, x: number, y: number) => void,
): () => void {
  const colors = palette(host)
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  let pixelRatio = maximumPixelRatio()
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(colors.background, 0.04)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  host.replaceChildren(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(colors.background, 0.00082)
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400)
  const compactScene = typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 720px)').matches
  const initialCameraZ = compactScene ? 90 : 64
  camera.position.set(0, compactScene ? -10 : -4, initialCameraZ)
  let targetCameraZ = initialCameraZ
  const constellation = new THREE.Group()
  constellation.position.y = -4.2
  constellation.rotation.x = -0.06
  scene.add(constellation)
  scene.add(new THREE.HemisphereLight(colors.orbit, colors.background, 1.85))
  const centerLight = new THREE.PointLight(colors.center, 34, 110, 1.8)
  centerLight.position.set(2, 7, 22)
  scene.add(centerLight)

  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const textures: THREE.Texture[] = []
  const animatedNodes: AnimatedNode[] = []
  const focusRings: THREE.Mesh[] = []
  const nodeMeshes: THREE.Mesh[] = []
  const positions = new Map(model.nodes.map(node => [node.id, new THREE.Vector3(node.x, node.y, node.z)]))
  const glowTexture = makeRadialGlowTexture()
  textures.push(glowTexture)

  for (const node of model.nodes) {
    const nodePaint = nodeColor(colors, node.kind)
    const selected = node.id === selectedId
    const visualRadius = node.radius * (node.kind === 'center' ? 0.48 : 0.44)
    const geometry: THREE.BufferGeometry = node.kind === 'center'
      ? new THREE.SphereGeometry(visualRadius, 28, 16)
      : new THREE.OctahedronGeometry(visualRadius, 2)
    const surfaceColor = new THREE.Color(nodePaint).lerp(new THREE.Color('#fff2d1'), node.kind === 'center' ? 0.28 : 0.12)
    const material = new THREE.MeshPhysicalMaterial({
      color: surfaceColor,
      emissive: nodePaint,
      emissiveIntensity: selected ? 1.34 : node.kind === 'center' ? 1.08 : 0.62,
      metalness: node.kind === 'center' ? 0.42 : 0.16,
      roughness: node.kind === 'center' ? 0.24 : 0.36,
      clearcoat: node.kind === 'center' ? 0.82 : 0.58,
      clearcoatRoughness: 0.22,
      flatShading: node.kind !== 'center',
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(node.x, node.y, node.z)
    mesh.userData.starId = node.id
    constellation.add(mesh)
    nodeMeshes.push(mesh)
    geometries.push(geometry)
    materials.push(material)

    const coreGlowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: nodePaint,
      depthWrite: false,
      opacity: selected ? 0.68 : node.kind === 'center' ? 0.52 : 0.38,
      transparent: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
    const coreGlow = new THREE.Sprite(coreGlowMaterial)
    const coreScale = node.radius * (selected ? 6.8 : node.kind === 'center' ? 6 : 5.6)
    coreGlow.position.copy(mesh.position)
    coreGlow.scale.setScalar(coreScale)
    constellation.add(coreGlow)
    materials.push(coreGlowMaterial)

    const auraGlowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: nodePaint,
      depthWrite: false,
      opacity: selected ? 0.2 : node.kind === 'center' ? 0.15 : 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
    const auraGlow = new THREE.Sprite(auraGlowMaterial)
    const auraScale = node.radius * (selected ? 11.2 : node.kind === 'center' ? 10 : 9.3)
    auraGlow.position.copy(mesh.position)
    auraGlow.scale.setScalar(auraScale)
    constellation.add(auraGlow)
    materials.push(auraGlowMaterial)
    animatedNodes.push({ mesh, coreGlow, auraGlow, coreScale, auraScale, seed: stablePhase(node.id), selected })

    if (selected) {
      for (const [scale, tilt, opacity] of [[1.9, 0, 0.34], [2.7, Math.PI / 2, 0.18]] as const) {
        const focusGeometry = new THREE.TorusGeometry(node.radius * scale, 0.024, 5, 88)
        const focusMaterial = new THREE.MeshBasicMaterial({
          color: nodePaint, depthWrite: false, opacity, transparent: true,
          blending: THREE.AdditiveBlending, toneMapped: false,
        })
        const focus = new THREE.Mesh(focusGeometry, focusMaterial)
        focus.position.copy(mesh.position)
        focus.rotation.x = tilt
        constellation.add(focus)
        focusRings.push(focus)
        geometries.push(focusGeometry)
        materials.push(focusMaterial)
      }
    }
  }

  const linkField = makeLinkField(model, positions, colors)
  if (linkField !== null) {
    constellation.add(linkField.mesh)
    geometries.push(linkField.geometry)
    materials.push(linkField.material)
  }
  const starMaterials = reducedMotion ? [] : makeStarField(scene, colors, pixelRatio, materials, geometries)

  let frame = 0
  let dragging = false
  let pointerX = 0
  let pointerY = 0
  let dragDistance = 0
  let velocityX = 0
  let velocityY = 0
  let hoveredId = ''
  let visible = true
  let previousTime = 0
  let frameTotal = 0
  let frameSamples = 0
  let disposed = false
  const canvas = renderer.domElement
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  const renderScene = () => { renderer.render(scene, camera) }
  const resize = () => {
    const width = Math.max(1, host.clientWidth)
    const height = Math.max(1, host.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderScene()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const updateHover = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect()
    pointer.set(
      ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1,
      -((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(nodeMeshes, false)[0]
    const nextHoveredId = typeof hit?.object.userData.starId === 'string' ? hit.object.userData.starId : ''
    hoveredId = nextHoveredId
    onHover?.(nextHoveredId, event.clientX - bounds.left, event.clientY - bounds.top)
    canvas.style.cursor = hoveredId === '' ? dragging ? 'grabbing' : 'grab' : 'pointer'
  }
  const pointerDown = (event: PointerEvent) => {
    dragging = true
    dragDistance = 0
    pointerX = event.clientX
    pointerY = event.clientY
    velocityX = 0
    velocityY = 0
    canvas.setPointerCapture(event.pointerId)
    canvas.style.cursor = 'grabbing'
  }
  const pointerMove = (event: PointerEvent) => {
    updateHover(event)
    if (!dragging) {
      if (reducedMotion) renderScene()
      return
    }
    const deltaX = event.clientX - pointerX
    const deltaY = event.clientY - pointerY
    dragDistance += Math.hypot(deltaX, deltaY)
    velocityX = deltaX * 0.0052
    velocityY = deltaY * 0.0038
    constellation.rotation.y += velocityX
    constellation.rotation.x = Math.max(-0.72, Math.min(0.72, constellation.rotation.x + velocityY))
    pointerX = event.clientX
    pointerY = event.clientY
    if (reducedMotion) renderScene()
  }
  const pointerUp = (event: PointerEvent) => {
    dragging = false
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    if (dragDistance <= 4 && hoveredId !== '') onSelect?.(hoveredId)
    canvas.style.cursor = hoveredId === '' ? 'grab' : 'pointer'
  }
  const pointerCancel = (event: PointerEvent) => {
    if (!dragging) return
    dragging = false
    dragDistance = Number.POSITIVE_INFINITY
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    canvas.style.cursor = hoveredId === '' ? 'grab' : 'pointer'
  }
  const pointerLeave = () => { hoveredId = ''; onHover?.('', 0, 0); canvas.style.cursor = 'grab' }
  const wheel = (event: WheelEvent) => {
    event.preventDefault()
    targetCameraZ = Math.max(34, Math.min(94, targetCameraZ + event.deltaY * 0.035))
    if (reducedMotion) {
      camera.position.z = targetCameraZ
      renderScene()
    }
  }
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerCancel)
  canvas.addEventListener('pointerleave', pointerLeave)
  canvas.addEventListener('wheel', wheel, { passive: false })
  canvas.style.cursor = 'grab'

  const animate = (time: number) => {
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
        starMaterials.forEach((material) => {
          const ratioUniform = material.uniforms.pixelRatio
          if (ratioUniform !== undefined) ratioUniform.value = pixelRatio
        })
        resize()
      }
      frameTotal = 0
      frameSamples = 0
    }
    const seconds = time / 1_000
    const deltaScale = delta / 16.7
    if (!dragging) {
      constellation.rotation.y += 0.00072 * deltaScale + velocityX
      constellation.rotation.x = Math.max(-0.72, Math.min(0.72, constellation.rotation.x + velocityY))
      velocityX *= Math.pow(0.9, deltaScale)
      velocityY *= Math.pow(0.88, deltaScale)
    }
    camera.position.z += (targetCameraZ - camera.position.z) * Math.min(1, 0.12 * deltaScale)
    focusRings.forEach((ring, index) => { ring.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.0042 * deltaScale })
    animatedNodes.forEach(({ mesh, coreGlow, auraGlow, coreScale, auraScale, seed, selected }) => {
      const hovered = mesh.userData.starId === hoveredId
      const wave = Math.sin(seconds * (0.56 + seed * 0.28) + seed * 16)
      const pulse = 1 + wave * (selected ? 0.045 : 0.024)
      mesh.scale.setScalar(pulse * (hovered ? 1.14 : selected ? 1.06 : 1))
      mesh.rotation.y += (0.0012 + seed * 0.0014) * deltaScale
      coreGlow.scale.setScalar(coreScale * (1 + wave * (selected ? 0.09 : 0.05)))
      auraGlow.scale.setScalar(auraScale * (1 - wave * 0.04))
      coreGlow.material.opacity = (hovered ? 0.78 : selected ? 0.68 : mesh.userData.starId === 'center' ? 0.52 : 0.38) * (0.94 + wave * 0.06)
      auraGlow.material.opacity = (hovered ? 0.26 : selected ? 0.2 : mesh.userData.starId === 'center' ? 0.15 : 0.1) * (0.95 - wave * 0.05)
    })
    if (linkField !== null) {
      const linkTime = linkField.material.uniforms.time
      if (linkTime !== undefined) linkTime.value = seconds
    }
    starMaterials.forEach((material) => {
      const starTime = material.uniforms.time
      if (starTime !== undefined) starTime.value = seconds
    })
    renderScene()
    frame = requestAnimationFrame(animate)
  }
  const syncAnimation = () => {
    if (disposed || reducedMotion || !visible || document.hidden) {
      cancelAnimationFrame(frame)
      frame = 0
      return
    }
    if (frame === 0) frame = requestAnimationFrame(animate)
  }
  const visibilityChanged = () => { previousTime = 0; syncAnimation() }
  document.addEventListener('visibilitychange', visibilityChanged)
  const intersection = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
      previousTime = 0
      syncAnimation()
    }, { rootMargin: '120px' })
    : null
  intersection?.observe(host)
  resize()
  if (reducedMotion) renderScene()
  else syncAnimation()

  return () => {
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    intersection?.disconnect()
    document.removeEventListener('visibilitychange', visibilityChanged)
    canvas.removeEventListener('pointerdown', pointerDown)
    canvas.removeEventListener('pointermove', pointerMove)
    canvas.removeEventListener('pointerup', pointerUp)
    canvas.removeEventListener('pointercancel', pointerCancel)
    canvas.removeEventListener('pointerleave', pointerLeave)
    canvas.removeEventListener('wheel', wheel)
    geometries.forEach((geometry) => { geometry.dispose() })
    materials.forEach((material) => { material.dispose() })
    textures.forEach((texture) => { texture.dispose() })
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}

/** Display the live WebGL constellation, with the surrounding space owning accessible nodes. */
export function StarField({
  model,
  fallback,
  reducedMotion = false,
  selectedId = 'center',
  onSelect,
}: {
  readonly model: GardenStarMapModel
  readonly fallback: string
  readonly reducedMotion?: boolean
  readonly selectedId?: string
  readonly onSelect?: (id: string) => void
}) {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    () => typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hovered, setHovered] = useState<{ readonly node: GardenStarNode; readonly x: number; readonly y: number } | null>(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setSystemReducedMotion(query.matches) }
    update()
    query.addEventListener('change', update)
    return () => { query.removeEventListener('change', update) }
  }, [])

  useEffect(() => {
    if (host === null) return
    try {
      setFailed(false)
      return mountGardenStarField(
        host,
        model,
        reducedMotion || systemReducedMotion,
        selectedId,
        onSelect,
        (id, x, y) => {
          const node = model.nodes.find(candidate => candidate.id === id)
          setHovered(node === undefined ? null : { node, x, y })
        },
      )
    } catch {
      host.replaceChildren()
      setFailed(true)
    }
  }, [host, model, onSelect, reducedMotion, selectedId, systemReducedMotion])

  return (
    <div className={css.scene} data-render-state={failed ? 'fallback' : 'ready'}>
      <div className={css.host} ref={setHost} aria-hidden="true" />
      {hovered !== null && (
        <div className={css.tooltip} style={{ '--mg-star-x': `${hovered.x}px`, '--mg-star-y': `${hovered.y}px` } as React.CSSProperties}>
          <strong>{hovered.node.title}</strong>
          <p>{hovered.node.detail}</p>
        </div>
      )}
      {failed && <div className={css.fallback} role="status">{fallback}</div>}
    </div>
  )
}
