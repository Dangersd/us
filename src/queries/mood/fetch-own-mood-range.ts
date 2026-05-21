import type { MoodEntry } from "~interfaces/mood";
import { getBrowserSupabase } from "~libs/supabase/client";
import { moodKeys } from "~queries/mood/keys";
import {
    MOOD_COLUMNS,
    type MoodEntryRow,
    mapMoodRow,
} from "~queries/mood/map-mood-row";

export const createFetchOwnMoodRangeQuery = (start: string, end: string) => ({
    queryKey: moodKeys.ownRange(start, end),
    queryFn: () => fetchOwnMoodRange(start, end),
    staleTime: 0,
    refetchOnWindowFocus: true,
});

export async function fetchOwnMoodRange(
    start: string,
    end: string,
): Promise<MoodEntry[]> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const { data, error } = await supabase
        .from("mood_entries")
        .select(MOOD_COLUMNS)
        .eq("user_id", auth.user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })
        .returns<MoodEntryRow[]>();
    if (error) throw error;
    return (data ?? []).map(mapMoodRow);
}
