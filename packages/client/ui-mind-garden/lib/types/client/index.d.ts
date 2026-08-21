/** Mind Garden browser plugin: dock registration, locale, projection, and Remote actions. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type MindGardenKey } from './locales.ts';
export { MindGardenDock, MindGardenPanel } from './MindGardenDock.tsx';
export type { MindGardenActionResult, MindGardenDockActions } from './slots.ts';
export type { MindGardenKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Mind Garden entry and preference copy. */
        mindGarden: MindGardenKey;
    }
}
/** Required browser services. */
export declare const inject: string[];
/** Register the session-scoped Mind Garden dock. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map