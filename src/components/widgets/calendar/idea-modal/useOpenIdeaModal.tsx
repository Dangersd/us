"use client";

import { useCallback } from "react";

import { useModalManager } from "~components/modal";
import CalendarIdeaModal, {
    type CalendarIdeaModalProps,
} from "~components/widgets/calendar/idea-modal/CalendarIdeaModal";

// Helper-хук: единая точка открытия idea-модалки. Пустые args — новая идея,
// с existing — правка существующей.
export function useOpenIdeaModal() {
    const { openModal } = useModalManager();

    return useCallback(
        (props: Omit<CalendarIdeaModalProps, "onClose" | "open"> = {}) => {
            openModal(({ onClose, open }) => (
                <CalendarIdeaModal {...props} open={open} onClose={onClose} />
            ));
        },
        [openModal],
    );
}
