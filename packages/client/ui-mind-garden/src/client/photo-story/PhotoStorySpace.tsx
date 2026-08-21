/** Harness-native photo archive with a real 3D particle story surface. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, FormEvent, PointerEvent as ReactPointerEvent } from 'react'
import {
  IconChevronLeftOutline14,
  IconChevronRightOutline14,
  IconPauseOutline16,
  IconPlayOutline16,
  IconPlusOutline16,
  IconRefreshOutline14,
  Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  MindGardenPhotoParticleConfig,
  MindGardenPhotoParticlePreset,
  MindGardenPhotoStory,
} from '@deepseek-ai/dsh-mind-garden/media/types'
import { calendarStamp } from '../calendar.ts'
import type { MindGardenKey } from '../locales.ts'
import type { MindGardenViewActions } from '../slots.ts'
import { applyPhotoParticlePreset } from './presets.ts'
import { PhotoParticleScene } from './PhotoParticleScene.tsx'
import css from './PhotoStorySpace.module.css'
import { PhotoStoryIcon } from '../GardenIcons.tsx'
import { PHOTO_STORY_EMPTY_WARM } from '../generated-assets.ts'

const PAGE_SIZE = 9
const DYNAMIC_LIMIT = 10
const PRESETS = ['soft', 'dust', 'fluid', 'nebula'] as const satisfies readonly MindGardenPhotoParticlePreset[]

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setReduced(query.matches) }
    update()
    query.addEventListener('change', update)
    return () => { query.removeEventListener('change', update) }
  }, [])

  return reduced
}

type PhotoActions = Pick<
  MindGardenViewActions,
  | 'onListPhotoStories'
  | 'onCreatePhotoStory'
  | 'onReadPhotoStory'
  | 'onObservePhotoStory'
  | 'onContinuePhotoStory'
  | 'onUpdatePhotoStory'
  | 'onDeletePhotoStory'
>

/** Plain props retained at the conversation-view boundary. */
export interface PhotoStorySpaceProps extends PhotoActions {
  readonly today: string
  readonly t: (key: MindGardenKey) => string
}

function storyKey(story: MindGardenPhotoStory): string {
  return String(story.id)
}

function updateConfigGroup<K extends keyof Pick<MindGardenPhotoParticleConfig, 'rendering' | 'depth' | 'interaction' | 'animation'>>(
  config: MindGardenPhotoParticleConfig,
  group: K,
  patch: Partial<MindGardenPhotoParticleConfig[K]>,
): MindGardenPhotoParticleConfig {
  return { ...config, [group]: { ...config[group], ...patch } }
}

function replaceCount(copy: string, count: number): string {
  return copy.replace('{count}', new Intl.NumberFormat().format(count))
}

