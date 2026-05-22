// UI render-helper: маппит конкретную дату в CyclePhaseToken для подкраски
// ячейки grid'а (Cycle Calendar или Calendar overlay у неё).
//
// НЕ единственный источник правды о фазах — для текущего дня (chip фазы,
// «день N цикла») используется compute_my_phase SQL RPC (D1). Здесь —
// per-cell приоритетная маппинг real-flow > prognosis > ovulation > fertile.
import type { CycleEntry, CyclePhaseToken } from "~interfaces/cycle";
import { addDays } from "~libs/date";

const PREDICTED_PERIOD_WINDOW = 4; // дней «прогноза» (≈ длина средней менструации)
const FERTILE_BACK = 5;
const FERTILE_FORWARD = 1;

export function dayPhaseToken(
    date: string,
    entries: CycleEntry[],
    periodStarts: string[], // DESC
    avgLen: number,
): CyclePhaseToken {
    // 1. Реальный flow > всё остальное.
    if (entries.some((e) => e.date === date && e.periodFlow !== null)) {
        return "period";
    }

    if (periodStarts.length === 0) return "none";

    // 2. Прогноз следующего периода.
    const lastStart = periodStarts[0];
    const predictedStart = addDays(lastStart, avgLen);
    if (
        date >= predictedStart &&
        date <= addDays(predictedStart, PREDICTED_PERIOD_WINDOW - 1)
    ) {
        return "prognosis";
    }

    // 3. Текущий цикл — посчитать day_of_cycle.
    // Ближайший start <= date (или index 0 если date позже all).
    let cycleStart: string | null = null;
    for (const s of periodStarts) {
        if (s <= date) {
            cycleStart = s;
            break;
        }
    }
    if (!cycleStart) return "none";

    const dayOf = diffDays(cycleStart, date) + 1;
    const ovulationDay = avgLen - 14;

    if (dayOf === ovulationDay) return "ovulation";
    if (
        dayOf >= ovulationDay - FERTILE_BACK &&
        dayOf <= ovulationDay + FERTILE_FORWARD
    ) {
        return "fertile";
    }
    return "none";
}

function diffDays(earlier: string, later: string): number {
    const [y1, m1, d1] = earlier.split("-").map(Number);
    const [y2, m2, d2] = later.split("-").map(Number);
    return Math.round(
        (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000,
    );
}
