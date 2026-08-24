/** Evidence-bound card draw and human calibration surface for the Star Observer. */

import { useEffect, useState } from 'react'
import { IconCloseOutline16, IconPlusOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  MindGardenCalibrateStarCardRequest,
  MindGardenDrawStarCardRequest,
  MindGardenFinalizeStarCardRequest,
  MindGardenStarCard,
  MindGardenStarDeck,
  MindGardenStarProfile,
} from '@deepseek-ai/dsh-mind-garden/star-map/types'
import type { MindGardenDataResult } from '../slots.ts'
import type { MindGardenKey } from '../locales.ts'
import css from './StarObserver.module.css'
import { StarObserverDialogue } from './StarObserverDialogue.tsx'
import { PrivateIcon, StarMapIcon } from '../GardenIcons.tsx'

const DECKS = ['current-self', 'unfolded-self', 'inner-debate'] as const satisfies readonly MindGardenStarDeck[]

interface StarObserverProps {
  readonly profile: MindGardenStarProfile
  readonly cards: readonly MindGardenStarCard[]
  readonly activeCard: MindGardenStarCard | null
  readonly t: (key: MindGardenKey) => string
  readonly onDraw: (request: MindGardenDrawStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>
  readonly onCalibrate: (
    request: MindGardenCalibrateStarCardRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarCard>>
  readonly onFinalize: (
    request: MindGardenFinalizeStarCardRequest,
  ) => Promise<MindGardenDataResult<MindGardenStarCard>>
  readonly onContinue: Parameters<typeof StarObserverDialogue>[0]['onContinue']
  readonly onApplyRevision: Parameters<typeof StarObserverDialogue>[0]['onApplyRevision']
}

function browserLocalDate(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function confidenceLabel(card: MindGardenStarCard, t: StarObserverProps['t']): string {
  if (card.cardKind === 'imagination') return t('star.observer.kind.imagination')
  if (card.confidence >= 0.65) return t('star.observer.confidence.grounded')
  return t('star.observer.confidence.tentative')
}

/** Render one resumable observer desk without owning Remote or session context. */
export function StarObserver({
  profile,
  cards,
  activeCard,
  t,
  onDraw,
  onCalibrate,
  onFinalize,
  onContinue,
  onApplyRevision,
}: StarObserverProps) {
  const authorizedSourceCount = Object.values(profile.permissions).filter(Boolean).length
  const [open, setOpen] = useState(activeCard !== null)
  const [selectedId, setSelectedId] = useState<string | null>(activeCard === null ? null : String(activeCard.id))
  const [deck, setDeck] = useState<MindGardenStarDeck>('current-self')
  const [question, setQuestion] = useState('')
  const card = activeCard ?? cards.find(item => String(item.id) === selectedId) ?? null
  const savedCards = cards.filter(item => item.status === 'saved')
  const [correction, setCorrection] = useState(card?.calibration?.correction ?? '')
  const [pending, setPending] = useState<'draw' | 'calibrate' | 'finalize' | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (activeCard !== null) {
      setOpen(true)
      setSelectedId(String(activeCard.id))
    } else if (selectedId !== null && !cards.some(item => String(item.id) === selectedId)) {
      setSelectedId(null)
    }
    setCorrection(card?.calibration?.correction ?? '')
  }, [activeCard, card, cards, selectedId])

  const draw = async () => {
    if (pending !== null) return
    setPending('draw')
    setError(false)
    const result = await onDraw({
      deck,
      question: question.trim(),
      observedLocalDate: browserLocalDate(),
    })
    setPending(null)
    if (!result.ok) setError(true)
  }

  const calibrate = async (verdict: MindGardenCalibrateStarCardRequest['verdict']) => {
    if (card === null || pending !== null) return
    setPending('calibrate')
    setError(false)
    const result = await onCalibrate({
      id: card.id,
      ifVersion: card.version,
      verdict,
      ...(correction.trim().length === 0 ? {} : { correction: correction.trim() }),
    })
    setPending(null)
    if (!result.ok) setError(true)
  }

  const finalize = async (action: MindGardenFinalizeStarCardRequest['action']) => {
    if (card === null || pending !== null) return
    setPending('finalize')
    setError(false)
    const result = await onFinalize({ id: card.id, ifVersion: card.version, action })
    setPending(null)
    if (!result.ok) {
      setError(true)
      return
    }
    if (action === 'dissolve') setSelectedId(null)
  }

  return (
    <aside className={css.observatory} data-open={open} data-active-card={card !== null}>
      <button
        type="button"
        className={css.summon}
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <StarMapIcon size={17} />
        <span><strong>{t('star.observer.summon')}</strong><small>{card === null ? t('star.observer.summon.hint') : t('star.observer.awaiting')}</small></span>
        {savedCards.length > 0 && <b>{savedCards.length}</b>}
      </button>

      {open && (
        <section className={css.desk} aria-label={t('star.observer.title')} aria-live="polite">
          <header className={css.deskHeader}>
            <h2>{t('star.observer.title')}</h2>
            <button type="button" onClick={() => { setOpen(false) }} aria-label={t('star.observer.close')}><IconCloseOutline16 size={15} /></button>
          </header>

          {activeCard === null && savedCards.length > 0 && (
            <nav className={css.cardShelf} aria-label={t('star.observer.saved.title')}>
              <button type="button" data-selected={card === null} onClick={() => { setSelectedId(null) }}><IconPlusOutline16 size={14} />{t('star.observer.saved.new')}</button>
              {savedCards.map(saved => (
                <button
                  type="button"
                  key={saved.id}
                  data-selected={card?.id === saved.id}
                  onClick={() => { setSelectedId(String(saved.id)) }}
                >
                  <StarMapIcon size={14} />{saved.title}
                </button>
              ))}
            </nav>
          )}

          {card === null ? (
            <div className={css.drawDesk}>
              <p>{t('star.observer.disclosure')}</p>
              <fieldset>
                <legend>{t('star.observer.deck')}</legend>
                <div className={css.decks}>
                  {DECKS.map(value => (
                    <button
                      type="button"
                      key={value}
                      data-selected={deck === value}
                      aria-pressed={deck === value}
                      onClick={() => { setDeck(value) }}
                    >
                      <i aria-hidden="true" />
                      <span>{t(`star.observer.deck.${value}`)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className={css.question}>
                <span>{t('star.observer.question')}</span>
                <textarea
                  value={question}
                  maxLength={1200}
                  placeholder={t('star.observer.question.placeholder')}
                  onChange={(event) => { setQuestion(event.target.value) }}
                />
              </label>
              <div className={css.permissionLine}>
                <span><PrivateIcon size={15} />{authorizedSourceCount}/4</span>
                <p><strong>{t('star.observer.permission.title')}</strong>{t('star.observer.permission.body').replace('{count}', String(authorizedSourceCount))}</p>
              </div>
              {error && <p className={css.error} role="alert">{t('star.observer.error')}</p>}
              <button type="button" className={css.draw} disabled={pending !== null} onClick={() => { void draw() }}>
                {pending === 'draw' ? <><i aria-hidden="true" />{t('star.observer.drawing')}</> : t('star.observer.draw')}
              </button>
            </div>
          ) : (
            <article className={css.card} data-kind={card.cardKind}>
              <div className={css.cardGlow} aria-hidden="true" />
              <div className={css.cardMeta}>
                <span>{t(`star.observer.deck.${card.deck}`)}</span>
                <span>{confidenceLabel(card, t)} · {Math.round(card.confidence * 100)}%</span>
              </div>
              <h3>{card.title}</h3>
              <p className={css.frontText}>{card.frontText}</p>
              <dl className={css.analysis}>
                <div><dt>{t('star.observer.analysis.situation')}</dt><dd>{card.analysis.situation}</dd></div>
                <div><dt>{t('star.observer.analysis.core')}</dt><dd>{card.analysis.coreIssue}</dd></div>
                <div><dt>{t('star.observer.analysis.tradeoff')}</dt><dd>{card.analysis.tradeoff}</dd></div>
                <div><dt>{t('star.observer.analysis.guidance')}</dt><dd>{card.analysis.guidance}</dd></div>
              </dl>
              {card.evidence.length > 0 ? (
                <details className={css.evidence}>
                  <summary>{t('star.observer.evidence')} · {card.evidence.length}</summary>
                  {card.evidence.map(item => <p key={item.id}>{item.summary}</p>)}
                </details>
              ) : <p className={css.imagination}>{t('star.observer.imagination')}</p>}
              <blockquote>{card.openQuestion}</blockquote>

              <StarObserverDialogue card={card} t={t} onContinue={onContinue} onApplyRevision={onApplyRevision} />

              <div className={css.calibration}>
                <strong>{t('star.observer.calibrate')}</strong>
                <textarea
                  value={correction}
                  placeholder={t('star.observer.correction.placeholder')}
                  onChange={(event) => { setCorrection(event.target.value) }}
                />
                <div>
                  <button type="button" disabled={pending !== null} data-selected={card.calibration?.verdict === 'resonates'} onClick={() => { void calibrate('resonates') }}>{t('star.observer.resonates')}</button>
                  <button type="button" disabled={pending !== null} data-selected={card.calibration?.verdict === 'uncertain'} onClick={() => { void calibrate('uncertain') }}>{t('star.observer.uncertain')}</button>
                  <button type="button" disabled={pending !== null || correction.trim().length === 0} data-selected={card.calibration?.verdict === 'rejects'} onClick={() => { void calibrate('rejects') }}>{t('star.observer.rejects')}</button>
                </div>
              </div>
              {error && <p className={css.error} role="alert">{t('star.observer.error')}</p>}
              {card.status === 'draft' ? (
                <footer>
                  <button type="button" disabled={pending !== null} onClick={() => { void finalize('dissolve') }}>{t('star.observer.dissolve')}</button>
                  <button type="button" className={css.save} disabled={pending !== null} onClick={() => { void finalize('save') }}>{t('star.observer.save')}</button>
                </footer>
              ) : <p className={css.savedState}><StarMapIcon size={14} />{t('star.observer.saved.state')}</p>}
            </article>
          )}
          <small className={css.boundary}>{t('star.observer.boundary')}</small>
        </section>
      )}
    </aside>
  )
}
