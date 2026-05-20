"use client";

import { useCallback } from "react";

import { useModalManager } from "~components/modal";
import WishlistItemModal, {
    type WishlistItemModalProps,
} from "~components/widgets/wishlist/item-modal/WishlistItemModal";

// Helper-хук: единая точка открытия модалки хотелки. Используется из FAB
// (mode='new') и из ItemCard (mode='edit').
//
// open проп прокидывается из ModalProvider — двухфазное закрытие, exit-
// анимация перед unmount.
export function useOpenWishlistItemModal() {
    const { openModal } = useModalManager();

    return useCallback(
        (props: Omit<WishlistItemModalProps, "onClose" | "open">) => {
            openModal(({ onClose, open }) => (
                <WishlistItemModal {...props} open={open} onClose={onClose} />
            ));
        },
        [openModal],
    );
}
