import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import MoodClientPage from "~app/(rooms)/mood/MoodClientPage";
import { COUPLE_TZ, getWeekRange, todayDateString } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchOwnMoodRangeServerQuery } from "~queries/mood/fetch-own-mood-range.server";
import { createFetchPartnerMoodRangeServerQuery } from "~queries/mood/fetch-partner-mood-range.server";
import { createFetchPartnerTodayMoodServerQuery } from "~queries/mood/fetch-partner-today-mood.server";
import { createFetchTodayMoodServerQuery } from "~queries/mood/fetch-today-mood.server";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";

const MoodPage = async () => {
    // Сервер в UTC; для SSR-prefetch'а нужна дата пары (Бишкек, UTC+6),
    // иначе в окно 00:00–06:00 local prefetch попадает в ключ вчерашнего дня
    // и клиент гарантированно перезапрашивает «сегодня».
    const date = todayDateString(COUPLE_TZ);
    const { start: weekStart, end: weekEnd } = getWeekRange(date);

    // Page-level prefetch: userKeys.current() обязателен — useUpsertMood
    // читает его из QueryClient для optimistic seed (см. use-upsert-mood.ts).
    // .catch на каждый prefetch — единичный Supabase-blip не должен крашить
    // всю /mood-страницу; React Query сам перезапросит на клиенте.
    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery(createFetchTodayMoodServerQuery(date))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerTodayMoodServerQuery(date))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(
                createFetchOwnMoodRangeServerQuery(weekStart, weekEnd),
            )
            .catch(() => undefined),
        queryClient
            .prefetchQuery(
                createFetchPartnerMoodRangeServerQuery(weekStart, weekEnd),
            )
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerProfileServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchCurrentUserServerQuery())
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MoodClientPage />
        </HydrationBoundary>
    );
};

export default MoodPage;
