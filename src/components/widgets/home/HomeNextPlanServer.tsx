import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import "server-only";

import HomeNextPlan from "~components/widgets/home/HomeNextPlan";
import { HOME_NEXT_PLAN_RANGE_DAYS } from "~components/widgets/home/constants";
import { COUPLE_TZ, addDays, todayDateString } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchEventsRangeServerQuery } from "~queries/calendar/fetch-events-range.server";

const HomeNextPlanServer = async () => {
    const today = todayDateString(COUPLE_TZ);
    const range = {
        start: today,
        end: addDays(today, HOME_NEXT_PLAN_RANGE_DAYS),
    };

    const queryClient = makeQueryClient();
    await queryClient
        .prefetchQuery(createFetchEventsRangeServerQuery(range, today))
        .catch(() => undefined);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeNextPlan />
        </HydrationBoundary>
    );
};

export default HomeNextPlanServer;
