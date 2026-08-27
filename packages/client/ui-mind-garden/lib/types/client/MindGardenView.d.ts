/** Full-session Mind Garden review center. */
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { PropsLocale, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { MindGardenSessionProjection } from '@deepseek-ai/dsh-mind-garden/core/client';
import type { MindGardenViewActions } from './slots.ts';
import type { MindGardenSpace } from './garden-store.ts';
import type { createMindGardenViewStore } from './garden-store.ts';
import type { PhotoUploadLimits } from './photo-story/photo-upload.ts';
/** Pure view props used both by the slot adapter and component tests. */
export interface MindGardenReviewCenterProps extends MindGardenViewActions, PropsLocale<'mindGarden'> {
    /** Undefined means projection capability loading; null means inactive. */
    projection: MindGardenSessionProjection | null | undefined;
    /** Live Host limits used to prepare photo files before Remote transport. */
    imageLimits?: PhotoUploadLimits;
    /** Selected local garden space; defaults to the reflection overview in direct component tests. */
    activeSpace?: MindGardenSpace;
    /** Compact local rail preference. */
    sidebarCollapsed?: boolean;
    /** Persist the selected local space. */
    onSelectSpace?: (space: MindGardenSpace) => void;
    /** Persist the local rail width preference. */
    onToggleSidebar?: () => void;
    /** Place an explicitly selected garden record into Harness's resident composer. */
    onDraftConversation?: (draft: string) => void;
}
/** Render the inactive gateway or the active review center. */
export declare function MindGardenReviewCenter({ projection, imageLimits, onExportBackup, onInspectBackup, onRestoreBackup, onRotateVaultKey, onStarMapOverview, onSaveStarRitual, onCompleteStarRitual, onUpdateStarProfile, onUpdateStarTrait, onDrawStarCard, onCalibrateStarCard, onFinalizeStarCard, onContinueStarCard, onApplyStarCardRevision, onListMemories, onProposeMemory, onConfirmMemory, onUpdateMemory, onRejectMemory, onResolveMemoryRelationship, onListMemoryRevisions, onExtractMemories, onLatestMemoryExtraction, onMemoryAutomationPolicy, onSetMemoryAutomationPolicy, onDeleteMemory, onLatestMemoryAudit, onListOpenQuestions, onCreateOpenQuestion, onUpdateOpenQuestion, onPeriodReviewMaterial, onCreatePeriodReview, onListPeriodReviews, onUpdatePeriodReview, onListConcerns, onCreateConcern, onUpdateConcern, onCompleteConcern, onConvertConcern, onCalendarMonth, onCalendarDay, onCreateCheckin, onCreateJournal, onUpdateJournal, onDeleteJournal, onReflectionTrend, onListExperiments, onCreateExperiment, onStartExperiment, onObserveExperiment, onStopExperiment, onListContemplations, onListPrincipleProposals, onListPrinciples, onAcceptPrincipleProposal, onRejectPrincipleProposal, onRevisePrincipleStatus, onListPhotoStories, onCreatePhotoStory, onReadPhotoStory, onObservePhotoStory, onContinuePhotoStory, onUpdatePhotoStory, onDeletePhotoStory, activeSpace, sidebarCollapsed, onSelectSpace, onToggleSidebar, onDraftConversation, t, ...dockActions }: MindGardenReviewCenterProps): import("react").JSX.Element;
/** Full slot props: standard session kit, store, injected actions, and locale seat. */
export type MindGardenViewProps = ConvViewProps & MindGardenViewActions & PropsLocale<'mindGarden'> & PropsStore<ReturnType<typeof createMindGardenViewStore>>;
/** Read the typed session projection and adapt it to the review center. */
export declare function MindGardenView({ useProjection, useStore, actions, inputActions, ...props }: MindGardenViewProps): import("react").JSX.Element;
//# sourceMappingURL=MindGardenView.d.ts.map