"use client";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import { formatRelativeTime } from "~components/widgets/repair/utils/format-relative-time";
import type { RepairEpisode } from "~interfaces/repair";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn(
            "relative block overflow-hidden",
            "rounded-3xl p-5",
            "bg-bg-surface-1/85 backdrop-blur-xl",
            "border border-border-warm",
            "flex flex-col gap-3",
        ),
        head: cn("flex items-baseline justify-between gap-3"),
        title: cn("font-display text-xl text-ink-primary"),
        when: cn("text-xs text-ink-muted"),
        note: cn("text-sm text-ink-secondary italic"),
        actions: cn("flex flex-wrap items-center justify-end gap-2"),
    },
});

export interface RepairPartnerCardProps {
    episode: RepairEpisode;
    /** Имя partner (= инициатор для viewer’а-партнёра). */
    partnerName: string | null;
    onAcknowledge: () => void;
    onResolve: () => void;
    acknowledging?: boolean;
    resolving?: boolean;
}

const RepairPartnerCard = ({
    episode,
    partnerName,
    onAcknowledge,
    onResolve,
    acknowledging,
    resolving,
}: RepairPartnerCardProps) => {
    const { root, head, title, when, note, actions } = styles();

    const name = partnerName ?? "Партнёр";
    const titleText =
        episode.availability === "need_pause"
            ? `${name} не в порядке — нужна пауза`
            : `${name} не в порядке`;

    const isAcked = episode.acknowledgedAt !== null;
    const isResolved = episode.partnerResolvedAt !== null;

    return (
        <div className={root()} aria-live="polite">
            <div className={head()}>
                <h3 className={title()}>{titleText}</h3>
                <span className={when()}>
                    {formatRelativeTime(episode.createdAt)}
                </span>
            </div>

            {episode.note ? <p className={note()}>«{episode.note}»</p> : null}

            <div className={actions()}>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onAcknowledge}
                    disabled={isAcked || acknowledging}
                >
                    {isAcked ? "Подтверждено" : "Я заметил(а)"}
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onResolve}
                    disabled={isResolved || resolving}
                >
                    {isResolved ? "Жду партнёра" : "Помирились"}
                </Button>
            </div>
        </div>
    );
};

export default RepairPartnerCard;
