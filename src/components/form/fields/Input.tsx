import type { InputHTMLAttributes, Ref } from "react";

import { type VariantProps, tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const input = tv({
    base: cn(
        "w-full bg-bg-surface-1 text-ink-primary placeholder:text-ink-muted",
        "border border-border-warm rounded-md px-4",
        "outline-none transition-[border-color,box-shadow,opacity] duration-200",
        "focus-visible:border-border-focus focus-visible:shadow-glow",
        "disabled:opacity-50 disabled:pointer-events-none",
        "read-only:opacity-70 read-only:cursor-default",
    ),
    variants: {
        size: {
            md: cn("h-10 text-base"),
            lg: cn("h-14 text-lg"),
        },
    },
    defaultVariants: { size: "md" },
});

type Variants = VariantProps<typeof input>;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
    Variants & {
        ref?: Ref<HTMLInputElement>;
    };

const Input = ({ className, size, ref, ...rest }: InputProps) => (
    <input {...rest} ref={ref} className={cn(input({ size }), className)} />
);

export default Input;
