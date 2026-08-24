import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Responsive paper corridor for the Today workspace. */
import { useEffect, useRef } from 'react';
import { GARDEN_HOME_COURTYARD_V4 } from "./generated-assets.js";
import css from './EditorialOrbit.module.css';
/** Render truthful records as three navigable stations in the morning paper corridor. */
export function EditorialOrbit({ questions, reviews, mode, t, children, }) {
    const modeLabel = mode === 'serenity' ? t('mode.serenity') : t('mode.clarity');
    const currentQuestion = questions.find(item => item.status === 'open');
    const currentReview = reviews.find(item => item.status === 'saved');
    const openCount = questions.filter(item => item.status === 'open').length;
    const savedCount = reviews.filter(item => item.status === 'saved').length;
    const corridorRef = useRef(null);
    const tiltFrame = useRef(undefined);
    const pointerPosition = useRef({ x: 0, y: 0 });
    const stations = [
        {
            id: 'checkin',
            href: '#mind-garden-today-title',
            label: t('today.observatory.checkin'),
            meta: modeLabel,
            kind: 'porcelain',
        },
        {
            id: 'question',
            href: '#mind-garden-questions-title',
            label: currentQuestion?.question ?? t('orbit.fallback.stillness'),
            meta: t('today.echo.question'),
            kind: 'paper',
        },
        {
            id: 'review',
            href: '#mind-garden-reviews-title',
            label: currentReview?.content ?? t('orbit.fallback.memory'),
            meta: t('today.echo.review'),
            kind: 'stone',
        },
    ];
    useEffect(() => () => {
        if (tiltFrame.current !== undefined)
            window.cancelAnimationFrame(tiltFrame.current);
    }, []);
    function tiltCorridor(event) {
        if (event.pointerType === 'touch')
            return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerPosition.current = {
            x: ((event.clientX - bounds.left) / bounds.width) - 0.5,
            y: ((event.clientY - bounds.top) / bounds.height) - 0.5,
        };
        if (tiltFrame.current !== undefined)
            return;
        tiltFrame.current = window.requestAnimationFrame(() => {
            tiltFrame.current = undefined;
            const target = corridorRef.current;
            /* v8 ignore next -- a scheduled frame can outlive HMR disposal. */
            if (target === null)
                return;
            const next = pointerPosition.current;
            target.style.setProperty('--corridor-tilt-x', `${(-next.y * 1.8).toFixed(2)}deg`);
            target.style.setProperty('--corridor-tilt-y', `${(next.x * 2.4).toFixed(2)}deg`);
            target.style.setProperty('--corridor-light-x', `${((next.x + 0.5) * 100).toFixed(1)}%`);
        });
    }
    function settleCorridor() {
        if (tiltFrame.current !== undefined)
            window.cancelAnimationFrame(tiltFrame.current);
        tiltFrame.current = undefined;
        const target = corridorRef.current;
        if (target === null)
            return;
        target.style.setProperty('--corridor-tilt-x', '0deg');
        target.style.setProperty('--corridor-tilt-y', '0deg');
        target.style.setProperty('--corridor-light-x', '28%');
    }
    return (_jsxs("figure", { ref: corridorRef, className: css.corridor, style: { '--mg-courtyard-scene': `url("${GARDEN_HOME_COURTYARD_V4}")` }, "aria-label": t('orbit.label'), onPointerMove: tiltCorridor, onPointerLeave: settleCorridor, children: [_jsx("div", { className: css.entry, children: children ?? (_jsxs("span", { className: css.defaultEntry, children: [_jsx("strong", { children: t('orbit.center') }), _jsx("small", { children: modeLabel })] })) }), _jsxs("div", { className: css.scene, children: [_jsx("span", { className: css.morningLight, "aria-hidden": "true" }), _jsxs("svg", { className: css.path, viewBox: "0 0 760 330", preserveAspectRatio: "none", "aria-hidden": "true", children: [_jsx("path", { d: "M38 260 C155 180 240 238 336 152 S530 148 722 56" }), _jsx("circle", { cx: "62", cy: "244", r: "4" }), _jsx("circle", { cx: "346", cy: "142", r: "4" }), _jsx("circle", { cx: "700", cy: "68", r: "4" })] }), _jsx("ol", { className: css.stations, children: stations.map((station, index) => (_jsx("li", { "data-kind": station.kind, "data-position": index + 1, children: _jsxs("a", { href: station.href, className: css.station, children: [_jsxs("span", { className: css.material, "aria-hidden": "true", children: [station.kind === 'porcelain' && _jsx("span", { className: css.porcelainToken }), station.kind === 'paper' && _jsx("span", { className: css.paperFold }), station.kind === 'stone' && _jsx("span", { className: css.stoneSeal })] }), _jsxs("span", { className: css.stationCopy, children: [_jsx("small", { children: station.meta }), _jsx("strong", { children: station.label }), _jsxs("em", { children: [t('orbit.fallback.return'), " \u2192"] })] })] }) }, station.id))) }), _jsxs("aside", { className: css.sceneNote, children: [_jsx("strong", { children: t('today.echo.title') }), _jsx("span", { children: t('orbit.summary').replace('{questions}', String(openCount)).replace('{reviews}', String(savedCount)) })] })] })] }));
}
//# sourceMappingURL=EditorialOrbit.js.map