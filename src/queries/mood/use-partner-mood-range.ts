"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchPartnerMoodRangeQuery } from "~queries/mood/fetch-partner-mood-range";

export function usePartnerMoodRange(start: string, end: string) {
    return useQuery(createFetchPartnerMoodRangeQuery(start, end));
}
