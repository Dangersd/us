import { cache } from "react";

import "server-only";

import type { MoodEntry } from "~interfaces/mood";
import { getServerSupabase } from "~libs/supabase/server";
import { moodKeys } from "~queries/mood/keys";
import {
    MOOD_COLUMNS,
    type MoodEntryRow,
    mapMoodRow,
} from "~queries/mood/map-mood-row";

export const createFetchTodayMoodServerQuery = (date: string) => ({
    queryKey: moodKeys.byDate(date),
    queryFn: () => fetchTodayMoodServer(date),
});

// De-dup per request: если несколько Server Components внутри одного render-цикла
// зовут fetchTodayMoodServer(date) — Supabase-запрос реально идёт один раз.
export const fetchTodayMoodServer = cache(
    async (date: string): Promise<MoodEntry | null> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return null;

        const { data, error } = await supabase
            .from("mood_entries")
            .select(MOOD_COLUMNS)
            .eq("user_id", auth.user.id)
            .eq("date", date)
            .maybeSingle<MoodEntryRow>();
        if (error) throw error;
        return data ? mapMoodRow(data) : null;
    },
);
