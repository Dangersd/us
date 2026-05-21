import StatCardShell from "~components/widgets/profile/stats/StatCardShell";
import { WISHLIST_CATEGORY_BY_ID } from "~config/wishlist";
import type { WishlistCategory } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

export interface TopWishlistCategoryCardProps {
    category: WishlistCategory | null;
}

const TopWishlistCategoryCard = ({
    category,
}: TopWishlistCategoryCardProps) => {
    if (!category) {
        return (
            <StatCardShell title="Желания">
                <span className={cn("text-sm italic text-ink-muted")}>
                    Wishlist ещё пустой
                </span>
            </StatCardShell>
        );
    }

    const meta = WISHLIST_CATEGORY_BY_ID[category];
    return (
        <StatCardShell title="Желания">
            <span className={cn("font-display text-3xl text-ink-primary")}>
                {meta.label}
            </span>
        </StatCardShell>
    );
};

export default TopWishlistCategoryCard;
