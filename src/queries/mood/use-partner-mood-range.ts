"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPartnerMoodRange } from "~queries/mood/fetch-partner-mood-range";
import { moodKeys } from "~queries/mood/keys";

export function usePartnerMoodRange(start: string, end: string) {
    return useQuery({
        queryKey: moodKeys.partnerRange(start, end),
        queryFn: () => fetchPartnerMoodRange(start, end),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
