// Pure-функция: количество полных календарных суток между двумя датами в
// формате YYYY-MM-DD. Используется в Profile-шапке для «N дней знакомы» /
// «M дней вместе».
//
// Контракт:
//  - null / невалидный from → 0 (без crash).
//  - same day → 0.
//  - future from (from > today) → 0 (не отрицательное, тихий fallback).
//  - расчёт через Date.UTC чтобы не цеплять timezone runtime — обе даты уже
//    локализованы (today собираем через todayDateString(COUPLE_TZ) в caller'е).

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function daysBetween(
    fromDate: string | null | undefined,
    today: string,
): number {
    if (!fromDate) return 0;
    if (!ISO_DATE_RE.test(fromDate)) return 0;
    if (!ISO_DATE_RE.test(today)) return 0;

    const fromMs = isoToUtcMs(fromDate);
    const todayMs = isoToUtcMs(today);

    const diffMs = todayMs - fromMs;
    if (diffMs <= 0) return 0;

    return Math.floor(diffMs / 86_400_000);
}

function isoToUtcMs(iso: string): number {
    const y = Number(iso.slice(0, 4));
    const m = Number(iso.slice(5, 7));
    const d = Number(iso.slice(8, 10));
    return Date.UTC(y, m - 1, d);
}
