/** Reality-experiment workspace for life themes that need observation. */
import type { MindGardenKey } from '../locales.ts';
import type { MindGardenViewActions } from '../slots.ts';
type GrowthActions = Pick<MindGardenViewActions, 'onListExperiments' | 'onCreateExperiment' | 'onStartExperiment' | 'onObserveExperiment' | 'onStopExperiment'>;
/** Plain props for the life-theme experiment space. */
export interface GrowthSpaceProps extends GrowthActions {
    readonly today: string;
    readonly onDraftConversation?: (draft: string) => void;
    readonly t: (key: MindGardenKey) => string;
}
/** Render user-governed, unscored reality experiments and their observations. */
export declare function GrowthSpace({ today, onListExperiments, onCreateExperiment, onStartExperiment, onObserveExperiment, onStopExperiment, onDraftConversation, t, }: GrowthSpaceProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GrowthSpace.d.ts.map