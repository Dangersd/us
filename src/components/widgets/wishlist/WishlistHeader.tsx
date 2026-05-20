"use client";

import { useEffect, useRef } from "react";

import { tv } from "tailwind-variants";

import { WISHLIST_TABS, type WishlistTabId } from "~config/wishlist";
import { cn } from "~libs/utils";

export interface WishlistHeaderProps {
    activeTab: WishlistTabId;
    onTabChange: (next: WishlistTabId) => void;
}

const tabVariants = tv({
    base: cn(
        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
        "transition-[background,color,opacity] duration-200",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-glow-soft",
        "min-h-[44px]", // touch target
    ),
    variants: {
        active: {
            true: cn("bg-bg-surface-1 text-ink-primary"),
            false: cn("bg-transparent text-ink-secondary"),
        },
    },
});

const WishlistHeader = ({ activeTab, onTabChange }: WishlistHeaderProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const el = container.querySelector<HTMLButtonElement>(
            `[data-tab-id="${activeTab}"]`,
        );
        if (!el) return;
        el.scrollIntoView({
            inline: "center",
            block: "nearest",
            behavior: "smooth",
        });
    }, [activeTab]);

    return (
        <div
            ref={containerRef}
            role="tablist"
            aria-label="Списки желаний"
            className={cn(
                "-mx-4 px-4 flex items-center gap-1 overflow-x-auto",
                "scrollbar-none snap-x snap-mandatory",
            )}
        >
            {WISHLIST_TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        data-tab-id={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            tabVariants({ active: isActive }),
                            "snap-start",
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default WishlistHeader;
