/** Deterministic constellation model derived from encrypted reflection records. */
import type { MindGardenMode } from '@deepseek-ai/dsh-mind-garden/core/client';
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden/reflection/types';
import type { MindGardenStarProfile, MindGardenStarTrait } from '@deepseek-ai/dsh-mind-garden/star-map/types';
/** Visual meaning of one constellation node. */
export type GardenStarKind = 'center' | 'trait' | 'question' | 'review';
/** One accessible object and its fixed three-dimensional position. */
export interface GardenStarNode {
    readonly id: string;
    readonly kind: GardenStarKind;
    readonly title: string;
    readonly detail: string;
    readonly status: string;
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly radius: number;
}
/** One visible relation between two constellation nodes. */
export interface GardenStarLink {
    readonly id: string;
    readonly source: string;
    readonly target: string;
    readonly kind: 'orbit' | 'continuity';
}
/** Stable data passed to both WebGL and accessible HTML renderers. */
export interface GardenStarMapModel {
    readonly nodes: readonly [GardenStarNode, ...GardenStarNode[]];
    readonly links: readonly GardenStarLink[];
}
/** Localized copy needed while deriving node labels. */
export interface GardenStarMapLabels {
    readonly center: string;
    readonly serenity: string;
    readonly clarity: string;
    readonly since: string;
    readonly unnamedReview: string;
    readonly reviewDetail: string;
    readonly traitDetail: string;
}
/**
 * Build a bounded, repeatable 3D constellation from records already available to the view.
 * @param questions - open and closed questions in service display order.
 * @param reviews - proposed, saved, and archived reviews in service display order.
 * @param mode - current dialogue posture represented by the center star.
 * @param labels - localized labels and interpolation templates.
 * @param profile - optional completed private profile represented by the center star.
 * @param traits - governed private traits represented as first-ring stars.
 * @returns the constellation nodes and links.
 */
export declare function createGardenStarMap(questions: readonly MindGardenOpenQuestion[], reviews: readonly MindGardenPeriodReview[], mode: MindGardenMode, labels: GardenStarMapLabels, profile?: MindGardenStarProfile, traits?: readonly MindGardenStarTrait[]): GardenStarMapModel;
//# sourceMappingURL=model.d.ts.map