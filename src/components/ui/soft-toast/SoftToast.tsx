"use client";

import { motion } from "framer-motion";
import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        card: cn(
            "pointer-events-auto",
            "min-w-[220px] max-w-[360px]",
            "rounded-2xl bg-bg-surface-2 border border-border-warm",
            "shadow-glow",
            "px-4 py-3",
            "flex flex-col gap-0.5",
        ),
        title: cn("font-display text-base text-ink-primary"),
        description: cn("text-xs text-ink-secondary"),
    },
});

export interface SoftToastProps {
    title: string;
    description?: string;
}

const SoftToast = ({ title, description }: SoftToastProps) => {
    const { card, title: titleCls, description: descCls } = styles();
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{
                duration: 0.36,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={card()}
            role="status"
            aria-live="polite"
        >
            <span className={titleCls()}>{title}</span>
            {description ? (
                <span className={descCls()}>{description}</span>
            ) : null}
        </motion.div>
    );
};

export default SoftToast;
