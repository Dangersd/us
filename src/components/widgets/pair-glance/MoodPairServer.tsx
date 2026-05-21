import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import "server-only";

import MoodPairGlance from "~components/widgets/pair-glance/MoodPairGlance";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchPartnerTodayMoodServerQuery } from "~queries/mood/fetch-partner-today-mood.server";
import { createFetchTodayMoodServerQuery } from "~queries/mood/fetch-today-mood.server";

// Server-wrapper для MoodPairGlance: prefetch own + partner today mood
// параллельно, дегидрирует в HydrationBoundary. MoodPairGlance внутри —
// "use client" с useState и hover-state — оборачивающий boundary ему не
// мешает, useQuery просто получает данные из cache.

interface MoodPairServerProps {
    userFallbackColor: string;
    partnerFallbackColor: string;
    partnerMissingLabel: string;
}

const MoodPairServer = async (props: MoodPairServerProps) => {
    const today = todayDateString(COUPLE_TZ);

    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery(createFetchTodayMoodServerQuery(today))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerTodayMoodServerQuery(today))
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MoodPairGlance {...props} />
        </HydrationBoundary>
    );
};

export default MoodPairServer;
