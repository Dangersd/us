import type {
    CalendarEvent,
    EventCategory,
    EventSource,
    EventState,
    RecurrenceRule,
    ReminderOffset,
} from "~interfaces/calendar";

export interface CalendarEventRow {
    id: string;
    couple_id: string;
    created_by: string;
    title: string;
    date: string;
    time: string | null;
    duration_minutes: number | null;
    location: string | null;
    category: EventCategory;
    note: string | null;
    state: EventState;
    source: EventSource;
    is_recurring: boolean;
    recurrence_rule: RecurrenceRule | null;
    recurrence_anchor_date: string | null;
    reminder_offsets: ReminderOffset[];
    created_at: string;
    updated_at: string;
}

export const CALENDAR_EVENT_COLUMNS =
    'id, couple_id, created_by, title, date, "time", duration_minutes, location, category, note, state, source, is_recurring, recurrence_rule, recurrence_anchor_date, reminder_offsets, created_at, updated_at';

export function mapCalendarEventRow(row: CalendarEventRow): CalendarEvent {
    return {
        id: row.id,
        coupleId: row.couple_id,
        createdBy: row.created_by,
        title: row.title,
        date: row.date,
        time: row.time,
        durationMinutes: row.duration_minutes,
        location: row.location,
        category: row.category,
        note: row.note,
        state: row.state,
        source: row.source,
        isRecurring: row.is_recurring,
        recurrenceRule: row.recurrence_rule,
        recurrenceAnchorDate: row.recurrence_anchor_date,
        reminderOffsets: row.reminder_offsets ?? [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
