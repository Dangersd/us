import { cache } from "react";

import "server-only";

import type { CycleEntry } from "~interfaces/cycle";
import { COUPLE_TZ, addDays, todayDateString } from "~libs/date";
import { getServerSupabase } from "~libs/supabase/server";
import { cycleKeys } from "~queries/cycle/keys";
import {
    CYCLE_COLUMNS,
    type CycleEntryRow,
    mapCycleRow,
} from "~queries/cycle/map-cycle-row";

export const createFetchCycleHistoryServerQuery = (days: number) => ({
    queryKey: cycleKeys.history(days),
    queryFn: () => fetchCycleHistoryServer(days),
});

export const fetchCycleHistoryServer = cache(
    async (days: number = 180): Promise<CycleEntry[]> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return [];

        const today = todayDateString(COUPLE_TZ);
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
    },
);
