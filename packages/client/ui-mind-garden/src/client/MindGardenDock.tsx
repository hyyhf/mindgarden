/** Mind Garden entry, disclosure, and live preference controls. */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  IconCheckOutline16,
  IconChevronDownOutline14,
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
  const surfaceRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const disclosureId = useId()
  const controlsId = useId()
  const [popoverPosition, setPopoverPosition] = useState<CSSProperties>()
  const revision = projection?.state.revision

  useEffect(() => {
    setError(null)
  }, [revision])

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false)
    queueMicrotask(() => { triggerRef.current?.focus() })
  }, [])

  useEffect(() => {
    if (!open || defaultOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeAndRestoreFocus()
    }
    const closeOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || surfaceRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside, true)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside, true)
    }
  }, [closeAndRestoreFocus, defaultOpen, open])

  const positionPopover = useCallback(() => {
    if (!open || defaultOpen || triggerRef.current === null) return
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const edge = 16
    const gap = 9
    const idealWidth = projection === null ? 520 : 340
    const idealHeight = projection === null ? 430 : 330
    const availableWidth = viewportWidth - edge * 2
    const width = viewportWidth < 480
      ? availableWidth
      : Math.max(280, Math.min(idealWidth, availableWidth))
    const left = Math.min(Math.max(rect.left, edge), viewportWidth - width - edge)
    const above = rect.top - edge - gap
    const below = viewportHeight - rect.bottom - edge - gap
    const placeAbove = above >= Math.min(idealHeight, viewportHeight * 0.56) || above >= below
    const maxHeight = Math.max(180, Math.min(idealHeight, placeAbove ? above : below))
    setPopoverPosition(placeAbove
      ? { left, width, maxHeight, bottom: viewportHeight - rect.top + gap, top: 'auto' }
      : { left, width, maxHeight, top: rect.bottom + gap, bottom: 'auto' })
  }, [defaultOpen, open, projection])

  useLayoutEffect(() => {
    if (!open || defaultOpen) return
    positionPopover()
    const visualViewport = window.visualViewport
    window.addEventListener('resize', positionPopover)
    window.addEventListener('scroll', positionPopover, true)
    visualViewport?.addEventListener('resize', positionPopover)
    visualViewport?.addEventListener('scroll', positionPopover)
    return () => {
      window.removeEventListener('resize', positionPopover)
      window.removeEventListener('scroll', positionPopover, true)
      visualViewport?.removeEventListener('resize', positionPopover)
      visualViewport?.removeEventListener('scroll', positionPopover)
    }
  }, [defaultOpen, open, positionPopover])

  const run = useCallback(async (action: () => Promise<MindGardenActionResult>) => {
    /* v8 ignore next -- React synchronously disables every action after the first click; the ref closes the smaller pre-render window. */
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    setError(null)
    try {
      const result = await action()
      setError(errorText(result, t))
      if (result.ok && !defaultOpen) closeAndRestoreFocus()
    } catch {
      setError(t('error.generic'))
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }, [closeAndRestoreFocus, defaultOpen, t])

  if (projection === undefined) return null

  if (projection === null) {
    return (
      <div ref={surfaceRef} className={css.dock} data-mind-garden-state="inactive" data-surface="composer">
        <button
          ref={triggerRef}
          type="button"
          className={css.entry}
          onClick={() => { setOpen(value => !value) }}
          aria-label={t('entry.open')}
          aria-expanded={open}
          aria-controls={disclosureId}
        >
          <span className={css.mark}><GardenMarkIcon size={16} /></span>
          <span className={css.entryTitle}>{t('entry.open')}</span>
          <span className={css.visuallyHidden}>{t('entry.hint')}</span>
          <IconChevronDownOutline14 className={open ? css.chevronOpen : css.chevron} />
        </button>
        {open && (
          <section
            id={disclosureId}
            className={css.panel}
            style={popoverPosition}
            data-positioned={popoverPosition === undefined ? 'false' : 'true'}
            aria-labelledby={`${disclosureId}-title`}
          >
            <div className={css.panelHeader}>
              <div>
                <h3 id={`${disclosureId}-title`} className={css.title}>{t('disclosure.title')}</h3>
                <p className={css.disclosure}>{t('disclosure.body')}</p>
              </div>
              <button type="button" className={css.close} onClick={closeAndRestoreFocus} disabled={pending} aria-label={t('entry.close')}>
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
    <div ref={surfaceRef} className={css.dock} data-mind-garden-state="active" data-surface={defaultOpen ? 'settings' : 'composer'}>
      <section className={css.activePanel}>
        {defaultOpen ? (
          <div className={css.settingsIdentity}>
            <span className={css.markActive}><GardenMarkIcon size={18} /></span>
            <span><strong>{t('garden.dialogue.title')}</strong><small>{t('garden.dialogue.body')}</small></span>
          </div>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className={css.activeHeader}
            onClick={() => { setOpen(value => !value) }}
            aria-expanded={open}
            aria-controls={controlsId}
            aria-label={open ? t('garden.collapse') : t('garden.expand')}
            title={`${t(`mode.${state.mode}`)} · ${t(`intent.${state.supportIntent}`)}`}
          >
            <span className={css.markActive}><GardenMarkIcon size={15} /></span>
            <span className={css.activeTitle}>{t(`mode.${state.mode}`)}</span>
            <span className={css.postureSignal} aria-hidden="true" />
            <span className={css.visuallyHidden}>{t('garden.title')} · {t(`intent.${state.supportIntent}`)}</span>
            <IconChevronDownOutline14 className={open ? css.chevronOpen : css.chevron} />
          </button>
        )}
        {open && (
          <div
            id={controlsId}
            className={css.controls}
            style={defaultOpen ? undefined : popoverPosition}
            data-positioned={defaultOpen || popoverPosition !== undefined ? 'true' : 'false'}
          >
            {!defaultOpen && (
              <div className={css.popoverHeader}>
                <span>
                  <strong>{t('garden.dialogue.title')}</strong>
                  <small>{t(`mode.${state.mode}`)} · {t(`intent.${state.supportIntent}`)}</small>
                </span>
                <button type="button" className={css.close} onClick={closeAndRestoreFocus} disabled={pending} aria-label={t('garden.close')}>
                  <IconCloseOutline16 size={15} />
                </button>
              </div>
            )}
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

/** Full composer-toolbar props: standard session kit, injected actions, and locale seat. */
export type MindGardenDockProps = import('@deepseek-ai/dsh-client-ui-slots').PropsRuntime<'conversation.input.left'>
  & MindGardenDockActions
  & PropsLocale<'mindGarden'>

/** Read the typed projection and adapt it to the compact composer control. */
export function MindGardenDock({ useProjection, ...props }: MindGardenDockProps) {
  const projection = useProjection('mind-garden')
  return <MindGardenPanel projection={projection} {...props} />
}
