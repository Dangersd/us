"use client";

import { useCallback } from "react";

import { useModalManager } from "~components/modal";
import CalendarEventModal, {
    type CalendarEventModalProps,
} from "~components/widgets/calendar/event-modal/CalendarEventModal";

// Helper-хук: encapsulates openModal() для event modal. Каждый caller
// (FAB / EventCard / IdeaCard / MonthDayCell) использует его — единая точка
// открытия модалки события.
//
// open проп прокидывается из ModalProvider — двухфазное закрытие, exit-
// анимация перед unmount.
export function useOpenEventModal() {
    const { openModal } = useModalManager();

    return useCallback(
        (props: Omit<CalendarEventModalProps, "onClose" | "open">) => {
            openModal(({ onClose, open }) => (
                <CalendarEventModal {...props} open={open} onClose={onClose} />
            ));
        },
        [openModal],
    );
}
