import type { MemoryMoodTag } from "~interfaces/calendar";
import type { MemoryOfTheDay } from "~interfaces/memory";

// Shape one row of fetch_memory_of_the_day RPC. RLS-guarded join выполняется
// в Postgres (см. supabase/migrations/.../memory_of_the_day_rpc.sql).
export interface MemoryOfDayRow {
    event_id: string;
    occurrence_date: string;
    event_title: string | null;
    storage_path: string;
    caption: string | null;
    note: string | null;
    mood_tag: MemoryMoodTag | null;
}

export function mapMemoryRow(
    row: MemoryOfDayRow,
    signedUrl: string,
): MemoryOfTheDay {
    return {
        eventId: row.event_id,
        occurrenceDate: row.occurrence_date,
        eventTitle: row.event_title ?? "Воспоминание",
        photoStoragePath: row.storage_path,
        photoSignedUrl: signedUrl,
        caption: row.caption,
        moodTag: row.mood_tag,
        note: row.note,
    };
}
