"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchEventPhotos } from "~queries/calendar/fetch-event-photos";
import { calendarKeys } from "~queries/calendar/keys";

export function useEventPhotos(
    eventId: string | null,
    occurrenceDate: string | null,
) {
    const enabled = Boolean(eventId && occurrenceDate);
    return useQuery({
        queryKey: enabled
            ? calendarKeys.eventPhotos(eventId!, occurrenceDate!)
            : ["calendar", "event-photos", "none"],
        queryFn: () =>
            enabled
                ? fetchEventPhotos(eventId!, occurrenceDate!)
                : Promise.resolve([]),
        enabled,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
