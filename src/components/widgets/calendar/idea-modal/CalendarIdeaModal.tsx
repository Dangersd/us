"use client";

import { useCallback, useState } from "react";

import { DiscardDialog, Modal } from "~components/modal";
import IdeaForm, {
    type IdeaFormSubmitPayload,
} from "~components/widgets/calendar/idea-modal/IdeaForm";
import type { EventIdea } from "~interfaces/calendar";
import { useDeleteIdea, useUpsertIdea } from "~queries/calendar";

// Outer-модалка для idea (без даты). Использует Modal (центрированный sm)
// — короткая форма, BottomSheet тут оверкилл. Для edit передаётся existing.

export interface CalendarIdeaModalProps {
    open: boolean;
    onClose: () => void;
    /** Для mode='edit' — существующая идея. */
    existing?: EventIdea | null;
}

const CalendarIdeaModal = ({
    open,
    onClose,
    existing = null,
}: CalendarIdeaModalProps) => {
    const upsertIdea = useUpsertIdea();
    const deleteIdea = useDeleteIdea();

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
        async (payload: IdeaFormSubmitPayload) => {
            await upsertIdea.mutateAsync({
                id: existing?.id,
                title: payload.title,
                note: payload.note,
            });
            onClose();
        },
        [existing?.id, onClose, upsertIdea],
    );

    const handleDelete = useCallback(async () => {
        if (!existing) return;
        await deleteIdea.mutateAsync(existing.id);
        onClose();
    }, [deleteIdea, existing, onClose]);

    const submitting = upsertIdea.isPending || deleteIdea.isPending;

    return (
        <>
            <Modal
                open={open}
                onClose={requestClose}
                size="sm"
                ariaLabel={existing ? "правка идеи" : "новая идея"}
            >
                <IdeaForm
                    existing={existing}
                    onSubmit={handleSubmit}
                    onCancel={requestClose}
                    onDelete={existing ? handleDelete : undefined}
                    submitting={submitting}
                    onDirtyChange={setIsDirty}
                />
            </Modal>
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

export default CalendarIdeaModal;
