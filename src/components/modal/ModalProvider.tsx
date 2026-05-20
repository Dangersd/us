"use client";

import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { lockBodyScroll, unlockBodyScroll } from "~components/modal/modalUtils";

// Стек модалок. Каждая открытая модалка получает свой id + render-функцию,
// которая принимает {onClose, open}. open=false триггерит exit-анимацию
// внутри модалки (AnimatePresence в BottomSheetModal/Modal). После exit
// timeout entry удаляется из стека.
//
// Provider управляет:
// - стеком (n модалок — n визуальных слоёв)
// - body scroll lock (через .open_modal class)
// - Escape — закрывает только верхнюю
// - двухфазным close: open=false → exit-анимация → unmount

export type ModalRenderProps = {
    onClose: () => void;
    open: boolean;
};

export type ModalRender = (props: ModalRenderProps) => ReactNode;

interface ModalEntry {
    id: string;
    render: ModalRender;
    open: boolean;
}

interface ModalContextValue {
    openModal: (render: ModalRender) => string;
    closeModal: (id?: string) => void;
    closeAll: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const useModalManager = (): ModalContextValue => {
    const ctx = useContext(ModalContext);
    if (!ctx) {
        throw new Error("useModalManager must be used inside <ModalProvider>");
    }
    return ctx;
};

interface ModalProviderProps {
    children: ReactNode;
}

// Должно быть >= duration exit-анимации (BottomSheetModal spring ~280ms,
// Modal fade ~180ms). Берём с запасом, лучше чем дёрганый unmount.
const EXIT_ANIMATION_MS = 360;

export const ModalProvider = ({ children }: ModalProviderProps) => {
    const [stack, setStack] = useState<ModalEntry[]>([]);
    const idCounter = useRef(0);
    const exitTimers = useRef<Map<string, number>>(new Map());

    const removeFromStack = useCallback((id: string) => {
        setStack((prev) => prev.filter((m) => m.id !== id));
        exitTimers.current.delete(id);
    }, []);

    const closeModal = useCallback(
        (id?: string) => {
            setStack((prev) => {
                if (prev.length === 0) return prev;
                const target = id ?? prev[prev.length - 1].id; // верхняя по умолчанию
                // Если timer уже стоит — не дублируем.
                if (exitTimers.current.has(target)) return prev;
                const timer = window.setTimeout(
                    () => removeFromStack(target),
                    EXIT_ANIMATION_MS,
                );
                exitTimers.current.set(target, timer);
                return prev.map((e) =>
                    e.id === target ? { ...e, open: false } : e,
                );
            });
        },
        [removeFromStack],
    );

    const openModal = useCallback((render: ModalRender) => {
        idCounter.current += 1;
        const id = `modal-${idCounter.current}`;
        setStack((prev) => [...prev, { id, render, open: true }]);
        return id;
    }, []);

    const closeAll = useCallback(() => {
        // Закрываем все через двухфазный путь.
        setStack((prev) => {
            for (const e of prev) {
                if (exitTimers.current.has(e.id)) continue;
                const timer = window.setTimeout(
                    () => removeFromStack(e.id),
                    EXIT_ANIMATION_MS,
                );
                exitTimers.current.set(e.id, timer);
            }
            return prev.map((e) => ({ ...e, open: false }));
        });
    }, [removeFromStack]);

    // Cleanup на unmount Provider — гарантируем что не текут таймеры.
    useEffect(() => {
        const timers = exitTimers.current;
        return () => {
            for (const t of timers.values()) window.clearTimeout(t);
            timers.clear();
        };
    }, []);

    // Lock body scroll пока хотя бы одна модалка визуально открыта.
    const hasOpenModal = stack.some((m) => m.open);
    useEffect(() => {
        if (!hasOpenModal) return;
        lockBodyScroll();
        return () => unlockBodyScroll();
    }, [hasOpenModal]);

    // Escape — закрывает только верхнюю «живую» (open=true) модалку.
    useEffect(() => {
        if (!hasOpenModal) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            e.stopPropagation();
            const top = [...stack].reverse().find((m) => m.open);
            if (top) closeModal(top.id);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [hasOpenModal, stack, closeModal]);

    const value = useMemo(
        () => ({ openModal, closeModal, closeAll }),
        [openModal, closeModal, closeAll],
    );

    return (
        <ModalContext.Provider value={value}>
            {children}
            {stack.map((entry) => (
                <ModalSlot
                    key={entry.id}
                    render={entry.render}
                    open={entry.open}
                    onClose={() => closeModal(entry.id)}
                />
            ))}
        </ModalContext.Provider>
    );
};

interface ModalSlotProps {
    render: ModalRender;
    open: boolean;
    onClose: () => void;
}

const ModalSlot = ({ render, open, onClose }: ModalSlotProps) => (
    <>{render({ onClose, open })}</>
);
