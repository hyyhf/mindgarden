/** Strict model envelopes and output decoders for private photo stories. */
import type { MindGardenPhotoStory } from './types.ts';
/** Prompt contract version stored beside every accepted visual observation. */
export declare const PHOTO_OBSERVATION_PROMPT_VERSION: "mind-garden-photo-observe-v1";
/** Stable policy for one explicitly authorized image observation. */
export declare const PHOTO_OBSERVATION_SYSTEM_PROMPT: string;
/** Stable policy for follow-up dialogue that does not resend the image. */
export declare const PHOTO_DIALOGUE_SYSTEM_PROMPT: string;
/** Complete validated first observation before durable identities are assigned. */
export interface PhotoObservationProposal {
    readonly grounding: {
        readonly visualSummary: string;
        readonly visibleElements: readonly string[];
        readonly textInImage: readonly string[];
        readonly uncertainDetails: readonly string[];
    };
    readonly opening: string;
    readonly quickReplies: readonly {
        readonly kind: 'remember' | 'detail' | 'correct';
        readonly label: string;
    }[];
}
/** Complete validated dialogue reply before durable turn identities are assigned. */
export interface PhotoDialogueProposal {
    readonly reply: string;
    readonly quickReplies: readonly {
        readonly kind: 'remember' | 'detail' | 'correct';
        readonly label: string;
    }[];
}
/** Exact text envelope stored in an encrypted audit and sent beside the image. */
export interface PhotoModelEnvelope {
    readonly system: string;
    readonly prompt: string;
}
/**
 * Build the complete observation request without embedding user copy or attachment identifiers.
 * @param maxBytes - maximum UTF-8 bytes admitted for the complete text payload.
 * @returns exact provider text, or null instead of silently truncating.
 */
export declare function buildPhotoObservationEnvelope(maxBytes: number): PhotoModelEnvelope | null;
/**
 * Decode one complete visual response with strict grounding and first-person continuations.
 * @param raw - complete terminal provider text.
 * @returns validated proposal, or null on any contract failure.
 */
export declare function decodePhotoObservationOutput(raw: string): PhotoObservationProposal | null;
/**
 * Build one bounded follow-up from frozen grounding and recent story-owned turns.
 * @param story - current encrypted story projection.
 * @param content - newest user-authored message.
 * @param quickReplyKind - optional semantic kind of the selected continuation.
 * @param maxBytes - maximum UTF-8 bytes for the complete text payload.
 * @returns exact provider envelope, or null instead of truncation.
 */
export declare function buildPhotoDialogueEnvelope(story: MindGardenPhotoStory, content: string, quickReplyKind: '' | 'remember' | 'detail' | 'correct', maxBytes: number): PhotoModelEnvelope | null;
/**
 * Decode one complete photo-story dialogue response.
 * @param raw - complete terminal provider text.
 * @returns validated reply and continuations, or null on contract failure.
 */
export declare function decodePhotoDialogueOutput(raw: string): PhotoDialogueProposal | null;
//# sourceMappingURL=observer.d.ts.map