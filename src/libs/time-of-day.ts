// Greeting-time helpers. Вынесены из ~libs/date потому что они тянут
// COUPLE_TZ в свою сигнатуру + это greeting-specific домен (Home/0.8.1).
//
// Боль из прошлого: server в UTC, client в local. tz=COUPLE_TZ на обеих
// сторонах держит SSR и client-render в синке для Бишкек-пары.
import { COUPLE_TZ } from "~libs/date";

export type TimeOfDay = "morning" | "day" | "evening" | "night";

// Границы по docs/03-rooms/home.md table:
// морнинг 5-10, день 11-17, вечер 18-22, ночь 23-4.
export function getTimeOfDay(
    now: Date = new Date(),
    tz: string = COUPLE_TZ,
): TimeOfDay {
    const hour = Number(
        now.toLocaleString("en-GB", {
            hour: "2-digit",
            hour12: false,
            timeZone: tz,
        }),
    );
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 18) return "day";
    if (hour >= 18 && hour < 23) return "evening";
    return "night";
}

// Inclusive day count от start до today. null если start пустой/невалиден/
// в будущем. UTC arithmetic — совпадает с addDays semantics из ~libs/date.
export function daysSince(start: string | null, today: string): number | null {
    if (!start) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return null;
    const [sy, sm, sd] = start.split("-").map(Number);
    const [ty, tm, td] = today.split("-").map(Number);
    const startMs = Date.UTC(sy, sm - 1, sd);
    const todayMs = Date.UTC(ty, tm - 1, td);
    if (todayMs < startMs) return null;
    return Math.round((todayMs - startMs) / 86400000);
}
