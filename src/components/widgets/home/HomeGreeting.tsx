"use client";

import { tv } from "tailwind-variants";

import AvatarLink from "~components/shell/AvatarLink";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { pluralizeDays, pluralizeHours } from "~libs/ru-pluralize";
import { daysSince } from "~libs/time-of-day";
import { cn } from "~libs/utils";
import { useCouple } from "~queries/couple/use-couple";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

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

    const myName = user.data?.displayName ?? "";
    const days = daysSince(
        couple.data?.relationshipStartDate ?? null,
        todayDateString(COUPLE_TZ),
    );
    const hours = days != null ? days * 24 : null;
    // ru-RU локаль форматирует тысячи через NBSP («17 208») — читабельнее
    // на любом размере экрана и не ломается при line-break.
    const hoursLabel =
        hours != null
            ? `${hours.toLocaleString("ru-RU")} ${pluralizeHours(hours)}`
            : null;

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
            <h1 className={title()}>Привет{myName ? `, ${myName}` : ""}</h1>
            {days != null ? (
                <p className={subtitle()}>
                    {`Мы знаем друг друга ${days} ${pluralizeDays(days)}`}
                    {hoursLabel ? ` (${hoursLabel})` : ""}
                </p>
            ) : null}
        </header>
    );
};

export default HomeGreeting;
