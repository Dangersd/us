import type {
    CreateRepairEpisodeInput,
    RepairEpisode,
} from "~interfaces/repair";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    REPAIR_EPISODE_COLUMNS,
    type RepairEpisodeRow,
    mapRepairEpisodeRow,
} from "~queries/repair/map-repair-episode-row";

/**
 * Postgres unique-violation code. Возвращается, когда второй партнёр пытается
 * создать эпизод одновременно — partial unique index на (couple_id) where
 * closed_at IS NULL отлавливает race. UI ловит этот код и делает refetch
 * вместо показа ошибки.
 */
export const REPAIR_UNIQUE_VIOLATION = "23505";

/**
 * Узкий тип для error из supabase-js (он не экспортирует PostgrestError shape
 * напрямую). Хватит для проверки code-поля.
 */
export interface RepairCreateError {
    code?: string;
    message: string;
}

/**
 * Кидает уже-инстанциированный объект из supabase, чтобы caller мог
 * проверить error.code === REPAIR_UNIQUE_VIOLATION.
 */
export async function createRepairEpisode(
    input: CreateRepairEpisodeInput,
): Promise<RepairEpisode> {
    const supabase = getBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new Error("not_authenticated");

    const { data, error } = await supabase
        .from("repair_episodes")
        .insert({
            // couple_id выставляется триггером repair_episodes_before_upsert
            // из users.couple_id инициатора — клиент его не пишет.
            initiator_id: auth.user.id,
            intensity: input.intensity,
            note: input.note,
            availability: input.availability,
        })
        .select(REPAIR_EPISODE_COLUMNS)
        .single<RepairEpisodeRow>();
    if (error) throw error;
    return mapRepairEpisodeRow(data);
}
