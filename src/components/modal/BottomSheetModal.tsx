"use client";

import { type ReactNode, useCallback } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

// Bottom-sheet вариант модалки. Slide-up из низа, swipe-handle сверху,
// backdrop click и handle-tap закрывают. Используется для form-flow на
// мобилах (calendar event editor, future wishlist edit). Desktop тоже
// рендерит снизу — единый pattern.

interface BottomSheetModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    ariaLabel?: string;
    isDismissable?: boolean;
}

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

const BottomSheetModal = ({
    open,
    onClose,
    children,
    ariaLabel,
    isDismissable = true,
}: BottomSheetModalProps) => {
    const { backdrop, sheet, handle, body } = styles();

    const handleBackdrop = useCallback(() => {
        if (isDismissable) onClose();
    }, [isDismissable, onClose]);

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
                        onClick={handleBackdrop}
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
                        <button
                            type="button"
                            className={cn(handle(), "cursor-pointer")}
                            onClick={isDismissable ? onClose : undefined}
                            aria-label="закрыть"
                        />
                        <div className={body()}>{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheetModal;
