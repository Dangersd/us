"use client";

import { tv } from "tailwind-variants";

import { WISHLIST_CATEGORIES } from "~config/wishlist";
import type { WishlistCategory } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

export interface WishlistCategoryChipsProps {
    selected: WishlistCategory[];
    onChange: (next: WishlistCategory[]) => void;
}

const chip = tv({
    base: cn(
        "shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap",
        "rounded-full border px-3 py-1.5 text-sm",
        "transition-[background,border-color,color] duration-200",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-glow-soft",
        "min-h-9",
    ),
    variants: {
        active: {
            true: cn("bg-bg-surface-1 border-border-warm text-ink-primary"),
            false: cn(
                "bg-transparent border-border-subtle text-ink-secondary",
                "hover:text-ink-primary",
            ),
        },
    },
});

const WishlistCategoryChips = ({
    selected,
    onChange,
}: WishlistCategoryChipsProps) => {
    const set = new Set(selected);

    const toggle = (id: WishlistCategory) => {
        const next = new Set(set);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onChange(Array.from(next));
    };

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 overflow-x-auto scrollbar-none",
            )}
        >
            {WISHLIST_CATEGORIES.map((cat) => {
                const active = set.has(cat.id);
                return (
                    <button
                        key={cat.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggle(cat.id)}
                        className={chip({ active })}
                    >
                        <span
                            aria-hidden
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: cat.dot }}
                        />
                        {cat.label}
                    </button>
                );
            })}
        </div>
    );
};

export default WishlistCategoryChips;
