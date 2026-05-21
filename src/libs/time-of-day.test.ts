import { describe, expect, it } from "vitest";

import { daysSince, getTimeOfDay } from "~libs/time-of-day";

// Helper: Bishkek wall-clock hour `bishkekHour` соответствует UTC = hour-6.
function bishkek(hour: number, minute = 0): Date {
    return new Date(Date.UTC(2026, 4, 21, hour - 6, minute));
}

describe("getTimeOfDay", () => {
    // Mid-band sanity
    it("classifies morning at 07:00 Bishkek", () => {
        expect(getTimeOfDay(bishkek(7), "Asia/Bishkek")).toBe("morning");
    });
    it("classifies day at 12:00 Bishkek", () => {
        expect(getTimeOfDay(bishkek(12), "Asia/Bishkek")).toBe("day");
    });
    it("classifies evening at 20:00 Bishkek", () => {
        expect(getTimeOfDay(bishkek(20), "Asia/Bishkek")).toBe("evening");
    });
    it("classifies night at 23:30 Bishkek", () => {
        expect(getTimeOfDay(bishkek(23, 30), "Asia/Bishkek")).toBe("night");
    });
    it("classifies night at 03:00 Bishkek", () => {
        expect(getTimeOfDay(bishkek(3), "Asia/Bishkek")).toBe("night");
    });

    // Boundaries — каждая граница 5/11/18/23 явно зафиксирована.
    it("04:59 still night", () => {
        expect(getTimeOfDay(bishkek(4, 59), "Asia/Bishkek")).toBe("night");
    });
    it("05:00 morning", () => {
        expect(getTimeOfDay(bishkek(5, 0), "Asia/Bishkek")).toBe("morning");
    });
    it("10:59 morning", () => {
        expect(getTimeOfDay(bishkek(10, 59), "Asia/Bishkek")).toBe("morning");
    });
    it("11:00 day", () => {
        expect(getTimeOfDay(bishkek(11, 0), "Asia/Bishkek")).toBe("day");
    });
    it("17:59 day", () => {
        expect(getTimeOfDay(bishkek(17, 59), "Asia/Bishkek")).toBe("day");
    });
    it("18:00 evening", () => {
        expect(getTimeOfDay(bishkek(18, 0), "Asia/Bishkek")).toBe("evening");
    });
    it("22:59 evening", () => {
        expect(getTimeOfDay(bishkek(22, 59), "Asia/Bishkek")).toBe("evening");
    });
    it("23:00 night", () => {
        expect(getTimeOfDay(bishkek(23, 0), "Asia/Bishkek")).toBe("night");
    });
    it("00:00 night (post-midnight)", () => {
        expect(getTimeOfDay(bishkek(0, 0), "Asia/Bishkek")).toBe("night");
    });
});

describe("daysSince", () => {
    it("returns inclusive count between two dates", () => {
        expect(daysSince("2026-01-01", "2026-01-11")).toBe(10);
    });
    it("returns 0 for same day", () => {
        expect(daysSince("2026-05-21", "2026-05-21")).toBe(0);
    });
    it("crosses year boundary correctly", () => {
        expect(daysSince("2025-12-31", "2026-01-01")).toBe(1);
    });
    it("handles leap-day arithmetic", () => {
        // 2024 високосный. Feb 28 → Mar 1 = 2 дня (28→29→1).
        expect(daysSince("2024-02-28", "2024-03-01")).toBe(2);
    });
    it("returns null when start is null", () => {
        expect(daysSince(null, "2026-05-21")).toBeNull();
    });
    it("returns null when start is empty string", () => {
        expect(daysSince("", "2026-05-21")).toBeNull();
    });
    it("returns null when start is in the future", () => {
        expect(daysSince("2027-01-01", "2026-05-21")).toBeNull();
    });
    it("returns null on malformed start", () => {
        expect(daysSince("not-a-date", "2026-05-21")).toBeNull();
    });
    it("returns null on malformed today (symmetric validation)", () => {
        expect(daysSince("2026-05-21", "garbage")).toBeNull();
    });
    it("returns null on poison ISO-like inputs", () => {
        expect(daysSince("0000-00-00", "2026-05-21")).toBeNull();
    });
});
