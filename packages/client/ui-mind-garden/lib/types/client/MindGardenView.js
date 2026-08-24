import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Full-session Mind Garden review center. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconCloseOutline16, IconDataOutline16, IconQuestionOutline14, IconRefreshOutline14, IconSendOutline14, IconSettingsOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { calendarStamp, currentPeriod, localDate } from "./calendar.js";
import { MindGardenPanel } from "./MindGardenDock.js";
import { GardenSidebar } from "./GardenSidebar.js";
import { EditorialOrbit } from "./EditorialOrbit.js";
import { GARDEN_THRESHOLD_WARM, LIFE_TIME_CORRIDOR_V3 } from "./generated-assets.js";
import { GardenMarkIcon, LifeReviewIcon, PrivateIcon } from "./GardenIcons.js";
import { StarMapSpace } from "./star-map/StarMapSpace.js";
import { ConcernsSpace } from "./spaces/ConcernsSpace.js";
import { CalendarSpace } from "./spaces/CalendarSpace.js";
import { GrowthSpace } from "./spaces/GrowthSpace.js";
import { PhilosophySpace } from "./spaces/PhilosophySpace.js";
import { MemoryGovernance } from "./spaces/MemoryGovernance.js";
import { TodayPractice } from "./spaces/TodayPractice.js";
import { PhotoStorySpace } from "./photo-story/PhotoStorySpace.js";
import { GardenPortabilityPanel } from "./GardenPortabilityPanel.js";
import css from './MindGardenView.module.css';
const CATEGORIES = ['events', 'ongoing', 'changes', 'experiments', 'focus'];
const PERIOD_TYPES = ['week', 'month', 'year'];
const DIRECTION_CONTRACT = `<!-- IMPECCABLE 9e22e091
THESIS: A lived-in morning courtyard turns private reflection into a tactile passage; it refuses the repeated heading, explanation, container, list template.
OWN-WORLD: Luminous xuan paper, pale-ash joinery, honed limestone, matte porcelain, physical brass paths, deep indigo actions, muted plum bindings, grounded shadows, and Noto Sans SC operational type.
STORY: Five clear garden regions lead to nine fully preserved tools, while each destination becomes its own recognizable room with truthful records and explicit control.
FIRST VIEWPORT: A slim five-region header opens directly onto a 38/62 practical entry and full-depth B+C courtyard corridor; three semantic stations sit over a generated physical scene and lead into complete tools below.
FORM: B paper-corridor spatial depth fused with C morning architecture, top navigation, and quick-action hierarchy, approved by the user, seed 9e22e091.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->`;
const ignoreSpaceSelection = (_space) => undefined;
const ignoreSidebarToggle = () => undefined;
const ignoreConversationDraft = (_draft) => undefined;
function errorKey(code) {
    if (code === 'open-question-version-conflict' || code === 'period-review-version-conflict') {
        return 'review.error.conflict';
    }
    if (code === 'period-review-material-conflict')
        return 'review.error.materialChanged';
    if (code === 'period-review-source-required')
        return 'review.error.noMaterial';
    return 'review.error.generic';
}
function statusKey(status) {
    return `question.status.${status}`;
}
function reviewStatusKey(status) {
    return `review.status.${status}`;
}
/** Render the inactive gateway or the active review center. */
export function MindGardenReviewCenter({ projection, onExportBackup, onInspectBackup, onRestoreBackup, onRotateVaultKey, onStarMapOverview, onSaveStarRitual, onCompleteStarRitual, onUpdateStarProfile, onUpdateStarTrait, onDrawStarCard, onCalibrateStarCard, onFinalizeStarCard, onContinueStarCard, onApplyStarCardRevision, onListMemories, onProposeMemory, onConfirmMemory, onUpdateMemory, onRejectMemory, onResolveMemoryRelationship, onListMemoryRevisions, onExtractMemories, onLatestMemoryExtraction, onMemoryAutomationPolicy, onSetMemoryAutomationPolicy, onDeleteMemory, onLatestMemoryAudit, onListOpenQuestions, onCreateOpenQuestion, onUpdateOpenQuestion, onPeriodReviewMaterial, onCreatePeriodReview, onListPeriodReviews, onUpdatePeriodReview, onListConcerns, onCreateConcern, onUpdateConcern, onCompleteConcern, onConvertConcern, onCalendarMonth, onCalendarDay, onCreateCheckin, onCreateJournal, onUpdateJournal, onDeleteJournal, onReflectionTrend, onListExperiments, onCreateExperiment, onStartExperiment, onObserveExperiment, onStopExperiment, onListContemplations, onListPrincipleProposals, onListPrinciples, onAcceptPrincipleProposal, onRejectPrincipleProposal, onRevisePrincipleStatus, onListPhotoStories, onCreatePhotoStory, onReadPhotoStory, onObservePhotoStory, onContinuePhotoStory, onUpdatePhotoStory, onDeletePhotoStory, activeSpace = 'today', sidebarCollapsed = false, onSelectSpace = ignoreSpaceSelection, onToggleSidebar = ignoreSidebarToggle, onDraftConversation = ignoreConversationDraft, t, ...dockActions }) {
    const today = localDate(new Date());
    const initialPeriod = useMemo(() => currentPeriod('week'), []);
    const [questions, setQuestions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [question, setQuestion] = useState('');
    const [questionDate, setQuestionDate] = useState(today);
    const [periodType, setPeriodType] = useState('week');
    const [startDate, setStartDate] = useState(initialPeriod.start);
    const [endDate, setEndDate] = useState(initialPeriod.end);
    const [material, setMaterial] = useState(null);
    const [reviewContent, setReviewContent] = useState('');
    const [starSidebar, setStarSidebar] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const requestRef = useRef(0);
    const pendingRef = useRef(false);
    const starSidebarLoadedRef = useRef(false);
    const settingsSheetRef = useRef(null);
    const settingsTriggerRef = useRef(null);
    const closeSettings = useCallback(() => {
        setSettingsOpen(false);
        requestAnimationFrame(() => { settingsTriggerRef.current?.focus({ preventScroll: true }); });
    }, []);
    useEffect(() => {
        if (!settingsOpen)
            return;
        const containFocus = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeSettings();
                return;
            }
            if (event.key !== 'Tab')
                return;
            const focusable = [...(settingsSheetRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? [])];
            const first = focusable[0];
            const last = focusable.at(-1);
            if (first === undefined || last === undefined)
                return;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', containFocus);
        return () => { window.removeEventListener('keydown', containFocus); };
    }, [closeSettings, settingsOpen]);
    useEffect(() => {
        if (activeSpace !== 'star-map' && starSidebarLoadedRef.current)
            return;
        let disposed = false;
        void onStarMapOverview().then((result) => {
            if (!disposed && result.ok) {
                starSidebarLoadedRef.current = true;
                setStarSidebar(result.value);
            }
        });
        return () => { disposed = true; };
    }, [activeSpace, onStarMapOverview]);
    const refresh = useCallback(async (showLoading = false) => {
        const request = ++requestRef.current;
        if (showLoading)
            setLoading(true);
        const [questionResult, reviewResult] = await Promise.all([
            onListOpenQuestions(),
            onListPeriodReviews(),
        ]);
        if (request !== requestRef.current)
            return false;
        if (!questionResult.ok) {
            setError(errorKey(questionResult.code));
            setLoading(false);
            return false;
        }
        if (!reviewResult.ok) {
            setError(errorKey(reviewResult.code));
            setLoading(false);
            return false;
        }
        setQuestions(questionResult.value);
        setReviews(reviewResult.value);
        setError(null);
        setLoading(false);
        return true;
    }, [onListOpenQuestions, onListPeriodReviews]);
    useEffect(() => {
        if (projection === null || projection === undefined)
            return;
        void refresh(true);
        return () => { requestRef.current++; };
    }, [projection, refresh]);
    const mutate = useCallback(async (action, success) => {
        /* v8 ignore next -- disabled controls close the ordinary render window; the ref closes same-tick activation. */
        if (pendingRef.current)
            return null;
        pendingRef.current = true;
        setPending(true);
        setError(null);
        setNotice(null);
        try {
            const result = await action();
            if (!result.ok) {
                if (result.code.includes('conflict')) {
                    const reloaded = await refresh();
                    if (reloaded)
                        setError(errorKey(result.code));
                }
                else {
                    setError(errorKey(result.code));
                }
                return null;
            }
            await refresh();
            setNotice(success);
            return result.value;
        }
        catch {
            setError('review.error.generic');
            return null;
        }
        finally {
            pendingRef.current = false;
            setPending(false);
        }
    }, [refresh]);
    if (projection === undefined) {
        return _jsx("div", { className: css.loading, role: "status", children: t('review.loading') });
    }
    if (projection === null) {
        return (_jsxs("main", { className: css.inactive, children: [_jsxs("div", { className: css.inactiveContent, children: [_jsxs("div", { className: css.inactiveCopy, children: [_jsx("span", { className: css.eyebrow, children: t('view.garden') }), _jsx("h1", { children: t('review.inactive.title') }), _jsx("p", { children: t('review.inactive.body') })] }), _jsx(MindGardenPanel, { projection: null, ...dockActions, t: t })] }), _jsx("img", { className: css.inactiveArtwork, src: GARDEN_THRESHOLD_WARM, alt: "" })] }));
    }
    const savedCount = reviews.filter(item => item.status === 'saved').length;
    const showQuestions = activeSpace === 'today' || activeSpace === 'memory';
    const showReviews = activeSpace === 'today' || activeSpace === 'life';
    const materialGroups = CATEGORIES.map(category => ({
        category,
        items: material?.items.filter(item => item.category === category) ?? [],
    })).filter(group => group.items.length > 0);
    async function submitQuestion(event) {
        event.preventDefault();
        const value = question.trim();
        if (value === '')
            return;
        const created = await mutate(() => onCreateOpenQuestion(value, calendarStamp(questionDate)), 'question.notice.created');
        if (created !== null)
            setQuestion('');
    }
    async function transitionQuestion(item, status) {
        await mutate(() => onUpdateOpenQuestion(item, item.question, status, calendarStamp(today)), status === 'open' ? 'question.notice.reopened' : 'question.notice.closed');
    }
    async function loadMaterial() {
        /* v8 ignore next -- the invoking button is disabled for every invalid or pending state. */
        if (startDate === '' || endDate === '' || startDate > endDate || pendingRef.current)
            return;
        pendingRef.current = true;
        setPending(true);
        setError(null);
        setNotice(null);
        try {
            const result = await onPeriodReviewMaterial({
                periodType,
                startStamp: calendarStamp(startDate),
                endStamp: calendarStamp(endDate),
            });
            if (!result.ok) {
                setError(errorKey(result.code));
                return;
            }
            setMaterial(result.value);
            setNotice('review.notice.materialReady');
        }
        catch {
            setError('review.error.generic');
        }
        finally {
            pendingRef.current = false;
            setPending(false);
        }
    }
    async function submitReview(event) {
        event.preventDefault();
        const content = reviewContent.trim();
        if (material === null || material.sources.length === 0 || content === '')
            return;
        const created = await mutate(() => onCreatePeriodReview(material, content), 'review.notice.created');
        if (created !== null) {
            setMaterial(null);
            setReviewContent('');
        }
    }
    async function transitionReview(item, status) {
        await mutate(() => onUpdatePeriodReview(item, item.content, status), status === 'saved' ? 'review.notice.saved' : 'review.notice.archived');
    }
    function selectPeriod(value) {
        const range = currentPeriod(value);
        setPeriodType(value);
        setStartDate(range.start);
        setEndDate(range.end);
        setMaterial(null);
    }
    return (_jsxs("div", { className: css.shell, "data-mind-garden-view": "active", "data-active-space": activeSpace, children: [_jsx("template", { dangerouslySetInnerHTML: { __html: DIRECTION_CONTRACT } }), _jsx(GardenSidebar, { activeSpace: activeSpace, collapsed: sidebarCollapsed, starState: starSidebar === null || !starSidebar.profile.onboardingCompleted
                    ? 'ritual'
                    : starSidebar.traits.some(trait => trait.status === 'pending')
                        ? 'new-dust'
                        : starSidebar.activeCard !== null
                            ? 'continue'
                            : 'draw', starCount: starSidebar?.traits.filter(trait => trait.status === 'pending').length
                    || starSidebar?.cards.filter(card => card.status === 'saved').length
                    || 0, onSelect: onSelectSpace, onSettings: (trigger) => {
                    settingsTriggerRef.current = trigger;
                    setSettingsOpen(true);
                }, onToggle: onToggleSidebar, t: t }), _jsx("section", { className: css.workspace, children: activeSpace === 'photo-story' ? (_jsx(PhotoStorySpace, { today: today, onListPhotoStories: onListPhotoStories, onCreatePhotoStory: onCreatePhotoStory, onReadPhotoStory: onReadPhotoStory, onObservePhotoStory: onObservePhotoStory, onContinuePhotoStory: onContinuePhotoStory, onUpdatePhotoStory: onUpdatePhotoStory, onDeletePhotoStory: onDeletePhotoStory, t: t })) : activeSpace === 'star-map' ? (_jsx(StarMapSpace, { questions: questions, reviews: reviews, mode: projection.state.mode, onOverview: onStarMapOverview, onSaveRitual: onSaveStarRitual, onCompleteRitual: onCompleteStarRitual, onUpdateProfile: onUpdateStarProfile, onUpdateTrait: onUpdateStarTrait, onDrawCard: onDrawStarCard, onCalibrateCard: onCalibrateStarCard, onFinalizeCard: onFinalizeStarCard, onContinueCard: onContinueStarCard, onApplyCardRevision: onApplyStarCardRevision, t: t, onBack: () => { onSelectSpace('today'); } })) : activeSpace === 'concerns' ? (_jsx(ConcernsSpace, { today: today, onListConcerns: onListConcerns, onCreateConcern: onCreateConcern, onUpdateConcern: onUpdateConcern, onCompleteConcern: onCompleteConcern, onConvertConcern: onConvertConcern, onDraftConversation: onDraftConversation, t: t })) : activeSpace === 'calendar' ? (_jsx(CalendarSpace, { today: today, onCalendarMonth: onCalendarMonth, onCalendarDay: onCalendarDay, onReflectionTrend: onReflectionTrend, onDraftConversation: onDraftConversation, t: t })) : activeSpace === 'growth' ? (_jsx(GrowthSpace, { today: today, onListExperiments: onListExperiments, onCreateExperiment: onCreateExperiment, onStartExperiment: onStartExperiment, onObserveExperiment: onObserveExperiment, onStopExperiment: onStopExperiment, onDraftConversation: onDraftConversation, t: t })) : activeSpace === 'philosophy' ? (_jsx(PhilosophySpace, { today: today, onListContemplations: onListContemplations, onListPrincipleProposals: onListPrincipleProposals, onListPrinciples: onListPrinciples, onAcceptPrincipleProposal: onAcceptPrincipleProposal, onRejectPrincipleProposal: onRejectPrincipleProposal, onRevisePrincipleStatus: onRevisePrincipleStatus, onDraftConversation: onDraftConversation, t: t })) : (_jsxs("main", { className: css.view, children: [activeSpace === 'today' ? (_jsx("section", { className: css.todayOpening, "data-mind-garden-space": "today", children: _jsx("div", { className: css.orreryStage, children: _jsx(EditorialOrbit, { questions: questions, reviews: reviews, mode: projection.state.mode, t: t, children: _jsxs("header", { className: css.orreryHero, children: [_jsx("h1", { children: t('today.observatory.title') }), _jsx("p", { children: t('today.observatory.prompt') }), _jsxs("div", { className: css.heroActions, children: [_jsx("a", { className: css.heroPrimary, href: "#mind-garden-today-title", children: t('today.observatory.checkin') }), _jsx("a", { className: css.heroSecondary, href: "#mind-garden-questions-title", children: t('today.observatory.question') })] }), _jsxs("div", { className: css.instrumentStatus, children: [_jsx("span", { className: css.posture, children: t(`mode.${projection.state.mode}`) }), _jsxs("span", { className: css.privacy, children: [_jsx(PrivateIcon, { size: 13 }), t('review.private')] })] })] }) }) }) })) : activeSpace === 'life' ? (_jsxs("section", { className: css.lifeOpening, style: { '--mg-life-scene': `url("${LIFE_TIME_CORRIDOR_V3}")` }, "data-mind-garden-space": "life", children: [_jsxs("div", { className: css.lifeCopy, children: [_jsx(LifeReviewIcon, { size: 24 }), _jsx("h1", { children: t('life.title') }), _jsx("p", { children: t('life.subtitle') }), _jsxs("span", { className: css.privacy, children: [_jsx(PrivateIcon, { size: 13 }), t('review.private')] })] }), _jsxs("div", { className: css.lifeMetrics, "aria-label": t('review.overview'), children: [_jsxs("span", { children: [_jsx("strong", { children: reviews.length }), t('life.metric.reviews')] }), _jsxs("span", { children: [_jsx("strong", { children: savedCount }), t('life.metric.saved')] }), _jsxs("span", { children: [_jsx("strong", { children: t(`review.period.${periodType}`) }), t('life.metric.range')] })] })] })) : null, activeSpace === 'today' && (_jsx(TodayPractice, { today: today, onCalendarDay: onCalendarDay, onCreateCheckin: onCreateCheckin, onCreateJournal: onCreateJournal, onUpdateJournal: onUpdateJournal, onDeleteJournal: onDeleteJournal, t: t })), activeSpace === 'memory' && (_jsx(MemoryGovernance, { onListMemories: onListMemories, onProposeMemory: onProposeMemory, onConfirmMemory: onConfirmMemory, onUpdateMemory: onUpdateMemory, onRejectMemory: onRejectMemory, onResolveMemoryRelationship: onResolveMemoryRelationship, onListMemoryRevisions: onListMemoryRevisions, onExtractMemories: onExtractMemories, onLatestMemoryExtraction: onLatestMemoryExtraction, onMemoryAutomationPolicy: onMemoryAutomationPolicy, onSetMemoryAutomationPolicy: onSetMemoryAutomationPolicy, onDeleteMemory: onDeleteMemory, onLatestMemoryAudit: onLatestMemoryAudit, onDraftConversation: onDraftConversation, t: t })), loading && _jsx("div", { className: css.loading, role: "status", children: t('review.loading') }), error !== null && (_jsxs("div", { className: css.feedbackError, role: "alert", children: [_jsx("span", { children: t(error) }), _jsx("button", { type: "button", onClick: () => { void refresh(true); }, children: t('review.retry') })] })), notice !== null && _jsx("p", { className: css.feedbackNotice, role: "status", children: t(notice) }), !loading && (showQuestions || showReviews) && (_jsxs("div", { className: css.columns, "data-scope": activeSpace, children: [showQuestions && _jsxs("section", { className: css.section, "aria-labelledby": "mind-garden-questions-title", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsxs("div", { children: [_jsx("span", { className: css.sectionMark, "aria-hidden": "true", children: _jsx(IconQuestionOutline14, {}) }), _jsx("h2", { id: "mind-garden-questions-title", children: t('question.title') })] }), _jsx("p", { children: t('question.subtitle') })] }), _jsxs("form", { className: css.composer, onSubmit: (event) => { void submitQuestion(event); }, children: [_jsx("label", { htmlFor: "mind-garden-question", children: t('question.input.label') }), _jsx("textarea", { id: "mind-garden-question", value: question, onChange: (event) => { setQuestion(event.target.value); }, placeholder: t('question.input.placeholder'), rows: 3, disabled: pending }), _jsxs("div", { className: css.formFooter, children: [_jsxs("label", { children: [t('question.date'), _jsx("input", { type: "date", value: questionDate, onChange: (event) => { setQuestionDate(event.target.value); }, disabled: pending })] }), _jsx("button", { type: "submit", className: css.primary, disabled: pending || question.trim() === '' || questionDate === '', children: t('question.add') })] })] }), _jsxs("div", { className: css.cardList, children: [questions.length === 0 && _jsx(EmptyState, { title: t('question.empty.title'), body: t('question.empty.body') }), questions.map(item => (_jsxs("article", { className: css.questionCard, "data-status": item.status, children: [_jsxs("div", { className: css.cardMeta, children: [_jsx("span", { className: css.status, children: t(statusKey(item.status)) }), _jsx("time", { dateTime: item.createdStamp.localDate, children: item.createdStamp.localDate })] }), _jsx("p", { className: css.questionText, children: item.question }), item.source !== null && _jsx("blockquote", { children: item.source.evidenceQuote }), _jsx("div", { className: css.cardActions, children: item.status === 'open' ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", disabled: pending, onClick: () => { void transitionQuestion(item, 'resolved'); }, children: t('question.resolve') }), _jsx("button", { type: "button", disabled: pending, onClick: () => { void transitionQuestion(item, 'dismissed'); }, children: t('question.dismiss') })] })) : (_jsx("button", { type: "button", disabled: pending, onClick: () => { void transitionQuestion(item, 'open'); }, children: t('question.reopen') })) })] }, String(item.id))))] })] }), showReviews && _jsxs("section", { className: css.section, "aria-labelledby": "mind-garden-reviews-title", children: [_jsxs("div", { className: css.sectionHeader, children: [_jsxs("div", { children: [_jsx("span", { className: css.sectionMark, "aria-hidden": "true", children: _jsx(IconRefreshOutline14, {}) }), _jsx("h2", { id: "mind-garden-reviews-title", children: t('review.period.title') })] }), _jsx("p", { children: t('review.period.subtitle') })] }), _jsxs("div", { className: css.rangePicker, children: [_jsxs("label", { children: [t('review.period.type'), _jsx("select", { value: periodType, onChange: (event) => { selectPeriod(event.target.value); }, disabled: pending, children: PERIOD_TYPES.map(type => _jsx("option", { value: type, children: t(`review.period.${type}`) }, type)) })] }), _jsxs("label", { children: [t('review.period.start'), _jsx("input", { type: "date", value: startDate, onChange: (event) => { setStartDate(event.target.value); setMaterial(null); }, disabled: pending })] }), _jsxs("label", { children: [t('review.period.end'), _jsx("input", { type: "date", value: endDate, onChange: (event) => { setEndDate(event.target.value); setMaterial(null); }, disabled: pending })] }), _jsx("button", { type: "button", className: css.secondary, onClick: () => { void loadMaterial(); }, disabled: pending || startDate === '' || endDate === '' || startDate > endDate, children: t('review.period.load') })] }), material !== null && (_jsxs("form", { className: css.material, onSubmit: (event) => { void submitReview(event); }, children: [_jsxs("div", { className: css.materialHeader, children: [_jsx("strong", { children: t('review.material.title') }), _jsx("span", { children: t('review.material.count').replace('{count}', String(material.sources.length)) })] }), material.items.length === 0 ? _jsx(EmptyState, { title: t('review.material.empty.title'), body: t('review.material.empty.body') }) : materialGroups.map(group => (_jsxs("div", { className: css.materialGroup, children: [_jsx("h3", { children: t(`review.category.${group.category}`) }), group.items.map(item => _jsxs("p", { children: [_jsx("time", { dateTime: item.localDate, children: item.localDate }), _jsxs("span", { children: [_jsx("strong", { children: item.title }), item.text] })] }, `${String(item.sourceId)}:${item.category}:${item.localDate}`))] }, group.category))), _jsx("label", { htmlFor: "mind-garden-review", children: t('review.editor.label') }), _jsx("textarea", { id: "mind-garden-review", value: reviewContent, onChange: (event) => { setReviewContent(event.target.value); }, placeholder: t('review.editor.placeholder'), rows: 6, disabled: pending || material.sources.length === 0 }), _jsxs("div", { className: css.formFooter, children: [_jsx("span", { children: t('review.editor.hint') }), _jsx("button", { type: "submit", className: css.primary, disabled: pending || material.sources.length === 0 || reviewContent.trim() === '', children: t('review.create') })] })] })), _jsxs("div", { className: css.cardList, children: [reviews.length === 0 && material === null && _jsx(EmptyState, { title: t('review.empty.title'), body: t('review.empty.body') }), reviews.map(item => (_jsxs("article", { className: css.reviewCard, children: [_jsxs("div", { className: css.cardMeta, children: [_jsx("span", { className: css.status, children: t(reviewStatusKey(item.status)) }), _jsxs("time", { dateTime: item.startStamp.localDate, children: [item.startStamp.localDate, " \u2014 ", item.endStamp.localDate] })] }), _jsx("p", { className: css.reviewText, children: item.content }), _jsx("p", { className: css.sourceCount, children: t('review.sources').replace('{count}', String(item.sources.length)) }), item.stale && _jsx("p", { className: css.stale, children: t('review.stale') }), _jsxs("div", { className: css.cardActions, children: [_jsxs("button", { type: "button", onClick: () => {
                                                                        onDraftConversation(t('life.draft.template')
                                                                            .replace('{start}', item.startStamp.localDate)
                                                                            .replace('{end}', item.endStamp.localDate)
                                                                            .replace('{content}', item.content));
                                                                        setNotice('life.notice.drafted');
                                                                    }, children: [_jsx(IconSendOutline14, {}), t('life.continue')] }), item.status === 'proposed' && _jsx("button", { type: "button", disabled: pending, onClick: () => { void transitionReview(item, 'saved'); }, children: t('review.save') }), item.status === 'saved' && _jsx("button", { type: "button", disabled: pending, onClick: () => { void transitionReview(item, 'archived'); }, children: t('review.archive') })] })] }, String(item.id))))] })] })] }))] })) }), settingsOpen && (_jsx("div", { className: css.settingsScrim, role: "dialog", "aria-modal": "true", "aria-label": t('garden.settings'), onMouseDown: closeSettings, children: _jsxs("div", { ref: settingsSheetRef, className: css.settingsSheet, onMouseDown: (event) => { event.stopPropagation(); }, children: [_jsxs("header", { className: css.settingsHeading, children: [_jsxs("span", { className: css.settingsInstrument, "aria-hidden": "true", children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {}), _jsx(GardenMarkIcon, { size: 25 })] }), _jsxs("div", { className: css.settingsHeadingCopy, children: [_jsx("span", { children: t('garden.settings.kicker') }), _jsx("h2", { children: t('garden.settings') }), _jsx("p", { children: t('garden.settings.body') }), _jsxs("div", { className: css.settingsAssurances, "aria-label": t('garden.settings.assurances'), children: [_jsxs("span", { children: [_jsx(GardenMarkIcon, { size: 14 }), t('garden.settings.session')] }), _jsxs("span", { children: [_jsx(PrivateIcon, { size: 14 }), t('garden.settings.profile')] }), _jsxs("span", { children: [_jsx(IconSettingsOutline16, { size: 14 }), t('garden.settings.host')] })] })] }), _jsxs("button", { type: "button", autoFocus: true, onClick: closeSettings, children: [_jsx(IconCloseOutline16, { size: 14 }), t('garden.settings.close')] })] }), _jsxs("div", { className: css.settingsContent, children: [_jsxs("section", { className: css.settingsDialogue, children: [_jsx("span", { className: css.settingsIndex, children: "01" }), _jsx(MindGardenPanel, { projection: projection, defaultOpen: true, ...dockActions, t: t })] }), _jsxs("section", { className: css.settingsPortability, children: [_jsxs("span", { className: css.settingsIndex, children: [_jsx(IconDataOutline16, { size: 14 }), "02"] }), _jsx(GardenPortabilityPanel, { onExportBackup: onExportBackup, onInspectBackup: onInspectBackup, onRestoreBackup: onRestoreBackup, onRotateVaultKey: onRotateVaultKey, t: t })] })] })] }) }))] }));
}
function EmptyState({ title, body }) {
    return _jsxs("div", { className: css.empty, children: [_jsx("strong", { children: title }), _jsx("span", { children: body })] });
}
/** Read the typed session projection and adapt it to the review center. */
export function MindGardenView({ useProjection, useStore, actions, inputActions, ...props }) {
    const projection = useProjection('mind-garden');
    const view = useStore(state => state);
    return (_jsx(MindGardenReviewCenter, { projection: projection, activeSpace: view.activeSpace, sidebarCollapsed: view.sidebarCollapsed, onSelectSpace: (space) => { actions.selectSpace(space); }, onToggleSidebar: () => { actions.toggleSidebar(); }, onDraftConversation: (draft) => { inputActions.setDraft(draft); }, ...props }));
}
//# sourceMappingURL=MindGardenView.js.map