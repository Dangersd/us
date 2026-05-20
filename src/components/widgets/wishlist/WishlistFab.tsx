"use client";

import { tv } from "tailwind-variants";

import { useOpenWishlistItemModal } from "~components/widgets/wishlist/item-modal";
import type { WishlistList } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

export interface WishlistFabProps {
    list: WishlistList;
}

const styles = tv({
    slots: {
        wrap: cn(
            "pointer-events-none fixed inset-x-0 z-30",
            "bottom-[calc(env(safe-area-inset-bottom)+76px)]",
            "flex justify-center",
        ),
        btn: cn(
            "pointer-events-auto",
            "inline-flex h-12 items-center gap-2 rounded-full",
            "bg-glow-warm px-6 text-[15px] font-medium text-bg-base",
            "shadow-[0_4px_24px_-2px_rgba(255,180,209,0.55)]",
            "transition-transform active:scale-[0.97]",
        ),
    },
});

const WishlistFab = ({ list }: WishlistFabProps) => {
    const { wrap, btn } = styles();
    const openModal = useOpenWishlistItemModal();

    return (
        <div className={wrap()}>
            <button
                type="button"
                className={btn()}
                onClick={() => openModal({ mode: "new", initialList: list })}
            >
                <span aria-hidden>＋</span>
                Добавить
            </button>
        </div>
    );
};

export default WishlistFab;
