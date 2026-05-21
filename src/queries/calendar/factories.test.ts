import { describe, expect, it } from "vitest";

import { createFetchEventQuery } from "~queries/calendar/fetch-event";
import { createFetchEventMemoryQuery } from "~queries/calendar/fetch-event-memory";
import { createFetchEventPhotosQuery } from "~queries/calendar/fetch-event-photos";
import { createFetchEventServerQuery } from "~queries/calendar/fetch-event.server";
import { createFetchEventsRangeQuery } from "~queries/calendar/fetch-events-range";
import { createFetchEventsRangeServerQuery } from "~queries/calendar/fetch-events-range.server";
import { createFetchIdeasQuery } from "~queries/calendar/fetch-ideas";
import { createFetchIdeasServerQuery } from "~queries/calendar/fetch-ideas.server";
import { calendarKeys } from "~queries/calendar/keys";

describe("calendar factories — queryKey shape", () => {
    const range = { start: "2026-05-18", end: "2026-05-24" };
    const today = "2026-05-21";
    const eventId = "evt-abc";
    const occurrenceDate = "2026-05-21";

    it("createFetchEventsRangeQuery", () => {
        expect(createFetchEventsRangeQuery(range, today).queryKey).toEqual(
            calendarKeys.eventsRange(range.start, range.end),
        );
    });

    it("createFetchEventsRangeServerQuery", () => {
        expect(
            createFetchEventsRangeServerQuery(range, today).queryKey,
        ).toEqual(calendarKeys.eventsRange(range.start, range.end));
    });

    it("createFetchEventQuery", () => {
        expect(createFetchEventQuery(eventId).queryKey).toEqual(
            calendarKeys.eventById(eventId),
        );
    });

    it("createFetchEventServerQuery", () => {
        expect(createFetchEventServerQuery(eventId).queryKey).toEqual(
            calendarKeys.eventById(eventId),
        );
    });

    it("createFetchIdeasQuery", () => {
        expect(createFetchIdeasQuery().queryKey).toEqual(calendarKeys.ideas());
    });

    it("createFetchIdeasServerQuery", () => {
        expect(createFetchIdeasServerQuery().queryKey).toEqual(
            calendarKeys.ideas(),
        );
    });

    it("createFetchEventMemoryQuery", () => {
        expect(
            createFetchEventMemoryQuery(eventId, occurrenceDate).queryKey,
        ).toEqual(calendarKeys.eventMemory(eventId, occurrenceDate));
    });

    it("createFetchEventPhotosQuery", () => {
        expect(
            createFetchEventPhotosQuery(eventId, occurrenceDate).queryKey,
        ).toEqual(calendarKeys.eventPhotos(eventId, occurrenceDate));
    });
});
