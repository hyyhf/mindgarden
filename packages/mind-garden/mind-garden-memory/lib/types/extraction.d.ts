/** Pure transcript bounding and model-output decoding for governed extraction. */
import type { Message, MessageId } from '@deepseek-ai/dsh-llm';
import type { MindGardenMemoryId, MindGardenMemoryKind, MindGardenMemoryRelationshipType, MindGardenMemorySensitivity, MindGardenMemoryVersion } from './types.ts';
/** Model-safe active-memory view; retention reasons and evidence remain private. */
export interface ExtractionComparableMemory {
    readonly id: MindGardenMemoryId;
    readonly version: MindGardenMemoryVersion;
    readonly kind: MindGardenMemoryKind;
    readonly content: string;
    readonly scope?: string;
}
/** Complete human or model message selected for an extraction request. */
export interface ExtractionTranscriptRow {
    readonly id: MessageId;
    readonly role: 'user' | 'assistant';
    readonly text: string;
}
/** Bounded request material and the exact prompt sent to the auxiliary model. */
export interface ExtractionEnvelope {
    readonly system: string;
    readonly prompt: string;
    readonly transcript: readonly ExtractionTranscriptRow[];
    readonly memories: readonly ExtractionComparableMemory[];
    readonly hadHumanText: boolean;
}
/** Strictly shaped but still non-authoritative model proposal. */
export interface ExtractionProposal {
    readonly kind: MindGardenMemoryKind;
    readonly sensitivity?: MindGardenMemorySensitivity;
    readonly content: string;
    readonly reason: string;
    readonly scope?: string;
    readonly sourceMessageId: MessageId;
    readonly evidenceQuote: string;
    readonly confidence: number;
    readonly importance: number;
    readonly relationship?: {
        readonly type: MindGardenMemoryRelationshipType;
        readonly targetMemoryId: MindGardenMemoryId;
        readonly rationale: string;
    };
}
/** Stable system instruction that separates quoted transcript data from extraction policy. */
export declare const EXTRACTION_SYSTEM_PROMPT: string;
/**
 * Select newest complete transcript and active-memory rows under independent UTF-8 bounds.
 * @param messages - Current derived Session surface.
 * @param memories - Active memories already allowed to enter model requests.
 * @param maxTranscriptBytes - Maximum serialized transcript bytes.
 * @param maxMemoryBytes - Maximum serialized comparison-memory bytes.
 * @returns Exact request envelope; `hadHumanText` distinguishes absence from a too-small bound.
 */
export declare function buildExtractionEnvelope(messages: readonly Message[], memories: readonly ExtractionComparableMemory[], maxTranscriptBytes: number, maxMemoryBytes: number): ExtractionEnvelope;
/**
 * Decode an exact JSON or single fenced-JSON response while dropping malformed individual proposals.
 * @param raw - Complete text assembled from the auxiliary model response.
 * @returns Valid proposal rows, or null when the envelope itself is invalid.
 */
export declare function decodeExtractionOutput(raw: string): ExtractionProposal[] | null;
//# sourceMappingURL=extraction.d.ts.map