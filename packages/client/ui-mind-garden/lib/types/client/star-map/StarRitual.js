import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Resumable, encrypted first-observation ritual for the Star Map. */
import { useEffect, useState } from 'react';
import css from './StarRitual.module.css';
const SCENES = [1, 2, 3, 4, 5, 6];
const DEFAULT_SCENE_ANSWERS = [
    '1a', '2a', '3a', '4a', '5a', '6a',
];
function inputFromProfile(profile) {
    return {
        displayName: profile.displayName,
        birthMonth: profile.birthMonth,
        birthDay: profile.birthDay,
        birthYear: profile.birthYear,
        birthTime: profile.birthTime,
        birthTimeKnown: profile.birthTimeKnown,
        birthCity: profile.birthCity,
        birthCityKnown: profile.birthCityKnown,
        mbtiMode: profile.mbtiMode,
        mbtiType: profile.mbtiType,
        mbtiAnswers: profile.mbtiAnswers.length === 6 ? profile.mbtiAnswers : DEFAULT_SCENE_ANSWERS,
        selfWords: profile.selfWords,
        observationIntent: profile.observationIntent,
        observerTone: profile.observerTone,
        permissions: profile.permissions,
        reducedMotion: profile.reducedMotion,
    };
}
function optionalNumber(value) {
    return value === '' ? null : Number(value);
}
/** Render the three-stage ritual and persist each forward checkpoint. */
export function StarRitual({ profile, t, onSave, onComplete, onCommit, onExit }) {
    const [step, setStep] = useState(Math.min(profile.onboardingStage, 2));
    const [draft, setDraft] = useState(() => inputFromProfile(profile));
    const [words, setWords] = useState(profile.selfWords.join('，'));
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(false);
    useEffect(() => {
        setDraft(inputFromProfile(profile));
        setWords(profile.selfWords.join('，'));
        setStep(Math.min(profile.onboardingStage, 2));
    }, [profile]);
    const updatePermission = (key, checked) => {
        setDraft(current => ({ ...current, permissions: { ...current.permissions, [key]: checked } }));
    };
    const updateScene = (index, value) => {
        setDraft((current) => {
            const answers = [...current.mbtiAnswers];
            answers[index] = value;
            return { ...current, mbtiAnswers: answers };
        });
    };
    const submit = async (event) => {
        event.preventDefault();
        if (pending)
            return;
        setPending(true);
        setError(false);
        const normalized = {
            ...draft,
            selfWords: words.split(/[，,]/u).map(word => word.trim()).filter(Boolean),
        };
        const result = step < 2
            ? await onSave(normalized, step === 0 ? 1 : 2, profile.version)
            : await onComplete(normalized, profile.version);
        setPending(false);
        if (!result.ok) {
            setError(true);
            return;
        }
        onCommit(result.value);
    };
    return (_jsxs("main", { className: css.ritual, "data-mind-garden-star-ritual": `stage-${step}`, children: [_jsxs("div", { className: css.sky, "aria-hidden": "true", children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {}), _jsx("i", {}), _jsx("i", {})] }), _jsxs("header", { className: css.header, children: [_jsxs("div", { children: [_jsx("h1", { children: t('star.ritual.title') }), _jsx("p", { children: t('star.ritual.subtitle') })] }), _jsx("button", { type: "button", onClick: onExit, children: t('star.ritual.exit') })] }), _jsxs("form", { className: css.card, onSubmit: (event) => { void submit(event); }, children: [_jsx("ol", { className: css.progress, "aria-label": t('star.ritual.progress'), children: ['identity', 'self', 'consent'].map((name, index) => (_jsxs("li", { "data-active": index === step, "data-complete": index < step, children: [_jsx("i", { children: index + 1 }), _jsx("span", { children: t(`star.ritual.step.${name}`) })] }, name))) }), step === 0 && (_jsxs("section", { className: css.stage, children: [_jsxs("div", { className: css.intro, children: [_jsx("h2", { children: t('star.ritual.identity.title') }), _jsx("p", { children: t('star.ritual.identity.body') })] }), _jsxs("label", { className: css.wide, children: [_jsx("span", { children: t('star.ritual.displayName') }), _jsx("input", { value: draft.displayName, maxLength: 80, placeholder: t('star.ritual.displayName.placeholder'), onChange: (event) => { setDraft(current => ({ ...current, displayName: event.target.value })); } })] }), _jsxs("div", { className: css.row3, children: [_jsxs("label", { children: [_jsx("span", { children: t('star.ritual.birthYear') }), _jsx("input", { type: "number", min: "1900", max: "2200", value: draft.birthYear ?? '', onChange: (event) => { setDraft(current => ({ ...current, birthYear: optionalNumber(event.target.value) })); } })] }), _jsxs("label", { children: [_jsx("span", { children: t('star.ritual.birthMonth') }), _jsx("input", { type: "number", min: "1", max: "12", value: draft.birthMonth ?? '', onChange: (event) => { setDraft(current => ({ ...current, birthMonth: optionalNumber(event.target.value) })); } })] }), _jsxs("label", { children: [_jsx("span", { children: t('star.ritual.birthDay') }), _jsx("input", { type: "number", min: "1", max: "31", value: draft.birthDay ?? '', onChange: (event) => { setDraft(current => ({ ...current, birthDay: optionalNumber(event.target.value) })); } })] })] }), _jsxs("div", { className: css.split, children: [_jsxs("label", { className: css.optional, children: [_jsxs("span", { children: [_jsx("input", { type: "checkbox", checked: draft.birthTimeKnown, onChange: (event) => { setDraft(current => ({ ...current, birthTimeKnown: event.target.checked, birthTime: event.target.checked ? current.birthTime : '' })); } }), t('star.ritual.timeKnown')] }), draft.birthTimeKnown && _jsx("input", { "aria-label": t('star.ritual.birthTime'), type: "time", value: draft.birthTime, onChange: (event) => { setDraft(current => ({ ...current, birthTime: event.target.value })); } })] }), _jsxs("label", { className: css.optional, children: [_jsxs("span", { children: [_jsx("input", { type: "checkbox", checked: draft.birthCityKnown, onChange: (event) => { setDraft(current => ({ ...current, birthCityKnown: event.target.checked, birthCity: event.target.checked ? current.birthCity : '' })); } }), t('star.ritual.cityKnown')] }), draft.birthCityKnown && _jsx("input", { "aria-label": t('star.ritual.birthCity'), value: draft.birthCity, onChange: (event) => { setDraft(current => ({ ...current, birthCity: event.target.value })); } })] })] })] })), step === 1 && (_jsxs("section", { className: css.stage, children: [_jsxs("div", { className: css.intro, children: [_jsx("h2", { children: t('star.ritual.self.title') }), _jsx("p", { children: t('star.ritual.self.body') })] }), _jsx("div", { className: css.choiceGrid, children: ['known', 'scenes', 'observe'].map(mode => (_jsxs("label", { "data-selected": draft.mbtiMode === mode, children: [_jsx("input", { type: "radio", name: "mbti-mode", checked: draft.mbtiMode === mode, onChange: () => { setDraft(current => ({ ...current, mbtiMode: mode })); } }), _jsx("span", { children: t(`star.ritual.mbti.${mode}`) })] }, mode))) }), draft.mbtiMode === 'known' && (_jsxs("label", { className: css.wide, children: [_jsx("span", { children: t('star.ritual.mbti.type') }), _jsx("input", { value: draft.mbtiType, maxLength: 4, placeholder: "INFP", onChange: (event) => { setDraft(current => ({ ...current, mbtiType: event.target.value.toUpperCase() })); } })] })), draft.mbtiMode === 'scenes' && (_jsx("div", { className: css.scenes, children: SCENES.map((number, index) => (_jsxs("fieldset", { children: [_jsx("legend", { children: t(`star.ritual.scene.${number}`) }), ['a', 'b'].map((side) => {
                                            const value = `${number}${side}`;
                                            return _jsxs("label", { "data-selected": draft.mbtiAnswers[index] === value, children: [_jsx("input", { type: "radio", name: `scene-${number}`, checked: draft.mbtiAnswers[index] === value, onChange: () => { updateScene(index, value); } }), _jsx("span", { children: t(`star.ritual.scene.${number}${side}`) })] }, side);
                                        })] }, number))) }))] })), step === 2 && (_jsxs("section", { className: css.stage, children: [_jsxs("div", { className: css.intro, children: [_jsx("h2", { children: t('star.ritual.consent.title') }), _jsx("p", { children: t('star.ritual.consent.body') })] }), _jsxs("label", { className: css.wide, children: [_jsx("span", { children: t('star.ritual.words') }), _jsx("input", { value: words, placeholder: t('star.ritual.words.placeholder'), onChange: (event) => { setWords(event.target.value); } })] }), _jsxs("label", { className: css.wide, children: [_jsx("span", { children: t('star.ritual.intent') }), _jsx("textarea", { rows: 3, value: draft.observationIntent, placeholder: t('star.ritual.intent.placeholder'), onChange: (event) => { setDraft(current => ({ ...current, observationIntent: event.target.value })); } })] }), _jsxs("fieldset", { className: css.permissionBox, children: [_jsx("legend", { children: t('star.ritual.permissions') }), _jsx("div", { children: [
                                            ['dailyReflections', 'reflections'],
                                            ['confirmedMemories', 'memories'],
                                            ['openQuestions', 'questions'],
                                            ['periodReviews', 'reviews'],
                                        ].map(([key, label]) => (_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: draft.permissions[key], onChange: (event) => { updatePermission(key, event.target.checked); } }), _jsx("span", { children: t(`star.profile.permission.${label}`) })] }, key))) }), _jsx("small", { children: t('star.ritual.private') })] }), _jsx("div", { className: css.choiceGrid, children: ['gentle', 'direct', 'mystic'].map(tone => (_jsxs("label", { "data-selected": draft.observerTone === tone, children: [_jsx("input", { type: "radio", name: "observer-tone", checked: draft.observerTone === tone, onChange: () => { setDraft(current => ({ ...current, observerTone: tone })); } }), _jsx("span", { children: t(`star.profile.tone.${tone}`) })] }, tone))) }), _jsxs("label", { className: css.motion, children: [_jsx("input", { type: "checkbox", checked: draft.reducedMotion, onChange: (event) => { setDraft(current => ({ ...current, reducedMotion: event.target.checked })); } }), _jsx("span", { children: t('star.profile.motion') })] })] })), error && _jsx("p", { className: css.error, role: "alert", children: t('star.ritual.error') }), _jsxs("footer", { className: css.actions, children: [_jsx("button", { type: "button", disabled: pending || step === 0, onClick: () => { setStep(current => Math.max(0, current - 1)); }, children: t('star.ritual.back') }), _jsx("button", { type: "submit", className: css.primary, disabled: pending, children: pending ? t('star.ritual.saving') : t(step === 2 ? 'star.ritual.complete' : 'star.ritual.next') })] })] })] }));
}
//# sourceMappingURL=StarRitual.js.map