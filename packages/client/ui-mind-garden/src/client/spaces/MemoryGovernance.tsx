/** User-authoritative review and lifecycle controls for governed memory. */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  IconDataOutline16,
  IconPlusOutline16,
  IconQueueOutline14,
  IconSendOutline14,
  IconSparkle16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  MindGardenMemoryAutomationInterval,
  MindGardenMemoryAutomationPolicy,
  MindGardenMemoryExtractionRun,
  MindGardenMemoryItem,
  MindGardenMemoryKind,
  MindGardenMemoryRecallPolicy,
  MindGardenMemoryRetrievalAudit,
  MindGardenMemoryRevision,
  MindGardenMemorySensitivity,
} from '@deepseek-ai/dsh-mind-garden/memory/types'
import type { MindGardenKey } from '../locales.ts'
import type { MindGardenViewActions } from '../slots.ts'
import shared from './GardenSpace.module.css'
import css from './MemoryGovernance.module.css'
import { MemoryIcon } from '../GardenIcons.tsx'
import { MEMORY_ARCHIVE_ALCOVE_V3 } from '../generated-assets.ts'

const KINDS: readonly MindGardenMemoryKind[] = [
  'fact', 'preference', 'value', 'support-preference', 'decision', 'emotion', 'episode',
]
const POLICIES: readonly MindGardenMemoryRecallPolicy[] = ['never', 'relevant', 'always']
const AUTOMATION_INTERVALS: readonly MindGardenMemoryAutomationInterval[] = [1, 3, 5]

type MemoryActions = Pick<
  MindGardenViewActions,
  | 'onListMemories'
  | 'onProposeMemory'
  | 'onConfirmMemory'
  | 'onUpdateMemory'
  | 'onRejectMemory'
  | 'onResolveMemoryRelationship'
  | 'onListMemoryRevisions'
  | 'onExtractMemories'
  | 'onLatestMemoryExtraction'
  | 'onMemoryAutomationPolicy'
  | 'onSetMemoryAutomationPolicy'
  | 'onDeleteMemory'
  | 'onLatestMemoryAudit'
>

interface MemoryDraft {
  kind: MindGardenMemoryKind
  sensitivity: MindGardenMemorySensitivity
  content: string
  reason: string
  scope: string
}

const emptyDraft: MemoryDraft = {
  kind: 'fact',
  sensitivity: 'normal',
  content: '',
  reason: '',
  scope: '',
}

function dateOf(value: number): string {
  return new Date(value).toISOString().slice(0, 10)
}

function temporaryDays(value: string): number | undefined {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined
}

function errorKey(code: string): MindGardenKey {
  if (code === 'version-conflict'
    || code === 'relationship-stale'
    || code === 'automation-version-conflict') return 'governance.error.stale'
  if (code === 'high-sensitivity-recall-forbidden') return 'governance.error.sensitive'
  if (code.startsWith('extraction-')) return 'governance.error.extraction'
  return 'governance.error.generic'
}

/** Plain props for the profile-memory governance center. */
export interface MemoryGovernanceProps extends MemoryActions {
  readonly onDraftConversation?: (draft: string) => void
  readonly t: (key: MindGardenKey) => string
}

