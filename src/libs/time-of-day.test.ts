import { describe, expect, it } from "vitest";

import { daysSince, getTimeOfDay } from "~libs/time-of-day";

describe("getTimeOfDay", () => {
    it("classifies morning at 07:00 Bishkek", () => {
        // 01:00 UTC == 07:00 Asia/Bishkek
        const d = new Date(Date.UTC(2026, 4, 21, 1, 0));
        expect(getTimeOfDay(d, "Asia/Bishkek")).toBe("morning");
    });
    it("classifies day at 12:00 Bishkek", () => {
        const d = new Date(Date.UTC(2026, 4, 21, 6, 0));
        expect(getTimeOfDay(d, "Asia/Bishkek")).toBe("day");
    });
    it("classifies evening at 20:00 Bishkek", () => {
        const d = new Date(Date.UTC(2026, 4, 21, 14, 0));
        expect(getTimeOfDay(d, "Asia/Bishkek")).toBe("evening");
    });
    it("classifies night at 23:30 Bishkek", () => {
        const d = new Date(Date.UTC(2026, 4, 21, 17, 30));
        expect(getTimeOfDay(d, "Asia/Bishkek")).toBe("night");
    });
    it("classifies night at 03:00 Bishkek", () => {
        const d = new Date(Date.UTC(2026, 4, 21, 21, 0));
        expect(getTimeOfDay(d, "Asia/Bishkek")).toBe("night");
    });
});

describe("daysSince", () => {
    it("returns inclusive count between two dates", () => {
        expect(daysSince("2026-01-01", "2026-01-11")).toBe(10);
    });
    it("returns 0 for same day", () => {
        expect(daysSince("2026-05-21", "2026-05-21")).toBe(0);
    });
    it("returns null when start is null", () => {
        expect(daysSince(null, "2026-05-21")).toBeNull();
    });
    it("returns null when start is in the future", () => {
        expect(daysSince("2027-01-01", "2026-05-21")).toBeNull();
    });
    it("returns null on malformed input", () => {
        expect(daysSince("not-a-date", "2026-05-21")).toBeNull();
    });
});
