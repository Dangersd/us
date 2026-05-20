"use client";

import { type ReactNode, createContext, useContext, useMemo } from "react";

import {
    type MotionValue,
    useMotionValue,
    useReducedMotion,
    useTime,
} from "framer-motion";

// Контекст единого RAF-«дыхания» для всех MoodBlob'ов в поддереве.
// Один useTime() в провайдере → много useTransform-подписчиков в блобах.
// Решает «3 RAF на /mood» без потери дыхательной метафоры комнаты Mood
// (docs/03-rooms/mood.md:56). Без провайдера или при reduce-motion
// useBreathTime возвращает «замороженный» MotionValue → блоб рендерится
// статичной формой.
const BreathContext = createContext<MotionValue<number> | null>(null);

interface BreathProviderProps {
    children: ReactNode;
}

const RAFBreathProvider = ({ children }: BreathProviderProps) => {
    const time = useTime();
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
