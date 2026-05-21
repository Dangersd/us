import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

// Лёгкие fallback-плашки для каждого виджета Home. Используются в <Suspense
// fallback={...}>, пока серверный widget-wrapper ждёт свой prefetch. Геометрия
// близка к реальным виджетам, чтобы избежать layout shift при стриминге.

const styles = tv({
    slots: {
        base: cn(
            "rounded-2xl bg-bg-surface-1/60 border border-border-warm",
            "motion-safe:animate-pulse",
        ),
        greeting: cn("h-28 md:h-32"),
        mood: cn("h-48 md:h-56"),
        nextPlan: cn("h-32 md:h-40"),
        memory: cn("h-44 md:h-52"),
        wishlistPeek: cn("h-40 md:h-48"),
        repairActive: cn("h-20 md:h-24"),
        repairEmpty: cn("h-16 md:h-20"),
    },
});

const s = styles();

export const HomeGreetingSkeleton = () => (
    <div aria-busy="true" className={cn(s.base(), s.greeting())} />
);

export const HomeMoodSkeleton = () => (
    <div aria-busy="true" className={cn(s.base(), s.mood())} />
);

export const HomeNextPlanSkeleton = () => (
    <div aria-busy="true" className={cn(s.base(), s.nextPlan())} />
);

export const HomeMemorySkeleton = () => (
    <div aria-busy="true" className={cn(s.base(), s.memory())} />
);

export const HomeWishlistPeekSkeleton = () => (
    <div aria-busy="true" className={cn(s.base(), s.wishlistPeek())} />
);

export const HomeRepairActiveSkeleton = () => (
    <div aria-busy="true" className={cn(s.base(), s.repairActive())} />
);

export const HomeRepairEmptySkeleton = () => (
    <div aria-busy="true" className={cn(s.base(), s.repairEmpty())} />
);
