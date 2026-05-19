import type { ButtonHTMLAttributes, ReactNode } from "react";

import { type VariantProps, tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const button = tv({
    base: cn(
        "inline-flex items-center justify-center gap-2",
        "font-sans font-medium select-none",
        "transition-[transform,background-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        "active:scale-[0.97]",
        "disabled:opacity-40 disabled:pointer-events-none",
    ),
    variants: {
        variant: {
            primary: cn(
                "bg-bg-surface-2 text-ink-primary",
                "border border-border-warm",
                "shadow-warm",
                "hover:bg-bg-surface-3",
            ),
            soft: cn(
                "bg-transparent text-ink-primary",
                "border border-border-subtle",
                "hover:bg-bg-surface-1",
            ),
            ghost: cn(
                "bg-transparent border-0 text-ink-secondary",
                "hover:text-ink-primary",
            ),
            "danger-soft": cn(
                "bg-transparent text-status-error",
                "border border-[rgba(216,155,138,0.2)]",
                "hover:bg-[rgba(216,155,138,0.08)]",
            ),
        },
        size: {
            sm: cn("h-8 px-3 text-sm rounded-sm"),
            md: cn("h-10 px-4 text-base rounded-sm"),
            lg: cn("h-12 px-6 text-lg rounded-md"),
            xl: cn("h-14 px-8 text-lg rounded-md"),
            pill: cn("h-10 px-5 text-base rounded-full"),
        },
    },
    defaultVariants: { variant: "primary", size: "md" },
});

type ButtonVariants = VariantProps<typeof button>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    ButtonVariants & {
        leftIcon?: ReactNode;
        rightIcon?: ReactNode;
    };

const Button = ({
    variant,
    size,
    className,
    leftIcon,
    rightIcon,
    children,
    type = "button",
    ...rest
}: ButtonProps) => (
    <button
        {...rest}
        type={type}
        className={cn(button({ variant, size }), className)}
    >
        {leftIcon}
        {children}
        {rightIcon}
    </button>
);

export default Button;
