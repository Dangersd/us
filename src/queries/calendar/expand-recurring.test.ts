import { describe, expect, it } from "vitest";

import type { CalendarEvent } from "~interfaces/calendar";
import { expandEventsInRange } from "~queries/calendar/expand-recurring";

function baseEvent(overrides: Partial<CalendarEvent>): CalendarEvent {
    return {
        id: "ev-1",
        coupleId: "c-1",
        createdBy: "u-1",
        title: "Test",
        date: "2026-05-21",
        time: null,
        durationMinutes: null,
        location: null,
        category: "generic",
        note: null,
        state: "planned",
        source: "manual",
        isRecurring: false,
        recurrenceRule: null,
        recurrenceAnchorDate: null,
        reminderOffsets: [],
        createdAt: "2026-05-21T00:00:00Z",
        updatedAt: "2026-05-21T00:00:00Z",
        ...overrides,
    };
}

describe("expandEventsInRange — non-recurring", () => {
    it("emits event when in range", () => {
        const r = expandEventsInRange(
            [baseEvent({ date: "2026-05-21" })],
            { start: "2026-05-01", end: "2026-05-31" },
            "2026-05-21",
        );
        expect(r).toHaveLength(1);
        expect(r[0].occurrenceDate).toBe("2026-05-21");
        expect(r[0].occurrenceId).toBe("ev-1");
        expect(r[0].isVirtual).toBe(false);
    });

    it("excludes event outside range", () => {
        const r = expandEventsInRange(
            [baseEvent({ date: "2026-06-01" })],
            { start: "2026-05-01", end: "2026-05-31" },
            "2026-05-21",
        );
        expect(r).toHaveLength(0);
    });

    it("isPast true when date < today and not cancelled", () => {
        const r = expandEventsInRange(
            [baseEvent({ date: "2026-05-10" })],
            { start: "2026-05-01", end: "2026-05-31" },
            "2026-05-21",
        );
        expect(r[0].isPast).toBe(true);
    });

    it("isPast false when cancelled (cancelled wins)", () => {
        const r = expandEventsInRange(
            [baseEvent({ date: "2026-05-10", state: "cancelled" })],
            { start: "2026-05-01", end: "2026-05-31" },
            "2026-05-21",
        );
        expect(r[0].isPast).toBe(false);
    });
});

describe("expandEventsInRange — YEARLY", () => {
    it("expands across multiple years in range", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "YEARLY",
                    recurrenceAnchorDate: "2020-05-22",
                    date: "2020-05-22",
                }),
            ],
            { start: "2024-01-01", end: "2026-12-31" },
            "2026-05-21",
        );
        expect(r.map((o) => o.occurrenceDate)).toEqual([
            "2024-05-22",
            "2025-05-22",
            "2026-05-22",
        ]);
        expect(r[0].isVirtual).toBe(true);
        expect(r[0].occurrenceId).toBe("ev-1:2024-05-22");
    });

    it("yearsSinceAnchor computed correctly", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "YEARLY",
                    recurrenceAnchorDate: "2020-05-22",
                    date: "2020-05-22",
                }),
            ],
            { start: "2026-01-01", end: "2026-12-31" },
            "2026-05-21",
        );
        expect(r[0].yearsSinceAnchor).toBe(6);
    });

    it("Feb 29 anchor → Feb 28 in non-leap year", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "YEARLY",
                    recurrenceAnchorDate: "2020-02-29",
                    date: "2020-02-29",
                }),
            ],
            { start: "2025-01-01", end: "2025-12-31" },
            "2025-06-01",
        );
        expect(r).toHaveLength(1);
        expect(r[0].occurrenceDate).toBe("2025-02-28");
    });

    it("Feb 29 anchor → Feb 29 in leap year", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "YEARLY",
                    recurrenceAnchorDate: "2020-02-29",
                    date: "2020-02-29",
                }),
            ],
            { start: "2024-01-01", end: "2024-12-31" },
            "2024-06-01",
        );
        expect(r).toHaveLength(1);
        expect(r[0].occurrenceDate).toBe("2024-02-29");
    });

    it("no occurrences before anchor year", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "YEARLY",
                    recurrenceAnchorDate: "2024-05-22",
                    date: "2024-05-22",
                }),
            ],
            { start: "2020-01-01", end: "2026-12-31" },
            "2026-05-21",
        );
        expect(r.map((o) => o.occurrenceDate)).toEqual([
            "2024-05-22",
            "2025-05-22",
            "2026-05-22",
        ]);
    });
});

describe("expandEventsInRange — MONTHLY", () => {
    it("day-31 anchor clamps to last day in shorter months", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "MONTHLY",
                    recurrenceAnchorDate: "2026-01-31",
                    date: "2026-01-31",
                }),
            ],
            { start: "2026-01-01", end: "2026-04-30" },
            "2026-06-01",
        );
        expect(r.map((o) => o.occurrenceDate)).toEqual([
            "2026-01-31",
            "2026-02-28",
            "2026-03-31",
            "2026-04-30",
        ]);
    });

    it("emits monthly across year boundary", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "MONTHLY",
                    recurrenceAnchorDate: "2025-11-15",
                    date: "2025-11-15",
                }),
            ],
            { start: "2025-11-01", end: "2026-02-28" },
            "2026-06-01",
        );
        expect(r.map((o) => o.occurrenceDate)).toEqual([
            "2025-11-15",
            "2025-12-15",
            "2026-01-15",
            "2026-02-15",
        ]);
    });
});

describe("expandEventsInRange — defensive", () => {
    it("skips recurring event without anchor (constraint should prevent)", () => {
        const r = expandEventsInRange(
            [
                baseEvent({
                    isRecurring: true,
                    recurrenceRule: "YEARLY",
                    recurrenceAnchorDate: null,
                }),
            ],
            { start: "2026-01-01", end: "2026-12-31" },
            "2026-06-01",
        );
        expect(r).toHaveLength(0);
    });

    it("sorts by occurrenceDate then time then id", () => {
        const r = expandEventsInRange(
            [
                baseEvent({ id: "b", date: "2026-05-22", time: "10:00:00" }),
                baseEvent({ id: "a", date: "2026-05-21" }),
                baseEvent({ id: "c", date: "2026-05-22", time: "08:00:00" }),
            ],
            { start: "2026-05-01", end: "2026-05-31" },
            "2026-05-21",
        );
        expect(r.map((o) => o.id)).toEqual(["a", "c", "b"]);
    });
});
