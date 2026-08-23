/** Reality-experiment workspace for life themes that need observation. */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  IconCheckOutline16,
  IconPlusOutline16,
  IconSendOutline14,
  IconStopFill16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { MindGardenExperiment } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { calendarStamp } from '../calendar.ts'
import { GrowthIcon, PrivateIcon } from '../GardenIcons.tsx'
import { GROWTH_OBSERVATION_BENCH_V3 } from '../generated-assets.ts'
import type { MindGardenKey } from '../locales.ts'
import type { MindGardenDataResult, MindGardenViewActions } from '../slots.ts'
import shared from './GardenSpace.module.css'
import css from './GrowthSpace.module.css'

type GrowthActions = Pick<
  MindGardenViewActions,
  | 'onListExperiments'
  | 'onCreateExperiment'
  | 'onStartExperiment'
  | 'onObserveExperiment'
  | 'onStopExperiment'
>

/** Plain props for the life-theme experiment space. */
export interface GrowthSpaceProps extends GrowthActions {
  readonly today: string
  readonly onDraftConversation?: (draft: string) => void
  readonly t: (key: MindGardenKey) => string
}

/** Render user-governed, unscored reality experiments and their observations. */
export function GrowthSpace({
  today,
  onListExperiments,
  onCreateExperiment,
  onStartExperiment,
  onObserveExperiment,
  onStopExperiment,
  onDraftConversation = () => undefined,
  t,
}: GrowthSpaceProps) {
  const [experiments, setExperiments] = useState<readonly MindGardenExperiment[]>([])
  const [title, setTitle] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [action, setAction] = useState('')
  const [reviewDate, setReviewDate] = useState('')
  const [observingId, setObservingId] = useState<string | null>(null)
  const [observation, setObservation] = useState('')
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  const [notice, setNotice] = useState<MindGardenKey | null>(null)
  const requestRef = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++requestRef.current
    const result = await onListExperiments()
    if (request !== requestRef.current) return
    if (result.ok) {
      setExperiments(result.value)
      setError(false)
    } else {
      setError(true)
    }
    setLoading(false)
  }, [onListExperiments])

  useEffect(() => {
    void refresh()
    return () => { requestRef.current++ }
  }, [refresh])

  async function mutate(
    actionRequest: () => Promise<MindGardenDataResult<unknown>>,
    success: MindGardenKey,
  ): Promise<boolean> {
    setPending(true)
    setError(false)
    setNotice(null)
    const result = await actionRequest()
    setPending(false)
    if (!result.ok) {
      setError(true)
      return false
    }
    setNotice(success)
    await refresh()
    return true
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    const nextAction = action.trim()
    if (nextTitle === '' || nextAction === '') return
    const created = await mutate(
      async () => await onCreateExperiment(
        nextTitle,
        hypothesis.trim(),
        nextAction,
        calendarStamp(today),
        reviewDate === '' ? undefined : calendarStamp(reviewDate),
      ),
      'growth.notice.created',
    )
    if (created) {
      setTitle('')
      setHypothesis('')
      setAction('')
      setReviewDate('')
    }
  }

  async function recordObservation(item: MindGardenExperiment) {
    const value = observation.trim()
    const recorded = await mutate(
      async () => await onObserveExperiment(item, value, calendarStamp(today)),
      'growth.notice.observed',
    )
    if (recorded) {
      setObservation('')
      setObservingId(null)
    }
  }

  function draftConversation(item: MindGardenExperiment) {
    onDraftConversation(t('growth.draft.template')
      .replace('{title}', item.title)
      .replace('{action}', item.action))
    setNotice('growth.notice.drafted')
  }

  const activeCount = experiments.filter(item => item.status === 'trying' || item.status === 'revised').length
  const observedCount = experiments.filter(item => item.status === 'observed').length

  return (
    <main className={`${shared.space} ${css.growth}`} data-mind-garden-space="growth">
      <section className={css.workshop} style={{ '--mg-growth-scene': `url("${GROWTH_OBSERVATION_BENCH_V3}")` } as CSSProperties}>
        <header className={css.hero}>
          <div className={css.heroCopy}>
            <GrowthIcon size={22} />
            <h1>{t('growth.title')}</h1>
            <p>{t('growth.subtitle')}</p>
            <span className={css.privateLine}><PrivateIcon size={15} />{t('growth.private')}</span>
          </div>
          <figure className={css.fieldInstrument} aria-label={t('growth.instrument.label')}>
            <figcaption>
              <span><strong>{activeCount}</strong>{t('growth.instrument.active')}</span>
              <span><strong>{observedCount}</strong>{t('growth.instrument.observed')}</span>
            </figcaption>
          </figure>
        </header>

        <section className={css.composerDeck} aria-labelledby="mind-garden-growth-composer-title">
          <header>
            <IconPlusOutline16 />
            <h2 id="mind-garden-growth-composer-title">{t('growth.composer.title')}</h2>
          </header>
          <form className={css.composer} onSubmit={(event) => { void submit(event) }}>
          <label>
            <span>{t('growth.input.title')}</span>
            <input className={shared.input} value={title} onChange={(event) => { setTitle(event.target.value) }} />
          </label>
          <label>
            <span>{t('growth.input.reviewDate')}</span>
            <input
              className={shared.input}
              type="date"
              min={today}
              value={reviewDate}
              onChange={(event) => { setReviewDate(event.target.value) }}
            />
          </label>
          <label className={css.wide}>
            <span>{t('growth.input.hypothesis')}</span>
            <input
              className={shared.input}
              value={hypothesis}
              placeholder={t('growth.input.hypothesisPlaceholder')}
              onChange={(event) => { setHypothesis(event.target.value) }}
            />
          </label>
          <label className={css.wide}>
            <span>{t('growth.input.action')}</span>
            <textarea
              className={shared.textarea}
              value={action}
              placeholder={t('growth.input.actionPlaceholder')}
              onChange={(event) => { setAction(event.target.value) }}
            />
          </label>
          <div className={css.composerFooter}>
            <span>{t('growth.composer.boundary')}</span>
            <button className={shared.button} type="submit" disabled={pending || title.trim() === '' || action.trim() === ''}>
              <GrowthIcon size={16} />{t('growth.create')}
            </button>
          </div>
          </form>
        </section>
      </section>

      {notice !== null && <p className={shared.notice} role="status">{t(notice)}</p>}
      {error && <p className={shared.error} role="alert">{t('growth.error')}</p>}

      <section className={css.fieldJournal} aria-labelledby="mind-garden-growth-journal-title">
        <header>
          <div><span>{t('growth.journal.label')}</span><h2 id="mind-garden-growth-journal-title">{t('growth.journal.title')}</h2></div>
          <p>{t('growth.journal.subtitle')}</p>
        </header>
        {loading ? (
          <p className={css.empty} role="status">{t('growth.loading')}</p>
        ) : experiments.length === 0 ? (
          <p className={css.empty}>{t('growth.empty')}</p>
        ) : (
          <ol className={css.list}>
            {experiments.map((item, index) => (
              <li className={css.card} data-status={item.status} key={String(item.id)}>
                <span className={css.sequence} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <article>
                  <header>
                    <div><span className={css.status}>{t(`growth.status.${item.status}`)}</span><h3>{item.title}</h3></div>
                    {item.reviewStamp !== null && <time dateTime={item.reviewStamp.localDate}><span>{t('growth.reviewDate')} · </span><b>{item.reviewStamp.localDate}</b></time>}
                  </header>
                  <dl className={css.meaning}>
                    {item.hypothesis !== '' && (
                      <div><dt>{t('growth.hypothesis')}</dt><dd>{item.hypothesis}</dd></div>
                    )}
                    <div><dt>{t('growth.action')}</dt><dd>{item.action}</dd></div>
                  </dl>
                  {item.observations.length > 0 && (
                    <ol className={css.observations} aria-label={t('growth.observations')}>
                      {item.observations.map(entry => <li key={String(entry.id)}><IconCheckOutline16 />{entry.observation}</li>)}
                    </ol>
                  )}
                  {observingId === String(item.id) && (
                    <div className={css.observationForm}>
                      <label htmlFor={`observation-${String(item.id)}`}>{t('growth.observation')}</label>
                      <textarea
                        id={`observation-${String(item.id)}`}
                        className={shared.textarea}
                        value={observation}
                        onChange={(event) => { setObservation(event.target.value) }}
                      />
                      <button
                        className={shared.button}
                        type="button"
                        disabled={pending || observation.trim() === ''}
                        onClick={() => { void recordObservation(item) }}
                      >
                        <IconCheckOutline16 />{t('growth.record')}
                      </button>
                    </div>
                  )}
                  <footer className={css.actions}>
                    {(item.status === 'proposed' || item.status === 'revised') && (
                      <button
                        className={shared.button}
                        type="button"
                        disabled={pending}
                        onClick={() => { void mutate(
                          async () => await onStartExperiment(item, today),
                          'growth.notice.started',
                        ) }}
                      >
                        <IconCheckOutline16 />{t('growth.start')}
                      </button>
                    )}
                    {(item.status === 'trying' || item.status === 'observed') && (
                      <button
                        className={shared.quietButton}
                        type="button"
                        disabled={pending}
                        onClick={() => { setObservingId(current => current === String(item.id) ? null : String(item.id)) }}
                      >
                        <IconPlusOutline16 />{t('growth.observe')}
                      </button>
                    )}
                    <button className={shared.quietButton} type="button" onClick={() => { draftConversation(item) }}>
                      <IconSendOutline14 />{t('growth.continue')}
                    </button>
                    {item.status !== 'stopped' && (
                      <button
                        className={shared.dangerButton}
                        type="button"
                        disabled={pending}
                        onClick={() => { void mutate(
                          async () => await onStopExperiment(item),
                          'growth.notice.stopped',
                        ) }}
                      >
                        <IconStopFill16 />{t('growth.stop')}
                      </button>
                    )}
                  </footer>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
