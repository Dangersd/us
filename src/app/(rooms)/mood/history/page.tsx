import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import Link from "next/link";

import RoomShell from "~components/shell/RoomShell";
import { BreathProvider } from "~components/ui/breath-context";
import {
    MoodDayDetail,
    MoodHistoryHeader,
    MoodMonthGrid,
} from "~components/widgets/mood-history";
import { MOOD_R } from "~config/routes";
import { COUPLE_TZ, getMonthRange, parseDay, parseYearMonth } from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { cn } from "~libs/utils";
import { fetchOwnMoodRangeServer } from "~queries/mood/fetch-own-mood-range.server";
import { fetchPartnerMoodRangeServer } from "~queries/mood/fetch-partner-mood-range.server";
import { moodKeys } from "~queries/mood/keys";
import { fetchPartnerProfileServer } from "~queries/profile/fetch-partner-profile.server";
import { profileKeys } from "~queries/profile/keys";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";
import { userKeys } from "~queries/user/keys";

const HUE_HIM = "#E8A87C";
const HUE_HER = "#F4A5B9";

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

    const user = await fetchCurrentUserServer();
    const userIsHim = user?.gender !== "female";
    const userFallbackColor = userIsHim ? HUE_HIM : HUE_HER;
    const partnerFallbackColor = userIsHim ? HUE_HER : HUE_HIM;

    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery({
                queryKey: moodKeys.ownRange(start, end),
                queryFn: () => fetchOwnMoodRangeServer(start, end),
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: moodKeys.partnerRange(start, end),
                queryFn: () => fetchPartnerMoodRangeServer(start, end),
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

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RoomShell roomId="mood">
                <BreathProvider>
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
                    {selectedDay ? (
                        <MoodDayDetail date={selectedDay} ym={ym} />
                    ) : null}
                </BreathProvider>
            </RoomShell>
        </HydrationBoundary>
    );
};

export default MoodHistoryPage;