/** Render candidate review, conflict decisions, active memory, provenance, and audit. */
export function MemoryGovernance({
  onListMemories,
  onProposeMemory,
  onConfirmMemory,
  onUpdateMemory,
  onRejectMemory,
  onResolveMemoryRelationship,
  onListMemoryRevisions,
  onExtractMemories,
  onLatestMemoryExtraction,
  onMemoryAutomationPolicy,
  onSetMemoryAutomationPolicy,
  onDeleteMemory,
  onLatestMemoryAudit,
  onDraftConversation = () => undefined,
  t,
}: MemoryGovernanceProps) {
  const [items, setItems] = useState<readonly MindGardenMemoryItem[]>([])
  const [extraction, setExtraction] = useState<MindGardenMemoryExtractionRun | null>(null)
  const [automation, setAutomation] = useState<MindGardenMemoryAutomationPolicy | null>(null)
  const [audit, setAudit] = useState<MindGardenMemoryRetrievalAudit | null>(null)
  const [draft, setDraft] = useState<MemoryDraft>(emptyDraft)
  const [reviewing, setReviewing] = useState<MindGardenMemoryItem | null>(null)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewScope, setReviewScope] = useState('')
  const [reviewPolicy, setReviewPolicy] = useState<MindGardenMemoryRecallPolicy>('relevant')
  const [reviewDays, setReviewDays] = useState('')
  const [editing, setEditing] = useState<MindGardenMemoryItem | null>(null)
  const [editDraft, setEditDraft] = useState<MemoryDraft>(emptyDraft)
  const [editPolicy, setEditPolicy] = useState<MindGardenMemoryRecallPolicy>('never')
  const [revisions, setRevisions] = useState<Record<string, readonly MindGardenMemoryRevision[]>>({})
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<MindGardenKey | null>(null)
  const [notice, setNotice] = useState<MindGardenKey | null>(null)
  const requestRef = useRef(0)
  const pendingRef = useRef(false)

  const refresh = useCallback(async () => {
    const request = ++requestRef.current
    const [listed, latest, recalled, automated] = await Promise.allSettled([
      onListMemories(),
      onLatestMemoryExtraction(),
      onLatestMemoryAudit(),
      onMemoryAutomationPolicy(),
    ])
    if (request !== requestRef.current) return
    if (listed.status === 'rejected' || !listed.value.ok) {
      setError('governance.error.load')
      setLoading(false)
      return
    }
    setItems(listed.value.value)
    setExtraction(latest.status === 'fulfilled' && latest.value.ok ? latest.value.value : null)
    setAudit(recalled.status === 'fulfilled' && recalled.value.ok ? recalled.value.value : null)
    setAutomation(automated.status === 'fulfilled' && automated.value.ok ? automated.value.value : null)
    setError(null)
    setLoading(false)
  }, [onLatestMemoryAudit, onLatestMemoryExtraction, onListMemories, onMemoryAutomationPolicy])

  useEffect(() => {
    void refresh()
    return () => { requestRef.current++ }
  }, [refresh])

  async function mutate<T>(
    operation: () => Promise<{ readonly ok: true; readonly value: T } | { readonly ok: false; readonly code: string }>,
    success: MindGardenKey,
  ): Promise<T | null> {
    if (pendingRef.current) return null
    pendingRef.current = true
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      const result = await operation()
      if (!result.ok) {
        setError(errorKey(result.code))
        if (result.code === 'version-conflict'
          || result.code === 'relationship-stale'
          || result.code === 'automation-version-conflict') await refresh()
        return null
      }
      await refresh()
      setNotice(success)
      return result.value
    } catch {
      setError('governance.error.generic')
      return null
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  function beginReview(item: MindGardenMemoryItem) {
    setReviewing(item)
    setReviewContent(item.content)
    setReviewScope(item.scope ?? '')
    setReviewPolicy(item.sensitivity === 'high' ? 'never' : 'relevant')
    setReviewDays('')
    setDeleteArmed(null)
    setNotice(null)
  }

  function beginEdit(item: MindGardenMemoryItem) {
    setEditing(item)
    setEditDraft({
      kind: item.kind,
      sensitivity: item.sensitivity,
      content: item.content,
      reason: item.reason,
      scope: item.scope ?? '',
    })
    setEditPolicy(item.recallPolicy)
    setDeleteArmed(null)
    setNotice(null)
  }

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.content.trim()
    const reason = draft.reason.trim()
    if (content === '' || reason === '') return
    const created = await mutate(() => onProposeMemory({
      kind: draft.kind,
      sensitivity: draft.sensitivity,
      content,
      reason,
      ...(draft.scope.trim() === '' ? {} : { scope: draft.scope.trim() }),
    }), 'governance.notice.proposed')
    if (created !== null) setDraft(emptyDraft)
  }

  async function confirmCandidate(item: MindGardenMemoryItem) {
    const days = temporaryDays(reviewDays)
    const confirmed = await mutate(() => onConfirmMemory(item, {
      recallPolicy: item.sensitivity === 'high' ? 'never' : reviewPolicy,
      content: reviewContent.trim(),
      scope: reviewScope.trim(),
      ...(days === undefined ? {} : { temporaryDays: days }),
    }), 'governance.notice.confirmed')
    if (confirmed !== null) setReviewing(null)
  }

  async function resolveCandidate(
    item: MindGardenMemoryItem,
    resolution: 'keep-existing' | 'keep-both' | 'replace-existing',
  ) {
    const days = temporaryDays(reviewDays)
    const policy = item.sensitivity === 'high' ? 'never' : reviewPolicy
    const request = resolution === 'keep-existing'
      ? { resolution } as const
      : {
        resolution,
        recallPolicy: policy,
        scope: reviewScope.trim(),
        ...(days === undefined ? {} : { temporaryDays: days }),
      } as const
    const result = await mutate(
      () => onResolveMemoryRelationship(item, request),
      'governance.notice.resolved',
    )
    if (result !== null) setReviewing(null)
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editing === null || editDraft.content.trim() === '' || editDraft.reason.trim() === '') return
    const updated = await mutate(() => onUpdateMemory(editing, {
      content: editDraft.content.trim(),
      reason: editDraft.reason.trim(),
      scope: editDraft.scope.trim(),
      sensitivity: editDraft.sensitivity,
      recallPolicy: editDraft.sensitivity === 'high' ? 'never' : editPolicy,
    }), 'governance.notice.updated')
    if (updated !== null) setEditing(null)
  }

  async function loadRevisions(item: MindGardenMemoryItem) {
    const id = String(item.id)
    if (revisions[id] !== undefined) {
      setRevisions((current) => {
        const next = { ...current }
        Reflect.deleteProperty(next, id)
        return next
      })
      return
    }
    setPending(true)
    setError(null)
    try {
      const result = await onListMemoryRevisions(item)
      if (!result.ok) {
        setError(errorKey(result.code))
        return
      }
      setRevisions(current => ({ ...current, [id]: result.value }))
    } catch {
      setError('governance.error.generic')
    } finally {
      setPending(false)
    }
  }

  async function remove(item: MindGardenMemoryItem) {
    const id = String(item.id)
    if (deleteArmed !== id) {
      setDeleteArmed(id)
      return
    }
    const deleted = await mutate(() => onDeleteMemory(item), 'governance.notice.deleted')
    if (deleted !== null) {
      setDeleteArmed(null)
      if (editing?.id === item.id) setEditing(null)
      if (reviewing?.id === item.id) setReviewing(null)
    }
  }

  async function saveAutomation(
    enabled: boolean,
    minimumCompletedTurns: MindGardenMemoryAutomationInterval,
  ) {
    if (automation === null) return
    await mutate(
      () => onSetMemoryAutomationPolicy(automation, enabled, minimumCompletedTurns),
      enabled ? 'governance.notice.automationEnabled' : 'governance.notice.automationDisabled',
    )
  }

  const candidates = items.filter(item => item.status === 'candidate')
  const active = items.filter(item => item.status === 'confirmed' || item.status === 'temporary')
  const history = items.filter(item => item.status === 'rejected' || item.status === 'superseded' || item.status === 'expired')
  const relationships = candidates.filter(item => item.relationship?.status === 'pending').length

  return (
    <section className={css.governance} data-mind-garden-memory-governance="active" aria-labelledby="mind-garden-governance-title">
      <header className={css.header} style={{ '--mg-memory-scene': `url("${MEMORY_ARCHIVE_ALCOVE_V3}")` } as CSSProperties}>
        <div>
          <h1 id="mind-garden-governance-title">{t('governance.title')}</h1>
          <p>{t('governance.subtitle')}</p>
        </div>
        <div className={css.counters} aria-label={t('governance.summary')}>
          <span><strong>{active.length}</strong>{t('governance.active')}</span>
          <span><strong>{candidates.length}</strong>{t('governance.candidates')}</span>
          <span><strong>{relationships}</strong>{t('governance.relationships')}</span>
        </div>
      </header>

      {notice !== null && <p className={shared.notice} role="status">{t(notice)}</p>}
      {error !== null && <p className={shared.error} role="alert">{t(error)}</p>}
      {loading ? <p className={shared.empty} role="status">{t('governance.loading')}</p> : (
        <>
          <section className={css.auditStrip} aria-label={t('governance.audit.title')}>
            <div>
              <IconDataOutline16 />
              <p><strong>{t('governance.audit.title')}</strong>{audit === null
                ? t('governance.audit.empty')
                : t(audit.sentToModel ? 'governance.audit.sent' : 'governance.audit.local')
                  .replace('{count}', String(audit.matches.length))}</p>
            </div>
            <div>
              <IconSparkle16 />
              <p><strong>{t('governance.extraction.title')}</strong>{extraction === null
                ? t('governance.extraction.empty')
                : `${t(`governance.extraction.trigger.${extraction.trigger}`)} · ${t(`governance.extraction.${extraction.status}`)
                  .replace('{count}', String(extraction.candidateIds.length))}`}</p>
            </div>
            <button className={shared.quietButton} type="button" disabled={pending} onClick={() => {
              void mutate(onExtractMemories, 'governance.notice.extracted')
            }}>{t('governance.extraction.run')}</button>
          </section>

          <section
            className={`${shared.panel} ${css.automation}`}
            data-memory-automation={automation?.enabled === true ? 'enabled' : 'disabled'}
            aria-labelledby="mind-garden-memory-automation-title"
          >
            <div className={css.automationLead}>
              <MemoryIcon size={18} />
              <div>
                <h3 id="mind-garden-memory-automation-title">{t('governance.automation.title')}</h3>
                <p>{t('governance.automation.subtitle')}</p>
              </div>
            </div>
            <label className={css.automationToggle}>
              <input
                type="checkbox"
                checked={automation?.enabled ?? false}
                disabled={pending || automation === null}
                onChange={(event) => {
                  void saveAutomation(event.target.checked, automation?.minimumCompletedTurns ?? 3)
                }}
              />
              <span aria-hidden="true" />
              <strong>{t(automation?.enabled === true
                ? 'governance.automation.enabled'
                : 'governance.automation.disabled')}</strong>
            </label>
            <div className={css.automationControls}>
              <label>{t('governance.automation.interval')}
                <select
                  value={automation?.minimumCompletedTurns ?? 3}
                  disabled={pending || automation === null}
                  onChange={(event) => {
                    void saveAutomation(
                      automation?.enabled ?? false,
                      Number(event.target.value) as MindGardenMemoryAutomationInterval,
                    )
                  }}
                >
                  {AUTOMATION_INTERVALS.map(interval => <option key={interval} value={interval}>{t(`governance.automation.interval.${interval}`)}</option>)}
                </select>
              </label>
              <div className={css.automationStatus}>
                <span>{t('governance.automation.status')}</span>
                <strong>{automation === null
                  ? t('governance.automation.unavailable')
                  : t(`governance.automation.outcome.${automation.lastOutcome ?? 'never'}`)}</strong>
                {automation?.lastAttemptAt !== null && automation?.lastAttemptAt !== undefined
                  && <small>{dateOf(automation.lastAttemptAt)}</small>}
              </div>
            </div>
            <ul className={css.automationDisclosure}>
              <li>{t('governance.automation.disclosure.model')}</li>
              <li>{t('governance.automation.disclosure.candidates')}</li>
              <li>{t('governance.automation.disclosure.safety')}</li>
            </ul>
          </section>

          <form className={`${shared.panel} ${css.proposal}`} onSubmit={(event) => { void submitProposal(event) }}>
            <div className={css.sectionHeading}>
              <div><IconPlusOutline16 /><h3>{t('governance.propose.title')}</h3></div>
              <p>{t('governance.propose.subtitle')}</p>
            </div>
            <div className={css.proposalGrid}>
              <label>{t('governance.kind')}<select value={draft.kind} onChange={(event) => { setDraft(current => ({ ...current, kind: event.target.value as MindGardenMemoryKind })) }}>{KINDS.map(kind => <option key={kind} value={kind}>{t(`governance.kind.${kind}`)}</option>)}</select></label>
              <label>{t('governance.sensitivity')}<select value={draft.sensitivity} onChange={(event) => { setDraft(current => ({ ...current, sensitivity: event.target.value as MindGardenMemorySensitivity })) }}><option value="normal">{t('governance.sensitivity.normal')}</option><option value="high">{t('governance.sensitivity.high')}</option></select></label>
              <label className={css.wide}>{t('governance.content')}<textarea value={draft.content} maxLength={2_000} onChange={(event) => { setDraft(current => ({ ...current, content: event.target.value })) }} placeholder={t('governance.content.placeholder')} /></label>
              <label>{t('governance.reason')}<input value={draft.reason} maxLength={500} onChange={(event) => { setDraft(current => ({ ...current, reason: event.target.value })) }} placeholder={t('governance.reason.placeholder')} /></label>
              <label>{t('governance.scope')}<input value={draft.scope} maxLength={300} onChange={(event) => { setDraft(current => ({ ...current, scope: event.target.value })) }} placeholder={t('governance.scope.placeholder')} /></label>
            </div>
            <div className={css.formFooter}><span>{t('governance.propose.hint')}</span><button className={shared.button} type="submit" disabled={pending || draft.content.trim() === '' || draft.reason.trim() === ''}>{t('governance.propose.save')}</button></div>
          </form>

          <section className={css.section} aria-labelledby="mind-garden-candidates-title">
            <div className={css.sectionHeading}><div><IconQueueOutline14 /><h3 id="mind-garden-candidates-title">{t('governance.queue.title')}</h3></div><p>{t('governance.queue.subtitle')}</p></div>
            {candidates.length === 0 ? <p className={shared.empty}>{t('governance.queue.empty')}</p> : (
              <div className={css.cardList}>{candidates.map((item) => {
                const target = item.relationship === undefined
                  ? undefined
                  : items.find(candidate => candidate.id === item.relationship?.targetMemoryId)
                const open = reviewing?.id === item.id
                return <article className={`${shared.panel} ${css.memoryCard}`} key={String(item.id)} data-relationship={item.relationship?.status ?? 'none'}>
                  <MemorySummary item={item} t={t} />
                  {item.relationship?.status === 'pending' && <div className={css.conflict}>
                    <strong>{t(`governance.relationship.${item.relationship.type}`)}</strong>
                    <p>{item.relationship.rationale}</p>
                    <div><blockquote><small>{t('governance.relationship.existing')}</small>{target?.content ?? t('governance.relationship.missing')}</blockquote><blockquote><small>{t('governance.relationship.incoming')}</small>{item.content}</blockquote></div>
                  </div>}
                  <div className={css.actions}><button className={shared.button} type="button" disabled={pending} onClick={() => {
                    if (open) setReviewing(null)
                    else beginReview(item)
                  }}>{open ? t('governance.review.close') : t('governance.review.open')}</button></div>
                  {open && <div className={css.reviewPanel}>
                    <label>{t('governance.content')}<textarea value={reviewContent} onChange={(event) => { setReviewContent(event.target.value) }} disabled={item.relationship?.status === 'pending'} /></label>
                    <label>{t('governance.scope')}<input value={reviewScope} onChange={(event) => { setReviewScope(event.target.value) }} /></label>
                    <div className={css.policyRow}>
                      <label>{t('governance.recall')}<select value={reviewPolicy} disabled={item.sensitivity === 'high'} onChange={(event) => { setReviewPolicy(event.target.value as MindGardenMemoryRecallPolicy) }}>{POLICIES.map(policy => <option key={policy} value={policy}>{t(`governance.recall.${policy}`)}</option>)}</select></label>
                      <label>{t('governance.temporary')}<input type="number" min="1" max="365" value={reviewDays} onChange={(event) => { setReviewDays(event.target.value) }} placeholder={t('governance.temporary.placeholder')} /></label>
                    </div>
                    {item.relationship?.status === 'pending' ? <div className={css.decisionActions}>
                      <button type="button" disabled={pending} onClick={() => { void resolveCandidate(item, 'keep-existing') }}>{t('governance.relationship.keepExisting')}</button>
                      <button type="button" disabled={pending} onClick={() => { void resolveCandidate(item, 'keep-both') }}>{t('governance.relationship.keepBoth')}</button>
                      <button className={shared.button} type="button" disabled={pending} onClick={() => { void resolveCandidate(item, 'replace-existing') }}>{t('governance.relationship.replace')}</button>
                    </div> : <div className={css.decisionActions}>
                      <button type="button" disabled={pending} onClick={() => {
                        void mutate(() => onRejectMemory(item), 'governance.notice.rejected').then((value) => {
                          if (value !== null) setReviewing(null)
                        })
                      }}>{t('governance.reject')}</button>
                      <button className={shared.button} type="button" disabled={pending || reviewContent.trim() === ''} onClick={() => { void confirmCandidate(item) }}>{t('governance.confirm')}</button>
                    </div>}
                  </div>}
                </article>
              })}</div>
            )}
          </section>

          <section className={css.section} aria-labelledby="mind-garden-active-memory-title">
            <div className={css.sectionHeading}><div><MemoryIcon size={16} /><h3 id="mind-garden-active-memory-title">{t('governance.library.title')}</h3></div><p>{t('governance.library.subtitle')}</p></div>
            {active.length === 0 ? <p className={shared.empty}>{t('governance.library.empty')}</p> : (
              <div className={css.cardList}>{active.map((item) => {
                const itemRevisions = revisions[String(item.id)]
                const isEditing = editing?.id === item.id
                return <article className={`${shared.panel} ${css.memoryCard}`} key={String(item.id)}>
                  <MemorySummary item={item} t={t} />
                  <MemorySources item={item} t={t} />
                  <div className={css.actions}>
                    <button type="button" onClick={() => {
                      onDraftConversation(t('governance.draft.template').replace('{content}', item.content))
                      setNotice('governance.notice.drafted')
                    }}><IconSendOutline14 />{t('governance.continue')}</button>
                    <button type="button" disabled={pending} onClick={() => { void loadRevisions(item) }}>{itemRevisions === undefined ? t('governance.history.open') : t('governance.history.close')}</button>
                    <button type="button" disabled={pending} onClick={() => {
                      if (isEditing) setEditing(null)
                      else beginEdit(item)
                    }}>{isEditing ? t('governance.edit.close') : t('governance.edit.open')}</button>
                    <button className={shared.dangerButton} type="button" disabled={pending} onClick={() => { void remove(item) }}>{deleteArmed === String(item.id) ? t('governance.delete.confirm') : t('governance.delete')}</button>
                  </div>
                  {itemRevisions !== undefined && <RevisionList revisions={itemRevisions} t={t} />}
                  {isEditing && <form className={css.reviewPanel} onSubmit={(event) => { void saveEdit(event) }}>
                    <label>{t('governance.content')}<textarea value={editDraft.content} onChange={(event) => { setEditDraft(current => ({ ...current, content: event.target.value })) }} /></label>
                    <label>{t('governance.reason')}<input value={editDraft.reason} onChange={(event) => { setEditDraft(current => ({ ...current, reason: event.target.value })) }} /></label>
                    <label>{t('governance.scope')}<input value={editDraft.scope} onChange={(event) => { setEditDraft(current => ({ ...current, scope: event.target.value })) }} /></label>
                    <div className={css.policyRow}>
                      <label>{t('governance.sensitivity')}<select value={editDraft.sensitivity} onChange={(event) => { const sensitivity = event.target.value as MindGardenMemorySensitivity; setEditDraft(current => ({ ...current, sensitivity })); if (sensitivity === 'high') setEditPolicy('never') }}><option value="normal">{t('governance.sensitivity.normal')}</option><option value="high">{t('governance.sensitivity.high')}</option></select></label>
                      <label>{t('governance.recall')}<select value={editPolicy} disabled={editDraft.sensitivity === 'high'} onChange={(event) => { setEditPolicy(event.target.value as MindGardenMemoryRecallPolicy) }}>{POLICIES.map(policy => <option key={policy} value={policy}>{t(`governance.recall.${policy}`)}</option>)}</select></label>
                    </div>
                    <div className={css.decisionActions}><button className={shared.button} type="submit" disabled={pending || editDraft.content.trim() === '' || editDraft.reason.trim() === ''}>{t('governance.edit.save')}</button></div>
                  </form>}
                </article>
              })}</div>
            )}
          </section>

          {history.length > 0 && <details className={css.archive}>
            <summary>{t('governance.archive.title').replace('{count}', String(history.length))}</summary>
            <div className={css.cardList}>{history.map((item) => {
              const itemRevisions = revisions[String(item.id)]
              return <article className={`${shared.panel} ${css.memoryCard}`} key={String(item.id)}>
                <MemorySummary item={item} t={t} />
                <MemorySources item={item} t={t} />
                <div className={css.actions}>
                  <button type="button" disabled={pending} onClick={() => { void loadRevisions(item) }}>{itemRevisions === undefined ? t('governance.history.open') : t('governance.history.close')}</button>
                  <button className={shared.dangerButton} type="button" disabled={pending} onClick={() => { void remove(item) }}>{deleteArmed === String(item.id) ? t('governance.delete.confirm') : t('governance.delete')}</button>
                </div>
                {itemRevisions !== undefined && <RevisionList revisions={itemRevisions} t={t} />}
              </article>
            })}</div>
          </details>}
        </>
      )}
    </section>
  )
}

