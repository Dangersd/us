import { cache } from "react";

import "server-only";

import type { CalendarEvent } from "~interfaces/calendar";
import { getServerSupabase } from "~libs/supabase/server";
import { calendarKeys } from "~queries/calendar/keys";
import {
    CALENDAR_EVENT_COLUMNS,
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

export const createFetchEventServerQuery = (id: string) => ({
    queryKey: calendarKeys.eventById(id),
    queryFn: () => fetchEventServer(id),
});

export const fetchEventServer = cache(
    async (id: string): Promise<CalendarEvent | null> => {
        const supabase = await getServerSupabase();
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
    },
);
