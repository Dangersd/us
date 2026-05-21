// Domain types для repair-episodes («После разговора» — кнопка-сигнал между
// партнёрами). Snake_case Row живёт в queries/repair/map-repair-episode-row.ts,
// сюда поднимаются только camelCase domain-типы (как у Mood, Calendar).

export type RepairAvailability = "ready_to_talk" | "need_pause";

export type RepairIntensity = 1 | 2 | 3;

export interface RepairEpisode {
    id: string;
    coupleId: string;
    initiatorId: string;
    intensity: RepairIntensity;
    note: string | null;
    availability: RepairAvailability;
    /**
     * Timestamp когда партнёр (не инициатор) нажал «Я заметил».
     * Идемпотентно — повторное нажатие не перезаписывает.
     */
    acknowledgedAt: string | null;
    initiatorResolvedAt: string | null;
    partnerResolvedAt: string | null;
    /**
     * Заполняется в той же мутации, что выставляет второй *_resolved_at.
     * Активный эпизод имеет closedAt === null.
     */
    closedAt: string | null;
    createdAt: string;
}

/**
 * Поля, которые клиент шлёт в create-mutation. couple_id выставляется
 * триггером на сервере (не доверяем клиенту), initiator_id — auth.uid().
 */
export interface CreateRepairEpisodeInput {
    intensity: RepairIntensity;
    note: string | null;
    availability: RepairAvailability;
}
