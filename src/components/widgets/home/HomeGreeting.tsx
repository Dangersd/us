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
        heroSub: cn("text-xs text-ink-muted"),
        avatars: cn("flex items-center gap-3"),
    },
});

const HomeGreeting = () => {
    const user = useCurrentUser();
    const partner = usePartnerProfile();
    const couple = useCouple();
    const { root, title, hero, heroNumber, heroLabel, heroSub, avatars } =
        styles();

    const myName = user.data?.displayName ?? "";
    const days = daysSince(
        couple.data?.relationshipStartDate ?? null,
        todayDateString(COUPLE_TZ),
    );
    const hours = days != null ? days * 24 : null;
    // ru-RU локаль форматирует тысячи через NBSP («17 208») — читабельнее
    // на любом размере экрана и не ломается при line-break.
    const hoursDisplay = hours != null ? hours.toLocaleString("ru-RU") : null;
    const hoursWord = hours != null ? pluralizeHours(hours) : null;
    const daysPhrase =
        days != null ? `${days} ${pluralizeDays(days)} вместе` : null;

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
            {hoursDisplay && hoursWord ? (
                <div className={hero()}>
                    <span className={heroNumber()}>{hoursDisplay}</span>
                    <span className={heroLabel()}>{hoursWord} вместе</span>
                    {daysPhrase ? (
                        <span className={heroSub()}>{daysPhrase}</span>
                    ) : null}
                </div>
            ) : null}
        </header>
    );
};

export default HomeGreeting;
