"use client";

import { useEffect, useState } from "react";

import { tv } from "tailwind-variants";

import AvatarLink from "~components/shell/AvatarLink";
import { pluralizeDays } from "~components/widgets/home/utils/pluralize-days";
import { COUPLE_TZ, todayDateString } from "~libs/date";
import { type TimeOfDay, daysSince, getTimeOfDay } from "~libs/time-of-day";
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

const ONE_MINUTE_MS = 60 * 1000;

const HomeGreeting = () => {
    const user = useCurrentUser();
    const partner = usePartnerProfile();
    const couple = useCouple();
    const { root, title, subtitle, avatars } = styles();

    // SSR считает через COUPLE_TZ, и client тоже — но `new Date()` снимается
    // в РАЗНЫЕ моменты. Если delta между рендерами страддлит границу 5/11/18/23
    // Бишкек-времени → hydration mismatch warning. Плюс без интервала
    // значение «замораживается» на жизнь вкладки. Решение: SSR-initial value
    // + useEffect-recompute + setInterval(60s). suppressHydrationWarning на
    // h1 покрывает редкий boundary-crossing случай.
    const [tod, setTod] = useState<TimeOfDay>(() =>
        getTimeOfDay(new Date(), COUPLE_TZ),
    );
    useEffect(() => {
        const tick = () => setTod(getTimeOfDay(new Date(), COUPLE_TZ));
        tick();
        const id = setInterval(tick, ONE_MINUTE_MS);
        return () => clearInterval(id);
    }, []);

    const greetingWord = GREETING_RU[tod];
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
            <h1 className={title()} suppressHydrationWarning>
                {greetingWord}
                {myName ? `, ${myName}` : ""}
            </h1>
            {days != null ? (
                <p className={subtitle()}>
                    {`Мы знаем друг друга ${days} ${pluralizeDays(days)}`}
                </p>
            ) : null}
        </header>
    );
};

export default HomeGreeting;
