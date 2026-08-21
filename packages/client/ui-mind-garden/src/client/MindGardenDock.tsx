/** Mind Garden entry, disclosure, and live preference controls. */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  IconCheckOutline16,
  IconChevronDownOutline14,
  IconChevronRightOutline14,
  IconCloseOutline16,
  IconDataOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  MindGardenMode,
  MindGardenSessionProjection,
  MindGardenSupportIntent,
} from '@deepseek-ai/dsh-mind-garden/core/client'
import type { MindGardenActionResult, MindGardenDockActions } from './slots.ts'
import type { MindGardenKey } from './locales.ts'
import { ConcernsIcon, GardenMarkIcon, PhilosophyIcon, PrivateIcon } from './GardenIcons.tsx'
import css from './MindGardenDock.module.css'

const MODES = ['serenity', 'clarity'] as const satisfies readonly MindGardenMode[]
const INTENTS = ['auto', 'listen', 'settle', 'clarify', 'next-step'] as const satisfies readonly MindGardenSupportIntent[]

/** Props for the stateful visual surface. */
export interface MindGardenPanelProps extends MindGardenDockActions {
  /** Undefined means projection capability absent/loading; null means inactive. */
  projection: MindGardenSessionProjection | null | undefined
  /** Expand controls immediately when mounted in a dedicated settings surface. */
  defaultOpen?: boolean
}

/** Render a stable localized failure without exposing transport internals by default. */
function errorText(result: MindGardenActionResult, t: (key: MindGardenKey) => string): string | null {
  if (result.ok) return null
  return result.error.code === 'MIND_GARDEN_SESSION_NOT_BLANK'
    ? t('error.notBlank')
    : result.error.message || t('error.generic')
}

