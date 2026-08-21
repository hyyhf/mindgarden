/** User-authoritative review and lifecycle controls for governed memory. */
import type { MindGardenKey } from '../locales.ts';
import type { MindGardenViewActions } from '../slots.ts';
type MemoryActions = Pick<MindGardenViewActions, 'onListMemories' | 'onProposeMemory' | 'onConfirmMemory' | 'onUpdateMemory' | 'onRejectMemory' | 'onResolveMemoryRelationship' | 'onListMemoryRevisions' | 'onExtractMemories' | 'onLatestMemoryExtraction' | 'onMemoryAutomationPolicy' | 'onSetMemoryAutomationPolicy' | 'onDeleteMemory' | 'onLatestMemoryAudit'>;
/** Plain props for the profile-memory governance center. */
export interface MemoryGovernanceProps extends MemoryActions {
    readonly onDraftConversation?: (draft: string) => void;
    readonly t: (key: MindGardenKey) => string;
}
/** Render candidate review, conflict decisions, active memory, provenance, and audit. */
export declare function MemoryGovernance({ onListMemories, onProposeMemory, onConfirmMemory, onUpdateMemory, onRejectMemory, onResolveMemoryRelationship, onListMemoryRevisions, onExtractMemories, onLatestMemoryExtraction, onMemoryAutomationPolicy, onSetMemoryAutomationPolicy, onDeleteMemory, onLatestMemoryAudit, onDraftConversation, t, }: MemoryGovernanceProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MemoryGovernance.d.ts.map