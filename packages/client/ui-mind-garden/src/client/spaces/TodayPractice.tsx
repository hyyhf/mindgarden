/** Daily check-in and encrypted journal composition for the Today space. */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  MindGardenCheckin,
  MindGardenJournal,
} from '@deepseek-ai/dsh-mind-garden-reflection/types'
import { calendarStamp } from '../calendar.ts'
import type { MindGardenKey } from '../locales.ts'
import type { MindGardenViewActions } from '../slots.ts'
import { CheckinIcon, JournalIcon } from '../GardenIcons.tsx'
import shared from './GardenSpace.module.css'
import css from './TodayPractice.module.css'

const MOODS = [-2, -1, 0, 1, 2] as const
const ENERGIES = [1, 2, 3, 4, 5] as const

type TodayPracticeActions = Pick<
  MindGardenViewActions,
  'onCalendarDay' | 'onCreateCheckin' | 'onCreateJournal' | 'onUpdateJournal' | 'onDeleteJournal'
>

/** Plain props for the Today reflection composer. */
export interface TodayPracticeProps extends TodayPracticeActions {
  readonly today: string
  readonly t: (key: MindGardenKey) => string
}

/** Normalize a free-form emotion list into the service's bounded unique words. */
export function emotionWords(value: string): readonly string[] {
  return [...new Set(value.split(/[\s,，、]+/u).map(word => word.trim()).filter(Boolean))].slice(0, 3)
}

