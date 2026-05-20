import Link from "next/link";
import { tv } from "tailwind-variants";

import { MOOD_HISTORY_R } from "~config/routes";
import EllipsisIcon from "~icons/EllipsisIcon";
import { cn } from "~libs/utils";

// .pen Zet5Y: 48px-tall pill, ghost ink-tertiary copy, link → /mood/history.
// Native <Link>, не Button — это навигация, не действие.
const styles = tv({
    slots: {
        link: cn(
            "flex h-12 w-full items-center justify-center gap-2",
            "rounded-2xl bg-bg-surface-1/35 border border-ink-primary/[0.07]",
            "text-ink-tertiary text-sm font-medium",
            "transition-colors duration-200",
            "hover:bg-bg-surface-1/55 hover:text-ink-secondary",
            "focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-glow-warm/40",
        ),
        icon: cn("h-[18px] w-[18px]"),
    },
});

const MoodHistoryCTA = () => {
    const { link, icon } = styles();
    return (
        <Link href={MOOD_HISTORY_R()} className={link()}>
            <EllipsisIcon className={icon()} />
            <span>полная история</span>
        </Link>
    );
};

export default MoodHistoryCTA;
