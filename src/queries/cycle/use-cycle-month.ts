"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchCycleMonthQuery } from "~queries/cycle/fetch-cycle-month";

export function useCycleMonth(ym: string) {
    return useQuery(createFetchCycleMonthQuery(ym));
}
