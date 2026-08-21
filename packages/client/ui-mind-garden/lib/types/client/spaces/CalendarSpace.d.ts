/** Calendar atlas, filtering, conversation handoff, and trend projection. */
import type { MindGardenKey } from '../locales.ts';
import type { MindGardenViewActions } from '../slots.ts';
type CalendarActions = Pick<MindGardenViewActions, 'onCalendarMonth' | 'onCalendarDay' | 'onReflectionTrend'>;
/** One fixed cell in a Gregorian month grid. */
export interface GardenCalendarCell {
    readonly date: string | null;
    readonly day: number | null;
}
/** Build a Sunday-first grid with complete weeks. */
export declare function gardenCalendarCells(month: string): readonly GardenCalendarCell[];
/** Plain props for the calendar space. */
export interface CalendarSpaceProps extends CalendarActions {
    readonly today: string;
    readonly onDraftConversation?: (draft: string) => void;
    readonly t: (key: MindGardenKey) => string;
}
/** Render a tactile month atlas, complete selected-day ledger, filters, and mood trail. */
export declare function CalendarSpace({ today, onCalendarMonth, onCalendarDay, onReflectionTrend, onDraftConversation, t, }: CalendarSpaceProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=CalendarSpace.d.ts.map