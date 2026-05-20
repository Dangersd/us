import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import RoomShell from "~components/shell/RoomShell";
import {
    CalendarAgendaView,
    CalendarHeader,
} from "~components/widgets/calendar";
import { CALENDAR_VIEW_PARAM } from "~config/routes";
import {
    COUPLE_TZ,
    addDays,
    currentYearMonth,
    getWeekRange,
    parseYearMonth,
    startOfIsoWeek,
    todayDateString,
} from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { fetchEventsRangeServer } from "~queries/calendar/fetch-events-range.server";
import { fetchIdeasServer } from "~queries/calendar/fetch-ideas.server";
import { calendarKeys } from "~queries/calendar/keys";
import { fetchPartnerProfileServer } from "~queries/profile/fetch-partner-profile.server";
import { profileKeys } from "~queries/profile/keys";
import { fetchCurrentUserServer } from "~queries/user/fetch-current-user.server";
import { userKeys } from "~queries/user/keys";

interface CalendarPageProps {
    searchParams: Promise<{
        view?: string;
        m?: string;
        event?: string;
        d?: string;
        idea?: string;
    }>;
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
    const params = await searchParams;
    const today = todayDateString(COUPLE_TZ);
    const ym =
        parseYearMonth(params.m, COUPLE_TZ) || currentYearMonth(COUPLE_TZ);
    const view: "agenda" | "month" =
        params[CALENDAR_VIEW_PARAM] === "month" ? "month" : "agenda";

    const user = await fetchCurrentUserServer();
    const partner = await fetchPartnerProfileServer();

    const weekStart = startOfIsoWeek(today);
    const { start: weekRangeStart, end: weekRangeEnd } =
        getWeekRange(weekStart);
    const agendaRange = { start: today, end: addDays(today, 60) };

    const queryClient = makeQueryClient();
    await Promise.all([
        queryClient
            .prefetchQuery({
                queryKey: calendarKeys.eventsRange(
                    agendaRange.start,
                    agendaRange.end,
                ),
                queryFn: () => fetchEventsRangeServer(agendaRange, today),
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: calendarKeys.eventsRange(
                    weekRangeStart,
                    weekRangeEnd,
                ),
                queryFn: () =>
                    fetchEventsRangeServer(
                        { start: weekRangeStart, end: weekRangeEnd },
                        today,
                    ),
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: calendarKeys.ideas(),
                queryFn: fetchIdeasServer,
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: userKeys.current(),
                queryFn: fetchCurrentUserServer,
            })
            .catch(() => undefined),
        queryClient
            .prefetchQuery({
                queryKey: profileKeys.partner(),
                queryFn: fetchPartnerProfileServer,
            })
            .catch(() => undefined),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RoomShell roomId="calendar">
                <CalendarHeader ym={ym} view={view} />
                <CalendarAgendaView
                    currentUserId={user?.id ?? null}
                    partnerDisplayName={partner?.displayName ?? null}
                    partnerGender={partner?.gender ?? null}
                />
            </RoomShell>
        </HydrationBoundary>
    );
};

export default CalendarPage;
