"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchEvent } from "~queries/calendar/fetch-event";
import { calendarKeys } from "~queries/calendar/keys";

export function useEvent(id: string | null) {
    return useQuery({
        queryKey: id
            ? calendarKeys.eventById(id)
            : ["calendar", "event", "none"],
        queryFn: () => (id ? fetchEvent(id) : Promise.resolve(null)),
        enabled: Boolean(id),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
