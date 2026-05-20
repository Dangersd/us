import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import RoomShell from "~components/shell/RoomShell";
import { WishlistRoom } from "~components/widgets/wishlist";
import { WISHLIST_TAB_PARAM } from "~config/routes";
import { WISHLIST_TAB_BY_ID, type WishlistTabId } from "~config/wishlist";
import { makeQueryClient } from "~libs/react-query/query-client";
import { fetchPartnerProfileServer } from "~queries/profile/fetch-partner-profile.server";
import { profileKeys } from "~queries/profile/keys";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";
import { userKeys } from "~queries/user/keys";
import { fetchItemsServer } from "~queries/wishlist/fetch-items.server";
import { wishlistKeys } from "~queries/wishlist/keys";

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
    const prefetches = [
        queryClient
            .prefetchQuery({
                queryKey: userKeys.current(),
                queryFn: fetchCurrentUserServer,
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: profileKeys.partner(),
                queryFn: fetchPartnerProfileServer,
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: wishlistKeys.itemsList(tab.list, ownerId),
                queryFn: () => fetchItemsServer({ list: tab.list, ownerId }),
            })
            .catch(() => undefined),
    ];
    await Promise.all(prefetches);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RoomShell roomId="wishlist">
                <WishlistRoom
                    initialTab={initialTab}
                    currentUserId={user?.id ?? null}
                    partnerUserId={partner?.id ?? null}
                />
            </RoomShell>
        </HydrationBoundary>
    );
};

export default WishlistPage;
