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
    // Короткая поэтичная flavor-строка («что это значит»). В detail-модалке
    // отображается верхним блоком под заголовком.
    description: string;
    // Точное требование («как получить»). Должно соответствовать критерию
    // в evaluate_and_unlock_achievements() RPC. В detail-модалке отображается
    // ниже description.
    criterion: string;
    scope: AchievementScope;
    // false => звезда рендерится permanently locked, criterion не проверяется
    // в RPC (зарезервировано на v0.2 — например twelve_moons требует cycle-tracker).
    enabled: boolean;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
    {
        key: "first_moon",
        title: "Первая луна",
        description: "Начало пути в этом саду",
        criterion: "Сделать первый mood check-in",
        scope: "user",
        enabled: true,
    },
    {
        key: "parallel",
        title: "Параллель",
        description: "Линии, которые встретились",
        criterion: "Оба партнёра чекнулись в один день",
        scope: "couple",
        enabled: true,
    },
    {
        key: "hundred_days_acq",
        title: "Сто дней знакомства",
        description: "Сто дней с момента первой встречи",
        criterion: "Прошло 100 дней с даты знакомства",
        scope: "couple",
        enabled: true,
    },
    {
        key: "year_together",
        title: "Год вместе",
        description: "Один полный оборот вокруг солнца",
        criterion: "Прошёл год с начала отношений",
        scope: "couple",
        enabled: true,
    },
    {
        key: "first_plan",
        title: "Первый план",
        description: "Первая нить будущего",
        criterion: "Создать первое событие в календаре",
        scope: "couple",
        enabled: true,
    },
    {
        key: "wanderers",
        title: "Странники",
        description: "Места, которые остались с вами",
        criterion: "Побывать в 5 разных местах",
        scope: "couple",
        enabled: true,
    },
    {
        key: "keeper",
        title: "Хранитель",
        description: "Тридцать мгновений, которые не растаяли",
        criterion: "Сохранить 30 воспоминаний",
        scope: "couple",
        enabled: true,
    },
    {
        key: "alchemist",
        title: "Алхимик",
        description: "Список того, что превращается в счастье",
        criterion: "Добавить 50 предметов в wishlist",
        scope: "couple",
        enabled: true,
    },
    {
        key: "full_moon",
        title: "Полнолуние",
        description: "Тридцать лун в твоём журнале настроений",
        criterion: "Сделать 30 mood check-in'ов",
        scope: "user",
        enabled: true,
    },
    {
        key: "parallel_moods",
        title: "Параллельные настроения",
        description: "Семь дней общего течения",
        criterion: "7 дней с одинаковой эмоцией у обоих партнёров",
        scope: "couple",
        enabled: true,
    },
    {
        key: "sunrise",
        title: "Восход",
        description: "План на рассвет — редкая роскошь",
        criterion: "Создать событие на время до 12:00",
        scope: "couple",
        enabled: true,
    },
    {
        key: "postcard",
        title: "Открытка",
        description: "Первая фотография, прикреплённая к моменту",
        criterion: "Добавить фото к событию в календаре",
        scope: "couple",
        enabled: true,
    },
] as const;

// Map вместо plain object — защита от prototype-pollution. Плейн-объект
// возвращает Object.prototype при key === "__proto__" / "constructor",
// что прокидывает поддельный «catalog entry» дальше по стеку.
const ACHIEVEMENT_MAP: Map<string, AchievementDef> = new Map(
    ACHIEVEMENTS.map((a) => [a.key, a]),
);

export const ACHIEVEMENT_BY_KEY: ReadonlyMap<string, AchievementDef> =
    ACHIEVEMENT_MAP;

export const findAchievement = (key: string): AchievementDef | null =>
    ACHIEVEMENT_MAP.get(key) ?? null;
