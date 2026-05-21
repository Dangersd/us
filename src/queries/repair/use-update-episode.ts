"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RepairEpisode } from "~interfaces/repair";
import { repairKeys } from "~queries/repair/keys";
import {
    type ResolveSide,
    acknowledgeEpisode,
    resolveEpisode,
} from "~queries/repair/update-episode";

/**
 * Партнёр нажимает «Я заметил». Idempotency-логика — внутри
 * acknowledgeEpisode (см. update-episode.ts).
 */
export function useAcknowledgeEpisode() {
    const qc = useQueryClient();

    return useMutation<RepairEpisode, Error, string>({
        mutationFn: (episodeId) => acknowledgeEpisode(episodeId),
        onSuccess: (episode) => {
            qc.setQueryData<RepairEpisode>(repairKeys.active(), episode);
        },
    });
}

interface ResolveInput {
    episodeId: string;
    side: ResolveSide;
}

/**
 * Сторона нажимает «Помирились». closed_at выставляется триггером
 * на стороне DB, когда оба *_resolved_at заполнены. Когда эпизод
 * закрылся — invalidate активного ключа (виджет возвращается в
 * empty state у обоих).
 */
export function useResolveEpisode() {
    const qc = useQueryClient();

    return useMutation<RepairEpisode, Error, ResolveInput>({
        mutationFn: ({ episodeId, side }) => resolveEpisode(episodeId, side),
        onSuccess: (episode) => {
            if (episode.closedAt !== null) {
                // Эпизод закрылся (обе стороны помирились) — убираем
                // его из кэша «active».
                qc.setQueryData<RepairEpisode | null>(
                    repairKeys.active(),
                    null,
                );
            } else {
                qc.setQueryData<RepairEpisode>(repairKeys.active(), episode);
            }
        },
    });
}
