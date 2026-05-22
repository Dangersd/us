import type { CycleEntry } from "~interfaces/cycle";
import { addDays, todayDateString } from "~libs/date";
import { getBrowserSupabase } from "~libs/supabase/client";
import { cycleKeys } from "~queries/cycle/keys";
import {
    CYCLE_COLUMNS,
    type CycleEntryRow,
    mapCycleRow,
} from "~queries/cycle/map-cycle-row";

export const createFetchCycleHistoryQuery = (days: number) => ({
    queryKey: cycleKeys.history(days),
    queryFn: () => fetchCycleHistory(days),
});

// Последние N дней cycle_entries (для computeStats / extractPeriodStarts).
// Default 180 дней — ~6 циклов, достаточно для regularity verdict.
export async function fetchCycleHistory(
    days: number = 180,
): Promise<CycleEntry[]> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const today = todayDateString();
    const since = addDays(today, -days);

    const { data, error } = await supabase
        .from("cycle_entries")
        .select(CYCLE_COLUMNS)
        .eq("user_id", auth.user.id)
        .gte("date", since)
        .order("date", { ascending: false })
        .returns<CycleEntryRow[]>();
    if (error) throw error;
    return (data ?? []).map(mapCycleRow);
}
