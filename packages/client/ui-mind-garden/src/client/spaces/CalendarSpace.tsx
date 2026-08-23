/** Calendar atlas, filtering, conversation handoff, and trend projection. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  IconChevronLeftOutline14,
  IconChevronRightOutline14,
  IconSendOutline14,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  MindGardenCalendarDayValue,
  MindGardenCalendarEvent,
  MindGardenCalendarMonthValue,
  MindGardenReflectionTrendValue,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import {
  CalendarIcon,
  CheckinIcon,
  ConcernsIcon,
  GrowthIcon,
  JournalIcon,
  PhilosophyIcon,
  StarMapIcon,
} from '../GardenIcons.tsx'
import type { MindGardenKey } from '../locales.ts'
import type { MindGardenViewActions } from '../slots.ts'
import shared from './GardenSpace.module.css'
import css from './CalendarSpace.module.css'

type CalendarActions = Pick<
  MindGardenViewActions,
  'onCalendarMonth' | 'onCalendarDay' | 'onReflectionTrend'
>

type CalendarFilter = 'all' | 'checkin' | 'journal' | 'concern' | 'principle' | 'experiment' | 'question'

const FILTERS = [
  'all',
  'checkin',
  'journal',
  'concern',
  'principle',
  'experiment',
  'question',
] as const satisfies readonly CalendarFilter[]

/** One fixed cell in a Gregorian month grid. */
export interface GardenCalendarCell {
  readonly date: string | null
  readonly day: number | null
}

/** Build a Sunday-first grid with complete weeks. */
export function gardenCalendarCells(month: string): readonly GardenCalendarCell[] {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (match === null) return []
  const year = Number(match[1])
  const monthNumber = Number(match[2])
  if (monthNumber < 1 || monthNumber > 12) return []
  const offset = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const count = Math.ceil((offset + days) / 7) * 7
  return Array.from({ length: count }, (_, index) => {
    const day = index - offset + 1
    if (day < 1 || day > days) return { date: null, day: null }
    return {
      date: `${month}-${String(day).padStart(2, '0')}`,
      day,
    }
  })
}

function adjacentMonth(month: string, amount: -1 | 1): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year ?? 0, (monthNumber ?? 1) - 1 + amount, 1))
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function eventCopy(event: MindGardenCalendarEvent, t: (key: MindGardenKey) => string): {
  readonly kind: string
  readonly detail: string
} {
  switch (event.type) {
    case 'checkin':
      return { kind: t('calendar.event.checkin'), detail: event.emotionWords.join(' · ') || t('calendar.event.noWords') }
    case 'journal':
      return { kind: t('calendar.event.journal'), detail: event.title || event.body }
    case 'concern-reminder':
      return { kind: t('calendar.event.concern'), detail: event.concern.content }
    case 'principle':
      return { kind: t('calendar.event.principle'), detail: event.version.content.expression }
    case 'experiment-review':
      return { kind: t('calendar.event.experimentReview'), detail: event.experiment.title }
    case 'experiment-observation':
      return { kind: t('calendar.event.experimentObservation'), detail: event.observation.observation }
    case 'open-question':
      return { kind: t('calendar.event.question'), detail: event.question }
  }
}

function eventMatches(event: MindGardenCalendarEvent, filter: CalendarFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'concern') return event.type === 'concern-reminder'
  if (filter === 'experiment') return event.type === 'experiment-review' || event.type === 'experiment-observation'
  if (filter === 'question') return event.type === 'open-question'
  return event.type === filter
}

function eventIcon(event: MindGardenCalendarEvent) {
  switch (event.type) {
    case 'checkin': return <CheckinIcon size={17} />
    case 'journal': return <JournalIcon size={17} />
    case 'concern-reminder': return <ConcernsIcon size={17} />
    case 'principle': return <PhilosophyIcon size={17} />
    case 'experiment-review':
    case 'experiment-observation': return <GrowthIcon size={17} />
    case 'open-question': return <StarMapIcon size={17} />
  }
}

function trendCoordinates(trend: MindGardenReflectionTrendValue): readonly {
  readonly id: string
  readonly x: string
  readonly y: string
}[] {
  const count = Math.max(1, trend.points.length - 1)
  return trend.points.map((point, index) => {
    const x = 4 + (index / count) * 92
    const y = 44 - ((point.mood + 2) / 4) * 36
    return { id: String(point.id), x: x.toFixed(2), y: y.toFixed(2) }
  })
}

/** Plain props for the calendar space. */
export interface CalendarSpaceProps extends CalendarActions {
  readonly today: string
  readonly onDraftConversation?: (draft: string) => void
  readonly t: (key: MindGardenKey) => string
}

