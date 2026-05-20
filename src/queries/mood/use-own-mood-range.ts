"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchOwnMoodRange } from "~queries/mood/fetch-own-mood-range";
import { moodKeys } from "~queries/mood/keys";

export function useOwnMoodRange(start: string, end: string) {
    return useQuery({
        queryKey: moodKeys.ownRange(start, end),
        queryFn: () => fetchOwnMoodRange(start, end),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
