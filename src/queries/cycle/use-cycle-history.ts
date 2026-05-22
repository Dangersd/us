"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchCycleHistoryQuery } from "~queries/cycle/fetch-cycle-history";

export function useCycleHistory(days: number = 180) {
    return useQuery(createFetchCycleHistoryQuery(days));
}
