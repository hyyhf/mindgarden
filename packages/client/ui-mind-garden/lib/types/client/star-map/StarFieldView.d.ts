/** Lightweight React adapter for the lazily loaded constellation renderer. */
import type { GardenStarMapModel } from './model.ts';
/** Display the live WebGL constellation, with the surrounding space owning accessible nodes. */
export declare function StarField({ model, fallback, reducedMotion, selectedId, onSelect, }: {
    readonly model: GardenStarMapModel;
    readonly fallback: string;
    readonly reducedMotion?: boolean;
    readonly selectedId?: string;
    readonly onSelect?: (id: string) => void;
}): import("react").JSX.Element;
//# sourceMappingURL=StarFieldView.d.ts.map