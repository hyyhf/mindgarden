import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Recoverable card-owned conversation and explicit revision acceptance surface. */
import { useEffect, useRef, useState } from 'react';
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './StarObserver.module.css';
/** Render bounded encrypted turns without owning session or Remote context. */
export function StarObserverDialogue({ card, t, onContinue, onApplyRevision }) {
    const [input, setInput] = useState('');
    const [pendingMessage, setPendingMessage] = useState('');
    const [pending, setPending] = useState(null);
    const [error, setError] = useState(false);
    const transcriptRef = useRef(null);
    useEffect(() => {
        setInput('');
        setPendingMessage('');
        setPending(null);
        setError(false);
    }, [card.id]);
    useEffect(() => {
        const transcript = transcriptRef.current;
        if (transcript !== null)
            transcript.scrollTop = transcript.scrollHeight;
    }, [card.turns.length, pendingMessage, pending]);
    const send = async (content, quickReplyKind = '') => {
        const message = content.trim();
        if (message.length === 0 || pending !== null)
            return;
        setInput('');
        setPendingMessage(message);
        setPending('continue');
        setError(false);
        const result = await onContinue({
            id: card.id,
            ifVersion: card.version,
            content: message,
            quickReplyKind,
        });
        setPending(null);
        setPendingMessage('');
        if (!result.ok)
            setError(true);
    };
    const applyRevision = async () => {
        if (card.pendingRevision === null || pending !== null)
            return;
        setPending('revision');
        setError(false);
        const result = await onApplyRevision({
            id: card.id,
            ifVersion: card.version,
            revisionId: card.pendingRevision.id,
        });
        setPending(null);
        if (!result.ok)
            setError(true);
    };
    return (_jsxs("section", { className: css.dialogue, "aria-label": t('star.observer.dialogue.title'), children: [_jsxs("header", { className: css.dialogueHeader, children: [_jsxs("div", { children: [_jsx("span", { "aria-hidden": "true", children: "\u2727" }), _jsx("strong", { children: t('star.observer.dialogue.title') })] }), _jsx("small", { role: "status", "aria-live": "polite", children: pending === 'continue' ? t('star.observer.dialogue.thinking') : t('star.observer.dialogue.ready') })] }), _jsxs("div", { className: css.transcript, ref: transcriptRef, "aria-live": "polite", "aria-busy": pending === 'continue', children: [card.turns.length === 0 && pendingMessage.length === 0 ? (_jsxs("div", { className: css.dialogueWelcome, children: [_jsx("strong", { children: t('star.observer.dialogue.welcome') }), _jsx("span", { children: t('star.observer.dialogue.welcome.body') })] })) : null, card.turns.map(turn => (_jsxs("article", { "data-role": turn.role, children: [_jsx("small", { children: turn.role === 'user' ? t('star.observer.dialogue.me') : t('star.observer.dialogue.observer') }), turn.role === 'assistant'
                                ? _jsx("div", { className: css.assistantMarkdown, children: _jsx(MarkdownText, { text: turn.content }) })
                                : _jsx("p", { children: turn.content })] }, turn.id))), pendingMessage.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("article", { "data-role": "user", "data-pending": "true", children: [_jsx("small", { children: t('star.observer.dialogue.me') }), _jsx("p", { children: pendingMessage })] }), _jsxs("p", { className: css.thinking, children: [_jsx("i", { "aria-hidden": "true" }), _jsx("i", { "aria-hidden": "true" }), _jsx("i", { "aria-hidden": "true" }), t('star.observer.dialogue.thinking.detail')] })] }))] }), card.pendingRevision !== null && (_jsxs("aside", { className: css.revision, children: [_jsx("span", { children: t('star.observer.revision.eyebrow') }), _jsx("strong", { children: card.pendingRevision.title }), _jsx("p", { children: card.pendingRevision.frontText }), _jsx("small", { children: t('star.observer.revision.disclosure') }), _jsx("button", { type: "button", disabled: pending !== null, onClick: () => { void applyRevision(); }, children: pending === 'revision' ? t('star.observer.revision.applying') : t('star.observer.revision.apply') })] })), card.quickReplies.length > 0 && (_jsx("div", { className: css.quickReplies, "aria-label": t('star.observer.dialogue.suggestions'), children: card.quickReplies.map(reply => (_jsx("button", { type: "button", disabled: pending !== null, onClick: () => { void send(reply.label, reply.kind); }, children: reply.label }, reply.kind))) })), _jsxs("form", { className: css.composer, onSubmit: (event) => { event.preventDefault(); void send(input); }, children: [_jsxs("label", { children: [_jsx("span", { children: t('star.observer.dialogue.input') }), _jsx("textarea", { value: input, maxLength: 1200, rows: 2, disabled: pending !== null, placeholder: t('star.observer.dialogue.placeholder'), onChange: (event) => { setInput(event.target.value); } })] }), _jsx("button", { type: "submit", disabled: pending !== null || input.trim().length === 0, "aria-label": t('star.observer.dialogue.send'), children: "\u2191" })] }), error && _jsx("p", { className: css.error, role: "alert", children: t('star.observer.dialogue.error') })] }));
}
//# sourceMappingURL=StarObserverDialogue.js.map