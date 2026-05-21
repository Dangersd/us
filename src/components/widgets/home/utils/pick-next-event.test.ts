import { describe, expect, it } from "vitest";

import { pickNextEvent } from "~components/widgets/home/utils/pick-next-event";
import type { CalendarEventOccurrence } from "~interfaces/calendar";

function occ(
    partial: Partial<CalendarEventOccurrence>,
): CalendarEventOccurrence {
    return {
        id: "e1",
        coupleId: "c1",
        createdBy: "u1",
        title: "Event",
        date: "2026-05-21",
        time: null,
        durationMinutes: null,
        location: null,
        category: "generic",
        customCategoryLabel: null,
        note: null,
        state: "planned",
        source: "manual",
        isRecurring: false,
        recurrenceRule: null,
        recurrenceAnchorDate: null,
        reminderOffsets: [],
        createdAt: "2026-05-01",
        updatedAt: "2026-05-01",
        occurrenceId: "e1",
        occurrenceDate: "2026-05-21",
        isVirtual: false,
        isPast: false,
        yearsSinceAnchor: null,
        ...partial,
    };
}

describe("pickNextEvent", () => {
    it("returns null on empty input", () => {
        expect(pickNextEvent([], "2026-05-21")).toBeNull();
        expect(pickNextEvent(undefined, "2026-05-21")).toBeNull();
    });
    it("skips past occurrences", () => {
        const past = occ({ id: "p", occurrenceDate: "2026-05-20" });
        const future = occ({ id: "f", occurrenceDate: "2026-05-22" });
        expect(pickNextEvent([past, future], "2026-05-21")?.id).toBe("f");
    });
    it("includes today timed event when not yet passed", () => {
        const t = occ({
            id: "t",
            occurrenceDate: "2026-05-21",
            time: "10:00:00",
        });
        expect(pickNextEvent([t], "2026-05-21", "09:00")?.id).toBe("t");
    });
    it("skips today timed event that already passed", () => {
        const past = occ({
            id: "past",
            occurrenceDate: "2026-05-21",
            time: "09:00:00",
        });
        const future = occ({ id: "tmrw", occurrenceDate: "2026-05-22" });
        expect(pickNextEvent([past, future], "2026-05-21", "14:00")?.id).toBe(
            "tmrw",
        );
    });
    it("always includes today all-day event regardless of nowHHMM", () => {
        const allday = occ({
            id: "a",
            occurrenceDate: "2026-05-21",
            time: null,
        });
        expect(pickNextEvent([allday], "2026-05-21", "23:30")?.id).toBe("a");
    });
    it("skips cancelled", () => {
        const c = occ({
            id: "c",
            occurrenceDate: "2026-05-21",
            state: "cancelled",
        });
        const p = occ({ id: "p", occurrenceDate: "2026-05-22" });
        expect(pickNextEvent([c, p], "2026-05-21")?.id).toBe("p");
    });
    it("orders timed before all-day on same date", () => {
        const allday = occ({
            id: "a",
            occurrenceDate: "2026-05-22",
            time: null,
        });
        const timed = occ({
            id: "t",
            occurrenceDate: "2026-05-22",
            time: "09:00:00",
        });
        expect(pickNextEvent([allday, timed], "2026-05-21")?.id).toBe("t");
    });
    it("picks earliest among multiple future days", () => {
        const later = occ({ id: "l", occurrenceDate: "2026-06-01" });
        const sooner = occ({ id: "s", occurrenceDate: "2026-05-23" });
        expect(pickNextEvent([later, sooner], "2026-05-21")?.id).toBe("s");
    });
});
