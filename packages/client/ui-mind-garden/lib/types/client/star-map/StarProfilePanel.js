import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** User-controlled Star Map authorizations and observation preferences. */
import { useEffect, useState } from 'react';
import { settleMindGardenAction } from "../settle-action.js";
import css from './StarProfilePanel.module.css';
/** Edit the privacy-sensitive subset that governs future Star Observer work. */
export function StarProfilePanel({ profile, t, onSave, onCommit, onClose }) {
    const [permissions, setPermissions] = useState(profile.permissions);
    const [tone, setTone] = useState(profile.observerTone);
    const [intent, setIntent] = useState(profile.observationIntent);
    const [reducedMotion, setReducedMotion] = useState(profile.reducedMotion);
    const [pending, setPending] = useState(false);
    const [notice, setNotice] = useState(null);
    useEffect(() => {
        setPermissions(profile.permissions);
        setTone(profile.observerTone);
        setIntent(profile.observationIntent);
        setReducedMotion(profile.reducedMotion);
    }, [profile]);
    const submit = async (event) => {
        event.preventDefault();
        if (pending)
            return;
        setPending(true);
        setNotice(null);
        const result = await settleMindGardenAction(() => onSave(profile, permissions, tone, intent, reducedMotion));
        setPending(false);
        if (!result.ok) {
            setNotice('error');
            return;
        }
        onCommit(result.value);
        setNotice('saved');
    };
    return (_jsxs("aside", { className: css.panel, "aria-label": t('star.profile.title'), children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("h2", { children: t('star.profile.title') }), _jsx("p", { children: t('star.profile.subtitle') })] }), _jsx("button", { type: "button", onClick: onClose, children: t('star.profile.close') })] }), _jsxs("form", { onSubmit: (event) => { void submit(event); }, children: [_jsxs("label", { className: css.intent, children: [_jsx("span", { children: t('star.profile.intent') }), _jsx("textarea", { rows: 3, value: intent, onChange: (event) => { setIntent(event.target.value); } })] }), _jsxs("fieldset", { children: [_jsx("legend", { children: t('star.profile.tone') }), _jsx("div", { className: css.tones, children: ['gentle', 'direct', 'mystic'].map(value => _jsxs("label", { "data-selected": tone === value, children: [_jsx("input", { type: "radio", name: "profile-tone", checked: tone === value, onChange: () => { setTone(value); } }), _jsx("span", { children: t(`star.profile.tone.${value}`) })] }, value)) })] }), _jsxs("fieldset", { children: [_jsx("legend", { children: t('star.profile.permissions') }), _jsx("div", { className: css.permissions, children: [
                                    ['dailyReflections', 'reflections'],
                                    ['confirmedMemories', 'memories'],
                                    ['openQuestions', 'questions'],
                                    ['periodReviews', 'reviews'],
                                ].map(([key, label]) => _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: permissions[key], onChange: (event) => { setPermissions(current => ({ ...current, [key]: event.target.checked })); } }), _jsx("span", { children: t(`star.profile.permission.${label}`) })] }, key)) })] }), _jsxs("label", { className: css.motion, children: [_jsx("input", { type: "checkbox", checked: reducedMotion, onChange: (event) => { setReducedMotion(event.target.checked); } }), _jsx("span", { children: t('star.profile.motion') })] }), notice !== null && _jsx("p", { className: css[notice], role: "status", children: t(`star.profile.${notice}`) }), _jsx("button", { className: css.save, type: "submit", disabled: pending, children: pending ? t('star.ritual.saving') : t('star.profile.save') })] })] }));
}
//# sourceMappingURL=StarProfilePanel.js.map