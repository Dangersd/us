import type { Ref, TextareaHTMLAttributes } from "react";

import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const textarea = tv({
    base: cn(
        "w-full bg-bg-surface-1 text-ink-primary placeholder:text-ink-muted",
        "border border-border-warm rounded-md px-4 py-3",
        "outline-none transition-[border-color,box-shadow,opacity] duration-200",
        "focus-visible:border-border-focus focus-visible:shadow-glow",
        "disabled:opacity-50 disabled:pointer-events-none",
        "resize-none leading-snug",
    ),
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref?: Ref<HTMLTextAreaElement>;
};

const Textarea = ({ className, ref, ...rest }: TextareaProps) => (
    <textarea {...rest} ref={ref} className={cn(textarea(), className)} />
);

export default Textarea;
