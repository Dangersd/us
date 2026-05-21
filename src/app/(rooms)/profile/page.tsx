import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import ProfileClientPage from "~app/(rooms)/profile/ProfileClientPage";
import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";

const ProfilePage = async () => {
    // Layout уже гарантирует наличие user; prefetch'им для hydration —
    // client читает через useCurrentUser() и рендерит greeting без flash.
    const queryClient = makeQueryClient();
    await queryClient
        .prefetchQuery(createFetchCurrentUserServerQuery())
        .catch(() => undefined);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileClientPage />
        </HydrationBoundary>
    );
};

export default ProfilePage;
