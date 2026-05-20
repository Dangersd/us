// Browser-safe экспорты query-слоя calendar.
// fetch*Server явно импортируются из *.server.ts чтобы случайно не утащить
// next/headers / server-only в client bundle.
export {
    expandEventsInRange,
    type DateRange,
} from "~queries/calendar/expand-recurring";
export { fetchEvent } from "~queries/calendar/fetch-event";
export { fetchEventMemory } from "~queries/calendar/fetch-event-memory";
export { fetchEventPhotos } from "~queries/calendar/fetch-event-photos";
export { fetchEventsRange } from "~queries/calendar/fetch-events-range";
export { fetchIdeas } from "~queries/calendar/fetch-ideas";
export { calendarKeys } from "~queries/calendar/keys";
export {
    CALENDAR_EVENT_COLUMNS,
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";
export {
    EVENT_IDEA_COLUMNS,
    type EventIdeaRow,
    mapEventIdeaRow,
} from "~queries/calendar/map-idea-row";
export {
    EVENT_MEMORY_COLUMNS,
    type EventMemoryRow,
    mapEventMemoryRow,
} from "~queries/calendar/map-event-memory-row";
export {
    EVENT_PHOTO_COLUMNS,
    type EventPhotoRow,
    mapEventPhotoRow,
} from "~queries/calendar/map-event-photo-row";
export { useEvent } from "~queries/calendar/use-event";
export { useEventMemory } from "~queries/calendar/use-event-memory";
export { useEventPhotos } from "~queries/calendar/use-event-photos";
export { useEventsRange } from "~queries/calendar/use-events-range";
export { useIdeas } from "~queries/calendar/use-ideas";
