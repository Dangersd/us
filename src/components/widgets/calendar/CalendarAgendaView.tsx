"use client";

import { useMemo } from "react";

import { tv } from "tailwind-variants";

import CalendarFab from "~components/widgets/calendar/CalendarFab";
import CalendarIdeasDivider from "~components/widgets/calendar/CalendarIdeasDivider";
import CalendarIdeasList from "~components/widgets/calendar/CalendarIdeasList";
import CalendarMiniWeekStrip from "~components/widgets/calendar/CalendarMiniWeekStrip";
import CalendarTodayCard from "~components/widgets/calendar/CalendarTodayCard";
import CalendarUpcomingList from "~components/widgets/calendar/CalendarUpcomingList";
import { useTodayDate } from "~hooks/use-today-date";
import type { Gender } from "~interfaces/user";
import { addDays, startOfIsoWeek } from "~libs/date";
import { cn } from "~libs/utils";
import { useEventsRange, useIdeas } from "~queries/calendar";

interface CalendarAgendaViewProps {
    currentUserId: string | null;
    partnerDisplayName: string | null;
    partnerGender: Gender | null;
}

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-4"),
    },
});

const CalendarAgendaView = ({
    currentUserId,
    partnerDisplayName,
    partnerGender,
}: CalendarAgendaViewProps) => {
    const { root } = styles();
    const today = useTodayDate();
    const weekStart = useMemo(() => startOfIsoWeek(today), [today]);

    const agendaRange = useMemo(
        () => ({ start: today, end: addDays(today, 60) }),
        [today],
    );

    const { data: occurrences = [] } = useEventsRange(agendaRange, today);
    const { data: ideas = [] } = useIdeas();

    const todayEvents = useMemo(
        () =>
            occurrences.filter(
                (o) => o.occurrenceDate === today && o.state !== "cancelled",
            ),
        [occurrences, today],
    );

    return (
        <div className={root()}>
            <CalendarMiniWeekStrip weekStart={weekStart} />
            <CalendarTodayCard today={today} todayEvents={todayEvents} />
            <CalendarUpcomingList
                occurrences={occurrences}
                excludeDate={today}
                currentUserId={currentUserId}
                partnerDisplayName={partnerDisplayName}
                partnerGender={partnerGender}
            />
            <CalendarIdeasDivider />
            <CalendarIdeasList ideas={ideas} />
            <CalendarFab />
        </div>
    );
};

export default CalendarAgendaView;
