import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Calendar atlas, filtering, conversation handoff, and trend projection. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconChevronLeftOutline14, IconChevronRightOutline14, IconSendOutline14, } from '@deepseek-ai/dsh-client-ui-primitives';
import { CalendarIcon, CheckinIcon, ConcernsIcon, GrowthIcon, JournalIcon, PhilosophyIcon, StarMapIcon, } from "../GardenIcons.js";
import shared from './GardenSpace.module.css';
import css from './CalendarSpace.module.css';
const FILTERS = [
    'all',
    'checkin',
    'journal',
    'concern',
    'principle',
    'experiment',
    'question',
];
/** Build a Sunday-first grid with complete weeks. */
export function gardenCalendarCells(month) {
    const match = /^(\d{4})-(\d{2})$/.exec(month);
    if (match === null)
        return [];
    const year = Number(match[1]);
    const monthNumber = Number(match[2]);
    if (monthNumber < 1 || monthNumber > 12)
        return [];
    const offset = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const count = Math.ceil((offset + days) / 7) * 7;
    return Array.from({ length: count }, (_, index) => {
        const day = index - offset + 1;
        if (day < 1 || day > days)
            return { date: null, day: null };
        return {
            date: `${month}-${String(day).padStart(2, '0')}`,
            day,
        };
    });
}
function adjacentMonth(month, amount) {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(Date.UTC(year ?? 0, (monthNumber ?? 1) - 1 + amount, 1));
    return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
function eventCopy(event, t) {
    switch (event.type) {
        case 'checkin':
            return { kind: t('calendar.event.checkin'), detail: event.emotionWords.join(' · ') || t('calendar.event.noWords') };
        case 'journal':
            return { kind: t('calendar.event.journal'), detail: event.title || event.body };
        case 'concern-reminder':
            return { kind: t('calendar.event.concern'), detail: event.concern.content };
        case 'principle':
            return { kind: t('calendar.event.principle'), detail: event.version.content.expression };
        case 'experiment-review':
            return { kind: t('calendar.event.experimentReview'), detail: event.experiment.title };
        case 'experiment-observation':
            return { kind: t('calendar.event.experimentObservation'), detail: event.observation.observation };
        case 'open-question':
            return { kind: t('calendar.event.question'), detail: event.question };
    }
}
function eventMatches(event, filter) {
    if (filter === 'all')
        return true;
    if (filter === 'concern')
        return event.type === 'concern-reminder';
    if (filter === 'experiment')
        return event.type === 'experiment-review' || event.type === 'experiment-observation';
    if (filter === 'question')
        return event.type === 'open-question';
    return event.type === filter;
}
function eventIcon(event) {
    switch (event.type) {
        case 'checkin': return _jsx(CheckinIcon, { size: 17 });
        case 'journal': return _jsx(JournalIcon, { size: 17 });
        case 'concern-reminder': return _jsx(ConcernsIcon, { size: 17 });
        case 'principle': return _jsx(PhilosophyIcon, { size: 17 });
        case 'experiment-review':
        case 'experiment-observation': return _jsx(GrowthIcon, { size: 17 });
        case 'open-question': return _jsx(StarMapIcon, { size: 17 });
    }
}
function trendCoordinates(trend) {
    const count = Math.max(1, trend.points.length - 1);
    return trend.points.map((point, index) => {
        const x = 4 + (index / count) * 92;
        const y = 44 - ((point.mood + 2) / 4) * 36;
        return { id: String(point.id), x: x.toFixed(2), y: y.toFixed(2) };
    });
}
/** Render a tactile month atlas, complete selected-day ledger, filters, and mood trail. */
export function CalendarSpace({ today, onCalendarMonth, onCalendarDay, onReflectionTrend, onDraftConversation = () => undefined, t, }) {
    const [month, setMonth] = useState(today.slice(0, 7));
    const [selectedDate, setSelectedDate] = useState(today);
    const [monthValue, setMonthValue] = useState(null);
    const [dayValue, setDayValue] = useState(null);
    const [trend, setTrend] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sideMode, setSideMode] = useState('day');
    const [notice, setNotice] = useState(false);
    const [error, setError] = useState(false);
    const requestRef = useRef(0);
    const cells = useMemo(() => gardenCalendarCells(month), [month]);
    const activity = useMemo(() => new Map(monthValue?.days.map(day => [day.date, day]) ?? []), [monthValue]);
    const filteredEvents = useMemo(() => dayValue?.events.filter(event => eventMatches(event, filter)) ?? [], [dayValue, filter]);
    const plottedTrendCoordinates = useMemo(() => trend === null ? [] : trendCoordinates(trend), [trend]);
    const loadMonth = useCallback(async (nextMonth) => {
        const request = ++requestRef.current;
        const result = await onCalendarMonth(nextMonth);
        if (request !== requestRef.current)
            return;
        if (result.ok) {
            setMonthValue(result.value);
            setError(false);
        }
        else {
            setError(true);
        }
    }, [onCalendarMonth]);
    const loadDay = useCallback(async (date) => {
        const result = await onCalendarDay(date);
        if (result.ok) {
            setDayValue(result.value);
            setError(false);
        }
        else {
            setError(true);
        }
    }, [onCalendarDay]);
    useEffect(() => {
        void loadMonth(month);
        return () => { requestRef.current++; };
    }, [loadMonth, month]);
    useEffect(() => {
        void loadDay(selectedDate);
    }, [loadDay, selectedDate]);
    useEffect(() => {
        let current = true;
        void onReflectionTrend(30, today).then((result) => {
            if (!current)
                return;
            if (result.ok)
                setTrend(result.value);
            else
                setError(true);
        });
        return () => { current = false; };
    }, [onReflectionTrend, today]);
    function selectDate(date) {
        setSelectedDate(date);
        setSideMode('day');
        setNotice(false);
    }
    function selectMonth(nextMonth, date = `${nextMonth}-01`) {
        setMonth(nextMonth);
        setSelectedDate(date);
        setSideMode('day');
        setNotice(false);
    }
    function draftConversation(event) {
        const copy = eventCopy(event, t);
        onDraftConversation(t('calendar.conversation.draft')
            .replace('{date}', selectedDate)
            .replace('{kind}', copy.kind)
            .replace('{detail}', copy.detail));
        setNotice(true);
    }
    return (_jsxs("main", { className: shared.space, "data-mind-garden-space": "calendar", children: [_jsxs("header", { className: shared.header, children: [_jsxs("div", { children: [_jsx("span", { className: shared.eyebrow, children: t('calendar.eyebrow') }), _jsx("h1", { children: t('calendar.title') }), _jsx("p", { children: t('calendar.subtitle') })] }), _jsx("span", { className: css.atlasSeal, "aria-hidden": "true", children: _jsx(CalendarIcon, { size: 22 }) })] }), _jsxs("section", { className: css.atlas, children: [_jsxs("header", { className: css.toolbar, children: [_jsxs("div", { className: css.monthControls, children: [_jsx("button", { type: "button", "aria-label": t('calendar.previous'), onClick: () => { selectMonth(adjacentMonth(month, -1)); }, children: _jsx(IconChevronLeftOutline14, {}) }), _jsxs("label", { children: [_jsx("span", { children: t('calendar.month') }), _jsx("input", { type: "month", value: month, onChange: (event) => { selectMonth(event.target.value); } })] }), _jsx("button", { type: "button", "aria-label": t('calendar.next'), onClick: () => { selectMonth(adjacentMonth(month, 1)); }, children: _jsx(IconChevronRightOutline14, {}) }), _jsx("button", { type: "button", className: css.todayButton, onClick: () => { selectMonth(today.slice(0, 7), today); }, children: t('calendar.today') })] }), _jsxs("div", { className: css.modeSwitch, role: "group", "aria-label": t('calendar.dayDetail'), children: [_jsx("button", { type: "button", "aria-pressed": sideMode === 'day', onClick: () => { setSideMode('day'); }, children: t('calendar.showDay') }), _jsx("button", { type: "button", "aria-pressed": sideMode === 'trend', onClick: () => { setSideMode('trend'); }, children: t('calendar.showTrend') })] })] }), _jsx("div", { className: css.filters, role: "group", "aria-label": t('calendar.filter'), children: FILTERS.map(item => (_jsx("button", { type: "button", "aria-pressed": filter === item, onClick: () => { setFilter(item); setSideMode('day'); }, children: t(`calendar.filter.${item}`) }, item))) }), error && _jsx("p", { className: shared.error, role: "alert", children: t('calendar.error') }), _jsxs("div", { className: css.layout, children: [_jsxs("section", { className: css.calendar, "aria-label": t('calendar.grid'), children: [_jsx("div", { className: css.weekdays, "aria-hidden": "true", children: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (_jsx("span", { children: t(`calendar.weekday.${day}`) }, day))) }), _jsx("div", { className: css.grid, children: cells.map((cell, index) => {
                                            if (cell.date === null || cell.day === null)
                                                return _jsx("span", { className: css.blank }, `blank-${index}`);
                                            const date = cell.date;
                                            const summary = activity.get(date);
                                            return (_jsxs("button", { type: "button", className: css.day, "data-selected": date === selectedDate, "data-today": date === today, "aria-label": t('calendar.dayLabel')
                                                    .replace('{date}', date)
                                                    .replace('{count}', String(summary?.eventCount ?? 0)), onClick: () => { selectDate(date); }, children: [_jsx("span", { className: css.dayNumber, children: cell.day }), summary === undefined ? _jsx("small", { children: "\u2014" }) : (_jsxs(_Fragment, { children: [_jsx("small", { children: t('calendar.eventCount').replace('{count}', String(summary.eventCount)) }), _jsxs("span", { className: css.signals, "aria-hidden": "true", children: [summary.checkinCount > 0 && _jsx("i", { "data-kind": "checkin" }), summary.journalCount > 0 && _jsx("i", { "data-kind": "journal" }), summary.concernCount > 0 && _jsx("i", { "data-kind": "concern" }), summary.principleCount > 0 && _jsx("i", { "data-kind": "principle" }), summary.experimentCount > 0 && _jsx("i", { "data-kind": "experiment" }), summary.openQuestionCount > 0 && _jsx("i", { "data-kind": "question" })] })] }))] }, date));
                                        }) })] }), _jsx("aside", { className: css.detail, "aria-label": sideMode === 'day' ? t('calendar.dayDetail') : t('calendar.trend'), children: sideMode === 'day' ? (_jsxs(_Fragment, { children: [_jsxs("header", { className: css.detailHeader, children: [_jsxs("div", { children: [_jsx("small", { children: month }), _jsx("h2", { children: selectedDate })] }), _jsx("strong", { children: t('calendar.eventCount').replace('{count}', String(filteredEvents.length)) })] }), notice && _jsx("p", { className: css.draftNotice, role: "status", children: t('calendar.notice.drafted') }), dayValue === null ? (_jsx("p", { className: shared.empty, children: t('calendar.loading') })) : filteredEvents.length === 0 ? (_jsx("p", { className: css.emptyDay, children: t('calendar.emptyDay') })) : (_jsx("ul", { className: css.events, children: filteredEvents.map((event, index) => {
                                                const copy = eventCopy(event, t);
                                                return (_jsxs("li", { className: css.event, "data-kind": event.type, children: [_jsx("span", { className: css.eventIcon, children: eventIcon(event) }), _jsxs("div", { children: [_jsx("small", { children: copy.kind }), _jsx("p", { children: copy.detail })] }), _jsx("button", { type: "button", "aria-label": t('calendar.conversation'), title: t('calendar.conversation'), onClick: () => { draftConversation(event); }, children: _jsx(IconSendOutline14, {}) })] }, `${event.type}-${index}`));
                                            }) }))] })) : (_jsxs("section", { className: css.trend, "aria-label": t('calendar.trend'), children: [_jsxs("header", { children: [_jsx("small", { children: t('calendar.showTrend') }), _jsx("h2", { children: t('calendar.trend') })] }), trend?.canPlot === true ? (_jsxs(_Fragment, { children: [_jsxs("svg", { viewBox: "0 0 100 48", role: "img", "aria-label": t('calendar.trendChart'), children: [_jsx("line", { x1: "4", x2: "96", y1: "26", y2: "26" }), _jsx("polyline", { points: plottedTrendCoordinates.map(point => `${point.x},${point.y}`).join(' ') }), plottedTrendCoordinates.map(point => (_jsx("circle", { cx: point.x, cy: point.y, r: "1.8" }, point.id)))] }), _jsxs("div", { className: css.trendScale, "aria-hidden": "true", children: [_jsx("span", { children: "\u22122" }), _jsx("span", { children: "0" }), _jsx("span", { children: "+2" })] })] })) : (_jsx("p", { className: css.emptyDay, children: t('calendar.trendEmpty') }))] })) })] })] })] }));
}
//# sourceMappingURL=CalendarSpace.js.map