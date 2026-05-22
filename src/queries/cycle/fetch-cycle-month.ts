import type { CycleEntry } from "~interfaces/cycle";
import { getMonthRange } from "~libs/date";
import { getBrowserSupabase } from "~libs/supabase/client";
import { cycleKeys } from "~queries/cycle/keys";
import {
    CYCLE_COLUMNS,
    type CycleEntryRow,
    mapCycleRow,
} from "~queries/cycle/map-cycle-row";

export const createFetchCycleMonthQuery = (ym: string) => ({
    queryKey: cycleKeys.month(ym),
    queryFn: () => fetchCycleMonth(ym),
});

// SELECT cycle_entries WHERE user=self AND date BETWEEN month-range.
// RLS гарантирует self-only — direct .from() безопасен, RPC не нужен.
export async function fetchCycleMonth(ym: string): Promise<CycleEntry[]> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const { start, end } = getMonthRange(ym);

    const { data, error } = await supabase
        .from("cycle_entries")
        .select(CYCLE_COLUMNS)
        .eq("user_id", auth.user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })
        .returns<CycleEntryRow[]>();
    if (error) throw error;
    return (data ?? []).map(mapCycleRow);
}
