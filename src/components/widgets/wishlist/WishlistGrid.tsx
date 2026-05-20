"use client";

import WishlistItemCard from "~components/widgets/wishlist/WishlistItemCard";
import type { WishlistItem } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

export interface WishlistGridProps {
    items: WishlistItem[];
    currentUserId: string | null;
    // Когда true — карточки не открывают edit-modal по тапу (partner-views).
    // Edit/delete affordances per-card всё равно скрываются для не-owner.
    readOnly: boolean;
}

const WishlistGrid = ({
    items,
    currentUserId,
    readOnly,
}: WishlistGridProps) => {
    return (
        <ul
            className={cn(
                // 2-col на mobile (158px cell @ 360px viewport), 3-col на md+.
                "grid grid-cols-2 gap-3 md:grid-cols-3",
                // Запас под FAB — карточки последнего ряда не должны прятаться
                // под кнопку "+".
                "pb-32",
            )}
        >
            {items.map((item) => (
                <li key={item.id}>
                    <WishlistItemCard
                        item={item}
                        currentUserId={currentUserId}
                        readOnly={readOnly}
                    />
                </li>
            ))}
        </ul>
    );
};

export default WishlistGrid;
