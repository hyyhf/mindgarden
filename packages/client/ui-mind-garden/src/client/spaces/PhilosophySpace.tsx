/** Confirmation-gated contemplations and life principles. */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  IconCheckOutline16,
  IconCloseOutline16,
  IconSendOutline14,
  IconSparkle16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  MindGardenContemplation,
  MindGardenPrinciple,
  MindGardenPrincipleContent,
  MindGardenPrincipleProposal,
  MindGardenPrincipleStatus,
} from '@deepseek-ai/dsh-mind-garden/reflection/types'
import { calendarStamp } from '../calendar.ts'
import { PhilosophyIcon, PrivateIcon } from '../GardenIcons.tsx'
import { PHILOSOPHY_FOLIO_ROOM_V3 } from '../generated-assets.ts'
import type { MindGardenKey } from '../locales.ts'
import type { MindGardenDataResult, MindGardenViewActions } from '../slots.ts'
import { settleMindGardenAction } from '../settle-action.ts'
import shared from './GardenSpace.module.css'
import css from './PhilosophySpace.module.css'

type PhilosophyActions = Pick<
  MindGardenViewActions,
  | 'onListContemplations'
  | 'onCreateContemplation'
  | 'onUpdateContemplation'
  | 'onConfirmContemplation'
  | 'onDeleteContemplation'
  | 'onProposePrinciple'
  | 'onListPrincipleProposals'
  | 'onListPrinciples'
  | 'onAcceptPrincipleProposal'
  | 'onRejectPrincipleProposal'
  | 'onRevisePrincipleStatus'
>

const PRINCIPLE_STATUSES = ['trying', 'adopted', 'questioning', 'retired'] as const
const MAX_CONTEMPLATION_CHARACTERS = 30_000
const MAX_PRINCIPLE_CHARACTERS = 3_000

function exactQuote(markdown: string): string {
  return Array.from(markdown.trim()).slice(0, 1_000).join('')
}

/** Plain props for the philosophy space. */
export interface PhilosophySpaceProps extends PhilosophyActions {
  readonly today: string
  readonly onDraftConversation?: (draft: string) => void
  readonly t: (key: MindGardenKey) => string
}

