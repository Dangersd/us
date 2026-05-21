"use client";

import { useCallback } from "react";

import { useModalManager } from "~components/modal";
import ImportantDatesModal from "~components/widgets/profile/ImportantDatesModal";

// Единая точка открытия модалки «Важные даты». Используется из
// ImportantDatesSection при тапе на кнопку «Редактировать».
//
// open проп прокидывается из ModalProvider — двухфазное закрытие, exit-
// анимация перед unmount (см. .claude/rules/modals.md).
export function useOpenImportantDatesModal() {
    const { openModal } = useModalManager();

    return useCallback(() => {
        openModal(({ onClose, open }) => (
            <ImportantDatesModal open={open} onClose={onClose} />
        ));
    }, [openModal]);
}
