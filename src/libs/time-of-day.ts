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

// Текущее время в формате "HH:MM" по заданной таймзоне. Используется
// pickNextEvent для отсечки прошедших сегодняшних событий.
export function currentTimeHHMM(
    now: Date = new Date(),
    tz: string = COUPLE_TZ,
): string {
    return now.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: tz,
    });
}

// Inclusive day count от start до today. null если start/today пустой/
// невалиден или today < start. UTC arithmetic — совпадает с addDays
// semantics из ~libs/date. Валидируем оба входа симметрично с range-проверкой
// месяца (01-12) и дня (01-31) — без этого «0000-00-00» проходит регекс,
// Date.UTC(0,-1,0) даёт валидный timestamp, и daysSince возвращает мусор.
const ISO_DATE_STRICT_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function daysSince(start: string | null, today: string): number | null {
    if (!start) return null;
    if (!ISO_DATE_STRICT_RE.test(start)) return null;
    if (!ISO_DATE_STRICT_RE.test(today)) return null;
    const [sy, sm, sd] = start.split("-").map(Number);
    const [ty, tm, td] = today.split("-").map(Number);
    const startMs = Date.UTC(sy, sm - 1, sd);
    const todayMs = Date.UTC(ty, tm - 1, td);
    if (Number.isNaN(startMs) || Number.isNaN(todayMs)) return null;
    if (todayMs < startMs) return null;
    return Math.round((todayMs - startMs) / 86400000);
}
