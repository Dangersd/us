import { describe, expect, it } from "vitest";

import { createFetchItemQuery } from "~queries/wishlist/fetch-item";
import { createFetchItemsQuery } from "~queries/wishlist/fetch-items";
import { createFetchItemsServerQuery } from "~queries/wishlist/fetch-items.server";
import { wishlistKeys } from "~queries/wishlist/keys";

describe("wishlist factories — queryKey shape", () => {
    const itemId = "item-xyz";
    const argsMe = { list: "want" as const, ownerId: "user-1" };
    const argsShared = { list: "shared" as const, ownerId: null };

    it("createFetchItemsQuery (owned)", () => {
        expect(createFetchItemsQuery(argsMe).queryKey).toEqual(
            wishlistKeys.itemsList(argsMe.list, argsMe.ownerId),
        );
    });

    it("createFetchItemsQuery (shared)", () => {
        expect(createFetchItemsQuery(argsShared).queryKey).toEqual(
            wishlistKeys.itemsList(argsShared.list, argsShared.ownerId),
        );
    });

    it("createFetchItemsServerQuery (owned)", () => {
        expect(createFetchItemsServerQuery(argsMe).queryKey).toEqual(
            wishlistKeys.itemsList(argsMe.list, argsMe.ownerId),
        );
    });

    it("createFetchItemQuery", () => {
        expect(createFetchItemQuery(itemId).queryKey).toEqual(
            wishlistKeys.itemById(itemId),
        );
    });
});
