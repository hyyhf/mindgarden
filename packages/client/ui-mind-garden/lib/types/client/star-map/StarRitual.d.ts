/** Resumable, encrypted first-observation ritual for the Star Map. */
import type { MindGardenStarMapOverview, MindGardenStarProfile, MindGardenStarProfileInput } from '@deepseek-ai/dsh-mind-garden/star-map/types';
import type { MindGardenDataResult } from '../slots.ts';
import type { MindGardenKey } from '../locales.ts';
/** Plain props supplied by the Harness slot action adapter. */
export interface StarRitualProps {
    readonly profile: MindGardenStarProfile;
    readonly t: (key: MindGardenKey) => string;
    readonly onSave: (input: MindGardenStarProfileInput, stage: 1 | 2, version: MindGardenStarProfile['version']) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    readonly onComplete: (input: MindGardenStarProfileInput, version: MindGardenStarProfile['version']) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    readonly onCommit: (overview: MindGardenStarMapOverview) => void;
    readonly onExit: () => void;
}
/** Render the three-stage ritual and persist each forward checkpoint. */
export declare function StarRitual({ profile, t, onSave, onComplete, onCommit, onExit }: StarRitualProps): import("react").JSX.Element;
//# sourceMappingURL=StarRitual.d.ts.map