import type { CyclePhase, CyclePhaseInfo } from "~interfaces/cycle";
import { getBrowserSupabase } from "~libs/supabase/client";
import { cycleKeys } from "~queries/cycle/keys";

interface PhaseRow {
    phase: string | null;
    day_of_cycle: number | null;
    days_to_next_period: number | null;
    cycle_length: number;
}

const PHASE_SET = new Set<string>([
    "menstrual",
    "follicular",
    "ovulation",
    "luteal",
]);

export const createFetchMyPhaseQuery = () => ({
    queryKey: cycleKeys.myPhase(),
    queryFn: fetchMyPhase,
    // Фаза — медленно меняющееся состояние, день сменился ровно раз в сутки.
    // 1 час staleTime + refetch on focus = достаточно живо без излишнего нагрузки.
    staleTime: 60 * 60_000,
    refetchOnWindowFocus: true,
});

// RPC compute_my_phase — SQL single source of truth для логики фазы (D1).
// Возвращает 1 row (компонент phase может быть null если period_starts пусто).
export async function fetchMyPhase(): Promise<CyclePhaseInfo | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase.rpc("compute_my_phase");
    if (error) throw error;
    const rows = (data ?? []) as PhaseRow[];
    const row = rows[0];
    if (!row) return null;

    return {
        phase: normalizePhase(row.phase),
        dayOfCycle: row.day_of_cycle,
        daysToNextPeriod: row.days_to_next_period,
        cycleLength: row.cycle_length,
    };
}

function normalizePhase(raw: string | null): CyclePhase | null {
    if (raw && PHASE_SET.has(raw)) return raw as CyclePhase;
    return null;
}
