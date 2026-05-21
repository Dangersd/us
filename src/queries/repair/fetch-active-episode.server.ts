import { cache } from "react";

import "server-only";

import type { RepairEpisode } from "~interfaces/repair";
import { getServerSupabase } from "~libs/supabase/server";
import { repairKeys } from "~queries/repair/keys";
import {
    REPAIR_EPISODE_COLUMNS,
    type RepairEpisodeRow,
    mapRepairEpisodeRow,
} from "~queries/repair/map-repair-episode-row";

/**
 * Server-side query-фабрика для prefetchQuery в Home page.
 * Без refetchInterval — на сервере он не имеет смысла.
 */
export const createFetchActiveEpisodeServerQuery = () => ({
    queryKey: repairKeys.active(),
    queryFn: fetchActiveEpisodeServer,
});

export const fetchActiveEpisodeServer = cache(
    async (): Promise<RepairEpisode | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase
            .from("repair_episodes")
            .select(REPAIR_EPISODE_COLUMNS)
            .is("closed_at", null)
            .maybeSingle<RepairEpisodeRow>();
        if (error) throw error;
        return data ? mapRepairEpisodeRow(data) : null;
    },
);
