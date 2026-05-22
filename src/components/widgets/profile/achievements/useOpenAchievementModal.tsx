"use client";

import { useCallback } from "react";

import { useModalManager } from "~components/modal";
import AchievementDetailModal, {
    type AchievementDetailModalProps,
} from "~components/widgets/profile/achievements/AchievementDetailModal";
import type { AchievementDef } from "~config/achievements";

type Status = AchievementDetailModalProps["status"];

// Открывает detail-модалку ачивки через ModalProvider — exit-анимация,
// Escape-обработка, scroll-lock берутся из общего стека модалок (см.
// .claude/rules/modals.md).
export function useOpenAchievementModal() {
    const { openModal } = useModalManager();

    return useCallback(
        (def: AchievementDef, status: Status) => {
            openModal(({ onClose, open }) => (
                <AchievementDetailModal
                    open={open}
                    onClose={onClose}
                    def={def}
                    status={status}
                />
            ));
        },
        [openModal],
    );
}
