// Pure-utils для cycle-домена (Phase 0.11, D3 compact).
//
// Phase detection НЕ здесь — единственный источник правды для логики фаз
// (menstrual/follicular/ovulation/luteal) живёт в SQL compute_phase()
// (см. supabase/migrations/20260603000000_cycle_module.sql, /plan-eng-review D1).
// Клиент вызывает RPC compute_my_phase. Здесь — только производные вычисления
// над period_starts[]: предсказание следующего периода и статистика.
import type { CycleEntry, CycleStats } from "~interfaces/cycle";
import { addDays } from "~libs/date";

// extractPeriodStarts — те же даты-начала-периодов, что в SQL helper
// cycle_period_starts(). Зеркалит логику: день с period_flow и БЕЗ
// period_flow в date-1 = новый период start. Возвращает DESC (newest first).
//
// Используется на клиенте для CycleStats / CycleRing «до периода N дней» —
// чтобы избежать round-trip к compute_my_phase для каждого секундомер-рендера.
// Расхождение с SQL невозможно: тест cycle-math.test.ts покрывает edge cases.
export function extractPeriodStarts(entries: CycleEntry[]): string[] {
    const flowDates = new Set<string>(
        entries.filter((e) => e.periodFlow !== null).map((e) => e.date),
    );
    const starts: string[] = [];
    for (const date of flowDates) {
        const prev = addDays(date, -1);
        if (!flowDates.has(prev)) {
            starts.push(date);
        }
    }
    return starts.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
}

// predictNextPeriod — дата следующего ожидаемого периода = последний period
// start + avgLen. Null если данных нет.
export function predictNextPeriod(
    periodStarts: string[],
    avgLen: number,
): string | null {
    if (periodStarts.length === 0) return null;
    return addDays(periodStarts[0], avgLen);
}

// computeStats — avg длина цикла + регулярность.
// Регулярность: std отклонение длин < 3 дней = regular; >= 3 = irregular;
// < 3 циклов = unknown. Защита от ложной уверенности на маленькой выборке.
const REGULAR_STD_THRESHOLD_DAYS = 3;

export function computeStats(
    periodStarts: string[],
    fallbackAvg: number,
): CycleStats {
    if (periodStarts.length < 2) {
        return {
            avgLength: fallbackAvg,
            regularity: "unknown",
            trackedCycles: 0,
        };
    }

    // period_starts — DESC. Длина цикла N → разница между starts[N] и starts[N-1].
    const lengths: number[] = [];
    for (let i = 0; i < periodStarts.length - 1; i += 1) {
        lengths.push(diffDays(periodStarts[i + 1], periodStarts[i]));
    }

    const avg = lengths.reduce((s, n) => s + n, 0) / lengths.length;
    const variance =
        lengths.reduce((s, n) => s + (n - avg) ** 2, 0) / lengths.length;
    const std = Math.sqrt(variance);

    return {
        avgLength: Math.round(avg),
        regularity:
            periodStarts.length < 3
                ? "unknown"
                : std < REGULAR_STD_THRESHOLD_DAYS
                  ? "regular"
                  : "irregular",
        trackedCycles: lengths.length,
    };
}

// diffDays — utility для cycle-math внутреннего использования.
// Возвращает положительное число дней (later - earlier).
function diffDays(earlier: string, later: string): number {
    const [y1, m1, d1] = earlier.split("-").map(Number);
    const [y2, m2, d2] = later.split("-").map(Number);
    return Math.round(
        (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000,
    );
}
