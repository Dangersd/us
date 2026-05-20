"use client";

import { useQuery } from "@tanstack/react-query";

import { todayDateString } from "~libs/date";
import { fetchPartnerTodayMood } from "~queries/mood/fetch-partner-today-mood";
import { moodKeys } from "~queries/mood/keys";

// staleTime: 0 + refetchOnWindowFocus: true — partner's check-in
// шоу-апается при возврате фокуса (async-by-design, docs/01-concept.md:34).
export function usePartnerTodayMood(date: string = todayDateString()) {
    return useQuery({
        queryKey: moodKeys.partnerByDate(date),
        queryFn: () => fetchPartnerTodayMood(date),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
