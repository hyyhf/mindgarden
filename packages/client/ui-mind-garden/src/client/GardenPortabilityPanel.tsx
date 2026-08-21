/** Private profile archive controls inside the Mind Garden settings instrument. */

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  IconCheckOutline16,
  IconDataOutline16,
  IconDownloadOutline16,
  IconFolderOpenOutline16,
  IconRefreshOutline16,
  IconWarningOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  MindGardenBackupExportValue,
  MindGardenBackupInspectValue,
  MindGardenBackupMergeCounts,
  MindGardenBackupRestoreValue,
  MindGardenKeyRotationValue,
} from '@deepseek-ai/dsh-mind-garden-portability/types'
import type { MindGardenDataResult } from './slots.ts'
import type { MindGardenKey } from './locales.ts'
import css from './GardenPortabilityPanel.module.css'

interface GardenPortabilityPanelProps {
  readonly t: (key: MindGardenKey) => string
  readonly onExportBackup: (
    passphrase: string,
  ) => Promise<MindGardenDataResult<MindGardenBackupExportValue>>
  readonly onInspectBackup: (
    file: File,
    passphrase: string,
  ) => Promise<MindGardenDataResult<MindGardenBackupInspectValue>>
  readonly onRestoreBackup: (
    file: File,
    passphrase: string,
  ) => Promise<MindGardenDataResult<MindGardenBackupRestoreValue>>
  readonly onRotateVaultKey: () => Promise<MindGardenDataResult<MindGardenKeyRotationValue>>
}

type ArchiveState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'working' }
  | { readonly kind: 'success'; readonly value: MindGardenBackupExportValue }
  | { readonly kind: 'error'; readonly key: MindGardenKey }

type RotationState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'confirming' }
  | { readonly kind: 'working' }
  | { readonly kind: 'success'; readonly value: MindGardenKeyRotationValue }
  | { readonly kind: 'error'; readonly key: MindGardenKey }

type RestoreState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'inspecting' }
  | { readonly kind: 'preview'; readonly value: MindGardenBackupInspectValue }
  | { readonly kind: 'restoring'; readonly value: MindGardenBackupInspectValue }
  | { readonly kind: 'success'; readonly value: MindGardenBackupRestoreValue }
  | { readonly kind: 'error'; readonly code: string; readonly key: MindGardenKey }

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value)
  return Uint8Array.from(binary, character => character.charCodeAt(0))
}

