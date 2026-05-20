"use client";

import { useQuery } from "@tanstack/react-query";

import type { DateRange } from "~queries/calendar/expand-recurring";
import { fetchEventsRange } from "~queries/calendar/fetch-events-range";
import { calendarKeys } from "~queries/calendar/keys";

export function useEventsRange(range: DateRange, today: string) {
    return useQuery({
        queryKey: calendarKeys.eventsRange(range.start, range.end),
        queryFn: () => fetchEventsRange(range, today),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
