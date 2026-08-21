/** Recoverable card-owned conversation and explicit revision acceptance surface. */

import { useEffect, useRef, useState } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  MindGardenApplyStarCardRevisionRequest,
  MindGardenContinueStarCardRequest,
  MindGardenStarCard,
} from '@deepseek-ai/dsh-mind-garden-star-map/types'
import type { MindGardenDataResult } from '../slots.ts'
import type { MindGardenKey } from '../locales.ts'
import css from './StarObserver.module.css'

interface StarObserverDialogueProps {
  readonly card: MindGardenStarCard
  readonly t: (key: MindGardenKey) => string
  readonly onContinue: (
    request: MindGardenContinueStarCardRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarCard>>
  readonly onApplyRevision: (
    request: MindGardenApplyStarCardRevisionRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarCard>>
}

/** Render bounded encrypted turns without owning session or Remote context. */
export function StarObserverDialogue({ card, t, onContinue, onApplyRevision }: StarObserverDialogueProps) {
  const [input, setInput] = useState('')
  const [pendingMessage, setPendingMessage] = useState('')
  const [pending, setPending] = useState<'continue' | 'revision' | null>(null)
  const [error, setError] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInput('')
    setPendingMessage('')
    setPending(null)
    setError(false)
  }, [card.id])

  useEffect(() => {
    const transcript = transcriptRef.current
    if (transcript !== null) transcript.scrollTop = transcript.scrollHeight
  }, [card.turns.length, pendingMessage, pending])

  const send = async (
    content: string,
    quickReplyKind: MindGardenContinueStarCardRequest['quickReplyKind'] = '',
  ) => {
    const message = content.trim()
    if (message.length === 0 || pending !== null) return
    setInput('')
    setPendingMessage(message)
    setPending('continue')
    setError(false)
    const result = await onContinue({
      id: card.id,
      ifVersion: card.version,
      content: message,
      quickReplyKind,
    })
    setPending(null)
    setPendingMessage('')
    if (!result.ok) setError(true)
  }

  const applyRevision = async () => {
    if (card.pendingRevision === null || pending !== null) return
    setPending('revision')
    setError(false)
    const result = await onApplyRevision({
      id: card.id,
      ifVersion: card.version,
      revisionId: card.pendingRevision.id,
    })
    setPending(null)
    if (!result.ok) setError(true)
  }

  return (
    <section className={css.dialogue} aria-label={t('star.observer.dialogue.title')}>
      <header className={css.dialogueHeader}>
        <div><span aria-hidden="true">✧</span><strong>{t('star.observer.dialogue.title')}</strong></div>
        <small role="status" aria-live="polite">
          {pending === 'continue' ? t('star.observer.dialogue.thinking') : t('star.observer.dialogue.ready')}
        </small>
      </header>

      <div className={css.transcript} ref={transcriptRef} aria-live="polite" aria-busy={pending === 'continue'}>
        {card.turns.length === 0 && pendingMessage.length === 0 ? (
          <div className={css.dialogueWelcome}>
            <strong>{t('star.observer.dialogue.welcome')}</strong>
            <span>{t('star.observer.dialogue.welcome.body')}</span>
          </div>
        ) : null}
        {card.turns.map(turn => (
          <article key={turn.id} data-role={turn.role}>
            <small>{turn.role === 'user' ? t('star.observer.dialogue.me') : t('star.observer.dialogue.observer')}</small>
            {turn.role === 'assistant'
              ? <div className={css.assistantMarkdown}><MarkdownText text={turn.content} /></div>
              : <p>{turn.content}</p>}
          </article>
        ))}
        {pendingMessage.length > 0 && (
          <>
            <article data-role="user" data-pending="true"><small>{t('star.observer.dialogue.me')}</small><p>{pendingMessage}</p></article>
            <p className={css.thinking}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />{t('star.observer.dialogue.thinking.detail')}</p>
          </>
        )}
      </div>

      {card.pendingRevision !== null && (
        <aside className={css.revision}>
          <span>{t('star.observer.revision.eyebrow')}</span>
          <strong>{card.pendingRevision.title}</strong>
          <p>{card.pendingRevision.frontText}</p>
          <small>{t('star.observer.revision.disclosure')}</small>
          <button type="button" disabled={pending !== null} onClick={() => { void applyRevision() }}>
            {pending === 'revision' ? t('star.observer.revision.applying') : t('star.observer.revision.apply')}
          </button>
        </aside>
      )}

      {card.quickReplies.length > 0 && (
        <div className={css.quickReplies} aria-label={t('star.observer.dialogue.suggestions')}>
          {card.quickReplies.map(reply => (
            <button
              type="button"
              key={reply.kind}
              disabled={pending !== null}
              onClick={() => { void send(reply.label, reply.kind) }}
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}

      <form className={css.composer} onSubmit={(event) => { event.preventDefault(); void send(input) }}>
        <label>
          <span>{t('star.observer.dialogue.input')}</span>
          <textarea
            value={input}
            maxLength={1200}
            rows={2}
            disabled={pending !== null}
            placeholder={t('star.observer.dialogue.placeholder')}
            onChange={(event) => { setInput(event.target.value) }}
          />
        </label>
        <button type="submit" disabled={pending !== null || input.trim().length === 0} aria-label={t('star.observer.dialogue.send')}>↑</button>
      </form>
      {error && <p className={css.error} role="alert">{t('star.observer.dialogue.error')}</p>}
    </section>
  )
}
