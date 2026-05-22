import { cache } from "react";

import "server-only";

import type { CycleEntry } from "~interfaces/cycle";
import { getMonthRange } from "~libs/date";
import { getServerSupabase } from "~libs/supabase/server";
import { cycleKeys } from "~queries/cycle/keys";
import {
    CYCLE_COLUMNS,
    type CycleEntryRow,
    mapCycleRow,
} from "~queries/cycle/map-cycle-row";

export const createFetchCycleMonthServerQuery = (ym: string) => ({
    queryKey: cycleKeys.month(ym),
    queryFn: () => fetchCycleMonthServer(ym),
});

export const fetchCycleMonthServer = cache(
    async (ym: string): Promise<CycleEntry[]> => {
        const supabase = await getServerSupabase();
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
    },
);
