"use client";

import { useQuery } from "@tanstack/react-query";

import { todayDateString } from "~libs/date";
import { createFetchTodayMoodQuery } from "~queries/mood/fetch-today-mood";

export function useTodayMood(date: string = todayDateString()) {
    return useQuery(createFetchTodayMoodQuery(date));
}
