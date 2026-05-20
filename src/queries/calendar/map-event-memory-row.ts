import type { EventMemory, MemoryMoodTag } from "~interfaces/calendar";

export interface EventMemoryRow {
    id: string;
    event_id: string;
    occurrence_date: string;
    couple_id: string;
    created_by: string;
    mood_tag: MemoryMoodTag | null;
    note: string | null;
    recorded_at: string;
    created_at: string;
    updated_at: string;
}

export const EVENT_MEMORY_COLUMNS =
    "id, event_id, occurrence_date, couple_id, created_by, mood_tag, note, recorded_at, created_at, updated_at";

export function mapEventMemoryRow(row: EventMemoryRow): EventMemory {
    return {
        id: row.id,
        eventId: row.event_id,
        occurrenceDate: row.occurrence_date,
        coupleId: row.couple_id,
        createdBy: row.created_by,
        moodTag: row.mood_tag,
        note: row.note,
        recordedAt: row.recorded_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
