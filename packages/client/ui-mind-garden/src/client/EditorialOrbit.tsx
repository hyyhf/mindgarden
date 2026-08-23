/** Responsive paper corridor for the Today workspace. */

import { useEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import type { MindGardenMode } from '@deepseek-ai/dsh-mind-garden/core/client'
import type { MindGardenKey } from './locales.ts'
import { GARDEN_HOME_COURTYARD_V4 } from './generated-assets.ts'
import css from './EditorialOrbit.module.css'

interface CorridorStation {
  readonly id: 'checkin' | 'question' | 'review'
  readonly href: string
  readonly label: string
  readonly meta: string
  readonly kind: 'porcelain' | 'paper' | 'stone'
}

/** Render truthful records as three navigable stations in the morning paper corridor. */
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
  const modeLabel = mode === 'serenity' ? t('mode.serenity') : t('mode.clarity')
  const currentQuestion = questions.find(item => item.status === 'open')
  const currentReview = reviews.find(item => item.status === 'saved')
  const openCount = questions.filter(item => item.status === 'open').length
  const savedCount = reviews.filter(item => item.status === 'saved').length
  const corridorRef = useRef<HTMLElement>(null)
  const tiltFrame = useRef<number | undefined>(undefined)
  const pointerPosition = useRef({ x: 0, y: 0 })
  const stations: readonly CorridorStation[] = [
    {
      id: 'checkin',
      href: '#mind-garden-today-title',
      label: t('today.observatory.checkin'),
      meta: modeLabel,
      kind: 'porcelain',
    },
    {
      id: 'question',
      href: '#mind-garden-questions-title',
      label: currentQuestion?.question ?? t('orbit.fallback.stillness'),
      meta: t('today.echo.question'),
      kind: 'paper',
    },
    {
      id: 'review',
      href: '#mind-garden-reviews-title',
      label: currentReview?.content ?? t('orbit.fallback.memory'),
      meta: t('today.echo.review'),
      kind: 'stone',
    },
  ]

  useEffect(() => () => {
    if (tiltFrame.current !== undefined) window.cancelAnimationFrame(tiltFrame.current)
  }, [])

  function tiltCorridor(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerPosition.current = {
      x: ((event.clientX - bounds.left) / bounds.width) - 0.5,
      y: ((event.clientY - bounds.top) / bounds.height) - 0.5,
    }
    if (tiltFrame.current !== undefined) return
    tiltFrame.current = window.requestAnimationFrame(() => {
      tiltFrame.current = undefined
      const target = corridorRef.current
      /* v8 ignore next -- a scheduled frame can outlive HMR disposal. */
      if (target === null) return
      const next = pointerPosition.current
      target.style.setProperty('--corridor-tilt-x', `${(-next.y * 1.8).toFixed(2)}deg`)
      target.style.setProperty('--corridor-tilt-y', `${(next.x * 2.4).toFixed(2)}deg`)
      target.style.setProperty('--corridor-light-x', `${((next.x + 0.5) * 100).toFixed(1)}%`)
    })
  }

  function settleCorridor() {
    if (tiltFrame.current !== undefined) window.cancelAnimationFrame(tiltFrame.current)
    tiltFrame.current = undefined
    const target = corridorRef.current
    if (target === null) return
    target.style.setProperty('--corridor-tilt-x', '0deg')
    target.style.setProperty('--corridor-tilt-y', '0deg')
    target.style.setProperty('--corridor-light-x', '28%')
  }

  return (
    <figure
      ref={corridorRef}
      className={css.corridor}
      style={{ '--mg-courtyard-scene': `url("${GARDEN_HOME_COURTYARD_V4}")` } as CSSProperties}
      aria-label={t('orbit.label')}
      onPointerMove={tiltCorridor}
      onPointerLeave={settleCorridor}
    >
      <div className={css.entry}>
        {children ?? (
          <span className={css.defaultEntry}>
            <strong>{t('orbit.center')}</strong>
            <small>{modeLabel}</small>
          </span>
        )}
      </div>

      <div className={css.scene}>
        <span className={css.morningLight} aria-hidden="true" />
        <svg className={css.path} viewBox="0 0 760 330" preserveAspectRatio="none" aria-hidden="true">
          <path d="M38 260 C155 180 240 238 336 152 S530 148 722 56" />
          <circle cx="62" cy="244" r="4" />
          <circle cx="346" cy="142" r="4" />
          <circle cx="700" cy="68" r="4" />
        </svg>
        <ol className={css.stations}>
          {stations.map((station, index) => (
            <li key={station.id} data-kind={station.kind} data-position={index + 1}>
              <a href={station.href} className={css.station}>
                <span className={css.material} aria-hidden="true">
                  {station.kind === 'porcelain' && <span className={css.porcelainToken} />}
                  {station.kind === 'paper' && <span className={css.paperFold} />}
                  {station.kind === 'stone' && <span className={css.stoneSeal} />}
                </span>
                <span className={css.stationCopy}>
                  <small>{station.meta}</small>
                  <strong>{station.label}</strong>
                  <em>{t('orbit.fallback.return')} →</em>
                </span>
              </a>
            </li>
          ))}
        </ol>
        <aside className={css.sceneNote}>
          <strong>{t('today.echo.title')}</strong>
          <span>{t('orbit.summary').replace('{questions}', String(openCount)).replace('{reviews}', String(savedCount))}</span>
        </aside>
      </div>

    </figure>
  )
}
