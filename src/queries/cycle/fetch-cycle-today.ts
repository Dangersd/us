import type { CycleEntry } from "~interfaces/cycle";
import { getBrowserSupabase } from "~libs/supabase/client";
import { cycleKeys } from "~queries/cycle/keys";
import {
    CYCLE_COLUMNS,
    type CycleEntryRow,
    mapCycleRow,
} from "~queries/cycle/map-cycle-row";

export const createFetchCycleTodayQuery = (date: string) => ({
    queryKey: cycleKeys.today(date),
    queryFn: () => fetchCycleToday(date),
    // staleTime короткий — нужно подтянуть свежий результат после write из
    // другого UI (cycle log modal обновил → mood checkin при mount должен это
    // видеть). Решается invalidation в useUpsertCycleEntry, но safety net.
    staleTime: 0,
});

// Один cycle_entry по дате. null если за этот день не было лога.
// Используется MoodCycleSection (D2 prefetch) и CycleLogModal (initial values).
export async function fetchCycleToday(
    date: string,
): Promise<CycleEntry | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
        .from("cycle_entries")
        .select(CYCLE_COLUMNS)
        .eq("user_id", auth.user.id)
        .eq("date", date)
        .maybeSingle<CycleEntryRow>();
    if (error) throw error;
    return data ? mapCycleRow(data) : null;
}
