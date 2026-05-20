import type {
    CalendarEvent,
    CalendarEventOccurrence,
} from "~interfaces/calendar";

// Pure-функция: разворачивает recurring и non-recurring events в occurrences
// для заданного диапазона. Принимает `today` параметром — никаких new Date()
// внутри, чтобы server и client давали одинаковые результаты (одинаковые
// query keys через занчения).
//
// Edge-cases (покрыты vitest в expand-recurring.test.ts):
// - YEARLY anchor Feb 29 в не-високосном году → Feb 28
// - MONTHLY anchor day-31 в коротких месяцах → last day месяца
// - cancelled state → isPast = false (не «past», отдельный визуал)
// - non-recurring outside range → не эмитим вообще
// - recurring без anchor (некорректный row) → пропускаем

export interface DateRange {
    start: string; // YYYY-MM-DD inclusive
    end: string; // YYYY-MM-DD inclusive
}

export function expandEventsInRange(
    events: CalendarEvent[],
    range: DateRange,
    today: string,
): CalendarEventOccurrence[] {
    const out: CalendarEventOccurrence[] = [];

    for (const event of events) {
        if (!event.isRecurring) {
            if (event.date >= range.start && event.date <= range.end) {
                out.push(buildOccurrence(event, event.date, today, false));
            }
            continue;
        }

        if (!event.recurrenceRule || !event.recurrenceAnchorDate) {
            // Некорректный recurring row — игнорируем (constraint в SQL не
            // должен такому позволить, но защищаемся).
            continue;
        }

        const dates = generateOccurrenceDates(
            event.recurrenceRule,
            event.recurrenceAnchorDate,
            range,
        );
        for (const d of dates) {
            out.push(buildOccurrence(event, d, today, true));
        }
    }

    out.sort((a, b) => {
        if (a.occurrenceDate !== b.occurrenceDate) {
            return a.occurrenceDate < b.occurrenceDate ? -1 : 1;
        }
        // Без time — стабильность по id.
        const at = a.time ?? "";
        const bt = b.time ?? "";
        if (at !== bt) return at < bt ? -1 : 1;
        return a.id < b.id ? -1 : 1;
    });

    return out;
}

function buildOccurrence(
    event: CalendarEvent,
    occurrenceDate: string,
    today: string,
    isVirtual: boolean,
): CalendarEventOccurrence {
    const isPast = occurrenceDate < today && event.state !== "cancelled";

    let yearsSinceAnchor: number | null = null;
    if (event.isRecurring && event.recurrenceAnchorDate) {
        const anchorYear = parseInt(event.recurrenceAnchorDate.slice(0, 4), 10);
        const occurrenceYear = parseInt(occurrenceDate.slice(0, 4), 10);
        yearsSinceAnchor = occurrenceYear - anchorYear;
    }

    return {
        ...event,
        occurrenceId: isVirtual ? `${event.id}:${occurrenceDate}` : event.id,
        occurrenceDate,
        isVirtual,
        isPast,
        yearsSinceAnchor,
    };
}

function generateOccurrenceDates(
    rule: "YEARLY" | "MONTHLY",
    anchorDate: string,
    range: DateRange,
): string[] {
    const anchor = parseYmd(anchorDate);
    const start = parseYmd(range.start);
    const end = parseYmd(range.end);

    if (rule === "YEARLY") {
        return generateYearly(anchor, start, end);
    }
    return generateMonthly(anchor, start, end);
}

function generateYearly(anchor: Ymd, start: Ymd, end: Ymd): string[] {
    const out: string[] = [];
    const startYear = anchor.y > start.y ? anchor.y : start.y;
    for (let year = startYear; year <= end.y; year++) {
        const date = clampToValidDate(year, anchor.m, anchor.d);
        if (date >= toYmd(start) && date <= toYmd(end)) {
            out.push(date);
        }
    }
    return out;
}

function generateMonthly(anchor: Ymd, start: Ymd, end: Ymd): string[] {
    const out: string[] = [];

    // Anchor — самая ранняя возможная точка. Начинаем с anchor месяца.
    let year = start.y;
    let month = start.m;
    // Если start раньше anchor — двигаем cursor вперёд к anchor.
    if (year < anchor.y || (year === anchor.y && month < anchor.m)) {
        year = anchor.y;
        month = anchor.m;
    }

    while (year < end.y || (year === end.y && month <= end.m)) {
        const date = clampToValidDate(year, month, anchor.d);
        if (date >= toYmd(start) && date <= toYmd(end)) {
            out.push(date);
        }
        // Next month
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    return out;
}

interface Ymd {
    y: number;
    m: number; // 1-12
    d: number; // 1-31
}

function parseYmd(s: string): Ymd {
    return {
        y: parseInt(s.slice(0, 4), 10),
        m: parseInt(s.slice(5, 7), 10),
        d: parseInt(s.slice(8, 10), 10),
    };
}

function toYmd(ymd: Ymd): string {
    const mm = String(ymd.m).padStart(2, "0");
    const dd = String(ymd.d).padStart(2, "0");
    return `${ymd.y}-${mm}-${dd}`;
}

// Кламп: если day выходит за пределы месяца (Feb 29 в не-високос, day-31 в
// 30-дневном) — последний день месяца.
function clampToValidDate(y: number, m: number, d: number): string {
    const lastDay = daysInMonth(y, m);
    const clamped = d > lastDay ? lastDay : d;
    const mm = String(m).padStart(2, "0");
    const dd = String(clamped).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
}

function daysInMonth(y: number, m: number): number {
    // Date.UTC: month 0-indexed, day 0 = last day of previous month.
    return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
