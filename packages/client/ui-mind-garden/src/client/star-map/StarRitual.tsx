/** Resumable, encrypted first-observation ritual for the Star Map. */

import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type {
  MindGardenStarMapOverview,
  MindGardenStarProfile,
  MindGardenStarProfileInput,
  MindGardenStarSceneAnswer,
} from '@deepseek-ai/dsh-mind-garden/star-map/types'
import type { MindGardenDataResult } from '../slots.ts'
import type { MindGardenKey } from '../locales.ts'
import { settleMindGardenAction } from '../settle-action.ts'
import { STAR_MIST_COURTYARD_V5 } from '../generated-assets.ts'
import css from './StarRitual.module.css'

const SCENES = [1, 2, 3, 4, 5, 6] as const
const DEFAULT_SCENE_ANSWERS: readonly MindGardenStarSceneAnswer[] = [
  '1a', '2a', '3a', '4a', '5a', '6a',
]

function inputFromProfile(profile: MindGardenStarProfile): MindGardenStarProfileInput {
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
    mbtiAnswers: profile.mbtiAnswers.length === 6 ? profile.mbtiAnswers : DEFAULT_SCENE_ANSWERS,
    selfWords: profile.selfWords,
    observationIntent: profile.observationIntent,
    observerTone: profile.observerTone,
    permissions: profile.permissions,
    reducedMotion: profile.reducedMotion,
  }
}

function optionalNumber(value: string): number | null {
  return value === '' ? null : Number(value)
}

/** Plain props supplied by the Harness slot action adapter. */
export interface StarRitualProps {
  readonly profile: MindGardenStarProfile
  readonly t: (key: MindGardenKey) => string
  readonly onSave: (
    input: MindGardenStarProfileInput,
    stage: 1 | 2,
    version: MindGardenStarProfile['version'],
  ) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>
  readonly onComplete: (
    input: MindGardenStarProfileInput,
    version: MindGardenStarProfile['version'],
  ) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>
  readonly onCommit: (overview: MindGardenStarMapOverview) => void
  readonly onExit: () => void
}

