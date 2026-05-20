import type { EventMemory } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    EVENT_MEMORY_COLUMNS,
    type EventMemoryRow,
    mapEventMemoryRow,
} from "~queries/calendar/map-event-memory-row";

export async function fetchEventMemory(
    eventId: string,
    occurrenceDate: string,
): Promise<EventMemory | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
        .from("event_memories")
        .select(EVENT_MEMORY_COLUMNS)
        .eq("event_id", eventId)
        .eq("occurrence_date", occurrenceDate)
        .maybeSingle<EventMemoryRow>();
    if (error) throw error;
    if (!data) return null;
    return mapEventMemoryRow(data);
}
