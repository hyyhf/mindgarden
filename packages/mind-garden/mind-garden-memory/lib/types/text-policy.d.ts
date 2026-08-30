/** Local natural-language decisions that never grant memory authority by themselves. */
type CorrectionDecisionIntent = 'confirm' | 'cancel' | 'unclear';
/** Evidence summary consumed by the correction state machine. */
interface CorrectionDecision {
    readonly intent: CorrectionDecisionIntent;
    readonly explicitApproval: boolean;
    readonly explicitCancellation: boolean;
    readonly ambiguous: boolean;
}
type ForbiddenInferenceKind = 'clinical-diagnosis' | 'personality-label' | 'hidden-cause';
/**
 * Interpret one complete human message without selecting or mutating a proposal.
 * @param value - Complete entered human text.
 * @returns Conservative decision evidence; ambiguous language remains unclear.
 */
export declare function interpretCorrectionDecision(value: string): CorrectionDecision;
/**
 * Classify non-user-authored claims that automatic extraction must not retain.
 * @param value - Proposed memory content.
 * @returns Rejected claim category, or null for no deterministic match.
 */
export declare function forbiddenInferenceKind(value: string): ForbiddenInferenceKind | null;
export {};
//# sourceMappingURL=text-policy.d.ts.map