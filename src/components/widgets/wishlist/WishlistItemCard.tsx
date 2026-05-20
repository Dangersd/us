"use client";

import { useCallback } from "react";

import { tv } from "tailwind-variants";

import WishlistImagePreview from "~components/widgets/wishlist/WishlistImagePreview";
import {
    WISHLIST_CATEGORY_BY_ID,
    WISHLIST_PRIORITY_PIPS,
} from "~config/wishlist";
import type { WishlistItem } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

export interface WishlistItemCardProps {
    item: WishlistItem;
    currentUserId: string | null;
    readOnly: boolean;
}

const card = tv({
    base: cn(
        "group relative block w-full text-left",
        "rounded-2xl bg-bg-surface-1 border border-white/[0.04] overflow-hidden",
        "transition-[transform,box-shadow] duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow-soft",
    ),
    variants: {
        interactive: {
            true: cn(
                "md:hover:-translate-y-0.5",
                "md:hover:shadow-[0_8px_32px_-8px_rgba(255,180,209,0.4)]",
                "cursor-pointer",
            ),
            false: cn("cursor-default"),
        },
    },
});

const priorityChip = tv({
    base: cn(
        "absolute top-2 right-2 z-10 flex flex-col items-center gap-[3px]",
        "rounded-full bg-bg-base/60 backdrop-blur-sm px-1.5 py-1.5",
    ),
});

const priorityPip = tv({
    base: cn("size-1 rounded-full"),
    variants: {
        filled: {
            true: cn("bg-glow-soft"),
            false: cn("bg-ink-muted/30"),
        },
    },
});

const linkChip = tv({
    base: cn(
        "absolute bottom-2 right-2 z-10",
        "rounded-full bg-bg-base/60 backdrop-blur-sm p-1.5",
        "text-ink-secondary",
    ),
});

const WishlistItemCard = ({
    item,
    currentUserId,
    readOnly,
}: WishlistItemCardProps) => {
    const cat = WISHLIST_CATEGORY_BY_ID[item.category];
    const filledPips = WISHLIST_PRIORITY_PIPS[item.priority];
    const isMine = currentUserId !== null && item.ownerId === currentUserId;
    // Tap behavior wired в Commit C через useOpenWishlistItemModal. Сейчас
    // — placeholder, чтобы не блокировать UI render.
    const handleTap = useCallback(() => {
        // intentionally empty; Commit C wires open-modal.
    }, []);

    const interactive = !readOnly && isMine;

    return (
        <button
            type="button"
            onClick={handleTap}
            aria-label={item.title}
            disabled={!interactive}
            className={card({ interactive })}
        >
            <div className="relative">
                <WishlistImagePreview
                    url={item.imageUrl}
                    title={item.title}
                    category={item.category}
                />
                <div className={priorityChip()} aria-hidden>
                    {[2, 1, 0].map((i) => (
                        <span
                            key={i}
                            className={priorityPip({ filled: i < filledPips })}
                        />
                    ))}
                </div>
                {item.linkUrl ? (
                    <span className={linkChip()} aria-label="Есть ссылка">
                        <span
                            aria-hidden
                            className="block text-xs leading-none"
                        >
                            ↗
                        </span>
                    </span>
                ) : null}
            </div>
            <div className="flex flex-col gap-1 px-3 pt-2.5 pb-3">
                <p
                    className={cn(
                        "text-[15px] font-medium leading-tight line-clamp-2 text-ink-primary",
                    )}
                >
                    {item.title}
                </p>
                <p
                    className={cn(
                        "text-[13px] text-ink-secondary truncate flex items-center gap-1.5",
                    )}
                >
                    <span
                        aria-hidden
                        className="inline-block size-1.5 rounded-full"
                        style={{ backgroundColor: cat.dot }}
                    />
                    <span>{cat.label}</span>
                    {item.priceEstimate ? (
                        <>
                            <span aria-hidden className="text-ink-muted">
                                ·
                            </span>
                            <span className="truncate">
                                {item.priceEstimate}
                            </span>
                        </>
                    ) : null}
                </p>
            </div>
        </button>
    );
};

export default WishlistItemCard;
