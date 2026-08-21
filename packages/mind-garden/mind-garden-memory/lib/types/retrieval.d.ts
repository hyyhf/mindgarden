/** Deterministic bounded retrieval for confirmed Mind Garden memories. */
import type { UserMessage } from '@deepseek-ai/dsh-llm';
import type { StoredMemory } from './records.ts';
/** One selected record and the explanation persisted in its audit. */
export interface RetrievedMemory {
    readonly memory: StoredMemory;
    readonly reason: 'always' | 'relevant';
    readonly score: number;
}
/** Complete model-facing recall result. */
export interface MemoryRecall {
    readonly text: string;
    readonly matches: readonly RetrievedMemory[];
}
/**
 * Extract only human-authored text from the entering batch.
 * @param messages - Proposed user-role messages entering the Agent step.
 * @returns Human-source text joined in message and block order.
 */
export declare function userQuery(messages: readonly UserMessage[]): string;
/**
 * Build normalized words and Unicode grapheme bigrams for multilingual matching.
 * @param value - Free text to normalize and segment.
 * @returns Unique normalized tokens and adjacent-grapheme terms.
 */
export declare function retrievalTerms(value: string): ReadonlySet<string>;
/**
 * Count unique query terms present in the memory's model-relevant fields.
 * @param queryTerms - Normalized terms extracted from human input.
 * @param memory - Confirmed plaintext memory considered for recall.
 * @returns The number of distinct query terms shared by the memory.
 */
export declare function relevanceScore(queryTerms: ReadonlySet<string>, memory: StoredMemory): number;
/**
 * Select eligible records in stable relevance order and fit complete entries
 * within both configured count and UTF-8 bounds.
 * @param options - Validated memories, query, clock, and complete-output bounds.
 * @returns A complete bounded recall, or null when no eligible entry fits.
 */
export declare function retrieveMemories(options: {
    readonly memories: readonly StoredMemory[];
    readonly query: string;
    readonly now: number;
    readonly maxMemories: number;
    readonly maxBytes: number;
}): MemoryRecall | null;
//# sourceMappingURL=retrieval.d.ts.map