import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Responsive personal orrery for the Today observatory. */
import { useEffect, useRef } from 'react';
import css from './EditorialOrbit.module.css';
const POSITIONS = [
    { x: 31, y: 17, depth: 12 },
    { x: 69, y: 17, depth: 18 },
    { x: 84, y: 50, depth: 8 },
    { x: 69, y: 83, depth: 16 },
    { x: 31, y: 83, depth: 10 },
    { x: 16, y: 50, depth: 20 },
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
            target.style.setProperty('--orbit-tilt-x', `${(-next.y * 3).toFixed(2)}deg`);
            target.style.setProperty('--orbit-tilt-y', `${(next.x * 4.5).toFixed(2)}deg`);
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
    return (_jsxs("figure", { ref: orbitRef, className: css.orbit, "aria-label": t('orbit.label'), onPointerMove: tiltInstrument, onPointerLeave: settleInstrument, children: [_jsx("span", { className: css.starDepth, "aria-hidden": "true", children: Array.from({ length: 32 }, (_, index) => _jsx("i", {}, index)) }), _jsxs("div", { className: css.instrumentFrame, "aria-hidden": "true", children: [_jsx("span", { className: css.outerShadow }), _jsx("span", { className: css.brassBezel }), _jsx("span", { className: css.enamelWell }), _jsxs("svg", { className: css.instrument, viewBox: "0 0 100 100", children: [_jsx("g", { className: css.rotorSlow, children: _jsx("circle", { className: css.calibrationOuter, cx: "50", cy: "50", r: "45", pathLength: "96" }) }), _jsxs("g", { className: css.centerMark, children: [_jsx("circle", { cx: "50", cy: "50", r: "11" }), _jsx("circle", { cx: "50", cy: "50", r: "2.4" })] })] }), _jsx("span", { className: css.crown })] }), _jsx("ol", { className: css.nodes, children: nodes.map((node, index) => {
                    const position = POSITIONS[index] ?? POSITIONS[0];
                    return (_jsxs("li", { "data-kind": node.kind, style: {
                            '--orbit-x': `${position.x}%`,
                            '--orbit-y': `${position.y}%`,
                            '--orbit-depth': `${position.depth}px`,
                            '--orbit-delay': `${index * -1.7}s`,
                        }, children: [_jsx("span", { className: css.node, "aria-hidden": "true" }), _jsxs("span", { className: css.nodeCopy, children: [_jsx("strong", { children: node.label }), _jsx("small", { children: node.meta })] })] }, node.id));
                }) }), _jsx("div", { className: css.centerContent, children: children ?? (_jsxs("span", { className: css.center, children: [_jsx("strong", { children: t('orbit.center') }), _jsx("small", { children: t(`mode.${mode}`) })] })) }), _jsx("figcaption", { children: t('orbit.summary')
                    .replace('{questions}', String(openCount))
                    .replace('{reviews}', String(savedCount)) })] }));
}
//# sourceMappingURL=EditorialOrbit.js.map