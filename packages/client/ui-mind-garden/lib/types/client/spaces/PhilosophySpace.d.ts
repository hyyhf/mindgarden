/** Confirmation-gated contemplations and life principles. */
import type { MindGardenKey } from '../locales.ts';
import type { MindGardenViewActions } from '../slots.ts';
type PhilosophyActions = Pick<MindGardenViewActions, 'onListContemplations' | 'onListPrincipleProposals' | 'onListPrinciples' | 'onAcceptPrincipleProposal' | 'onRejectPrincipleProposal' | 'onRevisePrincipleStatus'>;
/** Plain props for the philosophy space. */
export interface PhilosophySpaceProps extends PhilosophyActions {
    readonly today: string;
    readonly onDraftConversation?: (draft: string) => void;
    readonly t: (key: MindGardenKey) => string;
}
/** Render contemplation evidence, inert proposals, and user-governed principle histories. */
export declare function PhilosophySpace({ today, onListContemplations, onListPrincipleProposals, onListPrinciples, onAcceptPrincipleProposal, onRejectPrincipleProposal, onRevisePrincipleStatus, onDraftConversation, t, }: PhilosophySpaceProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PhilosophySpace.d.ts.map