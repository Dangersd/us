// React Query keys для calendar-домена.
// kind = queryKey[1] — predicate-based invalidation в use-upsert-event /
// use-promote-idea читает этот сегмент (см. C2 fix паттерн из mood/0.5.6).
export const calendarKeys = {
    all: ["calendar"] as const,
    eventsRange: (start: string, end: string) =>
        [...calendarKeys.all, "events-range", start, end] as const,
    eventById: (id: string) => [...calendarKeys.all, "event", id] as const,
    ideas: () => [...calendarKeys.all, "ideas"] as const,
    eventPhotos: (eventId: string, occurrenceDate: string) =>
        [...calendarKeys.all, "event-photos", eventId, occurrenceDate] as const,
    eventMemory: (eventId: string, occurrenceDate: string) =>
        [...calendarKeys.all, "event-memory", eventId, occurrenceDate] as const,
};
