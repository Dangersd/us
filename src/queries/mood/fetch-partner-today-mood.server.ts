import { cache } from "react";

import "server-only";

import type { MoodEntry } from "~interfaces/mood";
import { getServerSupabase } from "~libs/supabase/server";
import { moodKeys } from "~queries/mood/keys";
import { type MoodEntryRow, mapMoodRow } from "~queries/mood/map-mood-row";

export const createFetchPartnerTodayMoodServerQuery = (date: string) => ({
    queryKey: moodKeys.partnerByDate(date),
    queryFn: () => fetchPartnerTodayMoodServer(date),
});

// Server-side версия: см. fetch-partner-today-mood.ts — оба ходят через
// get_partner_mood_range() SECURITY DEFINER, иначе RLS отрезает partner-row.
export const fetchPartnerTodayMoodServer = cache(
    async (date: string): Promise<MoodEntry | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase.rpc("get_partner_mood_range", {
            p_start: date,
            p_end: date,
        });
        if (error) throw error;
        const rows = (data ?? []) as MoodEntryRow[];
        const row = rows[0];
        return row ? mapMoodRow(row) : null;
    },
);
