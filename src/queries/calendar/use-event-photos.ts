"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchEventPhotosQuery } from "~queries/calendar/fetch-event-photos";

export function useEventPhotos(
    eventId: string | null,
    occurrenceDate: string | null,
) {
    const enabled = Boolean(eventId && occurrenceDate);
    return useQuery({
        ...createFetchEventPhotosQuery(
            eventId ?? "none",
            occurrenceDate ?? "none",
        ),
        enabled,
    });
}