/** Render contemplation evidence, inert proposals, and user-governed principle histories. */
export function PhilosophySpace({
  today,
  onListContemplations,
  onCreateContemplation,
  onUpdateContemplation,
  onConfirmContemplation,
  onDeleteContemplation,
  onProposePrinciple,
  onListPrincipleProposals,
  onListPrinciples,
  onAcceptPrincipleProposal,
  onRejectPrincipleProposal,
  onRevisePrincipleStatus,
  onDraftConversation = () => undefined,
  t,
}: PhilosophySpaceProps) {
  const [contemplations, setContemplations] = useState<readonly MindGardenContemplation[]>([])
  const [proposals, setProposals] = useState<readonly MindGardenPrincipleProposal[]>([])
  const [principles, setPrinciples] = useState<readonly MindGardenPrinciple[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<MindGardenKey | null>(null)
  const [notice, setNotice] = useState<MindGardenKey | null>(null)
  const [creating, setCreating] = useState(false)
  const [newContemplation, setNewContemplation] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingMarkdown, setEditingMarkdown] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [proposalSourceId, setProposalSourceId] = useState<string | null>(null)
  const [proposalExpression, setProposalExpression] = useState('')
  const requestRef = useRef(0)

  const refresh = useCallback(async () => {
    const request = ++requestRef.current
    const [contemplationResult, proposalResult, principleResult] = await Promise.all([
      settleMindGardenAction(onListContemplations),
      settleMindGardenAction(onListPrincipleProposals),
      settleMindGardenAction(onListPrinciples),
    ])
    if (request !== requestRef.current) return
    if (!contemplationResult.ok || !proposalResult.ok || !principleResult.ok) {
      setError('philosophy.error')
      setLoading(false)
      return
    }
    setContemplations(contemplationResult.value)
    setProposals(proposalResult.value)
    setPrinciples(principleResult.value)
    setError(null)
    setLoading(false)
  }, [onListContemplations, onListPrincipleProposals, onListPrinciples])

  useEffect(() => {
    void refresh()
    return () => { requestRef.current++ }
  }, [refresh])

  async function mutate(
    action: () => Promise<MindGardenDataResult<unknown>>,
    success: MindGardenKey,
  ): Promise<boolean> {
    setPending(true)
    setError(null)
    setNotice(null)
    let result: MindGardenDataResult<unknown>
    try {
      result = await action()
    } catch {
      setPending(false)
      setError('philosophy.error')
      return false
    }
    setPending(false)
    if (!result.ok) {
      setError(result.code === 'contemplation-source-unavailable'
        ? 'philosophy.sourceUnavailable'
        : 'philosophy.error')
      return false
    }
    setNotice(success)
    await refresh()
    return true
  }

  async function createContemplation() {
    const markdown = newContemplation.trim()
    if (markdown === '') return
    if (await mutate(
      async () => await onCreateContemplation(markdown),
      'philosophy.notice.created',
    )) {
      setNewContemplation('')
      setCreating(false)
    }
  }

  async function updateContemplation(item: MindGardenContemplation) {
    const markdown = editingMarkdown.trim()
    if (markdown === '') return
    if (await mutate(
      async () => await onUpdateContemplation(item, markdown),
      'philosophy.notice.updated',
    )) {
      setEditingId(null)
      setEditingMarkdown('')
    }
  }

  async function confirmContemplation(item: MindGardenContemplation) {
    if (await mutate(
      async () => await onConfirmContemplation(item),
      'philosophy.notice.confirmed',
    )) {
      setEditingId(null)
      setDeletingId(null)
    }
  }

  async function deleteContemplation(item: MindGardenContemplation) {
    if (await mutate(
      async () => await onDeleteContemplation(item),
      'philosophy.notice.deleted',
    )) {
      setEditingId(null)
      setDeletingId(null)
    }
  }

  async function proposePrinciple(item: MindGardenContemplation) {
    const expression = proposalExpression.trim()
    if (expression === '') return
    const content: MindGardenPrincipleContent = {
      expression,
      formationContext: t('philosophy.formation.manual'),
      userQuote: exactQuote(item.markdown),
      supportingExperiences: [],
      counterexample: '',
      appliesTo: [],
      notAppliesTo: [],
      lastChallenged: today,
      status: 'trying',
    }
    if (await mutate(
      async () => await onProposePrinciple(item, content),
      'philosophy.notice.proposed',
    )) {
      setProposalSourceId(null)
      setProposalExpression('')
    }
  }

  function reviseStatus(principle: MindGardenPrinciple, status: MindGardenPrincipleStatus) {
    void mutate(
      async () => await onRevisePrincipleStatus(principle, status, calendarStamp(today)),
      'philosophy.notice.revised',
    )
  }

  function draftContemplation(item: MindGardenContemplation) {
    onDraftConversation(t('philosophy.draft.contemplation').replace('{content}', item.markdown))
    setNotice('philosophy.notice.drafted')
  }

  function draftPrinciple(item: MindGardenPrinciple) {
    onDraftConversation(t('philosophy.draft.principle')
      .replace('{expression}', item.current.expression)
      .replace('{counterexample}', item.current.counterexample))
    setNotice('philosophy.notice.drafted')
  }

  const confirmedContemplations = contemplations.filter(item => item.status === 'confirmed').length
  const pendingProposals = proposals.filter(item => item.status === 'proposed').length
  const activePrinciples = principles.filter(item => item.status !== 'retired').length

  return (
    <main className={`${shared.space} ${css.philosophy}`} data-mind-garden-space="philosophy">
      <header className={css.hero} style={{ '--mg-philosophy-scene': `url("${PHILOSOPHY_FOLIO_ROOM_V3}")` } as CSSProperties}>
        <div className={css.heroCopy}>
          <PhilosophyIcon size={22} />
          <h1>{t('philosophy.title')}</h1>
          <p>{t('philosophy.subtitle')}</p>
          <span className={css.privateLine}><PrivateIcon size={15} />{t('philosophy.private')}</span>
        </div>
        <figure className={css.specimen} aria-label={t('philosophy.instrument.label')}>
          <figcaption>
            <span><strong>{confirmedContemplations}</strong>{t('philosophy.instrument.notes')}</span>
            <span><strong>{pendingProposals}</strong>{t('philosophy.instrument.proposals')}</span>
            <span><strong>{activePrinciples}</strong>{t('philosophy.instrument.principles')}</span>
          </figcaption>
        </figure>
      </header>

      {notice !== null && <p className={shared.notice} role="status">{t(notice)}</p>}
      {error !== null && <p className={shared.error} role="alert">{t(error)}</p>}
      {loading ? <p className={css.loading} role="status">{t('philosophy.loading')}</p> : (
        <div className={css.sections}>
          <section className={`${css.section} ${css.contemplationSection}`} aria-labelledby="garden-contemplations">
            <div className={css.sectionHeader}>
              <span><IconSparkle16 /></span>
              <div><h2 id="garden-contemplations">{t('philosophy.contemplations')}</h2><p>{t('philosophy.contemplationsHint')}</p></div>
              <button
                className={shared.quietButton}
                type="button"
                aria-expanded={creating}
                disabled={pending}
                onClick={() => {
                  setCreating(value => !value)
                  setEditingId(null)
                  setDeletingId(null)
                }}
              >
                {t('philosophy.add')}
              </button>
            </div>
            {creating && (
              <form className={css.inlineComposer} onSubmit={(event) => { event.preventDefault(); void createContemplation() }}>
                <label htmlFor="garden-new-contemplation">{t('philosophy.addLabel')}</label>
                <textarea
                  id="garden-new-contemplation"
                  value={newContemplation}
                  maxLength={MAX_CONTEMPLATION_CHARACTERS}
                  autoFocus
                  onChange={(event) => { setNewContemplation(event.target.value) }}
                />
                <div>
                  <button className={shared.button} type="submit" disabled={pending || newContemplation.trim() === ''}>{t('philosophy.saveDraft')}</button>
                  <button className={shared.quietButton} type="button" disabled={pending} onClick={() => { setCreating(false); setNewContemplation('') }}>{t('philosophy.cancel')}</button>
                </div>
              </form>
            )}
            {contemplations.length === 0 ? <p className={css.empty}>{t('philosophy.emptyContemplations')}</p> : (
              <ol className={css.list}>
                {contemplations.map((item, index) => (
                  <li className={css.note} data-status={item.status} key={String(item.id)}>
                    <span className={css.sequence} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <article>
                      <header>
                        <small>{t(`philosophy.contemplation.${item.status}`)}</small>
                        <time>{new Date(item.updatedAt).toLocaleDateString()}</time>
                      </header>
                      <p>{item.markdown}</p>
                      {editingId === String(item.id) && (
                        <form
                          className={css.inlineComposer}
                          onSubmit={(event) => { event.preventDefault(); void updateContemplation(item) }}
                        >
                          <label htmlFor={`garden-edit-${String(item.id)}`}>{t('philosophy.editLabel')}</label>
                          <textarea
                            id={`garden-edit-${String(item.id)}`}
                            value={editingMarkdown}
                            maxLength={MAX_CONTEMPLATION_CHARACTERS}
                            autoFocus
                            onChange={(event) => { setEditingMarkdown(event.target.value) }}
                          />
                          <div>
                            <button className={shared.button} type="submit" disabled={pending || editingMarkdown.trim() === ''}>{t('philosophy.save')}</button>
                            <button className={shared.quietButton} type="button" disabled={pending} onClick={() => { setEditingId(null); setEditingMarkdown('') }}>{t('philosophy.cancel')}</button>
                          </div>
                        </form>
                      )}
                      {proposalSourceId === String(item.id) && (
                        <form
                          className={css.principleComposer}
                          onSubmit={(event) => { event.preventDefault(); void proposePrinciple(item) }}
                        >
                          <label htmlFor={`garden-principle-${String(item.id)}`}>{t('philosophy.extractLabel')}</label>
                          <input
                            id={`garden-principle-${String(item.id)}`}
                            value={proposalExpression}
                            maxLength={MAX_PRINCIPLE_CHARACTERS}
                            autoFocus
                            onChange={(event) => { setProposalExpression(event.target.value) }}
                          />
                          <div>
                            <button className={shared.button} type="submit" disabled={pending || proposalExpression.trim() === ''}>{t('philosophy.propose')}</button>
                            <button className={shared.quietButton} type="button" disabled={pending} onClick={() => { setProposalSourceId(null); setProposalExpression('') }}>{t('philosophy.cancel')}</button>
                          </div>
                        </form>
                      )}
                      {deletingId === String(item.id) && (
                        <div className={css.deleteConfirmation} role="group" aria-label={t('philosophy.deleteQuestion')}>
                          <span>{t('philosophy.deleteQuestion')}</span>
                          <button className={shared.dangerButton} type="button" disabled={pending} onClick={() => { void deleteContemplation(item) }}>{t('philosophy.deleteConfirm')}</button>
                          <button className={shared.quietButton} type="button" disabled={pending} onClick={() => { setDeletingId(null) }}>{t('philosophy.cancel')}</button>
                        </div>
                      )}
                      <footer>
                        {item.status === 'draft' ? (
                          <>
                            <button className={shared.quietButton} type="button" disabled={pending} onClick={() => {
                              setEditingId(String(item.id)); setEditingMarkdown(item.markdown); setDeletingId(null)
                            }}>{t('philosophy.edit')}</button>
                            <button className={shared.button} type="button" disabled={pending} onClick={() => { void confirmContemplation(item) }}><IconCheckOutline16 />{t('philosophy.confirm')}</button>
                            <button className={shared.quietButton} type="button" disabled={pending} onClick={() => {
                              setDeletingId(String(item.id)); setEditingId(null)
                            }}>{t('philosophy.delete')}</button>
                          </>
                        ) : (
                          <>
                            {!proposals.some(proposal => proposal.sourceContemplationId === item.id && proposal.status === 'proposed') && (
                              <button className={shared.quietButton} type="button" disabled={pending} onClick={() => {
                                setProposalSourceId(String(item.id)); setProposalExpression('')
                              }}>{t('philosophy.extract')}</button>
                            )}
                            <button className={shared.quietButton} type="button" onClick={() => { draftContemplation(item) }}><IconSendOutline14 />{t('philosophy.continue')}</button>
                          </>
                        )}
                      </footer>
                    </article>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className={`${css.section} ${css.proposalSection}`} aria-labelledby="garden-proposals">
            <div className={css.sectionHeader}>
              <span><IconSparkle16 /></span>
              <div><h2 id="garden-proposals">{t('philosophy.proposals')}</h2><p>{t('philosophy.proposalsHint')}</p></div>
            </div>
            {proposals.length === 0 ? <p className={css.empty}>{t('philosophy.emptyProposals')}</p> : (
              <ul className={css.proposalList}>
                {proposals.map(item => (
                  <li className={css.proposal} data-status={item.status} key={String(item.id)}>
                    <header>
                      <small>{t(`philosophy.proposal.${item.status}`)}</small>
                      <strong>{item.content.expression}</strong>
                    </header>
                    <dl className={css.proposalMeaning}>
                      <div><dt>{t('philosophy.formation')}</dt><dd>{item.content.formationContext}</dd></div>
                      <div><dt>{t('philosophy.quote')}</dt><dd>{item.content.userQuote}</dd></div>
                      <div><dt>{t('philosophy.counterexample')}</dt><dd>{item.content.counterexample}</dd></div>
                    </dl>
                    {item.status === 'proposed' && (
                      <div className={css.proposalActions}>
                        <button
                          className={shared.button}
                          type="button"
                          disabled={pending}
                          onClick={() => { void mutate(
                            async () => await onAcceptPrincipleProposal(item, calendarStamp(today)),
                            'philosophy.notice.accepted',
                          ) }}
                        >
                          <IconCheckOutline16 />{t('philosophy.accept')}
                        </button>
                        <button
                          className={shared.dangerButton}
                          type="button"
                          disabled={pending}
                          onClick={() => { void mutate(
                            async () => await onRejectPrincipleProposal(item),
                            'philosophy.notice.rejected',
                          ) }}
                        >
                          <IconCloseOutline16 />{t('philosophy.reject')}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${css.section} ${css.principleSection}`} aria-labelledby="garden-principles">
            <div className={css.sectionHeader}>
              <span><PhilosophyIcon size={17} /></span>
              <div><h2 id="garden-principles">{t('philosophy.principles')}</h2><p>{t('philosophy.principlesHint')}</p></div>
            </div>
            {principles.length === 0 ? <p className={css.empty}>{t('philosophy.emptyPrinciples')}</p> : (
              <ol className={css.principles}>
                {principles.map((item, index) => (
                  <li className={css.principle} data-status={item.status} key={String(item.id)}>
                    <span className={css.folioNumber}>{String(index + 1).padStart(2, '0')}</span>
                    <article>
                      <header>
                        <h3>{item.current.expression}</h3>
                        <select
                          className={css.statusSelect}
                          aria-label={t('philosophy.statusFor').replace('{principle}', item.current.expression)}
                          value={item.status}
                          disabled={pending}
                          onChange={(event) => { reviseStatus(item, event.target.value as MindGardenPrincipleStatus) }}
                        >
                          {PRINCIPLE_STATUSES.map(status => (
                            <option value={status} key={status}>{t(`philosophy.principle.${status}`)}</option>
                          ))}
                        </select>
                      </header>
                      <dl className={css.meaning}>
                        <div><dt>{t('philosophy.formation')}</dt><dd>{item.current.formationContext}</dd></div>
                        <div><dt>{t('philosophy.quote')}</dt><dd>{item.current.userQuote}</dd></div>
                        <div><dt>{t('philosophy.counterexample')}</dt><dd>{item.current.counterexample}</dd></div>
                      </dl>
                      <ul className={css.tags} aria-label={t('philosophy.appliesTo')}>
                        {item.current.appliesTo.map(scope => <li key={scope}>{scope}</li>)}
                      </ul>
                      <details className={css.versions}>
                        <summary>{t('philosophy.versionCount').replace('{count}', String(item.versions.length))}</summary>
                        <ol>{item.versions.map(version => (
                          <li key={version.number}>
                            <time>{version.stamp.localDate}</time><p>{version.content.expression}</p>
                          </li>
                        ))}</ol>
                      </details>
                      <footer>
                        <button className={shared.quietButton} type="button" onClick={() => { draftPrinciple(item) }}>
                          <IconSendOutline14 />{t('philosophy.continue')}
                        </button>
                      </footer>
                    </article>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
