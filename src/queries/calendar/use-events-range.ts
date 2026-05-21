"use client";

import { useQuery } from "@tanstack/react-query";

import type { DateRange } from "~queries/calendar/expand-recurring";
import { createFetchEventsRangeQuery } from "~queries/calendar/fetch-events-range";

export function useEventsRange(range: DateRange, today: string) {
    return useQuery(createFetchEventsRangeQuery(range, today));
}
