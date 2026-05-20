import { cache } from "react";

import "server-only";

import type { MoodEntry } from "~interfaces/mood";
import { getServerSupabase } from "~libs/supabase/server";
import { type MoodEntryRow, mapMoodRow } from "~queries/mood/map-mood-row";

export const fetchPartnerMoodRangeServer = cache(
    async (start: string, end: string): Promise<MoodEntry[]> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return [];

        const { data, error } = await supabase.rpc("get_partner_mood_range", {
            p_start: start,
            p_end: end,
        });
        if (error) throw error;
        const rows = (data ?? []) as MoodEntryRow[];
        return rows.map(mapMoodRow);
    },
);
