import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Mind Garden entry, disclosure, and live preference controls. */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, } from 'react';
import { IconCheckOutline16, IconChevronDownOutline14, IconCloseOutline16, IconDataOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { ConcernsIcon, GardenMarkIcon, PhilosophyIcon, PrivateIcon } from "./GardenIcons.js";
import css from './MindGardenDock.module.css';
const MODES = ['serenity', 'clarity'];
const INTENTS = ['auto', 'listen', 'settle', 'clarify', 'next-step'];
const DEFAULT_MODE = 'serenity';
/** Render a stable localized failure without exposing transport internals by default. */
function errorText(result, t) {
    if (result.ok)
        return null;
    return result.error.code === 'MIND_GARDEN_SESSION_NOT_BLANK'
        ? t('error.notBlank')
        : result.error.message || t('error.generic');
}
/** The visual Mind Garden dock surface. */
export function MindGardenPanel({ projection, onActivate, onSelectMode, onSelectSupportIntent, defaultOpen = false, running = false, t, }) {
    const [open, setOpen] = useState(defaultOpen);
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(null);
    const pendingRef = useRef(false);
    const surfaceRef = useRef(null);
    const disclosureRef = useRef(null);
    const triggerRef = useRef(null);
    const disclosureId = useId();
    const consentId = useId();
    const controlsId = useId();
    const [popoverPosition, setPopoverPosition] = useState();
    const revision = projection?.state.revision;
    useEffect(() => {
        setError(null);
    }, [revision]);
    const closeAndRestoreFocus = useCallback(() => {
        setOpen(false);
        setConsentAccepted(false);
        queueMicrotask(() => { triggerRef.current?.focus(); });
    }, []);
    useEffect(() => {
        if (!open || defaultOpen)
            return;
        const closeOnEscape = (event) => {
            if (event.key !== 'Escape')
                return;
            event.preventDefault();
            closeAndRestoreFocus();
        };
        const closeOutside = (event) => {
            if (!(event.target instanceof Node) || surfaceRef.current?.contains(event.target))
                return;
            closeAndRestoreFocus();
        };
        document.addEventListener('keydown', closeOnEscape);
        document.addEventListener('pointerdown', closeOutside, true);
        return () => {
            document.removeEventListener('keydown', closeOnEscape);
            document.removeEventListener('pointerdown', closeOutside, true);
        };
    }, [closeAndRestoreFocus, defaultOpen, open]);
    useEffect(() => {
        if (!open || projection !== null || defaultOpen)
            return;
        const disclosure = disclosureRef.current;
        if (disclosure === null)
            return;
        disclosure.focus({ preventScroll: true });
        const containFocus = (event) => {
            if (event.key !== 'Tab')
                return;
            const focusable = [...disclosure.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
            const first = focusable[0];
            const last = focusable.at(-1);
            if (first === undefined || last === undefined)
                return;
            if (event.shiftKey && (document.activeElement === first || document.activeElement === disclosure)) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        disclosure.addEventListener('keydown', containFocus);
        return () => { disclosure.removeEventListener('keydown', containFocus); };
    }, [defaultOpen, open, projection]);
    const positionPopover = useCallback(() => {
        if (!open || defaultOpen || triggerRef.current === null)
            return;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        const edge = 16;
        const gap = 9;
        const idealWidth = projection === null ? 520 : 340;
        const idealHeight = projection === null ? 430 : 330;
        const availableWidth = viewportWidth - edge * 2;
        const width = viewportWidth < 480
            ? availableWidth
            : Math.max(280, Math.min(idealWidth, availableWidth));
        const left = Math.min(Math.max(rect.left, edge), viewportWidth - width - edge);
        const above = rect.top - edge - gap;
        const below = viewportHeight - rect.bottom - edge - gap;
        const placeAbove = above >= Math.min(idealHeight, viewportHeight * 0.56) || above >= below;
        const maxHeight = Math.max(180, Math.min(idealHeight, placeAbove ? above : below));
        setPopoverPosition(placeAbove
            ? { left, width, maxHeight, bottom: viewportHeight - rect.top + gap, top: 'auto' }
            : { left, width, maxHeight, top: rect.bottom + gap, bottom: 'auto' });
    }, [defaultOpen, open, projection]);
    useLayoutEffect(() => {
        if (!open || defaultOpen)
            return;
        positionPopover();
        const visualViewport = window.visualViewport;
        window.addEventListener('resize', positionPopover);
        window.addEventListener('scroll', positionPopover, true);
        visualViewport?.addEventListener('resize', positionPopover);
        visualViewport?.addEventListener('scroll', positionPopover);
        return () => {
            window.removeEventListener('resize', positionPopover);
            window.removeEventListener('scroll', positionPopover, true);
            visualViewport?.removeEventListener('resize', positionPopover);
            visualViewport?.removeEventListener('scroll', positionPopover);
        };
    }, [defaultOpen, open, positionPopover]);
    const run = useCallback(async (action) => {
        /* v8 ignore next -- React synchronously disables every action after the first click; the ref closes the smaller pre-render window. */
        if (pendingRef.current || running)
            return;
        pendingRef.current = true;
        setPending(true);
        setError(null);
        try {
            const result = await action();
            setError(errorText(result, t));
            if (result.ok && !defaultOpen)
                closeAndRestoreFocus();
        }
        catch {
            setError(t('error.generic'));
        }
        finally {
            pendingRef.current = false;
            setPending(false);
        }
    }, [closeAndRestoreFocus, defaultOpen, running, t]);
    if (projection === undefined)
        return null;
    if (projection === null) {
        return (_jsxs("div", { ref: surfaceRef, className: css.dock, "data-mind-garden-state": "inactive", "data-surface": "composer", children: [_jsxs("button", { ref: triggerRef, type: "button", className: css.entry, onClick: () => { setOpen(value => !value); }, "aria-label": t('entry.open'), "aria-expanded": open, "aria-controls": disclosureId, children: [_jsx("span", { className: css.mark, children: _jsx(GardenMarkIcon, { size: 16 }) }), _jsx("span", { className: css.entryTitle, children: t('entry.open') }), _jsx("span", { className: css.visuallyHidden, children: t('entry.hint') }), _jsx(IconChevronDownOutline14, { className: open ? css.chevronOpen : css.chevron })] }), open && (_jsxs("section", { ref: disclosureRef, id: disclosureId, className: css.panel, style: popoverPosition, "data-positioned": popoverPosition === undefined ? 'false' : 'true', role: "dialog", "aria-modal": "true", "aria-labelledby": `${disclosureId}-title`, tabIndex: -1, children: [_jsxs("div", { className: css.panelHeader, children: [_jsxs("div", { children: [_jsx("h3", { id: `${disclosureId}-title`, className: css.title, children: t('disclosure.title') }), _jsx("p", { className: css.disclosure, children: t('disclosure.body') })] }), _jsx("button", { type: "button", className: css.close, onClick: closeAndRestoreFocus, disabled: pending, "aria-label": t('entry.close'), children: _jsx(IconCloseOutline16, { size: 15 }) })] }), _jsx("p", { className: css.acceptance, children: t('disclosure.accept') }), _jsxs("ul", { className: css.contract, "aria-label": t('disclosure.contract'), children: [_jsxs("li", { children: [_jsx(PrivateIcon, { size: 16 }), _jsxs("span", { children: [_jsx("strong", { children: t('disclosure.profile.title') }), _jsx("small", { children: t('disclosure.profile.body') })] })] }), _jsxs("li", { children: [_jsx(IconDataOutline16, { size: 16 }), _jsxs("span", { children: [_jsx("strong", { children: t('disclosure.model.title') }), _jsx("small", { children: t('disclosure.model.body') })] })] }), _jsxs("li", { children: [_jsx(IconCheckOutline16, { size: 16 }), _jsxs("span", { children: [_jsx("strong", { children: t('disclosure.authority.title') }), _jsx("small", { children: t('disclosure.authority.body') })] })] })] }), _jsxs("label", { className: css.consent, htmlFor: consentId, children: [_jsx("input", { id: consentId, type: "checkbox", checked: consentAccepted, disabled: pending, "aria-label": t('disclosure.consent'), "aria-describedby": `${consentId}-hint`, onChange: (event) => { setConsentAccepted(event.target.checked); } }), _jsxs("span", { children: [_jsx("strong", { children: t('disclosure.consent') }), _jsx("small", { id: `${consentId}-hint`, children: t('disclosure.consent.hint') })] })] }), _jsxs("div", { className: css.activationActions, children: [_jsxs("button", { type: "button", className: css.activate, disabled: pending || !consentAccepted, "aria-describedby": `${consentId}-hint`, onClick: () => { void run(() => onActivate(DEFAULT_MODE)); }, children: [_jsx(GardenMarkIcon, { size: 17 }), _jsx("span", { children: t(pending ? 'disclosure.starting' : 'disclosure.start') })] }), _jsx("small", { children: t('disclosure.default') })] }), error !== null && _jsx("p", { className: css.error, role: "alert", children: error })] }))] }));
    }
    const state = projection.state;
    return (_jsx("div", { ref: surfaceRef, className: css.dock, "data-mind-garden-state": "active", "data-surface": defaultOpen ? 'settings' : 'composer', children: _jsxs("section", { className: css.activePanel, children: [defaultOpen ? (_jsxs("div", { className: css.settingsIdentity, children: [_jsx("span", { className: css.markActive, children: _jsx(GardenMarkIcon, { size: 18 }) }), _jsxs("span", { children: [_jsx("strong", { children: t('garden.dialogue.title') }), _jsx("small", { children: t('garden.dialogue.body') })] })] })) : (_jsxs("button", { ref: triggerRef, type: "button", className: css.activeHeader, onClick: () => { setOpen(value => !value); }, "aria-expanded": open, "aria-controls": controlsId, "aria-label": open ? t('garden.collapse') : t('garden.expand'), title: `${t(`intent.${state.supportIntent}`)} · ${t(`mode.${state.mode}`)}`, children: [_jsx("span", { className: css.markActive, children: _jsx(GardenMarkIcon, { size: 15 }) }), _jsx("span", { className: css.activeTitle, children: t(`intent.${state.supportIntent}`) }), _jsx("span", { className: css.postureSignal, "aria-hidden": "true" }), _jsxs("span", { className: css.visuallyHidden, children: [t('garden.title'), " \u00B7 ", t(`intent.${state.supportIntent}`)] }), _jsx(IconChevronDownOutline14, { className: open ? css.chevronOpen : css.chevron })] })), open && (_jsxs("div", { id: controlsId, className: css.controls, style: defaultOpen ? undefined : popoverPosition, "data-positioned": defaultOpen || popoverPosition !== undefined ? 'true' : 'false', children: [!defaultOpen && (_jsxs("div", { className: css.popoverHeader, children: [_jsxs("span", { children: [_jsx("strong", { children: t('garden.dialogue.title') }), _jsxs("small", { children: [t(`mode.${state.mode}`), " \u00B7 ", t(`intent.${state.supportIntent}`)] })] }), _jsx("button", { type: "button", className: css.close, onClick: closeAndRestoreFocus, disabled: pending, "aria-label": t('garden.close'), children: _jsx(IconCloseOutline16, { size: 15 }) })] })), _jsx(ControlSection, { label: t('section.intent'), children: _jsx("div", { className: css.intentList, role: "group", "aria-label": t('section.intent'), children: INTENTS.map(intent => (_jsx("button", { type: "button", className: state.supportIntent === intent ? css.intentActive : css.intent, "aria-pressed": state.supportIntent === intent, disabled: pending || running, onClick: () => { void run(() => onSelectSupportIntent(state.revision, intent)); }, children: t(`intent.${intent}`) }, intent))) }) }), _jsx(ControlSection, { label: t('section.mode'), children: _jsx("div", { className: css.segmented, role: "group", "aria-label": t('section.mode'), children: MODES.map(mode => (_jsxs("button", { type: "button", className: state.mode === mode ? css.segmentActive : css.segment, "aria-pressed": state.mode === mode, disabled: pending || running, onClick: () => { void run(() => onSelectMode(state.revision, mode)); }, children: [_jsx("span", { className: css.optionIcon, children: mode === 'serenity' ? _jsx(ConcernsIcon, { size: 17 }) : _jsx(PhilosophyIcon, { size: 17 }) }), _jsxs("span", { className: css.optionCopy, children: [_jsx("strong", { children: t(`mode.${mode}`) }), defaultOpen && _jsx("small", { children: t(`mode.${mode}.desc`) })] })] }, mode))) }) }), _jsxs("div", { className: css.storage, children: [_jsx(PrivateIcon, { size: 14 }), t('garden.storage')] }), error !== null && _jsx("p", { className: css.error, role: "alert", children: error })] }))] }) }));
}
/** Small labeled control group. */
function ControlSection({ label, children }) {
    return (_jsxs("div", { className: css.controlSection, children: [_jsx("span", { className: css.controlLabel, children: label }), children] }));
}
/** Read the typed projection and adapt it to the compact composer control. */
export function MindGardenDock({ useProjection, useSession, ...props }) {
    const projection = useProjection('mind-garden');
    const running = useSession(state => state.running);
    return _jsx(MindGardenPanel, { projection: projection, running: running, ...props });
}
//# sourceMappingURL=MindGardenDock.js.map