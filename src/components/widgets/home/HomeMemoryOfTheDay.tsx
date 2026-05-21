"use client";

import Image from "next/image";
import { tv } from "tailwind-variants";

import { useModalManager } from "~components/modal";
import HomeMemoryFullscreen from "~components/widgets/home/HomeMemoryFullscreen";
import { useTodayDate } from "~hooks/use-today-date";
import type { MemoryMoodTag } from "~interfaces/calendar";
import { RU_MONTHS_NOM } from "~libs/date";
import { cn } from "~libs/utils";
import { useMemoryOfDay } from "~queries/calendar/use-memory-of-day";

const MOOD_TAG_LABEL: Record<MemoryMoodTag, string> = {
    warm: "тёплое",
    funny: "смешное",
    hard: "тяжёлое",
    magical: "волшебно",
};

const styles = tv({
    slots: {
        root: cn(
            "group relative block w-full overflow-hidden rounded-3xl text-left",
            "bg-bg-surface-1/85 border border-border-warm backdrop-blur-xl",
            "transition-transform md:hover:-translate-y-0.5",
        ),
        photo: cn("relative h-50 md:h-65 w-full bg-bg-surface-2"),
        body: cn("flex flex-col gap-2 px-5 py-4"),
        date: cn("text-xs uppercase tracking-wider text-ink-muted"),
        title: cn(
            "font-display text-2xl font-medium leading-tight text-ink-primary",
        ),
        pill: cn(
            "inline-flex items-center gap-1.5 self-start",
            "rounded-full bg-bg-surface-2 px-3 py-1",
            "text-xs text-ink-secondary",
        ),
        pillDot: cn("inline-block size-1.5 rounded-full bg-glow-soft"),
    },
});

function formatDate(occurrence: string): string {
    const [y, m, d] = occurrence.split("-").map(Number);
    return `${d} ${(RU_MONTHS_NOM[m - 1] ?? "").toUpperCase()} ${y}`;
}

const HomeMemoryOfTheDay = () => {
    const today = useTodayDate();
    const memory = useMemoryOfDay(today);
    const { openModal } = useModalManager();
    const { root, photo, body, date, title, pill, pillDot } = styles();

    if (!memory.data) return null;
    const m = memory.data;

    const handleOpen = () => {
        openModal(({ onClose, open }) => (
            <HomeMemoryFullscreen open={open} onClose={onClose} memory={m} />
        ));
    };

    return (
        <button
            type="button"
            onClick={handleOpen}
            className={root()}
            aria-label={m.eventTitle}
        >
            <div className={photo()}>
                <Image
                    src={m.photoSignedUrl}
                    alt={m.eventTitle}
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 720px, 100vw"
                    className="object-cover"
                />
            </div>
            <div className={body()}>
                <p className={date()}>{formatDate(m.occurrenceDate)}</p>
                <h2 className={title()}>{m.eventTitle}</h2>
                {m.moodTag ? (
                    <span className={pill()}>
                        <span aria-hidden className={pillDot()} />
                        {MOOD_TAG_LABEL[m.moodTag]}
                    </span>
                ) : null}
            </div>
        </button>
    );
};

export default HomeMemoryOfTheDay;
