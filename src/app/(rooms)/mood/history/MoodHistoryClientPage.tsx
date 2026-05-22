"use client";

import Link from "next/link";

import RoomShell from "~components/shell/RoomShell";
import {
    MoodDayDetail,
    MoodHistoryHeader,
    MoodMonthGrid,
} from "~components/widgets/mood-history";
import { MOOD_R } from "~config/routes";
import { cn } from "~libs/utils";
import { useCurrentUser } from "~queries/user/use-current-user";

const HUE_HIM = "#E8A87C";
const HUE_HER = "#F4A5B9";

interface MoodHistoryClientPageProps {
    ym: string;
    selectedDay: string | null;
}

const MoodHistoryClientPage = ({
    ym,
    selectedDay,
}: MoodHistoryClientPageProps) => {
    const { data: user } = useCurrentUser();
    const userIsHim = user?.gender !== "female";
    const userFallbackColor = userIsHim ? HUE_HIM : HUE_HER;
    const partnerFallbackColor = userIsHim ? HUE_HER : HUE_HIM;

    return (
        <RoomShell roomId="mood">
            <Link
                href={MOOD_R()}
                className={cn(
                    "text-ink-tertiary text-sm self-start px-2 py-1",
                    "transition-colors hover:text-ink-secondary",
                    "focus-visible:outline-none focus-visible:ring-1",
                    "focus-visible:ring-glow-warm/40 rounded-md",
                )}
            >
                ← к настроению
            </Link>
            <MoodHistoryHeader ym={ym} selectedDay={selectedDay} />
            <MoodMonthGrid
                ym={ym}
                selectedDay={selectedDay}
                userFallbackColor={userFallbackColor}
                partnerFallbackColor={partnerFallbackColor}
            />
            {selectedDay ? <MoodDayDetail date={selectedDay} ym={ym} /> : null}
        </RoomShell>
    );
};

export default MoodHistoryClientPage;