/** Render the three-stage ritual and persist each forward checkpoint. */
export function StarRitual({ profile, t, onSave, onComplete, onCommit, onExit }: StarRitualProps) {
  const [step, setStep] = useState<0 | 1 | 2>(Math.min(profile.onboardingStage, 2) as 0 | 1 | 2)
  const [draft, setDraft] = useState<MindGardenStarProfileInput>(() => inputFromProfile(profile))
  const [words, setWords] = useState(profile.selfWords.join('，'))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setDraft(inputFromProfile(profile))
    setWords(profile.selfWords.join('，'))
    setStep(Math.min(profile.onboardingStage, 2) as 0 | 1 | 2)
  }, [profile])

  const updatePermission = (key: keyof MindGardenStarProfileInput['permissions'], checked: boolean) => {
    setDraft(current => ({ ...current, permissions: { ...current.permissions, [key]: checked } }))
  }

  const updateScene = (index: number, value: MindGardenStarSceneAnswer) => {
    setDraft((current) => {
      const answers = [...current.mbtiAnswers]
      answers[index] = value
      return { ...current, mbtiAnswers: answers }
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(false)
    const normalized = {
      ...draft,
      selfWords: words.split(/[，,]/u).map(word => word.trim()).filter(Boolean),
    }
    const result = step < 2
      ? await settleMindGardenAction(() => onSave(normalized, step === 0 ? 1 : 2, profile.version))
      : await settleMindGardenAction(() => onComplete(normalized, profile.version))
    setPending(false)
    if (!result.ok) {
      setError(true)
      return
    }
    onCommit(result.value)
  }

  return (
    <main
      className={css.ritual}
      data-mind-garden-star-ritual={`stage-${step}`}
      style={{ '--mg-star-courtyard': `url("${STAR_MIST_COURTYARD_V5}")` } as CSSProperties}
    >
      <div className={css.sky} aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <header className={css.header}>
        <div>
          <h1>{t('star.ritual.title')}</h1>
          <p>{t('star.ritual.subtitle')}</p>
        </div>
        <button type="button" onClick={onExit}>{t('star.ritual.exit')}</button>
      </header>

      <form className={css.card} onSubmit={(event) => { void submit(event) }}>
        <ol className={css.progress} aria-label={t('star.ritual.progress')}>
          {(['identity', 'self', 'consent'] as const).map((name, index) => (
            <li key={name} data-active={index === step} data-complete={index < step}>
              <i>{index + 1}</i><span>{t(`star.ritual.step.${name}`)}</span>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className={css.stage}>
            <div className={css.intro}>
              <h2>{t('star.ritual.identity.title')}</h2>
              <p>{t('star.ritual.identity.body')}</p>
            </div>
            <label className={css.wide}>
              <span>{t('star.ritual.displayName')}</span>
              <input
                value={draft.displayName}
                maxLength={80}
                placeholder={t('star.ritual.displayName.placeholder')}
                onChange={(event) => { setDraft(current => ({ ...current, displayName: event.target.value })) }}
              />
            </label>
            <div className={css.row3}>
              <label><span>{t('star.ritual.birthYear')}</span><input type="number" min="1900" max="2200" value={draft.birthYear ?? ''} onChange={(event) => { setDraft(current => ({ ...current, birthYear: optionalNumber(event.target.value) })) }} /></label>
              <label><span>{t('star.ritual.birthMonth')}</span><input type="number" min="1" max="12" value={draft.birthMonth ?? ''} onChange={(event) => { setDraft(current => ({ ...current, birthMonth: optionalNumber(event.target.value) })) }} /></label>
              <label><span>{t('star.ritual.birthDay')}</span><input type="number" min="1" max="31" value={draft.birthDay ?? ''} onChange={(event) => { setDraft(current => ({ ...current, birthDay: optionalNumber(event.target.value) })) }} /></label>
            </div>
            <div className={css.split}>
              <label className={css.optional}>
                <span><input type="checkbox" checked={draft.birthTimeKnown} onChange={(event) => { setDraft(current => ({ ...current, birthTimeKnown: event.target.checked, birthTime: event.target.checked ? current.birthTime : '' })) }} />{t('star.ritual.timeKnown')}</span>
                {draft.birthTimeKnown && <input aria-label={t('star.ritual.birthTime')} type="time" value={draft.birthTime} onChange={(event) => { setDraft(current => ({ ...current, birthTime: event.target.value })) }} />}
              </label>
              <label className={css.optional}>
                <span><input type="checkbox" checked={draft.birthCityKnown} onChange={(event) => { setDraft(current => ({ ...current, birthCityKnown: event.target.checked, birthCity: event.target.checked ? current.birthCity : '' })) }} />{t('star.ritual.cityKnown')}</span>
                {draft.birthCityKnown && <input aria-label={t('star.ritual.birthCity')} value={draft.birthCity} onChange={(event) => { setDraft(current => ({ ...current, birthCity: event.target.value })) }} />}
              </label>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className={css.stage}>
            <div className={css.intro}>
              <h2>{t('star.ritual.self.title')}</h2>
              <p>{t('star.ritual.self.body')}</p>
            </div>
            <div className={css.choiceGrid}>
              {(['known', 'scenes', 'observe'] as const).map(mode => (
                <label key={mode} data-selected={draft.mbtiMode === mode}>
                  <input type="radio" name="mbti-mode" checked={draft.mbtiMode === mode} onChange={() => { setDraft(current => ({ ...current, mbtiMode: mode })) }} />
                  <span>{t(`star.ritual.mbti.${mode}`)}</span>
                </label>
              ))}
            </div>
            {draft.mbtiMode === 'known' && (
              <label className={css.wide}>
                <span>{t('star.ritual.mbti.type')}</span>
                <input value={draft.mbtiType} maxLength={4} placeholder="INFP" onChange={(event) => { setDraft(current => ({ ...current, mbtiType: event.target.value.toUpperCase() })) }} />
              </label>
            )}
            {draft.mbtiMode === 'scenes' && (
              <div className={css.scenes}>
                {SCENES.map((number, index) => (
                  <fieldset key={number}>
                    <legend>{t(`star.ritual.scene.${number}`)}</legend>
                    {(['a', 'b'] as const).map((side) => {
                      const value = `${number}${side}` as MindGardenStarSceneAnswer
                      return <label key={side} data-selected={draft.mbtiAnswers[index] === value}><input type="radio" name={`scene-${number}`} checked={draft.mbtiAnswers[index] === value} onChange={() => { updateScene(index, value) }} /><span>{t(`star.ritual.scene.${number}${side}`)}</span></label>
                    })}
                  </fieldset>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section className={css.stage}>
            <div className={css.intro}>
              <h2>{t('star.ritual.consent.title')}</h2>
              <p>{t('star.ritual.consent.body')}</p>
            </div>
            <label className={css.wide}><span>{t('star.ritual.words')}</span><input value={words} placeholder={t('star.ritual.words.placeholder')} onChange={(event) => { setWords(event.target.value) }} /></label>
            <label className={css.wide}><span>{t('star.ritual.intent')}</span><textarea rows={3} value={draft.observationIntent} placeholder={t('star.ritual.intent.placeholder')} onChange={(event) => { setDraft(current => ({ ...current, observationIntent: event.target.value })) }} /></label>
            <fieldset className={css.permissionBox}>
              <legend>{t('star.ritual.permissions')}</legend>
              <div>
                {([
                  ['dailyReflections', 'reflections'],
                  ['confirmedMemories', 'memories'],
                  ['openQuestions', 'questions'],
                  ['periodReviews', 'reviews'],
                ] as const).map(([key, label]) => (
                  <label key={key}><input type="checkbox" checked={draft.permissions[key]} onChange={(event) => { updatePermission(key, event.target.checked) }} /><span>{t(`star.profile.permission.${label}`)}</span></label>
                ))}
              </div>
              <small>{t('star.ritual.private')}</small>
            </fieldset>
            <div className={css.choiceGrid}>
              {(['gentle', 'direct', 'mystic'] as const).map(tone => (
                <label key={tone} data-selected={draft.observerTone === tone}><input type="radio" name="observer-tone" checked={draft.observerTone === tone} onChange={() => { setDraft(current => ({ ...current, observerTone: tone })) }} /><span>{t(`star.profile.tone.${tone}`)}</span></label>
              ))}
            </div>
            <label className={css.motion}><input type="checkbox" checked={draft.reducedMotion} onChange={(event) => { setDraft(current => ({ ...current, reducedMotion: event.target.checked })) }} /><span>{t('star.profile.motion')}</span></label>
          </section>
        )}

        {error && <p className={css.error} role="alert">{t('star.ritual.error')}</p>}
        <footer className={css.actions}>
          <button type="button" disabled={pending || step === 0} onClick={() => { setStep(current => Math.max(0, current - 1) as 0 | 1 | 2) }}>{t('star.ritual.back')}</button>
          <button type="submit" className={css.primary} disabled={pending}>{pending ? t('star.ritual.saving') : t(step === 2 ? 'star.ritual.complete' : 'star.ritual.next')}</button>
        </footer>
      </form>
    </main>
  )
}
