import { describe, expect, it } from "vitest";

import { mapCoupleStats } from "~queries/stats/map-couple-stats";

describe("mapCoupleStats", () => {
    it("returns empty stats for null input", () => {
        const out = mapCoupleStats(null);
        expect(out.topPlaces).toEqual([]);
        expect(out.topCategories).toEqual([]);
        expect(out.myTopEmotion).toBeNull();
        expect(out.partnerTopEmotion).toBeNull();
        expect(out.topWishlistCategory).toBeNull();
        expect(out.memoriesCount).toBe(0);
    });

    it("returns empty stats for undefined / non-object input", () => {
        expect(mapCoupleStats(undefined).memoriesCount).toBe(0);
        expect(mapCoupleStats(42).topPlaces).toEqual([]);
        expect(mapCoupleStats("nope").topCategories).toEqual([]);
    });

    it("maps a full happy-path payload", () => {
        const out = mapCoupleStats({
            topPlaces: [
                { name: "Бишкек", count: 12 },
                { name: "Алматы", count: 3 },
            ],
            topCategories: [{ category: "date", count: 7 }],
            myTopEmotion: "warm",
            partnerTopEmotion: "calm",
            topWishlistCategory: "experience",
            memoriesCount: 5,
        });
        expect(out.topPlaces).toEqual([
            { name: "Бишкек", count: 12 },
            { name: "Алматы", count: 3 },
        ]);
        expect(out.topCategories).toEqual([{ category: "date", count: 7 }]);
        expect(out.myTopEmotion).toBe("warm");
        expect(out.partnerTopEmotion).toBe("calm");
        expect(out.topWishlistCategory).toBe("experience");
        expect(out.memoriesCount).toBe(5);
    });

    it("strips unknown event categories", () => {
        const out = mapCoupleStats({
            topCategories: [
                { category: "date", count: 2 },
                { category: "not_a_category", count: 99 },
            ],
        });
        expect(out.topCategories).toEqual([{ category: "date", count: 2 }]);
    });

    it("strips unknown emotion / wishlist category strings", () => {
        const out = mapCoupleStats({
            myTopEmotion: "unknown_feeling",
            partnerTopEmotion: "warm",
            topWishlistCategory: "spaceship",
        });
        expect(out.myTopEmotion).toBeNull();
        expect(out.partnerTopEmotion).toBe("warm");
        expect(out.topWishlistCategory).toBeNull();
    });

    it("ignores malformed array entries (place without name, etc.)", () => {
        const out = mapCoupleStats({
            topPlaces: [
                { name: "Бишкек", count: 3 },
                { name: null, count: 5 },
                { count: 10 },
                "garbage",
                { name: "Алматы" },
            ],
        });
        expect(out.topPlaces).toEqual([{ name: "Бишкек", count: 3 }]);
    });

    it("coerces stringified counts via Number()", () => {
        const out = mapCoupleStats({
            memoriesCount: "42",
            topPlaces: [{ name: "X", count: "3" }],
        });
        expect(out.memoriesCount).toBe(42);
        expect(out.topPlaces).toEqual([{ name: "X", count: 3 }]);
    });

    it("returns 0 for non-finite memoriesCount", () => {
        expect(mapCoupleStats({ memoriesCount: NaN }).memoriesCount).toBe(0);
        expect(
            mapCoupleStats({ memoriesCount: "not-a-number" }).memoriesCount,
        ).toBe(0);
    });
});
