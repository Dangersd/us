import Link from "next/link";
import { tv } from "tailwind-variants";

import { MOOD_HISTORY_R } from "~config/routes";
import ChevronLeftIcon from "~icons/ChevronLeftIcon";
import ChevronRightIcon from "~icons/ChevronRightIcon";
import { formatRuMonth } from "~libs/date";
import { cn } from "~libs/utils";

// Header /mood/history: «май 2026» (Fraunces) + chevron-навигация. ← и →
// всегда активные Link'и; будущий месяц рендерится с warm-копией в самом
// grid'е, поэтому disabling здесь не нужен (см. plan MF5).

interface MoodHistoryHeaderProps {
    /** YYYY-MM текущего просматриваемого месяца. */
    ym: string;
    /** YYYY-MM-DD выбранного дня, если есть (для preserve в URL). */
    selectedDay: string | null;
}

const styles = tv({
    slots: {
        root: cn("flex items-center justify-between gap-3 px-2 py-3"),
        nav: cn(
            "flex h-10 w-10 items-center justify-center",
            "rounded-full text-ink-secondary",
            "transition-colors duration-200",
            "hover:bg-bg-surface-1/40 hover:text-ink-primary",
            "focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-glow-warm/40",
        ),
        title: cn(
            "font-serif text-2xl font-medium text-ink-primary tracking-tight",
        ),
    },
});

function shiftMonth(ym: string, delta: number): string {
    const [y, m] = ym.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
    const ny = dt.getUTCFullYear();
    const nm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    return `${ny}-${nm}`;
}

const MoodHistoryHeader = ({ ym, selectedDay }: MoodHistoryHeaderProps) => {
    const { root, nav, title } = styles();
    const prevYm = shiftMonth(ym, -1);
    const nextYm = shiftMonth(ym, +1);

    // Сохраняем `?d=` только если выбранный день лежит в новом месяце.
    const dInPrev = selectedDay && selectedDay.slice(0, 7) === prevYm;
    const dInNext = selectedDay && selectedDay.slice(0, 7) === nextYm;

    const prevHref =
        `${MOOD_HISTORY_R()}?m=${prevYm}` +
        (dInPrev ? `&d=${selectedDay}` : "");
    const nextHref =
        `${MOOD_HISTORY_R()}?m=${nextYm}` +
        (dInNext ? `&d=${selectedDay}` : "");

    return (
        <header className={root()}>
            <Link
                href={prevHref}
                className={nav()}
                aria-label="предыдущий месяц"
            >
                <ChevronLeftIcon />
            </Link>
            <h1 className={title()}>{formatRuMonth(ym)}</h1>
            <Link
                href={nextHref}
                className={nav()}
                aria-label="следующий месяц"
            >
                <ChevronRightIcon />
            </Link>
        </header>
    );
};

export default MoodHistoryHeader;
