"use client";

import { tv } from "tailwind-variants";

import AvatarLink from "~components/shell/AvatarLink";
import { pluralizeDays } from "~components/widgets/home/utils/pluralize-days";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { daysSince, getTimeOfDay } from "~libs/time-of-day";
import { cn } from "~libs/utils";
import { useCouple } from "~queries/couple/use-couple";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

const GREETING_RU = {
    morning: "Доброе утро",
    day: "Добрый день",
    evening: "Добрый вечер",
    night: "Спокойной ночи",
} as const;

const styles = tv({
    slots: {
        root: cn("relative flex flex-col items-start gap-2 py-6"),
        title: cn(
            "font-display text-3xl md:text-[32px] leading-tight font-medium",
            "text-ink-primary tracking-tight",
        ),
        subtitle: cn("text-sm text-ink-secondary"),
        avatars: cn("flex items-center gap-3"),
    },
});

const HomeGreeting = () => {
    const user = useCurrentUser();
    const partner = usePartnerProfile();
    const couple = useCouple();
    const { root, title, subtitle, avatars } = styles();

    // SSR + client считают через COUPLE_TZ → одинаковое значение → нет
    // hydration mismatch и нет flicker. Recompute через useEffect был бы
    // no-op и только давал шанс одно-кадрового мерцания вне Бишкека.
    const greetingWord = GREETING_RU[getTimeOfDay(new Date(), COUPLE_TZ)];
    const myName = user.data?.displayName ?? "";
    const days = daysSince(
        couple.data?.relationshipStartDate ?? null,
        todayDateString(COUPLE_TZ),
    );

    return (
        <header className={root()}>
            <div className={avatars()}>
                {user.data ? (
                    <AvatarLink
                        gender={user.data.gender}
                        displayName={user.data.displayName}
                        size="md"
                    />
                ) : null}
                {partner.data ? (
                    <AvatarLink
                        gender={partner.data.gender}
                        displayName={partner.data.displayName}
                        size="md"
                    />
                ) : null}
            </div>
            <h1 className={title()}>
                {greetingWord}
                {myName ? `, ${myName}` : ""}
            </h1>
            {days != null ? (
                <p className={subtitle()}>
                    {`Вы знаете друг друга ${days} ${pluralizeDays(days)}`}
                </p>
            ) : null}
        </header>
    );
};

export default HomeGreeting;
