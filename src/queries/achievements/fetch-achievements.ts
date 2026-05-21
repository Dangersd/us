import type { AchievementUnlock } from "~interfaces/achievements";
import { getBrowserSupabase } from "~libs/supabase/client";
import { achievementsKeys } from "~queries/achievements/keys";
import {
    type AchievementUnlockRow,
    mapAchievementRows,
} from "~queries/achievements/map-achievement-row";

const STALE_TIME_MS = 60_000;

export const createFetchAchievementsQuery = () => ({
    queryKey: achievementsKeys.couple(),
    queryFn: fetchAchievements,
    staleTime: STALE_TIME_MS,
});

export async function fetchAchievements(): Promise<AchievementUnlock[]> {
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase.rpc("get_couple_achievements");
    if (error) throw error;
    if (!data) return [];
    return mapAchievementRows(data as AchievementUnlockRow[]);
}
