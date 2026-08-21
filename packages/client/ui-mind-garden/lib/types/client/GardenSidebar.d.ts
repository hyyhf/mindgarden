/** Local navigation for the original Mind Garden spaces. */
import type { MindGardenKey } from './locales.ts';
import type { MindGardenSpace } from './garden-store.ts';
/** Props kept as plain values so the component remains independent from Client ctx. */
export interface GardenSidebarProps {
    readonly activeSpace: MindGardenSpace;
    readonly collapsed: boolean;
    readonly starState: 'ritual' | 'new-dust' | 'continue' | 'draw';
    readonly starCount: number;
    readonly onSelect: (space: MindGardenSpace) => void;
    readonly onSettings: (trigger: HTMLButtonElement) => void;
    readonly onToggle: () => void;
    readonly t: (key: MindGardenKey) => string;
}
/** Render the grouped garden rail and its live constellation entry. */
export declare function GardenSidebar({ activeSpace, collapsed, starState, starCount, onSelect, onSettings, onToggle, t, }: GardenSidebarProps): import("react").JSX.Element;
//# sourceMappingURL=GardenSidebar.d.ts.map