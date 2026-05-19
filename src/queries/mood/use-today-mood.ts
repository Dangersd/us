"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchTodayMood } from "~queries/mood/fetch-today-mood";
import { moodKeys } from "~queries/mood/keys";

// Локальная дата (YYYY-MM-DD) — чтобы midnight-rollover уважал таймзону клиента,
// а не UTC. en-CA даёт ISO-формат "2026-05-20" без сдвигов.
function todayLocalIsoDate(): string {
    return new Date().toLocaleDateString("en-CA");
}

export function useTodayMood() {
    const date = todayLocalIsoDate();
    return useQuery({
        queryKey: moodKeys.byDate(date),
        queryFn: () => fetchTodayMood(date),
        staleTime: 60_000,
    });
}
