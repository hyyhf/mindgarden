import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Private profile archive controls inside the Mind Garden settings instrument. */
import { useRef, useState } from 'react';
import { IconCheckOutline16, IconDataOutline16, IconDownloadOutline16, IconFolderOpenOutline16, IconRefreshOutline16, IconWarningOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './GardenPortabilityPanel.module.css';
function decodeBase64(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
}
/** Hand already encrypted package bytes to the browser's native download flow. */
export function downloadMindGardenBackup(value) {
    const bytes = decodeBase64(value.data);
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const url = URL.createObjectURL(new Blob([copy.buffer], { type: value.mediaType }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = value.filename;
    anchor.rel = 'noopener';
    anchor.click();
    setTimeout(() => { URL.revokeObjectURL(url); }, 0);
}
function codePointLength(value) {
    return Array.from(value).length;
}
function errorKey(code) {
    if (code === 'invalid-passphrase')
        return 'backup.error.passphrase';
    if (code === 'backup-too-large')
        return 'backup.error.size';
    if (code === 'attachment-unavailable')
        return 'backup.error.attachment';
    if (code === 'vault-unavailable')
        return 'backup.error.vault';
    return 'backup.error.generic';
}
function rotationErrorKey(code) {
    if (code === 'rotation-unavailable')
        return 'rotation.error.credentials';
    if (code === 'vault-unavailable')
        return 'rotation.error.vault';
    return 'rotation.error.generic';
}
function restoreErrorKey(code) {
    if (code === 'invalid-passphrase')
        return 'restore.error.passphrase';
    if (code === 'invalid-backup')
        return 'restore.error.invalid';
    if (code === 'backup-too-large')
        return 'restore.error.size';
    if (code === 'attachment-unavailable')
        return 'restore.error.attachment';
    if (code === 'vault-unavailable')
        return 'restore.error.vault';
    return 'restore.error.generic';
}
function formatBytes(value) {
    if (value < 1024)
        return `${String(value)} B`;
    if (value < 1024 * 1024)
        return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
function totalRecords(counts) {
    return counts.memories + counts.reflections + counts.media + counts.stars;
}
/** Render the passphrase ceremony and whole-profile encrypted download. */
export function GardenPortabilityPanel({ t, onExportBackup, onInspectBackup, onRestoreBackup, onRotateVaultKey, onRestoreSuccess = () => undefined, }) {
    const [passphrase, setPassphrase] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [state, setState] = useState({ kind: 'idle' });
    const [rotation, setRotation] = useState({ kind: 'idle' });
    const [restoreFile, setRestoreFile] = useState(null);
    const [restorePassphrase, setRestorePassphrase] = useState('');
    const [restore, setRestore] = useState({ kind: 'idle' });
    const restoreInputRef = useRef(null);
    const validLength = codePointLength(passphrase) >= 12;
    const matches = passphrase === confirmation;
    const ready = validLength && matches && state.kind !== 'working';
    const submit = async (event) => {
        event.preventDefault();
        if (!ready)
            return;
        setState({ kind: 'working' });
        const result = await onExportBackup(passphrase);
        if (!result.ok) {
            setState({ kind: 'error', key: errorKey(result.code) });
            return;
        }
        try {
            downloadMindGardenBackup(result.value);
            setPassphrase('');
            setConfirmation('');
            setState({ kind: 'success', value: result.value });
        }
        catch {
            setState({ kind: 'error', key: 'backup.error.download' });
        }
    };
    const rotate = async () => {
        setRotation({ kind: 'working' });
        const result = await onRotateVaultKey();
        setRotation(result.ok
            ? { kind: 'success', value: result.value }
            : { kind: 'error', key: rotationErrorKey(result.code) });
    };
    const inspectRestore = async () => {
        if (restoreFile === null || codePointLength(restorePassphrase) < 8)
            return;
        setRestore({ kind: 'inspecting' });
        const result = await onInspectBackup(restoreFile, restorePassphrase);
        setRestore(result.ok
            ? { kind: 'preview', value: result.value }
            : { kind: 'error', code: result.code, key: restoreErrorKey(result.code) });
    };
    const commitRestore = async () => {
        if (restoreFile === null || restore.kind !== 'preview')
            return;
        const preview = restore.value;
        setRestore({ kind: 'restoring', value: preview });
        const result = await onRestoreBackup(restoreFile, restorePassphrase);
        if (!result.ok) {
            setRestore({ kind: 'error', code: result.code, key: restoreErrorKey(result.code) });
            return;
        }
        setRestorePassphrase('');
        setRestoreFile(null);
        if (restoreInputRef.current !== null)
            restoreInputRef.current.value = '';
        setRestore({ kind: 'success', value: result.value });
        onRestoreSuccess();
    };
    const cancelRestore = () => {
        setRestore({ kind: 'idle' });
    };
    return (_jsxs("section", { className: css.archive, "aria-labelledby": "mind-garden-archive-title", children: [_jsxs("div", { className: css.instrument, "aria-hidden": "true", children: [_jsx("span", { className: css.instrumentTicks }), _jsx("span", { className: css.instrumentCore, children: _jsx(IconDataOutline16, { size: 18 }) })] }), _jsxs("div", { className: css.intro, children: [_jsx("h3", { id: "mind-garden-archive-title", children: t('backup.title') }), _jsx("p", { children: t('backup.body') }), _jsxs("div", { className: css.assurances, "aria-label": t('backup.assurances'), children: [_jsx("span", { children: t('backup.assurance.records') }), _jsx("span", { children: t('backup.assurance.photos') }), _jsx("span", { children: t('backup.assurance.secret') })] })] }), _jsxs("form", { className: css.form, onSubmit: (event) => { void submit(event); }, children: [_jsxs("label", { children: [_jsx("span", { children: t('backup.passphrase') }), _jsx("input", { type: "password", autoComplete: "new-password", value: passphrase, onChange: (event) => { setPassphrase(event.target.value); setState({ kind: 'idle' }); }, placeholder: t('backup.passphrase.placeholder'), disabled: state.kind === 'working' })] }), _jsxs("label", { children: [_jsx("span", { children: t('backup.confirm') }), _jsx("input", { type: "password", autoComplete: "new-password", value: confirmation, onChange: (event) => { setConfirmation(event.target.value); setState({ kind: 'idle' }); }, placeholder: t('backup.confirm.placeholder'), disabled: state.kind === 'working' })] }), _jsxs("div", { className: css.formFooter, children: [_jsx("p", { className: !matches && confirmation.length > 0 ? css.validationError : undefined, children: !validLength && passphrase.length > 0
                                    ? t('backup.hint.length')
                                    : !matches && confirmation.length > 0
                                        ? t('backup.hint.match')
                                        : t('backup.hint') }), _jsxs("button", { type: "submit", disabled: !ready, children: [_jsx(IconDownloadOutline16, { size: 16 }), state.kind === 'working' ? t('backup.working') : t('backup.action')] })] })] }), _jsxs("div", { className: css.status, "aria-live": "polite", children: [state.kind === 'success' && (_jsxs("p", { children: [_jsx("strong", { children: t('backup.success') }), _jsxs("span", { children: [formatBytes(state.value.bytes), " \u00B7 ", state.value.filename] })] })), state.kind === 'error' && _jsxs("p", { className: css.error, children: [_jsx("strong", { children: t('backup.failed') }), _jsx("span", { children: t(state.key) })] })] }), _jsxs("div", { className: css.recoveryBay, children: [_jsx("span", { className: css.recoverySeal, "aria-hidden": "true", children: _jsx(IconFolderOpenOutline16, { size: 16 }) }), _jsxs("div", { className: css.recoveryCopy, children: [_jsx("h4", { children: t('restore.title') }), _jsx("p", { children: t('restore.body') })] }), _jsxs("div", { className: css.recoveryControls, children: [_jsx("input", { ref: restoreInputRef, className: css.fileInput, type: "file", accept: ".mgarden,application/vnd.deepseek-harness.mind-garden-backup", "aria-label": t('restore.file'), disabled: restore.kind === 'inspecting' || restore.kind === 'restoring', onChange: (event) => {
                                    setRestoreFile(event.target.files?.[0] ?? null);
                                    setRestore({ kind: 'idle' });
                                } }), _jsxs("button", { type: "button", className: css.fileButton, disabled: restore.kind === 'inspecting' || restore.kind === 'restoring', onClick: () => { restoreInputRef.current?.click(); }, children: [_jsx(IconFolderOpenOutline16, { size: 15 }), t('restore.file.action')] }), _jsx("span", { className: css.fileName, children: restoreFile?.name ?? t('restore.file.empty') }), _jsxs("label", { className: css.restoreSecret, children: [_jsx("span", { children: t('restore.passphrase') }), _jsx("input", { type: "password", autoComplete: "current-password", value: restorePassphrase, placeholder: t('restore.passphrase.placeholder'), disabled: restore.kind === 'inspecting' || restore.kind === 'restoring', onChange: (event) => {
                                            setRestorePassphrase(event.target.value);
                                            setRestore({ kind: 'idle' });
                                        } })] }), _jsxs("button", { type: "button", className: css.inspectButton, disabled: restoreFile === null
                                    || codePointLength(restorePassphrase) < 8
                                    || restore.kind === 'inspecting'
                                    || restore.kind === 'restoring', onClick: () => { void inspectRestore(); }, children: [_jsx(IconDataOutline16, { size: 15 }), restore.kind === 'inspecting' ? t('restore.inspecting') : t('restore.inspect')] })] }), (restore.kind === 'preview' || restore.kind === 'restoring') && (_jsxs("div", { className: css.restorePreview, "aria-live": "polite", children: [_jsxs("div", { className: css.previewHeading, children: [_jsxs("span", { children: [_jsx(IconCheckOutline16, { size: 15 }), t(restore.value.sourceFormat === 'fun-garden-v1'
                                                ? 'restore.preview.legacy'
                                                : 'restore.preview.ready')] }), _jsx("time", { dateTime: new Date(restore.value.archiveCreatedAt).toISOString(), children: new Date(restore.value.archiveCreatedAt).toLocaleString() })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: t('restore.preview.add') }), _jsx("dd", { children: String(totalRecords(restore.value.willAdd)) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('restore.preview.keep') }), _jsx("dd", { children: String(totalRecords(restore.value.willKeep)) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('restore.preview.photos') }), _jsx("dd", { children: String(restore.value.records.attachments) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('restore.preview.size') }), _jsx("dd", { children: formatBytes(restore.value.bytes) })] })] }), _jsxs("p", { children: [_jsx(IconWarningOutline16, { size: 14 }), t(restore.value.scope === 'legacy-private-profile'
                                        ? 'restore.preview.legacy.rule'
                                        : 'restore.preview.rule')] }), _jsxs("div", { className: css.restoreActions, children: [_jsx("button", { type: "button", onClick: cancelRestore, disabled: restore.kind === 'restoring', children: t('restore.cancel') }), _jsxs("button", { type: "button", className: css.restoreConfirm, disabled: restore.kind === 'restoring', onClick: () => { void commitRestore(); }, children: [_jsx(IconCheckOutline16, { size: 15 }), restore.kind === 'restoring' ? t('restore.working') : t('restore.action')] })] })] })), restore.kind === 'success' && (_jsxs("div", { className: css.restoreReceipt, role: "status", children: [_jsx(IconCheckOutline16, { size: 16 }), _jsxs("span", { children: [_jsx("strong", { children: t('restore.success') }), t(restore.value.scope === 'legacy-private-profile'
                                        ? 'restore.success.legacy.body'
                                        : 'restore.success.body')] }), _jsx("b", { children: String(totalRecords(restore.value.added)) })] })), restore.kind === 'error' && (_jsxs("p", { className: css.restoreError, role: "alert", "data-error-code": restore.code, children: [_jsx(IconWarningOutline16, { size: 14 }), t(restore.key)] }))] }), _jsxs("div", { className: css.rotationBay, children: [_jsx("span", { className: css.rotationSeal, "aria-hidden": "true", children: _jsx(IconRefreshOutline16, { size: 16 }) }), _jsxs("div", { className: css.rotationCopy, children: [_jsx("h4", { children: t('rotation.title') }), _jsx("p", { children: rotation.kind === 'confirming' ? t('rotation.confirm.body') : t('rotation.body') }), rotation.kind === 'success' && (_jsxs("span", { className: css.rotationReceipt, children: [t('rotation.success'), " \u00B7 ", String(rotation.value.records), " ", t('rotation.records'), ' · ', rotation.value.toKeyId.slice(0, 10), "\u2026"] })), rotation.kind === 'error' && _jsx("span", { className: css.rotationError, children: t(rotation.key) })] }), _jsx("div", { className: css.rotationActions, children: rotation.kind === 'confirming' ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.rotationCancel, onClick: () => { setRotation({ kind: 'idle' }); }, children: t('rotation.cancel') }), _jsxs("button", { type: "button", className: css.rotationConfirm, onClick: () => { void rotate(); }, children: [_jsx(IconRefreshOutline16, { size: 15 }), t('rotation.confirm.action')] })] })) : (_jsxs("button", { type: "button", className: css.rotationPrepare, disabled: rotation.kind === 'working', onClick: () => { setRotation({ kind: 'confirming' }); }, children: [_jsx(IconRefreshOutline16, { size: 15 }), rotation.kind === 'working' ? t('rotation.working') : t('rotation.action')] })) })] })] }));
}
//# sourceMappingURL=GardenPortabilityPanel.js.map