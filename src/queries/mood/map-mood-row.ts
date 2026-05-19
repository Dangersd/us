import type { EmotionId, MoodEntry, Visibility } from "~interfaces/mood";

export interface MoodEntryRow {
    user_id: string;
    couple_id: string;
    date: string;
    energy: number | null;
    stress: number | null;
    social_battery: number | null;
    emotion: EmotionId | null;
    visibility: Visibility;
    created_at: string;
    updated_at: string;
}

export const MOOD_COLUMNS =
    "user_id, couple_id, date, energy, stress, social_battery, emotion, visibility, created_at, updated_at";

export function mapMoodRow(row: MoodEntryRow): MoodEntry {
    return {
        userId: row.user_id,
        coupleId: row.couple_id,
        date: row.date,
        energy: row.energy,
        stress: row.stress,
        socialBattery: row.social_battery,
        emotion: row.emotion,
        visibility: row.visibility,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
