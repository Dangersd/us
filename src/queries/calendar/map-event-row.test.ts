import { describe, expect, it } from "vitest";

import {
    type CalendarEventRow,
    mapCalendarEventRow,
} from "~queries/calendar/map-event-row";

function baseRow(overrides: Partial<CalendarEventRow>): CalendarEventRow {
    return {
        id: "ev-1",
        couple_id: "c-1",
        created_by: "u-1",
        title: "Test",
        date: "2026-05-21",
        time: null,
        duration_minutes: null,
        location: null,
        category: "generic",
        custom_category_label: null,
        note: null,
        state: "planned",
        source: "manual",
        is_recurring: false,
        recurrence_rule: null,
        recurrence_anchor_date: null,
        reminder_offsets: [],
        created_at: "2026-05-21T00:00:00Z",
        updated_at: "2026-05-21T00:00:00Z",
        ...overrides,
    };
}

describe("mapCalendarEventRow", () => {
    it("maps custom_category_label=null to customCategoryLabel=null", () => {
        const mapped = mapCalendarEventRow(
            baseRow({ custom_category_label: null }),
        );
        expect(mapped.customCategoryLabel).toBeNull();
    });

    it("maps custom_category_label string through", () => {
        const mapped = mapCalendarEventRow(
            baseRow({ custom_category_label: "йога" }),
        );
        expect(mapped.customCategoryLabel).toBe("йога");
    });
});
