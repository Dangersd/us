import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import "server-only";

import HomeWishlistPeek from "~components/widgets/home/HomeWishlistPeek";
import { makeQueryClient } from "~libs/react-query/query-client";
import {
    createFetchPartnerProfileServerQuery,
    fetchPartnerProfileServer,
} from "~queries/profile/fetch-partner-profile.server";
import { createFetchWishlistPeekServerQuery } from "~queries/wishlist/fetch-wishlist-peek.server";

// partnerId нужен для построения корректного peek query key. Сериальный
// await partner → peek живёт ВНУТРИ этого widget'а: остальные виджеты (Mood,
// NextPlan, Memory, Repair) стримятся независимо и не ждут partnerId.
// fetchPartnerProfileServer обёрнут React.cache → если HomeGreetingServer
// уже вызвал, повтор бесплатный.

const HomeWishlistPeekServer = async () => {
    const queryClient = makeQueryClient();

    const partner = await fetchPartnerProfileServer().catch(() => null);

    await Promise.all([
        queryClient
            .prefetchQuery(createFetchPartnerProfileServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(
                createFetchWishlistPeekServerQuery(partner?.id ?? null),
            )
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeWishlistPeek />
        </HydrationBoundary>
    );
};

export default HomeWishlistPeekServer;
