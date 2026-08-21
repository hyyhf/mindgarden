/** Private concern basket backed by encrypted reflection records. */
import type { MindGardenKey } from '../locales.ts';
import type { MindGardenViewActions } from '../slots.ts';
type ConcernActions = Pick<MindGardenViewActions, 'onListConcerns' | 'onCreateConcern' | 'onUpdateConcern' | 'onCompleteConcern' | 'onConvertConcern'>;
/** Plain props for the concern space. */
export interface ConcernsSpaceProps extends ConcernActions {
    readonly today: string;
    readonly onDraftConversation?: (draft: string) => void;
    readonly t: (key: MindGardenKey) => string;
}
/** Render create, complete, and journal-conversion flows for private concerns. */
export declare function ConcernsSpace({ today, onListConcerns, onCreateConcern, onUpdateConcern, onCompleteConcern, onConvertConcern, onDraftConversation, t, }: ConcernsSpaceProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ConcernsSpace.d.ts.map