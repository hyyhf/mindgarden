import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** User-authoritative review and lifecycle controls for governed memory. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconDataOutline16, IconPlusOutline16, IconQueueOutline14, IconSendOutline14, IconSparkle16, } from '@deepseek-ai/dsh-client-ui-primitives';
import shared from './GardenSpace.module.css';
import css from './MemoryGovernance.module.css';
import { MemoryIcon } from "../GardenIcons.js";
const KINDS = [
    'fact', 'preference', 'value', 'support-preference', 'decision', 'emotion', 'episode',
];
const POLICIES = ['never', 'relevant', 'always'];
const AUTOMATION_INTERVALS = [1, 3, 5];
const emptyDraft = {
    kind: 'fact',
    sensitivity: 'normal',
    content: '',
    reason: '',
    scope: '',
};
function dateOf(value) {
    return new Date(value).toISOString().slice(0, 10);
}
function temporaryDays(value) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}
function errorKey(code) {
    if (code === 'version-conflict'
        || code === 'relationship-stale'
        || code === 'automation-version-conflict')
        return 'governance.error.stale';
    if (code === 'high-sensitivity-recall-forbidden')
        return 'governance.error.sensitive';
    if (code.startsWith('extraction-'))
        return 'governance.error.extraction';
    return 'governance.error.generic';
}
/** Render candidate review, conflict decisions, active memory, provenance, and audit. */
export function MemoryGovernance({ onListMemories, onProposeMemory, onConfirmMemory, onUpdateMemory, onRejectMemory, onResolveMemoryRelationship, onListMemoryRevisions, onExtractMemories, onLatestMemoryExtraction, onMemoryAutomationPolicy, onSetMemoryAutomationPolicy, onDeleteMemory, onLatestMemoryAudit, onDraftConversation = () => undefined, t, }) {
    const [items, setItems] = useState([]);
    const [extraction, setExtraction] = useState(null);
    const [automation, setAutomation] = useState(null);
    const [audit, setAudit] = useState(null);
    const [draft, setDraft] = useState(emptyDraft);
    const [reviewing, setReviewing] = useState(null);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewScope, setReviewScope] = useState('');
    const [reviewPolicy, setReviewPolicy] = useState('relevant');
    const [reviewDays, setReviewDays] = useState('');
    const [editing, setEditing] = useState(null);
    const [editDraft, setEditDraft] = useState(emptyDraft);
    const [editPolicy, setEditPolicy] = useState('never');
    const [revisions, setRevisions] = useState({});
    const [deleteArmed, setDeleteArmed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const requestRef = useRef(0);
    const pendingRef = useRef(false);
    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        const [listed, latest, recalled, automated] = await Promise.allSettled([
            onListMemories(),
            onLatestMemoryExtraction(),
            onLatestMemoryAudit(),
            onMemoryAutomationPolicy(),
        ]);
        if (request !== requestRef.current)
            return;
        if (listed.status === 'rejected' || !listed.value.ok) {
            setError('governance.error.load');
            setLoading(false);
            return;
        }
        setItems(listed.value.value);
        setExtraction(latest.status === 'fulfilled' && latest.value.ok ? latest.value.value : null);
        setAudit(recalled.status === 'fulfilled' && recalled.value.ok ? recalled.value.value : null);
        setAutomation(automated.status === 'fulfilled' && automated.value.ok ? automated.value.value : null);
        setError(null);
        setLoading(false);
    }, [onLatestMemoryAudit, onLatestMemoryExtraction, onListMemories, onMemoryAutomationPolicy]);
    useEffect(() => {
        void refresh();
        return () => { requestRef.current++; };
    }, [refresh]);
    async function mutate(operation, success) {
        if (pendingRef.current)
            return null;
        pendingRef.current = true;
        setPending(true);
        setError(null);
        setNotice(null);
        try {
            const result = await operation();
            if (!result.ok) {
                setError(errorKey(result.code));
                if (result.code === 'version-conflict'
                    || result.code === 'relationship-stale'
                    || result.code === 'automation-version-conflict')
                    await refresh();
                return null;
            }
            await refresh();
            setNotice(success);
            return result.value;
        }
        catch {
            setError('governance.error.generic');
            return null;
        }
        finally {
            pendingRef.current = false;
            setPending(false);
        }
    }
    function beginReview(item) {
        setReviewing(item);
        setReviewContent(item.content);
        setReviewScope(item.scope ?? '');
        setReviewPolicy(item.sensitivity === 'high' ? 'never' : 'relevant');
        setReviewDays('');
        setDeleteArmed(null);
        setNotice(null);
    }
    function beginEdit(item) {
        setEditing(item);
        setEditDraft({
            kind: item.kind,
            sensitivity: item.sensitivity,
            content: item.content,
            reason: item.reason,
            scope: item.scope ?? '',
        });
        setEditPolicy(item.recallPolicy);
        setDeleteArmed(null);
        setNotice(null);
    }
    async function submitProposal(event) {
        event.preventDefault();
        const content = draft.content.trim();
        const reason = draft.reason.trim();
        if (content === '' || reason === '')
            return;
        const created = await mutate(() => onProposeMemory({
            kind: draft.kind,
            sensitivity: draft.sensitivity,
            content,
            reason,
            ...(draft.scope.trim() === '' ? {} : { scope: draft.scope.trim() }),
        }), 'governance.notice.proposed');
        if (created !== null)
            setDraft(emptyDraft);
    }
    async function confirmCandidate(item) {
        const days = temporaryDays(reviewDays);
        const confirmed = await mutate(() => onConfirmMemory(item, {
            recallPolicy: item.sensitivity === 'high' ? 'never' : reviewPolicy,
            content: reviewContent.trim(),
            scope: reviewScope.trim(),
            ...(days === undefined ? {} : { temporaryDays: days }),
        }), 'governance.notice.confirmed');
        if (confirmed !== null)
            setReviewing(null);
    }
    async function resolveCandidate(item, resolution) {
        const days = temporaryDays(reviewDays);
        const policy = item.sensitivity === 'high' ? 'never' : reviewPolicy;
        const request = resolution === 'keep-existing'
            ? { resolution }
            : {
                resolution,
                recallPolicy: policy,
                scope: reviewScope.trim(),
                ...(days === undefined ? {} : { temporaryDays: days }),
            };
        const result = await mutate(() => onResolveMemoryRelationship(item, request), 'governance.notice.resolved');
        if (result !== null)
            setReviewing(null);
    }
    async function saveEdit(event) {
        event.preventDefault();
        if (editing === null || editDraft.content.trim() === '' || editDraft.reason.trim() === '')
            return;
        const updated = await mutate(() => onUpdateMemory(editing, {
            content: editDraft.content.trim(),
            reason: editDraft.reason.trim(),
            scope: editDraft.scope.trim(),
            sensitivity: editDraft.sensitivity,
            recallPolicy: editDraft.sensitivity === 'high' ? 'never' : editPolicy,
        }), 'governance.notice.updated');
        if (updated !== null)
            setEditing(null);
    }
    async function loadRevisions(item) {
        const id = String(item.id);
        if (revisions[id] !== undefined) {
            setRevisions((current) => {
                const next = { ...current };
                Reflect.deleteProperty(next, id);
                return next;
            });
            return;
        }
        setPending(true);
        setError(null);
        try {
            const result = await onListMemoryRevisions(item);
            if (!result.ok) {
                setError(errorKey(result.code));
                return;
            }
            setRevisions(current => ({ ...current, [id]: result.value }));
        }
        catch {
            setError('governance.error.generic');
        }
        finally {
            setPending(false);
        }
    }
    async function remove(item) {
        const id = String(item.id);
        if (deleteArmed !== id) {
            setDeleteArmed(id);
            return;
        }
        const deleted = await mutate(() => onDeleteMemory(item), 'governance.notice.deleted');
        if (deleted !== null) {
            setDeleteArmed(null);
            if (editing?.id === item.id)
                setEditing(null);
            if (reviewing?.id === item.id)
                setReviewing(null);
        }
    }
    async function saveAutomation(enabled, minimumCompletedTurns) {
        if (automation === null)
            return;
        await mutate(() => onSetMemoryAutomationPolicy(automation, enabled, minimumCompletedTurns), enabled ? 'governance.notice.automationEnabled' : 'governance.notice.automationDisabled');
    }
    const candidates = items.filter(item => item.status === 'candidate');
    const active = items.filter(item => item.status === 'confirmed' || item.status === 'temporary');
    const history = items.filter(item => item.status === 'rejected' || item.status === 'superseded' || item.status === 'expired');
    const relationships = candidates.filter(item => item.relationship?.status === 'pending').length;
    return (_jsxs("section", { className: css.governance, "data-mind-garden-memory-governance": "active", "aria-labelledby": "mind-garden-governance-title", children: [_jsxs("header", { className: css.header, children: [_jsxs("div", { children: [_jsx("span", { children: t('governance.eyebrow') }), _jsx("h2", { id: "mind-garden-governance-title", children: t('governance.title') }), _jsx("p", { children: t('governance.subtitle') })] }), _jsxs("div", { className: css.counters, "aria-label": t('governance.summary'), children: [_jsxs("span", { children: [_jsx("strong", { children: active.length }), t('governance.active')] }), _jsxs("span", { children: [_jsx("strong", { children: candidates.length }), t('governance.candidates')] }), _jsxs("span", { children: [_jsx("strong", { children: relationships }), t('governance.relationships')] })] })] }), notice !== null && _jsx("p", { className: shared.notice, role: "status", children: t(notice) }), error !== null && _jsx("p", { className: shared.error, role: "alert", children: t(error) }), loading ? _jsx("p", { className: shared.empty, role: "status", children: t('governance.loading') }) : (_jsxs(_Fragment, { children: [_jsxs("section", { className: css.auditStrip, "aria-label": t('governance.audit.title'), children: [_jsxs("div", { children: [_jsx(IconDataOutline16, {}), _jsxs("p", { children: [_jsx("strong", { children: t('governance.audit.title') }), audit === null
                                                ? t('governance.audit.empty')
                                                : t(audit.sentToModel ? 'governance.audit.sent' : 'governance.audit.local')
                                                    .replace('{count}', String(audit.matches.length))] })] }), _jsxs("div", { children: [_jsx(IconSparkle16, {}), _jsxs("p", { children: [_jsx("strong", { children: t('governance.extraction.title') }), extraction === null
                                                ? t('governance.extraction.empty')
                                                : `${t(`governance.extraction.trigger.${extraction.trigger}`)} · ${t(`governance.extraction.${extraction.status}`)
                                                    .replace('{count}', String(extraction.candidateIds.length))}`] })] }), _jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => {
                                    void mutate(onExtractMemories, 'governance.notice.extracted');
                                }, children: t('governance.extraction.run') })] }), _jsxs("section", { className: `${shared.panel} ${css.automation}`, "data-memory-automation": automation?.enabled === true ? 'enabled' : 'disabled', "aria-labelledby": "mind-garden-memory-automation-title", children: [_jsxs("div", { className: css.automationLead, children: [_jsx(MemoryIcon, { size: 18 }), _jsxs("div", { children: [_jsx("h3", { id: "mind-garden-memory-automation-title", children: t('governance.automation.title') }), _jsx("p", { children: t('governance.automation.subtitle') })] })] }), _jsxs("label", { className: css.automationToggle, children: [_jsx("input", { type: "checkbox", checked: automation?.enabled ?? false, disabled: pending || automation === null, onChange: (event) => {
                                            void saveAutomation(event.target.checked, automation?.minimumCompletedTurns ?? 3);
                                        } }), _jsx("span", { "aria-hidden": "true" }), _jsx("strong", { children: t(automation?.enabled === true
                                            ? 'governance.automation.enabled'
                                            : 'governance.automation.disabled') })] }), _jsxs("div", { className: css.automationControls, children: [_jsxs("label", { children: [t('governance.automation.interval'), _jsx("select", { value: automation?.minimumCompletedTurns ?? 3, disabled: pending || automation === null, onChange: (event) => {
                                                    void saveAutomation(automation?.enabled ?? false, Number(event.target.value));
                                                }, children: AUTOMATION_INTERVALS.map(interval => _jsx("option", { value: interval, children: t(`governance.automation.interval.${interval}`) }, interval)) })] }), _jsxs("div", { className: css.automationStatus, children: [_jsx("span", { children: t('governance.automation.status') }), _jsx("strong", { children: automation === null
                                                    ? t('governance.automation.unavailable')
                                                    : t(`governance.automation.outcome.${automation.lastOutcome ?? 'never'}`) }), automation?.lastAttemptAt !== null && automation?.lastAttemptAt !== undefined
                                                && _jsx("small", { children: dateOf(automation.lastAttemptAt) })] })] }), _jsxs("ul", { className: css.automationDisclosure, children: [_jsx("li", { children: t('governance.automation.disclosure.model') }), _jsx("li", { children: t('governance.automation.disclosure.candidates') }), _jsx("li", { children: t('governance.automation.disclosure.safety') })] })] }), _jsxs("form", { className: `${shared.panel} ${css.proposal}`, onSubmit: (event) => { void submitProposal(event); }, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx(IconPlusOutline16, {}), _jsx("h3", { children: t('governance.propose.title') })] }), _jsx("p", { children: t('governance.propose.subtitle') })] }), _jsxs("div", { className: css.proposalGrid, children: [_jsxs("label", { children: [t('governance.kind'), _jsx("select", { value: draft.kind, onChange: (event) => { setDraft(current => ({ ...current, kind: event.target.value })); }, children: KINDS.map(kind => _jsx("option", { value: kind, children: t(`governance.kind.${kind}`) }, kind)) })] }), _jsxs("label", { children: [t('governance.sensitivity'), _jsxs("select", { value: draft.sensitivity, onChange: (event) => { setDraft(current => ({ ...current, sensitivity: event.target.value })); }, children: [_jsx("option", { value: "normal", children: t('governance.sensitivity.normal') }), _jsx("option", { value: "high", children: t('governance.sensitivity.high') })] })] }), _jsxs("label", { className: css.wide, children: [t('governance.content'), _jsx("textarea", { value: draft.content, maxLength: 2_000, onChange: (event) => { setDraft(current => ({ ...current, content: event.target.value })); }, placeholder: t('governance.content.placeholder') })] }), _jsxs("label", { children: [t('governance.reason'), _jsx("input", { value: draft.reason, maxLength: 500, onChange: (event) => { setDraft(current => ({ ...current, reason: event.target.value })); }, placeholder: t('governance.reason.placeholder') })] }), _jsxs("label", { children: [t('governance.scope'), _jsx("input", { value: draft.scope, maxLength: 300, onChange: (event) => { setDraft(current => ({ ...current, scope: event.target.value })); }, placeholder: t('governance.scope.placeholder') })] })] }), _jsxs("div", { className: css.formFooter, children: [_jsx("span", { children: t('governance.propose.hint') }), _jsx("button", { className: shared.button, type: "submit", disabled: pending || draft.content.trim() === '' || draft.reason.trim() === '', children: t('governance.propose.save') })] })] }), _jsxs("section", { className: css.section, "aria-labelledby": "mind-garden-candidates-title", children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx(IconQueueOutline14, {}), _jsx("h3", { id: "mind-garden-candidates-title", children: t('governance.queue.title') })] }), _jsx("p", { children: t('governance.queue.subtitle') })] }), candidates.length === 0 ? _jsx("p", { className: shared.empty, children: t('governance.queue.empty') }) : (_jsx("div", { className: css.cardList, children: candidates.map((item) => {
                                    const target = item.relationship === undefined
                                        ? undefined
                                        : items.find(candidate => candidate.id === item.relationship?.targetMemoryId);
                                    const open = reviewing?.id === item.id;
                                    return _jsxs("article", { className: `${shared.panel} ${css.memoryCard}`, "data-relationship": item.relationship?.status ?? 'none', children: [_jsx(MemorySummary, { item: item, t: t }), item.relationship?.status === 'pending' && _jsxs("div", { className: css.conflict, children: [_jsx("strong", { children: t(`governance.relationship.${item.relationship.type}`) }), _jsx("p", { children: item.relationship.rationale }), _jsxs("div", { children: [_jsxs("blockquote", { children: [_jsx("small", { children: t('governance.relationship.existing') }), target?.content ?? t('governance.relationship.missing')] }), _jsxs("blockquote", { children: [_jsx("small", { children: t('governance.relationship.incoming') }), item.content] })] })] }), _jsx("div", { className: css.actions, children: _jsx("button", { className: shared.button, type: "button", disabled: pending, onClick: () => {
                                                        if (open)
                                                            setReviewing(null);
                                                        else
                                                            beginReview(item);
                                                    }, children: open ? t('governance.review.close') : t('governance.review.open') }) }), open && _jsxs("div", { className: css.reviewPanel, children: [_jsxs("label", { children: [t('governance.content'), _jsx("textarea", { value: reviewContent, onChange: (event) => { setReviewContent(event.target.value); }, disabled: item.relationship?.status === 'pending' })] }), _jsxs("label", { children: [t('governance.scope'), _jsx("input", { value: reviewScope, onChange: (event) => { setReviewScope(event.target.value); } })] }), _jsxs("div", { className: css.policyRow, children: [_jsxs("label", { children: [t('governance.recall'), _jsx("select", { value: reviewPolicy, disabled: item.sensitivity === 'high', onChange: (event) => { setReviewPolicy(event.target.value); }, children: POLICIES.map(policy => _jsx("option", { value: policy, children: t(`governance.recall.${policy}`) }, policy)) })] }), _jsxs("label", { children: [t('governance.temporary'), _jsx("input", { type: "number", min: "1", max: "365", value: reviewDays, onChange: (event) => { setReviewDays(event.target.value); }, placeholder: t('governance.temporary.placeholder') })] })] }), item.relationship?.status === 'pending' ? _jsxs("div", { className: css.decisionActions, children: [_jsx("button", { type: "button", disabled: pending, onClick: () => { void resolveCandidate(item, 'keep-existing'); }, children: t('governance.relationship.keepExisting') }), _jsx("button", { type: "button", disabled: pending, onClick: () => { void resolveCandidate(item, 'keep-both'); }, children: t('governance.relationship.keepBoth') }), _jsx("button", { className: shared.button, type: "button", disabled: pending, onClick: () => { void resolveCandidate(item, 'replace-existing'); }, children: t('governance.relationship.replace') })] }) : _jsxs("div", { className: css.decisionActions, children: [_jsx("button", { type: "button", disabled: pending, onClick: () => {
                                                                    void mutate(() => onRejectMemory(item), 'governance.notice.rejected').then((value) => {
                                                                        if (value !== null)
                                                                            setReviewing(null);
                                                                    });
                                                                }, children: t('governance.reject') }), _jsx("button", { className: shared.button, type: "button", disabled: pending || reviewContent.trim() === '', onClick: () => { void confirmCandidate(item); }, children: t('governance.confirm') })] })] })] }, String(item.id));
                                }) }))] }), _jsxs("section", { className: css.section, "aria-labelledby": "mind-garden-active-memory-title", children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx(MemoryIcon, { size: 16 }), _jsx("h3", { id: "mind-garden-active-memory-title", children: t('governance.library.title') })] }), _jsx("p", { children: t('governance.library.subtitle') })] }), active.length === 0 ? _jsx("p", { className: shared.empty, children: t('governance.library.empty') }) : (_jsx("div", { className: css.cardList, children: active.map((item) => {
                                    const itemRevisions = revisions[String(item.id)];
                                    const isEditing = editing?.id === item.id;
                                    return _jsxs("article", { className: `${shared.panel} ${css.memoryCard}`, children: [_jsx(MemorySummary, { item: item, t: t }), _jsx(MemorySources, { item: item, t: t }), _jsxs("div", { className: css.actions, children: [_jsxs("button", { type: "button", onClick: () => {
                                                            onDraftConversation(t('governance.draft.template').replace('{content}', item.content));
                                                            setNotice('governance.notice.drafted');
                                                        }, children: [_jsx(IconSendOutline14, {}), t('governance.continue')] }), _jsx("button", { type: "button", disabled: pending, onClick: () => { void loadRevisions(item); }, children: itemRevisions === undefined ? t('governance.history.open') : t('governance.history.close') }), _jsx("button", { type: "button", disabled: pending, onClick: () => {
                                                            if (isEditing)
                                                                setEditing(null);
                                                            else
                                                                beginEdit(item);
                                                        }, children: isEditing ? t('governance.edit.close') : t('governance.edit.open') }), _jsx("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => { void remove(item); }, children: deleteArmed === String(item.id) ? t('governance.delete.confirm') : t('governance.delete') })] }), itemRevisions !== undefined && _jsx(RevisionList, { revisions: itemRevisions, t: t }), isEditing && _jsxs("form", { className: css.reviewPanel, onSubmit: (event) => { void saveEdit(event); }, children: [_jsxs("label", { children: [t('governance.content'), _jsx("textarea", { value: editDraft.content, onChange: (event) => { setEditDraft(current => ({ ...current, content: event.target.value })); } })] }), _jsxs("label", { children: [t('governance.reason'), _jsx("input", { value: editDraft.reason, onChange: (event) => { setEditDraft(current => ({ ...current, reason: event.target.value })); } })] }), _jsxs("label", { children: [t('governance.scope'), _jsx("input", { value: editDraft.scope, onChange: (event) => { setEditDraft(current => ({ ...current, scope: event.target.value })); } })] }), _jsxs("div", { className: css.policyRow, children: [_jsxs("label", { children: [t('governance.sensitivity'), _jsxs("select", { value: editDraft.sensitivity, onChange: (event) => { const sensitivity = event.target.value; setEditDraft(current => ({ ...current, sensitivity })); if (sensitivity === 'high')
                                                                            setEditPolicy('never'); }, children: [_jsx("option", { value: "normal", children: t('governance.sensitivity.normal') }), _jsx("option", { value: "high", children: t('governance.sensitivity.high') })] })] }), _jsxs("label", { children: [t('governance.recall'), _jsx("select", { value: editPolicy, disabled: editDraft.sensitivity === 'high', onChange: (event) => { setEditPolicy(event.target.value); }, children: POLICIES.map(policy => _jsx("option", { value: policy, children: t(`governance.recall.${policy}`) }, policy)) })] })] }), _jsx("div", { className: css.decisionActions, children: _jsx("button", { className: shared.button, type: "submit", disabled: pending || editDraft.content.trim() === '' || editDraft.reason.trim() === '', children: t('governance.edit.save') }) })] })] }, String(item.id));
                                }) }))] }), history.length > 0 && _jsxs("details", { className: css.archive, children: [_jsx("summary", { children: t('governance.archive.title').replace('{count}', String(history.length)) }), _jsx("div", { className: css.cardList, children: history.map((item) => {
                                    const itemRevisions = revisions[String(item.id)];
                                    return _jsxs("article", { className: `${shared.panel} ${css.memoryCard}`, children: [_jsx(MemorySummary, { item: item, t: t }), _jsx(MemorySources, { item: item, t: t }), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", disabled: pending, onClick: () => { void loadRevisions(item); }, children: itemRevisions === undefined ? t('governance.history.open') : t('governance.history.close') }), _jsx("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => { void remove(item); }, children: deleteArmed === String(item.id) ? t('governance.delete.confirm') : t('governance.delete') })] }), itemRevisions !== undefined && _jsx(RevisionList, { revisions: itemRevisions, t: t })] }, String(item.id));
                                }) })] })] }))] }));
}
function MemorySummary({ item, t }) {
    return _jsxs("div", { className: css.summary, children: [_jsxs("div", { className: css.meta, children: [_jsx("span", { children: t(`governance.status.${item.status}`) }), _jsx("span", { children: t(`governance.kind.${item.kind}`) }), _jsx("span", { children: t(`governance.sensitivity.${item.sensitivity}`) }), _jsx("time", { dateTime: dateOf(item.updatedAt), children: dateOf(item.updatedAt) })] }), _jsx("p", { children: item.content }), _jsx("small", { children: item.reason }), item.scope !== undefined && _jsxs("blockquote", { children: [t('governance.scope.label'), item.scope] }), _jsxs("div", { className: css.recallBadge, children: [t(`governance.recall.${item.recallPolicy}`), item.status === 'temporary' && item.expiresAt !== undefined ? ` · ${t('governance.expires').replace('{date}', dateOf(item.expiresAt))}` : ''] })] });
}
function MemorySources({ item, t }) {
    return _jsxs("details", { className: css.sources, children: [_jsx("summary", { children: t('governance.sources').replace('{count}', String(item.sources.length)) }), item.sources.map((source, index) => _jsxs("div", { children: [_jsx("span", { children: String(source.sessionId).slice(0, 12) }), source.evidenceQuote !== undefined && _jsx("blockquote", { children: source.evidenceQuote })] }, `${String(source.sessionId)}:${index}`))] });
}
function RevisionList({ revisions, t, }) {
    return _jsx("div", { className: css.revisions, children: revisions.length === 0 ? _jsx("p", { children: t('governance.history.empty') }) : revisions.map(revision => _jsxs("article", { children: [_jsxs("div", { children: [_jsx("strong", { children: t(`governance.revision.${revision.action}`) }), _jsx("time", { dateTime: dateOf(revision.createdAt), children: dateOf(revision.createdAt) })] }), _jsx("p", { children: revision.content }), _jsx("small", { children: t(`governance.recall.${revision.recallPolicy}`) })] }, String(revision.id))) });
}
//# sourceMappingURL=MemoryGovernance.js.map