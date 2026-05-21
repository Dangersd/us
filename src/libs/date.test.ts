import { describe, expect, it } from "vitest";

import { formatRuFullDate } from "~libs/date";

describe("formatRuFullDate", () => {
    it("returns null for null input", () => {
        expect(formatRuFullDate(null)).toBeNull();
    });

    it("formats canonical ISO date in genitive case", () => {
        expect(formatRuFullDate("2024-05-13")).toBe("13 мая 2024");
    });

    it("strips leading zero on day", () => {
        expect(formatRuFullDate("2024-05-03")).toBe("3 мая 2024");
    });

    it("handles January (monthIdx 0)", () => {
        expect(formatRuFullDate("2024-01-01")).toBe("1 января 2024");
    });

    it("handles December (monthIdx 11)", () => {
        expect(formatRuFullDate("2024-12-31")).toBe("31 декабря 2024");
    });

    it("returns input unchanged on invalid format", () => {
        expect(formatRuFullDate("2024/05/13")).toBe("2024/05/13");
        expect(formatRuFullDate("garbage")).toBe("garbage");
    });
});
