/** Three.js constellation renderer with adaptive detail and deterministic teardown. */
import type { GardenStarMapModel } from './model.ts';
/**
 * Mount one interactive Three.js scene into a measured host.
 * @param host - Empty scene host owned by the React component.
 * @param model - Deterministic constellation data.
 * @param reducedMotion - Whether ambient animation should be disabled.
 * @param selectedId - Node emphasized by the semantic selector.
 * @param onSelect - Optional pointer selection handoff to the semantic owner.
 * @param onHover - Optional hover detail handoff for a DOM tooltip.
 * @returns Teardown that releases listeners, GPU resources, observers, and the canvas.
 */
export declare function mountGardenStarField(host: HTMLDivElement, model: GardenStarMapModel, reducedMotion: boolean, selectedId?: string, onSelect?: (id: string) => void, onHover?: (id: string, x: number, y: number) => void): () => void;
//# sourceMappingURL=StarField.d.ts.map