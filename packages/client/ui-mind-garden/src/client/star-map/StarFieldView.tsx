/** Lightweight React adapter for the lazily loaded constellation renderer. */

import { useEffect, useState } from 'react'
import { loadMindGardenScenes } from '../scene-loader.ts'
import type { GardenStarMapModel, GardenStarNode } from './model.ts'
import css from './StarField.module.css'

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
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading')
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
    let disposed = false
    let teardown: (() => void) | undefined
    setState('loading')
    void loadMindGardenScenes().then((scenes) => {
      if (disposed) return
      teardown = scenes.mountGardenStarField(
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
      setState('ready')
    }).catch(() => {
      if (disposed) return
      host.replaceChildren()
      setState('fallback')
    })
    return () => {
      disposed = true
      teardown?.()
      host.replaceChildren()
    }
  }, [host, model, onSelect, reducedMotion, selectedId, systemReducedMotion])

  return (
    <div className={css.scene} data-render-state={state}>
      <div className={css.host} ref={setHost} aria-hidden="true" />
      {hovered !== null && (
        <div className={css.tooltip} style={{ '--mg-star-x': `${hovered.x}px`, '--mg-star-y': `${hovered.y}px` } as React.CSSProperties}>
          <strong>{hovered.node.title}</strong>
          <p>{hovered.node.detail}</p>
        </div>
      )}
      {state === 'fallback' && <div className={css.fallback} role="status">{fallback}</div>}
    </div>
  )
}
