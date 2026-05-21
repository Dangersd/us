import { describe, expect, it } from "vitest";

import { daysBetween } from "~libs/days-counter";

describe("daysBetween", () => {
    it("returns 0 when from is null", () => {
        expect(daysBetween(null, "2026-05-21")).toBe(0);
    });

    it("returns 0 when from is undefined", () => {
        expect(daysBetween(undefined, "2026-05-21")).toBe(0);
    });

    it("returns 0 for invalid from string", () => {
        expect(daysBetween("not-a-date", "2026-05-21")).toBe(0);
        expect(daysBetween("2026/05/21", "2026-05-21")).toBe(0);
    });

    it("returns 0 for empty from string", () => {
        expect(daysBetween("", "2026-05-21")).toBe(0);
    });

    it("returns 0 for invalid today string", () => {
        expect(daysBetween("2026-05-21", "garbage")).toBe(0);
    });

    it("returns 0 on the same day", () => {
        expect(daysBetween("2026-05-21", "2026-05-21")).toBe(0);
    });

    it("returns 0 (not negative) when from is in the future", () => {
        expect(daysBetween("2026-06-01", "2026-05-21")).toBe(0);
    });

    it("counts plain day diffs", () => {
        expect(daysBetween("2026-05-20", "2026-05-21")).toBe(1);
        expect(daysBetween("2026-05-14", "2026-05-21")).toBe(7);
    });

    it("handles month boundary", () => {
        expect(daysBetween("2026-04-30", "2026-05-01")).toBe(1);
    });

    it("handles year boundary", () => {
        expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
    });

    it("handles leap-year boundary (Feb 29 → Mar 1)", () => {
        // 2024 високосный
        expect(daysBetween("2024-02-29", "2024-03-01")).toBe(1);
    });

    it("counts a full year (non-leap)", () => {
        expect(daysBetween("2025-05-21", "2026-05-21")).toBe(365);
    });

    it("counts a full year crossing leap day", () => {
        // 2024 високосный → 2024-02-28 + 366 = 2025-03-01? Нет: + 365 = 2025-02-27
        // Корректнее: считаем дни от 2024-02-29 до 2025-02-28 = 365.
        expect(daysBetween("2024-02-29", "2025-02-28")).toBe(365);
    });
});
