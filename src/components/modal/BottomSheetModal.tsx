"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";

import {
    AnimatePresence,
    type PanInfo,
    animate,
    motion,
    useMotionValue,
} from "framer-motion";
import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

// Bottom-sheet вариант модалки. Slide-up из низа, swipe-handle сверху,
// backdrop click / handle-tap / swipe-down закрывают. Используется для
// form-flow на мобилах (calendar event editor, important dates,
// achievement details). Desktop тоже рендерит снизу — единый pattern.
//
// Архитектура анимаций:
//
// Полностью ручное управление motion value `y` через framer-motion `animate()`.
// Это единственный надёжный способ получить одинаковую slide-down анимацию
// для ВСЕХ путей закрытия (backdrop click / handle tap / swipe-success).
//
// Раньше пробовали:
// - `animate={{ y: 0 }}` + variant-driven exit → backdrop-click без анимации
//   когда y был в покое (по-видимому framer не интерполирует variant с
//   externally-managed motion value корректно).
// - `animate={controls}` через useAnimation → тот же результат.
// - `dragConstraints={{top:0,bottom:0}}` с elastic → race auto-snap-back vs
//   exit, юзер видел «прыжок назад → пауза → закрытие».
//
// Текущий подход:
// - `style={{ y }}` + useMotionValue. Drag и manual animate пишут в один и
//   тот же motion value.
// - Entrance: useEffect стартует `animate(y, 0, ENTRANCE_TRANSITION)`.
// - Close (любым путём): triggerClose измеряет sheet height через ref,
//   запускает `animate(y, sheetHeight, EXIT_TRANSITION)` с onComplete=onClose.
//   ModalProvider после onClose ждёт ещё EXIT_ANIMATION_MS перед unmount —
//   модалка уже off-screen, видимой задержки нет.
// - Snap-back на release-not-close: `animate(y, 0, SNAP_BACK_TRANSITION)`.
// - `exit` prop в motion.div оставлен как fallback чтобы AnimatePresence
//   знал «есть exit, подожди»; targeting "100%" совпадает с тем, куда
//   manual animate уже довёл y → 320ms no-op без визуального скачка.

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
            "touch-pan-y", // браузер не перехватывает вертикальный pan
        ),
        handle: cn(
            "mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-ink-muted/40",
        ),
        body: cn("flex-1 overflow-y-auto px-4 py-3"),
    },
});

const SWIPE_OFFSET_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 600;

const ENTRANCE_TRANSITION = {
    type: "spring" as const,
    damping: 32,
    stiffness: 320,
};

const EXIT_TRANSITION = {
    duration: 0.32,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

const SNAP_BACK_TRANSITION = {
    type: "spring" as const,
    damping: 30,
    stiffness: 320,
};

const BottomSheetModal = ({
    open,
    onClose,
    children,
    ariaLabel,
    isDismissable = true,
}: BottomSheetModalProps) => {
    const { backdrop, sheet, handle, body } = styles();
    const y = useMotionValue(0);
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const closingRef = useRef(false);

    // Entrance: initial="100%" ставит sheet за нижним краем, animate'ом
    // плавно поднимаем к 0. Stop при unmount чтобы не было фантомных anim.
    useEffect(() => {
        if (!open) return;
        closingRef.current = false;
        const controls = animate(y, 0, ENTRANCE_TRANSITION);
        return () => controls.stop();
    }, [open, y]);

    const triggerClose = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        const h = sheetRef.current?.offsetHeight ?? 800;
        animate(y, h, {
            ...EXIT_TRANSITION,
            onComplete: () => onClose(),
        });
    }, [y, onClose]);

    const handleBackdrop = useCallback(() => {
        if (isDismissable) triggerClose();
    }, [isDismissable, triggerClose]);

    const handleHandleClick = useCallback(() => {
        if (isDismissable) triggerClose();
    }, [isDismissable, triggerClose]);

    const handleDragEnd = useCallback(
        (_: unknown, info: PanInfo) => {
            if (!isDismissable) return;
            const shouldClose =
                info.offset.y > SWIPE_OFFSET_THRESHOLD ||
                info.velocity.y > SWIPE_VELOCITY_THRESHOLD;
            if (shouldClose) {
                triggerClose();
                return;
            }
            // Не дотянули — мягко springим обратно к покою.
            animate(y, 0, SNAP_BACK_TRANSITION);
        },
        [isDismissable, triggerClose, y],
    );

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        className={backdrop()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.24, ease: "easeOut" },
                        }}
                        transition={{ duration: 0.24 }}
                        onClick={handleBackdrop}
                        aria-hidden
                    />
                    <motion.div
                        key="sheet"
                        ref={sheetRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={ariaLabel}
                        data-weather-surface="true"
                        className={sheet()}
                        style={{ y }}
                        initial={{ y: "100%" }}
                        exit={{ y: "100%", transition: EXIT_TRANSITION }}
                        drag={isDismissable ? "y" : false}
                        dragDirectionLock
                        dragConstraints={{ top: 0 }}
                        onDragEnd={handleDragEnd}
                    >
                        <button
                            type="button"
                            className={cn(
                                handle(),
                                "cursor-grab active:cursor-grabbing",
                            )}
                            onClick={
                                isDismissable ? handleHandleClick : undefined
                            }
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
