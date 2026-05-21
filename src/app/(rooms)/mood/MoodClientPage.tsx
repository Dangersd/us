"use client";

import RoomShell from "~components/shell/RoomShell";
import { BreathProvider } from "~components/ui/breath-context";
import {
    MoodCheckinCard,
    MoodHistoryCTA,
    WeekPattern,
} from "~components/widgets/mood";
import MoodHeader from "~components/widgets/mood/MoodHeader";
import { MoodPairGlance } from "~components/widgets/pair-glance";
import { useCurrentUser } from "~queries/user/use-current-user";

// Personal-hue заглушки (см. globals.css --color-hue-him/her).
// BRIGHT — светлый stop для orb BatteryRing'а per design (bg-personal-hue-*).
const HUE_HIM = "#E8A87C";
const HUE_HIM_BRIGHT = "#FFD5A8";
const HUE_HER = "#F4A5B9";
const HUE_HER_BRIGHT = "#FFC4D2";

const MoodClientPage = () => {
    // Данные приходят из server prefetch (см. page.tsx) через HydrationBoundary;
    // useCurrentUser синхронно отдаёт hydrated value, flash'а нет.
    const { data: user } = useCurrentUser();

    const userIsHim = user?.gender !== "female";
    const userFallbackColor = userIsHim ? HUE_HIM : HUE_HER;
    const userBrightColor = userIsHim ? HUE_HIM_BRIGHT : HUE_HER_BRIGHT;
    const partnerFallbackColor = userIsHim ? HUE_HER : HUE_HIM;
    const partnerMissingLabel = userIsHim
        ? "не отметилась сегодня"
        : "не отметился сегодня";

    return (
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
                <WeekPattern
                    userFallbackColor={userFallbackColor}
                    partnerFallbackColor={partnerFallbackColor}
                />
                <MoodHistoryCTA />
            </BreathProvider>
        </RoomShell>
    );
};

export default MoodClientPage;
