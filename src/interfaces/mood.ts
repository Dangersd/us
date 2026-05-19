// Domain-types для Mood-домена.
// DB-shape (snake_case rows) живёт в ~queries/mood/map-mood-row.ts (Phase 0.5.2).

export type EmotionId =
    | "warm"
    | "calm"
    | "sad"
    | "anxious"
    | "joyful"
    | "tired"
    | "tender"
    | "empty";

export type VisibilityLevel = "full" | "vibe" | "hidden";

export interface Visibility {
    energy: VisibilityLevel;
    stress: VisibilityLevel;
    social_battery: VisibilityLevel;
    emotion: VisibilityLevel;
}

export interface MoodEntry {
    userId: string;
    coupleId: string;
    date: string; // YYYY-MM-DD
    energy: number | null; // 0–100
    stress: number | null;
    socialBattery: number | null;
    emotion: EmotionId | null;
    visibility: Visibility;
    createdAt: string;
    updatedAt: string;
}

// Vibe-bucket label — для рендера на «vibe» privacy-уровне.
// Mirrors SQL vibe_bucket() function — keep in sync with
// supabase/migrations/20260520000000_mood_entries.sql.
export type EnergyBucket = "drained" | "calm" | "energetic" | "fire";
export type StressBucket = "relaxed" | "neutral" | "tense" | "burning";
export type SocialBatteryBucket = "empty" | "low" | "open" | "full";

// UI-meta для каждой эмоции (RU-label + цвет для blob fill / glow).
export interface EmotionMeta {
    id: EmotionId;
    label: string;
    color: string; // hex
}
