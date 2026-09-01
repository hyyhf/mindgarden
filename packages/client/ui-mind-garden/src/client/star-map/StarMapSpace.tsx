/** Harness-native constellation space backed by an encrypted Star Map profile. */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { MindGardenMode } from '@deepseek-ai/dsh-mind-garden/core/client'
import type {
  MindGardenOpenQuestion,
  MindGardenPeriodReview,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import type {
  MindGardenCompleteStarRitualRequest,
  MindGardenSaveStarRitualRequest,
  MindGardenStarCard,
  MindGardenStarMapOverview,
  MindGardenStarProfile,
  MindGardenStarProfileInput,
  MindGardenStarTrait,
  MindGardenUpdateStarProfileRequest,
  MindGardenUpdateStarTraitRequest,
} from '@deepseek-ai/dsh-mind-garden/star-map/types'
import type { MindGardenDataResult } from '../slots.ts'
import type { MindGardenKey } from '../locales.ts'
import { STAR_MIST_COURTYARD_V5 } from '../generated-assets.ts'
import { settleMindGardenAction } from '../settle-action.ts'
import { createGardenStarMap } from './model.ts'
import { StarField } from './StarFieldView.tsx'
import { StarProfilePanel } from './StarProfilePanel.tsx'
import { StarRitual } from './StarRitual.tsx'
import { StarObserver } from './StarObserver.tsx'
import css from './StarMapSpace.module.css'

/** Plain data, Remote actions, and locale props for the constellation space. */
export interface StarMapSpaceProps {
  readonly questions: readonly MindGardenOpenQuestion[]
  readonly reviews: readonly MindGardenPeriodReview[]
  readonly mode: MindGardenMode
  readonly t: (key: MindGardenKey) => string
  readonly onBack: () => void
  readonly onOverview: () => Promise<MindGardenDataResult<MindGardenStarMapOverview>>
  readonly onSaveRitual: (
    request: MindGardenSaveStarRitualRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>
  readonly onCompleteRitual: (
    request: MindGardenCompleteStarRitualRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>
  readonly onUpdateProfile: (
    request: MindGardenUpdateStarProfileRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>
  readonly onUpdateTrait: (
    request: MindGardenUpdateStarTraitRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarTrait>>
  readonly onDrawCard: Parameters<typeof StarObserver>[0]['onDraw']
  readonly onCalibrateCard: Parameters<typeof StarObserver>[0]['onCalibrate']
  readonly onFinalizeCard: Parameters<typeof StarObserver>[0]['onFinalize']
  readonly onContinueCard: Parameters<typeof StarObserver>[0]['onContinue']
  readonly onApplyCardRevision: Parameters<typeof StarObserver>[0]['onApplyRevision']
}

function profileRequest(
  profile: MindGardenStarProfile,
  changes: Pick<MindGardenStarProfileInput, 'permissions' | 'observerTone' | 'observationIntent' | 'reducedMotion'>,
): MindGardenUpdateStarProfileRequest | null {
  if (profile.version === null) return null
  return {
    displayName: profile.displayName,
    birthMonth: profile.birthMonth,
    birthDay: profile.birthDay,
    birthYear: profile.birthYear,
    birthTime: profile.birthTime,
    birthTimeKnown: profile.birthTimeKnown,
    birthCity: profile.birthCity,
    birthCityKnown: profile.birthCityKnown,
    mbtiMode: profile.mbtiMode,
    mbtiType: profile.mbtiType,
    mbtiAnswers: profile.mbtiAnswers,
    selfWords: profile.selfWords,
    ...changes,
    ifVersion: profile.version,
  }
}

/** Render the resumable ritual or the durable interactive 3D constellation and codex. */
export function StarMapSpace({
  questions,
  reviews,
  mode,
  t,
  onBack,
  onOverview,
  onSaveRitual,
  onCompleteRitual,
  onUpdateProfile,
  onUpdateTrait,
  onDrawCard,
  onCalibrateCard,
  onFinalizeCard,
  onContinueCard,
  onApplyCardRevision,
}: StarMapSpaceProps) {
  const [overview, setOverview] = useState<MindGardenStarMapOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('center')
  const [traitPending, setTraitPending] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    const result = await settleMindGardenAction(onOverview)
    setLoading(false)
    if (!result.ok) {
      setLoadError(true)
      return
    }
    setOverview(result.value)
  }, [onOverview])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const runCardAction = useCallback(async (
    operation: () => Promise<MindGardenDataResult<MindGardenStarCard>>,
  ): Promise<MindGardenDataResult<MindGardenStarCard>> => {
    const result = await settleMindGardenAction(operation)
    if (!result.ok) return result
    const latest = await settleMindGardenAction(onOverview)
    if (latest.ok) setOverview(latest.value)
    return result
  }, [onOverview])

  if (loading && overview === null) {
    return <main className={css.state}><span className={css.pulse} aria-hidden="true" /><p>{t('star.loading')}</p><button type="button" onClick={onBack}>{t('star.back')}</button></main>
  }
  if (loadError || overview === null) {
    return <main className={css.state}><p>{t('star.error')}</p><div><button type="button" onClick={() => { void refresh() }}>{t('review.retry')}</button><button type="button" onClick={onBack}>{t('star.back')}</button></div></main>
  }
  if (!overview.profile.onboardingCompleted) {
    return <StarRitual
      profile={overview.profile}
      t={t}
      onSave={async (input, stage, version) => await settleMindGardenAction(
        () => onSaveRitual({ ...input, onboardingStage: stage, ifVersion: version }),
      )}
      onComplete={async (input, version) => await settleMindGardenAction(() => onCompleteRitual({ ...input, ifVersion: version }))}
      onCommit={setOverview}
      onExit={onBack}
    />
  }

  return <CompletedStarMap
    overview={overview}
    questions={questions}
    reviews={reviews}
    mode={mode}
    t={t}
    onBack={onBack}
    profileOpen={profileOpen}
    setProfileOpen={setProfileOpen}
    selectedId={selectedId}
    setSelectedId={setSelectedId}
    traitPending={traitPending}
    setTraitPending={setTraitPending}
    onCommit={setOverview}
    onUpdateProfile={async (profile, permissions, observerTone, observationIntent, reducedMotion) => {
      const request = profileRequest(profile, { permissions, observerTone, observationIntent, reducedMotion })
      return request === null
        ? { ok: false, code: 'star-ritual-required' }
        : await settleMindGardenAction(() => onUpdateProfile(request))
    }}
    onUpdateTrait={onUpdateTrait}
    onDrawCard={request => runCardAction(() => onDrawCard(request))}
    onCalibrateCard={request => runCardAction(() => onCalibrateCard(request))}
    onFinalizeCard={request => runCardAction(() => onFinalizeCard(request))}
    onContinueCard={request => runCardAction(() => onContinueCard(request))}
    onApplyCardRevision={request => runCardAction(() => onApplyCardRevision(request))}
  />
}

interface CompletedStarMapProps {
  readonly overview: MindGardenStarMapOverview
  readonly questions: readonly MindGardenOpenQuestion[]
  readonly reviews: readonly MindGardenPeriodReview[]
  readonly mode: MindGardenMode
  readonly t: (key: MindGardenKey) => string
  readonly onBack: () => void
  readonly profileOpen: boolean
  readonly setProfileOpen: (open: boolean) => void
  readonly selectedId: string
  readonly setSelectedId: (id: string) => void
  readonly traitPending: boolean
  readonly setTraitPending: (pending: boolean) => void
  readonly onCommit: (overview: MindGardenStarMapOverview) => void
  readonly onUpdateProfile: Parameters<typeof StarProfilePanel>[0]['onSave']
  readonly onUpdateTrait: StarMapSpaceProps['onUpdateTrait']
  readonly onDrawCard: StarMapSpaceProps['onDrawCard']
  readonly onCalibrateCard: StarMapSpaceProps['onCalibrateCard']
  readonly onFinalizeCard: StarMapSpaceProps['onFinalizeCard']
  readonly onContinueCard: StarMapSpaceProps['onContinueCard']
  readonly onApplyCardRevision: StarMapSpaceProps['onApplyCardRevision']
}

function CompletedStarMap({
  overview,
  questions,
  reviews,
  mode,
  t,
  onBack,
  profileOpen,
  setProfileOpen,
  selectedId,
  setSelectedId,
  traitPending,
  setTraitPending,
  onCommit,
  onUpdateProfile,
  onUpdateTrait,
  onDrawCard,
  onCalibrateCard,
  onFinalizeCard,
  onContinueCard,
  onApplyCardRevision,
}: CompletedStarMapProps) {
  const visibleQuestions = overview.profile.permissions.openQuestions ? questions : []
  const visibleReviews = overview.profile.permissions.periodReviews ? reviews : []
  const model = useMemo(() => createGardenStarMap(visibleQuestions, visibleReviews, mode, {
    center: t('star.center'),
    serenity: t('star.center.serenity'),
    clarity: t('star.center.clarity'),
    since: t('star.question.since'),
    unnamedReview: t('star.review.unnamed'),
    reviewDetail: t('star.review.detail'),
    traitDetail: t('star.trait.detail'),
  }, overview.profile, overview.traits), [mode, overview, t, visibleQuestions, visibleReviews])
  const selected = model.nodes.find(node => node.id === selectedId) ?? model.nodes[0]
  const selectedTrait = selected.kind === 'trait'
    ? overview.traits.find(trait => `trait:${String(trait.id)}` === selected.id)
    : undefined
  const questionsInSky = model.nodes.filter(node => node.kind === 'question').length
  const reviewsInSky = model.nodes.filter(node => node.kind === 'review').length
  const traitsInSky = model.nodes.filter(node => node.kind === 'trait').length

  const retireTrait = async () => {
    if (selectedTrait === undefined || traitPending) return
    setTraitPending(true)
    const result = await settleMindGardenAction(() => onUpdateTrait({
      id: selectedTrait.id,
      ifVersion: selectedTrait.version,
      status: 'retired',
    }))
    setTraitPending(false)
    if (!result.ok) return
    onCommit({ ...overview, traits: overview.traits.filter(trait => trait.id !== result.value.id) })
    setSelectedId('center')
  }

  return (
    <main
      className={css.space}
      data-mind-garden-star-map="active"
      data-profile-open={profileOpen}
      style={{ '--mg-star-courtyard': `url("${STAR_MIST_COURTYARD_V5}")` } as CSSProperties}
    >
      <StarField
        model={model}
        fallback={t('star.fallback')}
        onSelect={setSelectedId}
        reducedMotion={overview.profile.reducedMotion}
        selectedId={selected.id}
      />
      <header className={css.header}>
        <div>
          <h1>{t('space.starMap')}</h1>
          <p>{t('star.subtitle')}</p>
        </div>
        <div className={css.headerActions}>
          <button type="button" className={css.back} onClick={() => { setProfileOpen(!profileOpen) }}>{t('star.profile.open')}</button>
          <button type="button" className={css.back} onClick={onBack}>{t('star.back')}</button>
        </div>
      </header>

      <div className={css.metrics} aria-label={t('star.metrics')}>
        <span><strong>{traitsInSky}</strong>{t('star.metric.traits')}</span>
        <span><strong>{questionsInSky}</strong>{t('star.metric.questions')}</span>
        <span><strong>{reviewsInSky}</strong>{t('star.metric.reviews')}</span>
        <span><strong>{model.links.length}</strong>{t('star.metric.links')}</span>
      </div>

      <StarObserver
        profile={overview.profile}
        cards={overview.cards}
        activeCard={overview.activeCard}
        t={t}
        onDraw={onDrawCard}
        onCalibrate={onCalibrateCard}
        onFinalize={onFinalizeCard}
        onContinue={onContinueCard}
        onApplyRevision={onApplyCardRevision}
      />

      {profileOpen && (
        <StarProfilePanel
          profile={overview.profile}
          t={t}
          onSave={onUpdateProfile}
          onCommit={onCommit}
          onClose={() => { setProfileOpen(false) }}
        />
      )}

      <section className={css.codex} aria-label={t('star.codex')}>
        <div className={css.selected} data-kind={selected.kind}>
          <span>{t(`star.kind.${selected.kind}`)}</span>
          <h2>{selected.title}</h2>
          <p>{selected.detail}</p>
          {selectedTrait !== undefined && <button type="button" className={css.retire} disabled={traitPending} onClick={() => { void retireTrait() }}>{t('star.trait.retire')}</button>}
          <small>{t('star.selected.hint')}</small>
        </div>
        <div className={css.nodeList}>
          {model.nodes.map(node => (
            <button
              type="button"
              key={node.id}
              data-kind={node.kind}
              data-selected={node.id === selected.id}
              aria-pressed={node.id === selected.id}
              onClick={() => { setSelectedId(node.id) }}
            >
              <i aria-hidden="true" />
              <span>{node.title}</span>
            </button>
          ))}
        </div>
      </section>

      <p className={css.controls}>{t('star.controls')}</p>
    </main>
  )
}
