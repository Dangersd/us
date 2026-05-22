import type { HTMLAttributes, ReactNode } from "react";

import { type VariantProps, tv } from "tailwind-variants";

import { cn } from "~libs/utils";

// tone: per-room окраска border + shadow. Cards в Mood-комнате фиолетовят,
// Wishlist-розовеют и т.д. Tokens живут как CSS-vars в globals.css
// (--color-tone-{room}-{border|shadow}). Tone передаётся explicit prop'ом
// на каждом callsite (не через context) — Card остаётся RSC, tree-shaking
// сохраняется. См. plan/p0-p1-dazzling-bird.md → P4.
const card = tv({
    base: cn(
        "relative w-full bg-bg-surface-1/85",
        "border",
        "backdrop-blur-[24px]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    ),
    variants: {
        variant: {
            default: cn("rounded-lg p-5"),
            hero: cn("rounded-xl p-8"),
            compact: cn("rounded-sm p-3"),
        },
        tone: {
            none: cn("border-border-warm shadow-soft"),
            home: cn(
                "border-[var(--color-tone-home-border)]",
                "shadow-[0_8px_32px_var(--color-tone-home-shadow)]",
            ),
            mood: cn(
                "border-[var(--color-tone-mood-border)]",
                "shadow-[0_8px_32px_var(--color-tone-mood-shadow)]",
            ),
            calendar: cn(
                "border-[var(--color-tone-calendar-border)]",
                "shadow-[0_8px_32px_var(--color-tone-calendar-shadow)]",
            ),
            wishlist: cn(
                "border-[var(--color-tone-wishlist-border)]",
                "shadow-[0_8px_32px_var(--color-tone-wishlist-shadow)]",
            ),
            profile: cn(
                "border-[var(--color-tone-profile-border)]",
                "shadow-[0_8px_32px_var(--color-tone-profile-shadow)]",
            ),
        },
        interactive: {
            true: cn(
                "hover:-translate-y-0.5 hover:shadow-warm",
                "hover:border-[rgba(255,201,168,0.16)]",
                "cursor-pointer",
            ),
            false: "",
        },
    },
    defaultVariants: { variant: "default", tone: "none", interactive: false },
});

type CardVariants = VariantProps<typeof card>;

export type CardProps = HTMLAttributes<HTMLDivElement> &
    CardVariants & {
        children?: ReactNode;
        /**
         * Whether this Card catches rain particles (Phase 2 weather splash).
         * Default true — все карточки ловят дождь. Set `catchRain={false}`
         * для list-item cards в densely-populated rooms (Wishlist), если
         * визуально перегружено. См. plan known concerns + TODOS.md.
         */
        catchRain?: boolean;
    };

const Card = ({
    variant,
    tone,
    interactive,
    className,
    children,
    catchRain = true,
    ...rest
}: CardProps) => (
    <div
        {...rest}
        {...(catchRain ? { "data-weather-surface": "true" } : {})}
        className={cn(card({ variant, tone, interactive }), className)}
    >
        {children}
    </div>
);

export default Card;
