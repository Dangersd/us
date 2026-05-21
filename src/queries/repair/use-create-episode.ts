"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
    CreateRepairEpisodeInput,
    RepairEpisode,
} from "~interfaces/repair";
import {
    REPAIR_UNIQUE_VIOLATION,
    type RepairCreateError,
    createRepairEpisode,
} from "~queries/repair/create-episode";
import { fetchActiveEpisode } from "~queries/repair/fetch-active-episode";
import { repairKeys } from "~queries/repair/keys";

/**
 * Error-объект, который выбрасывается из мутации, если партнёр уже создал
 * активный эпизод в ту же секунду. Caller (UI-форма) проверяет
 * `error.kind === "concurrent"` и показывает toast вместо raw-ошибки.
 *
 * В этой же ветке мы делаем refetch активного эпизода — чтобы виджет
 * сразу показал существующий вместо пустого state.
 */
export class ConcurrentRepairEpisodeError extends Error {
    readonly kind = "concurrent" as const;
    constructor() {
        super("concurrent_repair_episode");
    }
}

export function useCreateEpisode() {
    const qc = useQueryClient();

    return useMutation<
        RepairEpisode,
        ConcurrentRepairEpisodeError | Error,
        CreateRepairEpisodeInput
    >({
        mutationFn: async (input) => {
            try {
                return await createRepairEpisode(input);
            } catch (err) {
                const e = err as RepairCreateError;
                if (e?.code === REPAIR_UNIQUE_VIOLATION) {
                    // Конкурентный insert от партнёра. Пуллим существующий
                    // эпизод и кладём в кэш, чтобы виджет показал его сразу.
                    const existing = await fetchActiveEpisode();
                    if (existing) {
                        qc.setQueryData<RepairEpisode>(
                            repairKeys.active(),
                            existing,
                        );
                    }
                    throw new ConcurrentRepairEpisodeError();
                }
                throw err;
            }
        },

        onSuccess: (episode) => {
            qc.setQueryData<RepairEpisode>(repairKeys.active(), episode);
        },
    });
}
