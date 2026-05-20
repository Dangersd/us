import type { MoodEntry } from "~interfaces/mood";
import { getBrowserSupabase } from "~libs/supabase/client";
import { type MoodEntryRow, mapMoodRow } from "~queries/mood/map-mood-row";

// Partner-rows доступны через get_partner_mood_range() SECURITY DEFINER:
// RLS на mood_entries разрешает SELECT только по `user_id = auth.uid()`,
// поэтому direct .neq фильтр под RLS даёт пустоту. Функция инкапсулирует
// couple-границу.
export async function fetchPartnerMoodRange(
    start: string,
    end: string,
): Promise<MoodEntry[]> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const { data, error } = await supabase.rpc("get_partner_mood_range", {
        p_start: start,
        p_end: end,
    });
    if (error) throw error;
    const rows = (data ?? []) as MoodEntryRow[];
    return rows.map(mapMoodRow);
}
