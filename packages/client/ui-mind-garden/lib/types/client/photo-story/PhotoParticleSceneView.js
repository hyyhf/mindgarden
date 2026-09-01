import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Lightweight React adapter for the lazily loaded photo particle renderer. */
import { useEffect, useRef, useState } from 'react';
import { loadMindGardenScenes } from "../scene-loader.js";
import css from './PhotoParticleScene.module.css';
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => { resolve(image); };
        image.onerror = () => { reject(new Error('photo-decode-failed')); };
        image.src = src;
    });
}
/** Keep a verified-image fallback visible while the optional WebGL renderer loads. */
export function PhotoParticleScene({ src, alt, config, labels, onCount, recomposeToken = 0, }) {
    const [host, setHost] = useState(null);
    const [state, setState] = useState('loading');
    const [reducedMotion, setReducedMotion] = useState(() => typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const controllerRef = useRef(null);
    const configRef = useRef(config);
    const onCountRef = useRef(onCount);
    const recomposeRef = useRef(recomposeToken);
    configRef.current = config;
    onCountRef.current = onCount;
    useEffect(() => {
        if (typeof window.matchMedia !== 'function')
            return;
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { setReducedMotion(query.matches); };
        update();
        query.addEventListener('change', update);
        return () => { query.removeEventListener('change', update); };
    }, []);
    useEffect(() => { controllerRef.current?.update(config); }, [config]);
    useEffect(() => {
        if (recomposeRef.current === recomposeToken)
            return;
        recomposeRef.current = recomposeToken;
        controllerRef.current?.recompose();
    }, [recomposeToken]);
    useEffect(() => {
        if (host === null)
            return;
        if (reducedMotion) {
            controllerRef.current?.dispose();
            controllerRef.current = null;
            host.replaceChildren();
            onCountRef.current?.(0);
            setState('reduced');
            return;
        }
        let disposed = false;
        setState('loading');
        void Promise.all([loadImage(src), loadMindGardenScenes()]).then(([image, scenes]) => {
            if (disposed)
                return;
            const controller = scenes.mountPhotoParticleScene(host, image, configRef.current, false);
            controllerRef.current = controller;
            onCountRef.current?.(controller.count);
            setState('ready');
        }).catch(() => {
            if (!disposed)
                setState('fallback');
        });
        return () => {
            disposed = true;
            controllerRef.current?.dispose();
            controllerRef.current = null;
            host.replaceChildren();
        };
    }, [host, reducedMotion, src]);
    return (_jsxs("figure", { className: css.scene, "data-render-state": state, style: { '--mg-photo-bg': config.rendering.background }, children: [_jsx("div", { className: css.host, ref: setHost, "aria-label": labels.scene, role: "img" }), state === 'loading' && _jsx("span", { className: css.status, role: "status", children: labels.loading }), (state === 'fallback' || state === 'reduced') && (_jsxs("div", { className: css.fallback, children: [_jsx("img", { src: src, alt: alt }), _jsx("span", { role: "status", children: state === 'reduced' ? labels.reduced : labels.fallback })] })), _jsx("i", { className: css.vignette, "aria-hidden": "true", style: { opacity: config.effects.vignette } })] }));
}
//# sourceMappingURL=PhotoParticleSceneView.js.map