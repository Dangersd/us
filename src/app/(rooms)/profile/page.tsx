import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import ProfileClientPage from "~app/(rooms)/profile/ProfileClientPage";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchCoupleServerQuery } from "~queries/couple/fetch-couple.server";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";

// Server prefetch для шапки Profile: me + partner + couple идут одним
// Promise.all → клиент рендерит ProfileHeader без flash.
const ProfilePage = async () => {
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
            <ProfileClientPage />
        </HydrationBoundary>
    );
};

export default ProfilePage;
