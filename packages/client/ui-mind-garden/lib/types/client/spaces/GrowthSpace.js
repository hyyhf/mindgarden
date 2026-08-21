import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Reality-experiment workspace for life themes that need observation. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconCheckOutline16, IconPlusOutline16, IconSendOutline14, IconStopFill16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { calendarStamp } from "../calendar.js";
import { GrowthIcon, PrivateIcon } from "../GardenIcons.js";
import shared from './GardenSpace.module.css';
import css from './GrowthSpace.module.css';
/** Render user-governed, unscored reality experiments and their observations. */
export function GrowthSpace({ today, onListExperiments, onCreateExperiment, onStartExperiment, onObserveExperiment, onStopExperiment, onDraftConversation = () => undefined, t, }) {
    const [experiments, setExperiments] = useState([]);
    const [title, setTitle] = useState('');
    const [hypothesis, setHypothesis] = useState('');
    const [action, setAction] = useState('');
    const [reviewDate, setReviewDate] = useState('');
    const [observingId, setObservingId] = useState(null);
    const [observation, setObservation] = useState('');
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(false);
    const [notice, setNotice] = useState(null);
    const requestRef = useRef(0);
    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        const result = await onListExperiments();
        if (request !== requestRef.current)
            return;
        if (result.ok) {
            setExperiments(result.value);
            setError(false);
        }
        else {
            setError(true);
        }
        setLoading(false);
    }, [onListExperiments]);
    useEffect(() => {
        void refresh();
        return () => { requestRef.current++; };
    }, [refresh]);
    async function mutate(actionRequest, success) {
        setPending(true);
        setError(false);
        setNotice(null);
        const result = await actionRequest();
        setPending(false);
        if (!result.ok) {
            setError(true);
            return false;
        }
        setNotice(success);
        await refresh();
        return true;
    }
    async function submit(event) {
        event.preventDefault();
        const nextTitle = title.trim();
        const nextAction = action.trim();
        if (nextTitle === '' || nextAction === '')
            return;
        const created = await mutate(async () => await onCreateExperiment(nextTitle, hypothesis.trim(), nextAction, calendarStamp(today), reviewDate === '' ? undefined : calendarStamp(reviewDate)), 'growth.notice.created');
        if (created) {
            setTitle('');
            setHypothesis('');
            setAction('');
            setReviewDate('');
        }
    }
    async function recordObservation(item) {
        const value = observation.trim();
        const recorded = await mutate(async () => await onObserveExperiment(item, value, calendarStamp(today)), 'growth.notice.observed');
        if (recorded) {
            setObservation('');
            setObservingId(null);
        }
    }
    function draftConversation(item) {
        onDraftConversation(t('growth.draft.template')
            .replace('{title}', item.title)
            .replace('{action}', item.action));
        setNotice('growth.notice.drafted');
    }
    const activeCount = experiments.filter(item => item.status === 'trying' || item.status === 'revised').length;
    const observedCount = experiments.filter(item => item.status === 'observed').length;
    return (_jsxs("main", { className: `${shared.space} ${css.growth}`, "data-mind-garden-space": "growth", children: [_jsxs("header", { className: css.hero, children: [_jsxs("div", { className: css.heroCopy, children: [_jsxs("span", { className: css.heroMark, children: [_jsx(GrowthIcon, { size: 19 }), t('growth.eyebrow')] }), _jsx("h1", { children: t('growth.title') }), _jsx("p", { children: t('growth.subtitle') }), _jsxs("span", { className: css.privateLine, children: [_jsx(PrivateIcon, { size: 15 }), t('growth.private')] })] }), _jsxs("figure", { className: css.fieldInstrument, "aria-label": t('growth.instrument.label'), children: [_jsxs("span", { className: css.instrumentRings, "aria-hidden": "true", children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {})] }), _jsx(GrowthIcon, { size: 34 }), _jsxs("figcaption", { children: [_jsxs("span", { children: [_jsx("strong", { children: activeCount }), t('growth.instrument.active')] }), _jsxs("span", { children: [_jsx("strong", { children: observedCount }), t('growth.instrument.observed')] })] })] })] }), _jsxs("section", { className: css.composerDeck, "aria-labelledby": "mind-garden-growth-composer-title", children: [_jsxs("header", { children: [_jsxs("span", { children: [_jsx(IconPlusOutline16, {}), t('growth.composer.label')] }), _jsxs("div", { children: [_jsx("h2", { id: "mind-garden-growth-composer-title", children: t('growth.composer.title') }), _jsx("p", { children: t('growth.composer.subtitle') })] })] }), _jsxs("form", { className: css.composer, onSubmit: (event) => { void submit(event); }, children: [_jsxs("label", { children: [_jsx("span", { children: t('growth.input.title') }), _jsx("input", { className: shared.input, value: title, onChange: (event) => { setTitle(event.target.value); } })] }), _jsxs("label", { children: [_jsx("span", { children: t('growth.input.reviewDate') }), _jsx("input", { className: shared.input, type: "date", min: today, value: reviewDate, onChange: (event) => { setReviewDate(event.target.value); } })] }), _jsxs("label", { className: css.wide, children: [_jsx("span", { children: t('growth.input.hypothesis') }), _jsx("input", { className: shared.input, value: hypothesis, placeholder: t('growth.input.hypothesisPlaceholder'), onChange: (event) => { setHypothesis(event.target.value); } })] }), _jsxs("label", { className: css.wide, children: [_jsx("span", { children: t('growth.input.action') }), _jsx("textarea", { className: shared.textarea, value: action, placeholder: t('growth.input.actionPlaceholder'), onChange: (event) => { setAction(event.target.value); } })] }), _jsxs("div", { className: css.composerFooter, children: [_jsx("span", { children: t('growth.composer.boundary') }), _jsxs("button", { className: shared.button, type: "submit", disabled: pending || title.trim() === '' || action.trim() === '', children: [_jsx(GrowthIcon, { size: 16 }), t('growth.create')] })] })] })] }), notice !== null && _jsx("p", { className: shared.notice, role: "status", children: t(notice) }), error && _jsx("p", { className: shared.error, role: "alert", children: t('growth.error') }), _jsxs("section", { className: css.fieldJournal, "aria-labelledby": "mind-garden-growth-journal-title", children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("span", { children: t('growth.journal.label') }), _jsx("h2", { id: "mind-garden-growth-journal-title", children: t('growth.journal.title') })] }), _jsx("p", { children: t('growth.journal.subtitle') })] }), loading ? (_jsx("p", { className: css.empty, role: "status", children: t('growth.loading') })) : experiments.length === 0 ? (_jsx("p", { className: css.empty, children: t('growth.empty') })) : (_jsx("ol", { className: css.list, children: experiments.map((item, index) => (_jsxs("li", { className: css.card, "data-status": item.status, children: [_jsx("span", { className: css.sequence, "aria-hidden": "true", children: String(index + 1).padStart(2, '0') }), _jsxs("article", { children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("span", { className: css.status, children: t(`growth.status.${item.status}`) }), _jsx("h3", { children: item.title })] }), item.reviewStamp !== null && _jsxs("time", { dateTime: item.reviewStamp.localDate, children: [_jsxs("span", { children: [t('growth.reviewDate'), " \u00B7 "] }), _jsx("b", { children: item.reviewStamp.localDate })] })] }), _jsxs("dl", { className: css.meaning, children: [item.hypothesis !== '' && (_jsxs("div", { children: [_jsx("dt", { children: t('growth.hypothesis') }), _jsx("dd", { children: item.hypothesis })] })), _jsxs("div", { children: [_jsx("dt", { children: t('growth.action') }), _jsx("dd", { children: item.action })] })] }), item.observations.length > 0 && (_jsx("ol", { className: css.observations, "aria-label": t('growth.observations'), children: item.observations.map(entry => _jsxs("li", { children: [_jsx(IconCheckOutline16, {}), entry.observation] }, String(entry.id))) })), observingId === String(item.id) && (_jsxs("div", { className: css.observationForm, children: [_jsx("label", { htmlFor: `observation-${String(item.id)}`, children: t('growth.observation') }), _jsx("textarea", { id: `observation-${String(item.id)}`, className: shared.textarea, value: observation, onChange: (event) => { setObservation(event.target.value); } }), _jsxs("button", { className: shared.button, type: "button", disabled: pending || observation.trim() === '', onClick: () => { void recordObservation(item); }, children: [_jsx(IconCheckOutline16, {}), t('growth.record')] })] })), _jsxs("footer", { className: css.actions, children: [(item.status === 'proposed' || item.status === 'revised') && (_jsxs("button", { className: shared.button, type: "button", disabled: pending, onClick: () => {
                                                        void mutate(async () => await onStartExperiment(item, today), 'growth.notice.started');
                                                    }, children: [_jsx(IconCheckOutline16, {}), t('growth.start')] })), (item.status === 'trying' || item.status === 'observed') && (_jsxs("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => { setObservingId(current => current === String(item.id) ? null : String(item.id)); }, children: [_jsx(IconPlusOutline16, {}), t('growth.observe')] })), _jsxs("button", { className: shared.quietButton, type: "button", onClick: () => { draftConversation(item); }, children: [_jsx(IconSendOutline14, {}), t('growth.continue')] }), item.status !== 'stopped' && (_jsxs("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => {
                                                        void mutate(async () => await onStopExperiment(item), 'growth.notice.stopped');
                                                    }, children: [_jsx(IconStopFill16, {}), t('growth.stop')] }))] })] })] }, String(item.id)))) }))] })] }));
}
//# sourceMappingURL=GrowthSpace.js.map