import type { CycleEntry, CycleSymptom, PeriodFlow } from "~interfaces/cycle";
import { CYCLE_SYMPTOMS } from "~interfaces/cycle";

// Raw row из cycle_entries (PostgREST snake_case JSON).
export interface CycleEntryRow {
    user_id: string;
    couple_id: string;
    date: string;
    period_flow: number | null;
    symptoms: string[] | null;
    note: string | null;
    created_at: string;
    updated_at: string;
}

export const CYCLE_COLUMNS =
    "user_id, couple_id, date, period_flow, symptoms, note, created_at, updated_at";

// Drift-protection: тихо отфильтровываем unknown symptom-теги (на случай
// расширения enum'а в TS без полного backfill DB). Аналогично mapAchievementRow.
const SYMPTOM_SET = new Set<string>(CYCLE_SYMPTOMS);

function normalizeSymptoms(raw: string[] | null): CycleSymptom[] {
    if (!raw) return [];
    return raw.filter((s): s is CycleSymptom => SYMPTOM_SET.has(s));
}

function normalizeFlow(raw: number | null): PeriodFlow | null {
    if (raw === 1 || raw === 2 || raw === 3) return raw;
    return null;
}

export function mapCycleRow(row: CycleEntryRow): CycleEntry {
    return {
        userId: row.user_id,
        coupleId: row.couple_id,
        date: row.date,
        periodFlow: normalizeFlow(row.period_flow),
        symptoms: normalizeSymptoms(row.symptoms),
        note: row.note,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
