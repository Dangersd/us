"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchEventMemoryQuery } from "~queries/calendar/fetch-event-memory";

export function useEventMemory(
    eventId: string | null,
    occurrenceDate: string | null,
) {
    const enabled = Boolean(eventId && occurrenceDate);
    return useQuery({
        ...createFetchEventMemoryQuery(
            eventId ?? "none",
            occurrenceDate ?? "none",
        ),
        enabled,
    });
}