/** Render immutable check-ins and user-governed encrypted journal entries. */
export function TodayPractice({
  today,
  onCalendarDay,
  onCreateCheckin,
  onCreateJournal,
  onUpdateJournal,
  onDeleteJournal,
  t,
}: TodayPracticeProps) {
  const [checkins, setCheckins] = useState<readonly MindGardenCheckin[]>([])
  const [journals, setJournals] = useState<readonly MindGardenJournal[]>([])
  const [mood, setMood] = useState<(typeof MOODS)[number]>(0)
  const [energy, setEnergy] = useState<(typeof ENERGIES)[number]>(3)
  const [emotions, setEmotions] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [allowRetrieval, setAllowRetrieval] = useState(false)
  const [editing, setEditing] = useState<MindGardenJournal | null>(null)
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  const [notice, setNotice] = useState<MindGardenKey | null>(null)
  const requestRef = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++requestRef.current
    try {
      const result = await onCalendarDay(today)
      if (request !== requestRef.current) return
      if (!result.ok) {
        setError(true)
        setLoading(false)
        return
      }
      setCheckins(result.value.events.filter((event): event is MindGardenCheckin => event.type === 'checkin'))
      setJournals(result.value.events.filter((event): event is MindGardenJournal => event.type === 'journal').reverse())
      setError(false)
      setLoading(false)
    } catch {
      if (request !== requestRef.current) return
      setError(true)
      setLoading(false)
    }
  }, [onCalendarDay, today])

  useEffect(() => {
    void refresh()
    return () => { requestRef.current++ }
  }, [refresh])

  function resetJournal() {
    setEditing(null)
    setTitle('')
    setBody('')
    setAllowRetrieval(false)
  }

  async function submitCheckin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(false)
    setNotice(null)
    try {
      const result = await onCreateCheckin(mood, energy, emotionWords(emotions), calendarStamp(today))
      if (!result.ok) {
        setError(true)
        return
      }
      setCheckins(current => [...current, result.value])
      setEmotions('')
      setNotice('today.checkin.notice')
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  async function submitJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    const nextBody = body.trim()
    if (pending || nextBody === '') return
    setPending(true)
    setError(false)
    setNotice(null)
    try {
      const result = editing === null
        ? await onCreateJournal(nextTitle, nextBody, allowRetrieval, calendarStamp(today))
        : await onUpdateJournal(editing, nextTitle, nextBody, allowRetrieval)
      if (!result.ok) {
        setError(true)
        return
      }
      if (editing === null) {
        setJournals(current => [result.value, ...current])
        setNotice('today.journal.notice.created')
      } else {
        setJournals(current => current.map(item => item.id === result.value.id ? result.value : item))
        setNotice('today.journal.notice.updated')
      }
      resetJournal()
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  function editJournal(journal: MindGardenJournal) {
    setEditing(journal)
    setTitle(journal.title)
    setBody(journal.body)
    setAllowRetrieval(journal.allowRetrieval)
    setDeleteArmed(null)
    setNotice(null)
  }

  async function deleteJournal(journal: MindGardenJournal) {
    const id = String(journal.id)
    if (deleteArmed !== id) {
      setDeleteArmed(id)
      return
    }
    setPending(true)
    setError(false)
    setNotice(null)
    try {
      const result = await onDeleteJournal(journal)
      if (!result.ok) {
        setError(true)
        return
      }
      setJournals(current => current.filter(item => item.id !== journal.id))
      if (editing?.id === journal.id) resetJournal()
      setDeleteArmed(null)
      setNotice('today.journal.notice.deleted')
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className={css.practice} data-mind-garden-today-practice="active" aria-labelledby="mind-garden-today-title">
      <header className={css.header}>
        <div>
          <span>{t('today.eyebrow')}</span>
          <h2 id="mind-garden-today-title">{t('today.practice.title')}</h2>
          <p>{t('today.subtitle')}</p>
        </div>
        <time dateTime={today}>{today}</time>
      </header>

      {notice !== null && <p className={shared.notice} role="status">{t(notice)}</p>}
      {error && <p className={shared.error} role="alert">{t('today.error')}</p>}
      {loading ? <p className={shared.empty} role="status">{t('today.loading')}</p> : (
        <div className={css.grid}>
          <form className={`${shared.panel} ${css.checkin}`} onSubmit={(event) => { void submitCheckin(event) }}>
            <div className={css.cardHeading}>
              <span aria-hidden="true"><CheckinIcon size={19} /></span>
              <div><h3>{t('today.checkin.title')}</h3><p>{t('today.checkin.subtitle')}</p></div>
            </div>
            <fieldset>
              <legend>{t('today.checkin.mood')}</legend>
              <div className={css.scale}>
                {MOODS.map(value => (
                  <button key={value} type="button" aria-pressed={mood === value} onClick={() => { setMood(value) }}>
                    <span aria-hidden="true">{t(`today.mood.${value}.glyph`)}</span>
                    <small>{t(`today.mood.${value}`)}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t('today.checkin.energy')}</legend>
              <div className={css.energy}>
                {ENERGIES.map(value => (
                  <button key={value} type="button" aria-pressed={energy === value} onClick={() => { setEnergy(value) }}>
                    {value}<small>{t(`today.energy.${value}`)}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <label className={css.field}>
              <span>{t('today.checkin.emotions')}</span>
              <input aria-label={t('today.checkin.emotions')} className={shared.input} value={emotions} placeholder={t('today.checkin.emotions.placeholder')} onChange={(event) => { setEmotions(event.target.value) }} />
              <small>{t('today.checkin.emotions.hint')}</small>
            </label>
            <button className={shared.button} type="submit" disabled={pending}>{t('today.checkin.save')}</button>
            {checkins.length > 0 && (
              <div className={css.checkinTrail} aria-label={t('today.checkin.saved')}>
                {checkins.map(item => (
                  <span key={String(item.id)} title={item.emotionWords.join(' · ')}>
                    {t(`today.mood.${item.mood}.glyph`)} {item.energy}/5
                  </span>
                ))}
              </div>
            )}
          </form>

          <form className={`${shared.panel} ${css.journalComposer}`} onSubmit={(event) => { void submitJournal(event) }}>
            <div className={css.cardHeading}>
              <span aria-hidden="true"><JournalIcon size={19} /></span>
              <div><h3>{editing === null ? t('today.journal.title') : t('today.journal.editing')}</h3><p>{t('today.journal.subtitle')}</p></div>
            </div>
            <label className={css.field}>
              <span>{t('today.journal.name')}</span>
              <input aria-label={t('today.journal.name')} className={shared.input} value={title} maxLength={160} placeholder={t('today.journal.name.placeholder')} onChange={(event) => { setTitle(event.target.value) }} />
            </label>
            <label className={css.field}>
              <span>{t('today.journal.body')}</span>
              <textarea aria-label={t('today.journal.body')} className={shared.textarea} value={body} maxLength={8_000} placeholder={t('today.journal.body.placeholder')} onChange={(event) => { setBody(event.target.value) }} />
            </label>
            <label className={css.retrieval}>
              <input type="checkbox" checked={allowRetrieval} onChange={(event) => { setAllowRetrieval(event.target.checked) }} />
              <span><strong>{t('today.journal.retrieval')}</strong><small>{t('today.journal.retrieval.hint')}</small></span>
            </label>
            <div className={css.composerActions}>
              <button className={shared.button} type="submit" disabled={pending || body.trim() === ''}>
                {editing === null ? t('today.journal.create') : t('today.journal.update')}
              </button>
              {editing !== null && <button className={shared.quietButton} type="button" disabled={pending} onClick={resetJournal}>{t('today.journal.cancel')}</button>}
            </div>
          </form>

          <section className={css.journalShelf} aria-labelledby="mind-garden-journal-shelf">
            <div className={css.shelfHeading}>
              <h3 id="mind-garden-journal-shelf">{t('today.journal.shelf')}</h3>
              <span>{t('today.journal.count').replace('{count}', String(journals.length))}</span>
            </div>
            {journals.length === 0 ? <p className={shared.empty}>{t('today.journal.empty')}</p> : (
              <ul>
                {journals.map(journal => (
                  <li className={`${shared.panel} ${css.journalCard}`} key={String(journal.id)}>
                    <div>
                      <span className={css.journalMeta}>{journal.allowRetrieval ? t('today.journal.retrievable') : t('today.journal.private')}</span>
                      <h4>{journal.title || t('today.journal.untitled')}</h4>
                      <p>{journal.body}</p>
                    </div>
                    <div className={css.journalActions}>
                      <button className={shared.quietButton} type="button" disabled={pending} onClick={() => { editJournal(journal) }}>{t('today.journal.edit')}</button>
                      <button className={shared.dangerButton} type="button" disabled={pending} onClick={() => { void deleteJournal(journal) }}>
                        {deleteArmed === String(journal.id) ? t('today.journal.delete.confirm') : t('today.journal.delete')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
