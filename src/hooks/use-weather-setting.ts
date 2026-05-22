"use client";

import { useCallback, useEffect, useState } from "react";

// Weather atmosphere toggle, persisted в localStorage. Зеркало useGrainSetting.
// Server-rendered default — enabled=true; useEffect синхронизирует фактическое
// значение из storage и ставит/убирает класс `.weather-off` на <html>.
//
// FOUC при refresh с выключенной погодой решается AtmosphereBootScript в <head>
// — он ставит класс ДО hydrate. См. components/shell/AtmosphereBootScript.tsx.
//
// Ключ "weather" хардкодится также в AtmosphereBootScript (нельзя импортировать
// в dangerouslySetInnerHTML). При изменении синхронизировать оба места.

export const WEATHER_STORAGE_KEY = "weather";

const readInitial = (): boolean => {
    if (typeof window === "undefined") return true;
    try {
        return localStorage.getItem(WEATHER_STORAGE_KEY) !== "0";
    } catch {
        return true;
    }
};

export const useWeatherSetting = (): {
    enabled: boolean;
    setEnabled: (next: boolean) => void;
} => {
    const [enabled, setEnabledState] = useState<boolean>(readInitial);

    useEffect(() => {
        document.documentElement.classList.toggle("weather-off", !enabled);
    }, [enabled]);

    const setEnabled = useCallback((next: boolean) => {
        try {
            localStorage.setItem(WEATHER_STORAGE_KEY, next ? "1" : "0");
        } catch {
            // приватный режим / iframe sandbox — игнорируем, in-memory state
            // всё равно обновится через setEnabledState ниже.
        }
        setEnabledState(next);
    }, []);

    return { enabled, setEnabled };
};
