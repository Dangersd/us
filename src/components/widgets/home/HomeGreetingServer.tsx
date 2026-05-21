import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import "server-only";

import HomeGreeting from "~components/widgets/home/HomeGreeting";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchCoupleServerQuery } from "~queries/couple/fetch-couple.server";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";

// Server-wrapper: prefetch'ит couple + currentUser + partnerProfile (все три
// нужны HomeGreeting), затем дегидрирует state и оборачивает client-виджет
// в HydrationBoundary. useQuery в HomeGreeting получает данные мгновенно.
//
// Все три fetch'а живут под React.cache → если соседний widget уже их вызвал
// в рамках того же request scope, второй вызов бесплатный.

const HomeGreetingServer = async () => {
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
            <HomeGreeting />
        </HydrationBoundary>
    );
};

export default HomeGreetingServer;
