import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Harness-native photo archive with a real 3D particle story surface. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconChevronLeftOutline14, IconChevronRightOutline14, IconFullscreenOutline16, IconNewChatOutline16, IconPauseOutline16, IconPlayOutline16, IconPlusOutline16, IconRefreshOutline14, IconSettingsOutline16, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import { calendarStamp } from "../calendar.js";
import { PHOTO_MEMORY_STAGE_V5 } from "../generated-assets.js";
import { applyPhotoParticlePreset } from "./presets.js";
import { PhotoParticleScene } from "./PhotoParticleScene.js";
import { preparePhotoUpload } from "./photo-upload.js";
import css from './PhotoStorySpace.module.css';
const PAGE_SIZE = 9;
const DYNAMIC_LIMIT = 10;
const MAX_IMAGE_CACHE_ENTRIES = 14;
const PRESETS = ['soft', 'dust', 'fluid', 'nebula'];
const ALBUM_VIEWS = ['classic', 'dynamic'];
function useReducedMotion() {
    const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(() => {
        if (typeof window.matchMedia !== 'function')
            return;
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { setReduced(query.matches); };
        update();
        query.addEventListener('change', update);
        return () => { query.removeEventListener('change', update); };
    }, []);
    return reduced;
}
function storyKey(story) {
    return String(story.id);
}
function updateConfigGroup(config, group, patch) {
    return { ...config, [group]: { ...config[group], ...patch } };
}
function replaceCount(copy, count) {
    return copy.replace('{count}', new Intl.NumberFormat().format(count));
}
function observationErrorKey(code) {
    if (code === 'photo-model-failed')
        return 'photo.error.observe.model';
    if (code === 'photo-output-invalid')
        return 'photo.error.observe.output';
    if (code === 'photo-image-unsupported' || code === 'photo-model-unavailable') {
        return 'photo.error.observe.route';
    }
    if (code === 'attachment-unavailable')
        return 'photo.error.load';
    return 'photo.error.observe';
}
function uploadErrorKey(code, reason) {
    if (reason === 'IMAGE_TOO_LARGE')
        return 'photo.error.upload.size';
    if (reason === 'IMAGE_DIMENSION_TOO_LARGE' || reason === 'IMAGE_TOO_MANY_PIXELS') {
        return 'photo.error.upload.dimension';
    }
    if (reason === 'UNSUPPORTED_MEDIA_TYPE' || reason === 'INVALID_IMAGE' || reason === 'IMAGE_TYPE_MISMATCH') {
        return 'photo.error.upload.format';
    }
    if (reason === 'BROWSER_TRANSCODE_FAILED')
        return 'photo.error.upload.browser';
    if (code === 'attachment-unavailable' || code === 'unavailable')
        return 'photo.error.upload.unavailable';
    return 'photo.error.upload';
}
/** Render the encrypted photo-story album and its parameterized particle editor. */
export function PhotoStorySpace({ today, imageLimits, onListPhotoStories, onCreatePhotoStory, onReadPhotoStory, onObservePhotoStory, onContinuePhotoStory, onUpdatePhotoStory, onDeletePhotoStory, t, }) {
    const [stories, setStories] = useState([]);
    const [images, setImages] = useState(new Map());
    const [active, setActive] = useState(null);
    const [storyPanel, setStoryPanel] = useState('dialogue');
    const [view, setView] = useState('classic');
    const [dynamicIndex, setDynamicIndex] = useState(0);
    const [dynamicAutoPlay, setDynamicAutoPlay] = useState(true);
    const [dynamicPointerActive, setDynamicPointerActive] = useState(false);
    const [dynamicFocusWithin, setDynamicFocusWithin] = useState(false);
    const [dynamicDrag, setDynamicDrag] = useState(0);
    const [dynamicDragging, setDynamicDragging] = useState(false);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [pending, setPending] = useState(false);
    const [errorKey, setErrorKey] = useState(null);
    const [uploadNoticeKey, setUploadNoticeKey] = useState(null);
    const [saved, setSaved] = useState(false);
    const [deleteArmed, setDeleteArmed] = useState(false);
    const [preview, setPreview] = useState(false);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [config, setConfig] = useState(null);
    const [particleCount, setParticleCount] = useState(0);
    const [particleRecompose, setParticleRecompose] = useState(0);
    const [imageRetry, setImageRetry] = useState(0);
    const [dialoguePending, setDialoguePending] = useState(false);
    const [dialogueDraft, setDialogueDraft] = useState('');
    const inputRef = useRef(null);
    const viewTabRefs = useRef({
        classic: null,
        dynamic: null,
    });
    const dynamicCardRefs = useRef([]);
    const dynamicFocusTargetRef = useRef(null);
    const dynamicGestureRef = useRef({ pointerId: -1, lastX: 0, angle: 0, velocity: 0 });
    const dynamicWasDraggedRef = useRef(false);
    const requestRef = useRef(0);
    const imageRequestRef = useRef(0);
    const requestedImagesRef = useRef(new Set());
    const reducedMotion = useReducedMotion();
    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        const result = await onListPhotoStories();
        if (request !== requestRef.current)
            return;
        if (result.ok) {
            setStories(result.value);
            setPage(current => Math.min(current, Math.max(1, Math.ceil(result.value.length / PAGE_SIZE))));
            setErrorKey(null);
        }
        else {
            setErrorKey('photo.error.load');
        }
        setLoading(false);
    }, [onListPhotoStories]);
    useEffect(() => {
        void refresh();
        return () => { requestRef.current++; };
    }, [refresh]);
    const pageCount = Math.max(1, Math.ceil(stories.length / PAGE_SIZE));
    const pageStories = useMemo(() => stories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page, stories]);
    const dynamicStories = useMemo(() => stories.slice(0, DYNAMIC_LIMIT), [stories]);
    const visibleStories = view === 'classic' ? pageStories : dynamicStories;
    const visibleKey = visibleStories.map(storyKey).join(':');
    useEffect(() => {
        setDynamicIndex(current => Math.min(current, Math.max(0, dynamicStories.length - 1)));
    }, [dynamicStories.length]);
    useEffect(() => {
        if (dynamicFocusTargetRef.current !== dynamicIndex)
            return;
        dynamicFocusTargetRef.current = null;
        dynamicCardRefs.current[dynamicIndex]?.focus();
    }, [dynamicIndex]);
    useEffect(() => {
        if (reducedMotion)
            setDynamicAutoPlay(false);
    }, [reducedMotion]);
    useEffect(() => {
        if (view !== 'dynamic'
            || dynamicStories.length < 2
            || !dynamicAutoPlay
            || dynamicPointerActive
            || dynamicFocusWithin
            || reducedMotion)
            return;
        const timer = window.setInterval(() => {
            setDynamicIndex(current => (current + 1) % dynamicStories.length);
        }, 5_200);
        return () => { window.clearInterval(timer); };
    }, [dynamicAutoPlay, dynamicFocusWithin, dynamicPointerActive, dynamicStories.length, reducedMotion, view]);
    useEffect(() => {
        const candidates = active === null ? visibleStories : [...visibleStories, active];
        const missing = candidates.filter((story) => {
            const key = storyKey(story);
            return !images.has(key) && !requestedImagesRef.current.has(key);
        });
        if (missing.length === 0)
            return;
        missing.forEach((story) => { requestedImagesRef.current.add(storyKey(story)); });
        const request = ++imageRequestRef.current;
        void Promise.all(missing.map(async (story) => ({ story, result: await onReadPhotoStory(story) }))).then((entries) => {
            if (request !== imageRequestRef.current)
                return;
            if (entries.some(entry => !entry.result.ok))
                setErrorKey('photo.error.load');
            entries.forEach(({ story, result }) => {
                if (!result.ok)
                    requestedImagesRef.current.delete(storyKey(story));
            });
            setImages((current) => {
                const next = new Map(current);
                let changed = false;
                entries.forEach(({ story, result }) => {
                    if (result.ok) {
                        const key = storyKey(story);
                        next.delete(key);
                        next.set(key, result.value);
                        changed = true;
                    }
                });
                const protectedKeys = new Set(candidates.map(storyKey));
                for (const [key] of next) {
                    if (next.size <= MAX_IMAGE_CACHE_ENTRIES)
                        break;
                    if (protectedKeys.has(key))
                        continue;
                    next.delete(key);
                    requestedImagesRef.current.delete(key);
                    changed = true;
                }
                return changed ? next : current;
            });
        });
        return () => { imageRequestRef.current++; };
    }, [active, imageRetry, images, onReadPhotoStory, visibleKey]);
    useEffect(() => {
        if (active === null)
            return;
        setTitle(active.title);
        setNote(active.note);
        setConfig(active.particleConfig);
        setDeleteArmed(false);
        setPreview(false);
    }, [active]);
    async function chooseFiles(event) {
        const files = [...(event.target.files ?? [])];
        event.target.value = '';
        if (files.length === 0 || uploading)
            return;
        setUploading(true);
        setErrorKey(null);
        setUploadNoticeKey(null);
        try {
            let failure = null;
            let optimized = false;
            for (const file of files) {
                const prepared = imageLimits === undefined
                    ? { ok: true, file, optimized: false }
                    : await preparePhotoUpload(file, imageLimits);
                if (!prepared.ok) {
                    failure ??= uploadErrorKey('attachment-rejected', prepared.reason);
                    continue;
                }
                optimized ||= prepared.optimized;
                const result = await onCreatePhotoStory(prepared.file, calendarStamp(today));
                if (!result.ok)
                    failure ??= uploadErrorKey(result.code, result.reason);
            }
            await refresh();
            if (optimized)
                setUploadNoticeKey('photo.upload.optimized');
            if (failure !== null)
                setErrorKey(failure);
        }
        catch {
            setErrorKey('photo.error.upload');
        }
        finally {
            setUploading(false);
        }
    }
    function openStory(story) {
        setSaved(false);
        setStoryPanel('dialogue');
        setActive(story);
    }
    function moveDynamicFrame(delta, moveFocus = false) {
        if (dynamicStories.length === 0)
            return;
        const nextIndex = (dynamicIndex + delta + dynamicStories.length) % dynamicStories.length;
        dynamicFocusTargetRef.current = moveFocus ? nextIndex : null;
        setDynamicIndex(nextIndex);
    }
    function selectAlbumView(next, moveFocus = false) {
        setView(next);
        if (moveFocus)
            queueMicrotask(() => { viewTabRefs.current[next]?.focus(); });
    }
    function moveAlbumView(event, current) {
        const currentIndex = ALBUM_VIEWS.indexOf(current);
        const next = event.key === 'ArrowRight'
            ? ALBUM_VIEWS[(currentIndex + 1) % ALBUM_VIEWS.length]
            : event.key === 'ArrowLeft'
                ? ALBUM_VIEWS[(currentIndex - 1 + ALBUM_VIEWS.length) % ALBUM_VIEWS.length]
                : event.key === 'Home'
                    ? ALBUM_VIEWS[0]
                    : event.key === 'End'
                        ? ALBUM_VIEWS.at(-1)
                        : undefined;
        if (next === undefined)
            return;
        event.preventDefault();
        selectAlbumView(next, true);
    }
    function startDynamicGesture(event) {
        if (reducedMotion || dynamicStories.length < 2 || event.button !== 0)
            return;
        if (event.target.closest(`.${css.carouselControls}`) !== null)
            return;
        dynamicGestureRef.current = { pointerId: event.pointerId, lastX: event.clientX, angle: 0, velocity: 0 };
        dynamicWasDraggedRef.current = false;
        setDynamicDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function moveDynamicGesture(event) {
        const gesture = dynamicGestureRef.current;
        if (!dynamicDragging || gesture.pointerId !== event.pointerId)
            return;
        const delta = event.clientX - gesture.lastX;
        gesture.lastX = event.clientX;
        gesture.velocity = gesture.velocity * 0.52 + delta * 0.48;
        gesture.angle += delta * 0.24;
        if (Math.abs(gesture.angle) > 4)
            dynamicWasDraggedRef.current = true;
        setDynamicDrag(gesture.angle);
    }
    function finishDynamicGesture(event, cancelled = false) {
        const gesture = dynamicGestureRef.current;
        if (!dynamicDragging || gesture.pointerId !== event.pointerId)
            return;
        if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        setDynamicDragging(false);
        setDynamicDrag(0);
        if (!cancelled) {
            const stepAngle = 360 / dynamicStories.length;
            const step = Math.round(-(gesture.angle + gesture.velocity * 8) / stepAngle);
            if (step !== 0)
                moveDynamicFrame(step);
        }
        dynamicGestureRef.current.pointerId = -1;
    }
    function retryPhotoStories() {
        requestedImagesRef.current.clear();
        setImageRetry(current => current + 1);
        void refresh();
    }
    async function saveStory(story, particleConfig) {
        setPending(true);
        setErrorKey(null);
        setSaved(false);
        try {
            const result = await onUpdatePhotoStory(story, title.trim(), note.trim(), particleConfig);
            if (result.ok) {
                setActive(result.value);
                setStories(current => current.map(item => storyKey(item) === storyKey(result.value) ? result.value : item));
                setSaved(true);
            }
            else {
                setErrorKey('photo.error.save');
                await refresh();
            }
        }
        catch {
            setErrorKey('photo.error.save');
        }
        finally {
            setPending(false);
        }
    }
    function adoptStory(story) {
        setActive(story);
        setStories(current => current.map(item => storyKey(item) === storyKey(story) ? story : item));
    }
    async function observeStory(story) {
        setDialoguePending(true);
        setErrorKey(null);
        try {
            const result = await onObservePhotoStory(story);
            if (result.ok)
                adoptStory(result.value);
            else
                setErrorKey(observationErrorKey(result.code));
        }
        catch {
            setErrorKey('photo.error.observe');
        }
        finally {
            setDialoguePending(false);
        }
    }
    async function continueStory(story, content, quickReplyKind = '') {
        const message = content.trim();
        if (message === '' || dialoguePending)
            return;
        setDialoguePending(true);
        setErrorKey(null);
        try {
            const result = await onContinuePhotoStory(story, message, quickReplyKind);
            if (result.ok) {
                adoptStory(result.value);
                setDialogueDraft('');
            }
            else {
                setErrorKey('photo.error.dialogue');
            }
        }
        catch {
            setErrorKey('photo.error.dialogue');
        }
        finally {
            setDialoguePending(false);
        }
    }
    function submitDialogue(event, story) {
        event.preventDefault();
        void continueStory(story, dialogueDraft);
    }
    async function deleteStory(story) {
        if (!deleteArmed) {
            setDeleteArmed(true);
            return;
        }
        setPending(true);
        setErrorKey(null);
        try {
            const result = await onDeletePhotoStory(story);
            if (result.ok) {
                const key = storyKey(story);
                setActive(null);
                setImages((current) => {
                    const next = new Map(current);
                    next.delete(key);
                    return next;
                });
                await refresh();
            }
            else {
                setErrorKey('photo.error.delete');
            }
        }
        catch {
            setErrorKey('photo.error.delete');
        }
        finally {
            setPending(false);
            setDeleteArmed(false);
        }
    }
    const activeImage = active === null ? undefined : images.get(storyKey(active));
    if (active !== null && config !== null) {
        return (_jsxs("main", { className: css.story, "data-mind-garden-space": "photo-story", "data-photo-mode": "story", style: { '--mg-photo-stage': `url("${PHOTO_MEMORY_STAGE_V5}")` }, children: [_jsxs("header", { className: css.storyHeader, children: [_jsxs("div", { className: css.storyHeading, children: [_jsx("h1", { children: t('photo.dialogue.title') }), _jsx("button", { type: "button", className: css.back, onClick: () => { setActive(null); }, children: t('photo.back') })] }), _jsxs("div", { className: css.storyMeta, children: [_jsx("span", { children: t('photo.date').replace('{date}', active.stamp.localDate) }), particleCount > 0 && _jsx("span", { children: replaceCount(t('photo.sceneCount'), particleCount) })] })] }), errorKey !== null && _jsxs("div", { className: css.error, role: "alert", children: [_jsx("span", { children: t(errorKey) }), errorKey === 'photo.error.load' && _jsx("button", { type: "button", onClick: retryPhotoStories, children: t('photo.retry') })] }), _jsxs("div", { className: css.storyGrid, children: [_jsx("section", { className: css.sceneColumn, children: activeImage === undefined ? (_jsx("div", { className: css.sceneLoading, role: "status", children: t('photo.sceneLoading') })) : (_jsxs(_Fragment, { children: [_jsx(PhotoParticleScene, { src: activeImage, alt: title || t('photo.scene'), config: config, labels: {
                                            scene: t('photo.scene'),
                                            loading: t('photo.sceneLoading'),
                                            fallback: t('photo.sceneFallback'),
                                            reduced: t('photo.sceneReducedMotion'),
                                        }, onCount: setParticleCount, recomposeToken: particleRecompose }), _jsxs("div", { className: css.sceneTools, children: [_jsxs("button", { type: "button", className: css.preview, "aria-label": t('photo.preview'), onClick: () => { setPreview(true); }, children: [_jsx(IconFullscreenOutline16, { size: 15 }), _jsx("span", { "aria-hidden": "true", children: t('photo.toolbar.original') })] }), _jsxs("button", { type: "button", className: css.preview, "aria-label": t('photo.recompose'), onClick: () => { setParticleRecompose(value => value + 1); }, children: [_jsx(IconRefreshOutline14, {}), _jsx("span", { "aria-hidden": "true", children: t('photo.toolbar.recompose') })] }), _jsxs("button", { type: "button", className: css.preview, "aria-controls": "mind-garden-photo-workbench", "aria-label": t('photo.panel.dialogue'), "aria-pressed": storyPanel === 'dialogue', onClick: () => { setStoryPanel('dialogue'); }, children: [_jsx(IconNewChatOutline16, { size: 15 }), _jsx("span", { "aria-hidden": "true", children: t('photo.toolbar.dialogue') })] }), _jsxs("button", { type: "button", className: css.preview, "aria-controls": "mind-garden-photo-workbench", "aria-label": t('photo.panel.edit'), "aria-pressed": storyPanel === 'edit', onClick: () => { setStoryPanel('edit'); }, children: [_jsx(IconSettingsOutline16, { size: 15 }), _jsx("span", { "aria-hidden": "true", children: t('photo.toolbar.particles') })] })] })] })) }), _jsxs("aside", { id: "mind-garden-photo-workbench", className: css.editor, "aria-label": t('photo.panel.controls'), children: [_jsxs("div", { className: css.editorForm, hidden: storyPanel !== 'edit', children: [_jsxs("label", { children: [_jsx("span", { children: t('photo.storyTitle') }), _jsx("input", { value: title, maxLength: 160, onChange: (event) => { setTitle(event.target.value); setSaved(false); } })] }), _jsxs("label", { children: [_jsx("span", { children: t('photo.storyNote') }), _jsx("textarea", { value: note, maxLength: 8_000, placeholder: t('photo.storyPlaceholder'), onChange: (event) => { setNote(event.target.value); setSaved(false); } })] }), _jsxs("section", { className: css.particleEditor, children: [_jsx("h2", { children: t('photo.particleTitle') }), _jsx("div", { className: css.presets, children: PRESETS.map(preset => (_jsx("button", { type: "button", "data-active": config.preset === preset, onClick: () => { setConfig(applyPhotoParticlePreset(config, preset)); setSaved(false); }, children: t(`photo.particle.${preset}`) }, preset))) }), _jsx(RangeField, { label: t('photo.pointSize'), value: config.rendering.pointSize, min: 0.7, max: 6, step: 0.1, onChange: (pointSize) => { setConfig(updateConfigGroup(config, 'rendering', { pointSize })); setSaved(false); } }), _jsx(RangeField, { label: t('photo.depth'), value: config.depth.strength, min: 0, max: 60, step: 1, onChange: (strength) => { setConfig(updateConfigGroup(config, 'depth', { strength })); setSaved(false); } }), _jsx(RangeField, { label: t('photo.interaction'), value: config.interaction.strength, min: 0, max: 16, step: 0.1, onChange: (strength) => { setConfig(updateConfigGroup(config, 'interaction', { strength })); setSaved(false); } }), _jsx(RangeField, { label: t('photo.motion'), value: config.animation.idleStrength, min: 0, max: 1.5, step: 0.01, onChange: (idleStrength) => { setConfig(updateConfigGroup(config, 'animation', { idleStrength })); setSaved(false); } })] }), saved && _jsx("p", { className: css.saved, role: "status", children: t('photo.saved') }), _jsxs("div", { className: css.editorActions, children: [_jsx("button", { type: "button", className: css.save, disabled: pending || title.trim() === '', onClick: () => { void saveStory(active, config); }, children: pending ? t('photo.saving') : t('photo.save') }), _jsx("button", { type: "button", className: css.delete, disabled: pending, onClick: () => { void deleteStory(active); }, children: deleteArmed ? t('photo.deleteConfirm') : t('photo.delete') })] }), deleteArmed && _jsx("p", { className: css.deleteHint, children: t('photo.deleteHint') })] }), _jsxs("section", { className: css.photoDialogue, hidden: storyPanel !== 'dialogue', "aria-labelledby": "mind-garden-photo-dialogue-title", children: [_jsxs("header", { children: [_jsx("h2", { id: "mind-garden-photo-dialogue-title", children: t('photo.dialogue.title') }), _jsx("p", { children: t('photo.dialogue.boundary') })] }), active.observation == null ? (_jsxs("div", { className: css.observationGate, children: [_jsxs("div", { children: [_jsx("h3", { children: t('photo.observe.title') }), _jsx("p", { children: t('photo.observe.disclosure') })] }), _jsx("button", { type: "button", disabled: dialoguePending, onClick: () => { void observeStory(active); }, children: dialoguePending ? t('photo.observe.pending') : t('photo.observe.action') })] })) : (_jsxs(_Fragment, { children: [_jsxs("article", { className: css.grounding, children: [_jsx("span", { children: t('photo.observe.unconfirmed') }), _jsx("p", { children: active.observation.grounding.visualSummary }), active.observation.grounding.visibleElements.length > 0 && (_jsx("ul", { "aria-label": t('photo.observe.visible'), children: active.observation.grounding.visibleElements.map(element => _jsx("li", { children: element }, element)) })), active.observation.grounding.uncertainDetails.length > 0 && (_jsxs("details", { children: [_jsx("summary", { children: t('photo.observe.uncertain') }), _jsx("ul", { children: active.observation.grounding.uncertainDetails.map(detail => _jsx("li", { children: detail }, detail)) })] }))] }), _jsx("div", { className: css.dialogueTurns, role: "log", "aria-live": "polite", children: active.turns.map(turn => (_jsxs("article", { "data-role": turn.role, children: [_jsx("span", { children: turn.role === 'user' ? t('photo.dialogue.me') : t('photo.dialogue.companion') }), _jsx("p", { children: turn.content })] }, String(turn.id)))) }), active.quickReplies.length > 0 && (_jsx("div", { className: css.quickReplies, "aria-label": t('photo.dialogue.suggestions'), children: active.quickReplies.map(reply => (_jsx("button", { type: "button", disabled: dialoguePending, onClick: () => { void continueStory(active, reply.label, reply.kind); }, children: reply.label }, reply.kind))) })), _jsxs("form", { className: css.dialogueForm, onSubmit: (event) => { submitDialogue(event, active); }, children: [_jsx("label", { htmlFor: "mind-garden-photo-dialogue-input", children: t('photo.dialogue.input') }), _jsxs("div", { children: [_jsx("textarea", { id: "mind-garden-photo-dialogue-input", maxLength: 8_000, placeholder: t('photo.dialogue.placeholder'), value: dialogueDraft, onChange: (event) => { setDialogueDraft(event.target.value); } }), _jsx("button", { type: "submit", disabled: dialoguePending || dialogueDraft.trim() === '', children: dialoguePending ? t('photo.dialogue.pending') : t('photo.dialogue.send') })] })] })] }))] })] })] }), stories.length > 1 && (_jsx("nav", { className: css.memoryRail, "aria-label": t('photo.albumView'), children: stories.slice(0, DYNAMIC_LIMIT).map((story, index) => {
                        const key = storyKey(story);
                        return (_jsxs("button", { type: "button", "data-active": key === storyKey(active), "aria-current": key === storyKey(active) ? 'true' : undefined, "aria-label": `${t('photo.open')} · ${story.title}`, onClick: () => { openStory(story); }, children: [images.get(key) === undefined ? _jsx("span", { className: css.shimmer }) : _jsx("img", { src: images.get(key), alt: "" }), _jsx("span", { children: String(index + 1).padStart(2, '0') })] }, key));
                    }) })), _jsx(Modal, { open: preview && activeImage !== undefined, title: t('photo.previewDialog'), closeLabel: t('photo.previewClose'), className: css.previewModal ?? '', contentClassName: css.previewModalContent ?? '', onClose: () => { setPreview(false); }, children: activeImage !== undefined && (_jsx("img", { className: css.previewImage, src: activeImage, alt: title || t('photo.scene') })) })] }));
    }
    return (_jsxs("main", { className: css.album, style: { '--mg-photo-stage': `url("${PHOTO_MEMORY_STAGE_V5}")` }, "data-mind-garden-space": "photo-story", "data-photo-mode": "album", "data-empty": stories.length === 0, children: [_jsx("div", { className: css.aurora, "aria-hidden": "true" }), _jsxs("header", { className: css.albumHeader, children: [_jsxs("div", { children: [_jsx("h1", { children: t('photo.title') }), _jsx("p", { children: t('photo.subtitle') }), stories.length > 0 && _jsx("strong", { children: t('photo.count').replace('{count}', String(stories.length)) })] }), _jsxs("div", { className: css.headerActions, children: [stories.length > 0 && _jsx("div", { className: css.viewSwitch, role: "tablist", "aria-label": t('photo.albumView'), children: ALBUM_VIEWS.map(option => (_jsx("button", { type: "button", role: "tab", id: `mind-garden-photo-${option}-tab`, "aria-controls": `mind-garden-photo-${option}-panel`, "aria-selected": view === option, tabIndex: view === option ? 0 : -1, ref: (node) => { viewTabRefs.current[option] = node; }, onClick: () => { selectAlbumView(option); }, onKeyDown: (event) => { moveAlbumView(event, option); }, children: t(`photo.${option}`) }, option))) }), _jsxs("button", { type: "button", className: css.upload, disabled: uploading, onClick: () => {
                                    /* v8 ignore next -- React assigns the rendered input before user click handlers can run. */
                                    inputRef.current?.click();
                                }, children: [_jsx(IconPlusOutline16, { size: 15 }), uploading ? t('photo.uploading') : t('photo.upload')] }), _jsx("input", { ref: inputRef, className: css.fileInput, type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", multiple: true, onChange: (event) => { void chooseFiles(event); } })] })] }), _jsx("p", { className: css.uploadHint, children: t('photo.uploadHint') }), uploadNoticeKey !== null && _jsx("p", { className: css.uploadNotice, role: "status", children: t(uploadNoticeKey) }), errorKey !== null && _jsxs("div", { className: css.error, role: "alert", children: [_jsx("span", { children: t(errorKey) }), errorKey === 'photo.error.load' && _jsx("button", { type: "button", onClick: retryPhotoStories, children: t('photo.retry') })] }), loading ? (_jsx("div", { className: css.empty, role: "status", children: t('photo.loading') })) : stories.length === 0 ? (_jsx("div", { className: css.empty, children: _jsxs("div", { className: css.emptyCopy, children: [_jsx("h2", { children: t('photo.empty.title') }), _jsx("p", { children: t('photo.empty.body') }), _jsx("button", { type: "button", disabled: uploading, onClick: () => {
                                /* v8 ignore next -- React assigns the rendered input before user click handlers can run. */
                                inputRef.current?.click();
                            }, children: t('photo.empty.action') })] }) })) : view === 'classic' ? (_jsxs("div", { id: "mind-garden-photo-classic-panel", role: "tabpanel", "aria-labelledby": "mind-garden-photo-classic-tab", children: [_jsx("section", { className: css.grid, "aria-label": t('photo.albumView'), children: pageStories.map((story, index) => (_jsx(PhotoCard, { story: story, index: (page - 1) * PAGE_SIZE + index + 1, src: images.get(storyKey(story)), t: t, onOpen: openStory }, storyKey(story)))) }), _jsxs("nav", { className: css.pagination, "aria-label": t('photo.albumView'), children: [_jsx("button", { type: "button", disabled: page <= 1, onClick: () => { setPage(current => current - 1); }, children: t('photo.pagePrevious') }), _jsx("span", { children: t('photo.page').replace('{current}', String(page)).replace('{total}', String(pageCount)) }), _jsx("button", { type: "button", disabled: page >= pageCount, onClick: () => { setPage(current => current + 1); }, children: t('photo.pageNext') })] })] })) : (_jsxs("section", { id: "mind-garden-photo-dynamic-panel", role: "tabpanel", "aria-labelledby": "mind-garden-photo-dynamic-tab", className: css.dynamic, "aria-label": t('photo.albumView'), onPointerEnter: () => { setDynamicPointerActive(true); }, onPointerLeave: () => { setDynamicPointerActive(false); }, onPointerDown: startDynamicGesture, onPointerMove: moveDynamicGesture, onPointerUp: finishDynamicGesture, onPointerCancel: (event) => { finishDynamicGesture(event, true); }, onFocusCapture: () => { setDynamicFocusWithin(true); }, onBlurCapture: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                        setDynamicFocusWithin(false);
                }, children: [_jsxs("div", { className: css.carouselControls, "aria-label": t('photo.carouselControls'), children: [_jsx("button", { type: "button", "aria-label": t('photo.carouselPrevious'), disabled: dynamicStories.length < 2, onClick: () => { moveDynamicFrame(-1); }, children: _jsx(IconChevronLeftOutline14, { size: 14 }) }), _jsx("span", { "aria-live": dynamicAutoPlay ? 'off' : 'polite', children: t('photo.carouselPosition')
                                    .replace('{current}', String(dynamicIndex + 1))
                                    .replace('{total}', String(dynamicStories.length))
                                    .replace('{title}', dynamicStories[dynamicIndex]?.title ?? '') }), _jsx("button", { type: "button", "aria-label": dynamicAutoPlay ? t('photo.carouselPause') : t('photo.carouselPlay'), "aria-pressed": !dynamicAutoPlay, disabled: dynamicStories.length < 2 || reducedMotion, onClick: () => { setDynamicAutoPlay(current => !current); }, children: dynamicAutoPlay ? _jsx(IconPauseOutline16, { size: 14 }) : _jsx(IconPlayOutline16, { size: 14 }) }), _jsx("button", { type: "button", "aria-label": t('photo.carouselNext'), disabled: dynamicStories.length < 2, onClick: () => { moveDynamicFrame(1); }, children: _jsx(IconChevronRightOutline14, { size: 14 }) })] }), _jsx("div", { className: css.ring, "data-dragging": dynamicDragging, style: {
                            '--photo-count': dynamicStories.length,
                            '--photo-active': dynamicIndex,
                            '--photo-drag': `${dynamicDrag}deg`,
                        }, children: dynamicStories.map((story, index) => (_jsxs("button", { type: "button", className: css.dynamicCard, ref: (node) => { dynamicCardRefs.current[index] = node; }, style: { '--photo-index': index }, "data-active": index === dynamicIndex, "aria-current": index === dynamicIndex ? 'true' : undefined, "aria-hidden": index !== dynamicIndex, "aria-label": `${t('photo.open')} · ${story.title}`, tabIndex: index === dynamicIndex ? 0 : -1, onClick: (event) => {
                                if (dynamicWasDraggedRef.current) {
                                    event.preventDefault();
                                    dynamicWasDraggedRef.current = false;
                                    return;
                                }
                                openStory(story);
                            }, onKeyDown: (event) => {
                                if (event.key === 'ArrowLeft') {
                                    event.preventDefault();
                                    moveDynamicFrame(-1, true);
                                }
                                else if (event.key === 'ArrowRight') {
                                    event.preventDefault();
                                    moveDynamicFrame(1, true);
                                }
                            }, children: [images.get(storyKey(story)) === undefined ? _jsx("span", { className: css.shimmer }) : _jsx("img", { src: images.get(storyKey(story)), alt: "" }), _jsx("span", { children: story.title })] }, storyKey(story)))) }), _jsx("p", { children: t('photo.dynamicHint') })] }))] }));
}
function PhotoCard({ story, index, src, t, onOpen }) {
    return (_jsx("article", { className: css.card, children: _jsxs("button", { type: "button", "aria-label": `${t('photo.open')} · ${story.title}`, onClick: () => { onOpen(story); }, children: [_jsx("span", { className: css.index, children: String(index).padStart(2, '0') }), src === undefined ? _jsx("span", { className: css.shimmer }) : _jsx("img", { src: src, alt: "" }), _jsx("span", { className: css.cardShade, "aria-hidden": "true" }), _jsxs("span", { className: css.cardCopy, children: [_jsx("strong", { children: story.title }), _jsx("small", { children: t('photo.date').replace('{date}', story.stamp.localDate) })] })] }) }));
}
function RangeField({ label, value, min, max, step, onChange }) {
    return (_jsxs("label", { className: css.range, children: [_jsxs("span", { children: [label, _jsx("output", { children: step < 1 ? value.toFixed(2) : value.toFixed(0) })] }), _jsx("input", { "aria-label": label, type: "range", value: value, min: min, max: max, step: step, onChange: (event) => { onChange(Number(event.target.value)); } })] }));
}
//# sourceMappingURL=PhotoStorySpace.js.map