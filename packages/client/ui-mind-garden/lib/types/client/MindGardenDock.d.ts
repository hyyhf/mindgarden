/** Mind Garden entry, disclosure, and live preference controls. */
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { MindGardenSessionProjection } from '@deepseek-ai/dsh-mind-garden/core/client';
import type { MindGardenDockActions } from './slots.ts';
/** Props for the stateful visual surface. */
export interface MindGardenPanelProps extends MindGardenDockActions {
    /** Undefined means projection capability absent/loading; null means inactive. */
    projection: MindGardenSessionProjection | null | undefined;
    /** Expand controls immediately when mounted in a dedicated settings surface. */
    defaultOpen?: boolean;
    /** True while the current Agent is producing a response. */
    running?: boolean;
}
/** The visual Mind Garden dock surface. */
export declare function MindGardenPanel({ projection, onActivate, onSelectMode, onSelectSupportIntent, defaultOpen, running, t, }: MindGardenPanelProps & PropsLocale<'mindGarden'>): import("react").JSX.Element | null;
/** Full composer-toolbar props: standard session kit, injected actions, and locale seat. */
export type MindGardenDockProps = import('@deepseek-ai/dsh-client-ui-slots').PropsRuntime<'conversation.input.left'> & MindGardenDockActions & PropsLocale<'mindGarden'>;
/** Read the typed projection and adapt it to the compact composer control. */
export declare function MindGardenDock({ useProjection, useSession, ...props }: MindGardenDockProps): import("react").JSX.Element;
//# sourceMappingURL=MindGardenDock.d.ts.map