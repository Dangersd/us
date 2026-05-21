import { cache } from "react";

import "server-only";

import type { CoupleStats } from "~interfaces/stats";
import { getServerSupabase } from "~libs/supabase/server";
import { statsKeys } from "~queries/stats/keys";
import { mapCoupleStats } from "~queries/stats/map-couple-stats";

const STALE_TIME_MS = 60_000;

export const createFetchCoupleStatsServerQuery = () => ({
    queryKey: statsKeys.couple(),
    queryFn: fetchCoupleStatsServer,
    staleTime: STALE_TIME_MS,
});

export const fetchCoupleStatsServer = cache(
    async (): Promise<CoupleStats | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase.rpc("get_couple_stats");
        if (error) throw error;
        if (data == null) return null;
        return mapCoupleStats(data);
    },
);
