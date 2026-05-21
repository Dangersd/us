import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import HomeClientPage from "~app/(rooms)/HomeClientPage";
import { HOME_NEXT_PLAN_RANGE_DAYS } from "~components/widgets/home/constants";
import { COUPLE_TZ, addDays, todayDateString } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchEventsRangeServerQuery } from "~queries/calendar/fetch-events-range.server";
import { createFetchMemoryOfDayServerQuery } from "~queries/calendar/fetch-memory-of-day.server";
import { createFetchCoupleServerQuery } from "~queries/couple/fetch-couple.server";
import { createFetchPartnerTodayMoodServerQuery } from "~queries/mood/fetch-partner-today-mood.server";
import { createFetchTodayMoodServerQuery } from "~queries/mood/fetch-today-mood.server";
import {
    createFetchPartnerProfileServerQuery,
    fetchPartnerProfileServer,
} from "~queries/profile/fetch-partner-profile.server";
import { createFetchActiveEpisodeServerQuery } from "~queries/repair/fetch-active-episode.server";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";
import { createFetchWishlistPeekServerQuery } from "~queries/wishlist/fetch-wishlist-peek.server";

const HomePage = async () => {
    const today = todayDateString(COUPLE_TZ);
    const range = {
        start: today,
        end: addDays(today, HOME_NEXT_PLAN_RANGE_DAYS),
    };

    // partnerId нужен чтобы построить корректный peek-prefetch ключ.
    // fetchPartnerProfileServer обёрнут React.cache — дубль в Promise.all
    // ниже дедуплицируется.
    const partner = await fetchPartnerProfileServer().catch(() => null);

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
        queryClient
            .prefetchQuery(createFetchTodayMoodServerQuery(today))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerTodayMoodServerQuery(today))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchEventsRangeServerQuery(range, today))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchMemoryOfDayServerQuery(today))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(
                createFetchWishlistPeekServerQuery(partner?.id ?? null),
            )
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchActiveEpisodeServerQuery())
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeClientPage />
        </HydrationBoundary>
    );
};

export default HomePage;
