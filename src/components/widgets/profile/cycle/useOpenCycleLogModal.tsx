"use client";

import { useCallback } from "react";

import { useModalManager } from "~components/modal";
import CycleLogModal from "~components/widgets/profile/cycle/CycleLogModal";

interface OpenLogArgs {
    date: string;
}

export function useOpenCycleLogModal() {
    const { openModal } = useModalManager();

    return useCallback(
        ({ date }: OpenLogArgs) => {
            openModal(({ onClose, open }) => (
                <CycleLogModal open={open} onClose={onClose} date={date} />
            ));
        },
        [openModal],
    );
}
