import type { RepairEpisode } from "~interfaces/repair";
import { getBrowserSupabase } from "~libs/supabase/client";
import {
    REPAIR_EPISODE_COLUMNS,
    type RepairEpisodeRow,
    mapRepairEpisodeRow,
} from "~queries/repair/map-repair-episode-row";

/**
 * Партнёр (не инициатор) нажал «Я заметил». Идемпотентно:
 *   update ... where acknowledged_at is null
 * Повторное нажатие не перезаписывает существующий timestamp. Если
 * UPDATE затрагивает 0 rows, читаем текущую строку и возвращаем без
 * мутации.
 */
export async function acknowledgeEpisode(
    episodeId: string,
): Promise<RepairEpisode> {
    const supabase = getBrowserSupabase();

    const { data, error } = await supabase
        .from("repair_episodes")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("id", episodeId)
        .is("acknowledged_at", null)
        .select(REPAIR_EPISODE_COLUMNS)
        .maybeSingle<RepairEpisodeRow>();
    if (error) throw error;
    if (data) return mapRepairEpisodeRow(data);

    const { data: existing, error: readError } = await supabase
        .from("repair_episodes")
        .select(REPAIR_EPISODE_COLUMNS)
        .eq("id", episodeId)
        .single<RepairEpisodeRow>();
    if (readError) throw readError;
    return mapRepairEpisodeRow(existing);
}

export type ResolveSide = "initiator" | "partner";

/**
 * Сторона нажала «Помирились». Ставит свою *_resolved_at; closed_at
 * выставляется триггером repair_episodes_set_closed_at_trg, когда оба
 * *_resolved_at заполнены (см. миграцию). Row-level lock в Postgres
 * сериализует одновременные UPDATE с обеих сторон — race нет.
 *
 * WHERE closed_at IS NULL защищает от повторного resolve после reopen.
 */
export async function resolveEpisode(
    episodeId: string,
    side: ResolveSide,
): Promise<RepairEpisode> {
    const supabase = getBrowserSupabase();
    const nowIso = new Date().toISOString();
    const update: Partial<RepairEpisodeRow> =
        side === "initiator"
            ? { initiator_resolved_at: nowIso }
            : { partner_resolved_at: nowIso };

    const { data, error } = await supabase
        .from("repair_episodes")
        .update(update)
        .eq("id", episodeId)
        .is("closed_at", null)
        .select(REPAIR_EPISODE_COLUMNS)
        .single<RepairEpisodeRow>();
    if (error) throw error;
    return mapRepairEpisodeRow(data);
}
