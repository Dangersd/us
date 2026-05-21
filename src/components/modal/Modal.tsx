"use client";

import { type ReactNode, useCallback } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

// Базовый Modal: backdrop + центрированная карточка. Backdrop click → onClose.
// Анимация: opacity для backdrop, scale+opacity для контента.
//
// variant="fullscreen" (Phase 0.8.3): карточка занимает весь viewport — нет
// рамки/радиуса/max-w, fade-in вместо scale. ModalProvider всё так же
// управляет backdrop click / Escape / scroll-lock — кастомный backdrop в
// потребителе запрещён правилом modals.md.
//
// Закрытие через onClose — caller обязан вызвать его и из close-кнопки, и из
// backdrop click.

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
export type ModalVariant = "centered" | "fullscreen";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: ModalSize;
    variant?: ModalVariant;
    ariaLabel?: string;
    /** Если true — backdrop click и Escape не закроют (используй для unsaved confirm). */
    isDismissable?: boolean;
}

const styles = tv({
    slots: {
        backdrop: cn("fixed inset-0 z-40", "bg-black/55 backdrop-blur-sm"),
        wrap: cn(
            "fixed inset-0 z-50",
            "flex items-center justify-center",
            "p-4",
            "pointer-events-none",
        ),
        card: cn(
            "pointer-events-auto",
            "w-full max-h-[90dvh] overflow-y-auto",
            "rounded-3xl border border-border-warm",
            "bg-bg-surface-1",
            "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]",
        ),
    },
    variants: {
        size: {
            sm: { card: "max-w-sm" },
            md: { card: "max-w-md" },
            lg: { card: "max-w-lg" },
            xl: { card: "max-w-xl" },
            "2xl": { card: "max-w-2xl" },
            "3xl": { card: "max-w-3xl" },
            full: { card: "max-w-full h-[90dvh]" },
        },
        variant: {
            centered: {},
            fullscreen: {
                wrap: "p-0",
                card: cn(
                    "max-w-none max-h-none rounded-none border-0",
                    "relative w-full h-full overflow-hidden",
                    "bg-bg-base/95 backdrop-blur-2xl",
                    "shadow-none",
                    "flex flex-col",
                ),
            },
        },
    },
    defaultVariants: { size: "md", variant: "centered" },
});

const Modal = ({
    open,
    onClose,
    children,
    size,
    variant,
    ariaLabel,
    isDismissable = true,
}: ModalProps) => {
    const { backdrop, wrap, card } = styles({ size, variant });

    const handleBackdrop = useCallback(() => {
        if (isDismissable) onClose();
    }, [isDismissable, onClose]);

    const isFullscreen = variant === "fullscreen";

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
                        transition={{ duration: 0.18 }}
                        onClick={handleBackdrop}
                        aria-hidden
                    />
                    <div className={wrap()}>
                        <motion.div
                            key="card"
                            role="dialog"
                            aria-modal="true"
                            aria-label={ariaLabel}
                            className={card()}
                            initial={
                                isFullscreen
                                    ? { opacity: 0 }
                                    : { opacity: 0, scale: 0.95 }
                            }
                            animate={
                                isFullscreen
                                    ? { opacity: 1 }
                                    : { opacity: 1, scale: 1 }
                            }
                            exit={
                                isFullscreen
                                    ? { opacity: 0 }
                                    : { opacity: 0, scale: 0.95 }
                            }
                            transition={{ duration: 0.18 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
