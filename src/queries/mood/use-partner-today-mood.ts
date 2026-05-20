"use client";

import { useQuery } from "@tanstack/react-query";

import { todayDateString } from "~libs/date";
import { fetchPartnerTodayMood } from "~queries/mood/fetch-partner-today-mood";
import { moodKeys } from "~queries/mood/keys";

export function usePartnerTodayMood(date: string = todayDateString()) {
    return useQuery({
        queryKey: moodKeys.partnerByDate(date),
        queryFn: () => fetchPartnerTodayMood(date),
        staleTime: 60_000,
    });
}
