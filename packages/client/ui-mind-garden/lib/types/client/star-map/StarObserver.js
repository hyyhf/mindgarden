import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Evidence-bound card draw and human calibration surface for the Star Observer. */
import { useEffect, useState } from 'react';
import { IconCloseOutline16, IconPlusOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './StarObserver.module.css';
import { StarObserverDialogue } from "./StarObserverDialogue.js";
import { PrivateIcon, StarMapIcon } from "../GardenIcons.js";
const DECKS = ['current-self', 'unfolded-self', 'inner-debate'];
function browserLocalDate(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function confidenceLabel(card, t) {
    if (card.cardKind === 'imagination')
        return t('star.observer.kind.imagination');
    if (card.confidence >= 0.65)
        return t('star.observer.confidence.grounded');
    return t('star.observer.confidence.tentative');
}
/** Render one resumable observer desk without owning Remote or session context. */
export function StarObserver({ profile, cards, activeCard, t, onDraw, onCalibrate, onFinalize, onContinue, onApplyRevision, }) {
    const authorizedSourceCount = Object.values(profile.permissions).filter(Boolean).length;
    const [open, setOpen] = useState(activeCard !== null);
    const [selectedId, setSelectedId] = useState(activeCard === null ? null : String(activeCard.id));
    const [deck, setDeck] = useState('current-self');
    const [question, setQuestion] = useState('');
    const card = activeCard ?? cards.find(item => String(item.id) === selectedId) ?? null;
    const savedCards = cards.filter(item => item.status === 'saved');
    const [correction, setCorrection] = useState(card?.calibration?.correction ?? '');
    const [pending, setPending] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        if (activeCard !== null) {
            setOpen(true);
            setSelectedId(String(activeCard.id));
        }
        else if (selectedId !== null && !cards.some(item => String(item.id) === selectedId)) {
            setSelectedId(null);
        }
        setCorrection(card?.calibration?.correction ?? '');
    }, [activeCard, card, cards, selectedId]);
    const draw = async () => {
        if (pending !== null)
            return;
        setPending('draw');
        setError(false);
        const result = await onDraw({
            deck,
            question: question.trim(),
            observedLocalDate: browserLocalDate(),
        });
        setPending(null);
        if (!result.ok)
            setError(true);
    };
    const calibrate = async (verdict) => {
        if (card === null || pending !== null)
            return;
        setPending('calibrate');
        setError(false);
        const result = await onCalibrate({
            id: card.id,
            ifVersion: card.version,
            verdict,
            ...(correction.trim().length === 0 ? {} : { correction: correction.trim() }),
        });
        setPending(null);
        if (!result.ok)
            setError(true);
    };
    const finalize = async (action) => {
        if (card === null || pending !== null)
            return;
        setPending('finalize');
        setError(false);
        const result = await onFinalize({ id: card.id, ifVersion: card.version, action });
        setPending(null);
        if (!result.ok) {
            setError(true);
            return;
        }
        if (action === 'dissolve')
            setSelectedId(null);
    };
    return (_jsxs("aside", { className: css.observatory, "data-open": open, "data-active-card": card !== null, children: [_jsxs("button", { type: "button", className: css.summon, "aria-expanded": open, onClick: () => { setOpen(value => !value); }, children: [_jsx(StarMapIcon, { size: 17 }), _jsxs("span", { children: [_jsx("strong", { children: t('star.observer.summon') }), _jsx("small", { children: card === null ? t('star.observer.summon.hint') : t('star.observer.awaiting') })] }), savedCards.length > 0 && _jsx("b", { children: savedCards.length })] }), open && (_jsxs("section", { className: css.desk, "aria-label": t('star.observer.title'), "aria-live": "polite", children: [_jsxs("header", { className: css.deskHeader, children: [_jsx("h2", { children: t('star.observer.title') }), _jsx("button", { type: "button", onClick: () => { setOpen(false); }, "aria-label": t('star.observer.close'), children: _jsx(IconCloseOutline16, { size: 15 }) })] }), activeCard === null && savedCards.length > 0 && (_jsxs("nav", { className: css.cardShelf, "aria-label": t('star.observer.saved.title'), children: [_jsxs("button", { type: "button", "data-selected": card === null, onClick: () => { setSelectedId(null); }, children: [_jsx(IconPlusOutline16, { size: 14 }), t('star.observer.saved.new')] }), savedCards.map(saved => (_jsxs("button", { type: "button", "data-selected": card?.id === saved.id, onClick: () => { setSelectedId(String(saved.id)); }, children: [_jsx(StarMapIcon, { size: 14 }), saved.title] }, saved.id)))] })), card === null ? (_jsxs("div", { className: css.drawDesk, children: [_jsx("p", { children: t('star.observer.disclosure') }), _jsxs("fieldset", { children: [_jsx("legend", { children: t('star.observer.deck') }), _jsx("div", { className: css.decks, children: DECKS.map(value => (_jsxs("button", { type: "button", "data-selected": deck === value, "aria-pressed": deck === value, onClick: () => { setDeck(value); }, children: [_jsx("i", { "aria-hidden": "true" }), _jsx("span", { children: t(`star.observer.deck.${value}`) })] }, value))) })] }), _jsxs("label", { className: css.question, children: [_jsx("span", { children: t('star.observer.question') }), _jsx("textarea", { value: question, maxLength: 1200, placeholder: t('star.observer.question.placeholder'), onChange: (event) => { setQuestion(event.target.value); } })] }), _jsxs("div", { className: css.permissionLine, children: [_jsxs("span", { children: [_jsx(PrivateIcon, { size: 15 }), authorizedSourceCount, "/4"] }), _jsxs("p", { children: [_jsx("strong", { children: t('star.observer.permission.title') }), t('star.observer.permission.body').replace('{count}', String(authorizedSourceCount))] })] }), error && _jsx("p", { className: css.error, role: "alert", children: t('star.observer.error') }), _jsx("button", { type: "button", className: css.draw, disabled: pending !== null, onClick: () => { void draw(); }, children: pending === 'draw' ? _jsxs(_Fragment, { children: [_jsx("i", { "aria-hidden": "true" }), t('star.observer.drawing')] }) : t('star.observer.draw') })] })) : (_jsxs("article", { className: css.card, "data-kind": card.cardKind, children: [_jsx("div", { className: css.cardGlow, "aria-hidden": "true" }), _jsxs("div", { className: css.cardMeta, children: [_jsx("span", { children: t(`star.observer.deck.${card.deck}`) }), _jsxs("span", { children: [confidenceLabel(card, t), " \u00B7 ", Math.round(card.confidence * 100), "%"] })] }), _jsx("h3", { children: card.title }), _jsx("p", { className: css.frontText, children: card.frontText }), _jsxs("dl", { className: css.analysis, children: [_jsxs("div", { children: [_jsx("dt", { children: t('star.observer.analysis.situation') }), _jsx("dd", { children: card.analysis.situation })] }), _jsxs("div", { children: [_jsx("dt", { children: t('star.observer.analysis.core') }), _jsx("dd", { children: card.analysis.coreIssue })] }), _jsxs("div", { children: [_jsx("dt", { children: t('star.observer.analysis.tradeoff') }), _jsx("dd", { children: card.analysis.tradeoff })] }), _jsxs("div", { children: [_jsx("dt", { children: t('star.observer.analysis.guidance') }), _jsx("dd", { children: card.analysis.guidance })] })] }), card.evidence.length > 0 ? (_jsxs("details", { className: css.evidence, children: [_jsxs("summary", { children: [t('star.observer.evidence'), " \u00B7 ", card.evidence.length] }), card.evidence.map(item => _jsx("p", { children: item.summary }, item.id))] })) : _jsx("p", { className: css.imagination, children: t('star.observer.imagination') }), _jsx("blockquote", { children: card.openQuestion }), _jsx(StarObserverDialogue, { card: card, t: t, onContinue: onContinue, onApplyRevision: onApplyRevision }), _jsxs("div", { className: css.calibration, children: [_jsx("strong", { children: t('star.observer.calibrate') }), _jsx("textarea", { value: correction, placeholder: t('star.observer.correction.placeholder'), onChange: (event) => { setCorrection(event.target.value); } }), _jsxs("div", { children: [_jsx("button", { type: "button", disabled: pending !== null, "data-selected": card.calibration?.verdict === 'resonates', onClick: () => { void calibrate('resonates'); }, children: t('star.observer.resonates') }), _jsx("button", { type: "button", disabled: pending !== null, "data-selected": card.calibration?.verdict === 'uncertain', onClick: () => { void calibrate('uncertain'); }, children: t('star.observer.uncertain') }), _jsx("button", { type: "button", disabled: pending !== null || correction.trim().length === 0, "data-selected": card.calibration?.verdict === 'rejects', onClick: () => { void calibrate('rejects'); }, children: t('star.observer.rejects') })] })] }), error && _jsx("p", { className: css.error, role: "alert", children: t('star.observer.error') }), card.status === 'draft' ? (_jsxs("footer", { children: [_jsx("button", { type: "button", disabled: pending !== null, onClick: () => { void finalize('dissolve'); }, children: t('star.observer.dissolve') }), _jsx("button", { type: "button", className: css.save, disabled: pending !== null, onClick: () => { void finalize('save'); }, children: t('star.observer.save') })] })) : _jsxs("p", { className: css.savedState, children: [_jsx(StarMapIcon, { size: 14 }), t('star.observer.saved.state')] })] })), _jsx("small", { className: css.boundary, children: t('star.observer.boundary') })] }))] }));
}
//# sourceMappingURL=StarObserver.js.map