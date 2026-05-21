import type { CalendarEvent } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";
import {
    CALENDAR_EVENT_COLUMNS,
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

export const createFetchEventQuery = (id: string) => ({
    queryKey: calendarKeys.eventById(id),
    queryFn: () => fetchEvent(id),
    staleTime: 0,
    refetchOnWindowFocus: true,
});

export async function fetchEvent(id: string): Promise<CalendarEvent | null> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { data, error } = await supabase
        .from("calendar_events")
        .select(CALENDAR_EVENT_COLUMNS)
        .eq("id", id)
        .maybeSingle<CalendarEventRow>();
    if (error) throw error;
    if (!data) return null;
    return mapCalendarEventRow(data);
}
