/** User-controlled Star Map authorizations and observation preferences. */
import type { MindGardenStarDataPermissions, MindGardenStarMapOverview, MindGardenStarObserverTone, MindGardenStarProfile } from '@deepseek-ai/dsh-mind-garden/star-map/types';
import type { MindGardenDataResult } from '../slots.ts';
import type { MindGardenKey } from '../locales.ts';
interface StarProfilePanelProps {
    readonly profile: MindGardenStarProfile;
    readonly t: (key: MindGardenKey) => string;
    readonly onSave: (profile: MindGardenStarProfile, permissions: MindGardenStarDataPermissions, observerTone: MindGardenStarObserverTone, observationIntent: string, reducedMotion: boolean) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    readonly onCommit: (overview: MindGardenStarMapOverview) => void;
    readonly onClose: () => void;
}
/** Edit the privacy-sensitive subset that governs future Star Observer work. */
export declare function StarProfilePanel({ profile, t, onSave, onCommit, onClose }: StarProfilePanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StarProfilePanel.d.ts.map