/** Render a tactile month atlas, complete selected-day ledger, filters, and mood trail. */
export function CalendarSpace({
  today,
  onCalendarMonth,
  onCalendarDay,
  onReflectionTrend,
  onDraftConversation = () => undefined,
  t,
}: CalendarSpaceProps) {
  const [month, setMonth] = useState(today.slice(0, 7))
  const [selectedDate, setSelectedDate] = useState(today)
  const [monthValue, setMonthValue] = useState<MindGardenCalendarMonthValue | null>(null)
  const [dayValue, setDayValue] = useState<MindGardenCalendarDayValue | null>(null)
  const [trend, setTrend] = useState<MindGardenReflectionTrendValue | null>(null)
  const [filter, setFilter] = useState<CalendarFilter>('all')
  const [sideMode, setSideMode] = useState<'day' | 'trend'>('day')
  const [notice, setNotice] = useState(false)
  const [error, setError] = useState(false)
  const requestRef = useRef(0)
  const cells = useMemo(() => gardenCalendarCells(month), [month])
  const activity = useMemo(
    () => new Map(monthValue?.days.map(day => [day.date, day]) ?? []),
    [monthValue],
  )
  const filteredEvents = useMemo(
    () => dayValue?.events.filter(event => eventMatches(event, filter)) ?? [],
    [dayValue, filter],
  )
  const plottedTrendCoordinates = useMemo(() => trend === null ? [] : trendCoordinates(trend), [trend])

  const loadMonth = useCallback(async (nextMonth: string) => {
    const request = ++requestRef.current
    const result = await onCalendarMonth(nextMonth)
    if (request !== requestRef.current) return
    if (result.ok) {
      setMonthValue(result.value)
      setError(false)
    } else {
      setError(true)
    }
  }, [onCalendarMonth])

  const loadDay = useCallback(async (date: string) => {
    const result = await onCalendarDay(date)
    if (result.ok) {
      setDayValue(result.value)
      setError(false)
    } else {
      setError(true)
    }
  }, [onCalendarDay])

  useEffect(() => {
    void loadMonth(month)
    return () => { requestRef.current++ }
  }, [loadMonth, month])

  useEffect(() => {
    void loadDay(selectedDate)
  }, [loadDay, selectedDate])

  useEffect(() => {
    let current = true
    void onReflectionTrend(30, today).then((result) => {
      if (!current) return
      if (result.ok) setTrend(result.value)
      else setError(true)
    })
    return () => { current = false }
  }, [onReflectionTrend, today])

  function selectDate(date: string) {
    setSelectedDate(date)
    setSideMode('day')
    setNotice(false)
  }

  function selectMonth(nextMonth: string, date = `${nextMonth}-01`) {
    setMonth(nextMonth)
    setSelectedDate(date)
    setSideMode('day')
    setNotice(false)
  }

  function draftConversation(event: MindGardenCalendarEvent) {
    const copy = eventCopy(event, t)
    onDraftConversation(t('calendar.conversation.draft')
      .replace('{date}', selectedDate)
      .replace('{kind}', copy.kind)
      .replace('{detail}', copy.detail))
    setNotice(true)
  }

  return (
    <main className={shared.space} data-mind-garden-space="calendar">
      <section className={css.atlas}>
      <header className={css.atlasIntro}>
        <div>
          <h1>{t('calendar.title')}</h1>
          <p>{t('calendar.subtitle')}</p>
        </div>
        <span className={css.atlasSeal} aria-hidden="true"><CalendarIcon size={22} /></span>
      </header>
        <header className={css.toolbar}>
          <div className={css.monthControls}>
            <button
              type="button"
              aria-label={t('calendar.previous')}
              onClick={() => { selectMonth(adjacentMonth(month, -1)) }}
            >
              <IconChevronLeftOutline14 />
            </button>
            <label>
              <span>{t('calendar.month')}</span>
              <input
                type="month"
                value={month}
                onChange={(event) => { selectMonth(event.target.value) }}
              />
            </label>
            <button
              type="button"
              aria-label={t('calendar.next')}
              onClick={() => { selectMonth(adjacentMonth(month, 1)) }}
            >
              <IconChevronRightOutline14 />
            </button>
            <button type="button" className={css.todayButton} onClick={() => { selectMonth(today.slice(0, 7), today) }}>
              {t('calendar.today')}
            </button>
          </div>
          <div className={css.modeSwitch} role="group" aria-label={t('calendar.dayDetail')}>
            <button type="button" aria-pressed={sideMode === 'day'} onClick={() => { setSideMode('day') }}>
              {t('calendar.showDay')}
            </button>
            <button type="button" aria-pressed={sideMode === 'trend'} onClick={() => { setSideMode('trend') }}>
              {t('calendar.showTrend')}
            </button>
          </div>
        </header>

        <div className={css.filters} role="group" aria-label={t('calendar.filter')}>
          {FILTERS.map(item => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => { setFilter(item); setSideMode('day') }}
            >
              {t(`calendar.filter.${item}`)}
            </button>
          ))}
        </div>

        {error && <p className={shared.error} role="alert">{t('calendar.error')}</p>}
        <div className={css.layout}>
          <section className={css.calendar} aria-label={t('calendar.grid')}>
            <div className={css.weekdays} aria-hidden="true">
              {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map(day => (
                <span key={day}>{t(`calendar.weekday.${day}`)}</span>
              ))}
            </div>
            <div className={css.grid}>
              {cells.map((cell, index) => {
                if (cell.date === null || cell.day === null) return <span className={css.blank} key={`blank-${index}`} />
                const date = cell.date
                const summary = activity.get(date)
                return (
                  <button
                    type="button"
                    className={css.day}
                    key={date}
                    data-selected={date === selectedDate}
                    data-today={date === today}
                    aria-label={t('calendar.dayLabel')
                      .replace('{date}', date)
                      .replace('{count}', String(summary?.eventCount ?? 0))}
                    onClick={() => { selectDate(date) }}
                  >
                    <span className={css.dayNumber}>{cell.day}</span>
                    {summary === undefined ? <small>—</small> : (
                      <>
                        <small>{t('calendar.eventCount').replace('{count}', String(summary.eventCount))}</small>
                        <span className={css.signals} aria-hidden="true">
                          {summary.checkinCount > 0 && <i data-kind="checkin" />}
                          {summary.journalCount > 0 && <i data-kind="journal" />}
                          {summary.concernCount > 0 && <i data-kind="concern" />}
                          {summary.principleCount > 0 && <i data-kind="principle" />}
                          {summary.experimentCount > 0 && <i data-kind="experiment" />}
                          {summary.openQuestionCount > 0 && <i data-kind="question" />}
                        </span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <aside className={css.detail} aria-label={sideMode === 'day' ? t('calendar.dayDetail') : t('calendar.trend')}>
            {sideMode === 'day' ? (
              <>
                <header className={css.detailHeader}>
                  <div><small>{month}</small><h2>{selectedDate}</h2></div>
                  <strong>{t('calendar.eventCount').replace('{count}', String(filteredEvents.length))}</strong>
                </header>
                {notice && <p className={css.draftNotice} role="status">{t('calendar.notice.drafted')}</p>}
                {dayValue === null ? (
                  <p className={shared.empty}>{t('calendar.loading')}</p>
                ) : filteredEvents.length === 0 ? (
                  <p className={css.emptyDay}>{t('calendar.emptyDay')}</p>
                ) : (
                  <ul className={css.events}>
                    {filteredEvents.map((event, index) => {
                      const copy = eventCopy(event, t)
                      return (
                        <li className={css.event} data-kind={event.type} key={`${event.type}-${index}`}>
                          <span className={css.eventIcon}>{eventIcon(event)}</span>
                          <div><small>{copy.kind}</small><p>{copy.detail}</p></div>
                          <button
                            type="button"
                            aria-label={t('calendar.conversation')}
                            title={t('calendar.conversation')}
                            onClick={() => { draftConversation(event) }}
                          >
                            <IconSendOutline14 />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </>
            ) : (
              <section className={css.trend} aria-label={t('calendar.trend')}>
                <header><small>{t('calendar.showTrend')}</small><h2>{t('calendar.trend')}</h2></header>
                {trend?.canPlot === true ? (
                  <>
                    <svg viewBox="0 0 100 48" role="img" aria-label={t('calendar.trendChart')}>
                      <line x1="4" x2="96" y1="26" y2="26" />
                      <polyline points={plottedTrendCoordinates.map(point => `${point.x},${point.y}`).join(' ')} />
                      {plottedTrendCoordinates.map(point => (
                        <circle key={point.id} cx={point.x} cy={point.y} r="1.8" />
                      ))}
                    </svg>
                    <div className={css.trendScale} aria-hidden="true"><span>−2</span><span>0</span><span>+2</span></div>
                  </>
                ) : (
                  <p className={css.emptyDay}>{t('calendar.trendEmpty')}</p>
                )}
              </section>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
