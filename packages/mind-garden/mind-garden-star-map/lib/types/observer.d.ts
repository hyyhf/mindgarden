/** Pure evidence bounding, prompting, and model-output decoding for Star Observer draws. */
import type { MindGardenStarCardAnalysis, MindGardenStarCard, MindGardenStarDeck, MindGardenStarEvidenceType, MindGardenStarObserverTone, MindGardenStarProfile, MindGardenStarTrait, MindGardenStarTraitKind } from './types.ts';
/** Authenticated private material eligible for one auxiliary request. */
export interface StarObserverSource {
    readonly key: string;
    readonly sourceType: MindGardenStarEvidenceType;
    readonly sourceId: string;
    readonly summary: string;
}
/** Exact bounded prompt envelope persisted before provider I/O starts. */
export interface StarObserverEnvelope {
    readonly system: string;
    readonly prompt: string;
    readonly evidence: readonly StarObserverSource[];
}
/** Strictly decoded but still non-authoritative model card proposal. */
export interface StarObserverProposal {
    readonly title: string;
    readonly frontText: string;
    readonly analysis: MindGardenStarCardAnalysis;
    readonly openQuestion: string;
    readonly symbolicBasis: readonly string[];
    readonly evidenceKeys: readonly string[];
    readonly confidence: number;
    readonly traitKind: MindGardenStarTraitKind;
}
/** Strictly decoded reply and inert revision from one card-owned dialogue exchange. */
export interface StarObserverDialogueProposal {
    readonly reply: string;
    readonly quickReplies: readonly {
        readonly kind: 'deepen' | 'shift' | 'correct';
        readonly label: string;
    }[];
    readonly revision: Omit<StarObserverProposal, 'evidenceKeys'> | null;
}
/** Stable policy separating quoted personal material from observation instructions. */
export declare const STAR_OBSERVER_SYSTEM_PROMPT: string;
/** Stable policy for bounded follow-up dialogue attached to one encrypted card. */
export declare const STAR_OBSERVER_DIALOGUE_SYSTEM_PROMPT: string;
/**
 * Build one complete card-owned dialogue request without silently truncating it.
 * @param card - current encrypted card projection, including bounded prior turns.
 * @param content - newest user-authored message.
 * @param quickReplyKind - optional semantic kind of the selected continuation.
 * @param maxBytes - maximum UTF-8 byte length of the complete data payload.
 * @returns the exact provider envelope, or null when the request is too large.
 */
export declare function buildStarObserverDialogueEnvelope(card: MindGardenStarCard, content: string, quickReplyKind: '' | 'deepen' | 'shift' | 'correct', maxBytes: number): StarObserverEnvelope | null;
/**
 * Decode one complete dialogue response and reject leaked identifiers or malformed revisions.
 * @param raw - complete terminal text returned by the provider.
 * @param evidence - frozen card evidence used only for leak detection.
 * @param cardKind - immutable evidence class used to cap revised confidence.
 * @returns the validated reply and inert revision, or null on any contract failure.
 */
export declare function decodeStarObserverDialogueOutput(raw: string, evidence: readonly StarObserverSource[], cardKind: MindGardenStarCard['cardKind']): StarObserverDialogueProposal | null;
/**
 * Build the exact JSON data payload and reject the complete request rather than truncating it.
 * @param profile - user-authored profile fields visible to this draw.
 * @param traits - governed traits eligible for prompt projection.
 * @param deck - observation lens selected by the user.
 * @param question - optional question supplied for this draw.
 * @param tone - user-selected Observer tone.
 * @param evidence - authorized, bounded source excerpts with request-local keys.
 * @param maxBytes - maximum UTF-8 byte length of the complete data payload.
 * @returns the immutable provider envelope, or null when the payload exceeds the byte limit.
 */
export declare function buildStarObserverEnvelope(profile: MindGardenStarProfile, traits: readonly MindGardenStarTrait[], deck: MindGardenStarDeck, question: string, tone: MindGardenStarObserverTone, evidence: readonly StarObserverSource[], maxBytes: number): StarObserverEnvelope | null;
/**
 * Decode one complete model response and reject unknown evidence or leaked internal references.
 * @param raw - complete terminal text returned by the provider.
 * @param evidence - authorized sources whose request-local keys may be cited.
 * @returns a validated proposal, or null when any output contract fails.
 */
export declare function decodeStarObserverOutput(raw: string, evidence: readonly StarObserverSource[]): StarObserverProposal | null;
//# sourceMappingURL=observer.d.ts.map