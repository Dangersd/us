import type {
    EventCategory,
    MemoryMoodTag,
    ReminderOffset,
} from "~interfaces/calendar";

// =========================================================
// Категории событий — id (DB-enum), RU-label, цвет dot'а.
// Палитра из docs/02-design-system.md, room=calendar.
// =========================================================

export interface EventCategoryMeta {
    id: EventCategory;
    label: string;
    color: string; // hex для dot'а на карточке
}

export const EVENT_CATEGORIES: readonly EventCategoryMeta[] = [
    { id: "date", label: "свидание", color: "#FFC9A8" },
    { id: "dinner", label: "ужин", color: "#FFD580" },
    { id: "cinema", label: "кино", color: "#9B7EBD" },
    { id: "trip", label: "поездка", color: "#7FB3D5" },
    { id: "anniversary", label: "годовщина", color: "#F4A5B9" },
    { id: "birthday", label: "день рождения", color: "#FFE08A" },
    { id: "generic", label: "событие", color: "#BFB3A8" },
] as const;

export const EVENT_CATEGORY_BY_ID: Record<EventCategory, EventCategoryMeta> =
    Object.fromEntries(EVENT_CATEGORIES.map((c) => [c.id, c])) as Record<
        EventCategory,
        EventCategoryMeta
    >;

export const categoryLabel = (id: EventCategory): string =>
    EVENT_CATEGORY_BY_ID[id].label;

export const categoryColor = (id: EventCategory): string =>
    EVENT_CATEGORY_BY_ID[id].color;

// =========================================================
// Memory mood-tags — для past→Memory capture (Phase 0.6.5).
// =========================================================

export interface MemoryMoodTagMeta {
    id: MemoryMoodTag;
    label: string;
    color: string;
}

export const MEMORY_MOOD_TAGS: readonly MemoryMoodTagMeta[] = [
    { id: "warm", label: "тёплое", color: "#FFC9A8" },
    { id: "funny", label: "смешно", color: "#FFD580" },
    { id: "hard", label: "тяжело", color: "#9B8FAF" },
    { id: "magical", label: "волшебное", color: "#E8B4FF" },
] as const;

export const MEMORY_MOOD_TAG_BY_ID: Record<MemoryMoodTag, MemoryMoodTagMeta> =
    Object.fromEntries(MEMORY_MOOD_TAGS.map((t) => [t.id, t])) as Record<
        MemoryMoodTag,
        MemoryMoodTagMeta
    >;

export const memoryMoodLabel = (id: MemoryMoodTag): string =>
    MEMORY_MOOD_TAG_BY_ID[id].label;

// =========================================================
// Reminder offsets — UI chips «за 1 день», «за час», ...
// Хранятся в БД как массив literal-строк в reminder_offsets jsonb.
// MVP: только UI (доставки нет), warning над пикером.
// =========================================================

export interface ReminderOffsetMeta {
    id: ReminderOffset;
    label: string;
}

export const AVAILABLE_REMINDER_OFFSETS: readonly ReminderOffsetMeta[] = [
    { id: "15m", label: "за 15 минут" },
    { id: "1h", label: "за час" },
    { id: "2h", label: "за 2 часа" },
    { id: "1d", label: "за день" },
    { id: "2d", label: "за 2 дня" },
    { id: "1w", label: "за неделю" },
] as const;

export const DEFAULT_REMINDER_OFFSETS: readonly ReminderOffset[] = ["1d", "1h"];

export const reminderOffsetLabel = (id: ReminderOffset): string =>
    AVAILABLE_REMINDER_OFFSETS.find((r) => r.id === id)?.label ?? id;

// =========================================================
// Лимиты — отражают SQL check-constraints + storage policy.
// =========================================================

export const MAX_PHOTOS_PER_EVENT = 3;
export const MAX_IMAGE_DIMENSION = 1600;
export const MAX_EVENT_TITLE_LENGTH = 200;
export const MAX_EVENT_NOTE_LENGTH = 4000;
export const MAX_MEMORY_NOTE_LENGTH = 2000;
export const MAX_LOCATION_LENGTH = 200;
