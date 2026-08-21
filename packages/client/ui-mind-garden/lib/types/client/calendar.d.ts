/** Browser-local date helpers for explicit Mind Garden calendar operations. */
import type { MindGardenCalendarStamp, MindGardenPeriodReviewType } from '@deepseek-ai/dsh-mind-garden/reflection/types';
/**
 * Format one local civil date without allowing UTC conversion to shift the day.
 * @param date - Date observed in the browser's local calendar.
 * @returns The corresponding `YYYY-MM-DD` civil date.
 */
export declare function localDate(date: Date): string;
/**
 * Capture browser zone metadata for one selected local date.
 * @param value - Selected `YYYY-MM-DD` civil date.
 * @returns The explicit civil date, IANA zone, and offset at local midnight.
 */
export declare function calendarStamp(value: string): MindGardenCalendarStamp;
/**
 * Return the inclusive current week, month, or year in browser-local dates.
 * @param periodType - Calendar scale to derive.
 * @param now - Instant whose local period contains the range.
 * @returns Inclusive local start and end dates.
 */
export declare function currentPeriod(periodType: MindGardenPeriodReviewType, now?: Date): {
    readonly start: string;
    readonly end: string;
};
//# sourceMappingURL=calendar.d.ts.map