import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Lightweight React adapter for the lazily loaded constellation renderer. */
import { useEffect, useState } from 'react';
import { loadMindGardenScenes } from "../scene-loader.js";
import css from './StarField.module.css';
/** Display the live WebGL constellation, with the surrounding space owning accessible nodes. */
export function StarField({ model, fallback, reducedMotion = false, selectedId = 'center', onSelect, }) {
    const [host, setHost] = useState(null);
    const [state, setState] = useState('loading');
    const [systemReducedMotion, setSystemReducedMotion] = useState(() => typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [hovered, setHovered] = useState(null);
    useEffect(() => {
        if (typeof window.matchMedia !== 'function')
            return;
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { setSystemReducedMotion(query.matches); };
        update();
        query.addEventListener('change', update);
        return () => { query.removeEventListener('change', update); };
    }, []);
    useEffect(() => {
        if (host === null)
            return;
        let disposed = false;
        let teardown;
        setState('loading');
        void loadMindGardenScenes().then((scenes) => {
            if (disposed)
                return;
            teardown = scenes.mountGardenStarField(host, model, reducedMotion || systemReducedMotion, selectedId, onSelect, (id, x, y) => {
                const node = model.nodes.find(candidate => candidate.id === id);
                setHovered(node === undefined ? null : { node, x, y });
            });
            setState('ready');
        }).catch(() => {
            if (disposed)
                return;
            host.replaceChildren();
            setState('fallback');
        });
        return () => {
            disposed = true;
            teardown?.();
            host.replaceChildren();
        };
    }, [host, model, onSelect, reducedMotion, selectedId, systemReducedMotion]);
    return (_jsxs("div", { className: css.scene, "data-render-state": state, children: [_jsx("div", { className: css.host, ref: setHost, "aria-hidden": "true" }), hovered !== null && (_jsxs("div", { className: css.tooltip, style: { '--mg-star-x': `${hovered.x}px`, '--mg-star-y': `${hovered.y}px` }, children: [_jsx("strong", { children: hovered.node.title }), _jsx("p", { children: hovered.node.detail })] })), state === 'fallback' && _jsx("div", { className: css.fallback, role: "status", children: fallback })] }));
}
//# sourceMappingURL=StarFieldView.js.map