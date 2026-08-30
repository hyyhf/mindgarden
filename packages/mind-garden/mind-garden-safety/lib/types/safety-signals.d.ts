/** Structured local signals used by deterministic Mind Garden safety policy. */
/** Facts extracted from one punctuation-bounded human clause. */
interface MindGardenSafetySignals {
    readonly directSelf: boolean;
    readonly benignContext: boolean;
    readonly protectedContext: boolean;
    readonly negatedRisk: boolean;
    readonly activeSelfHarm: boolean;
    readonly activeOtherHarm: boolean;
    readonly passiveDeathWish: boolean;
    readonly immediateIntent: boolean;
    readonly actionTaken: boolean;
    readonly meansAccess: boolean;
    readonly dangerousLocation: boolean;
    readonly abuseDanger: boolean;
    readonly realityOrSleepDanger: boolean;
    readonly substanceDanger: boolean;
    readonly vulnerable: boolean;
}
/**
 * Normalize text for literal policy-phrase matching.
 * @param value - User or assistant text.
 * @returns NFKC, lowercase, punctuation-separated text.
 */
export declare function normalizePolicyText(value: string): string;
/**
 * Match one policy phrase with word boundaries for Latin text.
 * @param value - Normalized policy text.
 * @param phrase - Normalized literal phrase.
 * @returns Whether the phrase is present.
 */
export declare function hasPolicyPhrase(value: string, phrase: string): boolean;
/**
 * Match any phrase in one local policy lexicon.
 * @param value - Normalized policy text.
 * @param phrases - Literal policy phrases.
 * @returns Whether at least one phrase is present.
 */
export declare function hasAnyPolicyPhrase(value: string, phrases: readonly string[]): boolean;
/**
 * Extract local safety facts without selecting a response or risk level.
 * @param clause - One normalized punctuation-bounded clause.
 * @returns Structured facts for deterministic policy evaluation.
 */
export declare function extractMindGardenSafetySignals(clause: string): MindGardenSafetySignals;
export {};
//# sourceMappingURL=safety-signals.d.ts.map