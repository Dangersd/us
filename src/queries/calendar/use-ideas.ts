"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchIdeas } from "~queries/calendar/fetch-ideas";
import { calendarKeys } from "~queries/calendar/keys";

export function useIdeas() {
    return useQuery({
        queryKey: calendarKeys.ideas(),
        queryFn: fetchIdeas,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
