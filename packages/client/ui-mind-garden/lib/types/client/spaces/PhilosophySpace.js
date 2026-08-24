import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Confirmation-gated contemplations and life principles. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconCheckOutline16, IconCloseOutline16, IconSendOutline14, IconSparkle16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { calendarStamp } from "../calendar.js";
import { PhilosophyIcon, PrivateIcon } from "../GardenIcons.js";
import { PHILOSOPHY_FOLIO_ROOM_V3 } from "../generated-assets.js";
import shared from './GardenSpace.module.css';
import css from './PhilosophySpace.module.css';
const PRINCIPLE_STATUSES = ['trying', 'adopted', 'questioning', 'retired'];
/** Render contemplation evidence, inert proposals, and user-governed principle histories. */
export function PhilosophySpace({ today, onListContemplations, onListPrincipleProposals, onListPrinciples, onAcceptPrincipleProposal, onRejectPrincipleProposal, onRevisePrincipleStatus, onDraftConversation = () => undefined, t, }) {
    const [contemplations, setContemplations] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [principles, setPrinciples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(false);
    const [notice, setNotice] = useState(null);
    const requestRef = useRef(0);
    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        const [contemplationResult, proposalResult, principleResult] = await Promise.all([
            onListContemplations(),
            onListPrincipleProposals(),
            onListPrinciples(),
        ]);
        if (request !== requestRef.current)
            return;
        if (!contemplationResult.ok || !proposalResult.ok || !principleResult.ok) {
            setError(true);
            setLoading(false);
            return;
        }
        setContemplations(contemplationResult.value);
        setProposals(proposalResult.value);
        setPrinciples(principleResult.value);
        setError(false);
        setLoading(false);
    }, [onListContemplations, onListPrincipleProposals, onListPrinciples]);
    useEffect(() => {
        void refresh();
        return () => { requestRef.current++; };
    }, [refresh]);
    async function mutate(action, success) {
        setPending(true);
        setError(false);
        setNotice(null);
        const result = await action();
        setPending(false);
        if (!result.ok) {
            setError(true);
            return;
        }
        setNotice(success);
        await refresh();
    }
    function reviseStatus(principle, status) {
        void mutate(async () => await onRevisePrincipleStatus(principle, status, calendarStamp(today)), 'philosophy.notice.revised');
    }
    function draftContemplation(item) {
        onDraftConversation(t('philosophy.draft.contemplation').replace('{content}', item.markdown));
        setNotice('philosophy.notice.drafted');
    }
    function draftPrinciple(item) {
        onDraftConversation(t('philosophy.draft.principle')
            .replace('{expression}', item.current.expression)
            .replace('{counterexample}', item.current.counterexample));
        setNotice('philosophy.notice.drafted');
    }
    const confirmedContemplations = contemplations.filter(item => item.status === 'confirmed').length;
    const pendingProposals = proposals.filter(item => item.status === 'proposed').length;
    const activePrinciples = principles.filter(item => item.status !== 'retired').length;
    return (_jsxs("main", { className: `${shared.space} ${css.philosophy}`, "data-mind-garden-space": "philosophy", children: [_jsxs("header", { className: css.hero, style: { '--mg-philosophy-scene': `url("${PHILOSOPHY_FOLIO_ROOM_V3}")` }, children: [_jsxs("div", { className: css.heroCopy, children: [_jsx(PhilosophyIcon, { size: 22 }), _jsx("h1", { children: t('philosophy.title') }), _jsx("p", { children: t('philosophy.subtitle') }), _jsxs("span", { className: css.privateLine, children: [_jsx(PrivateIcon, { size: 15 }), t('philosophy.private')] })] }), _jsx("figure", { className: css.specimen, "aria-label": t('philosophy.instrument.label'), children: _jsxs("figcaption", { children: [_jsxs("span", { children: [_jsx("strong", { children: confirmedContemplations }), t('philosophy.instrument.notes')] }), _jsxs("span", { children: [_jsx("strong", { children: pendingProposals }), t('philosophy.instrument.proposals')] }), _jsxs("span", { children: [_jsx("strong", { children: activePrinciples }), t('philosophy.instrument.principles')] })] }) })] }), notice !== null && _jsx("p", { className: shared.notice, role: "status", children: t(notice) }), error && _jsx("p", { className: shared.error, role: "alert", children: t('philosophy.error') }), loading ? _jsx("p", { className: css.loading, role: "status", children: t('philosophy.loading') }) : (_jsxs("div", { className: css.sections, children: [_jsxs("section", { className: `${css.section} ${css.contemplationSection}`, "aria-labelledby": "garden-contemplations", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsx("span", { children: _jsx(IconSparkle16, {}) }), _jsxs("div", { children: [_jsx("h2", { id: "garden-contemplations", children: t('philosophy.contemplations') }), _jsx("p", { children: t('philosophy.contemplationsHint') })] })] }), contemplations.length === 0 ? _jsx("p", { className: css.empty, children: t('philosophy.emptyContemplations') }) : (_jsx("ol", { className: css.list, children: contemplations.map((item, index) => (_jsxs("li", { className: css.note, "data-status": item.status, children: [_jsx("span", { className: css.sequence, "aria-hidden": "true", children: String(index + 1).padStart(2, '0') }), _jsxs("article", { children: [_jsxs("header", { children: [_jsx("small", { children: t(`philosophy.contemplation.${item.status}`) }), _jsx("time", { children: new Date(item.updatedAt).toLocaleDateString() })] }), _jsx("p", { children: item.markdown }), item.status === 'confirmed' && (_jsx("footer", { children: _jsxs("button", { className: shared.quietButton, type: "button", onClick: () => { draftContemplation(item); }, children: [_jsx(IconSendOutline14, {}), t('philosophy.continue')] }) }))] })] }, String(item.id)))) }))] }), _jsxs("section", { className: `${css.section} ${css.proposalSection}`, "aria-labelledby": "garden-proposals", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsx("span", { children: _jsx(IconSparkle16, {}) }), _jsxs("div", { children: [_jsx("h2", { id: "garden-proposals", children: t('philosophy.proposals') }), _jsx("p", { children: t('philosophy.proposalsHint') })] })] }), proposals.length === 0 ? _jsx("p", { className: css.empty, children: t('philosophy.emptyProposals') }) : (_jsx("ul", { className: css.proposalList, children: proposals.map(item => (_jsxs("li", { className: css.proposal, "data-status": item.status, children: [_jsxs("header", { children: [_jsx("small", { children: t(`philosophy.proposal.${item.status}`) }), _jsx("strong", { children: item.content.expression })] }), _jsxs("dl", { className: css.proposalMeaning, children: [_jsxs("div", { children: [_jsx("dt", { children: t('philosophy.formation') }), _jsx("dd", { children: item.content.formationContext })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.quote') }), _jsx("dd", { children: item.content.userQuote })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.counterexample') }), _jsx("dd", { children: item.content.counterexample })] })] }), item.status === 'proposed' && (_jsxs("div", { className: css.proposalActions, children: [_jsxs("button", { className: shared.button, type: "button", disabled: pending, onClick: () => {
                                                        void mutate(async () => await onAcceptPrincipleProposal(item, calendarStamp(today)), 'philosophy.notice.accepted');
                                                    }, children: [_jsx(IconCheckOutline16, {}), t('philosophy.accept')] }), _jsxs("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => {
                                                        void mutate(async () => await onRejectPrincipleProposal(item), 'philosophy.notice.rejected');
                                                    }, children: [_jsx(IconCloseOutline16, {}), t('philosophy.reject')] })] }))] }, String(item.id)))) }))] }), _jsxs("section", { className: `${css.section} ${css.principleSection}`, "aria-labelledby": "garden-principles", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsx("span", { children: _jsx(PhilosophyIcon, { size: 17 }) }), _jsxs("div", { children: [_jsx("h2", { id: "garden-principles", children: t('philosophy.principles') }), _jsx("p", { children: t('philosophy.principlesHint') })] })] }), principles.length === 0 ? _jsx("p", { className: css.empty, children: t('philosophy.emptyPrinciples') }) : (_jsx("ol", { className: css.principles, children: principles.map((item, index) => (_jsxs("li", { className: css.principle, "data-status": item.status, children: [_jsx("span", { className: css.folioNumber, children: String(index + 1).padStart(2, '0') }), _jsxs("article", { children: [_jsxs("header", { children: [_jsx("h3", { children: item.current.expression }), _jsx("select", { className: css.statusSelect, "aria-label": t('philosophy.statusFor').replace('{principle}', item.current.expression), value: item.status, disabled: pending, onChange: (event) => { reviseStatus(item, event.target.value); }, children: PRINCIPLE_STATUSES.map(status => (_jsx("option", { value: status, children: t(`philosophy.principle.${status}`) }, status))) })] }), _jsxs("dl", { className: css.meaning, children: [_jsxs("div", { children: [_jsx("dt", { children: t('philosophy.formation') }), _jsx("dd", { children: item.current.formationContext })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.quote') }), _jsx("dd", { children: item.current.userQuote })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.counterexample') }), _jsx("dd", { children: item.current.counterexample })] })] }), _jsx("ul", { className: css.tags, "aria-label": t('philosophy.appliesTo'), children: item.current.appliesTo.map(scope => _jsx("li", { children: scope }, scope)) }), _jsxs("details", { className: css.versions, children: [_jsx("summary", { children: t('philosophy.versionCount').replace('{count}', String(item.versions.length)) }), _jsx("ol", { children: item.versions.map(version => (_jsxs("li", { children: [_jsx("time", { children: version.stamp.localDate }), _jsx("p", { children: version.content.expression })] }, version.number))) })] }), _jsx("footer", { children: _jsxs("button", { className: shared.quietButton, type: "button", onClick: () => { draftPrinciple(item); }, children: [_jsx(IconSendOutline14, {}), t('philosophy.continue')] }) })] })] }, String(item.id)))) }))] })] }))] }));
}
//# sourceMappingURL=PhilosophySpace.js.map