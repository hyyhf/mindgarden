import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Private concern basket backed by encrypted reflection records. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconCheckOutline16, IconEditOutline16, IconSendOutline14, } from '@deepseek-ai/dsh-client-ui-primitives';
import { calendarStamp } from "../calendar.js";
import { ConcernsIcon, JournalIcon, PrivateIcon } from "../GardenIcons.js";
import { CONCERN_PAPER_LATTICE_V3 } from "../generated-assets.js";
import shared from './GardenSpace.module.css';
import css from './ConcernsSpace.module.css';
/** Render create, complete, and journal-conversion flows for private concerns. */
export function ConcernsSpace({ today, onListConcerns, onCreateConcern, onUpdateConcern, onCompleteConcern, onConvertConcern, onDraftConversation = () => undefined, t, }) {
    const [concerns, setConcerns] = useState([]);
    const [content, setContent] = useState('');
    const [reminder, setReminder] = useState('');
    const [allowRetrieval, setAllowRetrieval] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [editingReminder, setEditingReminder] = useState('');
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(false);
    const [notice, setNotice] = useState(null);
    const requestRef = useRef(0);
    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        const result = await onListConcerns();
        if (request !== requestRef.current)
            return;
        if (result.ok) {
            setConcerns(result.value);
            setError(false);
        }
        else {
            setError(true);
        }
        setLoading(false);
    }, [onListConcerns]);
    useEffect(() => {
        void refresh();
        return () => { requestRef.current++; };
    }, [refresh]);
    async function submit(event) {
        event.preventDefault();
        const value = content.trim();
        if (value === '' || pending)
            return;
        setPending(true);
        setError(false);
        setNotice(null);
        const result = await onCreateConcern(value, calendarStamp(today), reminder === '' ? undefined : calendarStamp(reminder));
        setPending(false);
        if (!result.ok) {
            setError(true);
            return;
        }
        setContent('');
        setReminder('');
        setNotice('concern.notice.created');
        await refresh();
    }
    async function complete(item) {
        setPending(true);
        setError(false);
        setNotice(null);
        const result = await onCompleteConcern(item);
        setPending(false);
        if (!result.ok) {
            setError(true);
            return;
        }
        setNotice('concern.notice.completed');
        await refresh();
    }
    function beginEdit(item) {
        setEditingId(String(item.id));
        setEditingContent(item.content);
        setEditingReminder(item.reminder?.localDate ?? '');
        setNotice(null);
        setError(false);
    }
    async function update(item) {
        const value = editingContent.trim();
        if (value === '' || pending)
            return;
        setPending(true);
        setError(false);
        setNotice(null);
        const result = await onUpdateConcern(item, value, today, editingReminder === '' ? undefined : calendarStamp(editingReminder));
        setPending(false);
        if (!result.ok) {
            setError(true);
            return;
        }
        setEditingId(null);
        setNotice('concern.notice.updated');
        await refresh();
    }
    function draftConversation(item) {
        onDraftConversation(t('concern.conversation.draft').replace('{content}', item.content));
        setNotice('concern.notice.drafted');
        setError(false);
    }
    async function convert(item) {
        setPending(true);
        setError(false);
        setNotice(null);
        const result = await onConvertConcern(item, calendarStamp(today), allowRetrieval);
        setPending(false);
        if (!result.ok) {
            setError(true);
            return;
        }
        setNotice('concern.notice.converted');
        await refresh();
    }
    return (_jsxs("main", { className: shared.space, "data-mind-garden-space": "concerns", children: [_jsxs("section", { className: css.threshold, style: { '--mg-concern-scene': `url("${CONCERN_PAPER_LATTICE_V3}")` }, children: [_jsxs("header", { className: css.intro, children: [_jsxs("div", { children: [_jsx("h1", { children: t('concern.title') }), _jsx("p", { children: t('concern.subtitle') })] }), _jsxs("aside", { className: css.privacy, children: [_jsx(PrivateIcon, { size: 17 }), _jsx("span", { children: t('space.private') })] })] }), _jsxs("form", { className: `${shared.panel} ${css.composer}`, onSubmit: (event) => { void submit(event); }, children: [_jsxs("div", { className: css.composerIntro, children: [_jsx("span", { className: css.composerSeal, children: _jsx(ConcernsIcon, { size: 18 }) }), _jsx("h2", { children: t('concern.compose.title') })] }), _jsxs("div", { className: css.composerFields, children: [_jsxs("label", { className: css.concernField, children: [_jsx("span", { children: t('concern.input') }), _jsx("textarea", { className: shared.textarea, value: content, placeholder: t('concern.placeholder'), onChange: (event) => { setContent(event.target.value); } })] }), _jsxs("div", { className: css.composerFooter, children: [_jsxs("label", { className: css.reminderField, children: [_jsx("span", { children: t('concern.reminder') }), _jsx("input", { className: shared.input, type: "date", min: today, value: reminder, onChange: (event) => { setReminder(event.target.value); } })] }), _jsxs("label", { className: css.retrieval, children: [_jsx("input", { type: "checkbox", checked: allowRetrieval, onChange: (event) => { setAllowRetrieval(event.target.checked); } }), _jsx("span", { children: t('concern.retrieval') })] }), _jsx("button", { className: shared.button, type: "submit", disabled: pending || content.trim() === '', children: t('concern.add') })] })] })] })] }), notice !== null && _jsx("p", { className: shared.notice, role: "status", children: t(notice) }), error && _jsx("p", { className: shared.error, role: "alert", children: t('concern.error') }), _jsxs("section", { className: css.collection, "aria-labelledby": "mind-garden-concern-collection", children: [_jsxs("header", { className: css.collectionHeader, children: [_jsx("div", { children: _jsx("h2", { id: "mind-garden-concern-collection", children: t('concern.collection.title') }) }), _jsx("strong", { children: concerns.length === 0
                                    ? t('concern.collection.emptyCount')
                                    : t('concern.collection.count').replace('{count}', String(concerns.length)) })] }), loading ? (_jsx("p", { className: shared.empty, role: "status", children: t('concern.loading') })) : concerns.length === 0 ? (_jsxs("div", { className: css.emptyState, children: [_jsx(ConcernsIcon, { size: 24 }), _jsx("p", { children: t('concern.empty') })] })) : (_jsx("ul", { className: css.list, children: concerns.map(item => (_jsxs("li", { className: `${shared.panel} ${css.card}`, "data-status": item.status, children: [_jsx("span", { className: css.thread, "aria-hidden": "true", children: _jsx("i", {}) }), _jsxs("div", { className: css.cardBody, children: [editingId === String(item.id) ? (_jsxs("form", { className: css.editor, onSubmit: (event) => { event.preventDefault(); void update(item); }, children: [_jsx("textarea", { className: shared.textarea, value: editingContent, "aria-label": t('concern.edit'), onChange: (event) => { setEditingContent(event.target.value); } }), _jsx("input", { className: shared.input, type: "date", min: today, value: editingReminder, "aria-label": t('concern.reminder'), onChange: (event) => { setEditingReminder(event.target.value); } }), _jsxs("div", { className: css.editorActions, children: [_jsxs("button", { className: shared.button, type: "submit", disabled: pending || editingContent.trim() === '', children: [_jsx(IconCheckOutline16, { size: 14 }), t('concern.edit.save')] }), _jsx("button", { className: shared.quietButton, type: "button", onClick: () => { setEditingId(null); }, children: t('concern.edit.cancel') })] })] })) : _jsx("p", { children: item.content }), _jsxs("div", { className: css.meta, children: [_jsx("span", { children: t(`concern.status.${item.status}`) }), _jsx("span", { children: item.createdStamp.localDate }), item.reminder !== null && (_jsx("span", { children: t('concern.reminds').replace('{date}', item.reminder.localDate) }))] })] }), item.status === 'active' && editingId !== String(item.id) && (_jsxs("div", { className: css.actions, children: [_jsxs("button", { className: shared.quietButton, type: "button", onClick: () => { draftConversation(item); }, children: [_jsx(IconSendOutline14, {}), t('concern.conversation')] }), _jsxs("button", { className: shared.quietButton, type: "button", onClick: () => { beginEdit(item); }, children: [_jsx(IconEditOutline16, { size: 14 }), t('concern.edit')] }), _jsxs("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => { void convert(item); }, children: [_jsx(JournalIcon, { size: 14 }), t('concern.convert')] }), _jsxs("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => { void complete(item); }, children: [_jsx(IconCheckOutline16, { size: 14 }), t('concern.complete')] })] }))] }, String(item.id)))) }))] })] }));
}
//# sourceMappingURL=ConcernsSpace.js.map