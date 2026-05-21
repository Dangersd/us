"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchCoupleStatsQuery } from "~queries/stats/fetch-couple-stats";

export function useCoupleStats() {
    return useQuery(createFetchCoupleStatsQuery());
}
