import type {
    CalendarEvent,
    CalendarEventOccurrence,
} from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    type DateRange,
    expandEventsInRange,
} from "~queries/calendar/expand-recurring";
import {
    CALENDAR_EVENT_COLUMNS,
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

// today — обязательный параметр: cross-midnight isPast корректность.
// Browser-side typically передаёт результат useTodayDate() (см. hooks/).
export async function fetchEventsRange(
    range: DateRange,
    today: string,
): Promise<CalendarEventOccurrence[]> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    // Загружаем: события с date в диапазоне ИЛИ все recurring (их немного,
    // expand-recurring выберет только те occurrence'ы, что попадают в range).
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
}
