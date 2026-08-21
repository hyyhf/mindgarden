/** Responsive personal orrery for the Today observatory. */

import { useEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import type { MindGardenMode } from '@deepseek-ai/dsh-mind-garden/core/client'
import type { MindGardenKey } from './locales.ts'
import css from './EditorialOrbit.module.css'

interface OrbitNode {
  readonly id: string
  readonly label: string
  readonly meta: string
  readonly kind: 'question' | 'review' | 'continuity'
}

const POSITIONS = [
  { x: 31, y: 17, depth: 12 },
  { x: 69, y: 17, depth: 18 },
  { x: 84, y: 50, depth: 8 },
  { x: 69, y: 83, depth: 16 },
  { x: 31, y: 83, depth: 10 },
  { x: 16, y: 50, depth: 20 },
] as const

function orbitNodes(
  questions: readonly MindGardenOpenQuestion[],
  reviews: readonly MindGardenPeriodReview[],
  t: (key: MindGardenKey) => string,
): readonly OrbitNode[] {
  const nodes: OrbitNode[] = [
    ...questions.filter(item => item.status === 'open').slice(0, 3).map(item => ({
      id: String(item.id),
      label: item.question,
      meta: t('orbit.question.meta'),
      kind: 'question' as const,
    })),
    ...reviews.filter(item => item.status === 'saved').slice(0, 3).map(item => ({
      id: String(item.id),
      label: item.content,
      meta: item.endStamp.localDate,
      kind: 'review' as const,
    })),
  ]
  const fallbacks: readonly OrbitNode[] = [
    { id: 'today', label: t('orbit.fallback.today'), meta: t('orbit.fallback.unnamed'), kind: 'continuity' },
    { id: 'memory', label: t('orbit.fallback.memory'), meta: t('orbit.fallback.unwritten'), kind: 'review' },
    { id: 'tomorrow', label: t('orbit.fallback.tomorrow'), meta: t('orbit.fallback.choice'), kind: 'question' },
    { id: 'stillness', label: t('orbit.fallback.stillness'), meta: t('orbit.fallback.permission'), kind: 'continuity' },
    { id: 'noticed', label: t('orbit.fallback.noticed'), meta: t('orbit.fallback.stay'), kind: 'review' },
    { id: 'return', label: t('orbit.fallback.return'), meta: t('orbit.fallback.waiting'), kind: 'question' },
  ]
  for (const fallback of fallbacks) {
    if (nodes.length >= POSITIONS.length) break
    nodes.push(fallback)
  }
  return nodes.slice(0, POSITIONS.length)
}

/** Render real reflection records inside a responsive, non-authoritative spatial instrument. */
export function EditorialOrbit({
  questions,
  reviews,
  mode,
  t,
  children,
}: {
  readonly questions: readonly MindGardenOpenQuestion[]
  readonly reviews: readonly MindGardenPeriodReview[]
  readonly mode: MindGardenMode
  readonly t: (key: MindGardenKey) => string
  readonly children?: ReactNode
}) {
  const nodes = orbitNodes(questions, reviews, t)
  const openCount = questions.filter(item => item.status === 'open').length
  const savedCount = reviews.filter(item => item.status === 'saved').length
  const orbitRef = useRef<HTMLElement>(null)
  const tiltFrame = useRef<number | undefined>(undefined)
  const pointerPosition = useRef({ x: 0, y: 0 })

  useEffect(() => () => {
    if (tiltFrame.current !== undefined) window.cancelAnimationFrame(tiltFrame.current)
  }, [])

  function tiltInstrument(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) - 0.5
    const y = ((event.clientY - bounds.top) / bounds.height) - 0.5
    pointerPosition.current = { x, y }
    event.currentTarget.dataset.interacting = 'true'
    if (tiltFrame.current !== undefined) return
    tiltFrame.current = window.requestAnimationFrame(() => {
      tiltFrame.current = undefined
      const target = orbitRef.current
      /* v8 ignore next -- the scheduled frame can outlive an HMR disposal. */
      if (target === null) return
      const next = pointerPosition.current
      target.style.setProperty('--orbit-tilt-x', `${(-next.y * 3).toFixed(2)}deg`)
      target.style.setProperty('--orbit-tilt-y', `${(next.x * 4.5).toFixed(2)}deg`)
      target.style.setProperty('--orbit-light-x', `${((next.x + 0.5) * 100).toFixed(1)}%`)
      target.style.setProperty('--orbit-light-y', `${((next.y + 0.5) * 100).toFixed(1)}%`)
    })
  }

  function settleInstrument() {
    if (tiltFrame.current !== undefined) window.cancelAnimationFrame(tiltFrame.current)
    tiltFrame.current = undefined
    const target = orbitRef.current
    if (target === null) return
    delete target.dataset.interacting
    target.style.setProperty('--orbit-tilt-x', '0deg')
    target.style.setProperty('--orbit-tilt-y', '0deg')
    target.style.setProperty('--orbit-light-x', '32%')
    target.style.setProperty('--orbit-light-y', '24%')
  }

  return (
    <figure
      ref={orbitRef}
      className={css.orbit}
      aria-label={t('orbit.label')}
      onPointerMove={tiltInstrument}
      onPointerLeave={settleInstrument}
    >
      <span className={css.starDepth} aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => <i key={index} />)}
      </span>
      <div className={css.instrumentFrame} aria-hidden="true">
        <span className={css.outerShadow} />
        <span className={css.brassBezel} />
        <span className={css.enamelWell} />
        <svg className={css.instrument} viewBox="0 0 100 100">
          <g className={css.rotorSlow}>
            <circle className={css.calibrationOuter} cx="50" cy="50" r="45" pathLength="96" />
          </g>
          <g className={css.centerMark}>
            <circle cx="50" cy="50" r="11" />
            <circle cx="50" cy="50" r="2.4" />
          </g>
        </svg>
        <span className={css.crown} />
      </div>
      <ol className={css.nodes}>
        {nodes.map((node, index) => {
          const position = POSITIONS[index] ?? POSITIONS[0]
          return (
            <li
              key={node.id}
              data-kind={node.kind}
              style={{
                '--orbit-x': `${position.x}%`,
                '--orbit-y': `${position.y}%`,
                '--orbit-depth': `${position.depth}px`,
                '--orbit-delay': `${index * -1.7}s`,
              } as CSSProperties}
            >
              <span className={css.node} aria-hidden="true" />
              <span className={css.nodeCopy}>
                <strong>{node.label}</strong>
                <small>{node.meta}</small>
              </span>
            </li>
          )
        })}
      </ol>
      <div className={css.centerContent}>
        {children ?? (
          <span className={css.center}>
            <strong>{t('orbit.center')}</strong>
            <small>{t(`mode.${mode}`)}</small>
          </span>
        )}
      </div>
      <figcaption>
        {t('orbit.summary')
          .replace('{questions}', String(openCount))
          .replace('{reviews}', String(savedCount))}
      </figcaption>
    </figure>
  )
}
