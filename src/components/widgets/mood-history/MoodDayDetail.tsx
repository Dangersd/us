"use client";

import { useMemo } from "react";

import { tv } from "tailwind-variants";

import MoodReadoutRows from "~components/widgets/pair-glance/MoodReadoutRows";
import type { MoodEntry } from "~interfaces/mood";
import { getMonthRange } from "~libs/date";
import { cn } from "~libs/utils";
import { useOwnMoodRange } from "~queries/mood/use-own-mood-range";
import { usePartnerMoodRange } from "~queries/mood/use-partner-mood-range";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";

// Day-detail карточка под grid: две строки readout'а (ты + партнёр) для
// выбранного дня. Переиспользует MoodReadoutRows (H1 extract) — partner-side
// фильтрует privacy через renderMoodField, own-side показывает raw values.

interface MoodDayDetailProps {
    /** YYYY-MM-DD выбранного дня. */
    date: string;
    /** YYYY-MM месяца (для query key). */
    ym: string;
}

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3 px-2 pt-2 pb-6 scroll-mt-20"),
        title: cn(
            "text-ink-tertiary text-xs uppercase tracking-wide font-medium",
            "px-1",
        ),
        rows: cn("flex flex-col gap-2"),
        rowLabel: cn(
            "text-ink-tertiary text-[11px] uppercase tracking-wide px-1",
        ),
        empty: cn(
            "rounded-md bg-bg-surface-1/85 border border-border-warm",
            "px-4 py-3 text-ink-tertiary text-sm italic text-center",
        ),
    },
});

const MoodDayDetail = ({ date, ym }: MoodDayDetailProps) => {
    const { root, title, rows, rowLabel, empty } = styles();

    const { start, end } = useMemo(() => getMonthRange(ym), [ym]);
    const ownRange = useOwnMoodRange(start, end);
    const partnerRange = usePartnerMoodRange(start, end);
    const currentUser = useCurrentUser();
    const partnerProfile = usePartnerProfile();

    const own = useMemo(
        () => findByDate(ownRange.data, date),
        [ownRange.data, date],
    );
    const partner = useMemo(
        () => findByDate(partnerRange.data, date),
        [partnerRange.data, date],
    );

    const myName = currentUser.data?.displayName ?? "ты";
    const partnerName = partnerProfile.data?.displayName ?? "партнёр";
    const myGender = currentUser.data?.gender ?? null;
    const partnerGender = partnerProfile.data?.gender ?? null;

    return (
        <section
            id={`detail-${date}`}
            className={root()}
            aria-label={`Детали ${date}`}
        >
            <h2 className={title()}>{formatRuFullDate(date)}</h2>

            <div className={rows()}>
                <span className={rowLabel()}>{myName}</span>
                {own ? (
                    <MoodReadoutRows
                        entry={own}
                        gender={myGender}
                        emptyCopy="ничего не отмечено"
                        ariaLabel={`Настроение: ${myName}, ${date}`}
                    />
                ) : (
                    <div className={empty()}>ничего не отмечено</div>
                )}
            </div>

            <div className={rows()}>
                <span className={rowLabel()}>{partnerName}</span>
                {partner ? (
                    <MoodReadoutRows
                        entry={partner}
                        gender={partnerGender}
                        emptyCopy="ничего не делилось"
                        ariaLabel={`Настроение: ${partnerName}, ${date}`}
                    />
                ) : (
                    <div className={empty()}>ничего не отмечено</div>
                )}
            </div>
        </section>
    );
};

function findByDate(
    entries: MoodEntry[] | undefined,
    date: string,
): MoodEntry | null {
    if (!entries) return null;
    return entries.find((e) => e.date === date) ?? null;
}

const RU_MONTH_GEN = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
] as const;

function formatRuFullDate(date: string): string {
    // YYYY-MM-DD → «12 мая 2026» (родительный падеж — естественный для даты).
    const y = date.slice(0, 4);
    const m = Number(date.slice(5, 7)) - 1;
    const d = Number(date.slice(8, 10));
    return `${d} ${RU_MONTH_GEN[m]} ${y}`;
}

export default MoodDayDetail;
