import type { EventPhoto } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    EVENT_PHOTO_COLUMNS,
    type EventPhotoRow,
    mapEventPhotoRow,
} from "~queries/calendar/map-event-photo-row";

export async function fetchEventPhotos(
    eventId: string,
    occurrenceDate: string,
): Promise<EventPhoto[]> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const { data, error } = await supabase
        .from("event_photos")
        .select(EVENT_PHOTO_COLUMNS)
        .eq("event_id", eventId)
        .eq("occurrence_date", occurrenceDate)
        .order("created_at", { ascending: true })
        .returns<EventPhotoRow[]>();
    if (error) throw error;
    return (data ?? []).map(mapEventPhotoRow);
}
