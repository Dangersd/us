import type {
    EmotionId,
    EmotionMeta,
    EnergyBucket,
    SocialBatteryBucket,
    StressBucket,
    Visibility,
} from "~interfaces/mood";

// =========================================================
// 8 эмоций — id, RU-label, цвет blob'а.
// Цвета — приглушённые, в духе night-mode палитры.
// =========================================================

export const EMOTIONS: readonly EmotionMeta[] = [
    {
        id: "warm",
        labels: { male: "тёплый", female: "тёплая" },
        color: "#FFC9A8",
    },
    // Лиловый per docs/03-rooms/mood.md ("спокойствие → лиловый") + ambient
    // комнаты #E8B4FF. Софт-пастель того же семейства, что warm/tender.
    {
        id: "calm",
        labels: { male: "спокойный", female: "спокойная" },
        color: "#D8BAF0",
    },
    {
        id: "joyful",
        labels: { male: "радостный", female: "радостная" },
        color: "#FFD580",
    },
    {
        id: "tender",
        labels: { male: "нежный", female: "нежная" },
        color: "#F4A5B9",
    },
    {
        id: "tired",
        labels: { male: "уставший", female: "уставшая" },
        color: "#9B8FAF",
    },
    {
        id: "sad",
        labels: { male: "грустный", female: "грустная" },
        color: "#7E8DB5",
    },
    {
        id: "anxious",
        labels: { male: "тревожный", female: "тревожная" },
        color: "#C4856A",
    },
    {
        id: "empty",
        labels: { male: "опустошённый", female: "опустошённая" },
        color: "#6F6677",
    },
] as const;

export const EMOTION_BY_ID: Record<EmotionId, EmotionMeta> = Object.fromEntries(
    EMOTIONS.map((e) => [e.id, e]),
) as Record<EmotionId, EmotionMeta>;

// Резолвит лейбл с учётом гендера. Если gender не задан (или null) — берём
// male (page.tsx-fallback тоже считает unknown → him, см. mood/page.tsx).
export const emotionLabel = (
    id: EmotionId,
    gender: import("~interfaces/user").Gender | null | undefined,
): string => {
    const meta = EMOTION_BY_ID[id];
    return meta.labels[gender ?? "male"];
};

// =========================================================
// Privacy defaults — пока константа. Переедут в
// users.settings.mood_privacy_defaults когда появится
// Profile-UI для настройки defaults.
// Source: docs/04-privacy-and-notifications.md → Mood visibility defaults.
// =========================================================

export const DEFAULT_PRIVACY: Visibility = {
    energy: "vibe",
    stress: "vibe",
    social_battery: "full",
    emotion: "full",
};

// =========================================================
// Vibe-bucket label maps — для UI-рендера vibe-уровня.
// Mirrors SQL vibe_bucket() function in
// supabase/migrations/20260520000000_mood_entries.sql.
// =========================================================

export const ENERGY_LABELS: Record<EnergyBucket, string> = {
    drained: "опустошённость",
    calm: "спокойствие",
    energetic: "энергия",
    fire: "огонь",
};

export const STRESS_LABELS: Record<StressBucket, string> = {
    relaxed: "расслабленность",
    neutral: "нейтрально",
    tense: "напряжение",
    burning: "горит",
};

export const SOCIAL_BATTERY_LABELS: Record<SocialBatteryBucket, string> = {
    empty: "пусто",
    low: "тихо",
    open: "открыта к общению",
    full: "полностью",
};

// =========================================================
// Helpers: numeric 0..100 → bucket label (для рендера
// собственных значений на vibe-уровне в UI).
// IMPORTANT: thresholds (25/50/75) ДОЛЖНЫ совпадать с SQL
// vibe_bucket() в supabase/migrations/20260520000000_mood_entries.sql.
// При изменении — править оба источника.
// =========================================================

export const energyBucket = (value: number | null): EnergyBucket | null => {
    if (value == null) return null;
    if (value < 25) return "drained";
    if (value < 50) return "calm";
    if (value < 75) return "energetic";
    return "fire";
};

export const stressBucket = (value: number | null): StressBucket | null => {
    if (value == null) return null;
    if (value < 25) return "relaxed";
    if (value < 50) return "neutral";
    if (value < 75) return "tense";
    return "burning";
};

export const socialBatteryBucket = (
    value: number | null,
): SocialBatteryBucket | null => {
    if (value == null) return null;
    if (value < 25) return "empty";
    if (value < 50) return "low";
    if (value < 75) return "open";
    return "full";
};
