import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import RoomShell from "~components/shell/RoomShell";
import { BreathProvider } from "~components/ui/breath-context";
import { MoodCheckinCard } from "~components/widgets/mood";
import MoodHeader from "~components/widgets/mood/MoodHeader";
import { MoodPairGlance } from "~components/widgets/pair-glance";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { fetchPartnerTodayMoodServer } from "~queries/mood/fetch-partner-today-mood.server";
import { fetchTodayMoodServer } from "~queries/mood/fetch-today-mood.server";
import { moodKeys } from "~queries/mood/keys";
import { fetchPartnerProfileServer } from "~queries/profile/fetch-partner-profile.server";
import { profileKeys } from "~queries/profile/keys";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";
import { userKeys } from "~queries/user/keys";

// Personal-hue заглушки (см. globals.css --color-hue-him/her).
// BRIGHT — светлый stop для orb BatteryRing'а per design (bg-personal-hue-*).
const HUE_HIM = "#E8A87C";
const HUE_HIM_BRIGHT = "#FFD5A8";
const HUE_HER = "#F4A5B9";
const HUE_HER_BRIGHT = "#FFC4D2";

const MoodPage = async () => {
    const user = await fetchCurrentUserServer();
    // Сервер в UTC; для SSR-prefetch'а нужна дата пары (Бишкек, UTC+6),
    // иначе в окно 00:00–06:00 local prefetch попадает в ключ вчерашнего дня
    // и клиент гарантированно перезапрашивает «сегодня».
    const date = todayDateString(COUPLE_TZ);

    // Page-level prefetch: userKeys.current() обязателен — useUpsertMood
    // читает его из QueryClient для optimistic seed (см. use-upsert-mood.ts).
    // .catch на каждый prefetch — единичный Supabase-blip не должен крашить
    // всю /mood-страницу; React Query сам перезапросит на клиенте.
    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery({
                queryKey: moodKeys.byDate(date),
                queryFn: () => fetchTodayMoodServer(date),
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: moodKeys.partnerByDate(date),
                queryFn: () => fetchPartnerTodayMoodServer(date),
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: profileKeys.partner(),
                queryFn: fetchPartnerProfileServer,
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: userKeys.current(),
                queryFn: fetchCurrentUserServer,
            })
            .catch(() => undefined),
    ]);

    // user не должен быть null — (rooms)/layout.tsx уже отбрасывает orphan-auth.
    // Защищаемся: гендер-нейтральный fallback на him если что-то пошло не так.
    const userIsHim = user?.gender !== "female";
    const userFallbackColor = userIsHim ? HUE_HIM : HUE_HER;
    const userBrightColor = userIsHim ? HUE_HIM_BRIGHT : HUE_HER_BRIGHT;
    const partnerFallbackColor = userIsHim ? HUE_HER : HUE_HIM;
    const partnerMissingLabel = userIsHim
        ? "не отметилась сегодня"
        : "не отметился сегодня";

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RoomShell roomId="mood">
                <BreathProvider>
                    <MoodHeader />
                    <MoodPairGlance
                        userFallbackColor={userFallbackColor}
                        partnerFallbackColor={partnerFallbackColor}
                        partnerMissingLabel={partnerMissingLabel}
                    />
                    <MoodCheckinCard
                        userFallbackColor={userFallbackColor}
                        userBrightColor={userBrightColor}
                        userGender={user?.gender ?? null}
                    />
                </BreathProvider>
            </RoomShell>
        </HydrationBoundary>
    );
};

export default MoodPage;