function MemorySummary({ item, t }: { readonly item: MindGardenMemoryItem; readonly t: (key: MindGardenKey) => string }) {
  return <div className={css.summary}>
    <div className={css.meta}><span>{t(`governance.status.${item.status}`)}</span><span>{t(`governance.kind.${item.kind}`)}</span><span>{t(`governance.sensitivity.${item.sensitivity}`)}</span><time dateTime={dateOf(item.updatedAt)}>{dateOf(item.updatedAt)}</time></div>
    <p>{item.content}</p>
    <small>{item.reason}</small>
    {item.scope !== undefined && <blockquote>{t('governance.scope.label')}{item.scope}</blockquote>}
    <div className={css.recallBadge}>{t(`governance.recall.${item.recallPolicy}`)}{item.status === 'temporary' && item.expiresAt !== undefined ? ` · ${t('governance.expires').replace('{date}', dateOf(item.expiresAt))}` : ''}</div>
  </div>
}

function MemorySources({ item, t }: { readonly item: MindGardenMemoryItem; readonly t: (key: MindGardenKey) => string }) {
  return <details className={css.sources}><summary>{t('governance.sources').replace('{count}', String(item.sources.length))}</summary>{item.sources.map((source, index) => <div key={`${String(source.sessionId)}:${index}`}><span>{String(source.sessionId).slice(0, 12)}</span>{source.evidenceQuote !== undefined && <blockquote>{source.evidenceQuote}</blockquote>}</div>)}</details>
}

function RevisionList({
  revisions,
  t,
}: {
  readonly revisions: readonly MindGardenMemoryRevision[]
  readonly t: (key: MindGardenKey) => string
}) {
  return <div className={css.revisions}>{revisions.length === 0 ? <p>{t('governance.history.empty')}</p> : revisions.map(revision => <article key={String(revision.id)}><div><strong>{t(`governance.revision.${revision.action}`)}</strong><time dateTime={dateOf(revision.createdAt)}>{dateOf(revision.createdAt)}</time></div><p>{revision.content}</p><small>{t(`governance.recall.${revision.recallPolicy}`)}</small></article>)}</div>
}
