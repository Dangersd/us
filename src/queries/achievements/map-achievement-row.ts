import { type AchievementScope, findAchievement } from "~config/achievements";
import type { AchievementUnlock } from "~interfaces/achievements";

// Сырой row из RPC возвращается как PostgREST JSON (snake_case).
export interface AchievementUnlockRow {
    key: string;
    scope: string;
    unlocked_by_user_id: string | null;
    unlocked_at: string;
}

// Маппит и фильтрует drift: unknown key (катог удалили, DB-row пережил)
// возвращает null → caller отбрасывает. UI рендерит только known keys.
export function mapAchievementRow(
    row: AchievementUnlockRow,
): AchievementUnlock | null {
    if (!findAchievement(row.key)) return null;
    if (row.scope !== "couple" && row.scope !== "user") return null;
    return {
        key: row.key,
        scope: row.scope as AchievementScope,
        unlockedByUserId: row.unlocked_by_user_id,
        unlockedAt: row.unlocked_at,
    };
}

export function mapAchievementRows(
    rows: AchievementUnlockRow[],
): AchievementUnlock[] {
    return rows
        .map(mapAchievementRow)
        .filter((u): u is AchievementUnlock => u !== null);
}
