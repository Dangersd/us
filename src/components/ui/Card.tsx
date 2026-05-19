import type { HTMLAttributes, ReactNode } from "react";

import { type VariantProps, tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const card = tv({
    base: cn(
        "relative bg-bg-surface-1/85",
        "border border-border-warm",
        "backdrop-blur-[24px]",
        "shadow-soft",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    ),
    variants: {
        variant: {
            default: cn("rounded-lg p-5"),
            hero: cn("rounded-xl p-8"),
            compact: cn("rounded-sm p-3"),
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
    defaultVariants: { variant: "default", interactive: false },
});

type CardVariants = VariantProps<typeof card>;

export type CardProps = HTMLAttributes<HTMLDivElement> &
    CardVariants & {
        children?: ReactNode;
    };

const Card = ({
    variant,
    interactive,
    className,
    children,
    ...rest
}: CardProps) => (
    <div {...rest} className={cn(card({ variant, interactive }), className)}>
        {children}
    </div>
);

export default Card;
