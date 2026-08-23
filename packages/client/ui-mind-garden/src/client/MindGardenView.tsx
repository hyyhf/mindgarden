/** Full-session Mind Garden review center. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  IconCloseOutline16,
  IconDataOutline16,
  IconQuestionOutline14,
  IconRefreshOutline14,
  IconSendOutline14,
  IconSettingsOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PropsLocale, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { MindGardenSessionProjection } from '@deepseek-ai/dsh-mind-garden/core/client'
import type {
  MindGardenOpenQuestion,
  MindGardenOpenQuestionStatus,
  MindGardenPeriodReview,
  MindGardenPeriodReviewMaterialCategory,
  MindGardenPeriodReviewMaterialValue,
  MindGardenPeriodReviewStatus,
  MindGardenPeriodReviewType,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import type { MindGardenStarMapOverview } from '@deepseek-ai/dsh-mind-garden/star-map/types'
import { calendarStamp, currentPeriod, localDate } from './calendar.ts'
import type { MindGardenDataResult, MindGardenViewActions } from './slots.ts'
import type { MindGardenKey } from './locales.ts'
import { MindGardenPanel } from './MindGardenDock.tsx'
import { GardenSidebar } from './GardenSidebar.tsx'
import { EditorialOrbit } from './EditorialOrbit.tsx'
import { GARDEN_THRESHOLD_WARM, LIFE_TIME_CORRIDOR_V3 } from './generated-assets.ts'
import { GardenMarkIcon, LifeReviewIcon, PrivateIcon } from './GardenIcons.tsx'
import type { MindGardenSpace } from './garden-store.ts'
import type { createMindGardenViewStore } from './garden-store.ts'
import { StarMapSpace } from './star-map/StarMapSpace.tsx'
import { ConcernsSpace } from './spaces/ConcernsSpace.tsx'
import { CalendarSpace } from './spaces/CalendarSpace.tsx'
import { GrowthSpace } from './spaces/GrowthSpace.tsx'
import { PhilosophySpace } from './spaces/PhilosophySpace.tsx'
import { MemoryGovernance } from './spaces/MemoryGovernance.tsx'
import { TodayPractice } from './spaces/TodayPractice.tsx'
import { PhotoStorySpace } from './photo-story/PhotoStorySpace.tsx'
import { GardenPortabilityPanel } from './GardenPortabilityPanel.tsx'
import css from './MindGardenView.module.css'

const CATEGORIES = ['events', 'ongoing', 'changes', 'experiments', 'focus'] as const satisfies readonly MindGardenPeriodReviewMaterialCategory[]
const PERIOD_TYPES = ['week', 'month', 'year'] as const satisfies readonly MindGardenPeriodReviewType[]
const DIRECTION_CONTRACT = `<!-- IMPECCABLE 9e22e091
THESIS: A lived-in morning courtyard turns private reflection into a tactile passage; it refuses the repeated heading, explanation, container, list template.
OWN-WORLD: Luminous xuan paper, pale-ash joinery, honed limestone, matte porcelain, physical brass paths, deep indigo actions, muted plum bindings, grounded shadows, and Noto Sans SC operational type.
STORY: Five clear garden regions lead to nine fully preserved tools, while each destination becomes its own recognizable room with truthful records and explicit control.
FIRST VIEWPORT: A slim five-region header opens directly onto a 38/62 practical entry and full-depth B+C courtyard corridor; three semantic stations sit over a generated physical scene and lead into complete tools below.
FORM: B paper-corridor spatial depth fused with C morning architecture, top navigation, and quick-action hierarchy, approved by the user, seed 9e22e091.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->`

/** Pure view props used both by the slot adapter and component tests. */
export interface MindGardenReviewCenterProps extends MindGardenViewActions, PropsLocale<'mindGarden'> {
  /** Undefined means projection capability loading; null means inactive. */
  projection: MindGardenSessionProjection | null | undefined
  /** Selected local garden space; defaults to the reflection overview in direct component tests. */
  activeSpace?: MindGardenSpace
  /** Compact local rail preference. */
  sidebarCollapsed?: boolean
  /** Persist the selected local space. */
  onSelectSpace?: (space: MindGardenSpace) => void
  /** Persist the local rail width preference. */
  onToggleSidebar?: () => void
  /** Place an explicitly selected garden record into Harness's resident composer. */
  onDraftConversation?: (draft: string) => void
}

