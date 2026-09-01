import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Confirmation-gated contemplations and life principles. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconCheckOutline16, IconCloseOutline16, IconSendOutline14, IconSparkle16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { calendarStamp } from "../calendar.js";
import { PhilosophyIcon, PrivateIcon } from "../GardenIcons.js";
import { PHILOSOPHY_FOLIO_ROOM_V3 } from "../generated-assets.js";
import { settleMindGardenAction } from "../settle-action.js";
import shared from './GardenSpace.module.css';
import css from './PhilosophySpace.module.css';
const PRINCIPLE_STATUSES = ['trying', 'adopted', 'questioning', 'retired'];
const MAX_CONTEMPLATION_CHARACTERS = 30_000;
const MAX_PRINCIPLE_CHARACTERS = 3_000;
function exactQuote(markdown) {
    return Array.from(markdown.trim()).slice(0, 1_000).join('');
}
/** Render contemplation evidence, inert proposals, and user-governed principle histories. */
export function PhilosophySpace({ today, onListContemplations, onCreateContemplation, onUpdateContemplation, onConfirmContemplation, onDeleteContemplation, onProposePrinciple, onListPrincipleProposals, onListPrinciples, onAcceptPrincipleProposal, onRejectPrincipleProposal, onRevisePrincipleStatus, onDraftConversation = () => undefined, t, }) {
    const [contemplations, setContemplations] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [principles, setPrinciples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [creating, setCreating] = useState(false);
    const [newContemplation, setNewContemplation] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingMarkdown, setEditingMarkdown] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [proposalSourceId, setProposalSourceId] = useState(null);
    const [proposalExpression, setProposalExpression] = useState('');
    const requestRef = useRef(0);
    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        const [contemplationResult, proposalResult, principleResult] = await Promise.all([
            settleMindGardenAction(onListContemplations),
            settleMindGardenAction(onListPrincipleProposals),
            settleMindGardenAction(onListPrinciples),
        ]);
        if (request !== requestRef.current)
            return;
        if (!contemplationResult.ok || !proposalResult.ok || !principleResult.ok) {
            setError('philosophy.error');
            setLoading(false);
            return;
        }
        setContemplations(contemplationResult.value);
        setProposals(proposalResult.value);
        setPrinciples(principleResult.value);
        setError(null);
        setLoading(false);
    }, [onListContemplations, onListPrincipleProposals, onListPrinciples]);
    useEffect(() => {
        void refresh();
        return () => { requestRef.current++; };
    }, [refresh]);
    async function mutate(action, success) {
        setPending(true);
        setError(null);
        setNotice(null);
        let result;
        try {
            result = await action();
        }
        catch {
            setPending(false);
            setError('philosophy.error');
            return false;
        }
        setPending(false);
        if (!result.ok) {
            setError(result.code === 'contemplation-source-unavailable'
                ? 'philosophy.sourceUnavailable'
                : 'philosophy.error');
            return false;
        }
        setNotice(success);
        await refresh();
        return true;
    }
    async function createContemplation() {
        const markdown = newContemplation.trim();
        if (markdown === '')
            return;
        if (await mutate(async () => await onCreateContemplation(markdown), 'philosophy.notice.created')) {
            setNewContemplation('');
            setCreating(false);
        }
    }
    async function updateContemplation(item) {
        const markdown = editingMarkdown.trim();
        if (markdown === '')
            return;
        if (await mutate(async () => await onUpdateContemplation(item, markdown), 'philosophy.notice.updated')) {
            setEditingId(null);
            setEditingMarkdown('');
        }
    }
    async function confirmContemplation(item) {
        if (await mutate(async () => await onConfirmContemplation(item), 'philosophy.notice.confirmed')) {
            setEditingId(null);
            setDeletingId(null);
        }
    }
    async function deleteContemplation(item) {
        if (await mutate(async () => await onDeleteContemplation(item), 'philosophy.notice.deleted')) {
            setEditingId(null);
            setDeletingId(null);
        }
    }
    async function proposePrinciple(item) {
        const expression = proposalExpression.trim();
        if (expression === '')
            return;
        const content = {
            expression,
            formationContext: t('philosophy.formation.manual'),
            userQuote: exactQuote(item.markdown),
            supportingExperiences: [],
            counterexample: '',
            appliesTo: [],
            notAppliesTo: [],
            lastChallenged: today,
            status: 'trying',
        };
        if (await mutate(async () => await onProposePrinciple(item, content), 'philosophy.notice.proposed')) {
            setProposalSourceId(null);
            setProposalExpression('');
        }
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
    return (_jsxs("main", { className: `${shared.space} ${css.philosophy}`, "data-mind-garden-space": "philosophy", children: [_jsxs("header", { className: css.hero, style: { '--mg-philosophy-scene': `url("${PHILOSOPHY_FOLIO_ROOM_V3}")` }, children: [_jsxs("div", { className: css.heroCopy, children: [_jsx(PhilosophyIcon, { size: 22 }), _jsx("h1", { children: t('philosophy.title') }), _jsx("p", { children: t('philosophy.subtitle') }), _jsxs("span", { className: css.privateLine, children: [_jsx(PrivateIcon, { size: 15 }), t('philosophy.private')] })] }), _jsx("figure", { className: css.specimen, "aria-label": t('philosophy.instrument.label'), children: _jsxs("figcaption", { children: [_jsxs("span", { children: [_jsx("strong", { children: confirmedContemplations }), t('philosophy.instrument.notes')] }), _jsxs("span", { children: [_jsx("strong", { children: pendingProposals }), t('philosophy.instrument.proposals')] }), _jsxs("span", { children: [_jsx("strong", { children: activePrinciples }), t('philosophy.instrument.principles')] })] }) })] }), notice !== null && _jsx("p", { className: shared.notice, role: "status", children: t(notice) }), error !== null && _jsx("p", { className: shared.error, role: "alert", children: t(error) }), loading ? _jsx("p", { className: css.loading, role: "status", children: t('philosophy.loading') }) : (_jsxs("div", { className: css.sections, children: [_jsxs("section", { className: `${css.section} ${css.contemplationSection}`, "aria-labelledby": "garden-contemplations", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsx("span", { children: _jsx(IconSparkle16, {}) }), _jsxs("div", { children: [_jsx("h2", { id: "garden-contemplations", children: t('philosophy.contemplations') }), _jsx("p", { children: t('philosophy.contemplationsHint') })] }), _jsx("button", { className: shared.quietButton, type: "button", "aria-expanded": creating, disabled: pending, onClick: () => {
                                            setCreating(value => !value);
                                            setEditingId(null);
                                            setDeletingId(null);
                                        }, children: t('philosophy.add') })] }), creating && (_jsxs("form", { className: css.inlineComposer, onSubmit: (event) => { event.preventDefault(); void createContemplation(); }, children: [_jsx("label", { htmlFor: "garden-new-contemplation", children: t('philosophy.addLabel') }), _jsx("textarea", { id: "garden-new-contemplation", value: newContemplation, maxLength: MAX_CONTEMPLATION_CHARACTERS, autoFocus: true, onChange: (event) => { setNewContemplation(event.target.value); } }), _jsxs("div", { children: [_jsx("button", { className: shared.button, type: "submit", disabled: pending || newContemplation.trim() === '', children: t('philosophy.saveDraft') }), _jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => { setCreating(false); setNewContemplation(''); }, children: t('philosophy.cancel') })] })] })), contemplations.length === 0 ? _jsx("p", { className: css.empty, children: t('philosophy.emptyContemplations') }) : (_jsx("ol", { className: css.list, children: contemplations.map((item, index) => (_jsxs("li", { className: css.note, "data-status": item.status, children: [_jsx("span", { className: css.sequence, "aria-hidden": "true", children: String(index + 1).padStart(2, '0') }), _jsxs("article", { children: [_jsxs("header", { children: [_jsx("small", { children: t(`philosophy.contemplation.${item.status}`) }), _jsx("time", { children: new Date(item.updatedAt).toLocaleDateString() })] }), _jsx("p", { children: item.markdown }), editingId === String(item.id) && (_jsxs("form", { className: css.inlineComposer, onSubmit: (event) => { event.preventDefault(); void updateContemplation(item); }, children: [_jsx("label", { htmlFor: `garden-edit-${String(item.id)}`, children: t('philosophy.editLabel') }), _jsx("textarea", { id: `garden-edit-${String(item.id)}`, value: editingMarkdown, maxLength: MAX_CONTEMPLATION_CHARACTERS, autoFocus: true, onChange: (event) => { setEditingMarkdown(event.target.value); } }), _jsxs("div", { children: [_jsx("button", { className: shared.button, type: "submit", disabled: pending || editingMarkdown.trim() === '', children: t('philosophy.save') }), _jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => { setEditingId(null); setEditingMarkdown(''); }, children: t('philosophy.cancel') })] })] })), proposalSourceId === String(item.id) && (_jsxs("form", { className: css.principleComposer, onSubmit: (event) => { event.preventDefault(); void proposePrinciple(item); }, children: [_jsx("label", { htmlFor: `garden-principle-${String(item.id)}`, children: t('philosophy.extractLabel') }), _jsx("input", { id: `garden-principle-${String(item.id)}`, value: proposalExpression, maxLength: MAX_PRINCIPLE_CHARACTERS, autoFocus: true, onChange: (event) => { setProposalExpression(event.target.value); } }), _jsxs("div", { children: [_jsx("button", { className: shared.button, type: "submit", disabled: pending || proposalExpression.trim() === '', children: t('philosophy.propose') }), _jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => { setProposalSourceId(null); setProposalExpression(''); }, children: t('philosophy.cancel') })] })] })), deletingId === String(item.id) && (_jsxs("div", { className: css.deleteConfirmation, role: "group", "aria-label": t('philosophy.deleteQuestion'), children: [_jsx("span", { children: t('philosophy.deleteQuestion') }), _jsx("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => { void deleteContemplation(item); }, children: t('philosophy.deleteConfirm') }), _jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => { setDeletingId(null); }, children: t('philosophy.cancel') })] })), _jsx("footer", { children: item.status === 'draft' ? (_jsxs(_Fragment, { children: [_jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => {
                                                                    setEditingId(String(item.id));
                                                                    setEditingMarkdown(item.markdown);
                                                                    setDeletingId(null);
                                                                }, children: t('philosophy.edit') }), _jsxs("button", { className: shared.button, type: "button", disabled: pending, onClick: () => { void confirmContemplation(item); }, children: [_jsx(IconCheckOutline16, {}), t('philosophy.confirm')] }), _jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => {
                                                                    setDeletingId(String(item.id));
                                                                    setEditingId(null);
                                                                }, children: t('philosophy.delete') })] })) : (_jsxs(_Fragment, { children: [!proposals.some(proposal => proposal.sourceContemplationId === item.id && proposal.status === 'proposed') && (_jsx("button", { className: shared.quietButton, type: "button", disabled: pending, onClick: () => {
                                                                    setProposalSourceId(String(item.id));
                                                                    setProposalExpression('');
                                                                }, children: t('philosophy.extract') })), _jsxs("button", { className: shared.quietButton, type: "button", onClick: () => { draftContemplation(item); }, children: [_jsx(IconSendOutline14, {}), t('philosophy.continue')] })] })) })] })] }, String(item.id)))) }))] }), _jsxs("section", { className: `${css.section} ${css.proposalSection}`, "aria-labelledby": "garden-proposals", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsx("span", { children: _jsx(IconSparkle16, {}) }), _jsxs("div", { children: [_jsx("h2", { id: "garden-proposals", children: t('philosophy.proposals') }), _jsx("p", { children: t('philosophy.proposalsHint') })] })] }), proposals.length === 0 ? _jsx("p", { className: css.empty, children: t('philosophy.emptyProposals') }) : (_jsx("ul", { className: css.proposalList, children: proposals.map(item => (_jsxs("li", { className: css.proposal, "data-status": item.status, children: [_jsxs("header", { children: [_jsx("small", { children: t(`philosophy.proposal.${item.status}`) }), _jsx("strong", { children: item.content.expression })] }), _jsxs("dl", { className: css.proposalMeaning, children: [_jsxs("div", { children: [_jsx("dt", { children: t('philosophy.formation') }), _jsx("dd", { children: item.content.formationContext })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.quote') }), _jsx("dd", { children: item.content.userQuote })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.counterexample') }), _jsx("dd", { children: item.content.counterexample })] })] }), item.status === 'proposed' && (_jsxs("div", { className: css.proposalActions, children: [_jsxs("button", { className: shared.button, type: "button", disabled: pending, onClick: () => {
                                                        void mutate(async () => await onAcceptPrincipleProposal(item, calendarStamp(today)), 'philosophy.notice.accepted');
                                                    }, children: [_jsx(IconCheckOutline16, {}), t('philosophy.accept')] }), _jsxs("button", { className: shared.dangerButton, type: "button", disabled: pending, onClick: () => {
                                                        void mutate(async () => await onRejectPrincipleProposal(item), 'philosophy.notice.rejected');
                                                    }, children: [_jsx(IconCloseOutline16, {}), t('philosophy.reject')] })] }))] }, String(item.id)))) }))] }), _jsxs("section", { className: `${css.section} ${css.principleSection}`, "aria-labelledby": "garden-principles", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsx("span", { children: _jsx(PhilosophyIcon, { size: 17 }) }), _jsxs("div", { children: [_jsx("h2", { id: "garden-principles", children: t('philosophy.principles') }), _jsx("p", { children: t('philosophy.principlesHint') })] })] }), principles.length === 0 ? _jsx("p", { className: css.empty, children: t('philosophy.emptyPrinciples') }) : (_jsx("ol", { className: css.principles, children: principles.map((item, index) => (_jsxs("li", { className: css.principle, "data-status": item.status, children: [_jsx("span", { className: css.folioNumber, children: String(index + 1).padStart(2, '0') }), _jsxs("article", { children: [_jsxs("header", { children: [_jsx("h3", { children: item.current.expression }), _jsx("select", { className: css.statusSelect, "aria-label": t('philosophy.statusFor').replace('{principle}', item.current.expression), value: item.status, disabled: pending, onChange: (event) => { reviseStatus(item, event.target.value); }, children: PRINCIPLE_STATUSES.map(status => (_jsx("option", { value: status, children: t(`philosophy.principle.${status}`) }, status))) })] }), _jsxs("dl", { className: css.meaning, children: [_jsxs("div", { children: [_jsx("dt", { children: t('philosophy.formation') }), _jsx("dd", { children: item.current.formationContext })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.quote') }), _jsx("dd", { children: item.current.userQuote })] }), _jsxs("div", { children: [_jsx("dt", { children: t('philosophy.counterexample') }), _jsx("dd", { children: item.current.counterexample })] })] }), _jsx("ul", { className: css.tags, "aria-label": t('philosophy.appliesTo'), children: item.current.appliesTo.map(scope => _jsx("li", { children: scope }, scope)) }), _jsxs("details", { className: css.versions, children: [_jsx("summary", { children: t('philosophy.versionCount').replace('{count}', String(item.versions.length)) }), _jsx("ol", { children: item.versions.map(version => (_jsxs("li", { children: [_jsx("time", { children: version.stamp.localDate }), _jsx("p", { children: version.content.expression })] }, version.number))) })] }), _jsx("footer", { children: _jsxs("button", { className: shared.quietButton, type: "button", onClick: () => { draftPrinciple(item); }, children: [_jsx(IconSendOutline14, {}), t('philosophy.continue')] }) })] })] }, String(item.id)))) }))] })] }))] }));
}
//# sourceMappingURL=PhilosophySpace.js.map