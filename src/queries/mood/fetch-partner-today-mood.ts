import type { MoodEntry } from "~interfaces/mood";
import { getBrowserSupabase } from "~libs/supabase/client";
import { type MoodEntryRow, mapMoodRow } from "~queries/mood/map-mood-row";

// Partner-row за конкретную дату. Идёт через get_partner_mood_range(date, date)
// SECURITY DEFINER — RLS на mood_entries разрешает SELECT только по
// user_id = auth.uid(), поэтому direct .neq возвращает пусто всегда.
// Возвращает null если partner ещё не отметился или auth отсутствует.
export async function fetchPartnerTodayMood(
    date: string,
): Promise<MoodEntry | null> {
    const supabase = getBrowserSupabase();
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
}
