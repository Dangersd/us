import type { MoodEntry } from "~interfaces/mood";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    MOOD_COLUMNS,
    type MoodEntryRow,
    mapMoodRow,
} from "~queries/mood/map-mood-row";

export async function fetchTodayMood(date: string): Promise<MoodEntry | null> {
    const supabase = getBrowserSupabase();
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
}
