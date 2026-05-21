import { cache } from "react";

import "server-only";

import type {
    CalendarEvent,
    CalendarEventOccurrence,
} from "~interfaces/calendar";
import { getServerSupabase } from "~libs/supabase/server";
import {
    type DateRange,
    expandEventsInRange,
} from "~queries/calendar/expand-recurring";
import { calendarKeys } from "~queries/calendar/keys";
import {
    CALENDAR_EVENT_COLUMNS,
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

export const createFetchEventsRangeServerQuery = (
    range: DateRange,
    today: string,
) => ({
    queryKey: calendarKeys.eventsRange(range.start, range.end),
    queryFn: () => fetchEventsRangeServer(range, today),
});

export const fetchEventsRangeServer = cache(
    async (
        range: DateRange,
        today: string,
    ): Promise<CalendarEventOccurrence[]> => {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return [];

        const { data, error } = await supabase
            .from("calendar_events")
            .select(CALENDAR_EVENT_COLUMNS)
            .or(
                `and(date.gte.${range.start},date.lte.${range.end}),is_recurring.eq.true`,
            )
            .returns<CalendarEventRow[]>();
        if (error) throw error;

        const events: CalendarEvent[] = (data ?? []).map(mapCalendarEventRow);
        return expandEventsInRange(events, range, today);
    },
);
