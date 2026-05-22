import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import CalendarClientPage from "~app/(rooms)/calendar/CalendarClientPage";
import {
    CALENDAR_DATE_PARAM,
    CALENDAR_MONTH_PARAM,
    CALENDAR_VIEW_PARAM,
} from "~config/routes";
import { seedRecurringForCurrentCouple } from "~libs/calendar/seed-recurring";
import {
    COUPLE_TZ,
    addDays,
    getMonthRange,
    getWeekRange,
    parseDay,
    parseYearMonth,
    startOfIsoWeek,
    todayDateString,
} from "~libs/date";
import { makeQueryClient } from "~libs/react-query/query-client";
import { getServerSupabase } from "~libs/supabase/server";
import { createFetchEventsRangeServerQuery } from "~queries/calendar/fetch-events-range.server";
import { createFetchIdeasServerQuery } from "~queries/calendar/fetch-ideas.server";
import { createFetchCycleHistoryServerQuery } from "~queries/cycle/fetch-cycle-history.server";
import { createFetchCycleMonthServerQuery } from "~queries/cycle/fetch-cycle-month.server";
import { createFetchMyPhaseServerQuery } from "~queries/cycle/fetch-my-phase.server";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import {
    createFetchCurrentUserServerQuery,
    fetchCurrentUserServer,
} from "~queries/user/fetch-current-user.server";

interface CalendarPageProps {
    // event/idea ушли из URL — модалки управляются ModalProvider (см.
    // .claude/rules/modals.md). В URL остаются только navigation-state:
    // view (agenda/month), m (месяц), d (выбранный день в month grid).
    searchParams: Promise<{
        view?: string;
        m?: string;
        d?: string;
    }>;
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
    const params = await searchParams;
    const today = todayDateString(COUPLE_TZ);
    const ym = parseYearMonth(params[CALENDAR_MONTH_PARAM], COUPLE_TZ);
    const view: "agenda" | "month" =
        params[CALENDAR_VIEW_PARAM] === "month" ? "month" : "agenda";
    const selectedDay = parseDay(params[CALENDAR_DATE_PARAM], ym);

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
            .prefetchQuery(
                createFetchEventsRangeServerQuery(agendaRange, today),
            )
            .catch(() => undefined),
        queryClient
            .prefetchQuery(
                createFetchEventsRangeServerQuery(
                    { start: weekRangeStart, end: weekRangeEnd },
                    today,
                ),
            )
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchIdeasServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchCurrentUserServerQuery())
            .catch(() => undefined),
        queryClient
            .prefetchQuery(createFetchPartnerProfileServerQuery())
            .catch(() => undefined),
    ];
    if (monthRange) {
        prefetches.push(
            queryClient
                .prefetchQuery(
                    createFetchEventsRangeServerQuery(monthRange, today),
                )
                .catch(() => undefined),
        );
    }

    // Phase 0.11: cycle overlay в месячном grid — prefetch только для
    // female-аккаунта. Male user не должен запрашивать cycle data (RLS
    // вернёт пустоту, но избегаем лишнего round-trip).
    const me = await fetchCurrentUserServer().catch(() => null);
    if (me?.gender === "female" && monthRange) {
        prefetches.push(
            queryClient
                .prefetchQuery(createFetchCycleMonthServerQuery(ym))
                .catch(() => undefined),
            queryClient
                .prefetchQuery(createFetchCycleHistoryServerQuery(180))
                .catch(() => undefined),
            // myPhase для адаптивного avgLen в cycle overlay (см. #2 fix).
            queryClient
                .prefetchQuery(createFetchMyPhaseServerQuery())
                .catch(() => undefined),
        );
    }

    await Promise.all(prefetches);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CalendarClientPage ym={ym} view={view} selectedDay={selectedDay} />
        </HydrationBoundary>
    );
};

export default CalendarPage;
