"use client";

import DaysCounter from "~components/widgets/profile/DaysCounter";
import ProfileBlobPair from "~components/widgets/profile/ProfileBlobPair";
import type { Couple } from "~interfaces/couple";
import type { AppUser } from "~interfaces/user";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { daysBetween } from "~libs/days-counter";
import { cn } from "~libs/utils";

// Profile-шапка: парные blob'ы + ниточка света + счётчик «N дней знакомы ·
// M дней вместе». Чистая презентация, данные приходят через props.

export interface ProfileHeaderProps {
    me: AppUser;
    partner: AppUser | null;
    couple: Couple | null;
    className?: string;
}

const ProfileHeader = ({
    me,
    partner,
    couple,
    className,
}: ProfileHeaderProps) => {
    // Все «дни» считаются от today в couple-локали (Asia/Bishkek). Сервер бежит
    // в UTC — без COUPLE_TZ счётчик прыгал бы на границе суток.
    const today = todayDateString(COUPLE_TZ);
    const acquaintedDays = daysBetween(couple?.acquaintanceDate ?? null, today);
    const togetherDays = daysBetween(
        couple?.relationshipStartDate ?? null,
        today,
    );

    return (
        <header
            className={cn("flex flex-col items-center gap-4 pt-4", className)}
        >
            <ProfileBlobPair me={me} partner={partner} />
            <DaysCounter
                acquaintedDays={acquaintedDays}
                togetherDays={togetherDays}
            />
        </header>
    );
};

export default ProfileHeader;
