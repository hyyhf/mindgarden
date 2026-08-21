/** Harness-native constellation space backed by an encrypted Star Map profile. */
import type { MindGardenMode } from '@deepseek-ai/dsh-mind-garden/core/client';
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden/reflection/types';
import type { MindGardenCompleteStarRitualRequest, MindGardenSaveStarRitualRequest, MindGardenStarMapOverview, MindGardenStarTrait, MindGardenUpdateStarProfileRequest, MindGardenUpdateStarTraitRequest } from '@deepseek-ai/dsh-mind-garden/star-map/types';
import type { MindGardenDataResult } from '../slots.ts';
import type { MindGardenKey } from '../locales.ts';
import { StarObserver } from './StarObserver.tsx';
/** Plain data, Remote actions, and locale props for the constellation space. */
export interface StarMapSpaceProps {
    readonly questions: readonly MindGardenOpenQuestion[];
    readonly reviews: readonly MindGardenPeriodReview[];
    readonly mode: MindGardenMode;
    readonly t: (key: MindGardenKey) => string;
    readonly onBack: () => void;
    readonly onOverview: () => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    readonly onSaveRitual: (request: MindGardenSaveStarRitualRequest) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    readonly onCompleteRitual: (request: MindGardenCompleteStarRitualRequest) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    readonly onUpdateProfile: (request: MindGardenUpdateStarProfileRequest) => Promise<MindGardenDataResult<MindGardenStarMapOverview>>;
    readonly onUpdateTrait: (request: MindGardenUpdateStarTraitRequest) => Promise<MindGardenDataResult<MindGardenStarTrait>>;
    readonly onDrawCard: Parameters<typeof StarObserver>[0]['onDraw'];
    readonly onCalibrateCard: Parameters<typeof StarObserver>[0]['onCalibrate'];
    readonly onFinalizeCard: Parameters<typeof StarObserver>[0]['onFinalize'];
    readonly onContinueCard: Parameters<typeof StarObserver>[0]['onContinue'];
    readonly onApplyCardRevision: Parameters<typeof StarObserver>[0]['onApplyRevision'];
}
/** Render the resumable ritual or the durable interactive 3D constellation and codex. */
export declare function StarMapSpace({ questions, reviews, mode, t, onBack, onOverview, onSaveRitual, onCompleteRitual, onUpdateProfile, onUpdateTrait, onDrawCard, onCalibrateCard, onFinalizeCard, onContinueCard, onApplyCardRevision, }: StarMapSpaceProps): import("react").JSX.Element;
//# sourceMappingURL=StarMapSpace.d.ts.map