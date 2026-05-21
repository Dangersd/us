import type { CalendarEventOccurrence } from "~interfaces/calendar";

// Самое раннее non-cancelled occurrence на или после today. По времени
// сортируем "23:59" для null-time, чтобы all-day шёл после timed events
// того же дня (timed первым).
export function pickNextEvent(
    occurrences: CalendarEventOccurrence[] | undefined,
    today: string,
): CalendarEventOccurrence | null {
    if (!occurrences || occurrences.length === 0) return null;
    const upcoming = occurrences
        .filter((o) => o.occurrenceDate >= today && o.state !== "cancelled")
        .sort((a, b) => {
            if (a.occurrenceDate !== b.occurrenceDate) {
                return a.occurrenceDate < b.occurrenceDate ? -1 : 1;
            }
            return (a.time ?? "23:59").localeCompare(b.time ?? "23:59");
        });
    return upcoming[0] ?? null;
}
