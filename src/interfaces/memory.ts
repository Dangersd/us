import type { MemoryMoodTag } from "~interfaces/calendar";

export interface MemoryOfTheDay {
    eventId: string;
    occurrenceDate: string;
    eventTitle: string;
    photoStoragePath: string;
    photoSignedUrl: string;
    caption: string | null;
    moodTag: MemoryMoodTag | null;
    note: string | null;
}
