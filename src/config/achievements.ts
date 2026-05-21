// Achievements catalog — TS-источник правды. DB-сторона хранит только факт
// разлокировки (achievement_unlocks.key). Здесь — title/description/scope.
//
// Соответствие key ↔ criteria в evaluate_and_unlock_achievements() RPC
// (см. supabase/migrations/20260531000001_achievement_rpcs.sql). Изменение
// key требует и миграции (для существующих unlock-строк), и обновления RPC.

export type AchievementScope = "couple" | "user";

export interface AchievementDef {
    key: string;
    title: string;
    description: string;
    scope: AchievementScope;
    // false => звезда рендерится permanently locked, criterion не проверяется
    // в RPC (зарезервировано на v0.2 — например twelve_moons требует cycle-tracker).
    enabled: boolean;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
    {
        key: "first_moon",
        title: "Первая луна",
        description: "Первый mood check-in",
        scope: "user",
        enabled: true,
    },
    {
        key: "parallel",
        title: "Параллель",
        description: "Оба чекнулись в один день",
        scope: "couple",
        enabled: true,
    },
    {
        key: "hundred_days_acq",
        title: "Сто дней знакомства",
        description: "100 дней с тех пор как познакомились",
        scope: "couple",
        enabled: true,
    },
    {
        key: "year_together",
        title: "Год вместе",
        description: "Год отношений",
        scope: "couple",
        enabled: true,
    },
    {
        key: "first_plan",
        title: "Первый план",
        description: "Первое событие в календаре",
        scope: "couple",
        enabled: true,
    },
    {
        key: "wanderers",
        title: "Странники",
        description: "Побывали в 5 разных местах",
        scope: "couple",
        enabled: true,
    },
    {
        key: "keeper",
        title: "Хранитель",
        description: "30 отмеченных воспоминаний",
        scope: "couple",
        enabled: true,
    },
    {
        key: "alchemist",
        title: "Алхимик",
        description: "50 предметов в wishlist'е",
        scope: "couple",
        enabled: true,
    },
    {
        key: "full_moon",
        title: "Полнолуние",
        description: "30 mood check-in'ов",
        scope: "user",
        enabled: true,
    },
    {
        key: "parallel_moods",
        title: "Параллельные настроения",
        description: "7 дней одинаковая эмоция у обоих",
        scope: "couple",
        enabled: true,
    },
    {
        key: "sunrise",
        title: "Восход",
        description: "Первый совместный план до полудня",
        scope: "couple",
        enabled: true,
    },
    {
        key: "twelve_moons",
        title: "Двенадцать лун",
        description: "12 циклов отслежено (v0.2)",
        scope: "user",
        enabled: false,
    },
] as const;

export const ACHIEVEMENT_BY_KEY: Record<string, AchievementDef> =
    Object.fromEntries(ACHIEVEMENTS.map((a) => [a.key, a]));

export const findAchievement = (key: string): AchievementDef | null =>
    ACHIEVEMENT_BY_KEY[key] ?? null;
