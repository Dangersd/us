"use client";

import { useEffect, useRef } from "react";

import { tv } from "tailwind-variants";

import { WISHLIST_TABS, type WishlistTabId } from "~config/wishlist";
import { cn } from "~libs/utils";

export interface WishlistHeaderProps {
    activeTab: WishlistTabId;
    onTabChange: (next: WishlistTabId) => void;
}

// Segmented control track + горизонтальный скролл при overflow. Зеркалит
// паттерн CalendarHeader (`bg-bg-surface-1 p-[3px] border rounded-full`),
// но содержит больше вкладок и потому скроллируется ВНУТРИ track'a без
// bleed'а за пределы Container'а страницы.
const styles = tv({
    slots: {
        track: cn(
            "inline-flex w-full max-w-full items-stretch",
            "rounded-full bg-bg-surface-1 border border-border-subtle",
            "p-0.75 overflow-hidden",
        ),
        scroller: cn(
            "flex w-full items-stretch gap-0.5 overflow-x-auto scrollbar-none",
            "snap-x snap-mandatory",
        ),
    },
    variants: {},
});

const segBtn = tv({
    base: cn(
        "shrink-0 snap-start whitespace-nowrap",
        "rounded-full px-3 py-1.5 text-[13px] font-medium leading-none",
        "transition-[background,color] duration-200",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-glow-soft",
        "min-h-9 flex items-center justify-center",
    ),
    variants: {
        active: {
            true: cn("bg-bg-surface-3 text-ink-primary"),
            false: cn("bg-transparent text-ink-muted hover:text-ink-secondary"),
        },
    },
});

const WishlistHeader = ({ activeTab, onTabChange }: WishlistHeaderProps) => {
    const { track, scroller } = styles();
    const scrollerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const el = scroller.querySelector<HTMLButtonElement>(
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
        <div className={track()} role="tablist" aria-label="Списки желаний">
            <div ref={scrollerRef} className={scroller()}>
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
                            className={cn(segBtn({ active: isActive }))}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default WishlistHeader;
