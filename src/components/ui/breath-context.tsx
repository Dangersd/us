"use client";

import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useMemo,
} from "react";

import {
    type MotionValue,
    useMotionValue,
    useReducedMotion,
} from "framer-motion";

// Контекст единого RAF-«дыхания» для всех MoodBlob'ов в поддереве.
// Один RAF-loop в провайдере → много useTransform-подписчиков в блобах.
// Решает «3 RAF на /mood» без потери дыхательной метафоры комнаты Mood
// (docs/03-rooms/mood.md:56). Без провайдера или при reduce-motion
// useBreathTime возвращает «замороженный» MotionValue → блоб рендерится
// статичной формой.
const BreathContext = createContext<MotionValue<number> | null>(null);

interface BreathProviderProps {
    children: ReactNode;
}

// Через 10 минут после mount RAF-цикл сам себя останавливает: подписчики
// (MoodBlob, SidebarWordmark, PartnerStatus) застывают на последнем значении
// формы до перезагрузки страницы. 10min — компромисс между «живым домом» и
// батареей (поднят с 5min при выносе BreathProvider в AppShell на все rooms).
const STOP_AFTER_MS = 10 * 60 * 1000;

const RAFBreathProvider = ({ children }: BreathProviderProps) => {
    const time = useMotionValue(0);
    useEffect(() => {
        const startedAt = performance.now();
        let rafId = 0;
        const tick = (now: number) => {
            const elapsed = now - startedAt;
            time.set(elapsed);
            if (elapsed < STOP_AFTER_MS) {
                rafId = requestAnimationFrame(tick);
            }
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [time]);
    return (
        <BreathContext.Provider value={time}>{children}</BreathContext.Provider>
    );
};

const FrozenBreathProvider = ({ children }: BreathProviderProps) => {
    const frozen = useMotionValue(0);
    return (
        <BreathContext.Provider value={frozen}>
            {children}
        </BreathContext.Provider>
    );
};

export const BreathProvider = ({ children }: BreathProviderProps) => {
    const reduceMotion = useReducedMotion();
    return reduceMotion ? (
        <FrozenBreathProvider>{children}</FrozenBreathProvider>
    ) : (
        <RAFBreathProvider>{children}</RAFBreathProvider>
    );
};

// Возвращает MotionValue с миллисекундами от mount провайдера.
// Если провайдера нет — возвращается «замороженный» 0 (статичная форма).
// Если reduce-motion активен — провайдер сам подсунул замороженный.
export const useBreathTime = (): MotionValue<number> => {
    const ctx = useContext(BreathContext);
    const fallback = useMotionValue(0);
    return useMemo(() => ctx ?? fallback, [ctx, fallback]);
};
