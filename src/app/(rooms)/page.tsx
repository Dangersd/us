import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import HomeClientPage from "~app/(rooms)/HomeClientPage";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchCoupleServerQuery } from "~queries/couple/fetch-couple.server";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";

const HomePage = async () => {
    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery(createFetchCurrentUserServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerProfileServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchCoupleServerQuery())
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeClientPage />
        </HydrationBoundary>
    );
};

export default HomePage;
