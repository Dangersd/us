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

export const createFetchPartnerPhaseQuery = () => ({
    queryKey: cycleKeys.partnerPhase(),
    queryFn: fetchPartnerPhase,
    staleTime: 60 * 60_000, // час
    refetchOnWindowFocus: true,
});

// RPC get_partner_phase — возвращает фазу партнёра ТОЛЬКО при её opt-in toggle
// (phase_visible_to_partner=true в users.settings). Иначе пустое множество rows.
// Никаких сырых дат — только фаза + день цикла (для UI рендера ambient ring).
export async function fetchPartnerPhase(): Promise<CyclePhaseInfo | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase.rpc("get_partner_phase");
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
