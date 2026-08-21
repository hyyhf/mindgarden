/** Evidence-bound card draw and human calibration surface for the Star Observer. */
import type { MindGardenCalibrateStarCardRequest, MindGardenDrawStarCardRequest, MindGardenFinalizeStarCardRequest, MindGardenStarCard, MindGardenStarProfile } from '@deepseek-ai/dsh-mind-garden/star-map/types';
import type { MindGardenDataResult } from '../slots.ts';
import type { MindGardenKey } from '../locales.ts';
import { StarObserverDialogue } from './StarObserverDialogue.tsx';
interface StarObserverProps {
    readonly profile: MindGardenStarProfile;
    readonly cards: readonly MindGardenStarCard[];
    readonly activeCard: MindGardenStarCard | null;
    readonly t: (key: MindGardenKey) => string;
    readonly onDraw: (request: MindGardenDrawStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    readonly onCalibrate: (request: MindGardenCalibrateStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    readonly onFinalize: (request: MindGardenFinalizeStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    readonly onContinue: Parameters<typeof StarObserverDialogue>[0]['onContinue'];
    readonly onApplyRevision: Parameters<typeof StarObserverDialogue>[0]['onApplyRevision'];
}
/** Render one resumable observer desk without owning Remote or session context. */
export declare function StarObserver({ profile, cards, activeCard, t, onDraw, onCalibrate, onFinalize, onContinue, onApplyRevision, }: StarObserverProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StarObserver.d.ts.map