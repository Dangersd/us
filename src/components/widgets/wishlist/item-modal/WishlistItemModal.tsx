"use client";

import { useCallback, useState } from "react";

import { BottomSheetModal, DiscardDialog } from "~components/modal";
import WishlistItemForm, {
    type WishlistItemSubmitPayload,
} from "~components/widgets/wishlist/item-modal/WishlistItemForm";
import type { WishlistList } from "~interfaces/wishlist";
import { useDeleteItem, useItem, useUpsertItem } from "~queries/wishlist";

// Outer/Inner паттерн (см. .claude/rules/modals.md). Outer тянет данные
// по itemId для edit-mode; Inner = WishlistItemForm. Открывается через
// openModal() из useModalManager — НЕ через useState/URL state.
export interface WishlistItemModalProps {
    mode: "new" | "edit";
    open: boolean;
    onClose: () => void;
    /** Для mode='edit' — обязателен. */
    itemId?: string;
    /** Для mode='new' — pre-fill list (текущий tab). */
    initialList?: WishlistList;
}

const WishlistItemModal = ({
    mode,
    open,
    onClose,
    itemId,
    initialList,
}: WishlistItemModalProps) => {
    const { data: existing } = useItem(
        mode === "edit" ? (itemId ?? null) : null,
    );

    const upsertItem = useUpsertItem();
    const deleteItem = useDeleteItem();

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
        async (payload: WishlistItemSubmitPayload) => {
            if (mode === "edit" && itemId) {
                await upsertItem.mutateAsync({ id: itemId, ...payload });
            } else {
                await upsertItem.mutateAsync(payload);
            }
            onClose();
        },
        [itemId, mode, onClose, upsertItem],
    );

    const handleDelete = useCallback(async () => {
        if (!itemId) return;
        await deleteItem.mutateAsync(itemId);
        onClose();
    }, [deleteItem, itemId, onClose]);

    const submitting = upsertItem.isPending || deleteItem.isPending;

    return (
        <>
            <BottomSheetModal
                open={open}
                onClose={requestClose}
                ariaLabel={
                    mode === "edit" ? "редактор хотелки" : "новая хотелка"
                }
            >
                <WishlistItemForm
                    existing={mode === "edit" ? (existing ?? null) : null}
                    initialList={initialList ?? null}
                    onSubmit={handleSubmit}
                    onCancel={requestClose}
                    onDelete={mode === "edit" ? handleDelete : undefined}
                    submitting={submitting}
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

export default WishlistItemModal;
