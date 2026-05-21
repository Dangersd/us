import type { AchievementScope } from "~config/achievements";

// Возвращаемая строка из get_couple_achievements() RPC.
export interface AchievementUnlock {
    key: string;
    scope: AchievementScope;
    unlockedByUserId: string | null;
    unlockedAt: string; // ISO timestamp
}

// Что возвращает evaluate_and_unlock_achievements() mutation —
// только новоразблокированные. unlockedAt не нужен (toast/UI его не используют).
export interface NewlyUnlocked {
    key: string;
    scope: AchievementScope;
    unlockedByUserId: string | null;
}
