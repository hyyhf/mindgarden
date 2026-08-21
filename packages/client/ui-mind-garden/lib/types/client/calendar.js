/** Browser-local date helpers for explicit Mind Garden calendar operations. */
/**
 * Format one local civil date without allowing UTC conversion to shift the day.
 * @param date - Date observed in the browser's local calendar.
 * @returns The corresponding `YYYY-MM-DD` civil date.
 */
export function localDate(date) {
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Capture browser zone metadata for one selected local date.
 * @param value - Selected `YYYY-MM-DD` civil date.
 * @returns The explicit civil date, IANA zone, and offset at local midnight.
 */
export function calendarStamp(value) {
    const [year, month, day] = value.split('-').map(Number);
    const localMidnight = new Date(year, month - 1, day);
    return {
        localDate: value,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        utcOffsetMinutes: -localMidnight.getTimezoneOffset(),
    };
}
/**
 * Return the inclusive current week, month, or year in browser-local dates.
 * @param periodType - Calendar scale to derive.
 * @param now - Instant whose local period contains the range.
 * @returns Inclusive local start and end dates.
 */
export function currentPeriod(periodType, now = new Date()) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    if (periodType === 'week') {
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        end.setTime(start.getTime());
        end.setDate(start.getDate() + 6);
    }
    else if (periodType === 'month') {
        start.setDate(1);
        end.setFullYear(start.getFullYear(), start.getMonth() + 1, 0);
    }
    else {
        start.setMonth(0, 1);
        end.setFullYear(start.getFullYear(), 11, 31);
    }
    return { start: localDate(start), end: localDate(end) };
}
//# sourceMappingURL=calendar.js.map