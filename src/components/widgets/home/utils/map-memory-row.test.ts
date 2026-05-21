import { describe, expect, it } from "vitest";

import {
    type MemoryOfDayRow,
    mapMemoryRow,
} from "~components/widgets/home/utils/map-memory-row";

function row(partial: Partial<MemoryOfDayRow> = {}): MemoryOfDayRow {
    return {
        event_id: "e1",
        occurrence_date: "2025-05-21",
        event_title: "Первая прогулка",
        storage_path: "couple/e1/p1.jpg",
        caption: null,
        note: null,
        mood_tag: null,
        ...partial,
    };
}

describe("mapMemoryRow", () => {
    it("maps row + signed url to MemoryOfTheDay", () => {
        const r = row({ note: "был дождь", mood_tag: "warm" });
        const m = mapMemoryRow(r, "https://signed/url");
        expect(m).toMatchObject({
            eventId: "e1",
            occurrenceDate: "2025-05-21",
            eventTitle: "Первая прогулка",
            photoStoragePath: "couple/e1/p1.jpg",
            photoSignedUrl: "https://signed/url",
            caption: null,
            note: "был дождь",
            moodTag: "warm",
        });
    });

    it("falls back to «Воспоминание» when title is null", () => {
        const m = mapMemoryRow(row({ event_title: null }), "url");
        expect(m.eventTitle).toBe("Воспоминание");
    });

    it("keeps caption + note independent", () => {
        const m = mapMemoryRow(row({ caption: "подпись", note: null }), "url");
        expect(m.caption).toBe("подпись");
        expect(m.note).toBeNull();
    });
});
