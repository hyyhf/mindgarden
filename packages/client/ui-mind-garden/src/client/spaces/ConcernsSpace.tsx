/** Private concern basket backed by encrypted reflection records. */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  IconCheckOutline16,
  IconEditOutline16,
  IconSendOutline14,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { MindGardenConcern } from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { calendarStamp } from '../calendar.ts'
import { ConcernsIcon, JournalIcon, PrivateIcon } from '../GardenIcons.tsx'
import { CONCERN_PAPER_LATTICE_V3 } from '../generated-assets.ts'
import type { MindGardenKey } from '../locales.ts'
import type { MindGardenViewActions } from '../slots.ts'
import { settleMindGardenAction } from '../settle-action.ts'
import shared from './GardenSpace.module.css'
import css from './ConcernsSpace.module.css'

type ConcernActions = Pick<
  MindGardenViewActions,
  'onListConcerns' | 'onCreateConcern' | 'onUpdateConcern' | 'onCompleteConcern' | 'onConvertConcern'
>

/** Plain props for the concern space. */
export interface ConcernsSpaceProps extends ConcernActions {
  readonly today: string
  readonly onDraftConversation?: (draft: string) => void
  readonly t: (key: MindGardenKey) => string
}

/** Render create, complete, and journal-conversion flows for private concerns. */
export function ConcernsSpace({
  today,
  onListConcerns,
  onCreateConcern,
  onUpdateConcern,
  onCompleteConcern,
  onConvertConcern,
  onDraftConversation = () => undefined,
  t,
}: ConcernsSpaceProps) {
  const [concerns, setConcerns] = useState<readonly MindGardenConcern[]>([])
  const [content, setContent] = useState('')
  const [reminder, setReminder] = useState('')
  const [allowRetrieval, setAllowRetrieval] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingReminder, setEditingReminder] = useState('')
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  const [notice, setNotice] = useState<MindGardenKey | null>(null)
  const requestRef = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++requestRef.current
    const result = await settleMindGardenAction(onListConcerns)
    if (request !== requestRef.current) return
    if (result.ok) {
      setConcerns(result.value)
      setError(false)
    } else {
      setError(true)
    }
    setLoading(false)
  }, [onListConcerns])

  useEffect(() => {
    void refresh()
    return () => { requestRef.current++ }
  }, [refresh])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = content.trim()
    if (value === '' || pending) return
    setPending(true)
    setError(false)
    setNotice(null)
    const result = await settleMindGardenAction(() => onCreateConcern(
      value,
      calendarStamp(today),
      reminder === '' ? undefined : calendarStamp(reminder),
    ))
    setPending(false)
    if (!result.ok) {
      setError(true)
      return
    }
    setContent('')
    setReminder('')
    setNotice('concern.notice.created')
    await refresh()
  }

  async function complete(item: MindGardenConcern) {
    setPending(true)
    setError(false)
    setNotice(null)
    const result = await settleMindGardenAction(() => onCompleteConcern(item))
    setPending(false)
    if (!result.ok) {
      setError(true)
      return
    }
    setNotice('concern.notice.completed')
    await refresh()
  }

  function beginEdit(item: MindGardenConcern) {
    setEditingId(String(item.id))
    setEditingContent(item.content)
    setEditingReminder(item.reminder?.localDate ?? '')
    setNotice(null)
    setError(false)
  }

  async function update(item: MindGardenConcern) {
    const value = editingContent.trim()
    if (value === '' || pending) return
    setPending(true)
    setError(false)
    setNotice(null)
    const result = await settleMindGardenAction(() => onUpdateConcern(
      item,
      value,
      today,
      editingReminder === '' ? undefined : calendarStamp(editingReminder),
    ))
    setPending(false)
    if (!result.ok) {
      setError(true)
      return
    }
    setEditingId(null)
    setNotice('concern.notice.updated')
    await refresh()
  }

  function draftConversation(item: MindGardenConcern) {
    onDraftConversation(t('concern.conversation.draft').replace('{content}', item.content))
    setNotice('concern.notice.drafted')
    setError(false)
  }

  async function convert(item: MindGardenConcern) {
    setPending(true)
    setError(false)
    setNotice(null)
    const result = await settleMindGardenAction(() => onConvertConcern(item, calendarStamp(today), allowRetrieval))
    setPending(false)
    if (!result.ok) {
      setError(true)
      return
    }
    setNotice('concern.notice.converted')
    await refresh()
  }

  return (
    <main className={shared.space} data-mind-garden-space="concerns">
      <section className={css.threshold} style={{ '--mg-concern-scene': `url("${CONCERN_PAPER_LATTICE_V3}")` } as CSSProperties}>
        <header className={css.intro}>
          <div>
            <h1>{t('concern.title')}</h1>
            <p>{t('concern.subtitle')}</p>
          </div>
          <aside className={css.privacy}>
            <PrivateIcon size={17} />
            <span>{t('space.private')}</span>
          </aside>
        </header>

        <form className={`${shared.panel} ${css.composer}`} onSubmit={(event) => { void submit(event) }}>
          <div className={css.composerIntro}>
            <span className={css.composerSeal}><ConcernsIcon size={18} /></span>
            <h2>{t('concern.compose.title')}</h2>
          </div>
          <div className={css.composerFields}>
            <label className={css.concernField}>
              <span>{t('concern.input')}</span>
              <textarea
                className={shared.textarea}
                value={content}
                placeholder={t('concern.placeholder')}
                onChange={(event) => { setContent(event.target.value) }}
              />
            </label>
            <div className={css.composerFooter}>
              <label className={css.reminderField}>
                <span>{t('concern.reminder')}</span>
                <input
                  className={shared.input}
                  type="date"
                  min={today}
                  value={reminder}
                  onChange={(event) => { setReminder(event.target.value) }}
                />
              </label>
              <label className={css.retrieval}>
                <input
                  type="checkbox"
                  checked={allowRetrieval}
                  onChange={(event) => { setAllowRetrieval(event.target.checked) }}
                />
                <span>{t('concern.retrieval')}</span>
              </label>
              <button className={shared.button} type="submit" disabled={pending || content.trim() === ''}>
                {t('concern.add')}
              </button>
            </div>
          </div>
        </form>
      </section>

      {notice !== null && <p className={shared.notice} role="status">{t(notice)}</p>}
      {error && <p className={shared.error} role="alert">{t('concern.error')}</p>}
      <section className={css.collection} aria-labelledby="mind-garden-concern-collection">
        <header className={css.collectionHeader}>
          <div>
            <h2 id="mind-garden-concern-collection">{t('concern.collection.title')}</h2>
          </div>
          <strong>{concerns.length === 0
            ? t('concern.collection.emptyCount')
            : t('concern.collection.count').replace('{count}', String(concerns.length))}</strong>
        </header>
        {loading ? (
          <p className={shared.empty} role="status">{t('concern.loading')}</p>
        ) : concerns.length === 0 ? (
          <div className={css.emptyState}>
            <ConcernsIcon size={24} />
            <p>{t('concern.empty')}</p>
          </div>
        ) : (
          <ul className={css.list}>
            {concerns.map(item => (
              <li className={`${shared.panel} ${css.card}`} data-status={item.status} key={String(item.id)}>
                <span className={css.thread} aria-hidden="true"><i /></span>
                <div className={css.cardBody}>
                  {editingId === String(item.id) ? (
                    <form className={css.editor} onSubmit={(event) => { event.preventDefault(); void update(item) }}>
                      <textarea
                        className={shared.textarea}
                        value={editingContent}
                        aria-label={t('concern.edit')}
                        onChange={(event) => { setEditingContent(event.target.value) }}
                      />
                      <input
                        className={shared.input}
                        type="date"
                        min={today}
                        value={editingReminder}
                        aria-label={t('concern.reminder')}
                        onChange={(event) => { setEditingReminder(event.target.value) }}
                      />
                      <div className={css.editorActions}>
                        <button className={shared.button} type="submit" disabled={pending || editingContent.trim() === ''}>
                          <IconCheckOutline16 size={14} />{t('concern.edit.save')}
                        </button>
                        <button className={shared.quietButton} type="button" onClick={() => { setEditingId(null) }}>
                          {t('concern.edit.cancel')}
                        </button>
                      </div>
                    </form>
                  ) : <p>{item.content}</p>}
                  <div className={css.meta}>
                    <span>{t(`concern.status.${item.status}`)}</span>
                    <span>{item.createdStamp.localDate}</span>
                    {item.reminder !== null && (
                      <span>{t('concern.reminds').replace('{date}', item.reminder.localDate)}</span>
                    )}
                  </div>
                </div>
                {item.status === 'active' && editingId !== String(item.id) && (
                  <div className={css.actions}>
                    <button
                      className={shared.quietButton}
                      type="button"
                      onClick={() => { draftConversation(item) }}
                    >
                      <IconSendOutline14 />{t('concern.conversation')}
                    </button>
                    <button className={shared.quietButton} type="button" onClick={() => { beginEdit(item) }}>
                      <IconEditOutline16 size={14} />{t('concern.edit')}
                    </button>
                    <button
                      className={shared.quietButton}
                      type="button"
                      disabled={pending}
                      onClick={() => { void convert(item) }}
                    >
                      <JournalIcon size={14} />{t('concern.convert')}
                    </button>
                    <button
                      className={shared.dangerButton}
                      type="button"
                      disabled={pending}
                      onClick={() => { void complete(item) }}
                    >
                      <IconCheckOutline16 size={14} />{t('concern.complete')}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
