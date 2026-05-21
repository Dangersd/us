"use client";

import RoomShell from "~components/shell/RoomShell";
import {
    CalendarAgendaView,
    CalendarHeader,
    CalendarMonthGrid,
} from "~components/widgets/calendar";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

interface CalendarClientPageProps {
    ym: string;
    view: "agenda" | "month";
    selectedDay: string | null;
}

const CalendarClientPage = ({
    ym,
    view,
    selectedDay,
}: CalendarClientPageProps) => {
    const { data: user } = useCurrentUser();
    const { data: partner } = usePartnerProfile();

    return (
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
        </RoomShell>
    );
};

export default CalendarClientPage;
