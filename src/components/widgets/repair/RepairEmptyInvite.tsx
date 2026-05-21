"use client";

import { tv } from "tailwind-variants";

import ChevronRightIcon from "~components/icons/ChevronRightIcon";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn(
            "group relative block w-full text-left",
            "rounded-3xl overflow-hidden",
            "px-5 py-4 pr-12",
            "bg-bg-surface-1/60 backdrop-blur-xl",
            "border border-border-subtle",
            "transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "hover:bg-bg-surface-1/85 hover:border-border-warm",
            "active:scale-[0.99]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        ),
        accent: cn(
            "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2",
            "h-12 w-0.75 rounded-r-full",
            "bg-home-accent-bar opacity-50",
            "transition-opacity duration-300",
            "group-hover:opacity-100",
        ),
        title: cn(
            "font-display text-base text-ink-primary leading-tight",
            "ml-3",
        ),
        sub: cn("mt-1 text-sm text-ink-muted ml-3"),
        chevron: cn(
            "absolute right-5 top-1/2 -translate-y-1/2",
            "text-ink-muted transition-[transform,color] duration-300",
            "group-hover:text-ink-secondary group-hover:translate-x-0.5",
        ),
    },
});

export interface RepairEmptyInviteProps {
    onClick: () => void;
}

/**
 * Empty-state приглашение: full-width, низкопрофильный CTA. Дизайн
 * сознательно тише чем активные виджеты — фича не для каждого дня.
 * Вся карточка — одна кликабельная поверхность (Rams: «as little design
 * as possible», вся плитка — affordance).
 */
const RepairEmptyInvite = ({ onClick }: RepairEmptyInviteProps) => {
    const { root, accent, title, sub, chevron } = styles();
    return (
        <button type="button" onClick={onClick} className={root()}>
            <span className={accent()} aria-hidden="true" />
            <span className={title()}>После разговора</span>
            <span className={sub()}>Если что-то задело — скажи мне.</span>
            <ChevronRightIcon className={chevron()} aria-hidden="true" />
        </button>
    );
};

export default RepairEmptyInvite;
