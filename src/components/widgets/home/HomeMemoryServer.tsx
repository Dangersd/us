import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import "server-only";

import HomeMemoryOfTheDay from "~components/widgets/home/HomeMemoryOfTheDay";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchMemoryOfDayServerQuery } from "~queries/calendar/fetch-memory-of-day.server";

const HomeMemoryServer = async () => {
    const today = todayDateString(COUPLE_TZ);

    const queryClient = makeQueryClient();
    await queryClient
        .prefetchQuery(createFetchMemoryOfDayServerQuery(today))
        .catch(() => undefined);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeMemoryOfTheDay />
        </HydrationBoundary>
    );
};

export default HomeMemoryServer;
