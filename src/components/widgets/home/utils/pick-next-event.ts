import type { CalendarEventOccurrence } from "~interfaces/calendar";

// Самое раннее non-cancelled occurrence на или после today, с учётом
// текущего HH:MM для сегодняшних timed-событий. all-day сегодняшние всегда
// видны до конца дня; timed события сегодняшние — только если время не
// прошло. По времени сортируем "23:59" для null-time, чтобы all-day шёл
// после timed events того же дня.
export function pickNextEvent(
    occurrences: CalendarEventOccurrence[] | undefined,
    today: string,
    nowHHMM: string = "00:00",
): CalendarEventOccurrence | null {
    if (!occurrences || occurrences.length === 0) return null;
    const upcoming = occurrences
        .filter((o) => {
            if (o.state === "cancelled") return false;
            if (o.occurrenceDate > today) return true;
            if (o.occurrenceDate < today) return false;
            // Сегодня: all-day всегда показываем, timed — только если ещё не прошло.
            if (o.time === null) return true;
            return o.time.slice(0, 5) >= nowHHMM;
        })
        .sort((a, b) => {
            if (a.occurrenceDate !== b.occurrenceDate) {
                return a.occurrenceDate < b.occurrenceDate ? -1 : 1;
            }
            return (a.time ?? "23:59").localeCompare(b.time ?? "23:59");
        });
    return upcoming[0] ?? null;
}
