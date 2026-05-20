"use client";

import { type ReactNode, useEffect } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        backdrop: cn("fixed inset-0 z-40", "bg-black/55 backdrop-blur-sm"),
        sheet: cn(
            "fixed inset-x-0 bottom-0 z-50",
            "flex max-h-[90dvh] flex-col",
            "rounded-t-3xl border-t border-border-warm",
            "bg-bg-surface-1",
            "shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.5)]",
        ),
        handle: cn(
            "mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-ink-muted/40",
        ),
        body: cn("flex-1 overflow-y-auto px-4 py-3"),
    },
});

interface SheetProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    ariaLabel?: string;
}

const Sheet = ({ open, onClose, children, ariaLabel }: SheetProps) => {
    const { backdrop, sheet, handle, body } = styles();

    // Escape для close + блок скрола body когда открыто.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        className={backdrop()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        aria-hidden
                    />
                    <motion.div
                        key="sheet"
                        role="dialog"
                        aria-modal="true"
                        aria-label={ariaLabel}
                        className={sheet()}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 32,
                            stiffness: 320,
                        }}
                    >
                        <div className={handle()} aria-hidden />
                        <div className={body()}>{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sheet;
