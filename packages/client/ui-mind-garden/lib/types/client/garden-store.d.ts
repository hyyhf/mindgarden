/** Session-scoped viewing state for the Mind Garden workspace. */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
/** Original Mind Garden spaces retained by the Harness-native workspace. */
export type MindGardenSpace = 'today' | 'concerns' | 'calendar' | 'photo-story' | 'memory' | 'growth' | 'star-map' | 'life' | 'philosophy';
interface MindGardenViewState {
    activeSpace: MindGardenSpace;
    sidebarCollapsed: boolean;
}
type MindGardenViewStoreActions = {
    selectSpace: (draft: MindGardenViewState, space: MindGardenSpace) => void;
    toggleSidebar: (draft: MindGardenViewState) => void;
};
/**
 * Create the per-session Mind Garden navigation store.
 * @returns the store handle mounted by the conversation view registration.
 */
export declare function createMindGardenViewStore(): EngineStoreHandle<MindGardenViewState, MindGardenViewStoreActions>;
export {};
//# sourceMappingURL=garden-store.d.ts.map