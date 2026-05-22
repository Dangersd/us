"use client";

import { tv } from "tailwind-variants";

import { BottomSheetModal } from "~components/modal";
import type { AchievementDef } from "~config/achievements";
import { formatRuFullDate } from "~libs/date";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-5 px-2 pb-6 pt-2"),
        header: cn("flex flex-col items-center gap-2 text-center"),
        title: cn("font-display text-3xl text-ink-primary"),
        statusBadge: cn(
            "rounded-full px-3 py-1 text-[11px] uppercase tracking-wider",
        ),
        statusUnlocked: cn("bg-glow-warm/15 text-glow-warm"),
        statusLocked: cn("bg-bg-surface-2 text-ink-muted"),
        statusDormant: cn("bg-bg-surface-2 text-ink-muted opacity-60"),
        section: cn("flex flex-col gap-1.5"),
        sectionLabel: cn("text-[10px] uppercase tracking-wider text-ink-muted"),
        sectionBody: cn("text-base text-ink-primary leading-snug"),
        flavor: cn(
            "font-display text-lg italic text-ink-secondary leading-relaxed",
        ),
        meta: cn("text-xs text-ink-muted"),
    },
});

type Status =
    | { kind: "unlocked"; unlockedAt: string | null }
    | { kind: "locked" }
    | { kind: "dormant" };

export interface AchievementDetailModalProps {
    open: boolean;
    onClose: () => void;
    def: AchievementDef;
    status: Status;
}

const STATUS_LABEL: Record<Status["kind"], string> = {
    unlocked: "получено",
    locked: "ещё не получено",
    dormant: "появится позже",
};

const AchievementDetailModal = ({
    open,
    onClose,
    def,
    status,
}: AchievementDetailModalProps) => {
    const {
        root,
        header,
        title,
        statusBadge,
        statusUnlocked,
        statusLocked,
        statusDormant,
        section,
        sectionLabel,
        sectionBody,
        flavor,
        meta,
    } = styles();

    const badgeColor =
        status.kind === "unlocked"
            ? statusUnlocked()
            : status.kind === "dormant"
              ? statusDormant()
              : statusLocked();

    const unlockedDate =
        status.kind === "unlocked"
            ? formatRuFullDate(status.unlockedAt?.slice(0, 10) ?? null)
            : null;

    return (
        <BottomSheetModal
            open={open}
            onClose={onClose}
            ariaLabel={`Ачивка: ${def.title}`}
        >
            <div className={root()}>
                <header className={header()}>
                    <h2 className={title()}>{def.title}</h2>
                    <span className={cn(statusBadge(), badgeColor)}>
                        {STATUS_LABEL[status.kind]}
                    </span>
                </header>

                <div className={section()}>
                    <span className={sectionLabel()}>Что это</span>
                    <p className={flavor()}>{def.description}</p>
                </div>

                <div className={section()}>
                    <span className={sectionLabel()}>Как получить</span>
                    <p className={sectionBody()}>{def.criterion}</p>
                </div>

                {unlockedDate ? (
                    <p className={meta()}>Получено {unlockedDate}</p>
                ) : null}
            </div>
        </BottomSheetModal>
    );
};

export default AchievementDetailModal;
