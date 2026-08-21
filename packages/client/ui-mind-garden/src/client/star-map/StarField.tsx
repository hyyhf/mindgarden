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
  readonly mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  readonly shell: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
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
  travelling = pow(travelling, 9.0);
  float endpoint = pow(abs(vLinkProgress * 2.0 - 1.0), 1.8);
  float strength = 0.54 + travelling * 1.68 + endpoint * 0.52;
  gl_FragColor = vec4(vLinkColor * strength, 0.62 + travelling * 0.34 + endpoint * 0.12);
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

function maximumPixelRatio(): number {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const memoryLimit = memory <= 4 ? 1.25 : memory <= 8 ? 1.5 : 1.75
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), memoryLimit)
}

function makeStarField(
  scene: THREE.Scene,
  colors: StarFieldPalette,
  pixelRatio: number,
  materials: THREE.Material[],
  geometries: THREE.BufferGeometry[],
): readonly THREE.ShaderMaterial[] {
  const fields: Array<[number, number, number, number, number, number, string]> = [
    [1_480, 42, 142, 1.65, 0.88, 31, colors.orbit],
    [520, 24, 96, 2.35, 0.76, 79, colors.question],
    [180, 18, 74, 3.8, 0.34, 131, colors.review],
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
      curve, tubularSegments, link.kind === 'continuity' ? 0.2 : 0.13, radialSegments, false,
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
  renderer.setClearColor(colors.background, 0.56)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.04
  host.replaceChildren(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(colors.background, 0.0019)
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400)
  camera.position.set(0, 7, 68)
  let targetCameraZ = 68
  const constellation = new THREE.Group()
  constellation.position.y = -4.2
  constellation.rotation.x = -0.06
  scene.add(constellation)
  scene.add(new THREE.HemisphereLight(colors.orbit, colors.background, 2.25))
  const centerLight = new THREE.PointLight(colors.center, 46, 125, 1.65)
  centerLight.position.set(2, 7, 22)
  scene.add(centerLight)

  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const animatedNodes: AnimatedNode[] = []
  const focusRings: THREE.Mesh[] = []
  const nodeMeshes: THREE.Mesh[] = []
  const positions = new Map(model.nodes.map(node => [node.id, new THREE.Vector3(node.x, node.y, node.z)]))
  const orbitRings = [
    { radius: 14, tiltX: 1.16, tiltY: 0.22, opacity: 0.28 },
    { radius: 22, tiltX: 0.82, tiltY: -0.48, opacity: 0.2 },
    { radius: 30, tiltX: 1.42, tiltY: 0.54, opacity: 0.14 },
  ].map(({ radius, tiltX, tiltY, opacity }) => {
    const geometry = new THREE.TorusGeometry(radius, 0.055, 5, 112)
    const material = new THREE.MeshBasicMaterial({ color: colors.orbit, depthWrite: false, opacity, transparent: true })
    const ring = new THREE.Mesh(geometry, material)
    ring.rotation.set(tiltX, tiltY, 0.12)
    constellation.add(ring)
    geometries.push(geometry)
    materials.push(material)
    return ring
  })

  for (const node of model.nodes) {
    const nodePaint = nodeColor(colors, node.kind)
    const selected = node.id === selectedId
    const geometry = new THREE.SphereGeometry(node.radius, node.kind === 'center' ? 36 : 24, 18)
    const material = new THREE.MeshStandardMaterial({
      color: nodePaint,
      emissive: nodePaint,
      emissiveIntensity: selected ? 1.35 : node.kind === 'center' ? 0.92 : 0.52,
      metalness: 0.06,
      roughness: 0.3,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(node.x, node.y, node.z)
    mesh.userData.starId = node.id
    constellation.add(mesh)
    nodeMeshes.push(mesh)
    geometries.push(geometry)
    materials.push(material)

    const shellGeometry = new THREE.SphereGeometry(node.radius * (selected ? 2.3 : 1.76), 18, 12)
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: nodePaint,
      depthWrite: false,
      opacity: selected ? 0.22 : 0.105,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
    const shell = new THREE.Mesh(shellGeometry, shellMaterial)
    shell.position.copy(mesh.position)
    constellation.add(shell)
    geometries.push(shellGeometry)
    materials.push(shellMaterial)
    animatedNodes.push({ mesh, shell, seed: stablePhase(node.id), selected })

    if (selected) {
      for (const [scale, tilt] of [[2.5, 0], [3.25, Math.PI / 2]] as const) {
        const focusGeometry = new THREE.TorusGeometry(node.radius * scale, Math.max(0.04, node.radius * 0.04), 6, 72)
        const focusMaterial = new THREE.MeshBasicMaterial({
          color: nodePaint, depthWrite: false, opacity: 0.58, transparent: true,
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
    orbitRings.forEach((ring, index) => { ring.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.00035 * deltaScale })
    focusRings.forEach((ring, index) => { ring.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.0042 * deltaScale })
    animatedNodes.forEach(({ mesh, shell, seed, selected }) => {
      const hovered = mesh.userData.starId === hoveredId
      const pulse = 1 + Math.sin(seconds * (0.72 + seed * 0.45) + seed * 16) * (selected ? 0.055 : 0.026)
      mesh.scale.setScalar(pulse * (hovered ? 1.16 : selected ? 1.12 : 1))
      shell.scale.setScalar(1 + Math.sin(seconds * 0.58 + seed * 21) * (selected ? 0.08 : 0.04))
      shell.material.opacity = (hovered ? 0.2 : selected ? 0.22 : 0.105)
        * (0.9 + Math.sin(seconds * 0.6 + seed * 12) * 0.1)
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
  const [hovered, setHovered] = useState<{ readonly node: GardenStarNode; readonly x: number; readonly y: number } | null>(null)

  useEffect(() => {
    if (host === null) return
    try {
      setFailed(false)
      return mountGardenStarField(
        host,
        model,
        reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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
  }, [host, model, onSelect, reducedMotion, selectedId])

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
