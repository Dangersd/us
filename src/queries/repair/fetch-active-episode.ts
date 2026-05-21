import type { RepairEpisode } from "~interfaces/repair";
import { getBrowserSupabase } from "~libs/supabase/client";
import { repairKeys } from "~queries/repair/keys";
import {
    REPAIR_EPISODE_COLUMNS,
    type RepairEpisodeRow,
    mapRepairEpisodeRow,
} from "~queries/repair/map-repair-episode-row";

// 30-секундный polling даёт партнёру обновления при открытой PWA. Web Push
// и Realtime — Phase 2 (см. TODOS.md). Для пары, которая часто открывает
// app, лаг ≤30s приемлем.
const ACTIVE_EPISODE_REFETCH_MS = 30_000;

/**
 * Query-фабрика для useQuery / prefetchQuery. Возвращает активный
 * (closed_at IS NULL) repair-эпизод текущей пары или null.
 *
 * RLS policy repair_episodes_select_couple ограничивает выборку couple_id =
 * current_couple_id(), partial unique index гарантирует ≤1 строку — поэтому
 * .maybeSingle() без явного where достаточен.
 */
export const createFetchActiveEpisodeQuery = () => ({
    queryKey: repairKeys.active(),
    queryFn: fetchActiveEpisode,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: ACTIVE_EPISODE_REFETCH_MS,
});

export async function fetchActiveEpisode(): Promise<RepairEpisode | null> {
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
        .from("repair_episodes")
        .select(REPAIR_EPISODE_COLUMNS)
        .is("closed_at", null)
        .maybeSingle<RepairEpisodeRow>();
    if (error) throw error;
    return data ? mapRepairEpisodeRow(data) : null;
}