const ignoreSpaceSelection = (_space: MindGardenSpace): void => undefined
const ignoreSidebarToggle = (): void => undefined
const ignoreConversationDraft = (_draft: string): void => undefined

function errorKey(code: string): MindGardenKey {
  if (code === 'open-question-version-conflict' || code === 'period-review-version-conflict') {
    return 'review.error.conflict'
  }
  if (code === 'period-review-material-conflict') return 'review.error.materialChanged'
  if (code === 'period-review-source-required') return 'review.error.noMaterial'
  return 'review.error.generic'
}

function statusKey(status: MindGardenOpenQuestionStatus): MindGardenKey {
  return `question.status.${status}`
}

function reviewStatusKey(status: MindGardenPeriodReviewStatus): MindGardenKey {
  return `review.status.${status}`
}

/** Render the inactive gateway or the active review center. */
export function MindGardenReviewCenter({
  projection,
  onExportBackup,
  onInspectBackup,
  onRestoreBackup,
  onRotateVaultKey,
  onStarMapOverview,
  onSaveStarRitual,
  onCompleteStarRitual,
  onUpdateStarProfile,
  onUpdateStarTrait,
  onDrawStarCard,
  onCalibrateStarCard,
  onFinalizeStarCard,
  onContinueStarCard,
  onApplyStarCardRevision,
  onListMemories,
  onProposeMemory,
  onConfirmMemory,
  onUpdateMemory,
  onRejectMemory,
  onResolveMemoryRelationship,
  onListMemoryRevisions,
  onExtractMemories,
  onLatestMemoryExtraction,
  onMemoryAutomationPolicy,
  onSetMemoryAutomationPolicy,
  onDeleteMemory,
  onLatestMemoryAudit,
  onListOpenQuestions,
  onCreateOpenQuestion,
  onUpdateOpenQuestion,
  onPeriodReviewMaterial,
  onCreatePeriodReview,
  onListPeriodReviews,
  onUpdatePeriodReview,
  onListConcerns,
  onCreateConcern,
  onUpdateConcern,
  onCompleteConcern,
  onConvertConcern,
  onCalendarMonth,
  onCalendarDay,
  onCreateCheckin,
  onCreateJournal,
  onUpdateJournal,
  onDeleteJournal,
  onReflectionTrend,
  onListExperiments,
  onCreateExperiment,
  onStartExperiment,
  onObserveExperiment,
  onStopExperiment,
  onListContemplations,
  onListPrincipleProposals,
  onListPrinciples,
  onAcceptPrincipleProposal,
  onRejectPrincipleProposal,
  onRevisePrincipleStatus,
  onListPhotoStories,
  onCreatePhotoStory,
  onReadPhotoStory,
  onObservePhotoStory,
  onContinuePhotoStory,
  onUpdatePhotoStory,
  onDeletePhotoStory,
  activeSpace = 'today',
  sidebarCollapsed = false,
  onSelectSpace = ignoreSpaceSelection,
  onToggleSidebar = ignoreSidebarToggle,
  onDraftConversation = ignoreConversationDraft,
  t,
  ...dockActions
}: MindGardenReviewCenterProps) {
  const today = localDate(new Date())
  const initialPeriod = useMemo(() => currentPeriod('week'), [])
  const [questions, setQuestions] = useState<readonly MindGardenOpenQuestion[]>([])
  const [reviews, setReviews] = useState<readonly MindGardenPeriodReview[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<MindGardenKey | null>(null)
  const [notice, setNotice] = useState<MindGardenKey | null>(null)
  const [question, setQuestion] = useState('')
  const [questionDate, setQuestionDate] = useState(today)
  const [periodType, setPeriodType] = useState<MindGardenPeriodReviewType>('week')
  const [startDate, setStartDate] = useState(initialPeriod.start)
  const [endDate, setEndDate] = useState(initialPeriod.end)
  const [material, setMaterial] = useState<MindGardenPeriodReviewMaterialValue | null>(null)
  const [reviewContent, setReviewContent] = useState('')
  const [starSidebar, setStarSidebar] = useState<MindGardenStarMapOverview | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const requestRef = useRef(0)
  const pendingRef = useRef(false)
  const settingsSheetRef = useRef<HTMLDivElement>(null)
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null)

  const closeSettings = useCallback(() => {
    setSettingsOpen(false)
    requestAnimationFrame(() => { settingsTriggerRef.current?.focus({ preventScroll: true }) })
  }, [])

  useEffect(() => {
    if (!settingsOpen) return
    const containFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSettings()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(settingsSheetRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [])]
      const first = focusable[0]
      const last = focusable.at(-1)
      if (first === undefined || last === undefined) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', containFocus)
    return () => { window.removeEventListener('keydown', containFocus) }
  }, [closeSettings, settingsOpen])

  useEffect(() => {
    let disposed = false
    void onStarMapOverview().then((result) => {
      if (!disposed && result.ok) setStarSidebar(result.value)
    })
    return () => { disposed = true }
  }, [activeSpace, onStarMapOverview])

  const refresh = useCallback(async (showLoading = false) => {
    const request = ++requestRef.current
    if (showLoading) setLoading(true)
    const [questionResult, reviewResult] = await Promise.all([
      onListOpenQuestions(),
      onListPeriodReviews(),
    ])
    if (request !== requestRef.current) return false
    if (!questionResult.ok) {
      setError(errorKey(questionResult.code))
      setLoading(false)
      return false
    }
    if (!reviewResult.ok) {
      setError(errorKey(reviewResult.code))
      setLoading(false)
      return false
    }
    setQuestions(questionResult.value)
    setReviews(reviewResult.value)
    setError(null)
    setLoading(false)
    return true
  }, [onListOpenQuestions, onListPeriodReviews])

  useEffect(() => {
    if (projection === null || projection === undefined) return
    void refresh(true)
    return () => { requestRef.current++ }
  }, [projection, refresh])

  const mutate = useCallback(async <T,>(
    action: () => Promise<MindGardenDataResult<T>>,
    success: MindGardenKey,
  ): Promise<T | null> => {
    /* v8 ignore next -- disabled controls close the ordinary render window; the ref closes same-tick activation. */
    if (pendingRef.current) return null
    pendingRef.current = true
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      const result = await action()
      if (!result.ok) {
        if (result.code.includes('conflict')) {
          const reloaded = await refresh()
          if (reloaded) setError(errorKey(result.code))
        } else {
          setError(errorKey(result.code))
        }
        return null
      }
      await refresh()
      setNotice(success)
      return result.value
    } catch {
      setError('review.error.generic')
      return null
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }, [refresh])

  if (projection === undefined) {
    return <div className={css.loading} role="status">{t('review.loading')}</div>
  }

  if (projection === null) {
    return (
      <main className={css.inactive}>
        <div className={css.inactiveContent}>
          <div className={css.inactiveCopy}>
            <span className={css.eyebrow}>{t('view.garden')}</span>
            <h1>{t('review.inactive.title')}</h1>
            <p>{t('review.inactive.body')}</p>
          </div>
          <MindGardenPanel projection={null} {...dockActions} t={t} />
        </div>
        <img className={css.inactiveArtwork} src={GARDEN_THRESHOLD_WARM} alt="" />
      </main>
    )
  }

  const savedCount = reviews.filter(item => item.status === 'saved').length
  const showQuestions = activeSpace === 'today' || activeSpace === 'memory'
  const showReviews = activeSpace === 'today' || activeSpace === 'life'
  const materialGroups = CATEGORIES.map(category => ({
    category,
    items: material?.items.filter(item => item.category === category) ?? [],
  })).filter(group => group.items.length > 0)

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = question.trim()
    if (value === '') return
    const created = await mutate(
      () => onCreateOpenQuestion(value, calendarStamp(questionDate)),
      'question.notice.created',
    )
    if (created !== null) setQuestion('')
  }

  async function transitionQuestion(item: MindGardenOpenQuestion, status: MindGardenOpenQuestionStatus) {
    await mutate(
      () => onUpdateOpenQuestion(item, item.question, status, calendarStamp(today)),
      status === 'open' ? 'question.notice.reopened' : 'question.notice.closed',
    )
  }

  async function loadMaterial() {
    /* v8 ignore next -- the invoking button is disabled for every invalid or pending state. */
    if (startDate === '' || endDate === '' || startDate > endDate || pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      const result = await onPeriodReviewMaterial({
        periodType,
        startStamp: calendarStamp(startDate),
        endStamp: calendarStamp(endDate),
      })
      if (!result.ok) {
        setError(errorKey(result.code))
        return
      }
      setMaterial(result.value)
      setNotice('review.notice.materialReady')
    } catch {
      setError('review.error.generic')
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = reviewContent.trim()
    if (material === null || material.sources.length === 0 || content === '') return
    const created = await mutate(
      () => onCreatePeriodReview(material, content),
      'review.notice.created',
    )
    if (created !== null) {
      setMaterial(null)
      setReviewContent('')
    }
  }

  async function transitionReview(item: MindGardenPeriodReview, status: MindGardenPeriodReviewStatus) {
    await mutate(
      () => onUpdatePeriodReview(item, item.content, status),
      status === 'saved' ? 'review.notice.saved' : 'review.notice.archived',
    )
  }

  function selectPeriod(value: MindGardenPeriodReviewType) {
    const range = currentPeriod(value)
    setPeriodType(value)
    setStartDate(range.start)
    setEndDate(range.end)
    setMaterial(null)
  }

  return (
    <div className={css.shell} data-mind-garden-view="active" data-active-space={activeSpace}>
      <template dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
      <GardenSidebar
        activeSpace={activeSpace}
        collapsed={sidebarCollapsed}
        starState={
          starSidebar === null || !starSidebar.profile.onboardingCompleted
            ? 'ritual'
            : starSidebar.traits.some(trait => trait.status === 'pending')
              ? 'new-dust'
              : starSidebar.activeCard !== null
                ? 'continue'
                : 'draw'
        }
        starCount={
          starSidebar?.traits.filter(trait => trait.status === 'pending').length
          || starSidebar?.cards.filter(card => card.status === 'saved').length
          || 0
        }
        onSelect={onSelectSpace}
        onSettings={(trigger) => {
          settingsTriggerRef.current = trigger
          setSettingsOpen(true)
        }}
        onToggle={onToggleSidebar}
        t={t}
      />
      <section className={css.workspace}>
        {activeSpace === 'photo-story' ? (
          <PhotoStorySpace
            today={today}
            onListPhotoStories={onListPhotoStories}
            onCreatePhotoStory={onCreatePhotoStory}
            onReadPhotoStory={onReadPhotoStory}
            onObservePhotoStory={onObservePhotoStory}
            onContinuePhotoStory={onContinuePhotoStory}
            onUpdatePhotoStory={onUpdatePhotoStory}
            onDeletePhotoStory={onDeletePhotoStory}
            t={t}
          />
        ) : activeSpace === 'star-map' ? (
          <StarMapSpace
            questions={questions}
            reviews={reviews}
            mode={projection.state.mode}
            onOverview={onStarMapOverview}
            onSaveRitual={onSaveStarRitual}
            onCompleteRitual={onCompleteStarRitual}
            onUpdateProfile={onUpdateStarProfile}
            onUpdateTrait={onUpdateStarTrait}
            onDrawCard={onDrawStarCard}
            onCalibrateCard={onCalibrateStarCard}
            onFinalizeCard={onFinalizeStarCard}
            onContinueCard={onContinueStarCard}
            onApplyCardRevision={onApplyStarCardRevision}
            t={t}
            onBack={() => { onSelectSpace('today') }}
          />
        ) : activeSpace === 'concerns' ? (
          <ConcernsSpace
            today={today}
            onListConcerns={onListConcerns}
            onCreateConcern={onCreateConcern}
            onUpdateConcern={onUpdateConcern}
            onCompleteConcern={onCompleteConcern}
            onConvertConcern={onConvertConcern}
            onDraftConversation={onDraftConversation}
            t={t}
          />
        ) : activeSpace === 'calendar' ? (
          <CalendarSpace
            today={today}
            onCalendarMonth={onCalendarMonth}
            onCalendarDay={onCalendarDay}
            onReflectionTrend={onReflectionTrend}
            onDraftConversation={onDraftConversation}
            t={t}
          />
        ) : activeSpace === 'growth' ? (
          <GrowthSpace
            today={today}
            onListExperiments={onListExperiments}
            onCreateExperiment={onCreateExperiment}
            onStartExperiment={onStartExperiment}
            onObserveExperiment={onObserveExperiment}
            onStopExperiment={onStopExperiment}
            onDraftConversation={onDraftConversation}
            t={t}
          />
        ) : activeSpace === 'philosophy' ? (
          <PhilosophySpace
            today={today}
            onListContemplations={onListContemplations}
            onListPrincipleProposals={onListPrincipleProposals}
            onListPrinciples={onListPrinciples}
            onAcceptPrincipleProposal={onAcceptPrincipleProposal}
            onRejectPrincipleProposal={onRejectPrincipleProposal}
            onRevisePrincipleStatus={onRevisePrincipleStatus}
            onDraftConversation={onDraftConversation}
            t={t}
          />
        ) : (
          <main className={css.view}>
            {activeSpace === 'today' ? (
              <section className={css.todayOpening} data-mind-garden-space="today">
                <div className={css.orreryStage}>
                  <EditorialOrbit
                    questions={questions}
                    reviews={reviews}
                    mode={projection.state.mode}
                    t={t}
                  >
                    <header className={css.orreryHero}>
                      <h1>{t('today.observatory.title')}</h1>
                      <p>{t('today.observatory.prompt')}</p>
                      <div className={css.heroActions}>
                        <a className={css.heroPrimary} href="#mind-garden-today-title">{t('today.observatory.checkin')}</a>
                        <a className={css.heroSecondary} href="#mind-garden-questions-title">{t('today.observatory.question')}</a>
                      </div>
                      <div className={css.instrumentStatus}>
                        <span className={css.posture}>{t(`mode.${projection.state.mode}`)}</span>
                        <span className={css.privacy}><PrivateIcon size={13} />{t('review.private')}</span>
                      </div>
                    </header>
                  </EditorialOrbit>
                </div>
              </section>
            ) : activeSpace === 'life' ? (
              <section className={css.lifeOpening} style={{ '--mg-life-scene': `url("${LIFE_TIME_CORRIDOR_V3}")` } as CSSProperties} data-mind-garden-space="life">
                <div className={css.lifeCopy}>
                  <LifeReviewIcon size={24} />
                  <h1>{t('life.title')}</h1>
                  <p>{t('life.subtitle')}</p>
                  <span className={css.privacy}><PrivateIcon size={13} />{t('review.private')}</span>
                </div>
                <div className={css.lifeMetrics} aria-label={t('review.overview')}>
                  <span><strong>{reviews.length}</strong>{t('life.metric.reviews')}</span>
                  <span><strong>{savedCount}</strong>{t('life.metric.saved')}</span>
                  <span><strong>{t(`review.period.${periodType}`)}</strong>{t('life.metric.range')}</span>
                </div>
              </section>
            ) : null}

            {activeSpace === 'today' && (
              <TodayPractice
                today={today}
                onCalendarDay={onCalendarDay}
                onCreateCheckin={onCreateCheckin}
                onCreateJournal={onCreateJournal}
                onUpdateJournal={onUpdateJournal}
                onDeleteJournal={onDeleteJournal}
                t={t}
              />
            )}

            {activeSpace === 'memory' && (
              <MemoryGovernance
                onListMemories={onListMemories}
                onProposeMemory={onProposeMemory}
                onConfirmMemory={onConfirmMemory}
                onUpdateMemory={onUpdateMemory}
                onRejectMemory={onRejectMemory}
                onResolveMemoryRelationship={onResolveMemoryRelationship}
                onListMemoryRevisions={onListMemoryRevisions}
                onExtractMemories={onExtractMemories}
                onLatestMemoryExtraction={onLatestMemoryExtraction}
                onMemoryAutomationPolicy={onMemoryAutomationPolicy}
                onSetMemoryAutomationPolicy={onSetMemoryAutomationPolicy}
                onDeleteMemory={onDeleteMemory}
                onLatestMemoryAudit={onLatestMemoryAudit}
                onDraftConversation={onDraftConversation}
                t={t}
              />
            )}

            {loading && <div className={css.loading} role="status">{t('review.loading')}</div>}
            {error !== null && (
              <div className={css.feedbackError} role="alert">
                <span>{t(error)}</span>
                <button type="button" onClick={() => { void refresh(true) }}>{t('review.retry')}</button>
              </div>
            )}
            {notice !== null && <p className={css.feedbackNotice} role="status">{t(notice)}</p>}

            {!loading && (showQuestions || showReviews) && (
              <div className={css.columns} data-scope={activeSpace}>
                {showQuestions && <section className={css.section} aria-labelledby="mind-garden-questions-title">
                  <div className={css.sectionHeader}>
                    <div>
                      <span className={css.sectionMark} aria-hidden="true"><IconQuestionOutline14 /></span>
                      <h2 id="mind-garden-questions-title">{t('question.title')}</h2>
                    </div>
                    <p>{t('question.subtitle')}</p>
                  </div>
                  <form className={css.composer} onSubmit={(event) => { void submitQuestion(event) }}>
                    <label htmlFor="mind-garden-question">{t('question.input.label')}</label>
                    <textarea
                      id="mind-garden-question"
                      value={question}
                      onChange={(event) => { setQuestion(event.target.value) }}
                      placeholder={t('question.input.placeholder')}
                      rows={3}
                      disabled={pending}
                    />
                    <div className={css.formFooter}>
                      <label>{t('question.date')}<input type="date" value={questionDate} onChange={(event) => { setQuestionDate(event.target.value) }} disabled={pending} /></label>
                      <button type="submit" className={css.primary} disabled={pending || question.trim() === '' || questionDate === ''}>{t('question.add')}</button>
                    </div>
                  </form>
                  <div className={css.cardList}>
                    {questions.length === 0 && <EmptyState title={t('question.empty.title')} body={t('question.empty.body')} />}
                    {questions.map(item => (
                      <article className={css.questionCard} key={String(item.id)} data-status={item.status}>
                        <div className={css.cardMeta}>
                          <span className={css.status}>{t(statusKey(item.status))}</span>
                          <time dateTime={item.createdStamp.localDate}>{item.createdStamp.localDate}</time>
                        </div>
                        <p className={css.questionText}>{item.question}</p>
                        {item.source !== null && <blockquote>{item.source.evidenceQuote}</blockquote>}
                        <div className={css.cardActions}>
                          {item.status === 'open' ? (
                            <>
                              <button type="button" disabled={pending} onClick={() => { void transitionQuestion(item, 'resolved') }}>{t('question.resolve')}</button>
                              <button type="button" disabled={pending} onClick={() => { void transitionQuestion(item, 'dismissed') }}>{t('question.dismiss')}</button>
                            </>
                          ) : (
                            <button type="button" disabled={pending} onClick={() => { void transitionQuestion(item, 'open') }}>{t('question.reopen')}</button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>}

                {showReviews && <section className={css.section} aria-labelledby="mind-garden-reviews-title">
                  <div className={css.sectionHeader}>
                    <div>
                      <span className={css.sectionMark} aria-hidden="true"><IconRefreshOutline14 /></span>
                      <h2 id="mind-garden-reviews-title">{t('review.period.title')}</h2>
                    </div>
                    <p>{t('review.period.subtitle')}</p>
                  </div>
                  <div className={css.rangePicker}>
                    <label>{t('review.period.type')}<select value={periodType} onChange={(event) => { selectPeriod(event.target.value as MindGardenPeriodReviewType) }} disabled={pending}>{PERIOD_TYPES.map(type => <option key={type} value={type}>{t(`review.period.${type}`)}</option>)}</select></label>
                    <label>{t('review.period.start')}<input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setMaterial(null) }} disabled={pending} /></label>
                    <label>{t('review.period.end')}<input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setMaterial(null) }} disabled={pending} /></label>
                    <button type="button" className={css.secondary} onClick={() => { void loadMaterial() }} disabled={pending || startDate === '' || endDate === '' || startDate > endDate}>{t('review.period.load')}</button>
                  </div>

                  {material !== null && (
                    <form className={css.material} onSubmit={(event) => { void submitReview(event) }}>
                      <div className={css.materialHeader}>
                        <strong>{t('review.material.title')}</strong>
                        <span>{t('review.material.count').replace('{count}', String(material.sources.length))}</span>
                      </div>
                      {material.items.length === 0 ? <EmptyState title={t('review.material.empty.title')} body={t('review.material.empty.body')} /> : materialGroups.map(group => (
                        <div className={css.materialGroup} key={group.category}>
                          <h3>{t(`review.category.${group.category}`)}</h3>
                          {group.items.map(item => <p key={`${String(item.sourceId)}:${item.category}:${item.localDate}`}><time dateTime={item.localDate}>{item.localDate}</time><span><strong>{item.title}</strong>{item.text}</span></p>)}
                        </div>
                      ))}
                      <label htmlFor="mind-garden-review">{t('review.editor.label')}</label>
                      <textarea id="mind-garden-review" value={reviewContent} onChange={(event) => { setReviewContent(event.target.value) }} placeholder={t('review.editor.placeholder')} rows={6} disabled={pending || material.sources.length === 0} />
                      <div className={css.formFooter}>
                        <span>{t('review.editor.hint')}</span>
                        <button type="submit" className={css.primary} disabled={pending || material.sources.length === 0 || reviewContent.trim() === ''}>{t('review.create')}</button>
                      </div>
                    </form>
                  )}

                  <div className={css.cardList}>
                    {reviews.length === 0 && material === null && <EmptyState title={t('review.empty.title')} body={t('review.empty.body')} />}
                    {reviews.map(item => (
                      <article className={css.reviewCard} key={String(item.id)}>
                        <div className={css.cardMeta}>
                          <span className={css.status}>{t(reviewStatusKey(item.status))}</span>
                          <time dateTime={item.startStamp.localDate}>{item.startStamp.localDate} — {item.endStamp.localDate}</time>
                        </div>
                        <p className={css.reviewText}>{item.content}</p>
                        <p className={css.sourceCount}>{t('review.sources').replace('{count}', String(item.sources.length))}</p>
                        {item.stale && <p className={css.stale}>{t('review.stale')}</p>}
                        <div className={css.cardActions}>
                          <button type="button" onClick={() => {
                            onDraftConversation(t('life.draft.template')
                              .replace('{start}', item.startStamp.localDate)
                              .replace('{end}', item.endStamp.localDate)
                              .replace('{content}', item.content))
                            setNotice('life.notice.drafted')
                          }}><IconSendOutline14 />{t('life.continue')}</button>
                          {item.status === 'proposed' && <button type="button" disabled={pending} onClick={() => { void transitionReview(item, 'saved') }}>{t('review.save')}</button>}
                          {item.status === 'saved' && <button type="button" disabled={pending} onClick={() => { void transitionReview(item, 'archived') }}>{t('review.archive')}</button>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>}
              </div>
            )}
          </main>
        )}
      </section>
      {settingsOpen && (
        <div className={css.settingsScrim} role="dialog" aria-modal="true" aria-label={t('garden.settings')} onMouseDown={closeSettings}>
          <div ref={settingsSheetRef} className={css.settingsSheet} onMouseDown={(event) => { event.stopPropagation() }}>
            <header className={css.settingsHeading}>
              <span className={css.settingsInstrument} aria-hidden="true">
                <i /><i /><i />
                <GardenMarkIcon size={25} />
              </span>
              <div className={css.settingsHeadingCopy}>
                <span>{t('garden.settings.kicker')}</span>
                <h2>{t('garden.settings')}</h2>
                <p>{t('garden.settings.body')}</p>
                <div className={css.settingsAssurances} aria-label={t('garden.settings.assurances')}>
                  <span><GardenMarkIcon size={14} />{t('garden.settings.session')}</span>
                  <span><PrivateIcon size={14} />{t('garden.settings.profile')}</span>
                  <span><IconSettingsOutline16 size={14} />{t('garden.settings.host')}</span>
                </div>
              </div>
              <button type="button" autoFocus onClick={closeSettings}>
                <IconCloseOutline16 size={14} />
                {t('garden.settings.close')}
              </button>
            </header>
            <div className={css.settingsContent}>
              <section className={css.settingsDialogue}>
                <span className={css.settingsIndex}>01</span>
                <MindGardenPanel projection={projection} defaultOpen {...dockActions} t={t} />
              </section>
              <section className={css.settingsPortability}>
                <span className={css.settingsIndex}><IconDataOutline16 size={14} />02</span>
                <GardenPortabilityPanel
                  onExportBackup={onExportBackup}
                  onInspectBackup={onInspectBackup}
                  onRestoreBackup={onRestoreBackup}
                  onRotateVaultKey={onRotateVaultKey}
                  t={t}
                />
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className={css.empty}><strong>{title}</strong><span>{body}</span></div>
}

/** Full slot props: standard session kit, store, injected actions, and locale seat. */
export type MindGardenViewProps =
  & ConvViewProps
  & MindGardenViewActions
  & PropsLocale<'mindGarden'>
  & PropsStore<ReturnType<typeof createMindGardenViewStore>>

/** Read the typed session projection and adapt it to the review center. */
export function MindGardenView({ useProjection, useStore, actions, inputActions, ...props }: MindGardenViewProps) {
  const projection = useProjection('mind-garden')
  const view = useStore(state => state)
  return (
    <MindGardenReviewCenter
      projection={projection}
      activeSpace={view.activeSpace}
      sidebarCollapsed={view.sidebarCollapsed}
      onSelectSpace={(space) => { actions.selectSpace(space) }}
      onToggleSidebar={() => { actions.toggleSidebar() }}
      onDraftConversation={(draft) => { inputActions.setDraft(draft) }}
      {...props}
    />
  )
}