/** The visual Mind Garden dock surface. */
export function MindGardenPanel({
  projection,
  onActivate,
  onSelectMode,
  onSelectSupportIntent,
  defaultOpen = false,
  t,
}: MindGardenPanelProps & PropsLocale<'mindGarden'>) {
  const [open, setOpen] = useState(defaultOpen)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRef = useRef(false)
  const revision = projection?.state.revision

  useEffect(() => {
    setError(null)
  }, [revision])

  const run = useCallback(async (action: () => Promise<MindGardenActionResult>) => {
    /* v8 ignore next -- React synchronously disables every action after the first click; the ref closes the smaller pre-render window. */
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    setError(null)
    try {
      const result = await action()
      setError(errorText(result, t))
      if (result.ok && !defaultOpen) setOpen(false)
    } catch {
      setError(t('error.generic'))
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }, [defaultOpen, t])

  if (projection === undefined) return null

  if (projection === null) {
    return (
      <div className={css.dock} data-mind-garden-state="inactive" data-surface="dock">
        {!open && (
          <button type="button" className={css.entry} onClick={() => { setOpen(true) }} aria-label={t('entry.open')}>
            <span className={css.mark}><GardenMarkIcon size={18} /></span>
            <span className={css.entryCopy}>
              <span className={css.entryTitle}>{t('entry.open')}</span>
              <span className={css.entryHint}>{t('entry.hint')}</span>
            </span>
            <IconChevronRightOutline14 className={css.chevron} />
          </button>
        )}
        {open && (
          <section className={css.panel} aria-labelledby="mind-garden-disclosure-title">
            <div className={css.panelHeader}>
              <div>
                <h3 id="mind-garden-disclosure-title" className={css.title}>{t('disclosure.title')}</h3>
                <p className={css.disclosure}>{t('disclosure.body')}</p>
              </div>
              <button type="button" className={css.close} onClick={() => { setOpen(false) }} disabled={pending} aria-label={t('entry.close')}>
                <IconCloseOutline16 size={15} />
              </button>
            </div>
            <p className={css.acceptance}>{t('disclosure.accept')}</p>
            <ul className={css.contract} aria-label={t('disclosure.contract')}>
              <li>
                <PrivateIcon size={16} />
                <span><strong>{t('disclosure.profile.title')}</strong><small>{t('disclosure.profile.body')}</small></span>
              </li>
              <li>
                <IconDataOutline16 size={16} />
                <span><strong>{t('disclosure.model.title')}</strong><small>{t('disclosure.model.body')}</small></span>
              </li>
              <li>
                <IconCheckOutline16 size={16} />
                <span><strong>{t('disclosure.authority.title')}</strong><small>{t('disclosure.authority.body')}</small></span>
              </li>
            </ul>
            <div className={css.modeGrid}>
              {MODES.map(mode => (
                <button
                  key={mode}
                  type="button"
                  className={css.modeCard}
                  disabled={pending}
                  onClick={() => { void run(() => onActivate(mode)) }}
                >
                  <span className={css.modeIcon}>{mode === 'serenity' ? <ConcernsIcon size={18} /> : <PhilosophyIcon size={18} />}</span>
                  <span>
                    <span className={css.modeTitle}>{t(`mode.${mode}`)}</span>
                    <span className={css.modeDescription}>{t(`mode.${mode}.desc`)}</span>
                  </span>
                </button>
              ))}
            </div>
            {error !== null && <p className={css.error} role="alert">{error}</p>}
          </section>
        )}
      </div>
    )
  }

  const state = projection.state
  return (
    <div className={css.dock} data-mind-garden-state="active" data-surface={defaultOpen ? 'settings' : 'dock'}>
      <section className={css.activePanel}>
        {defaultOpen ? (
          <div className={css.settingsIdentity}>
            <span className={css.markActive}><GardenMarkIcon size={18} /></span>
            <span><strong>{t('garden.dialogue.title')}</strong><small>{t('garden.dialogue.body')}</small></span>
          </div>
        ) : (
          <button
            type="button"
            className={css.activeHeader}
            onClick={() => { setOpen(value => !value) }}
            aria-expanded={open}
            aria-label={open ? t('garden.collapse') : t('garden.expand')}
          >
            <span className={css.activeIdentity}>
              <span className={css.markActive}><GardenMarkIcon size={18} /></span>
              <span>
                <span className={css.activeTitle}>{t('garden.title')}</span>
                <span className={css.activeSummary}>{t(`mode.${state.mode}`)} · {t(`intent.${state.supportIntent}`)}</span>
              </span>
            </span>
            <IconChevronDownOutline14 className={open ? css.chevronOpen : css.chevron} />
          </button>
        )}
        {open && (
          <div className={css.controls}>
            <ControlSection label={t('section.mode')}>
              <div className={css.segmented} role="group" aria-label={t('section.mode')}>
                {MODES.map(mode => (
                  <button
                    key={mode}
                    type="button"
                    className={state.mode === mode ? css.segmentActive : css.segment}
                    aria-pressed={state.mode === mode}
                    disabled={pending}
                    onClick={() => { void run(() => onSelectMode(state.revision, mode)) }}
                  >
                    <span className={css.optionIcon}>{mode === 'serenity' ? <ConcernsIcon size={17} /> : <PhilosophyIcon size={17} />}</span>
                    <span className={css.optionCopy}>
                      <strong>{t(`mode.${mode}`)}</strong>
                      {defaultOpen && <small>{t(`mode.${mode}.desc`)}</small>}
                    </span>
                  </button>
                ))}
              </div>
            </ControlSection>
            <ControlSection label={t('section.intent')}>
              <div className={css.intentList} role="group" aria-label={t('section.intent')}>
                {INTENTS.map(intent => (
                  <button
                    key={intent}
                    type="button"
                    className={state.supportIntent === intent ? css.intentActive : css.intent}
                    aria-pressed={state.supportIntent === intent}
                    disabled={pending}
                    onClick={() => { void run(() => onSelectSupportIntent(state.revision, intent)) }}
                  >
                    {t(`intent.${intent}`)}
                  </button>
                ))}
              </div>
            </ControlSection>
            <div className={css.storage}><PrivateIcon size={14} />{t('garden.storage')}</div>
            {error !== null && <p className={css.error} role="alert">{error}</p>}
          </div>
        )}
      </section>
    </div>
  )
}

/** Small labeled control group. */
function ControlSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={css.controlSection}>
      <span className={css.controlLabel}>{label}</span>
      {children}
    </div>
  )
}

/** Full slot props: standard session kit, injected actions, and locale seat. */
export type MindGardenDockProps = import('@deepseek-ai/dsh-client-ui-slots').PropsRuntime<'conversation.input.dock'>
  & MindGardenDockActions
  & PropsLocale<'mindGarden'>

/** Read the typed projection and adapt it to the visual panel. */
export function MindGardenDock({ useProjection, ...props }: MindGardenDockProps) {
  const projection = useProjection('mind-garden')
  return <MindGardenPanel projection={projection} {...props} />
}
