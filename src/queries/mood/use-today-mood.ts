"use client";

import { useQuery } from "@tanstack/react-query";

import { todayDateString } from "~libs/date";
import { fetchTodayMood } from "~queries/mood/fetch-today-mood";
import { moodKeys } from "~queries/mood/keys";

// staleTime: 0 + refetchOnWindowFocus: true — кросс-таб синхронизация
// без Realtime (per docs/01-concept.md:34 async-by-design).
export function useTodayMood(date: string = todayDateString()) {
    return useQuery({
        queryKey: moodKeys.byDate(date),
        queryFn: () => fetchTodayMood(date),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
