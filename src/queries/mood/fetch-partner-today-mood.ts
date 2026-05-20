import type { MoodEntry } from "~interfaces/mood";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    MOOD_COLUMNS,
    type MoodEntryRow,
    mapMoodRow,
} from "~queries/mood/map-mood-row";

// Запись partner-mood за дату. RLS пропускает строку partner (по couple_id),
// фильтруем по user_id ≠ self. Возвращает null если partner ещё не отметился
// или если auth отсутствует.
export async function fetchPartnerTodayMood(
    date: string,
): Promise<MoodEntry | null> {
    const supabase = getBrowserSupabase();
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
}
