import type { EventIdea } from "~interfaces/calendar";

export interface EventIdeaRow {
    id: string;
    couple_id: string;
    created_by: string;
    title: string;
    note: string | null;
    created_at: string;
    updated_at: string;
}

export const EVENT_IDEA_COLUMNS =
    "id, couple_id, created_by, title, note, created_at, updated_at";

export function mapEventIdeaRow(row: EventIdeaRow): EventIdea {
    return {
        id: row.id,
        coupleId: row.couple_id,
        createdBy: row.created_by,
        title: row.title,
        note: row.note,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
