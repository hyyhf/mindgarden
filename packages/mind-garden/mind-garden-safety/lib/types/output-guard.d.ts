/** Pure local response rendering and assistant-output policy checks. */
import type { MindGardenOutputGuardReason, MindGardenOutputViolation, MindGardenSafetyAssessment, MindGardenSafetyLocale } from './types.ts';
/**
 * Return every deterministic output rule matched by complete assistant text.
 * @param text - complete buffered text and reasoning output.
 * @param assessment - effective input assessment for this step.
 * @returns unique stable violations in policy order.
 */
export declare function assessMindGardenOutput(text: string, assessment: MindGardenSafetyAssessment | undefined): MindGardenOutputViolation[];
/**
 * Render the deterministic local response for an elevated input assessment.
 * @param assessment - effective level-one through level-three assessment.
 * @returns a calm mainland-China support response containing verified contacts.
 */
export declare function renderMindGardenSupportResponse(assessment: MindGardenSafetyAssessment): string;
/**
 * Render a safe replacement for blocked or unbounded assistant output.
 * @param reason - whether content policy or configured buffering caused replacement.
 * @param violations - matched rules when content policy caused replacement.
 * @returns user-visible replacement text with no unsafe output quotation.
 */
export declare function renderMindGardenGuardReplacement(reason: MindGardenOutputGuardReason, violations: readonly MindGardenOutputViolation[], locale?: MindGardenSafetyLocale): string;
//# sourceMappingURL=output-guard.d.ts.map