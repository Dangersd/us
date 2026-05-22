import { cache } from "react";

import "server-only";

import type { CyclePhase, CyclePhaseInfo } from "~interfaces/cycle";
import { getServerSupabase } from "~libs/supabase/server";
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

export const createFetchMyPhaseServerQuery = () => ({
    queryKey: cycleKeys.myPhase(),
    queryFn: fetchMyPhaseServer,
    staleTime: 60 * 60_000,
});

export const fetchMyPhaseServer = cache(
    async (): Promise<CyclePhaseInfo | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase.rpc("compute_my_phase");
        if (error) throw error;
        const rows = (data ?? []) as PhaseRow[];
        const row = rows[0];
        if (!row) return null;

        const phase: CyclePhase | null =
            row.phase && PHASE_SET.has(row.phase)
                ? (row.phase as CyclePhase)
                : null;

        return {
            phase,
            dayOfCycle: row.day_of_cycle,
            daysToNextPeriod: row.days_to_next_period,
            cycleLength: row.cycle_length,
        };
    },
);
