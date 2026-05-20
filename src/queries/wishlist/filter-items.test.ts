import { describe, expect, it } from "vitest";

import type { WishlistCategory, WishlistItem } from "~interfaces/wishlist";
import { filterItems } from "~queries/wishlist/filter-items";

function item(
    overrides: Partial<WishlistItem> & { id: string; title: string },
): WishlistItem {
    return {
        coupleId: "c-1",
        createdBy: "u-1",
        ownerId: "u-1",
        list: "want",
        imageUrl: null,
        category: "other",
        priceEstimate: null,
        linkUrl: null,
        note: null,
        priority: "want",
        createdAt: "2026-05-21T00:00:00Z",
        updatedAt: "2026-05-21T00:00:00Z",
        ...overrides,
    };
}

const items: WishlistItem[] = [
    item({ id: "1", title: "Куртка", category: "clothing" }),
    item({
        id: "2",
        title: "Парфюм Замб",
        category: "fragrance",
        note: "очень хочу",
    }),
    item({ id: "3", title: "Книга Достоевского", category: "books" }),
    item({ id: "4", title: "Поездка в Тбилиси", category: "travel" }),
    item({ id: "5", title: "Дом-чай", category: "food" }),
];

describe("filterItems", () => {
    it("returns everything when no filter", () => {
        const out = filterItems(items, { categories: [], search: "" });
        expect(out).toHaveLength(5);
    });

    it("filters by single category", () => {
        const out = filterItems(items, {
            categories: ["fragrance"],
            search: "",
        });
        expect(out).toHaveLength(1);
        expect(out[0]!.id).toBe("2");
    });

    it("filters by multiple categories (OR semantics)", () => {
        const out = filterItems(items, {
            categories: ["clothing", "books"] as WishlistCategory[],
            search: "",
        });
        expect(out.map((x) => x.id).sort()).toEqual(["1", "3"]);
    });

    it("filters by search in title (case-insensitive)", () => {
        const out = filterItems(items, { categories: [], search: "ПАРФ" });
        expect(out).toHaveLength(1);
        expect(out[0]!.id).toBe("2");
    });

    it("filters by search in note", () => {
        const out = filterItems(items, {
            categories: [],
            search: "очень хочу",
        });
        expect(out).toHaveLength(1);
        expect(out[0]!.id).toBe("2");
    });

    it("trims whitespace from search", () => {
        const out = filterItems(items, {
            categories: [],
            search: "   куртка   ",
        });
        expect(out).toHaveLength(1);
        expect(out[0]!.id).toBe("1");
    });

    it("returns empty array when search has no match", () => {
        const out = filterItems(items, { categories: [], search: "zzzzz" });
        expect(out).toEqual([]);
    });

    it("applies category AND search together", () => {
        const out = filterItems(items, {
            categories: ["fragrance"],
            search: "Парфюм",
        });
        expect(out).toHaveLength(1);
        expect(out[0]!.id).toBe("2");

        const none = filterItems(items, {
            categories: ["clothing"],
            search: "Парфюм",
        });
        expect(none).toEqual([]);
    });

    it("handles items with null note", () => {
        const filtered = filterItems(items, {
            categories: [],
            search: "тбилиси",
        });
        expect(filtered).toHaveLength(1);
        expect(filtered[0]!.id).toBe("4");
    });
});
