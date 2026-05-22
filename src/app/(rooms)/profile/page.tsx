import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import ProfileClientPage from "~app/(rooms)/profile/ProfileClientPage";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchAchievementsServerQuery } from "~queries/achievements/fetch-achievements.server";
import { createFetchCoupleServerQuery } from "~queries/couple/fetch-couple.server";
import { createFetchMyPhaseServerQuery } from "~queries/cycle/fetch-my-phase.server";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import { createFetchCoupleStatsServerQuery } from "~queries/stats/fetch-couple-stats.server";
import {
    createFetchCurrentUserServerQuery,
    fetchCurrentUserServer,
} from "~queries/user/fetch-current-user.server";

// Server prefetch: me + partner + couple + stats + achievements одним
// Promise.all → клиент рендерит Profile без flash. .catch(undefined) на
// каждом — частичный прогрев не валит весь page.
// Phase 0.11: conditional cycle phase prefetch для female-аккаунта
// (CyclePreviewCard рендерится только под gender='female').
const ProfilePage = async () => {
    const queryClient = makeQueryClient();
    const me = await fetchCurrentUserServer().catch(() => null);

    const prefetches = [
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
            .prefetchQuery(createFetchCoupleStatsServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchAchievementsServerQuery())
            .catch(() => undefined),
    ];
    if (me?.gender === "female") {
        prefetches.push(
            queryClient
                .prefetchQuery(createFetchMyPhaseServerQuery())
                .catch(() => undefined),
        );
    }
    await Promise.all(prefetches);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileClientPage />
        </HydrationBoundary>
    );
};

export default ProfilePage;
