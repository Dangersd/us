"use client";

import Link from "next/link";
import { tv } from "tailwind-variants";

import WishlistImagePreview from "~components/widgets/wishlist/WishlistImagePreview";
import { WISHLIST_R } from "~config/routes";
import { WISHLIST_CATEGORY_BY_ID } from "~config/wishlist";
import type { WishlistItem } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn(
            "block w-32 md:w-36 shrink-0 rounded-2xl overflow-hidden",
            "bg-bg-surface-1 border border-border-warm",
            "transition-transform md:hover:-translate-y-0.5",
        ),
        imageWrap: cn("h-24 relative"),
        body: cn("flex flex-col gap-1 px-2.5 py-2"),
        title: cn(
            "text-[13px] font-medium leading-tight text-ink-primary line-clamp-2",
        ),
        meta: cn("flex items-center gap-1.5 text-[11px] text-ink-secondary"),
        dot: cn("inline-block size-1.5 rounded-full"),
    },
});

interface Props {
    item: WishlistItem;
}

const HomeWishlistPeekCard = ({ item }: Props) => {
    const { root, imageWrap, body, title, meta, dot } = styles();
    const cat = WISHLIST_CATEGORY_BY_ID[item.category];
    return (
        <Link href={WISHLIST_R()} className={root()} aria-label={item.title}>
            <div className={imageWrap()}>
                <WishlistImagePreview
                    url={item.imageUrl}
                    title={item.title}
                    category={item.category}
                />
            </div>
            <div className={body()}>
                <p className={title()}>{item.title}</p>
                <p className={meta()}>
                    <span
                        aria-hidden
                        className={dot()}
                        style={{ backgroundColor: cat.dot }}
                    />
                    <span>{cat.label}</span>
                </p>
            </div>
        </Link>
    );
};

export default HomeWishlistPeekCard;
