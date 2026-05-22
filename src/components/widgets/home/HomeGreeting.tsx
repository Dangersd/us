"use client";

import { tv } from "tailwind-variants";

import AvatarLink from "~components/shell/AvatarLink";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { pluralizeDays } from "~libs/ru-pluralize";
import { daysSince } from "~libs/time-of-day";
import { cn } from "~libs/utils";
import { useCouple } from "~queries/couple/use-couple";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

const styles = tv({
    slots: {
        root: cn("relative flex flex-col items-start gap-3 py-6"),
        title: cn(
            "font-display text-3xl md:text-[32px] leading-tight font-medium",
            "text-ink-primary tracking-tight",
        ),
        hero: cn("flex flex-col items-start gap-1 mt-2"),
        heroNumber: cn(
            "font-display font-medium",
            "text-[clamp(48px,12vw,72px)] leading-none",
            "tabular-nums tracking-tight",
            "text-ink-primary",
        ),
        heroLabel: cn("text-sm text-ink-muted lowercase"),
        avatars: cn("flex items-center gap-3"),
    },
});

const HomeGreeting = () => {
    const user = useCurrentUser();
    const partner = usePartnerProfile();
    const couple = useCouple();
    const { root, title, hero, heroNumber, heroLabel, avatars } = styles();

    const myName = user.data?.displayName ?? "";
    const days = daysSince(
        couple.data?.relationshipStartDate ?? null,
        todayDateString(COUPLE_TZ),
    );
    // ru-RU локаль форматирует тысячи через NBSP («1 245») — читабельнее
    // на любом размере экрана и не ломается при line-break.
    const daysDisplay = days != null ? days.toLocaleString("ru-RU") : null;
    const daysWord = days != null ? pluralizeDays(days) : null;

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
            {daysDisplay && daysWord ? (
                <div className={hero()}>
                    <span className={heroNumber()}>{daysDisplay}</span>
                    <span className={heroLabel()}>{daysWord} вместе</span>
                </div>
            ) : null}
        </header>
    );
};

export default HomeGreeting;
