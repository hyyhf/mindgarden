import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Mind Garden entry, disclosure, and live preference controls. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconCheckOutline16, IconChevronDownOutline14, IconChevronRightOutline14, IconCloseOutline16, IconDataOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { ConcernsIcon, GardenMarkIcon, PhilosophyIcon, PrivateIcon } from "./GardenIcons.js";
import css from './MindGardenDock.module.css';
const MODES = ['serenity', 'clarity'];
const INTENTS = ['auto', 'listen', 'settle', 'clarify', 'next-step'];
/** Render a stable localized failure without exposing transport internals by default. */
function errorText(result, t) {
    if (result.ok)
        return null;
    return result.error.code === 'MIND_GARDEN_SESSION_NOT_BLANK'
        ? t('error.notBlank')
        : result.error.message || t('error.generic');
}
/** The visual Mind Garden dock surface. */
export function MindGardenPanel({ projection, onActivate, onSelectMode, onSelectSupportIntent, defaultOpen = false, t, }) {
    const [open, setOpen] = useState(defaultOpen);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(null);
    const pendingRef = useRef(false);
    const revision = projection?.state.revision;
    useEffect(() => {
        setError(null);
    }, [revision]);
    const run = useCallback(async (action) => {
        /* v8 ignore next -- React synchronously disables every action after the first click; the ref closes the smaller pre-render window. */
        if (pendingRef.current)
            return;
        pendingRef.current = true;
        setPending(true);
        setError(null);
        try {
            const result = await action();
            setError(errorText(result, t));
            if (result.ok && !defaultOpen)
                setOpen(false);
        }
        catch {
            setError(t('error.generic'));
        }
        finally {
            pendingRef.current = false;
            setPending(false);
        }
    }, [defaultOpen, t]);
    if (projection === undefined)
        return null;
    if (projection === null) {
        return (_jsxs("div", { className: css.dock, "data-mind-garden-state": "inactive", "data-surface": "dock", children: [!open && (_jsxs("button", { type: "button", className: css.entry, onClick: () => { setOpen(true); }, "aria-label": t('entry.open'), children: [_jsx("span", { className: css.mark, children: _jsx(GardenMarkIcon, { size: 18 }) }), _jsxs("span", { className: css.entryCopy, children: [_jsx("span", { className: css.entryTitle, children: t('entry.open') }), _jsx("span", { className: css.entryHint, children: t('entry.hint') })] }), _jsx(IconChevronRightOutline14, { className: css.chevron })] })), open && (_jsxs("section", { className: css.panel, "aria-labelledby": "mind-garden-disclosure-title", children: [_jsxs("div", { className: css.panelHeader, children: [_jsxs("div", { children: [_jsx("h3", { id: "mind-garden-disclosure-title", className: css.title, children: t('disclosure.title') }), _jsx("p", { className: css.disclosure, children: t('disclosure.body') })] }), _jsx("button", { type: "button", className: css.close, onClick: () => { setOpen(false); }, disabled: pending, "aria-label": t('entry.close'), children: _jsx(IconCloseOutline16, { size: 15 }) })] }), _jsx("p", { className: css.acceptance, children: t('disclosure.accept') }), _jsxs("ul", { className: css.contract, "aria-label": t('disclosure.contract'), children: [_jsxs("li", { children: [_jsx(PrivateIcon, { size: 16 }), _jsxs("span", { children: [_jsx("strong", { children: t('disclosure.profile.title') }), _jsx("small", { children: t('disclosure.profile.body') })] })] }), _jsxs("li", { children: [_jsx(IconDataOutline16, { size: 16 }), _jsxs("span", { children: [_jsx("strong", { children: t('disclosure.model.title') }), _jsx("small", { children: t('disclosure.model.body') })] })] }), _jsxs("li", { children: [_jsx(IconCheckOutline16, { size: 16 }), _jsxs("span", { children: [_jsx("strong", { children: t('disclosure.authority.title') }), _jsx("small", { children: t('disclosure.authority.body') })] })] })] }), _jsx("div", { className: css.modeGrid, children: MODES.map(mode => (_jsxs("button", { type: "button", className: css.modeCard, disabled: pending, onClick: () => { void run(() => onActivate(mode)); }, children: [_jsx("span", { className: css.modeIcon, children: mode === 'serenity' ? _jsx(ConcernsIcon, { size: 18 }) : _jsx(PhilosophyIcon, { size: 18 }) }), _jsxs("span", { children: [_jsx("span", { className: css.modeTitle, children: t(`mode.${mode}`) }), _jsx("span", { className: css.modeDescription, children: t(`mode.${mode}.desc`) })] })] }, mode))) }), error !== null && _jsx("p", { className: css.error, role: "alert", children: error })] }))] }));
    }
    const state = projection.state;
    return (_jsx("div", { className: css.dock, "data-mind-garden-state": "active", "data-surface": defaultOpen ? 'settings' : 'dock', children: _jsxs("section", { className: css.activePanel, children: [defaultOpen ? (_jsxs("div", { className: css.settingsIdentity, children: [_jsx("span", { className: css.markActive, children: _jsx(GardenMarkIcon, { size: 18 }) }), _jsxs("span", { children: [_jsx("strong", { children: t('garden.dialogue.title') }), _jsx("small", { children: t('garden.dialogue.body') })] })] })) : (_jsxs("button", { type: "button", className: css.activeHeader, onClick: () => { setOpen(value => !value); }, "aria-expanded": open, "aria-label": open ? t('garden.collapse') : t('garden.expand'), children: [_jsxs("span", { className: css.activeIdentity, children: [_jsx("span", { className: css.markActive, children: _jsx(GardenMarkIcon, { size: 18 }) }), _jsxs("span", { children: [_jsx("span", { className: css.activeTitle, children: t('garden.title') }), _jsxs("span", { className: css.activeSummary, children: [t(`mode.${state.mode}`), " \u00B7 ", t(`intent.${state.supportIntent}`)] })] })] }), _jsx(IconChevronDownOutline14, { className: open ? css.chevronOpen : css.chevron })] })), open && (_jsxs("div", { className: css.controls, children: [_jsx(ControlSection, { label: t('section.mode'), children: _jsx("div", { className: css.segmented, role: "group", "aria-label": t('section.mode'), children: MODES.map(mode => (_jsxs("button", { type: "button", className: state.mode === mode ? css.segmentActive : css.segment, "aria-pressed": state.mode === mode, disabled: pending, onClick: () => { void run(() => onSelectMode(state.revision, mode)); }, children: [_jsx("span", { className: css.optionIcon, children: mode === 'serenity' ? _jsx(ConcernsIcon, { size: 17 }) : _jsx(PhilosophyIcon, { size: 17 }) }), _jsxs("span", { className: css.optionCopy, children: [_jsx("strong", { children: t(`mode.${mode}`) }), defaultOpen && _jsx("small", { children: t(`mode.${mode}.desc`) })] })] }, mode))) }) }), _jsx(ControlSection, { label: t('section.intent'), children: _jsx("div", { className: css.intentList, role: "group", "aria-label": t('section.intent'), children: INTENTS.map(intent => (_jsx("button", { type: "button", className: state.supportIntent === intent ? css.intentActive : css.intent, "aria-pressed": state.supportIntent === intent, disabled: pending, onClick: () => { void run(() => onSelectSupportIntent(state.revision, intent)); }, children: t(`intent.${intent}`) }, intent))) }) }), _jsxs("div", { className: css.storage, children: [_jsx(PrivateIcon, { size: 14 }), t('garden.storage')] }), error !== null && _jsx("p", { className: css.error, role: "alert", children: error })] }))] }) }));
}
/** Small labeled control group. */
function ControlSection({ label, children }) {
    return (_jsxs("div", { className: css.controlSection, children: [_jsx("span", { className: css.controlLabel, children: label }), children] }));
}
/** Read the typed projection and adapt it to the visual panel. */
export function MindGardenDock({ useProjection, ...props }) {
    const projection = useProjection('mind-garden');
    return _jsx(MindGardenPanel, { projection: projection, ...props });
}
//# sourceMappingURL=MindGardenDock.js.map