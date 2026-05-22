import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { redirect } from "next/navigation";

import CycleClientPage from "~app/(rooms)/profile/cycle/CycleClientPage";
import { PROFILE_R } from "~config/routes";
import { COUPLE_TZ, currentYearMonth } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchCycleHistoryServerQuery } from "~queries/cycle/fetch-cycle-history.server";
import { createFetchCycleMonthServerQuery } from "~queries/cycle/fetch-cycle-month.server";
import { createFetchMyPhaseServerQuery } from "~queries/cycle/fetch-my-phase.server";
import {
    createFetchCurrentUserServerQuery,
    fetchCurrentUserServer,
} from "~queries/user/fetch-current-user.server";

// Gender-gate: только female-аккаунт может видеть /profile/cycle.
// Male user → redirect на /profile. Делается до prefetch, чтобы не тянуть
// зря cycle data для пользователя, который её не должен видеть (privacy).
const CyclePage = async () => {
    const me = await fetchCurrentUserServer();
    if (!me || me.gender !== "female") {
        redirect(PROFILE_R());
    }

    const ym = currentYearMonth(COUPLE_TZ);
    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery(createFetchCurrentUserServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchCycleMonthServerQuery(ym))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchCycleHistoryServerQuery(180))
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchMyPhaseServerQuery())
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CycleClientPage />
        </HydrationBoundary>
    );
};

export default CyclePage;
