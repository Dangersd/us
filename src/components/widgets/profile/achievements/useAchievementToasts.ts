"use client";

import { useEffect, useRef } from "react";

import { useSoftToast } from "~components/ui/soft-toast";
import { findAchievement } from "~config/achievements";
import { useEvaluateAchievements } from "~queries/achievements/use-evaluate-achievements";

// Запускает evaluate-mutation один раз при mount AchievementsSection.
// useRef-guard защищает от StrictMode-двойного-вызова (mutation идемпотентна
// на DB-уровне, но toast не должен файрить дважды).
//
// Для каждого новоразлокированного ключа кидаем soft-toast с title из catalog.
export function useAchievementToasts() {
    const { showToast } = useSoftToast();
    const evaluate = useEvaluateAchievements();
    const firedRef = useRef(false);

    // mutate stable ref от useMutation, не зависит от showToast — но включаем
    // его в deps для будущей корректности, useRef-guard всё равно отсечёт повтор.
    const mutateAsync = evaluate.mutateAsync;
    useEffect(() => {
        if (firedRef.current) return;
        firedRef.current = true;

        mutateAsync()
            .then((newly) => {
                for (const u of newly) {
                    const def = findAchievement(u.key);
                    if (!def) continue;
                    showToast({
                        title: def.title,
                        description: def.description,
                    });
                }
            })
            .catch(() => {
                // Silent: failure всё равно не должна давить на UX тихой
                // коллекции. Звёзды просто не подсветятся до следующего захода.
            });
    }, [mutateAsync, showToast]);
}
