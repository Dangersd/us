"use client";

import { useCallback, useEffect, useState } from "react";

// Grain overlay toggle, persisted in localStorage. Server-rendered default
// is enabled=true; useEffect синхронизирует фактическое значение из storage
// и ставит/убирает класс `.grain-off` на <html>.
//
// FOUC при refresh с выключенным grain'ом решается GrainBootScript в <head>
// — он ставит класс ДО hydrate. См. components/shell/GrainBootScript.tsx.
//
// Ключ "grain" хардкодится также в GrainBootScript (нельзя импортировать
// в dangerouslySetInnerHTML). При изменении синхронизировать оба места.

export const GRAIN_STORAGE_KEY = "grain";

const readInitial = (): boolean => {
    if (typeof window === "undefined") return true;
    try {
        return localStorage.getItem(GRAIN_STORAGE_KEY) !== "0";
    } catch {
        return true;
    }
};

export const useGrainSetting = (): {
    enabled: boolean;
    setEnabled: (next: boolean) => void;
} => {
    const [enabled, setEnabledState] = useState<boolean>(readInitial);

    // Sync DOM class whenever state changes. GrainBootScript handles
    // initial paint — этот effect только для runtime-toggle из ThemeSection.
    useEffect(() => {
        document.documentElement.classList.toggle("grain-off", !enabled);
    }, [enabled]);

    const setEnabled = useCallback((next: boolean) => {
        try {
            localStorage.setItem(GRAIN_STORAGE_KEY, next ? "1" : "0");
        } catch {
            // приватный режим / iframe sandbox — игнорируем, in-memory state
            // всё равно обновится через setEnabledState ниже.
        }
        setEnabledState(next);
    }, []);

    return { enabled, setEnabled };
};
