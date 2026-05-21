import type { CoupleStats } from "~interfaces/stats";
import { getBrowserSupabase } from "~libs/supabase/client";
import { statsKeys } from "~queries/stats/keys";
import { mapCoupleStats } from "~queries/stats/map-couple-stats";

const STALE_TIME_MS = 60_000;

export const createFetchCoupleStatsQuery = () => ({
    queryKey: statsKeys.couple(),
    queryFn: fetchCoupleStats,
    staleTime: STALE_TIME_MS,
});

export async function fetchCoupleStats(): Promise<CoupleStats | null> {
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase.rpc("get_couple_stats");
    if (error) throw error;
    if (data == null) return null;
    return mapCoupleStats(data);
}
