"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CalendarEvent } from "~interfaces/calendar";
import { getBrowserSupabase } from "~libs/supabase/client";
import { calendarKeys } from "~queries/calendar/keys";
import {
    CALENDAR_EVENT_COLUMNS,
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

// Soft cancel: state='cancelled'. Карточка в agenda показывается с
// strikethrough + opacity 0.5. Это default destructive action в drawer'е
// (use-delete-event — hard delete, под отдельным «Удалить» меню).
export function useCancelEvent() {
    const qc = useQueryClient();

    return useMutation<CalendarEvent, Error, string>({
        mutationFn: async (id) => {
            const supabase = getBrowserSupabase();
            const { data, error } = await supabase
                .from("calendar_events")
                .update({ state: "cancelled" })
                .eq("id", id)
                .select(CALENDAR_EVENT_COLUMNS)
                .single<CalendarEventRow>();
            if (error) throw error;
            return mapCalendarEventRow(data);
        },

        onSuccess: (data) => {
            qc.setQueryData(calendarKeys.eventById(data.id), data);
            qc.invalidateQueries({
                queryKey: calendarKeys.all,
                predicate: (q) =>
                    (q.queryKey[1] as string | undefined) === "events-range",
            });
        },
    });
}
