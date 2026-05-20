import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import RoomShell from "~components/shell/RoomShell";
import { MoodCheckinCard } from "~components/widgets/mood";
import { MoodPairStub } from "~components/widgets/pair-glance";
import { todayDateString } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { fetchPartnerTodayMoodServer } from "~queries/mood/fetch-partner-today-mood.server";
import { fetchTodayMoodServer } from "~queries/mood/fetch-today-mood.server";
import { moodKeys } from "~queries/mood/keys";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";

// Personal-hue заглушки (см. globals.css --color-hue-him/her).
const HUE_HIM = "#E8A87C";
const HUE_HER = "#F4A5B9";

const MoodPage = async () => {
    const user = await fetchCurrentUserServer();
    const date = todayDateString();

    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: moodKeys.byDate(date),
            queryFn: () => fetchTodayMoodServer(date),
        }),
        queryClient.prefetchQuery({
            queryKey: moodKeys.partnerByDate(date),
            queryFn: () => fetchPartnerTodayMoodServer(date),
        }),
    ]);

    // user не должен быть null — (rooms)/layout.tsx уже отбрасывает orphan-auth.
    // Защищаемся: гендер-нейтральный fallback на him если что-то пошло не так.
    const userIsHim = user?.gender !== "female";
    const userFallbackColor = userIsHim ? HUE_HIM : HUE_HER;
    const partnerFallbackColor = userIsHim ? HUE_HER : HUE_HIM;
    const partnerLabel = userIsHim ? "она" : "он";
    const partnerMissingLabel = userIsHim
        ? "не отметилась сегодня"
        : "не отметился сегодня";

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RoomShell roomId="mood">
                <MoodPairStub
                    userFallbackColor={userFallbackColor}
                    partnerFallbackColor={partnerFallbackColor}
                    partnerLabel={partnerLabel}
                    partnerMissingLabel={partnerMissingLabel}
                    date={date}
                />
                <MoodCheckinCard
                    userFallbackColor={userFallbackColor}
                    date={date}
                />
            </RoomShell>
        </HydrationBoundary>
    );
};

export default MoodPage;
