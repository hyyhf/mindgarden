/** Pure deterministic input classifier and follow-up state transition. */
import type { MindGardenSafetyAssessment, MindGardenSafetyLocale } from './types.ts';
/** Infer the deterministic safety-copy locale from the entered text. */
export declare function detectMindGardenSafetyLocale(text: string): MindGardenSafetyLocale;
/**
 * Normalize common spacing, traditional characters, and obfuscations.
 * @param text - entered user text.
 * @returns normalized text used only for deterministic matching.
 */
export declare function normalizeMindGardenSafetyText(text: string): string;
/**
 * Classify one user text without a model or network call.
 * @param text - complete entered human text.
 * @returns a detached deterministic assessment.
 */
export declare function assessMindGardenInput(text: string, locale?: MindGardenSafetyLocale): MindGardenSafetyAssessment;
/**
 * Carry a previous intervention forward until concrete safety information or
 * two ordinary level-one turns allow a step down.
 * @param current - classification of the latest text alone.
 * @param previous - previous entered-human assessment in this session.
 * @param text - latest complete human text.
 * @returns effective assessment for this response.
 */
export declare function recoverMindGardenSafetyState(current: MindGardenSafetyAssessment, previous: MindGardenSafetyAssessment | undefined, text: string): MindGardenSafetyAssessment;
//# sourceMappingURL=classifier.d.ts.map