/** User-controlled Star Map authorizations and observation preferences. */

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  MindGardenStarDataPermissions,
  MindGardenStarMapOverview,
  MindGardenStarObserverTone,
  MindGardenStarProfile,
} from '@deepseek-ai/dsh-mind-garden/star-map/types'
import type { MindGardenDataResult } from '../slots.ts'
import type { MindGardenKey } from '../locales.ts'
import { settleMindGardenAction } from '../settle-action.ts'
import css from './StarProfilePanel.module.css'

interface StarProfilePanelProps {
  readonly profile: MindGardenStarProfile
  readonly t: (key: MindGardenKey) => string
  readonly onSave: (
    profile: MindGardenStarProfile,
    permissions: MindGardenStarDataPermissions,
    observerTone: MindGardenStarObserverTone,
    observationIntent: string,
    reducedMotion: boolean,
  ) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>
  readonly onCommit: (overview: MindGardenStarMapOverview) => void
  readonly onClose: () => void
}

/** Edit the privacy-sensitive subset that governs future Star Observer work. */
export function StarProfilePanel({ profile, t, onSave, onCommit, onClose }: StarProfilePanelProps) {
  const [permissions, setPermissions] = useState(profile.permissions)
  const [tone, setTone] = useState(profile.observerTone)
  const [intent, setIntent] = useState(profile.observationIntent)
  const [reducedMotion, setReducedMotion] = useState(profile.reducedMotion)
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState<'saved' | 'error' | null>(null)

  useEffect(() => {
    setPermissions(profile.permissions)
    setTone(profile.observerTone)
    setIntent(profile.observationIntent)
    setReducedMotion(profile.reducedMotion)
  }, [profile])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setNotice(null)
    const result = await settleMindGardenAction(() => onSave(profile, permissions, tone, intent, reducedMotion))
    setPending(false)
    if (!result.ok) {
      setNotice('error')
      return
    }
    onCommit(result.value)
    setNotice('saved')
  }

  return (
    <aside className={css.panel} aria-label={t('star.profile.title')}>
      <header>
        <div><h2>{t('star.profile.title')}</h2><p>{t('star.profile.subtitle')}</p></div>
        <button type="button" onClick={onClose}>{t('star.profile.close')}</button>
      </header>
      <form onSubmit={(event) => { void submit(event) }}>
        <label className={css.intent}><span>{t('star.profile.intent')}</span><textarea rows={3} value={intent} onChange={(event) => { setIntent(event.target.value) }} /></label>
        <fieldset>
          <legend>{t('star.profile.tone')}</legend>
          <div className={css.tones}>
            {(['gentle', 'direct', 'mystic'] as const).map(value => <label key={value} data-selected={tone === value}><input type="radio" name="profile-tone" checked={tone === value} onChange={() => { setTone(value) }} /><span>{t(`star.profile.tone.${value}`)}</span></label>)}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t('star.profile.permissions')}</legend>
          <div className={css.permissions}>
            {([
              ['dailyReflections', 'reflections'],
              ['confirmedMemories', 'memories'],
              ['openQuestions', 'questions'],
              ['periodReviews', 'reviews'],
            ] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={permissions[key]} onChange={(event) => { setPermissions(current => ({ ...current, [key]: event.target.checked })) }} /><span>{t(`star.profile.permission.${label}`)}</span></label>)}
          </div>
        </fieldset>
        <label className={css.motion}><input type="checkbox" checked={reducedMotion} onChange={(event) => { setReducedMotion(event.target.checked) }} /><span>{t('star.profile.motion')}</span></label>
        {notice !== null && <p className={css[notice]} role="status">{t(`star.profile.${notice}`)}</p>}
        <button className={css.save} type="submit" disabled={pending}>{pending ? t('star.ritual.saving') : t('star.profile.save')}</button>
      </form>
    </aside>
  )
}
