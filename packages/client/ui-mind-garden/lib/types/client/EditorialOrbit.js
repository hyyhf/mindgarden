import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Responsive personal orrery for the Today observatory. */
import { useEffect, useRef } from 'react';
import css from './EditorialOrbit.module.css';
const POSITIONS = [
    { x: 29, y: 21, depth: 12 },
    { x: 71, y: 18, depth: 18 },
    { x: 88, y: 48, depth: 8 },
    { x: 70, y: 80, depth: 16 },
    { x: 29, y: 80, depth: 10 },
    { x: 12, y: 50, depth: 20 },
];
function orbitNodes(questions, reviews, t) {
    const nodes = [
        ...questions.filter(item => item.status === 'open').slice(0, 3).map(item => ({
            id: String(item.id),
            label: item.question,
            meta: t('orbit.question.meta'),
            kind: 'question',
        })),
        ...reviews.filter(item => item.status === 'saved').slice(0, 3).map(item => ({
            id: String(item.id),
            label: item.content,
            meta: item.endStamp.localDate,
            kind: 'review',
        })),
    ];
    const fallbacks = [
        { id: 'today', label: t('orbit.fallback.today'), meta: t('orbit.fallback.unnamed'), kind: 'continuity' },
        { id: 'memory', label: t('orbit.fallback.memory'), meta: t('orbit.fallback.unwritten'), kind: 'review' },
        { id: 'tomorrow', label: t('orbit.fallback.tomorrow'), meta: t('orbit.fallback.choice'), kind: 'question' },
        { id: 'stillness', label: t('orbit.fallback.stillness'), meta: t('orbit.fallback.permission'), kind: 'continuity' },
        { id: 'noticed', label: t('orbit.fallback.noticed'), meta: t('orbit.fallback.stay'), kind: 'review' },
        { id: 'return', label: t('orbit.fallback.return'), meta: t('orbit.fallback.waiting'), kind: 'question' },
    ];
    for (const fallback of fallbacks) {
        if (nodes.length >= POSITIONS.length)
            break;
        nodes.push(fallback);
    }
    return nodes.slice(0, POSITIONS.length);
}
/** Render real reflection records inside a responsive, non-authoritative spatial instrument. */
export function EditorialOrbit({ questions, reviews, mode, t, children, }) {
    const nodes = orbitNodes(questions, reviews, t);
    const openCount = questions.filter(item => item.status === 'open').length;
    const savedCount = reviews.filter(item => item.status === 'saved').length;
    const orbitRef = useRef(null);
    const tiltFrame = useRef(undefined);
    const pointerPosition = useRef({ x: 0, y: 0 });
    useEffect(() => () => {
        if (tiltFrame.current !== undefined)
            window.cancelAnimationFrame(tiltFrame.current);
    }, []);
    function tiltInstrument(event) {
        if (event.pointerType === 'touch')
            return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) - 0.5;
        const y = ((event.clientY - bounds.top) / bounds.height) - 0.5;
        pointerPosition.current = { x, y };
        event.currentTarget.dataset.interacting = 'true';
        if (tiltFrame.current !== undefined)
            return;
        tiltFrame.current = window.requestAnimationFrame(() => {
            tiltFrame.current = undefined;
            const target = orbitRef.current;
            /* v8 ignore next -- the scheduled frame can outlive an HMR disposal. */
            if (target === null)
                return;
            const next = pointerPosition.current;
            target.style.setProperty('--orbit-tilt-x', `${(-next.y * 5).toFixed(2)}deg`);
            target.style.setProperty('--orbit-tilt-y', `${(next.x * 7).toFixed(2)}deg`);
            target.style.setProperty('--orbit-light-x', `${((next.x + 0.5) * 100).toFixed(1)}%`);
            target.style.setProperty('--orbit-light-y', `${((next.y + 0.5) * 100).toFixed(1)}%`);
        });
    }
    function settleInstrument() {
        if (tiltFrame.current !== undefined)
            window.cancelAnimationFrame(tiltFrame.current);
        tiltFrame.current = undefined;
        const target = orbitRef.current;
        if (target === null)
            return;
        delete target.dataset.interacting;
        target.style.setProperty('--orbit-tilt-x', '0deg');
        target.style.setProperty('--orbit-tilt-y', '0deg');
        target.style.setProperty('--orbit-light-x', '32%');
        target.style.setProperty('--orbit-light-y', '24%');
    }
    return (_jsxs("figure", { ref: orbitRef, className: css.orbit, "aria-label": t('orbit.label'), onPointerMove: tiltInstrument, onPointerLeave: settleInstrument, children: [_jsx("span", { className: css.starDepth, "aria-hidden": "true", children: Array.from({ length: 32 }, (_, index) => _jsx("i", {}, index)) }), _jsxs("div", { className: css.instrumentFrame, "aria-hidden": "true", children: [_jsx("span", { className: css.outerShadow }), _jsx("span", { className: css.brassBezel, children: Array.from({ length: 48 }, (_, index) => (_jsx("i", { style: { '--tick': index } }, index))) }), _jsx("span", { className: css.enamelWell }), _jsxs("svg", { className: css.instrument, viewBox: "0 0 100 100", children: [_jsxs("g", { className: css.rotorSlow, children: [_jsx("circle", { className: css.calibrationOuter, cx: "50", cy: "50", r: "45.5", pathLength: "144" }), _jsx("circle", { className: css.brassRing, cx: "50", cy: "50", r: "42" }), _jsx("circle", { className: css.tealRing, cx: "50", cy: "50", r: "34.5" }), _jsx("circle", { className: css.brassRingFine, cx: "50", cy: "50", r: "27" })] }), _jsxs("g", { className: css.rotorReverse, children: [_jsx("path", { className: css.brassArc, d: "M11 57C21 21 65 5 89 34" }), _jsx("path", { className: css.tealArc, d: "M14 39C38 91 76 86 91 52" }), _jsx("path", { className: css.ghostArc, d: "M21 77C42 35 68 24 84 26" })] }), _jsxs("g", { className: css.axes, children: [_jsx("path", { d: "M7 50h86M50 7v86" }), _jsx("path", { d: "M15 15l70 70M85 15 15 85" })] }), _jsxs("g", { className: css.centerMark, children: [_jsx("circle", { cx: "50", cy: "50", r: "11.5" }), _jsx("circle", { cx: "50", cy: "50", r: "8.2" }), _jsx("path", { d: "m50 41.5 2.3 6.2 6.2 2.3-6.2 2.3-2.3 6.2-2.3-6.2-6.2-2.3 6.2-2.3 2.3-6.2Z" })] })] }), _jsx("span", { className: css.crown }), _jsx("span", { className: css.adjuster }), _jsx("span", { className: css.hinge })] }), _jsx("ol", { className: css.nodes, children: nodes.map((node, index) => {
                    const position = POSITIONS[index] ?? POSITIONS[0];
                    return (_jsxs("li", { "data-kind": node.kind, style: {
                            '--orbit-x': `${position.x}%`,
                            '--orbit-y': `${position.y}%`,
                            '--orbit-depth': `${position.depth}px`,
                            '--orbit-delay': `${index * -1.7}s`,
                        }, children: [_jsx("span", { className: css.node, "aria-hidden": "true", children: _jsx("i", {}) }), _jsxs("span", { className: css.nodeCopy, children: [_jsx("strong", { children: node.label }), _jsx("small", { children: node.meta })] })] }, node.id));
                }) }), _jsx("div", { className: css.centerContent, children: children ?? (_jsxs("span", { className: css.center, children: [_jsx("strong", { children: t('orbit.center') }), _jsx("small", { children: t(`mode.${mode}`) })] })) }), _jsx("figcaption", { children: t('orbit.summary')
                    .replace('{questions}', String(openCount))
                    .replace('{reviews}', String(savedCount)) })] }));
}
//# sourceMappingURL=EditorialOrbit.js.map