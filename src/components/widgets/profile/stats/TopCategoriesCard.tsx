import StatCardShell from "~components/widgets/profile/stats/StatCardShell";
import { categoryLabel } from "~config/calendar";
import type { CoupleStats } from "~interfaces/stats";
import { cn } from "~libs/utils";

export interface TopCategoriesCardProps {
    categories: CoupleStats["topCategories"];
}

const TopCategoriesCard = ({ categories }: TopCategoriesCardProps) => {
    if (categories.length === 0) {
        return (
            <StatCardShell title="Жанры">
                <span className={cn("text-sm italic text-ink-muted")}>
                    Ещё не накопилось
                </span>
            </StatCardShell>
        );
    }

    return (
        <StatCardShell title="Жанры">
            <ol className={cn("flex flex-col gap-1.5")}>
                {categories.map((c) => (
                    <li
                        key={c.category}
                        className={cn("flex items-baseline gap-2")}
                    >
                        <span
                            className={cn(
                                "font-display text-xl text-ink-primary",
                            )}
                        >
                            {categoryLabel(c.category)}
                        </span>
                        <span
                            className={cn(
                                "text-xs text-ink-muted tabular-nums",
                            )}
                        >
                            ×{c.count}
                        </span>
                    </li>
                ))}
            </ol>
        </StatCardShell>
    );
};

export default TopCategoriesCard;
