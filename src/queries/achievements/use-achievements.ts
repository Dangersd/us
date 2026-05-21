"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchAchievementsQuery } from "~queries/achievements/fetch-achievements";

export function useAchievements() {
    return useQuery(createFetchAchievementsQuery());
}
