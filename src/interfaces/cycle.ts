// Domain types для Cycle-домена (Phase 0.11).
// DB-shape (snake_case rows) — в ~queries/cycle/map-cycle-row.ts.

// Доменная фаза (что система знает). Источник — compute_phase SQL function.
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

// UI-render hint для colored dots на grid-ячейках. Маппинг из CyclePhase + day
// делается на UI-уровне (legend: Период / Фертильно / Овуляция / Прогноз).
// "none" = пустая ячейка, "prognosis" = ожидаемый будущий период (outline only).
export type CyclePhaseToken =
    | "period"
    | "fertile"
    | "ovulation"
    | "prognosis"
    | "none";

// Фиксированный enum симптомов v0.11. Drift-protection: mapCycleRow тихо
// фильтрует unknown теги. Расширение enum — без миграции БД (text[] без CHECK).
export type CycleSymptom =
    | "cramps"
    | "headache"
    | "tender_breasts"
    | "bloating"
    | "fatigue"
    | "mood_swings"
    | "low_libido"
    | "high_libido"
    | "insomnia"
    | "appetite_change";

export const CYCLE_SYMPTOMS: readonly CycleSymptom[] = [
    "cramps",
    "headache",
    "tender_breasts",
    "bloating",
    "fatigue",
    "mood_swings",
    "low_libido",
    "high_libido",
    "insomnia",
    "appetite_change",
] as const;

// 1 = light, 2 = medium, 3 = heavy. null = в этот день периода не было.
export type PeriodFlow = 1 | 2 | 3;

export interface CycleEntry {
    userId: string;
    coupleId: string;
    date: string; // YYYY-MM-DD
    periodFlow: PeriodFlow | null;
    symptoms: CycleSymptom[];
    note: string | null;
    createdAt: string;
    updatedAt: string;
}

// Результат compute_my_phase / get_partner_phase RPC.
// Все поля null если period_starts пустой (нет данных).
export interface CyclePhaseInfo {
    phase: CyclePhase | null;
    dayOfCycle: number | null;
    daysToNextPeriod: number | null;
    cycleLength: number;
}

export interface CycleStats {
    avgLength: number; // в днях; default 28 если данных недостаточно
    regularity: "regular" | "irregular" | "unknown";
    trackedCycles: number; // число завершённых циклов (period_starts.length - 1)
}

// users.settings.cycle JSONB shape. Валидируется yup-схемой в
// use-update-cycle-settings.
export interface CycleSettings {
    phase_visible_to_partner: boolean;
    avg_cycle_length: number;
}

export const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
    phase_visible_to_partner: false,
    avg_cycle_length: 28,
};
