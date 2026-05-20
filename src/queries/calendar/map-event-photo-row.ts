import type { EventPhoto, MemoryMoodTag } from "~interfaces/calendar";

export interface EventPhotoRow {
    id: string;
    event_id: string;
    couple_id: string;
    occurrence_date: string;
    storage_path: string;
    caption: string | null;
    mood_tag: MemoryMoodTag | null;
    width: number | null;
    height: number | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export const EVENT_PHOTO_COLUMNS =
    "id, event_id, couple_id, occurrence_date, storage_path, caption, mood_tag, width, height, created_by, created_at, updated_at";

export function mapEventPhotoRow(row: EventPhotoRow): EventPhoto {
    return {
        id: row.id,
        eventId: row.event_id,
        coupleId: row.couple_id,
        occurrenceDate: row.occurrence_date,
        storagePath: row.storage_path,
        caption: row.caption,
        moodTag: row.mood_tag,
        width: row.width,
        height: row.height,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