/** Hand already encrypted package bytes to the browser's native download flow. */
export function downloadMindGardenBackup(value: MindGardenBackupExportValue): void {
  const bytes = decodeBase64(value.data)
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const url = URL.createObjectURL(new Blob([copy.buffer], { type: value.mediaType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = value.filename
  anchor.rel = 'noopener'
  anchor.click()
  setTimeout(() => { URL.revokeObjectURL(url) }, 0)
}

function codePointLength(value: string): number {
  return Array.from(value).length
}

function errorKey(code: string): MindGardenKey {
  if (code === 'invalid-passphrase') return 'backup.error.passphrase'
  if (code === 'backup-too-large') return 'backup.error.size'
  if (code === 'attachment-unavailable') return 'backup.error.attachment'
  if (code === 'vault-unavailable') return 'backup.error.vault'
  return 'backup.error.generic'
}

function rotationErrorKey(code: string): MindGardenKey {
  if (code === 'rotation-unavailable') return 'rotation.error.credentials'
  if (code === 'vault-unavailable') return 'rotation.error.vault'
  return 'rotation.error.generic'
}

function restoreErrorKey(code: string): MindGardenKey {
  if (code === 'invalid-passphrase') return 'restore.error.passphrase'
  if (code === 'invalid-backup') return 'restore.error.invalid'
  if (code === 'backup-too-large') return 'restore.error.size'
  if (code === 'attachment-unavailable') return 'restore.error.attachment'
  if (code === 'vault-unavailable') return 'restore.error.vault'
  return 'restore.error.generic'
}

function formatBytes(value: number): string {
  if (value < 1024) return `${String(value)} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function totalRecords(counts: MindGardenBackupMergeCounts): number {
  return counts.memories + counts.reflections + counts.media + counts.stars
}

/** Render the passphrase ceremony and whole-profile encrypted download. */
export function GardenPortabilityPanel({
  t,
  onExportBackup,
  onInspectBackup,
  onRestoreBackup,
  onRotateVaultKey,
}: GardenPortabilityPanelProps) {
  const [passphrase, setPassphrase] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [state, setState] = useState<ArchiveState>({ kind: 'idle' })
  const [rotation, setRotation] = useState<RotationState>({ kind: 'idle' })
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const [restorePassphrase, setRestorePassphrase] = useState('')
  const [restore, setRestore] = useState<RestoreState>({ kind: 'idle' })
  const restoreInputRef = useRef<HTMLInputElement>(null)
  const validLength = codePointLength(passphrase) >= 12
  const matches = passphrase === confirmation
  const ready = validLength && matches && state.kind !== 'working'

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!ready) return
    setState({ kind: 'working' })
    const result = await onExportBackup(passphrase)
    if (!result.ok) {
      setState({ kind: 'error', key: errorKey(result.code) })
      return
    }
    try {
      downloadMindGardenBackup(result.value)
      setPassphrase('')
      setConfirmation('')
      setState({ kind: 'success', value: result.value })
    } catch {
      setState({ kind: 'error', key: 'backup.error.download' })
    }
  }

  const rotate = async () => {
    setRotation({ kind: 'working' })
    const result = await onRotateVaultKey()
    setRotation(result.ok
      ? { kind: 'success', value: result.value }
      : { kind: 'error', key: rotationErrorKey(result.code) })
  }

  const inspectRestore = async () => {
    if (restoreFile === null || codePointLength(restorePassphrase) < 8) return
    setRestore({ kind: 'inspecting' })
    const result = await onInspectBackup(restoreFile, restorePassphrase)
    setRestore(result.ok
      ? { kind: 'preview', value: result.value }
      : { kind: 'error', code: result.code, key: restoreErrorKey(result.code) })
  }

  const commitRestore = async () => {
    if (restoreFile === null || restore.kind !== 'preview') return
    const preview = restore.value
    setRestore({ kind: 'restoring', value: preview })
    const result = await onRestoreBackup(restoreFile, restorePassphrase)
    if (!result.ok) {
      setRestore({ kind: 'error', code: result.code, key: restoreErrorKey(result.code) })
      return
    }
    setRestorePassphrase('')
    setRestoreFile(null)
    if (restoreInputRef.current !== null) restoreInputRef.current.value = ''
    setRestore({ kind: 'success', value: result.value })
  }

  const cancelRestore = () => {
    setRestore({ kind: 'idle' })
  }

  return (
    <section className={css.archive} aria-labelledby="mind-garden-archive-title">
      <div className={css.instrument} aria-hidden="true">
        <span className={css.instrumentTicks} />
        <span className={css.instrumentCore}><IconDataOutline16 size={18} /></span>
      </div>
      <div className={css.intro}>
        <h3 id="mind-garden-archive-title">{t('backup.title')}</h3>
        <p>{t('backup.body')}</p>
        <div className={css.assurances} aria-label={t('backup.assurances')}>
          <span>{t('backup.assurance.records')}</span>
          <span>{t('backup.assurance.photos')}</span>
          <span>{t('backup.assurance.secret')}</span>
        </div>
      </div>

      <form className={css.form} onSubmit={(event) => { void submit(event) }}>
        <label>
          <span>{t('backup.passphrase')}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={passphrase}
            onChange={(event) => { setPassphrase(event.target.value); setState({ kind: 'idle' }) }}
            placeholder={t('backup.passphrase.placeholder')}
            disabled={state.kind === 'working'}
          />
        </label>
        <label>
          <span>{t('backup.confirm')}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => { setConfirmation(event.target.value); setState({ kind: 'idle' }) }}
            placeholder={t('backup.confirm.placeholder')}
            disabled={state.kind === 'working'}
          />
        </label>
        <div className={css.formFooter}>
          <p className={!matches && confirmation.length > 0 ? css.validationError : undefined}>
            {!validLength && passphrase.length > 0
              ? t('backup.hint.length')
              : !matches && confirmation.length > 0
                ? t('backup.hint.match')
                : t('backup.hint')}
          </p>
          <button type="submit" disabled={!ready}>
            <IconDownloadOutline16 size={16} />
            {state.kind === 'working' ? t('backup.working') : t('backup.action')}
          </button>
        </div>
      </form>

      <div className={css.status} aria-live="polite">
        {state.kind === 'success' && (
          <p><strong>{t('backup.success')}</strong><span>{formatBytes(state.value.bytes)} · {state.value.filename}</span></p>
        )}
        {state.kind === 'error' && <p className={css.error}><strong>{t('backup.failed')}</strong><span>{t(state.key)}</span></p>}
      </div>

      <div className={css.recoveryBay}>
        <span className={css.recoverySeal} aria-hidden="true"><IconFolderOpenOutline16 size={16} /></span>
        <div className={css.recoveryCopy}>
          <h4>{t('restore.title')}</h4>
          <p>{t('restore.body')}</p>
        </div>
        <div className={css.recoveryControls}>
          <input
            ref={restoreInputRef}
            className={css.fileInput}
            type="file"
            accept=".mgarden,application/vnd.deepseek-harness.mind-garden-backup"
            aria-label={t('restore.file')}
            disabled={restore.kind === 'inspecting' || restore.kind === 'restoring'}
            onChange={(event) => {
              setRestoreFile(event.target.files?.[0] ?? null)
              setRestore({ kind: 'idle' })
            }}
          />
          <button
            type="button"
            className={css.fileButton}
            disabled={restore.kind === 'inspecting' || restore.kind === 'restoring'}
            onClick={() => { restoreInputRef.current?.click() }}
          >
            <IconFolderOpenOutline16 size={15} />
            {t('restore.file.action')}
          </button>
          <span className={css.fileName}>{restoreFile?.name ?? t('restore.file.empty')}</span>
          <label className={css.restoreSecret}>
            <span>{t('restore.passphrase')}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={restorePassphrase}
              placeholder={t('restore.passphrase.placeholder')}
              disabled={restore.kind === 'inspecting' || restore.kind === 'restoring'}
              onChange={(event) => {
                setRestorePassphrase(event.target.value)
                setRestore({ kind: 'idle' })
              }}
            />
          </label>
          <button
            type="button"
            className={css.inspectButton}
            disabled={restoreFile === null
              || codePointLength(restorePassphrase) < 8
              || restore.kind === 'inspecting'
              || restore.kind === 'restoring'}
            onClick={() => { void inspectRestore() }}
          >
            <IconDataOutline16 size={15} />
            {restore.kind === 'inspecting' ? t('restore.inspecting') : t('restore.inspect')}
          </button>
        </div>

        {(restore.kind === 'preview' || restore.kind === 'restoring') && (
          <div className={css.restorePreview} aria-live="polite">
            <div className={css.previewHeading}>
              <span><IconCheckOutline16 size={15} />{t(
                restore.value.sourceFormat === 'fun-garden-v1'
                  ? 'restore.preview.legacy'
                  : 'restore.preview.ready',
              )}</span>
              <time dateTime={new Date(restore.value.archiveCreatedAt).toISOString()}>
                {new Date(restore.value.archiveCreatedAt).toLocaleString()}
              </time>
            </div>
            <dl>
              <div><dt>{t('restore.preview.add')}</dt><dd>{String(
                totalRecords(restore.value.willAdd),
              )}</dd></div>
              <div><dt>{t('restore.preview.keep')}</dt><dd>{String(
                totalRecords(restore.value.willKeep),
              )}</dd></div>
              <div><dt>{t('restore.preview.photos')}</dt><dd>{String(restore.value.records.attachments)}</dd></div>
              <div><dt>{t('restore.preview.size')}</dt><dd>{formatBytes(restore.value.bytes)}</dd></div>
            </dl>
            <p><IconWarningOutline16 size={14} />{t(
              restore.value.scope === 'legacy-private-profile'
                ? 'restore.preview.legacy.rule'
                : 'restore.preview.rule',
            )}</p>
            <div className={css.restoreActions}>
              <button type="button" onClick={cancelRestore} disabled={restore.kind === 'restoring'}>
                {t('restore.cancel')}
              </button>
              <button
                type="button"
                className={css.restoreConfirm}
                disabled={restore.kind === 'restoring'}
                onClick={() => { void commitRestore() }}
              >
                <IconCheckOutline16 size={15} />
                {restore.kind === 'restoring' ? t('restore.working') : t('restore.action')}
              </button>
            </div>
          </div>
        )}
        {restore.kind === 'success' && (
          <div className={css.restoreReceipt} role="status">
            <IconCheckOutline16 size={16} />
            <span><strong>{t('restore.success')}</strong>{t(
              restore.value.scope === 'legacy-private-profile'
                ? 'restore.success.legacy.body'
                : 'restore.success.body',
            )}</span>
            <b>{String(totalRecords(restore.value.added))}</b>
          </div>
        )}
        {restore.kind === 'error' && (
          <p className={css.restoreError} role="alert" data-error-code={restore.code}>
            <IconWarningOutline16 size={14} />{t(restore.key)}
          </p>
        )}
      </div>

      <div className={css.rotationBay}>
        <span className={css.rotationSeal} aria-hidden="true"><IconRefreshOutline16 size={16} /></span>
        <div className={css.rotationCopy}>
          <h4>{t('rotation.title')}</h4>
          <p>{rotation.kind === 'confirming' ? t('rotation.confirm.body') : t('rotation.body')}</p>
          {rotation.kind === 'success' && (
            <span className={css.rotationReceipt}>
              {t('rotation.success')} · {String(rotation.value.records)} {t('rotation.records')}
              {' · '}{rotation.value.toKeyId.slice(0, 10)}…
            </span>
          )}
          {rotation.kind === 'error' && <span className={css.rotationError}>{t(rotation.key)}</span>}
        </div>
        <div className={css.rotationActions}>
          {rotation.kind === 'confirming' ? (
            <>
              <button type="button" className={css.rotationCancel} onClick={() => { setRotation({ kind: 'idle' }) }}>
                {t('rotation.cancel')}
              </button>
              <button type="button" className={css.rotationConfirm} onClick={() => { void rotate() }}>
                <IconRefreshOutline16 size={15} />
                {t('rotation.confirm.action')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={css.rotationPrepare}
              disabled={rotation.kind === 'working'}
              onClick={() => { setRotation({ kind: 'confirming' }) }}
            >
              <IconRefreshOutline16 size={15} />
              {rotation.kind === 'working' ? t('rotation.working') : t('rotation.action')}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
