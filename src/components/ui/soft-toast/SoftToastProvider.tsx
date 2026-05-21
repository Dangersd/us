"use client";

import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { AnimatePresence } from "framer-motion";

import SoftToast from "~components/ui/soft-toast/SoftToast";
import {
    SoftToastContext,
    type SoftToastInput,
} from "~components/ui/soft-toast/SoftToastContext";
import { cn } from "~libs/utils";

interface ToastEntry {
    id: number;
    title: string;
    description?: string;
}

const AUTO_DISMISS_MS = 4_000;

// Provider живёт на app-root (см. src/components/providers/Providers.tsx).
// Stack-based: одновременно несколько toast'ов, каждый auto-dismiss через 4с.
// Position: fixed bottom-center, не блокирует interaction (pointer-events-none
// на контейнере, pointer-events-auto на каждой карточке).
const SoftToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastEntry[]>([]);
    // Стабильный счётчик ID — не конфликтует с React keys при concurrent rerender.
    // Не используем Date.now() — react-hooks/purity flag (impure in render).
    const nextIdRef = useRef(1);
    const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
        new Map(),
    );

    const dismiss = useCallback((id: number) => {
        setToasts((cur) => cur.filter((t) => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const showToast = useCallback(
        (input: SoftToastInput) => {
            const id = nextIdRef.current;
            nextIdRef.current += 1;
            setToasts((cur) => [
                ...cur,
                {
                    id,
                    title: input.title,
                    description: input.description,
                },
            ]);
            const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
            timersRef.current.set(id, timer);
        },
        [dismiss],
    );

    // Очистка таймеров при unmount провайдера (на всякий случай в тестах /
    // HMR — production-tree этот provider живёт всё приложение).
    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            timers.forEach((t) => clearTimeout(t));
            timers.clear();
        };
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <SoftToastContext.Provider value={value}>
            {children}
            <div
                className={cn(
                    "pointer-events-none fixed inset-x-0 bottom-6 z-50",
                    "flex flex-col items-center gap-2 px-4",
                )}
                aria-live="polite"
            >
                <AnimatePresence initial={false}>
                    {toasts.map((t) => (
                        <SoftToast
                            key={t.id}
                            title={t.title}
                            description={t.description}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </SoftToastContext.Provider>
    );
};

export default SoftToastProvider;
