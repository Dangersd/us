"use client";

import { useQuery } from "@tanstack/react-query";

import { todayDateString } from "~libs/date";
import { createFetchCycleTodayQuery } from "~queries/cycle/fetch-cycle-today";

export function useCycleToday(date: string = todayDateString()) {
    return useQuery(createFetchCycleTodayQuery(date));
}
