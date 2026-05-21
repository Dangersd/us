"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchOwnMoodRangeQuery } from "~queries/mood/fetch-own-mood-range";

export function useOwnMoodRange(start: string, end: string) {
    return useQuery(createFetchOwnMoodRangeQuery(start, end));
}
