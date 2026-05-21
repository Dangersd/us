import { cache } from "react";

import "server-only";

import type { AchievementUnlock } from "~interfaces/achievements";
import { getServerSupabase } from "~libs/supabase/server";
import { achievementsKeys } from "~queries/achievements/keys";
import {
    type AchievementUnlockRow,
    mapAchievementRows,
} from "~queries/achievements/map-achievement-row";

const STALE_TIME_MS = 60_000;

export const createFetchAchievementsServerQuery = () => ({
    queryKey: achievementsKeys.couple(),
    queryFn: fetchAchievementsServer,
    staleTime: STALE_TIME_MS,
});

export const fetchAchievementsServer = cache(
    async (): Promise<AchievementUnlock[]> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return [];

        const { data, error } = await supabase.rpc("get_couple_achievements");
        if (error) throw error;
        if (!data) return [];
        return mapAchievementRows(data as AchievementUnlockRow[]);
    },
);
