"use client";

import { useEffect } from "react";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import RepairPartnerCard from "~components/widgets/repair/RepairPartnerCard";
import { useOpenRepairModal } from "~components/widgets/repair/useOpenRepairModal";
import { formatRelativeTime } from "~components/widgets/repair/utils/format-relative-time";
import { cn } from "~libs/utils";
import { usePartnerProfile } from "~queries/profile";
import {
    useAcknowledgeEpisode,
    useActiveEpisode,
    useResolveEpisode,
} from "~queries/repair";
import { useCurrentUser } from "~queries/user";

const styles = tv({
    slots: {
        emptyRoot: cn(
            "relative block overflow-hidden",
            "rounded-3xl p-5",
            "bg-bg-surface-1/85 backdrop-blur-xl",
            "border border-border-warm",
            "flex flex-col gap-2",
        ),
        emptyHead: cn("text-xs text-ink-muted uppercase tracking-wide"),
        emptyCta: cn("self-start"),
        openRoot: cn(
            "relative block overflow-hidden",
            "rounded-3xl p-5",
            "bg-bg-surface-1/85 backdrop-blur-xl",
            "border border-border-warm",
            "flex flex-col gap-3",
        ),
        openHead: cn("flex items-baseline justify-between gap-3"),
        openTitle: cn("font-display text-xl text-ink-primary"),
        openWhen: cn("text-xs text-ink-muted"),
        openNote: cn("text-sm text-ink-secondary italic"),
        openMeta: cn("text-sm text-ink-secondary"),
        actions: cn("flex flex-wrap items-center justify-end gap-2"),
    },
});

const AVAILABILITY_LABEL = {
    ready_to_talk: "готов(а) поговорить",
    need_pause: "просит паузу",
} as const;

/**
 * Префикс в document.title для активного эпизода (только когда current
 * user — партнёр, не инициатор). Виден в неактивной вкладке.
 */
function useDocTitleBadge(show: boolean) {
    useEffect(() => {
        if (typeof document === "undefined") return;
        if (!show) return;
        const prev = document.title;
        const PREFIX = "● ";
        if (!prev.startsWith(PREFIX)) {
            document.title = PREFIX + prev;
        }
        return () => {
            if (document.title.startsWith(PREFIX)) {
                document.title = document.title.slice(PREFIX.length);
            }
        };
    }, [show]);
}

const RepairWidget = () => {
    const s = styles();

    const { data: currentUser } = useCurrentUser();
    const { data: partner } = usePartnerProfile();
    const { data: episode } = useActiveEpisode();

    const acknowledge = useAcknowledgeEpisode();
    const resolve = useResolveEpisode();
    const openModal = useOpenRepairModal();

    const isInitiator =
        episode && currentUser ? episode.initiatorId === currentUser.id : false;
    const isPartnerSide = Boolean(episode && currentUser) && !isInitiator;

    useDocTitleBadge(isPartnerSide);

    // Single-user guard: без партнёра кнопка не имеет смысла.
    if (!partner) return null;

    // Empty state: нет активного эпизода.
    if (!episode) {
        return (
            <div className={s.emptyRoot()}>
                <span className={s.emptyHead()}>После разговора</span>
                <Button
                    type="button"
                    variant="soft"
                    size="md"
                    onClick={openModal}
                    className={s.emptyCta()}
                >
                    Мне не ок после разговора
                </Button>
            </div>
        );
    }

    // Open-partner: current user — получатель чужого сигнала.
    if (isPartnerSide) {
        return (
            <RepairPartnerCard
                episode={episode}
                partnerName={partner.displayName}
                onAcknowledge={() => acknowledge.mutate(episode.id)}
                onResolve={() =>
                    resolve.mutate({
                        episodeId: episode.id,
                        side: "partner",
                    })
                }
                acknowledging={acknowledge.isPending}
                resolving={resolve.isPending}
            />
        );
    }

    // Open-initiator: current user отправил сигнал, ждёт партнёра.
    const ackedAt = episode.acknowledgedAt;
    const ackLabel = ackedAt
        ? `${partner.displayName} подтвердил(а): ${formatTime(ackedAt)}`
        : `${partner.displayName} ещё не подтвердил(а)`;
    const isInitResolved = episode.initiatorResolvedAt !== null;

    return (
        <div className={s.openRoot()} aria-live="polite">
            <div className={s.openHead()}>
                <h3 className={s.openTitle()}>Эпизод открыт</h3>
                <span className={s.openWhen()}>
                    {formatRelativeTime(episode.createdAt)}
                </span>
            </div>
            {episode.note ? (
                <p className={s.openNote()}>Ты пометил(а): «{episode.note}»</p>
            ) : null}
            <p className={s.openMeta()}>
                Доступность: {AVAILABILITY_LABEL[episode.availability]}
            </p>
            <p className={s.openMeta()}>{ackLabel}</p>
            <div className={s.actions()}>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() =>
                        resolve.mutate({
                            episodeId: episode.id,
                            side: "initiator",
                        })
                    }
                    disabled={isInitResolved || resolve.isPending}
                >
                    {isInitResolved ? "Жду партнёра" : "Помирились"}
                </Button>
            </div>
        </div>
    );
};

function formatTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

export default RepairWidget;
