"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchActiveEpisodeQuery } from "~queries/repair/fetch-active-episode";

/**
 * Реактивный доступ к активному repair-эпизоду пары. Под капотом —
 * 30s polling + refetchOnWindowFocus (см. createFetchActiveEpisodeQuery).
 *
 * Возвращает RepairEpisode | null | undefined (undefined пока грузится).
 */
export function useActiveEpisode() {
    return useQuery(createFetchActiveEpisodeQuery());
}
