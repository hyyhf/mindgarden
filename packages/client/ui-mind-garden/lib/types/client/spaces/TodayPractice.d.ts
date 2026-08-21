/** Daily check-in and encrypted journal composition for the Today space. */
import type { MindGardenKey } from '../locales.ts';
import type { MindGardenViewActions } from '../slots.ts';
type TodayPracticeActions = Pick<MindGardenViewActions, 'onCalendarDay' | 'onCreateCheckin' | 'onCreateJournal' | 'onUpdateJournal' | 'onDeleteJournal'>;
/** Plain props for the Today reflection composer. */
export interface TodayPracticeProps extends TodayPracticeActions {
    readonly today: string;
    readonly t: (key: MindGardenKey) => string;
}
/** Normalize a free-form emotion list into the service's bounded unique words. */
export declare function emotionWords(value: string): readonly string[];
/** Render immutable check-ins and user-governed encrypted journal entries. */
export declare function TodayPractice({ today, onCalendarDay, onCreateCheckin, onCreateJournal, onUpdateJournal, onDeleteJournal, t, }: TodayPracticeProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TodayPractice.d.ts.map