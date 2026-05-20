import { cache } from "react";

import "server-only";

import type { MoodEntry } from "~interfaces/mood";
import { getServerSupabase } from "~libs/supabase/server";
import {
    MOOD_COLUMNS,
    type MoodEntryRow,
    mapMoodRow,
} from "~queries/mood/map-mood-row";

// Server-side версия: cache() per-request — dedupe внутри одного render-цикла.
export const fetchPartnerTodayMoodServer = cache(
    async (date: string): Promise<MoodEntry | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase
            .from("mood_entries")
            .select(MOOD_COLUMNS)
            .eq("date", date)
            .neq("user_id", auth.user.id)
            .maybeSingle<MoodEntryRow>();
        if (error) throw error;
        return data ? mapMoodRow(data) : null;
    },
);
