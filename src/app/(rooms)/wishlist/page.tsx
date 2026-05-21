import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import WishlistClientPage from "~app/(rooms)/wishlist/WishlistClientPage";
import { WISHLIST_TAB_PARAM } from "~config/routes";
import { WISHLIST_TAB_BY_ID, type WishlistTabId } from "~config/wishlist";
import { makeQueryClient } from "~libs/react-query/query-client";
import {
    createFetchPartnerProfileServerQuery,
    fetchPartnerProfileServer,
} from "~queries/profile/fetch-partner-profile.server";
import {
    createFetchCurrentUserServerQuery,
    fetchCurrentUserServer,
} from "~queries/user/fetch-current-user.server";
import { createFetchItemsServerQuery } from "~queries/wishlist/fetch-items.server";

interface WishlistPageProps {
    searchParams: Promise<{ tab?: string }>;
}

function parseTab(raw: string | undefined): WishlistTabId {
    if (raw && raw in WISHLIST_TAB_BY_ID) return raw as WishlistTabId;
    return "partner-want";
}

const WishlistPage = async ({ searchParams }: WishlistPageProps) => {
    const params = await searchParams;
    const initialTab = parseTab(params[WISHLIST_TAB_PARAM]);

    // Нужно знать ownerId под initial tab чтобы prefetch'нуть правильный
    // список. user/partner readers идут через react.cache — дубль с
    // prefetchQuery(createFetchCurrentUserServerQuery) внутри Promise.all
    // дедуплицируется.
    const [user, partner] = await Promise.all([
        fetchCurrentUserServer(),
        fetchPartnerProfileServer(),
    ]);

    const tab = WISHLIST_TAB_BY_ID[initialTab];
    const ownerId =
        tab.owner === null
            ? null
            : tab.owner === "me"
              ? (user?.id ?? null)
              : (partner?.id ?? null);

    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery(createFetchCurrentUserServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerProfileServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(
                createFetchItemsServerQuery({ list: tab.list, ownerId }),
            )
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <WishlistClientPage initialTab={initialTab} />
        </HydrationBoundary>
    );
};

export default WishlistPage;
