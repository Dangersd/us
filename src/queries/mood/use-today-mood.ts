"use client";

import { useQuery } from "@tanstack/react-query";

import { todayDateString } from "~libs/date";
import { fetchTodayMood } from "~queries/mood/fetch-today-mood";
import { moodKeys } from "~queries/mood/keys";

export function useTodayMood(date: string = todayDateString()) {
    return useQuery({
        queryKey: moodKeys.byDate(date),
        queryFn: () => fetchTodayMood(date),
        staleTime: 60_000,
    });
}
