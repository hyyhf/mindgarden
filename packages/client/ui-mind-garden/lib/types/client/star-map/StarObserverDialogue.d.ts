/** Recoverable card-owned conversation and explicit revision acceptance surface. */
import type { MindGardenApplyStarCardRevisionRequest, MindGardenContinueStarCardRequest, MindGardenStarCard } from '@deepseek-ai/dsh-mind-garden/star-map/types';
import type { MindGardenDataResult } from '../slots.ts';
import type { MindGardenKey } from '../locales.ts';
interface StarObserverDialogueProps {
    readonly card: MindGardenStarCard;
    readonly t: (key: MindGardenKey) => string;
    readonly onContinue: (request: MindGardenContinueStarCardRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
    readonly onApplyRevision: (request: MindGardenApplyStarCardRevisionRequest) => Promise<MindGardenDataResult<MindGardenStarCard>>;
}
/** Render bounded encrypted turns without owning session or Remote context. */
export declare function StarObserverDialogue({ card, t, onContinue, onApplyRevision }: StarObserverDialogueProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StarObserverDialogue.d.ts.map