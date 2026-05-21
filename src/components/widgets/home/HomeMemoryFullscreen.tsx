"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { tv } from "tailwind-variants";

import Modal from "~components/modal/Modal";
import type { MemoryOfTheDay } from "~interfaces/memory";
import { RU_MONTHS_NOM } from "~libs/date";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        closeBtn: cn(
            "absolute top-5 right-5 z-10 rounded-full",
            "bg-bg-surface-1/80 px-3 py-1.5 text-sm text-ink-secondary",
            "border border-border-warm",
            "transition-colors hover:text-ink-primary",
        ),
        media: cn("relative flex-1 min-h-0 w-full"),
        body: cn(
            "flex flex-col gap-2 px-6 py-6",
            "bg-bg-surface-1/80 backdrop-blur-xl border-t border-border-warm",
        ),
        date: cn("text-xs uppercase tracking-wider text-ink-muted"),
        title: cn(
            "font-display text-3xl font-medium leading-tight text-ink-primary",
        ),
        note: cn("text-sm text-ink-secondary leading-relaxed"),
    },
});

function formatDate(occurrence: string): string {
    const [y, m, d] = occurrence.split("-").map(Number);
    return `${d} ${(RU_MONTHS_NOM[m - 1] ?? "").toUpperCase()} ${y}`;
}

interface Props {
    open: boolean;
    onClose: () => void;
    memory: MemoryOfTheDay;
}

const HomeMemoryFullscreen = ({ open, onClose, memory }: Props) => {
    const { closeBtn, media, body, date, title, note } = styles();
    return (
        <Modal
            open={open}
            onClose={onClose}
            variant="fullscreen"
            ariaLabel={memory.eventTitle}
        >
            <button
                type="button"
                onClick={onClose}
                className={closeBtn()}
                aria-label="Закрыть"
            >
                Закрыть
            </button>
            <motion.div
                className={media()}
                initial={{ opacity: 0, filter: "blur(20px)", scale: 1.04 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <Image
                    src={memory.photoSignedUrl}
                    alt={memory.eventTitle}
                    fill
                    unoptimized
                    sizes="100vw"
                    className="object-contain"
                />
            </motion.div>
            <div className={body()}>
                <p className={date()}>{formatDate(memory.occurrenceDate)}</p>
                <h2 className={title()}>{memory.eventTitle}</h2>
                {memory.note ? <p className={note()}>{memory.note}</p> : null}
                {memory.caption ? (
                    <p className={note()}>{memory.caption}</p>
                ) : null}
            </div>
        </Modal>
    );
};

export default HomeMemoryFullscreen;
