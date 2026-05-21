"use client";

import { useCallback, useState } from "react";

import { BottomSheetModal, DiscardDialog } from "~components/modal";
import RepairOpenForm from "~components/widgets/repair/RepairOpenForm";
import type { CreateRepairEpisodeInput } from "~interfaces/repair";
import { usePartnerProfile } from "~queries/profile";
import {
    ConcurrentRepairEpisodeError,
    useCreateEpisode,
} from "~queries/repair";

export interface RepairOpenModalProps {
    open: boolean;
    onClose: () => void;
    /**
     * Опциональный callback, чтобы виджет показал toast при concurrent-вставке
     * (партнёр успел нажать ту же кнопку). Сам кэш активного эпизода уже
     * обновлён в useCreateEpisode.
     */
    onConcurrentExisting?: () => void;
}

/**
 * Тонкая обёртка вокруг BottomSheetModal + RepairOpenForm. Create-flow:
 * существующего эпизода нет, поэтому Outer не делает useFetch, а просто
 * прокидывает onSubmit / onClose / partnerName во внутреннюю форму.
 *
 * Discard dialog: если форма dirty, backdrop-click сначала открывает
 * DiscardDialog, не закрывает модалку сразу (см. .claude/rules/modals.md).
 */
const RepairOpenModal = ({
    open,
    onClose,
    onConcurrentExisting,
}: RepairOpenModalProps) => {
    const { data: partner } = usePartnerProfile();
    const createEpisode = useCreateEpisode();

    const [isDirty, setIsDirty] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    const requestClose = useCallback(() => {
        if (isDirty) {
            setShowDiscard(true);
            return;
        }
        onClose();
    }, [isDirty, onClose]);

    const handleSubmit = useCallback(
        async (payload: CreateRepairEpisodeInput) => {
            try {
                await createEpisode.mutateAsync(payload);
                onClose();
            } catch (err) {
                if (err instanceof ConcurrentRepairEpisodeError) {
                    // Партнёр успел нажать ту же кнопку. Активный эпизод
                    // уже подложен в кэш (см. useCreateEpisode). Закрываем
                    // модалку и оповещаем widget через callback.
                    onConcurrentExisting?.();
                    onClose();
                    return;
                }
                throw err;
            }
        },
        [createEpisode, onClose, onConcurrentExisting],
    );

    return (
        <>
            <BottomSheetModal
                open={open}
                onClose={requestClose}
                ariaLabel="после разговора — новый сигнал"
            >
                <RepairOpenForm
                    partnerName={partner?.displayName ?? null}
                    onSubmit={handleSubmit}
                    onCancel={requestClose}
                    submitting={createEpisode.isPending}
                    onDirtyChange={setIsDirty}
                />
            </BottomSheetModal>
            <DiscardDialog
                open={showDiscard}
                onConfirm={() => {
                    setShowDiscard(false);
                    onClose();
                }}
                onCancel={() => setShowDiscard(false)}
            />
        </>
    );
};

export default RepairOpenModal;
