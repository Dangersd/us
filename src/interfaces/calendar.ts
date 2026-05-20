// Domain-types для Calendar-домена.
// DB-shape (snake_case rows) живёт в ~queries/calendar/map-*-row.ts (Phase 0.6.2).

export type EventCategory =
    | "date"
    | "dinner"
    | "cinema"
    | "trip"
    | "anniversary"
    | "birthday"
    | "generic";

export type EventState = "planned" | "cancelled";

export type EventSource = "manual" | "birthday" | "anniversary";

export type RecurrenceRule = "YEARLY" | "MONTHLY";

export type MemoryMoodTag = "warm" | "funny" | "hard" | "magical";

export type ReminderOffset = "15m" | "1h" | "2h" | "1d" | "2d" | "1w";

export interface CalendarEvent {
    id: string;
    coupleId: string;
    createdBy: string;
    title: string;
    date: string; // YYYY-MM-DD, для recurring = anchor-эквивалент
    time: string | null; // HH:MM:SS
    durationMinutes: number | null;
    location: string | null;
    category: EventCategory;
    note: string | null;
    state: EventState;
    source: EventSource;
    isRecurring: boolean;
    recurrenceRule: RecurrenceRule | null;
    recurrenceAnchorDate: string | null; // YYYY-MM-DD
    reminderOffsets: ReminderOffset[];
    createdAt: string;
    updatedAt: string;
}

// Виртуальное «развёртывание» события на конкретную дату.
// Для non-recurring: occurrenceId = event.id, occurrenceDate = event.date.
// Для recurring: occurrenceId = `${event.id}:${occurrenceDate}`.
export interface CalendarEventOccurrence extends CalendarEvent {
    occurrenceId: string;
    occurrenceDate: string; // YYYY-MM-DD
    isVirtual: boolean;
    isPast: boolean;
    yearsSinceAnchor: number | null;
}

export interface EventIdea {
    id: string;
    coupleId: string;
    createdBy: string;
    title: string;
    note: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EventPhoto {
    id: string;
    eventId: string;
    coupleId: string;
    occurrenceDate: string; // YYYY-MM-DD
    storagePath: string;
    caption: string | null;
    moodTag: MemoryMoodTag | null;
    width: number | null;
    height: number | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventMemory {
    id: string;
    eventId: string;
    occurrenceDate: string;
    coupleId: string;
    createdBy: string;
    moodTag: MemoryMoodTag | null;
    note: string | null;
    recordedAt: string;
    createdAt: string;
    updatedAt: string;
}
