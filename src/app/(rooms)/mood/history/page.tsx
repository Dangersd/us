import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import MoodHistoryClientPage from "~app/(rooms)/mood/history/MoodHistoryClientPage";
import { COUPLE_TZ, getMonthRange, parseDay, parseYearMonth } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchOwnMoodRangeServerQuery } from "~queries/mood/fetch-own-mood-range.server";
import { createFetchPartnerMoodRangeServerQuery } from "~queries/mood/fetch-partner-mood-range.server";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";

// Next.js 16: searchParams приходит как Promise<...>.
interface HistoryPageProps {
    searchParams: Promise<{
        m?: string | string[];
        d?: string | string[];
    }>;
}

function firstString(v: string | string[] | undefined): string | undefined {
    return Array.isArray(v) ? v[0] : v;
}

const MoodHistoryPage = async ({ searchParams }: HistoryPageProps) => {
    const { m: rawM, d: rawD } = await searchParams;
    const m = firstString(rawM);
    const d = firstString(rawD);

    const ym = parseYearMonth(m, COUPLE_TZ);
    const selectedDay = parseDay(d, ym);
    const { start, end } = getMonthRange(ym);

    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery(createFetchOwnMoodRangeServerQuery(start, end))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerMoodRangeServerQuery(start, end))
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
            <MoodHistoryClientPage ym={ym} selectedDay={selectedDay} />
        </HydrationBoundary>
    );
};

export default MoodHistoryPage;
