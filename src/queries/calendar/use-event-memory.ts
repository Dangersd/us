"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchEventMemory } from "~queries/calendar/fetch-event-memory";
import { calendarKeys } from "~queries/calendar/keys";

export function useEventMemory(
    eventId: string | null,
    occurrenceDate: string | null,
) {
    const enabled = Boolean(eventId && occurrenceDate);
    return useQuery({
        queryKey: enabled
            ? calendarKeys.eventMemory(eventId!, occurrenceDate!)
            : ["calendar", "event-memory", "none"],
        queryFn: () =>
            enabled
                ? fetchEventMemory(eventId!, occurrenceDate!)
                : Promise.resolve(null),
        enabled,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
