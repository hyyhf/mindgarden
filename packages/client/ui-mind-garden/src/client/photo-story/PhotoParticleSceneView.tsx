/** Lightweight React adapter for the lazily loaded photo particle renderer. */

import { useEffect, useRef, useState } from 'react'
import type { MindGardenPhotoParticleConfig } from '@deepseek-ai/dsh-mind-garden/media/types'
import { loadMindGardenScenes } from '../scene-loader.ts'
import type { PhotoParticleController } from './PhotoParticleScene.tsx'
import css from './PhotoParticleScene.module.css'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => { resolve(image) }
    image.onerror = () => { reject(new Error('photo-decode-failed')) }
    image.src = src
  })
}

/** Keep a verified-image fallback visible while the optional WebGL renderer loads. */
export function PhotoParticleScene({
  src,
  alt,
  config,
  labels,
  onCount,
  recomposeToken = 0,
}: {
  readonly src: string
  readonly alt: string
  readonly config: MindGardenPhotoParticleConfig
  readonly labels: {
    readonly scene: string
    readonly loading: string
    readonly fallback: string
    readonly reduced: string
  }
  readonly onCount?: (count: number) => void
  readonly recomposeToken?: number
}) {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'fallback' | 'reduced'>('loading')
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const controllerRef = useRef<PhotoParticleController | null>(null)
  const configRef = useRef(config)
  const onCountRef = useRef(onCount)
  const recomposeRef = useRef(recomposeToken)
  configRef.current = config
  onCountRef.current = onCount

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setReducedMotion(query.matches) }
    update()
    query.addEventListener('change', update)
    return () => { query.removeEventListener('change', update) }
  }, [])

  useEffect(() => { controllerRef.current?.update(config) }, [config])

  useEffect(() => {
    if (recomposeRef.current === recomposeToken) return
    recomposeRef.current = recomposeToken
    controllerRef.current?.recompose()
  }, [recomposeToken])

  useEffect(() => {
    if (host === null) return
    if (reducedMotion) {
      controllerRef.current?.dispose()
      controllerRef.current = null
      host.replaceChildren()
      onCountRef.current?.(0)
      setState('reduced')
      return
    }
    let disposed = false
    setState('loading')
    void Promise.all([loadImage(src), loadMindGardenScenes()]).then(([image, scenes]) => {
      if (disposed) return
      const controller = scenes.mountPhotoParticleScene(host, image, configRef.current, false)
      controllerRef.current = controller
      onCountRef.current?.(controller.count)
      setState('ready')
    }).catch(() => {
      if (!disposed) setState('fallback')
    })
    return () => {
      disposed = true
      controllerRef.current?.dispose()
      controllerRef.current = null
      host.replaceChildren()
    }
  }, [host, reducedMotion, src])

  return (
    <figure className={css.scene} data-render-state={state} style={{ '--mg-photo-bg': config.rendering.background } as React.CSSProperties}>
      <div className={css.host} ref={setHost} aria-label={labels.scene} role="img" />
      {state === 'loading' && <span className={css.status} role="status">{labels.loading}</span>}
      {(state === 'fallback' || state === 'reduced') && (
        <div className={css.fallback}>
          <img src={src} alt={alt} />
          <span role="status">{state === 'reduced' ? labels.reduced : labels.fallback}</span>
        </div>
      )}
      <i className={css.vignette} aria-hidden="true" style={{ opacity: config.effects.vignette }} />
    </figure>
  )
}
