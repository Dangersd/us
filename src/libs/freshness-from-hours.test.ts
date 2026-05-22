import { describe, expect, it } from "vitest";

import { freshnessFromHours } from "~libs/freshness-from-hours";

describe("freshnessFromHours", () => {
    it("returns 0.5 для null (нет mood сегодня)", () => {
        expect(freshnessFromHours(null)).toBe(0.5);
    });

    it("возвращает 1.0 в свежем окне [0, 6] часов", () => {
        expect(freshnessFromHours(0)).toBe(1);
        expect(freshnessFromHours(3)).toBe(1);
        expect(freshnessFromHours(6)).toBe(1);
    });

    it("линейно спадает от 1.0 в окне [6, 24] до пересечения с floor", () => {
        // 1 - (16-6)/40 = 0.75
        expect(freshnessFromHours(16)).toBeCloseTo(0.75, 5);
        // 1 - (24-6)/40 = 0.55 — ровно на floor
        expect(freshnessFromHours(24)).toBeCloseTo(0.55, 5);
    });

    it("упирается в floor 0.55 после пересечения с прямой", () => {
        // raw формула даёт 0.5 на 26ч; floor возвращает 0.55
        expect(freshnessFromHours(26)).toBe(0.55);
        expect(freshnessFromHours(46)).toBe(0.55);
        expect(freshnessFromHours(100)).toBe(0.55);
        expect(freshnessFromHours(10_000)).toBe(0.55);
    });
});
