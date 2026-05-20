"use client";

import { tv } from "tailwind-variants";

import type { WishlistTabId } from "~config/wishlist";
import type { WishlistList } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

export interface WishlistFabProps {
    tabId: WishlistTabId;
    // owner_id для нового item'а (null для shared, иначе uuid me).
    ownerId: string | null;
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

// Commit C подключит open-modal через useOpenWishlistItemModal. Сейчас FAB
// — placeholder (disabled). Видимость управляется родителем (tab.readOnly).
const WishlistFab = (_props: WishlistFabProps) => {
    const { wrap, btn } = styles();
    return (
        <div className={wrap()}>
            <button type="button" className={cn(btn(), "opacity-60")} disabled>
                <span aria-hidden>＋</span>
                Добавить
            </button>
        </div>
    );
};

export default WishlistFab;
