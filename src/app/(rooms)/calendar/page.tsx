import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import RoomShell from "~components/shell/RoomShell";
import {
    CalendarAgendaView,
    CalendarEventDrawer,
    CalendarHeader,
    CalendarMonthGrid,
} from "~components/widgets/calendar";
import {
    CALENDAR_DATE_PARAM,
    CALENDAR_MONTH_PARAM,
    CALENDAR_VIEW_PARAM,
} from "~config/routes";
import { seedRecurringForCurrentCouple } from "~libs/calendar/seed-recurring";
import {
    COUPLE_TZ,
    addDays,
    currentYearMonth,
    getMonthRange,
    getWeekRange,
    parseDay,
    parseYearMonth,
    startOfIsoWeek,
    todayDateString,
} from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { getServerSupabase } from "~libs/supabase/server";
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
    const ym = parseYearMonth(params[CALENDAR_MONTH_PARAM], COUPLE_TZ);
    const view: "agenda" | "month" =
        params[CALENDAR_VIEW_PARAM] === "month" ? "month" : "agenda";
    const selectedDay = parseDay(params[CALENDAR_DATE_PARAM], ym);

    const user = await fetchCurrentUserServer();
    const partner = await fetchPartnerProfileServer();

    // TENSION-3 fallback: idempotent seed на каждый visit. Когда Profile-
    // мутации будут wire'нуты (Phase 0.9), вызов оттуда придёт раньше,
    // и здесь будут только skip'ы. Fire-and-forget — не блокируем render.
    void getServerSupabase()
        .then((sb) => seedRecurringForCurrentCouple(sb))
        .catch(() => undefined);

    const weekStart = startOfIsoWeek(today);
    const { start: weekRangeStart, end: weekRangeEnd } =
        getWeekRange(weekStart);
    const agendaRange = { start: today, end: addDays(today, 60) };
    const monthRange = view === "month" ? getMonthRange(ym) : null;

    const queryClient = makeQueryClient();
    const prefetches = [
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
    ];
    if (monthRange) {
        prefetches.push(
            queryClient
                .prefetchQuery({
                    queryKey: calendarKeys.eventsRange(
                        monthRange.start,
                        monthRange.end,
                    ),
                    queryFn: () => fetchEventsRangeServer(monthRange, today),
                })
                .catch(() => undefined),
        );
    }
    await Promise.all(prefetches);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RoomShell roomId="calendar">
                <CalendarHeader ym={ym} view={view} />
                {view === "month" ? (
                    <CalendarMonthGrid ym={ym} selectedDay={selectedDay} />
                ) : (
                    <CalendarAgendaView
                        currentUserId={user?.id ?? null}
                        partnerDisplayName={partner?.displayName ?? null}
                        partnerGender={partner?.gender ?? null}
                    />
                )}
                <CalendarEventDrawer />
            </RoomShell>
        </HydrationBoundary>
    );
};

export default CalendarPage;
