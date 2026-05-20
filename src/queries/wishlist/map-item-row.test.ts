import { describe, expect, it } from "vitest";

import {
    type WishlistItemRow,
    mapWishlistItemRow,
} from "~queries/wishlist/map-item-row";

function baseRow(overrides: Partial<WishlistItemRow> = {}): WishlistItemRow {
    return {
        id: "w-1",
        couple_id: "c-1",
        created_by: "u-1",
        owner_id: "u-1",
        list: "want",
        title: "Чай Сангурьян",
        image_url: null,
        category: "food",
        price_estimate: null,
        link_url: null,
        note: null,
        priority: "want",
        created_at: "2026-05-21T00:00:00Z",
        updated_at: "2026-05-21T00:00:00Z",
        ...overrides,
    };
}

describe("mapWishlistItemRow", () => {
    it("maps personal-list row with owner_id set", () => {
        const m = mapWishlistItemRow(
            baseRow({ list: "love", owner_id: "u-2" }),
        );
        expect(m.list).toBe("love");
        expect(m.ownerId).toBe("u-2");
    });

    it("maps shared-list row with owner_id null", () => {
        const m = mapWishlistItemRow(
            baseRow({ list: "shared", owner_id: null }),
        );
        expect(m.list).toBe("shared");
        expect(m.ownerId).toBeNull();
    });

    it("maps all priority enum values", () => {
        const someday = mapWishlistItemRow(baseRow({ priority: "someday" }));
        const want = mapWishlistItemRow(baseRow({ priority: "want" }));
        const really = mapWishlistItemRow(baseRow({ priority: "really_want" }));
        expect(someday.priority).toBe("someday");
        expect(want.priority).toBe("want");
        expect(really.priority).toBe("really_want");
    });

    it("maps all 8 category enum values", () => {
        const cats = [
            "clothing",
            "fragrance",
            "books",
            "home",
            "food",
            "experience",
            "travel",
            "other",
        ] as const;
        for (const cat of cats) {
            const m = mapWishlistItemRow(baseRow({ category: cat }));
            expect(m.category).toBe(cat);
        }
    });

    it("maps null image_url and link_url through", () => {
        const m = mapWishlistItemRow(
            baseRow({ image_url: null, link_url: null }),
        );
        expect(m.imageUrl).toBeNull();
        expect(m.linkUrl).toBeNull();
    });

    it("maps non-null image_url and link_url through", () => {
        const m = mapWishlistItemRow(
            baseRow({
                image_url: "https://x/img.jpg",
                link_url: "https://shop/p/1",
            }),
        );
        expect(m.imageUrl).toBe("https://x/img.jpg");
        expect(m.linkUrl).toBe("https://shop/p/1");
    });

    it("maps optional price_estimate and note", () => {
        const m1 = mapWishlistItemRow(
            baseRow({ price_estimate: "12 000 ₽", note: "очень хочу" }),
        );
        expect(m1.priceEstimate).toBe("12 000 ₽");
        expect(m1.note).toBe("очень хочу");

        const m2 = mapWishlistItemRow(
            baseRow({ price_estimate: null, note: null }),
        );
        expect(m2.priceEstimate).toBeNull();
        expect(m2.note).toBeNull();
    });

    it("preserves coupleId and createdBy", () => {
        const m = mapWishlistItemRow(
            baseRow({ couple_id: "couple-77", created_by: "user-42" }),
        );
        expect(m.coupleId).toBe("couple-77");
        expect(m.createdBy).toBe("user-42");
    });
});
