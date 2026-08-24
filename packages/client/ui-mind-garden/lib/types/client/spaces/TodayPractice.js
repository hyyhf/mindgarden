import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Daily check-in and encrypted journal composition for the Today space. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { calendarStamp } from "../calendar.js";
import { CheckinIcon, JournalIcon } from "../GardenIcons.js";
import shared from './GardenSpace.module.css';
import css from './TodayPractice.module.css';
const MOODS = [-2, -1, 0, 1, 2];
const ENERGIES = [1, 2, 3, 4, 5];
/** Normalize a free-form emotion list into the service's bounded unique words. */
export function emotionWords(value) {
    return [...new Set(value.split(/[\s,，、]+/u).map(word => word.trim()).filter(Boolean))].slice(0, 3);
}
/** Render immutable check-ins and user-governed encrypted journal entries. */
export function TodayPractice({ today, onCalendarDay, onCreateCheckin, onCreateJournal, onUpdateJournal, onDeleteJournal, t, }) {
    const [checkins, setCheckins] = useState([]);
    const [journals, setJournals] = useState([]);
    const [mood, setMood] = useState(0);
    const [energy, setEnergy] = useState(3);
    const [emotions, setEmotions] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [allowRetrieval, setAllowRetrieval] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteArmed, setDeleteArmed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(false);
    const [notice, setNotice] = useState(null);
    const requestRef = useRef(0);
    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        try {
            const result = await onCalendarDay(today);
            if (request !== requestRef.current)
                return;
            if (!result.ok) {
                setError(true);
                setLoading(false);
                return;
            }
            setCheckins(result.value.events.filter((event) => event.type === 'checkin'));
            setJournals(result.value.events.filter((event) => event.type === 'journal').reverse());
            setError(false);
            setLoading(false);
        }
        catch {
            if (request !== requestRef.current)
                return;
            setError(true);
            setLoading(false);
        }
    }, [onCalendarDay, today]);
    useEffect(() => {
        void refresh();
        return () => { requestRef.current++; };
    }, [refresh]);
    function resetJournal() {
        setEditing(null);
        setTitle('');
        setBody('');
        setAllowRetrieval(false);
    }
    async function submitCheckin(event) {
        event.preventDefault();
        if (pending)
            return;
        setPending(true);
        setError(false);
        setNotice(null);
        try {
            const result = await onCreateCheckin(mood, energy, emotionWords(emotions), calendarStamp(today));
            if (!result.ok) {
                setError(true);
                return;
            }
            setCheckins(current => [...current, result.value]);
            setEmotions('');
            setNotice('today.checkin.notice');
        }
        catch {
            setError(true);
        }
        finally {
            setPending(false);
        }
    }
    async function submitJournal(event) {
        event.preventDefault();
        const nextTitle = title.trim();
        const nextBody = body.trim();
        if (pending || nextBody === '')
            return;
        setPending(true);
        setError(false);
        setNotice(null);
        try {
            const result = editing === null
                ? await onCreateJournal(nextTitle, nextBody, allowRetrieval, calendarStamp(today))
                : await onUpdateJournal(editing, nextTitle, nextBody, allowRetrieval);
            if (!result.ok) {
                setError(true);
                return;
            }
            if (editing === null) {
                setJournals(current => [result.value, ...current]);
                setNotice('today.journal.notice.created');
            }
            else {
                setJournals(current => current.map(item => item.id === result.value.id ? result.value : item));
                setNotice('today.journal.notice.updated');
            }
            resetJournal();
        }
        catch {
            setError(true);
        }
        finally {
            setPending(false);
        }
    }
    function editJournal(journal) {
        setEditing(journal);
        setTitle(journal.title);
        setBody(journal.body);
        setAllowRetrieval(journal.allowRetrieval);
        setDeleteArmed(null);
        setNotice(null);
    }
    async function deleteJournal(journal) {
        const id = String(journal.id);
        if (deleteArmed !== id) {
            setDeleteArmed(id);
            return;
        }
        setPending(true);
        setError(false);
        setNotice(null);
        try {
            const result = await onDeleteJournal(journal);
            if (!result.ok) {
                setError(true);
                return;
            }
            setJournals(current => current.filter(item => item.id !== journal.id));
            if (editing?.id === journal.id)
                resetJournal();
            setDeleteArmed(null);
            setNotice('today.journal.notice.deleted');
        }
        catch {
            setError(true);
        }
        finally {
            setPending(false);
        }
    }
    return (_jsxs("section", { className: css.practice, "data-mind-garden-today-practice": "active", "aria-labelledby": "mind-garden-today-title", children: [_jsxs("header", { className: css.header, children: [_jsx("div", { children: _jsx("h2", { id: "mind-garden-today-title", children: t('today.practice.title') }) }), _jsx("time", { dateTime: today, children: today })] }), notice !== null && _jsx("p", { className: shared.notice, role: "status", children: t(notice) }), error && _jsx("p", { className: shared.error, role: "alert", children: t('today.error') }), loading ? _jsx("p", { className: shared.empty, role: "status", children: t('today.loading') }) : (_jsxs("div", { className: css.grid, children: [_jsxs("form", { className: `${shared.panel} ${css.checkin}`, onSubmit: (event) => { void submitCheckin(event); }, children: [_jsxs("div", { className: css.cardHeading, children: [_jsx("span", { "aria-hidden": "true", children: _jsx(CheckinIcon, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: t('today.checkin.title') }), _jsx("p", { children: t('today.checkin.subtitle') })] })] }), _jsxs("fieldset", { children: [_jsx("legend", { children: t('today.checkin.mood') }), _jsx("div", { className: css.scale, children: MOODS.map(value => (_jsxs("button", { type: "button", "aria-pressed": mood === value, onClick: () => { setMood(value); }, children: [_jsx("span", { "aria-hidden": "true", children: t(`today.mood.${value}.glyph`) }), _jsx("small", { children: t(`today.mood.${value}`) })] }, value))) })] }), _jsxs("fieldset", { children: [_jsx("legend", { children: t('today.checkin.energy') }), _jsx("div", { className: css.energy, children: ENERGIES.map(value => (_jsxs("button", { type: "button", "aria-pressed": energy === value, onClick: () => { setEnergy(value); }, children: [value, _jsx("small", { children: t(`today.energy.${value}`) })] }, value))) })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('today.checkin.emotions') }), _jsx("input", { "aria-label": t('today.checkin.emotions'), className: shared.input, value: emotions, placeholder: t('today.checkin.emotions.placeholder'), onChange: (event) => { setEmotions(event.target.value); } }), _jsx("small", { children: t('today.checkin.emotions.hint') })] }), _jsx("button", { className: shared.button, type: "submit", disabled: pending, children: t('today.checkin.save') }), checkins.length > 0 && (_jsx("div", { className: css.checkinTrail, "aria-label": t('today.checkin.saved'), children: checkins.map(item => (_jsxs("span", { title: item.emotionWords.join(' · '), children: [t(`today.mood.${item.mood}.glyph`), " ", item.energy, "/5"] }, String(item.id)))) }))] }), _jsxs("form", { className: `${shared.panel} ${css.journalComposer}`, onSubmit: (event) => { void submitJournal(event); }, children: [_jsxs("div", { className: css.cardHeading, children: [_jsx("span", { "aria-hidden": "true", children: _jsx(JournalIcon, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: editing === null ? t('today.journal.title') : t('today.journal.editing') }), _jsx("p", { children: t('today.journal.subtitle') })] })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('today.journal.name') }), _jsx("input", { "aria-label": t('today.journal.name'), className: shared.input, value: title, maxLength: 160, placeholder: t('today.journal.name.placeholder'), onChange: (event) => { setTitle(event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('today.journal.body') }), _jsx("textarea", { "aria-label": t('today.journal.body'), className: shared.textarea, value: body, maxLength: 8_000, placeholder: t('today.journal.body.placeholder'), onChange: (event) => { setBody(event.target.value); } })] }), _jsxs("label", { className: css.retrieval, children: [_jsx("input", { type: "checkbox", checked: allowRetrieval, onChange: (event) => { setAllowRetrieval(event.target.checked); } }), _jsxs("span", { children: [_jsx("strong", { children: t('today.journal.retrieval') }), _jsx("small", { children: t('today.journal.retrieval.hint') })] })] }), _jsxs("div", { className: css.composerActions, children: [_jsx("button", { className: shared.button, type: "submit", disabled: pending || body.trim() === '', children: editing === null ? t('today.journal.create') : t('today.journal.update') }), editing !== null && _jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: resetJournal, children: t('today.journal.cancel') })] })] }), _jsxs("section", { className: css.journalShelf, "aria-labelledby": "mind-garden-journal-shelf", children: [_jsxs("div", { className: css.shelfHeading, children: [_jsx("h3", { id: "mind-garden-journal-shelf", children: t('today.journal.shelf') }), _jsx("span", { children: t('today.journal.count').replace('{count}', String(journals.length)) })] }), journals.length === 0 ? _jsx("p", { className: shared.empty, children: t('today.journal.empty') }) : (_jsx("ul", { children: journals.map(journal => (_jsxs("li", { className: `${shared.panel} ${css.journalCard}`, children: [_jsxs("div", { children: [_jsx("span", { className: css.journalMeta, children: journal.allowRetrieval ? t('today.journal.retrievable') : t('today.journal.private') }), _jsx("h4", { children: journal.title || t('today.journal.untitled') }), _jsx("p", { children: journal.body })] }), _jsxs("div", { className: css.journalActions, children: [_jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => { editJournal(journal); }, children: t('today.journal.edit') }), _jsx("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => { void deleteJournal(journal); }, children: deleteArmed === String(journal.id) ? t('today.journal.delete.confirm') : t('today.journal.delete') })] })] }, String(journal.id)))) }))] })] }))] }));
}
//# sourceMappingURL=TodayPractice.js.map