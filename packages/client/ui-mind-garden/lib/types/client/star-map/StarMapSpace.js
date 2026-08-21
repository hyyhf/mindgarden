import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Harness-native constellation space backed by an encrypted Star Map profile. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createGardenStarMap } from "./model.js";
import { StarField } from "./StarField.js";
import { StarProfilePanel } from "./StarProfilePanel.js";
import { StarRitual } from "./StarRitual.js";
import { StarObserver } from "./StarObserver.js";
import css from './StarMapSpace.module.css';
function profileRequest(profile, changes) {
    if (profile.version === null)
        return null;
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
        mbtiAnswers: profile.mbtiAnswers,
        selfWords: profile.selfWords,
        ...changes,
        ifVersion: profile.version,
    };
}
/** Render the resumable ritual or the durable interactive 3D constellation and codex. */
export function StarMapSpace({ questions, reviews, mode, t, onBack, onOverview, onSaveRitual, onCompleteRitual, onUpdateProfile, onUpdateTrait, onDrawCard, onCalibrateCard, onFinalizeCard, onContinueCard, onApplyCardRevision, }) {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [selectedId, setSelectedId] = useState('center');
    const [traitPending, setTraitPending] = useState(false);
    const refresh = useCallback(async () => {
        setLoading(true);
        setLoadError(false);
        const result = await onOverview();
        setLoading(false);
        if (!result.ok) {
            setLoadError(true);
            return;
        }
        setOverview(result.value);
    }, [onOverview]);
    useEffect(() => {
        void refresh();
    }, [refresh]);
    const runCardAction = useCallback(async (operation) => {
        const result = await operation();
        if (!result.ok)
            return result;
        const latest = await onOverview();
        if (latest.ok)
            setOverview(latest.value);
        return result;
    }, [onOverview]);
    if (loading && overview === null) {
        return _jsxs("main", { className: css.state, children: [_jsx("span", { className: css.pulse, "aria-hidden": "true" }), _jsx("p", { children: t('star.loading') }), _jsx("button", { type: "button", onClick: onBack, children: t('star.back') })] });
    }
    if (loadError || overview === null) {
        return _jsxs("main", { className: css.state, children: [_jsx("p", { children: t('star.error') }), _jsxs("div", { children: [_jsx("button", { type: "button", onClick: () => { void refresh(); }, children: t('review.retry') }), _jsx("button", { type: "button", onClick: onBack, children: t('star.back') })] })] });
    }
    if (!overview.profile.onboardingCompleted) {
        return _jsx(StarRitual, { profile: overview.profile, t: t, onSave: async (input, stage, version) => await onSaveRitual({ ...input, onboardingStage: stage, ifVersion: version }), onComplete: async (input, version) => await onCompleteRitual({ ...input, ifVersion: version }), onCommit: setOverview, onExit: onBack });
    }
    return _jsx(CompletedStarMap, { overview: overview, questions: questions, reviews: reviews, mode: mode, t: t, onBack: onBack, profileOpen: profileOpen, setProfileOpen: setProfileOpen, selectedId: selectedId, setSelectedId: setSelectedId, traitPending: traitPending, setTraitPending: setTraitPending, onCommit: setOverview, onUpdateProfile: async (profile, permissions, observerTone, observationIntent, reducedMotion) => {
            const request = profileRequest(profile, { permissions, observerTone, observationIntent, reducedMotion });
            return request === null ? { ok: false, code: 'star-ritual-required' } : await onUpdateProfile(request);
        }, onUpdateTrait: onUpdateTrait, onDrawCard: request => runCardAction(() => onDrawCard(request)), onCalibrateCard: request => runCardAction(() => onCalibrateCard(request)), onFinalizeCard: request => runCardAction(() => onFinalizeCard(request)), onContinueCard: request => runCardAction(() => onContinueCard(request)), onApplyCardRevision: request => runCardAction(() => onApplyCardRevision(request)) });
}
function CompletedStarMap({ overview, questions, reviews, mode, t, onBack, profileOpen, setProfileOpen, selectedId, setSelectedId, traitPending, setTraitPending, onCommit, onUpdateProfile, onUpdateTrait, onDrawCard, onCalibrateCard, onFinalizeCard, onContinueCard, onApplyCardRevision, }) {
    const visibleQuestions = overview.profile.permissions.openQuestions ? questions : [];
    const visibleReviews = overview.profile.permissions.periodReviews ? reviews : [];
    const model = useMemo(() => createGardenStarMap(visibleQuestions, visibleReviews, mode, {
        center: t('star.center'),
        serenity: t('star.center.serenity'),
        clarity: t('star.center.clarity'),
        since: t('star.question.since'),
        unnamedReview: t('star.review.unnamed'),
        reviewDetail: t('star.review.detail'),
        traitDetail: t('star.trait.detail'),
    }, overview.profile, overview.traits), [mode, overview, t, visibleQuestions, visibleReviews]);
    const selected = model.nodes.find(node => node.id === selectedId) ?? model.nodes[0];
    const selectedTrait = selected.kind === 'trait'
        ? overview.traits.find(trait => `trait:${String(trait.id)}` === selected.id)
        : undefined;
    const questionsInSky = model.nodes.filter(node => node.kind === 'question').length;
    const reviewsInSky = model.nodes.filter(node => node.kind === 'review').length;
    const traitsInSky = model.nodes.filter(node => node.kind === 'trait').length;
    const retireTrait = async () => {
        if (selectedTrait === undefined || traitPending)
            return;
        setTraitPending(true);
        const result = await onUpdateTrait({
            id: selectedTrait.id,
            ifVersion: selectedTrait.version,
            status: 'retired',
        });
        setTraitPending(false);
        if (!result.ok)
            return;
        onCommit({ ...overview, traits: overview.traits.filter(trait => trait.id !== result.value.id) });
        setSelectedId('center');
    };
    return (_jsxs("main", { className: css.space, "data-mind-garden-star-map": "active", children: [_jsx(StarField, { model: model, fallback: t('star.fallback'), onSelect: setSelectedId, reducedMotion: overview.profile.reducedMotion, selectedId: selected.id }), _jsxs("header", { className: css.header, children: [_jsxs("div", { children: [_jsx("h1", { children: t('star.title') }), _jsx("p", { children: t('star.subtitle') })] }), _jsxs("div", { className: css.headerActions, children: [_jsx("button", { type: "button", className: css.back, onClick: () => { setProfileOpen(!profileOpen); }, children: t('star.profile.open') }), _jsx("button", { type: "button", className: css.back, onClick: onBack, children: t('star.back') })] })] }), _jsxs("div", { className: css.metrics, "aria-label": t('star.metrics'), children: [_jsxs("span", { children: [_jsx("strong", { children: traitsInSky }), t('star.metric.traits')] }), _jsxs("span", { children: [_jsx("strong", { children: questionsInSky }), t('star.metric.questions')] }), _jsxs("span", { children: [_jsx("strong", { children: reviewsInSky }), t('star.metric.reviews')] }), _jsxs("span", { children: [_jsx("strong", { children: model.links.length }), t('star.metric.links')] })] }), _jsx(StarObserver, { profile: overview.profile, cards: overview.cards, activeCard: overview.activeCard, t: t, onDraw: onDrawCard, onCalibrate: onCalibrateCard, onFinalize: onFinalizeCard, onContinue: onContinueCard, onApplyRevision: onApplyCardRevision }), profileOpen && (_jsx(StarProfilePanel, { profile: overview.profile, t: t, onSave: onUpdateProfile, onCommit: onCommit, onClose: () => { setProfileOpen(false); } })), _jsxs("section", { className: css.codex, "aria-label": t('star.codex'), children: [_jsxs("div", { className: css.selected, "data-kind": selected.kind, children: [_jsx("span", { children: t(`star.kind.${selected.kind}`) }), _jsx("h2", { children: selected.title }), _jsx("p", { children: selected.detail }), selectedTrait !== undefined && _jsx("button", { type: "button", className: css.retire, disabled: traitPending, onClick: () => { void retireTrait(); }, children: t('star.trait.retire') }), _jsx("small", { children: t('star.selected.hint') })] }), _jsx("div", { className: css.nodeList, children: model.nodes.map(node => (_jsxs("button", { type: "button", "data-kind": node.kind, "data-selected": node.id === selected.id, "aria-pressed": node.id === selected.id, onClick: () => { setSelectedId(node.id); }, children: [_jsx("i", { "aria-hidden": "true" }), _jsx("span", { children: node.title })] }, node.id))) })] }), _jsx("p", { className: css.controls, children: t('star.controls') })] }));
}
//# sourceMappingURL=StarMapSpace.js.map