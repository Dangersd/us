"use client";

import { useCallback } from "react";

import { useModalManager } from "~components/modal";
import RepairOpenModal from "~components/widgets/repair/RepairOpenModal";

/**
 * Единая точка открытия модалки «После разговора». Используется из
 * RepairWidget (empty state) при тапе на кнопку.
 *
 * open проп прокидывается из ModalProvider — двухфазное закрытие, exit-
 * анимация перед unmount (см. .claude/rules/modals.md).
 */
export function useOpenRepairModal() {
    const { openModal } = useModalManager();

    return useCallback(() => {
        openModal(({ onClose, open }) => (
            <RepairOpenModal open={open} onClose={onClose} />
        ));
    }, [openModal]);
}
