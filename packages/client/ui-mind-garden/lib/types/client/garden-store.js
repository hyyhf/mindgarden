/** Session-scoped viewing state for the Mind Garden workspace. */
import { defineStore, } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * Create the per-session Mind Garden navigation store.
 * @returns the store handle mounted by the conversation view registration.
 */
export function createMindGardenViewStore() {
    return defineStore({
        init: () => ({
            activeSpace: 'today',
            sidebarCollapsed: false,
        }),
        persist: 'dsh.mind-garden.view.v1',
        actions: {
            selectSpace: (draft, space) => { draft.activeSpace = space; },
            toggleSidebar: (draft) => { draft.sidebarCollapsed = !draft.sidebarCollapsed; },
        },
    });
}
//# sourceMappingURL=garden-store.js.map