/** Render the encrypted photo-story album and its parameterized particle editor. */
export function PhotoStorySpace({
  today,
  onListPhotoStories,
  onCreatePhotoStory,
  onReadPhotoStory,
  onObservePhotoStory,
  onContinuePhotoStory,
  onUpdatePhotoStory,
  onDeletePhotoStory,
  t,
}: PhotoStorySpaceProps) {
  const [stories, setStories] = useState<readonly MindGardenPhotoStory[]>([])
  const [images, setImages] = useState<ReadonlyMap<string, string>>(new Map())
  const [active, setActive] = useState<MindGardenPhotoStory | null>(null)
  const [storyPanel, setStoryPanel] = useState<'dialogue' | 'edit'>('dialogue')
  const [view, setView] = useState<'classic' | 'dynamic'>('classic')
  const [dynamicIndex, setDynamicIndex] = useState(0)
  const [dynamicAutoPlay, setDynamicAutoPlay] = useState(true)
  const [dynamicPointerActive, setDynamicPointerActive] = useState(false)
  const [dynamicFocusWithin, setDynamicFocusWithin] = useState(false)
  const [dynamicDrag, setDynamicDrag] = useState(0)
  const [dynamicDragging, setDynamicDragging] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteArmed, setDeleteArmed] = useState(false)
  const [preview, setPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [config, setConfig] = useState<MindGardenPhotoParticleConfig | null>(null)
  const [particleCount, setParticleCount] = useState(0)
  const [particleRecompose, setParticleRecompose] = useState(0)
  const [imageRetry, setImageRetry] = useState(0)
  const [dialoguePending, setDialoguePending] = useState(false)
  const [dialogueDraft, setDialogueDraft] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dynamicCardRefs = useRef<Array<HTMLButtonElement | null>>([])
  const dynamicFocusTargetRef = useRef<number | null>(null)
  const dynamicGestureRef = useRef({ pointerId: -1, lastX: 0, angle: 0, velocity: 0 })
  const dynamicWasDraggedRef = useRef(false)
  const requestRef = useRef(0)
  const imageRequestRef = useRef(0)
  const requestedImagesRef = useRef(new Set<string>())
  const reducedMotion = useReducedMotion()

  const refresh = useCallback(async () => {
    const request = ++requestRef.current
    const result = await onListPhotoStories()
    if (request !== requestRef.current) return
    if (result.ok) {
      setStories(result.value)
      setPage(current => Math.min(current, Math.max(1, Math.ceil(result.value.length / PAGE_SIZE))))
      setError(false)
    } else {
      setError(true)
    }
    setLoading(false)
  }, [onListPhotoStories])

  useEffect(() => {
    void refresh()
    return () => { requestRef.current++ }
  }, [refresh])

  const pageCount = Math.max(1, Math.ceil(stories.length / PAGE_SIZE))
  const pageStories = useMemo(
    () => stories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, stories],
  )
  const dynamicStories = useMemo(() => stories.slice(0, DYNAMIC_LIMIT), [stories])
  const visibleStories = view === 'classic' ? pageStories : dynamicStories
  const visibleKey = visibleStories.map(storyKey).join(':')

  useEffect(() => {
    setDynamicIndex(current => Math.min(current, Math.max(0, dynamicStories.length - 1)))
  }, [dynamicStories.length])

  useEffect(() => {
    if (dynamicFocusTargetRef.current !== dynamicIndex) return
    dynamicFocusTargetRef.current = null
    dynamicCardRefs.current[dynamicIndex]?.focus()
  }, [dynamicIndex])

  useEffect(() => {
    if (reducedMotion) setDynamicAutoPlay(false)
  }, [reducedMotion])

  useEffect(() => {
    if (
      view !== 'dynamic'
      || dynamicStories.length < 2
      || !dynamicAutoPlay
      || dynamicPointerActive
      || dynamicFocusWithin
      || reducedMotion
    ) return
    const timer = window.setInterval(() => {
      setDynamicIndex(current => (current + 1) % dynamicStories.length)
    }, 5_200)
    return () => { window.clearInterval(timer) }
  }, [dynamicAutoPlay, dynamicFocusWithin, dynamicPointerActive, dynamicStories.length, reducedMotion, view])

  useEffect(() => {
    const candidates = active === null ? visibleStories : [...visibleStories, active]
    const missing = candidates.filter((story) => {
      const key = storyKey(story)
      return !images.has(key) && !requestedImagesRef.current.has(key)
    })
    if (missing.length === 0) return
    missing.forEach((story) => { requestedImagesRef.current.add(storyKey(story)) })
    const request = ++imageRequestRef.current
    void Promise.all(missing.map(async story => ({ story, result: await onReadPhotoStory(story) }))).then((entries) => {
      if (request !== imageRequestRef.current) return
      if (entries.some(entry => !entry.result.ok)) setError(true)
      setImages((current) => {
        const next = new Map(current)
        entries.forEach(({ story, result }) => {
          if (result.ok) next.set(storyKey(story), result.value)
        })
        return next
      })
    })
    return () => { imageRequestRef.current++ }
  }, [active, imageRetry, images, onReadPhotoStory, visibleKey])

  useEffect(() => {
    if (active === null) return
    setTitle(active.title)
    setNote(active.note)
    setConfig(active.particleConfig)
    setDeleteArmed(false)
    setPreview(false)
  }, [active])

  async function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (files.length === 0 || uploading) return
    setUploading(true)
    setError(false)
    try {
      let rejected = false
      for (const file of files) {
        const result = await onCreatePhotoStory(file, calendarStamp(today))
        if (!result.ok) rejected = true
      }
      await refresh()
      if (rejected) setError(true)
    } catch {
      setError(true)
    } finally {
      setUploading(false)
    }
  }

  function openStory(story: MindGardenPhotoStory) {
    setSaved(false)
    setStoryPanel('dialogue')
    setActive(story)
  }

  function moveDynamicFrame(delta: number, moveFocus = false) {
    if (dynamicStories.length === 0) return
    const nextIndex = (dynamicIndex + delta + dynamicStories.length) % dynamicStories.length
    dynamicFocusTargetRef.current = moveFocus ? nextIndex : null
    setDynamicIndex(nextIndex)
  }

  function startDynamicGesture(event: ReactPointerEvent<HTMLElement>) {
    if (reducedMotion || dynamicStories.length < 2 || event.button !== 0) return
    if ((event.target as Element).closest(`.${css.carouselControls}`) !== null) return
    dynamicGestureRef.current = { pointerId: event.pointerId, lastX: event.clientX, angle: 0, velocity: 0 }
    dynamicWasDraggedRef.current = false
    setDynamicDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDynamicGesture(event: ReactPointerEvent<HTMLElement>) {
    const gesture = dynamicGestureRef.current
    if (!dynamicDragging || gesture.pointerId !== event.pointerId) return
    const delta = event.clientX - gesture.lastX
    gesture.lastX = event.clientX
    gesture.velocity = gesture.velocity * 0.52 + delta * 0.48
    gesture.angle += delta * 0.24
    if (Math.abs(gesture.angle) > 4) dynamicWasDraggedRef.current = true
    setDynamicDrag(gesture.angle)
  }

  function finishDynamicGesture(event: ReactPointerEvent<HTMLElement>, cancelled = false) {
    const gesture = dynamicGestureRef.current
    if (!dynamicDragging || gesture.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setDynamicDragging(false)
    setDynamicDrag(0)
    if (!cancelled) {
      const stepAngle = 360 / dynamicStories.length
      const step = Math.round(-(gesture.angle + gesture.velocity * 8) / stepAngle)
      if (step !== 0) moveDynamicFrame(step)
    }
    dynamicGestureRef.current.pointerId = -1
  }

  function retryPhotoStories() {
    requestedImagesRef.current.clear()
    setImageRetry(current => current + 1)
    void refresh()
  }

  async function saveStory(story: MindGardenPhotoStory, particleConfig: MindGardenPhotoParticleConfig) {
    setPending(true)
    setError(false)
    setSaved(false)
    try {
      const result = await onUpdatePhotoStory(story, title.trim(), note.trim(), particleConfig)
      if (result.ok) {
        setActive(result.value)
        setStories(current => current.map(item => storyKey(item) === storyKey(result.value) ? result.value : item))
        setSaved(true)
      } else {
        setError(true)
        await refresh()
      }
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  function adoptStory(story: MindGardenPhotoStory) {
    setActive(story)
    setStories(current => current.map(item => storyKey(item) === storyKey(story) ? story : item))
  }

  async function observeStory(story: MindGardenPhotoStory) {
    setDialoguePending(true)
    setError(false)
    try {
      const result = await onObservePhotoStory(story)
      if (result.ok) adoptStory(result.value)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setDialoguePending(false)
    }
  }

  async function continueStory(
    story: MindGardenPhotoStory,
    content: string,
    quickReplyKind: '' | 'remember' | 'detail' | 'correct' = '',
  ) {
    const message = content.trim()
    if (message === '' || dialoguePending) return
    setDialoguePending(true)
    setError(false)
    try {
      const result = await onContinuePhotoStory(story, message, quickReplyKind)
      if (result.ok) {
        adoptStory(result.value)
        setDialogueDraft('')
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setDialoguePending(false)
    }
  }

  function submitDialogue(event: FormEvent<HTMLFormElement>, story: MindGardenPhotoStory) {
    event.preventDefault()
    void continueStory(story, dialogueDraft)
  }

  async function deleteStory(story: MindGardenPhotoStory) {
    if (!deleteArmed) {
      setDeleteArmed(true)
      return
    }
    setPending(true)
    setError(false)
    try {
      const result = await onDeletePhotoStory(story)
      if (result.ok) {
        const key = storyKey(story)
        setActive(null)
        setImages((current) => {
          const next = new Map(current)
          next.delete(key)
          return next
        })
        await refresh()
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setPending(false)
      setDeleteArmed(false)
    }
  }

  const activeImage = active === null ? undefined : images.get(storyKey(active))
  if (active !== null && config !== null) {
    return (
      <main className={css.story} data-mind-garden-space="photo-story" data-photo-mode="story">
        <header className={css.storyHeader}>
          <div className={css.storyHeading}>
            <h1>{t('photo.dialogue.title')}</h1>
            <button type="button" className={css.back} onClick={() => { setActive(null) }}>{t('photo.back')}</button>
          </div>
          <div className={css.storyMeta}>
            <span>{t('photo.date').replace('{date}', active.stamp.localDate)}</span>
            {particleCount > 0 && <span>{replaceCount(t('photo.sceneCount'), particleCount)}</span>}
          </div>
        </header>

        {error && <div className={css.error} role="alert"><span>{t('photo.error')}</span><button type="button" onClick={retryPhotoStories}>{t('photo.retry')}</button></div>}
        <div className={css.storyGrid}>
          <section className={css.sceneColumn}>
            {activeImage === undefined ? (
              <div className={css.sceneLoading} role="status">{t('photo.sceneLoading')}</div>
            ) : (
              <>
                <PhotoParticleScene
                  src={activeImage}
                  alt={title || t('photo.scene')}
                  config={config}
                  labels={{
                    scene: t('photo.scene'),
                    loading: t('photo.sceneLoading'),
                    fallback: t('photo.sceneFallback'),
                    reduced: t('photo.sceneReducedMotion'),
                  }}
                  onCount={setParticleCount}
                  recomposeToken={particleRecompose}
                />
                <div className={css.sceneTools}>
                  <button type="button" className={css.preview} onClick={() => { setParticleRecompose(value => value + 1) }}>
                    <IconRefreshOutline14 />{t('photo.recompose')}
                  </button>
                  <button type="button" className={css.preview} onClick={() => { setPreview(true) }}>{t('photo.preview')}</button>
                </div>
              </>
            )}
          </section>

          <aside className={css.editor} aria-label={t('photo.panel.controls')}>
            <nav className={css.storyPanelTabs} aria-label={t('photo.panel.controls')}>
              <button type="button" aria-pressed={storyPanel === 'dialogue'} onClick={() => { setStoryPanel('dialogue') }}>
                {t('photo.panel.dialogue')}
              </button>
              <button type="button" aria-pressed={storyPanel === 'edit'} onClick={() => { setStoryPanel('edit') }}>
                {t('photo.panel.edit')}
              </button>
            </nav>

            <div className={css.editorForm} hidden={storyPanel !== 'edit'}>
              <label>
                <span>{t('photo.storyTitle')}</span>
                <input value={title} maxLength={160} onChange={(event) => { setTitle(event.target.value); setSaved(false) }} />
              </label>
              <label>
                <span>{t('photo.storyNote')}</span>
                <textarea value={note} maxLength={8_000} placeholder={t('photo.storyPlaceholder')} onChange={(event) => { setNote(event.target.value); setSaved(false) }} />
              </label>

              <section className={css.particleEditor}>
                <h2>{t('photo.particleTitle')}</h2>
                <div className={css.presets}>
                  {PRESETS.map(preset => (
                    <button
                      type="button"
                      data-active={config.preset === preset}
                      key={preset}
                      onClick={() => { setConfig(applyPhotoParticlePreset(config, preset)); setSaved(false) }}
                    >
                      {t(`photo.particle.${preset}`)}
                    </button>
                  ))}
                </div>
                <RangeField label={t('photo.pointSize')} value={config.rendering.pointSize} min={0.7} max={6} step={0.1} onChange={(pointSize) => { setConfig(updateConfigGroup(config, 'rendering', { pointSize })); setSaved(false) }} />
                <RangeField label={t('photo.depth')} value={config.depth.strength} min={0} max={60} step={1} onChange={(strength) => { setConfig(updateConfigGroup(config, 'depth', { strength })); setSaved(false) }} />
                <RangeField label={t('photo.interaction')} value={config.interaction.strength} min={0} max={16} step={0.1} onChange={(strength) => { setConfig(updateConfigGroup(config, 'interaction', { strength })); setSaved(false) }} />
                <RangeField label={t('photo.motion')} value={config.animation.idleStrength} min={0} max={1.5} step={0.01} onChange={(idleStrength) => { setConfig(updateConfigGroup(config, 'animation', { idleStrength })); setSaved(false) }} />
              </section>

              {saved && <p className={css.saved} role="status">{t('photo.saved')}</p>}
              <div className={css.editorActions}>
                <button type="button" className={css.save} disabled={pending || title.trim() === ''} onClick={() => { void saveStory(active, config) }}>
                  {pending ? t('photo.saving') : t('photo.save')}
                </button>
                <button type="button" className={css.delete} disabled={pending} onClick={() => { void deleteStory(active) }}>
                  {deleteArmed ? t('photo.deleteConfirm') : t('photo.delete')}
                </button>
              </div>
              {deleteArmed && <p className={css.deleteHint}>{t('photo.deleteHint')}</p>}
            </div>

            <section className={css.photoDialogue} hidden={storyPanel !== 'dialogue'} aria-labelledby="mind-garden-photo-dialogue-title">
              <header>
                <h2 id="mind-garden-photo-dialogue-title">{t('photo.dialogue.title')}</h2>
                <p>{t('photo.dialogue.boundary')}</p>
              </header>
              {active.observation == null ? (
                <div className={css.observationGate}>
                  <div>
                    <h3>{t('photo.observe.title')}</h3>
                    <p>{t('photo.observe.disclosure')}</p>
                  </div>
                  <button type="button" disabled={dialoguePending} onClick={() => { void observeStory(active) }}>
                    {dialoguePending ? t('photo.observe.pending') : t('photo.observe.action')}
                  </button>
                </div>
              ) : (
                <>
                  <article className={css.grounding}>
                    <span>{t('photo.observe.unconfirmed')}</span>
                    <p>{active.observation.grounding.visualSummary}</p>
                    {active.observation.grounding.visibleElements.length > 0 && (
                      <ul aria-label={t('photo.observe.visible')}>
                        {active.observation.grounding.visibleElements.map(element => <li key={element}>{element}</li>)}
                      </ul>
                    )}
                    {active.observation.grounding.uncertainDetails.length > 0 && (
                      <details>
                        <summary>{t('photo.observe.uncertain')}</summary>
                        <ul>{active.observation.grounding.uncertainDetails.map(detail => <li key={detail}>{detail}</li>)}</ul>
                      </details>
                    )}
                  </article>
                  <div className={css.dialogueTurns} role="log" aria-live="polite">
                    {active.turns.map(turn => (
                      <article data-role={turn.role} key={String(turn.id)}>
                        <span>{turn.role === 'user' ? t('photo.dialogue.me') : t('photo.dialogue.companion')}</span>
                        <p>{turn.content}</p>
                      </article>
                    ))}
                  </div>
                  {active.quickReplies.length > 0 && (
                    <div className={css.quickReplies} aria-label={t('photo.dialogue.suggestions')}>
                      {active.quickReplies.map(reply => (
                        <button
                          type="button"
                          disabled={dialoguePending}
                          key={reply.kind}
                          onClick={() => { void continueStory(active, reply.label, reply.kind) }}
                        >
                          {reply.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <form className={css.dialogueForm} onSubmit={(event) => { submitDialogue(event, active) }}>
                    <label htmlFor="mind-garden-photo-dialogue-input">{t('photo.dialogue.input')}</label>
                    <div>
                      <textarea
                        id="mind-garden-photo-dialogue-input"
                        maxLength={8_000}
                        placeholder={t('photo.dialogue.placeholder')}
                        value={dialogueDraft}
                        onChange={(event) => { setDialogueDraft(event.target.value) }}
                      />
                      <button type="submit" disabled={dialoguePending || dialogueDraft.trim() === ''}>
                        {dialoguePending ? t('photo.dialogue.pending') : t('photo.dialogue.send')}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          </aside>
        </div>
        <Modal
          open={preview && activeImage !== undefined}
          title={t('photo.previewDialog')}
          closeLabel={t('photo.previewClose')}
          className={css.previewModal ?? ''}
          contentClassName={css.previewModalContent ?? ''}
          onClose={() => { setPreview(false) }}
        >
          {activeImage !== undefined && (
            <img className={css.previewImage} src={activeImage} alt={title || t('photo.scene')} />
          )}
        </Modal>
      </main>
    )
  }

  return (
    <main className={css.album} data-mind-garden-space="photo-story" data-photo-mode="album">
      <div className={css.aurora} aria-hidden="true" />
      <header className={css.albumHeader}>
        <div>
          <h1>{t('photo.title')}</h1>
          <p>{t('photo.subtitle')}</p>
          {stories.length > 0 && <strong>{t('photo.count').replace('{count}', String(stories.length))}</strong>}
        </div>
        <div className={css.headerActions}>
          <div className={css.viewSwitch} role="tablist" aria-label={t('photo.albumView')}>
            <button type="button" role="tab" aria-selected={view === 'classic'} onClick={() => { setView('classic') }}>{t('photo.classic')}</button>
            <button type="button" role="tab" aria-selected={view === 'dynamic'} onClick={() => { setView('dynamic') }}>{t('photo.dynamic')}</button>
          </div>
          <button
            type="button"
            className={css.upload}
            disabled={uploading}
            onClick={() => {
              /* v8 ignore next -- React assigns the rendered input before user click handlers can run. */
              inputRef.current?.click()
            }}
          >
            <IconPlusOutline16 size={15} />{uploading ? t('photo.uploading') : t('photo.upload')}
          </button>
          <input ref={inputRef} className={css.fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={(event) => { void chooseFiles(event) }} />
        </div>
      </header>

      <p className={css.uploadHint}>{t('photo.uploadHint')}</p>
      {error && <div className={css.error} role="alert"><span>{t('photo.error')}</span><button type="button" onClick={retryPhotoStories}>{t('photo.retry')}</button></div>}
      {loading ? (
        <div className={css.empty} role="status">{t('photo.loading')}</div>
      ) : stories.length === 0 ? (
        <div className={css.empty}>
          <div className={css.emptyCopy}>
            <span className={css.emptyGlyph}><PhotoStoryIcon size={24} /></span>
            <h2>{t('photo.empty.title')}</h2>
            <p>{t('photo.empty.body')}</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                /* v8 ignore next -- React assigns the rendered input before user click handlers can run. */
                inputRef.current?.click()
              }}
            >
              {t('photo.empty.action')}
            </button>
          </div>
          <img className={css.emptyArtwork} src={PHOTO_STORY_EMPTY_WARM} alt="" />
        </div>
      ) : view === 'classic' ? (
        <>
          <section className={css.grid} aria-label={t('photo.albumView')}>
            {pageStories.map((story, index) => (
              <PhotoCard
                key={storyKey(story)}
                story={story}
                index={(page - 1) * PAGE_SIZE + index + 1}
                src={images.get(storyKey(story))}
                t={t}
                onOpen={openStory}
              />
            ))}
          </section>
          <nav className={css.pagination} aria-label={t('photo.albumView')}>
            <button type="button" disabled={page <= 1} onClick={() => { setPage(current => current - 1) }}>{t('photo.pagePrevious')}</button>
            <span>{t('photo.page').replace('{current}', String(page)).replace('{total}', String(pageCount))}</span>
            <button type="button" disabled={page >= pageCount} onClick={() => { setPage(current => current + 1) }}>{t('photo.pageNext')}</button>
          </nav>
        </>
      ) : (
        <section
          className={css.dynamic}
          aria-label={t('photo.albumView')}
          onPointerEnter={() => { setDynamicPointerActive(true) }}
          onPointerLeave={() => { setDynamicPointerActive(false) }}
          onPointerDown={startDynamicGesture}
          onPointerMove={moveDynamicGesture}
          onPointerUp={finishDynamicGesture}
          onPointerCancel={(event) => { finishDynamicGesture(event, true) }}
          onFocusCapture={() => { setDynamicFocusWithin(true) }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setDynamicFocusWithin(false)
          }}
        >
          <div className={css.carouselControls} aria-label={t('photo.carouselControls')}>
            <button type="button" aria-label={t('photo.carouselPrevious')} disabled={dynamicStories.length < 2} onClick={() => { moveDynamicFrame(-1) }}>
              <IconChevronLeftOutline14 size={14} />
            </button>
            <span aria-live={dynamicAutoPlay ? 'off' : 'polite'}>
              {t('photo.carouselPosition')
                .replace('{current}', String(dynamicIndex + 1))
                .replace('{total}', String(dynamicStories.length))
                .replace('{title}', dynamicStories[dynamicIndex]?.title ?? '')}
            </span>
            <button
              type="button"
              aria-label={dynamicAutoPlay ? t('photo.carouselPause') : t('photo.carouselPlay')}
              aria-pressed={!dynamicAutoPlay}
              disabled={dynamicStories.length < 2 || reducedMotion}
              onClick={() => { setDynamicAutoPlay(current => !current) }}
            >
              {dynamicAutoPlay ? <IconPauseOutline16 size={14} /> : <IconPlayOutline16 size={14} />}
            </button>
            <button type="button" aria-label={t('photo.carouselNext')} disabled={dynamicStories.length < 2} onClick={() => { moveDynamicFrame(1) }}>
              <IconChevronRightOutline14 size={14} />
            </button>
          </div>
          <div
            className={css.ring}
            data-dragging={dynamicDragging}
            style={{
              '--photo-count': dynamicStories.length,
              '--photo-active': dynamicIndex,
              '--photo-drag': `${dynamicDrag}deg`,
            } as CSSProperties}
          >
            {dynamicStories.map((story, index) => (
              <button
                type="button"
                className={css.dynamicCard}
                key={storyKey(story)}
                ref={(node) => { dynamicCardRefs.current[index] = node }}
                style={{ '--photo-index': index } as CSSProperties}
                data-active={index === dynamicIndex}
                aria-current={index === dynamicIndex ? 'true' : undefined}
                aria-hidden={index !== dynamicIndex}
                aria-label={`${t('photo.open')} · ${story.title}`}
                tabIndex={index === dynamicIndex ? 0 : -1}
                onClick={(event) => {
                  if (dynamicWasDraggedRef.current) {
                    event.preventDefault()
                    dynamicWasDraggedRef.current = false
                    return
                  }
                  openStory(story)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault()
                    moveDynamicFrame(-1, true)
                  } else if (event.key === 'ArrowRight') {
                    event.preventDefault()
                    moveDynamicFrame(1, true)
                  }
                }}
              >
                {images.get(storyKey(story)) === undefined ? <span className={css.shimmer} /> : <img src={images.get(storyKey(story))} alt="" />}
                <span>{story.title}</span>
              </button>
            ))}
          </div>
          <p>{t('photo.dynamicHint')}</p>
        </section>
      )}
    </main>
  )
}

function PhotoCard({ story, index, src, t, onOpen }: {
  readonly story: MindGardenPhotoStory
  readonly index: number
  readonly src: string | undefined
  readonly t: (key: MindGardenKey) => string
  readonly onOpen: (story: MindGardenPhotoStory) => void
}) {
  return (
    <article className={css.card}>
      <button type="button" aria-label={`${t('photo.open')} · ${story.title}`} onClick={() => { onOpen(story) }}>
        <span className={css.index}>{String(index).padStart(2, '0')}</span>
        {src === undefined ? <span className={css.shimmer} /> : <img src={src} alt="" />}
        <span className={css.cardShade} aria-hidden="true" />
        <span className={css.cardCopy}>
          <strong>{story.title}</strong>
          <small>{t('photo.date').replace('{date}', story.stamp.localDate)}</small>
        </span>
      </button>
    </article>
  )
}

function RangeField({ label, value, min, max, step, onChange }: {
  readonly label: string
  readonly value: number
  readonly min: number
  readonly max: number
  readonly step: number
  readonly onChange: (value: number) => void
}) {
  return (
    <label className={css.range}>
      <span>{label}<output>{step < 1 ? value.toFixed(2) : value.toFixed(0)}</output></span>
      <input aria-label={label} type="range" value={value} min={min} max={max} step={step} onChange={(event) => { onChange(Number(event.target.value)) }} />
    </label>
  )
}
