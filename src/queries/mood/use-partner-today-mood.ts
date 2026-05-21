"use client";

import { useQuery } from "@tanstack/react-query";

import { todayDateString } from "~libs/date";
import { createFetchPartnerTodayMoodQuery } from "~queries/mood/fetch-partner-today-mood";

export function usePartnerTodayMood(date: string = todayDateString()) {
    return useQuery(createFetchPartnerTodayMoodQuery(date));
}
